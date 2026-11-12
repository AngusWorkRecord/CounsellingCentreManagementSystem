BEGIN;

CREATE TABLE IF NOT EXISTS public.duty_roster_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date_from date NOT NULL, date_to date NOT NULL CHECK (date_to >= date_from),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_by bigint NOT NULL REFERENCES public.auth_users(id),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(date_from, date_to)
);
CREATE TABLE IF NOT EXISTS public.duty_roster_shifts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  duty_date date NOT NULL, start_time time NOT NULL, end_time time NOT NULL CHECK (end_time > start_time),
  method text NOT NULL CHECK (method IN ('phone', 'f2f', 'zoom')),
  source_group_id text NOT NULL DEFAULT '', note text NOT NULL DEFAULT '' CHECK (length(note) <= 2000),
  manually_adjusted boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by bigint NOT NULL REFERENCES public.auth_users(id),
  updated_by bigint NOT NULL REFERENCES public.auth_users(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(), deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS duty_roster_dates ON public.duty_roster_shifts(duty_date) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS public.duty_roster_members (
  shift_id bigint NOT NULL REFERENCES public.duty_roster_shifts(id),
  person_id bigint NOT NULL REFERENCES public.counselling_people(id),
  position integer NOT NULL CHECK (position >= 0),
  name_snapshot text NOT NULL, type_snapshot text NOT NULL,
  PRIMARY KEY(shift_id, person_id), UNIQUE(shift_id, position)
);
CREATE TABLE IF NOT EXISTS public.duty_roster_requests (
  actor_id bigint NOT NULL REFERENCES public.auth_users(id), request_id uuid NOT NULL,
  payload jsonb NOT NULL, result jsonb NOT NULL, before_rows jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), PRIMARY KEY(actor_id, request_id)
);

CREATE OR REPLACE FUNCTION public.duty_roster_shift_json(p_id bigint)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object('id', s.id::text, 'version', s.version, 'date', to_char(s.duty_date, 'YYYY-MM-DD'),
    'start', to_char(s.start_time, 'HH24:MI'), 'end', to_char(s.end_time, 'HH24:MI'), 'method', s.method,
    'groupId', s.source_group_id, 'note', s.note,
    'manualAssignment', CASE WHEN s.manually_adjusted THEN '{"type":"manualEdit"}'::jsonb ELSE NULL END,
    'updatedBy', s.updated_by::text, 'updatedAt', s.updated_at, 'deleted', s.deleted_at IS NOT NULL,
    'personIds', COALESCE((SELECT jsonb_agg(m.person_id::text ORDER BY m.position) FROM public.duty_roster_members m WHERE m.shift_id = s.id), '[]'),
    'people', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', p.id::text,
      'name', CASE WHEN p.deleted_at IS NULL THEN p.name ELSE m.name_snapshot END,
      'type', CASE WHEN p.deleted_at IS NULL THEN p.person_type ELSE m.type_snapshot END,
      'status', p.status) ORDER BY m.position)
      FROM public.duty_roster_members m JOIN public.counselling_people p ON p.id = m.person_id WHERE m.shift_id = s.id), '[]'))
  FROM public.duty_roster_shifts s WHERE s.id = p_id;
$$;

-- All roster writes take the same short transaction lock. Range replacement
-- compares both membership and versions after locking, detecting phantom inserts.
CREATE OR REPLACE FUNCTION public.write_duty_roster(p_token text, p_request uuid, p_command jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  actor public.auth_users; cached public.duty_roster_requests; original public.duty_roster_requests;
  config public.duty_roster_settings; row_before public.duty_roster_shifts;
  item jsonb; old_item jsonb; member jsonb; history jsonb; stored_member jsonb;
  expected jsonb; actual jsonb; before_rows jsonb := '[]'; changed_ids bigint[] := '{}';
  updates jsonb := COALESCE(p_command->'upserts', '[]'); removals jsonb := COALESCE(p_command->'deletes', '[]');
  v_shift_id bigint; v_person_id bigint; ordinal integer; snapshots jsonb;
  member_name text; member_type text; mapped jsonb := '{}'; output jsonb; kind text := p_command->>'kind';
BEGIN
  PERFORM pg_advisory_xact_lock(72386421);
  SELECT u.* INTO actor FROM public.auth_users u JOIN public.auth_sessions s ON s.user_id = u.id
    WHERE s.token_hash = p_token AND s.revoked_at IS NULL AND s.expires_at > clock_timestamp()
      AND u.is_active AND u.role IN ('admin', 'volunteer');
  IF NOT FOUND THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_request IS NULL OR kind IS NULL OR kind NOT IN ('settings', 'patch', 'replace', 'undo') THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
  SELECT * INTO cached FROM public.duty_roster_requests WHERE actor_id = actor.id AND request_id = p_request;
  IF FOUND THEN
    IF cached.payload <> p_command THEN RAISE EXCEPTION 'ROSTER_REQUEST_CONFLICT'; END IF;
    RETURN cached.result;
  END IF;

  IF kind = 'settings' THEN
    SELECT * INTO config FROM public.duty_roster_settings WHERE date_from = (p_command->>'from')::date AND date_to = (p_command->>'to')::date FOR UPDATE;
    IF (FOUND AND config.version <> (p_command->>'version')::integer) OR (NOT FOUND AND (p_command->>'version')::integer <> 0) THEN
      RAISE EXCEPTION 'ROSTER_VERSION_CONFLICT';
    END IF;
    -- New personnel references must be live; retained historical references may remain.
    FOR member_name IN SELECT jsonb_object_keys(p_command->'data'->'preferences') LOOP
      PERFORM 1 FROM public.counselling_people WHERE id = member_name::bigint
        AND (deleted_at IS NULL OR COALESCE(config.data->'preferences', '{}') ? member_name) FOR SHARE;
      IF NOT FOUND THEN RAISE EXCEPTION 'ROSTER_PERSON_NOT_FOUND'; END IF;
    END LOOP;
    INSERT INTO public.duty_roster_settings(date_from, date_to, data, updated_by)
      VALUES ((p_command->>'from')::date, (p_command->>'to')::date, p_command->'data', actor.id)
      ON CONFLICT(date_from, date_to) DO UPDATE SET data = EXCLUDED.data, version = duty_roster_settings.version + 1,
        updated_by = actor.id, updated_at = clock_timestamp() RETURNING * INTO config;
    output := jsonb_build_object('settings', config.data, 'version', config.version, 'updatedBy', config.updated_by::text, 'updatedAt', config.updated_at);
  ELSE
    IF kind = 'replace' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id::text, 'version', version) ORDER BY id), '[]') INTO actual
        FROM public.duty_roster_shifts WHERE deleted_at IS NULL AND duty_date BETWEEN (p_command->>'from')::date AND (p_command->>'to')::date;
      SELECT COALESCE(jsonb_agg(value ORDER BY (value->>'id')::bigint), '[]') INTO expected FROM jsonb_array_elements(p_command->'expected');
      IF actual <> expected THEN RAISE EXCEPTION 'ROSTER_VERSION_CONFLICT'; END IF;
      removals := actual;
    ELSIF kind = 'undo' THEN
      SELECT * INTO original FROM public.duty_roster_requests WHERE actor_id = actor.id AND request_id = (p_command->>'undoId')::uuid;
      IF NOT FOUND OR original.payload->>'kind' NOT IN ('patch', 'replace') THEN RAISE EXCEPTION 'ROSTER_UNDO_CONFLICT'; END IF;
      FOR item IN SELECT value FROM jsonb_array_elements(original.result->'records') LOOP
        SELECT * INTO row_before FROM public.duty_roster_shifts WHERE id = (item->>'id')::bigint;
        IF NOT FOUND OR row_before.version <> (item->>'version')::integer THEN RAISE EXCEPTION 'ROSTER_UNDO_CONFLICT'; END IF;
      END LOOP;
      updates := original.before_rows;
      SELECT COALESCE(jsonb_agg(value), '[]') INTO removals FROM jsonb_array_elements(original.result->'records')
        WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(original.before_rows) b WHERE b->>'id' = value->>'id');
      -- The recorded, server-owned before-images authorize restoring soft-deleted members.
    END IF;

    FOR item IN SELECT value FROM jsonb_array_elements(removals) LOOP
      SELECT * INTO row_before FROM public.duty_roster_shifts WHERE id = (item->>'id')::bigint FOR UPDATE;
      IF NOT FOUND OR (kind <> 'undo' AND (row_before.deleted_at IS NOT NULL OR row_before.version <> (item->>'version')::integer)) THEN RAISE EXCEPTION 'ROSTER_VERSION_CONFLICT'; END IF;
      before_rows := before_rows || jsonb_build_array(public.duty_roster_shift_json(row_before.id));
      UPDATE public.duty_roster_shifts SET deleted_at = clock_timestamp(), version = version + 1, updated_by = actor.id, updated_at = clock_timestamp() WHERE id = row_before.id;
      changed_ids := array_append(changed_ids, row_before.id);
    END LOOP;

    FOR item IN SELECT value FROM jsonb_array_elements(updates) LOOP
      snapshots := '[]';
      IF item->>'id' IS NOT NULL THEN
        SELECT * INTO row_before FROM public.duty_roster_shifts WHERE id = (item->>'id')::bigint FOR UPDATE;
        IF NOT FOUND OR (kind <> 'undo' AND (row_before.deleted_at IS NOT NULL OR row_before.version <> (item->>'version')::integer)) THEN RAISE EXCEPTION 'ROSTER_VERSION_CONFLICT'; END IF;
        history := public.duty_roster_shift_json(row_before.id);
        before_rows := before_rows || jsonb_build_array(history);
        SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]') INTO snapshots FROM public.duty_roster_members m WHERE m.shift_id = row_before.id;
        v_shift_id := row_before.id;
        UPDATE public.duty_roster_shifts SET duty_date = (item->>'date')::date, start_time = (item->>'start')::time, end_time = (item->>'end')::time,
          method = item->>'method', source_group_id = COALESCE(item->>'groupId',''), note = COALESCE(item->>'note',''),
          manually_adjusted = COALESCE((item->>'manual')::boolean, item->'manualAssignment' IS NOT NULL AND item->'manualAssignment' <> 'null'),
          deleted_at = CASE WHEN kind = 'undo' AND (item->>'deleted')::boolean THEN clock_timestamp() ELSE NULL END,
          version = version + 1, updated_by = actor.id, updated_at = clock_timestamp() WHERE id = v_shift_id;
      ELSE
        INSERT INTO public.duty_roster_shifts(duty_date, start_time, end_time, method, source_group_id, note, manually_adjusted, created_by, updated_by)
          VALUES ((item->>'date')::date, (item->>'start')::time, (item->>'end')::time, item->>'method', COALESCE(item->>'groupId',''),
            COALESCE(item->>'note',''), COALESCE((item->>'manual')::boolean, false), actor.id, actor.id) RETURNING id INTO v_shift_id;
        mapped := mapped || jsonb_build_object(item->>'clientId', v_shift_id::text);
      END IF;
      DELETE FROM public.duty_roster_members WHERE duty_roster_members.shift_id = v_shift_id;
      ordinal := 0;
      FOR member IN SELECT value FROM jsonb_array_elements(item->'personIds') LOOP
        v_person_id := (member #>> '{}')::bigint;
        stored_member := NULL;
        SELECT value INTO stored_member FROM jsonb_array_elements(snapshots) WHERE (value->>'person_id')::bigint = v_person_id;
        SELECT name, person_type INTO member_name, member_type FROM public.counselling_people p
          WHERE p.id = v_person_id AND (p.deleted_at IS NULL OR stored_member IS NOT NULL OR kind = 'undo') FOR SHARE;
        IF NOT FOUND THEN RAISE EXCEPTION 'ROSTER_PERSON_NOT_FOUND'; END IF;
        INSERT INTO public.duty_roster_members VALUES (v_shift_id, v_person_id, ordinal,
          COALESCE(stored_member->>'name_snapshot', member_name), COALESCE(stored_member->>'type_snapshot', member_type));
        ordinal := ordinal + 1;
      END LOOP;
      changed_ids := array_append(changed_ids, v_shift_id);
    END LOOP;
    SELECT jsonb_build_object(
      'shiftRows', COALESCE(jsonb_agg(public.duty_roster_shift_json(id) ORDER BY id) FILTER(WHERE deleted_at IS NULL), '[]'),
      'deleted', COALESCE(jsonb_agg(id::text ORDER BY id) FILTER(WHERE deleted_at IS NOT NULL), '[]'),
      'records', COALESCE(jsonb_agg(jsonb_build_object('id', id::text, 'version', version) ORDER BY id), '[]'),
      'idMap', mapped, 'undoId', CASE WHEN kind = 'undo' THEN NULL ELSE p_request END)
      INTO output FROM public.duty_roster_shifts WHERE id = ANY(changed_ids);
  END IF;
  INSERT INTO public.duty_roster_requests(actor_id, request_id, payload, result, before_rows) VALUES(actor.id, p_request, p_command, output, before_rows);
  RETURN output;
END;
$$;
COMMIT;
