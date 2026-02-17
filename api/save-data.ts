import { neon } from '@neondatabase/serverless';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { gridData, labels, metricUnits } = body;

    if (!gridData || !labels || !metricUnits) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO scorecard_state (id, data, updated_at)
      VALUES (1, ${JSON.stringify({ gridData, labels, metricUnits })}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE
        SET data = ${JSON.stringify({ gridData, labels, metricUnits })}::jsonb,
            updated_at = NOW()
    `;

    return Response.json({ ok: true });
  } catch (error) {
    console.error('SAVE error:', error);
    return Response.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

export const config = { runtime: 'edge' };