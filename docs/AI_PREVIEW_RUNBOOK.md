# AI Deployment Runbook

AI is controlled by `AI_FEATURE_ENABLED` in every Vercel environment. Production can call the model when the flag, API key, model, and database connection are configured.

> Production currently has no complete server-side JWT/RBAC enforcement. Until that work is finished, use only test or de-identified data and disable the feature immediately if unexpected usage appears.

## 1. External setup

Create a dedicated OpenAI Platform project and API key. Store the key only in Vercel environment variables; never place it in React code, Git, screenshots, tickets, or logs.

In Neon SQL Editor, run `database/003_create_ai_analyses.sql`, then verify:

```sql
SELECT to_regclass('public.ai_analyses');

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'counselling_sessions'
  AND column_name IN (
    'id', 'client_summary', 'volunteer_actions', 'updated_at',
    'counselling_date', 'counsellor', 'session_mode', 'case_category',
    'duration_minutes', 'report_completed', 'notification_sent',
    'amount_received_rm'
  )
ORDER BY column_name;
```

All listed columns are required by the current endpoints. If any are absent, update the database or endpoint query before enabling AI.

## 2. Vercel environment

Configure the following separately for each environment where AI should run. Secrets must be entered in Vercel and never committed:

```text
DATABASE_URL=<existing Neon pooled connection string>
AI_FEATURE_ENABLED=true
OPENAI_API_KEY=<dedicated project secret>
OPENAI_MODEL=gpt-4.1-mini
AI_REQUEST_TIMEOUT_MS=20000
```

For Production, all five values must include the Production environment. For Preview testing, all five must include Preview. Redeploy the relevant environment after changing variables. `npm start` runs only the CRA frontend and proxies API calls to the configured remote site; use a Vercel deployment or `vercel dev` for full-stack testing.

## 3. Verification

Run locally before deploying:

```bash
npm run test:ai
npm run lint
npm run build
```

In each enabled deployment:

1. Open General mode and confirm no OpenAI usage is created.
2. Switch to AI and confirm only a cached-analysis lookup occurs.
3. Generate a case result using a test record containing `client_summary` or `volunteer_actions`.
4. Generate management insights for a date range with records.
5. Confirm `public.ai_analyses` contains completed rows and no phone number or full prompt.
6. Reopen the panel and confirm the cached result appears; regenerate and confirm a new row is inserted.
7. Check OpenAI Platform usage and Vercel function logs for the expected request only.

## 4. Safe troubleshooting

| Error | Check |
| --- | --- |
| `AI_NOT_AVAILABLE` | `AI_FEATURE_ENABLED` is exactly `true` in the current deployment environment; redeploy after changes. |
| `AI_NOT_CONFIGURED` | `OPENAI_API_KEY` and `OPENAI_MODEL` exist in the current environment. Do not print the key. |
| `DATABASE_NOT_CONFIGURED` | `DATABASE_URL` is assigned to the current environment and the deployment was rebuilt. |
| `AI_UPSTREAM_ERROR` | OpenAI project billing, model access, quota, and Vercel outbound connectivity. |
| `AI_INVALID_OUTPUT` | Inspect only the error code and analysis ID; do not log the full prompt or sensitive record text. |
| Database column error | Run the schema verification query above and align the endpoint with the real schema. |

Expired analyses are excluded from reads. Schedule `SELECT public.delete_expired_ai_analyses();` daily in an approved database scheduler when physical deletion is required.

## 5. Production boundary

Production enablement does not provide authorization. Server-side JWT verification, counsellor/case assignment checks, organisation scope, management-role authorization, rate limiting, and requester audit fields are still required before using identifiable or sensitive counselling data. To stop model calls, set Production `AI_FEATURE_ENABLED=false` and redeploy.
