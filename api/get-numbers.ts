import { neon } from '@neondatabase/serverless';

export default async function handler(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM saved_numbers ORDER BY created_at DESC`;
  return Response.json(rows);
}

export const config = { runtime: 'edge' };