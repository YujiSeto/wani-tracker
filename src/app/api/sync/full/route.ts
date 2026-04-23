import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { runFullSync } from '@/lib/sync';

// Full sync can take 2+ minutes for >9000 subjects
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/sync/full
 * One-time full sync route. Run this manually after first deploy.
 *
 * Trigger locally:
 *   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/sync/full
 *
 * Trigger on Vercel:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/sync/full
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runFullSync();
    return NextResponse.json({ ok: true, synced: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
