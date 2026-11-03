BEGIN;
-- Requires 004-008. No historical appointments are backfilled.
ALTER TABLE public.counselling_sessions
  ADD COLUMN IF NOT EXISTS source_appointment_id bigint REFERENCES public.appointments(id),
  ADD COLUMN IF NOT EXISTS intake_pending boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS counselling_sessions_source_appointment_unique
  ON public.counselling_sessions(source_appointment_id);
ALTER TABLE public.counselling_sessions ALTER COLUMN case_number DROP NOT NULL;
ALTER TABLE public.counselling_sessions ALTER COLUMN case_category DROP NOT NULL;
ALTER TABLE public.counselling_sessions DROP CONSTRAINT IF EXISTS counselling_sessions_complete_or_draft;
ALTER TABLE public.counselling_sessions ADD CONSTRAINT counselling_sessions_complete_or_draft CHECK (
  (source_appointment_id IS NOT NULL AND intake_pending) OR
  (NULLIF(btrim(case_number), '') IS NOT NULL AND NULLIF(btrim(case_category), '') IS NOT NULL)
);

CREATE OR REPLACE FUNCTION public.set_case_intake_state() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.source_appointment_id IS DISTINCT FROM OLD.source_appointment_id THEN
    RAISE EXCEPTION 'CASE_SOURCE_IMMUTABLE';
  END IF;
  NEW.intake_pending := NEW.source_appointment_id IS NOT NULL AND
    (NULLIF(btrim(NEW.case_number), '') IS NULL OR NULLIF(btrim(NEW.case_category), '') IS NULL);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS counselling_sessions_intake_state ON public.counselling_sessions;
CREATE TRIGGER counselling_sessions_intake_state BEFORE INSERT OR UPDATE ON public.counselling_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_case_intake_state();

-- VOLATILE is deliberate: a snapshot taken after write_appointment must see
-- the case inserted earlier in the same statement/transaction.
CREATE OR REPLACE FUNCTION public.appointment_snapshot(p public.appointments)
RETURNS jsonb LANGUAGE plpgsql VOLATILE AS $$
DECLARE generated public.counselling_sessions;
BEGIN
  SELECT * INTO generated FROM public.counselling_sessions WHERE source_appointment_id = p.id;
  RETURN to_jsonb(p) || jsonb_build_object('id', p.id::text, 'case_id', p.case_id::text,
    'created_by', p.created_by::text, 'updated_by', p.updated_by::text,
    'generated_case_id', generated.id::text, 'generated_case_deleted', generated.deleted_at IS NOT NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.write_appointment(
  p_token text, p_action text, p_id bigint, p_version integer, p_data jsonb
) RETURNS SETOF public.appointments LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  actor public.auth_users;
  previous public.appointments;
  next_row public.appointments;
  linked public.counselling_sessions;
  before_snapshot jsonb;
  reason text;
  generated_id bigint;
  generated_submission text;
  attempt integer;
BEGIN
  PERFORM pg_advisory_xact_lock(714204, 1);
  SELECT u.* INTO actor FROM public.auth_users u JOIN public.auth_sessions s ON s.user_id = u.id
    WHERE s.token_hash = p_token AND s.revoked_at IS NULL AND s.expires_at > clock_timestamp()
      AND u.is_active AND u.role IN ('admin', 'volunteer');
  IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('create', 'update', 'status') THEN
    RAISE EXCEPTION 'INVALID_REQUEST';
  END IF;
  IF p_action <> 'create' THEN
    SELECT * INTO previous FROM public.appointments WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'APPOINTMENT_NOT_FOUND'; END IF;
    IF p_version IS NULL OR previous.version <> p_version THEN RAISE EXCEPTION 'APPOINTMENT_VERSION_CONFLICT'; END IF;
    next_row := previous;
    before_snapshot := public.appointment_snapshot(previous);
  END IF;

  IF p_action IN ('create', 'update') THEN
    IF p_action = 'update' AND previous.status <> 'scheduled' THEN
      RAISE EXCEPTION 'APPOINTMENT_INVALID_STATUS';
    END IF;
    next_row.case_id := NULLIF(p_data->>'caseId', '')::bigint;
    IF p_action = 'create' OR next_row.case_id IS DISTINCT FROM previous.case_id THEN
      next_row.case_number := '';
      IF next_row.case_id IS NOT NULL THEN
        SELECT * INTO linked FROM public.counselling_sessions
          WHERE id = next_row.case_id AND deleted_at IS NULL FOR SHARE;
        IF NOT FOUND THEN RAISE EXCEPTION 'APPOINTMENT_CASE_NOT_FOUND'; END IF;
        next_row.case_number := COALESCE(linked.case_number, linked.submission_id, '');
      END IF;
    END IF;
    next_row.client_initials := btrim(p_data->>'clientInitials');
    next_row.phone := btrim(p_data->>'phone');
    next_row.date := (p_data->>'date')::date;
    next_row.start_time := (p_data->>'start')::time;
    next_row.end_time := (p_data->>'end')::time;
    next_row.counsellor := p_data->>'counsellor';
    next_row.mode := p_data->>'mode';
    next_row.location := btrim(p_data->>'location');
    next_row.status := 'scheduled';
  ELSE
    next_row.status := p_data->>'status';
    IF next_row.status IS NULL OR NOT (
      (previous.status = 'scheduled' AND next_row.status IN ('completed', 'no_show', 'cancelled')) OR
      (previous.status <> 'scheduled' AND next_row.status = 'scheduled')
    ) THEN RAISE EXCEPTION 'APPOINTMENT_INVALID_STATUS'; END IF;
    IF next_row.status IN ('completed', 'no_show') AND
      (next_row.date + next_row.end_time) AT TIME ZONE 'Asia/Kuala_Lumpur' > clock_timestamp() THEN
      RAISE EXCEPTION 'APPOINTMENT_NOT_ENDED';
    END IF;
    IF next_row.status = 'cancelled' THEN reason := NULLIF(btrim(p_data->>'reason'), ''); END IF;
  END IF;

  -- Keep historical names on unchanged edits; new assignments require live staff.
  IF p_action = 'create' OR
      (p_action = 'update' AND next_row.counsellor IS DISTINCT FROM previous.counsellor) OR
      (p_action = 'status' AND next_row.status = 'scheduled') THEN
    PERFORM 1 FROM public.counselling_people
      WHERE name = next_row.counsellor AND person_type IN ('counsellor', 'volunteer')
        AND status = 'active' AND deleted_at IS NULL FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'APPOINTMENT_COUNSELLOR_UNAVAILABLE'; END IF;
  END IF;

  IF next_row.status <> 'cancelled' AND EXISTS (
    SELECT 1 FROM public.appointments a WHERE a.id IS DISTINCT FROM p_id AND a.status <> 'cancelled'
      AND a.date = next_row.date AND a.counsellor = next_row.counsellor
      AND a.start_time < next_row.end_time AND a.end_time > next_row.start_time
  ) THEN RAISE EXCEPTION 'APPOINTMENT_TIME_CONFLICT'; END IF;

  IF p_action = 'create' THEN
    INSERT INTO public.appointments(case_id, case_number, client_initials, phone, date, start_time, end_time,
      counsellor, mode, location, created_by, updated_by)
    VALUES (next_row.case_id, next_row.case_number, next_row.client_initials, next_row.phone, next_row.date,
      next_row.start_time, next_row.end_time, next_row.counsellor, next_row.mode, next_row.location, actor.id, actor.id)
    RETURNING * INTO next_row;
  ELSE
    UPDATE public.appointments SET case_id = next_row.case_id, case_number = next_row.case_number,
      client_initials = next_row.client_initials, phone = next_row.phone, date = next_row.date,
      start_time = next_row.start_time, end_time = next_row.end_time, counsellor = next_row.counsellor,
      mode = next_row.mode, location = next_row.location, status = next_row.status,
      version = previous.version + 1, updated_by = actor.id, updated_at = clock_timestamp()
    WHERE id = p_id RETURNING * INTO next_row;
  END IF;
  -- Row/advisory locks above serialize duplicate completions; the unique source
  -- index additionally protects against every other writer, including soft deletes.
  IF p_action = 'status' AND next_row.status = 'completed' THEN
    SELECT id INTO generated_id FROM public.counselling_sessions WHERE source_appointment_id = next_row.id;
    IF generated_id IS NULL THEN
      generated_submission := 'APPT-' || next_row.id::text;
      FOR attempt IN 1..20 LOOP
        BEGIN
          INSERT INTO public.counselling_sessions(submission_id, submitted_at, counselling_date, counsellor,
            session_mode, session_start, session_end, duration_minutes, client_initials, client_phone,
            case_category, case_number, amount_received_rm, source_appointment_id, intake_pending)
          VALUES (generated_submission, clock_timestamp(), next_row.date, next_row.counsellor,
            next_row.mode, next_row.start_time, next_row.end_time,
            floor(extract(epoch FROM (next_row.end_time - next_row.start_time)) / 60)::integer,
            next_row.client_initials, next_row.phone, NULL, NULL, 0, next_row.id, true)
          RETURNING id INTO generated_id;
          EXIT;
        EXCEPTION WHEN unique_violation THEN
          IF EXISTS (SELECT 1 FROM public.counselling_sessions WHERE submission_id = generated_submission) THEN
            generated_submission := 'APPT-' || next_row.id::text || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
          ELSE RAISE;
          END IF;
        END;
      END LOOP;
      IF generated_id IS NULL THEN RAISE EXCEPTION 'APPOINTMENT_CASE_GENERATION_FAILED'; END IF;
    END IF;
  END IF;
  INSERT INTO public.appointment_history(appointment_id, actor_id, actor_name, action, before_data, after_data, reason)
    VALUES (next_row.id, actor.id, actor.full_name, p_action, before_snapshot, public.appointment_snapshot(next_row), reason);
  RETURN NEXT next_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_counselling_session(
  p_id bigint,
  p_submission_id varchar,
  p_respondent_id varchar,
  p_counselling_date date,
  p_counsellor varchar,
  p_session_mode varchar,
  p_case_category varchar,
  p_session_start time without time zone,
  p_session_end time without time zone,
  p_client_initials varchar,
  p_client_phone varchar,
  p_client_summary text,
  p_volunteer_actions text,
  p_case_number varchar,
  p_report_url text,
  p_amount_received_rm numeric
)
RETURNS SETOF public.counselling_sessions
LANGUAGE plpgsql
AS $$
DECLARE
  v_report_url text := NULLIF(BTRIM(p_report_url), '');
  previous public.counselling_sessions;
BEGIN
  IF p_id IS NULL OR p_id <= 0 THEN
    RAISE EXCEPTION 'id must be a positive integer' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO previous FROM public.counselling_sessions WHERE id = p_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;

  IF NULLIF(BTRIM(p_submission_id), '') IS NULL THEN
    RAISE EXCEPTION 'submission_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_counselling_date IS NULL THEN
    RAISE EXCEPTION 'counselling_date is required' USING ERRCODE = '22023';
  END IF;

  IF p_counsellor IS DISTINCT FROM previous.counsellor THEN
    PERFORM 1 FROM public.counselling_people WHERE name = p_counsellor
      AND person_type IN ('counsellor', 'volunteer') AND status = 'active' AND deleted_at IS NULL FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'invalid counsellor' USING ERRCODE = '22023'; END IF;
  END IF;

  IF NULLIF(BTRIM(p_session_mode), '') IS NULL
    OR p_session_mode NOT IN ('面谈', '电话辅导', '线上辅导') THEN
    RAISE EXCEPTION 'invalid session_mode' USING ERRCODE = '22023';
  END IF;

  IF (NULLIF(BTRIM(p_case_category), '') IS NULL AND previous.source_appointment_id IS NULL)
    OR (NULLIF(BTRIM(p_case_category), '') IS NOT NULL AND p_case_category NOT IN (
      '精神', '情感与婚姻', '家庭', '亲子教养', '成瘾', '人际关系',
      '职业生涯', '学业', '身体健康', '其他', '咨询'
    )) THEN
    RAISE EXCEPTION 'invalid case_category' USING ERRCODE = '22023';
  END IF;

  IF p_session_start IS NULL OR p_session_end IS NULL OR p_session_end <= p_session_start THEN
    RAISE EXCEPTION 'session_end must be later than session_start' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_client_initials), '') IS NULL THEN
    RAISE EXCEPTION 'client_initials is required' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_case_number), '') IS NULL AND previous.source_appointment_id IS NULL THEN
    RAISE EXCEPTION 'case_number is required' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(p_amount_received_rm, 0) < 0 THEN
    RAISE EXCEPTION 'amount_received_rm cannot be negative' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.counselling_sessions AS cs
  SET
    submission_id = BTRIM(p_submission_id),
    respondent_id = NULLIF(BTRIM(p_respondent_id), ''),
    counselling_date = p_counselling_date,
    counsellor = p_counsellor,
    session_mode = p_session_mode,
    case_category = NULLIF(BTRIM(p_case_category), ''),
    session_start = p_session_start,
    session_end = p_session_end,
    duration_minutes = FLOOR(EXTRACT(EPOCH FROM (p_session_end - p_session_start)) / 60)::integer,
    client_initials = BTRIM(p_client_initials),
    client_phone = NULLIF(BTRIM(p_client_phone), ''),
    client_summary = NULLIF(BTRIM(p_client_summary), ''),
    volunteer_actions = NULLIF(BTRIM(p_volunteer_actions), ''),
    case_number = NULLIF(BTRIM(p_case_number), ''),
    report_url = v_report_url,
    report_completed = v_report_url IS NOT NULL,
    amount_received_rm = COALESCE(p_amount_received_rm, 0),
    updated_at = CURRENT_TIMESTAMP
  WHERE cs.id = p_id
    AND cs.deleted_at IS NULL
  RETURNING cs.*;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_counselling_session(
  p_submission_id text, p_respondent_id text, p_counselling_date date, p_counsellor text,
  p_session_mode text, p_case_category text, p_session_start time, p_session_end time,
  p_client_initials text, p_client_phone text, p_client_summary text, p_volunteer_actions text,
  p_case_number text, p_report_url text, p_amount_received_rm numeric
) RETURNS public.counselling_sessions LANGUAGE plpgsql AS $$
DECLARE created public.counselling_sessions;
BEGIN
  IF NULLIF(btrim(p_submission_id), '') IS NULL OR p_counselling_date IS NULL OR
      NULLIF(btrim(p_client_initials), '') IS NULL OR NULLIF(btrim(p_case_number), '') IS NULL THEN
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
  VALUES (btrim(p_submission_id), NULLIF(btrim(p_respondent_id), ''), clock_timestamp(), p_counselling_date,
    p_counsellor, p_session_mode, p_case_category, p_session_start, p_session_end,
    floor(extract(epoch FROM (p_session_end - p_session_start)) / 60)::integer,
    btrim(p_client_initials), NULLIF(btrim(p_client_phone), ''), NULLIF(btrim(p_client_summary), ''),
    NULLIF(btrim(p_volunteer_actions), ''), btrim(p_case_number), NULLIF(btrim(p_report_url), ''),
    NULLIF(btrim(p_report_url), '') IS NOT NULL, COALESCE(p_amount_received_rm, 0)) RETURNING * INTO created;
  RETURN created;
END;
$$;

COMMIT;
