import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { runIncrementalSync } from '@/lib/sync';

// Allow up to 60 s on Vercel (incremental syncs are fast)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * GET /api/sync
 * Protected Vercel Cron route — fires every 5 minutes.
 * Vercel automatically passes the CRON_SECRET as a Bearer token.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runIncrementalSync();
    return NextResponse.json({ ok: true, synced: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
