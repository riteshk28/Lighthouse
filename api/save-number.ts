import { neon } from '@neondatabase/serverless';

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  const { value, label } = await req.json();
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    INSERT INTO saved_numbers (value, label) VALUES (${value}, ${label}) RETURNING *
  `;
  return Response.json(result[0]);
}

export const config = { runtime: 'edge' };