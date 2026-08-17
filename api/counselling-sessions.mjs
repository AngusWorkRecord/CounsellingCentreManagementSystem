import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return response.status(500).json({
        success: false,
        message: 'DATABASE_URL is not configured',
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    if (request.method === 'GET') {
      const rows = await sql`
        SELECT *
        FROM public.get_all_counselling_sessions()
      `;

      return response.status(200).json({
        success: true,
        count: rows.length,
        data: rows,
      });
    }

    const body = request.body || {};
    const requiredFields = [
      'submissionId',
      'counsellingDate',
      'counsellor',
      'sessionMode',
      'caseCategory',
      'sessionStart',
      'sessionEnd',
      'clientInitials',
      'caseNumber',
    ];
    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === ''
    );

    if (missingFields.length > 0) {
      return response.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const amount = body.amountReceivedRm === '' || body.amountReceivedRm == null
      ? 0
      : Number(body.amountReceivedRm);

    if (!Number.isFinite(amount) || amount < 0) {
      return response.status(400).json({
        success: false,
        message: 'amountReceivedRm must be a non-negative number',
      });
    }

    const rows = await sql`
      SELECT *
      FROM public.create_counselling_session(
        ${body.submissionId}::varchar,
        ${body.respondentId || null}::varchar,
        ${body.counsellingDate}::date,
        ${body.counsellor}::varchar,
        ${body.sessionMode}::varchar,
        ${body.caseCategory}::varchar,
        ${body.sessionStart}::time,
        ${body.sessionEnd}::time,
        ${body.clientInitials}::varchar,
        ${body.clientPhone || null}::varchar,
        ${body.clientSummary || null}::text,
        ${body.volunteerActions || null}::text,
        ${body.caseNumber}::varchar,
        ${body.reportUrl || null}::text,
        ${amount}::numeric
      )
    `;

    return response.status(201).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);

    if (error?.code === '23505') {
      return response.status(409).json({
        success: false,
        message: 'Submission ID already exists',
      });
    }

    if (error?.code === '22023' || error?.code === '22P02') {
      return response.status(400).json({
        success: false,
        message: error.message || 'Invalid counselling session data',
      });
    }

    return response.status(500).json({
      success: false,
      message: 'Failed to process counselling session',
    });
  }
}
