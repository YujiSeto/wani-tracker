// This module must only be imported in Server Components or Route Handlers.
// It reads process.env.WANIKANI_API_TOKEN which is never exposed to the browser.

const WANIKANI_BASE = 'https://api.wanikani.com';
const WANIKANI_REVISION = '20170710';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WaniKaniUser {
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    id: number;
    username: string;
    level: number;
    profile_url: string;
    started_at: string;
    current_vacation_started_at: string | null;
    subscription: {
      active: boolean;
      type: string;
      max_level_granted: number;
      period_ends_at: string | null;
    };
  };
}

export interface WaniKaniSummaryItem {
  available_at: string;
  subject_ids: number[];
}

export interface WaniKaniSummary {
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    lessons: WaniKaniSummaryItem[];
    next_reviews_at: string | null;
    reviews: WaniKaniSummaryItem[];
  };
}

export interface FetchError {
  type: 'no_token' | 'fetch_failed';
  message: string;
}

// ─── Type guard ───────────────────────────────────────────────────────────────

export function isFetchError(value: unknown): value is FetchError {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const t = (value as { type: unknown }).type;
  return t === 'no_token' || t === 'fetch_failed';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Wanikani-Revision': WANIKANI_REVISION,
  };
}

/**
 * Counts subjects that are available right now (available_at <= current time).
 */
export function countAvailable(items: WaniKaniSummaryItem[]): number {
  const now = new Date();
  return items
    .filter((item) => new Date(item.available_at) <= now)
    .reduce((sum, item) => sum + item.subject_ids.length, 0);
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

export async function fetchUser(): Promise<WaniKaniUser | FetchError> {
  const token = process.env.WANIKANI_API_TOKEN;
  if (!token) {
    return { type: 'no_token', message: 'WANIKANI_API_TOKEN is not set.' };
  }

  try {
    const res = await fetch(`${WANIKANI_BASE}/v2/user`, {
      headers: buildHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        type: 'fetch_failed',
        message: `WaniKani API returned ${res.status} ${res.statusText}`,
      };
    }

    return (await res.json()) as WaniKaniUser;
  } catch (err) {
    return {
      type: 'fetch_failed',
      message: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}

export async function fetchSummary(): Promise<WaniKaniSummary | FetchError> {
  const token = process.env.WANIKANI_API_TOKEN;
  if (!token) {
    return { type: 'no_token', message: 'WANIKANI_API_TOKEN is not set.' };
  }

  try {
    const res = await fetch(`${WANIKANI_BASE}/v2/summary`, {
      headers: buildHeaders(token),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        type: 'fetch_failed',
        message: `WaniKani API returned ${res.status} ${res.statusText}`,
      };
    }

    return (await res.json()) as WaniKaniSummary;
  } catch (err) {
    return {
      type: 'fetch_failed',
      message: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}
