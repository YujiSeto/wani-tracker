import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { runFullSync } from '@/lib/sync';
import { getSubjectCounts } from '@/lib/queries';

// Full sync can take 2+ minutes for >9000 subjects
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/sync/full
 * One-time full sync route. Run this manually after first deploy.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  // Safety check: if subjects already exist, refuse to run full sync unless ?force=true
  try {
    const counts = await getSubjectCounts();
    if (counts.total > 0 && !force) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Full sync already performed. Use /api/sync for incremental updates to save bandwidth. To override, use ?force=true',
        },
        { status: 400 }
      );
    }
  } catch (err) {
    // If table doesn't exist yet, it's fine, proceed with sync
  }

  try {
    const result = await runFullSync();
    return NextResponse.json({ ok: true, synced: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
