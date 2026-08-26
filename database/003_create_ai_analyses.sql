BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type varchar(40) NOT NULL CHECK (analysis_type IN ('management_insights', 'case_advice')),
  session_id bigint NULL,
  scope_key varchar(200) NOT NULL,
  filter_snapshot jsonb NULL,
  source_manifest jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt_version varchar(40) NOT NULL,
  model_name varchar(120) NOT NULL,
  status varchar(30) NOT NULL CHECK (
    status IN ('started', 'completed', 'refused', 'invalid_output', 'timeout', 'upstream_error', 'cancelled')
  ),
  structured_result jsonb NULL,
  error_code varchar(80) NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamptz NULL,
  expires_at timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS ai_analyses_latest_scope_idx
  ON public.ai_analyses (analysis_type, scope_key, created_at DESC)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS ai_analyses_expiry_idx ON public.ai_analyses (expires_at);

CREATE OR REPLACE FUNCTION public.delete_expired_ai_analyses()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.ai_analyses WHERE expires_at <= CURRENT_TIMESTAMP;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMIT;
