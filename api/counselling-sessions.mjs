import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        {
          success: false,
          message: 'DATABASE_URL is not configured',
        },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT *
      FROM public.get_all_counselling_sessions()
    `;

    return Response.json(
      {
        success: true,
        count: rows.length,
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);

    return Response.json(
      {
        success: false,
        message: 'Failed to retrieve counselling sessions',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
