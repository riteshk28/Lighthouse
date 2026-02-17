import { neon } from '@neondatabase/serverless';

export default async function handler(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT data FROM scorecard_state ORDER BY updated_at DESC LIMIT 1`;
    if (rows.length === 0) return Response.json({});
    return Response.json(rows[0].data);
  } catch (error) {
    console.error('GET error:', error);
    return Response.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export const config = { runtime: 'edge' };