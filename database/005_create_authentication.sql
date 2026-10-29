BEGIN;

CREATE TABLE IF NOT EXISTS public.auth_users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    full_name varchar(100) NOT NULL,
    email varchar(254),
    role varchar(20) NOT NULL DEFAULT 'volunteer',
    is_active boolean NOT NULL DEFAULT true,
    failed_login_attempts integer NOT NULL DEFAULT 0,
    locked_until timestamptz,
    last_login_at timestamptz,
    password_changed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by bigint REFERENCES public.auth_users(id),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT auth_users_username_check CHECK (username ~ '^[a-z0-9][a-z0-9_.-]{2,49}$'),
    CONSTRAINT auth_users_full_name_check CHECK (length(btrim(full_name)) > 0),
    CONSTRAINT auth_users_email_check CHECK (email IS NULL OR length(btrim(email)) > 0),
    CONSTRAINT auth_users_role_check CHECK (role IN ('admin', 'volunteer')),
    CONSTRAINT auth_users_failed_login_attempts_check CHECK (failed_login_attempts >= 0)
);

-- Upgrade the previously proposed admin/staff schema if it was already applied.
ALTER TABLE public.auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;
UPDATE public.auth_users SET role = 'volunteer', updated_at = CURRENT_TIMESTAMP WHERE role = 'staff';
ALTER TABLE public.auth_users ALTER COLUMN role SET DEFAULT 'volunteer';
ALTER TABLE public.auth_users ADD CONSTRAINT auth_users_role_check CHECK (role IN ('admin', 'volunteer'));

CREATE TABLE IF NOT EXISTS public.auth_sessions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES public.auth_users(id),
    token_hash varchar(64) NOT NULL UNIQUE,
    remember_me boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    CONSTRAINT auth_sessions_token_hash_check CHECK (token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT auth_sessions_expiry_check CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
    ON public.auth_sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON public.auth_sessions (expires_at);

CREATE OR REPLACE FUNCTION public.auth_record_failed_login(p_id bigint, p_observed_hash text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_user public.auth_users; v_attempts integer;
BEGIN
    SELECT * INTO v_user FROM public.auth_users WHERE id = p_id FOR UPDATE;
    IF NOT FOUND OR NOT v_user.is_active OR v_user.password_hash <> p_observed_hash
       OR v_user.locked_until > CURRENT_TIMESTAMP THEN RETURN; END IF;
    v_attempts := CASE WHEN v_user.locked_until IS NOT NULL THEN 1 ELSE v_user.failed_login_attempts + 1 END;
    UPDATE public.auth_users SET failed_login_attempts = v_attempts,
        locked_until = CASE WHEN v_attempts >= 5 THEN CURRENT_TIMESTAMP + interval '15 minutes' ELSE NULL END,
        updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_complete_login(
    p_id bigint, p_observed_hash text, p_token_hash text, p_remember_me boolean
) RETURNS SETOF public.auth_users LANGUAGE plpgsql AS $$
DECLARE v_user public.auth_users;
BEGIN
    SELECT * INTO v_user FROM public.auth_users WHERE id = p_id FOR UPDATE;
    IF NOT FOUND OR NOT v_user.is_active OR v_user.password_hash <> p_observed_hash
       OR v_user.locked_until > CURRENT_TIMESTAMP THEN RETURN; END IF;
    UPDATE public.auth_users SET failed_login_attempts = 0, locked_until = NULL,
        last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
    INSERT INTO public.auth_sessions (user_id, token_hash, remember_me, expires_at)
    VALUES (p_id, p_token_hash, p_remember_me,
        CURRENT_TIMESTAMP + CASE WHEN p_remember_me THEN interval '30 days' ELSE interval '12 hours' END);
    RETURN QUERY SELECT * FROM public.auth_users WHERE id = p_id;
END;
$$;

-- All administrative mutations take the same transaction-level advisory lock.
-- The role count and actor checks run AFTER acquiring the lock. This serializes
-- simultaneous demotions/deactivations even when they target different admins.
CREATE OR REPLACE FUNCTION public.auth_admin_actor(p_token_hash text)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE v_actor bigint;
BEGIN
    SELECT u.id INTO v_actor FROM public.auth_sessions s
        JOIN public.auth_users u ON u.id = s.user_id
        WHERE s.token_hash = p_token_hash AND s.revoked_at IS NULL
          AND s.expires_at > clock_timestamp() AND u.is_active AND u.role = 'admin';
    IF NOT FOUND THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
    RETURN v_actor;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_create_user(
    p_actor_token text, p_username text, p_hash text, p_name text, p_email text, p_role text
) RETURNS SETOF public.auth_users LANGUAGE plpgsql AS $$
DECLARE v_actor bigint; v_id bigint;
BEGIN
    PERFORM pg_advisory_xact_lock(714203, 1);
    v_actor := public.auth_admin_actor(p_actor_token);
    INSERT INTO public.auth_users (username, password_hash, full_name, email, role, created_by)
    VALUES (p_username, p_hash, p_name, p_email, p_role, v_actor) RETURNING id INTO v_id;
    RETURN QUERY SELECT * FROM public.auth_users WHERE id = v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_update_user(p_actor_token text, p_id bigint, p_changes jsonb)
RETURNS SETOF public.auth_users LANGUAGE plpgsql AS $$
DECLARE v_user public.auth_users; v_role text; v_active boolean;
BEGIN
    PERFORM pg_advisory_xact_lock(714203, 1);
    PERFORM public.auth_admin_actor(p_actor_token);
    SELECT * INTO v_user FROM public.auth_users WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'USER_NOT_FOUND'; END IF;
    v_role := CASE WHEN p_changes ? 'role' THEN p_changes->>'role' ELSE v_user.role END;
    v_active := CASE WHEN p_changes ? 'isActive' THEN (p_changes->>'isActive')::boolean ELSE v_user.is_active END;
    IF v_user.role = 'admin' AND v_user.is_active AND (v_role <> 'admin' OR NOT v_active)
       AND NOT EXISTS (SELECT 1 FROM public.auth_users WHERE role = 'admin' AND is_active AND id <> p_id)
    THEN RAISE EXCEPTION 'LAST_ADMIN'; END IF;
    UPDATE public.auth_users SET
        full_name = CASE WHEN p_changes ? 'fullName' THEN p_changes->>'fullName' ELSE full_name END,
        email = CASE WHEN p_changes ? 'email' THEN p_changes->>'email' ELSE email END,
        role = v_role, is_active = v_active, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
    IF NOT v_active THEN
        UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = p_id AND revoked_at IS NULL;
    END IF;
    RETURN QUERY SELECT * FROM public.auth_users WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_reset_password(p_actor_token text, p_id bigint, p_hash text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(714203, 1);
    PERFORM public.auth_admin_actor(p_actor_token);
    UPDATE public.auth_users SET password_hash = p_hash, password_changed_at = CURRENT_TIMESTAMP,
        failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'USER_NOT_FOUND'; END IF;
    UPDATE public.auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = p_id AND revoked_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_bootstrap_admin(p_username text, p_hash text, p_name text, p_email text)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE v_id bigint;
BEGIN
    PERFORM pg_advisory_xact_lock(714203, 1);
    IF EXISTS (SELECT 1 FROM public.auth_users WHERE role = 'admin')
    THEN RAISE EXCEPTION 'ADMIN_ALREADY_EXISTS'; END IF;
    INSERT INTO public.auth_users (username, password_hash, full_name, email, role)
    VALUES (p_username, p_hash, p_name, p_email, 'admin') RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

COMMIT;
