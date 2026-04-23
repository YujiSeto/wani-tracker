import type { Metadata } from 'next';
import Link from 'next/link';
import {
  fetchUser,
  fetchSummary,
  isFetchError,
  countAvailable,
} from '@/lib/wanikani';
import { getAdminUser, getBurnedItems } from '@/lib/queries';

// ─── SEO — tell crawlers not to index this utility page ──────────────────────

export const metadata: Metadata = {
  title: 'WaniTracker — AI Data Export',
  description:
    'Machine-readable WaniKani study data export. Structured for AI agents and automated parsing.',
  robots: { index: false, follow: false },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Minimalist, semantic-HTML page for AI agents.
 * No Tailwind decorative classes — structure and readability are the priority.
 */
export default async function AIPage() {
  const [userResult, summaryResult, adminUser] = await Promise.all([
    fetchUser(),
    fetchSummary(),
    getAdminUser(),
  ]);

  const burnedItems = adminUser ? await getBurnedItems(adminUser.id) : [];

  const user = !isFetchError(userResult) ? userResult.data : null;
  const summary = !isFetchError(summaryResult) ? summaryResult.data : null;

  const lessonsCount = summary ? countAvailable(summary.lessons) : null;
  const reviewsCount = summary ? countAvailable(summary.reviews) : null;

  // Clean JSON payload for the <pre> block
  const exportPayload = {
    generated_at: new Date().toISOString(),
    source: 'WaniKani V2 API',
    cache_revalidation_seconds: 60,
    user: user
      ? {
          username: user.username,
          level: user.level,
          subscription_active: user.subscription.active,
          subscription_type: user.subscription.type,
          subscription_max_level: user.subscription.max_level_granted,
        }
      : {
          error:
            isFetchError(userResult)
              ? userResult.message
              : 'Unknown error',
        },
    study_summary: summary
      ? {
          available_lessons: lessonsCount,
          pending_reviews: reviewsCount,
          next_reviews_at: summary.next_reviews_at,
        }
      : {
          error:
            isFetchError(summaryResult)
              ? summaryResult.message
              : 'Unknown error',
        },
    burned_items: burnedItems,
  };

  return (
    <div
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '1rem 1.5rem',
        lineHeight: '1.7',
        color: 'inherit',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
          WaniTracker — AI Data Export
        </h1>
        <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.5rem' }}>
          This page is optimised for AI agents and automated parsing. It
          contains raw WaniKani API data in structured semantic HTML and JSON.
          Data is cached and revalidated every 60 seconds.
        </p>
        <nav aria-label="Page navigation" style={{ fontSize: '0.875rem' }}>
          <Link href="/data" style={{ color: '#e8006f' }}>
            ← Back to Dashboard
          </Link>
          {' · '}
          <Link href="/" style={{ color: '#9b4dca' }}>
            Home
          </Link>
        </nav>
        <hr style={{ margin: '1rem 0' }} />
      </header>

      <main>
        {/* ── User data ────────────────────────────────────────────────────── */}
        <section aria-label="User data">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            User Data
          </h2>
          {user ? (
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.25rem 1rem', fontSize: '0.875rem' }}>
              <dt><strong>Username</strong></dt>
              <dd>{user.username}</dd>

              <dt><strong>Level</strong></dt>
              <dd>{user.level}</dd>

              <dt><strong>Subscription Active</strong></dt>
              <dd>{user.subscription.active ? 'Yes' : 'No'}</dd>

              <dt><strong>Subscription Type</strong></dt>
              <dd>{user.subscription.type}</dd>

              <dt><strong>Max Level Granted</strong></dt>
              <dd>{user.subscription.max_level_granted}</dd>
            </dl>
          ) : (
            <p style={{ color: '#c00', fontSize: '0.875rem' }}>
              <strong>Error loading user data:</strong>{' '}
              {isFetchError(userResult) ? userResult.message : 'Unknown error'}
            </p>
          )}
        </section>

        <hr style={{ margin: '1rem 0' }} />

        {/* ── Study summary ────────────────────────────────────────────────── */}
        <section aria-label="Study summary">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Study Summary
          </h2>
          {summary ? (
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.25rem 1rem', fontSize: '0.875rem' }}>
              <dt><strong>Available Lessons</strong></dt>
              <dd>{lessonsCount}</dd>

              <dt><strong>Pending Reviews</strong></dt>
              <dd>{reviewsCount}</dd>

              <dt><strong>Next Reviews At</strong></dt>
              <dd>{summary.next_reviews_at ?? 'No upcoming reviews'}</dd>
            </dl>
          ) : (
            <p style={{ color: '#c00', fontSize: '0.875rem' }}>
              <strong>Error loading study summary:</strong>{' '}
              {isFetchError(summaryResult) ? summaryResult.message : 'Unknown error'}
            </p>
          )}
        </section>

        <hr style={{ margin: '1rem 0' }} />

        {/* ── Raw JSON export ──────────────────────────────────────────────── */}
        <section aria-label="Raw JSON export">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Raw JSON Export
          </h2>
          <pre
            aria-label="JSON data"
            style={{
              background: 'rgba(128,128,128,0.08)',
              border: '1px solid rgba(128,128,128,0.2)',
              borderRadius: '6px',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '0.8rem',
              lineHeight: '1.5',
            }}
          >
            <code>{JSON.stringify(exportPayload, null, 2)}</code>
          </pre>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer>
        <hr style={{ margin: '1rem 0' }} />
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          Generated by WaniTracker · Source: WaniKani V2 API ·{' '}
          Cache revalidates every 60 s
        </p>
      </footer>
    </div>
  );
}
