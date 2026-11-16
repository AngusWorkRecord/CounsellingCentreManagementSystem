-- Test-only stand-in for the historical counselling_sessions base migration,
-- which is absent from this checkout. Production uses the existing table.
CREATE TABLE public.counselling_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submission_id varchar(100) NOT NULL UNIQUE, respondent_id varchar(100),
  submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(), counselling_date date NOT NULL,
  counsellor varchar(100) NOT NULL, session_mode varchar(50) NOT NULL, case_category varchar(100) NOT NULL,
  session_start time NOT NULL, session_end time NOT NULL, duration_minutes integer NOT NULL,
  client_initials varchar(100) NOT NULL, client_phone varchar(50), client_summary text, volunteer_actions text,
  case_number varchar(100) NOT NULL, report_url text, report_completed boolean NOT NULL DEFAULT false,
  amount_received_rm numeric NOT NULL DEFAULT 0, notification_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT clock_timestamp(), updated_at timestamptz DEFAULT clock_timestamp(), deleted_at timestamptz
);
