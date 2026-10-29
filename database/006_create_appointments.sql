BEGIN;

CREATE TABLE IF NOT EXISTS public.appointments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id bigint REFERENCES public.counselling_sessions(id),
  case_number text NOT NULL DEFAULT '',
  client_initials varchar(100) NOT NULL CHECK (length(btrim(client_initials)) > 0),
  phone varchar(50) NOT NULL CHECK (length(btrim(phone)) > 0),
  date date NOT NULL CHECK (date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
  start_time time NOT NULL,
  end_time time NOT NULL,
  counsellor text NOT NULL CHECK (counsellor IN ('沈佳佳', '林美琪', '陈伟伦', '黄诗婷', '刘志豪')),
  mode text NOT NULL CHECK (mode IN ('面谈', '电话辅导', '线上辅导')),
  location varchar(500) NOT NULL CHECK (length(btrim(location)) > 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'no_show', 'cancelled')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by bigint NOT NULL REFERENCES public.auth_users(id),
  updated_by bigint NOT NULL REFERENCES public.auth_users(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (end_time > start_time AND end_time < TIME '24:00'),
  CHECK (EXTRACT(SECOND FROM start_time) = 0 AND EXTRACT(SECOND FROM end_time) = 0)
);
CREATE INDEX IF NOT EXISTS appointments_schedule ON public.appointments(date, start_time, id);
CREATE INDEX IF NOT EXISTS appointments_conflicts ON public.appointments(counsellor, date, start_time, end_time)
  WHERE status <> 'cancelled';

CREATE TABLE IF NOT EXISTS public.appointment_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id bigint NOT NULL REFERENCES public.appointments(id),
  actor_id bigint NOT NULL REFERENCES public.auth_users(id),
  actor_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'status')),
  before_data jsonb,
  after_data jsonb NOT NULL,
  reason varchar(1000),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS appointment_history_lookup ON public.appointment_history(appointment_id, id);

-- Preserve bigint IDs as strings even inside JSON snapshots and list aggregates.
CREATE OR REPLACE FUNCTION public.appointment_snapshot(p public.appointments)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT to_jsonb(p) || jsonb_build_object('id', p.id::text, 'case_id', p.case_id::text,
    'created_by', p.created_by::text, 'updated_by', p.updated_by::text);
$$;

-- All application writes use this function. A separate SELECT after the advisory
-- lock sees the latest committed rows under READ COMMITTED (function is VOLATILE).
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
        next_row.case_number := linked.case_number;
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
  INSERT INTO public.appointment_history(appointment_id, actor_id, actor_name, action, before_data, after_data, reason)
    VALUES (next_row.id, actor.id, actor.full_name, p_action, before_snapshot, public.appointment_snapshot(next_row), reason);
  RETURN NEXT next_row;
END;
$$;
COMMIT;
