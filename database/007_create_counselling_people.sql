BEGIN;

-- Personnel profiles are independent of login accounts and existing case/appointment names.
CREATE TABLE IF NOT EXISTS public.counselling_people (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(100) NOT NULL CHECK (length(btrim(name)) > 0),
  person_type text NOT NULL CHECK (person_type IN ('counsellor', 'volunteer')),
  phone varchar(50) NOT NULL DEFAULT '',
  email varchar(254) NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}'
    CHECK (languages <@ ARRAY['cn', 'en', 'ms', 'ta']::text[] AND cardinality(languages) <= 4
      AND array_position(languages, NULL) IS NULL AND COALESCE(array_ndims(languages), 1) = 1),
  specialisation varchar(2000) NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by bigint NOT NULL REFERENCES public.auth_users(id),
  updated_by bigint NOT NULL REFERENCES public.auth_users(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  deleted_at timestamptz,
  CHECK (length(btrim(phone)) > 0 OR length(btrim(email)) > 0),
  CHECK (email = '' OR email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);
CREATE INDEX IF NOT EXISTS counselling_people_live ON public.counselling_people(id) WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.write_counselling_person(
  p_token text, p_action text, p_id bigint, p_version integer, p_data jsonb
) RETURNS SETOF public.counselling_people LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  actor public.auth_users;
  previous public.counselling_people;
  next_row public.counselling_people;
  selected_languages text[];
BEGIN
  SELECT u.* INTO actor FROM public.auth_users u JOIN public.auth_sessions s ON s.user_id = u.id
    WHERE s.token_hash = p_token AND s.revoked_at IS NULL AND s.expires_at > clock_timestamp()
      AND u.is_active AND u.role IN ('admin', 'volunteer');
  IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_action IS NULL OR p_action NOT IN ('create', 'update', 'status', 'delete') THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
  IF p_action <> 'create' THEN
    SELECT * INTO previous FROM public.counselling_people WHERE id = p_id AND deleted_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'PERSON_NOT_FOUND'; END IF;
    IF p_version IS NULL OR p_version <> previous.version THEN RAISE EXCEPTION 'PERSON_VERSION_CONFLICT'; END IF;
  END IF;

  IF p_action IN ('create', 'update') THEN
    SELECT COALESCE(array_agg(value), '{}'::text[]) INTO selected_languages FROM jsonb_array_elements_text(p_data->'languages');
    IF p_action = 'create' THEN
      INSERT INTO public.counselling_people(name, person_type, phone, email, languages, specialisation, created_by, updated_by)
      VALUES (btrim(p_data->>'name'), p_data->>'type', btrim(p_data->>'phone'), btrim(p_data->>'email'),
        selected_languages, btrim(p_data->>'specialisation'), actor.id, actor.id) RETURNING * INTO next_row;
    ELSE
      UPDATE public.counselling_people SET name = btrim(p_data->>'name'), person_type = p_data->>'type',
        phone = btrim(p_data->>'phone'), email = btrim(p_data->>'email'), languages = selected_languages,
        specialisation = btrim(p_data->>'specialisation'), version = version + 1,
        updated_by = actor.id, updated_at = clock_timestamp() WHERE id = p_id RETURNING * INTO next_row;
    END IF;
  ELSE
    UPDATE public.counselling_people SET status = CASE WHEN p_action = 'status' THEN p_data->>'status' ELSE status END,
      deleted_at = CASE WHEN p_action = 'delete' THEN clock_timestamp() ELSE deleted_at END,
      version = version + 1, updated_by = actor.id, updated_at = clock_timestamp()
      WHERE id = p_id RETURNING * INTO next_row;
  END IF;
  RETURN NEXT next_row;
END;
$$;
COMMIT;
