import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
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
    const rows = await sql`
      SELECT *
      FROM public.get_all_counselling_sessions()
    `;

    return response.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Database error:', error);

    return response.status(500).json({
      success: false,
      message: 'Failed to retrieve counselling sessions',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
