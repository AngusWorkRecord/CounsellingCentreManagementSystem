BEGIN;
-- Apply after 009 and 010. Existing records are never renumbered.
LOCK TABLE public.appointments, public.counselling_sessions IN SHARE ROW EXCLUSIVE MODE;
-- Historical base DDL is not included in this checkout. Refuse an undersized
-- live identifier column rather than deploying a trigger that later truncates.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.counselling_sessions'::regclass
    AND attname IN ('submission_id', 'case_number')
    AND atttypid IN ('varchar'::regtype, 'bpchar'::regtype) AND atttypmod > 0 AND atttypmod - 4 < 41) THEN
    RAISE EXCEPTION 'CASE_NUMBER_COLUMN_TOO_SHORT: identifier columns must support at least 41 characters';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.case_number_counters (
  number_year integer NOT NULL CHECK (number_year BETWEEN 1 AND 9999),
  prefix text NOT NULL CHECK (prefix IN ('F', 'T', 'Z')),
  last_value bigint NOT NULL CHECK (last_value > 0),
  PRIMARY KEY (number_year, prefix)
);
ALTER TABLE public.counselling_sessions
  ADD COLUMN IF NOT EXISTS number_prefix text,
  ADD COLUMN IF NOT EXISTS number_year integer,
  ADD COLUMN IF NOT EXISTS number_sequence bigint;
ALTER TABLE public.counselling_sessions DROP CONSTRAINT IF EXISTS counselling_sessions_number_metadata;
ALTER TABLE public.counselling_sessions ADD CONSTRAINT counselling_sessions_number_metadata CHECK (
  (number_prefix IS NULL AND number_year IS NULL AND number_sequence IS NULL) OR
  (number_prefix IS NOT NULL AND number_prefix IN ('F', 'T', 'Z') AND
   number_year IS NOT NULL AND number_year BETWEEN 1 AND 9999 AND
   number_sequence IS NOT NULL AND number_sequence > 0 AND
   case_number IS NOT NULL AND submission_id = case_number)
);
CREATE UNIQUE INDEX IF NOT EXISTS counselling_sessions_number_slot
  ON public.counselling_sessions(number_year, number_prefix, number_sequence)
  WHERE number_sequence IS NOT NULL;

-- Reserve existing numbers in either field, including soft-deleted records.
-- Fail rather than silently overflow when legacy data exceeds bigint capacity.
INSERT INTO public.case_number_counters(number_year, prefix, last_value)
SELECT parts[3]::integer, parts[1], max(parts[2]::numeric)::bigint
FROM (
  SELECT regexp_match(value, '^([FTZ])([0-9]{3,})/([0-9]{4})/[A-Z]{1,10}/[0-9]{4}$') AS parts
  FROM public.counselling_sessions CROSS JOIN LATERAL
    (VALUES (submission_id::text), (case_number::text)) numbers(value)
) parsed
WHERE parts IS NOT NULL AND parts[3]::integer BETWEEN 1 AND 9999 AND parts[2]::numeric > 0
GROUP BY parts[3]::integer, parts[1]
ON CONFLICT (number_year, prefix) DO UPDATE
SET last_value = greatest(case_number_counters.last_value, EXCLUDED.last_value);

CREATE OR REPLACE FUNCTION public.case_number_phone_tail(p_phone text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE digits text;
BEGIN
  IF p_phone IS NULL OR length(p_phone) > 50 OR btrim(p_phone) !~ '^[0-9+() -]+$' THEN
    RAISE EXCEPTION 'CASE_NUMBER_PHONE_INVALID' USING ERRCODE = '22023';
  END IF;
  digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  IF length(digits) < 4 THEN
    RAISE EXCEPTION 'CASE_NUMBER_PHONE_INVALID' USING ERRCODE = '22023';
  END IF;
  RETURN right(digits, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_case_number() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_prefix text;
  issue_year integer;
  next_value bigint;
  assigned text;
  initials text;
  tail text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF ROW(NEW.number_prefix, NEW.number_year, NEW.number_sequence) IS DISTINCT FROM
       ROW(OLD.number_prefix, OLD.number_year, OLD.number_sequence) OR
       (OLD.number_sequence IS NOT NULL AND
        ROW(NEW.submission_id, NEW.case_number) IS DISTINCT FROM ROW(OLD.submission_id, OLD.case_number)) THEN
      RAISE EXCEPTION 'CASE_NUMBER_IMMUTABLE' USING ERRCODE = '22023';
    END IF;
    RETURN NEW;
  END IF;
  v_prefix := CASE NEW.session_mode WHEN '面谈' THEN 'F' WHEN '电话辅导' THEN 'T' WHEN '线上辅导' THEN 'Z' END;
  IF v_prefix IS NULL THEN RAISE EXCEPTION 'CASE_NUMBER_MODE_INVALID' USING ERRCODE = '22023'; END IF;
  initials := btrim(NEW.client_initials);
  IF initials IS NULL OR initials !~ '^[A-Za-z]{1,10}$' THEN
    RAISE EXCEPTION 'CASE_NUMBER_INITIALS_INVALID' USING ERRCODE = '22023';
  END IF;
  tail := public.case_number_phone_tail(NEW.client_phone);
  issue_year := extract(year FROM clock_timestamp() AT TIME ZONE 'Asia/Kuala_Lumpur')::integer;
  LOOP
    INSERT INTO public.case_number_counters AS counters(number_year, prefix, last_value)
      VALUES (issue_year, v_prefix, 1)
      ON CONFLICT (number_year, prefix) DO UPDATE SET last_value = counters.last_value + 1
      RETURNING last_value INTO next_value;
    assigned := v_prefix || lpad(next_value::text, greatest(3, length(next_value::text)), '0') ||
      '/' || issue_year::text || '/' || upper(initials COLLATE "C") || '/' || tail;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.counselling_sessions
      WHERE submission_id = assigned OR case_number = assigned);
  END LOOP;
  NEW.number_prefix := v_prefix;
  NEW.number_year := issue_year;
  NEW.number_sequence := next_value;
  NEW.submission_id := assigned;
  NEW.case_number := assigned;
  RETURN NEW;
END;
$$;
-- Alphabetical trigger order ensures numbering runs before intake-state checks.
DROP TRIGGER IF EXISTS counselling_sessions_auto_number ON public.counselling_sessions;
CREATE TRIGGER counselling_sessions_auto_number BEFORE INSERT OR UPDATE ON public.counselling_sessions
  FOR EACH ROW EXECUTE FUNCTION public.assign_case_number();

CREATE OR REPLACE FUNCTION public.validate_appointment_number_inputs() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF btrim(NEW.client_initials) !~ '^[A-Za-z]{1,10}$' THEN
      RAISE EXCEPTION 'CASE_NUMBER_INITIALS_INVALID' USING ERRCODE = '22023';
    END IF;
    PERFORM public.case_number_phone_tail(NEW.phone);
  ELSIF NEW.client_initials IS DISTINCT FROM OLD.client_initials OR NEW.phone IS DISTINCT FROM OLD.phone THEN
    IF btrim(NEW.client_initials) !~ '^[A-Za-z]{1,10}$' THEN
      RAISE EXCEPTION 'CASE_NUMBER_INITIALS_INVALID' USING ERRCODE = '22023';
    END IF;
    PERFORM public.case_number_phone_tail(NEW.phone);
  END IF;
  -- Completion validation also happens in assign_case_number, atomically with
  -- the appointment update. Existing generated records never get renumbered.
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS appointments_number_inputs ON public.appointments;
CREATE TRIGGER appointments_number_inputs BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_number_inputs();

-- Keep the public SQL signature for existing callers. Client-supplied IDs are
-- intentionally ignored; the insert trigger owns both identifier fields.
CREATE OR REPLACE FUNCTION public.create_counselling_session(
  p_submission_id text, p_respondent_id text, p_counselling_date date, p_counsellor text,
  p_session_mode text, p_case_category text, p_session_start time, p_session_end time,
  p_client_initials text, p_client_phone text, p_client_summary text, p_volunteer_actions text,
  p_case_number text, p_report_url text, p_amount_received_rm numeric
) RETURNS public.counselling_sessions LANGUAGE plpgsql AS $$
DECLARE created public.counselling_sessions;
BEGIN
  IF p_counselling_date IS NULL OR NULLIF(btrim(p_client_initials), '') IS NULL THEN
    RAISE EXCEPTION 'Missing required case fields' USING ERRCODE = '22023';
  END IF;
  IF p_session_mode IS NULL OR p_session_mode NOT IN ('面谈', '电话辅导', '线上辅导') OR
      p_case_category IS NULL OR p_case_category NOT IN
      ('精神', '情感与婚姻', '家庭', '亲子教养', '成瘾', '人际关系', '职业生涯', '学业', '身体健康', '其他', '咨询') THEN
    RAISE EXCEPTION 'Invalid case category or session mode' USING ERRCODE = '22023';
  END IF;
  IF p_session_start IS NULL OR p_session_end IS NULL OR p_session_end <= p_session_start OR COALESCE(p_amount_received_rm, 0) < 0 THEN
    RAISE EXCEPTION 'Invalid session time or amount' USING ERRCODE = '22023';
  END IF;
  PERFORM 1 FROM public.counselling_people WHERE name = p_counsellor
    AND person_type IN ('counsellor', 'volunteer') AND status = 'active' AND deleted_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid counsellor' USING ERRCODE = '22023'; END IF;
  INSERT INTO public.counselling_sessions(submission_id, respondent_id, submitted_at, counselling_date,
    counsellor, session_mode, case_category, session_start, session_end, duration_minutes,
    client_initials, client_phone, client_summary, volunteer_actions, case_number, report_url,
    report_completed, amount_received_rm)
  VALUES (NULL, NULLIF(btrim(p_respondent_id), ''), clock_timestamp(), p_counselling_date,
    p_counsellor, p_session_mode, p_case_category, p_session_start, p_session_end,
    floor(extract(epoch FROM (p_session_end - p_session_start)) / 60)::integer,
    btrim(p_client_initials), NULLIF(btrim(p_client_phone), ''), NULLIF(btrim(p_client_summary), ''),
    NULLIF(btrim(p_volunteer_actions), ''), NULL, NULLIF(btrim(p_report_url), ''),
    NULLIF(btrim(p_report_url), '') IS NOT NULL, COALESCE(p_amount_received_rm, 0)) RETURNING * INTO created;
  RETURN created;
END;
$$;
COMMIT;
