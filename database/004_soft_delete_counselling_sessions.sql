BEGIN;

ALTER TABLE public.counselling_sessions
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_counselling_sessions_active
ON public.counselling_sessions (id)
WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.get_all_counselling_sessions()
RETURNS SETOF public.counselling_sessions
LANGUAGE sql
STABLE
AS $$
  SELECT cs.*
  FROM public.counselling_sessions AS cs
  WHERE cs.deleted_at IS NULL
  ORDER BY cs.counselling_date DESC, cs.id DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_counselling_session_by_id(p_id bigint)
RETURNS SETOF public.counselling_sessions
LANGUAGE sql
STABLE
AS $$
  SELECT cs.*
  FROM public.counselling_sessions AS cs
  WHERE cs.id = p_id
    AND cs.deleted_at IS NULL;
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
BEGIN
  IF p_id IS NULL OR p_id <= 0 THEN
    RAISE EXCEPTION 'id must be a positive integer' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_submission_id), '') IS NULL THEN
    RAISE EXCEPTION 'submission_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_counselling_date IS NULL THEN
    RAISE EXCEPTION 'counselling_date is required' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_counsellor), '') IS NULL
    OR p_counsellor NOT IN ('沈佳佳', '林美琪', '陈伟伦', '黄诗婷', '刘志豪') THEN
    RAISE EXCEPTION 'invalid counsellor' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_session_mode), '') IS NULL
    OR p_session_mode NOT IN ('面谈', '电话辅导', '线上辅导') THEN
    RAISE EXCEPTION 'invalid session_mode' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_case_category), '') IS NULL
    OR p_case_category NOT IN (
      '精神', '情感与婚姻', '家庭', '亲子教养', '成瘾', '人际关系',
      '职业生涯', '学业', '身体健康', '其他', '咨询'
    ) THEN
    RAISE EXCEPTION 'invalid case_category' USING ERRCODE = '22023';
  END IF;

  IF p_session_start IS NULL OR p_session_end IS NULL OR p_session_end <= p_session_start THEN
    RAISE EXCEPTION 'session_end must be later than session_start' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_client_initials), '') IS NULL THEN
    RAISE EXCEPTION 'client_initials is required' USING ERRCODE = '22023';
  END IF;

  IF NULLIF(BTRIM(p_case_number), '') IS NULL THEN
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
    case_category = p_case_category,
    session_start = p_session_start,
    session_end = p_session_end,
    duration_minutes = FLOOR(EXTRACT(EPOCH FROM (p_session_end - p_session_start)) / 60)::integer,
    client_initials = BTRIM(p_client_initials),
    client_phone = NULLIF(BTRIM(p_client_phone), ''),
    client_summary = NULLIF(BTRIM(p_client_summary), ''),
    volunteer_actions = NULLIF(BTRIM(p_volunteer_actions), ''),
    case_number = BTRIM(p_case_number),
    report_url = v_report_url,
    report_completed = v_report_url IS NOT NULL,
    amount_received_rm = COALESCE(p_amount_received_rm, 0),
    updated_at = CURRENT_TIMESTAMP
  WHERE cs.id = p_id
    AND cs.deleted_at IS NULL
  RETURNING cs.*;
END;
$$;

CREATE OR REPLACE FUNCTION public.soft_delete_counselling_session(p_id bigint)
RETURNS SETOF public.counselling_sessions
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_id IS NULL OR p_id <= 0 THEN
    RAISE EXCEPTION 'id must be a positive integer'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.counselling_sessions AS cs
  SET
    deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE cs.id = p_id
    AND cs.deleted_at IS NULL
  RETURNING cs.*;
END;
$$;

COMMIT;
