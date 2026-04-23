/**
 * WaniKani → Supabase sync engine.
 *
 * Server-only module. Never import this in Client Components.
 * All writes go through Drizzle upserts so re-runs are safe (idempotent).
 */

import { db } from '@/db';
import {
  assignments,
  globalSyncLog,
  levelProgressions,
  platformUsers,
  resets as resetsTable,
  reviewStatistics,
  studyMaterials,
  subjects,
  syncLog,
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Re-export so route handlers can import from one place
export { ensureAdminUser };

// ─── Constants ────────────────────────────────────────────────────────────────

const WK_BASE = 'https://api.wanikani.com';
const WK_REVISION = '20170710';
const BATCH_SIZE = 500;
/** Subjects are re-synced at most once every 24 hours. */
const SUBJECT_DEBOUNCE_MS = 24 * 60 * 60 * 1000;

// ─── WaniKani API helpers ─────────────────────────────────────────────────────

function wkHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Wanikani-Revision': WK_REVISION,
  };
}

interface WKPage {
  pages: { next_url: string | null };
  data: unknown[];
}

/**
 * Async generator that yields one page of items at a time.
 * Follows `pages.next_url` until null.
 */
async function* paginate(
  startUrl: string,
  token: string,
): AsyncGenerator<unknown[]> {
  let url: string | null = startUrl;
  while (url) {
    const res = await fetch(url, {
      headers: wkHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`WaniKani API error ${res.status}: ${res.statusText}`);
    }
    const page = (await res.json()) as WKPage;
    yield page.data;
    url = page.pages.next_url;
  }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Safely parse an ISO string to Date, or return null. */
function ts(v: string | null | undefined): Date | null {
  return v ? new Date(v) : null;
}

/** Split an array into chunks of `size`. */
function chunks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ─── Admin user bootstrap ─────────────────────────────────────────────────────

/**
 * Ensures a platform_users row exists for the admin API token.
 * Called at the start of every sync. Returns the user's UUID or null on error.
 */
async function ensureAdminUser(): Promise<string | null> {
  const token = process.env.WANIKANI_API_TOKEN;
  if (!token) return null;

  // Fast path — already exists
  const [existing] = await db
    .select({ id: platformUsers.id })
    .from(platformUsers)
    .where(eq(platformUsers.wanikani_api_token, token))
    .limit(1);
  if (existing) return existing.id;

  // Fetch from WaniKani to get username / level
  const res = await fetch(`${WK_BASE}/v2/user`, {
    headers: wkHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const { data: u } = (await res.json()) as {
    data: {
      username: string;
      level: number;
      subscription: { active: boolean; type: string };
    };
  };

  const [created] = await db
    .insert(platformUsers)
    .values({
      wanikani_username: u.username,
      wanikani_level: u.level,
      wanikani_api_token: token,
      subscription_active: u.subscription.active,
      subscription_type: u.subscription.type,
    })
    .onConflictDoUpdate({
      target: platformUsers.wanikani_username,
      set: {
        wanikani_level: u.level,
        wanikani_api_token: token,
        subscription_active: u.subscription.active,
        subscription_type: u.subscription.type,
      },
    })
    .returning({ id: platformUsers.id });

  return created?.id ?? null;
}

// ─── Sync log helpers ─────────────────────────────────────────────────────────

async function getGlobalSyncedAt(endpoint: string): Promise<Date | null> {
  const [row] = await db
    .select({ last_synced_at: globalSyncLog.last_synced_at })
    .from(globalSyncLog)
    .where(eq(globalSyncLog.endpoint, endpoint))
    .limit(1);
  return row?.last_synced_at ?? null;
}

async function setGlobalSyncedAt(endpoint: string, total: number) {
  await db
    .insert(globalSyncLog)
    .values({ endpoint, last_synced_at: new Date(), total_synced: total })
    .onConflictDoUpdate({
      target: globalSyncLog.endpoint,
      set: {
        last_synced_at: sql`excluded.last_synced_at`,
        total_synced: sql`excluded.total_synced`,
      },
    });
}

async function getUserSyncedAt(
  userId: string,
  endpoint: string,
): Promise<Date | null> {
  const [row] = await db
    .select({ last_synced_at: syncLog.last_synced_at })
    .from(syncLog)
    .where(
      sql`${syncLog.user_id} = ${userId} AND ${syncLog.endpoint} = ${endpoint}`,
    )
    .limit(1);
  return row?.last_synced_at ?? null;
}

async function setUserSyncedAt(
  userId: string,
  endpoint: string,
  total: number,
) {
  await db
    .insert(syncLog)
    .values({ user_id: userId, endpoint, last_synced_at: new Date(), total_synced: total })
    .onConflictDoUpdate({
      target: [syncLog.user_id, syncLog.endpoint],
      set: {
        last_synced_at: sql`excluded.last_synced_at`,
        total_synced: sql`excluded.total_synced`,
      },
    });
}

// ─── Subjects sync (global) ───────────────────────────────────────────────────

type WKSubjectRaw = {
  id: number;
  object: string;
  data_updated_at: string;
  data: {
    level: number;
    slug: string;
    document_url: string;
    characters?: string;
    [key: string]: unknown;
  };
};

export async function syncSubjects(force = false): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const lastSync = await getGlobalSyncedAt('subjects');
  const stale =
    !lastSync ||
    Date.now() - lastSync.getTime() > SUBJECT_DEBOUNCE_MS;

  if (!force && !stale) return 0;

  const updatedAfter =
    !force && lastSync
      ? `?updated_after=${lastSync.toISOString()}`
      : '';

  let total = 0;
  const buffer: (typeof subjects.$inferInsert)[] = [];

  const flush = async () => {
    for (const chunk of chunks(buffer, BATCH_SIZE)) {
      await db
        .insert(subjects)
        .values(chunk)
        .onConflictDoUpdate({
          target: subjects.id,
          set: {
            object: sql`excluded.object`,
            slug: sql`excluded.slug`,
            characters: sql`excluded.characters`,
            level: sql`excluded.level`,
            document_url: sql`excluded.document_url`,
            data: sql`excluded.data`,
            data_updated_at: sql`excluded.data_updated_at`,
            synced_at: sql`now()`,
          },
        });
    }
    buffer.length = 0;
  };

  for await (const page of paginate(
    `${WK_BASE}/v2/subjects${updatedAfter}`,
    token,
  )) {
    for (const raw of page as WKSubjectRaw[]) {
      buffer.push({
        id: raw.id,
        object: raw.object,
        slug: raw.data.slug ?? null,
        characters: raw.data.characters ?? null,
        level: raw.data.level,
        document_url: raw.data.document_url ?? null,
        data: raw.data,
        data_updated_at: ts(raw.data_updated_at),
      });
      total++;
    }
    if (buffer.length >= BATCH_SIZE) await flush();
  }
  if (buffer.length > 0) await flush();

  await setGlobalSyncedAt('subjects', total);
  return total;
}

// ─── Assignments sync ─────────────────────────────────────────────────────────

type WKAssignmentRaw = {
  id: number;
  data_updated_at: string;
  data: {
    subject_id: number;
    subject_type: string;
    srs_stage: number;
    unlocked_at: string | null;
    started_at: string | null;
    passed_at: string | null;
    burned_at: string | null;
    available_at: string | null;
    resurrected_at: string | null;
    hidden: boolean;
  };
};

export async function syncAssignments(
  userId: string,
  incremental = true,
): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const lastSync = incremental
    ? await getUserSyncedAt(userId, 'assignments')
    : null;

  const qs = lastSync
    ? `?updated_after=${lastSync.toISOString()}`
    : '';

  let total = 0;
  const buffer: (typeof assignments.$inferInsert)[] = [];

  const flush = async () => {
    for (const chunk of chunks(buffer, BATCH_SIZE)) {
      await db
        .insert(assignments)
        .values(chunk)
        .onConflictDoUpdate({
          target: [assignments.user_id, assignments.id],
          set: {
            srs_stage: sql`excluded.srs_stage`,
            unlocked_at: sql`excluded.unlocked_at`,
            started_at: sql`excluded.started_at`,
            passed_at: sql`excluded.passed_at`,
            burned_at: sql`excluded.burned_at`,
            available_at: sql`excluded.available_at`,
            resurrected_at: sql`excluded.resurrected_at`,
            hidden: sql`excluded.hidden`,
            data_updated_at: sql`excluded.data_updated_at`,
            synced_at: sql`now()`,
          },
        });
    }
    buffer.length = 0;
  };

  for await (const page of paginate(
    `${WK_BASE}/v2/assignments${qs}`,
    token,
  )) {
    for (const raw of page as WKAssignmentRaw[]) {
      buffer.push({
        id: raw.id,
        user_id: userId,
        subject_id: raw.data.subject_id,
        subject_type: raw.data.subject_type,
        srs_stage: raw.data.srs_stage,
        unlocked_at: ts(raw.data.unlocked_at),
        started_at: ts(raw.data.started_at),
        passed_at: ts(raw.data.passed_at),
        burned_at: ts(raw.data.burned_at),
        available_at: ts(raw.data.available_at),
        resurrected_at: ts(raw.data.resurrected_at),
        hidden: raw.data.hidden,
        data_updated_at: ts(raw.data_updated_at),
      });
      total++;
    }
    if (buffer.length >= BATCH_SIZE) await flush();
  }
  if (buffer.length > 0) await flush();

  await setUserSyncedAt(userId, 'assignments', total);
  return total;
}

// ─── Review statistics sync ───────────────────────────────────────────────────

type WKReviewStatRaw = {
  id: number;
  data_updated_at: string;
  data: {
    subject_id: number;
    subject_type: string;
    meaning_correct: number;
    meaning_incorrect: number;
    reading_correct: number;
    reading_incorrect: number;
    meaning_current_streak: number;
    reading_current_streak: number;
    meaning_max_streak: number;
    reading_max_streak: number;
    percentage_correct: number;
    hidden: boolean;
  };
};

export async function syncReviewStatistics(
  userId: string,
  incremental = true,
): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const lastSync = incremental
    ? await getUserSyncedAt(userId, 'review_statistics')
    : null;

  const qs = lastSync
    ? `?updated_after=${lastSync.toISOString()}`
    : '';

  let total = 0;
  const buffer: (typeof reviewStatistics.$inferInsert)[] = [];

  const flush = async () => {
    for (const chunk of chunks(buffer, BATCH_SIZE)) {
      await db
        .insert(reviewStatistics)
        .values(chunk)
        .onConflictDoUpdate({
          target: [reviewStatistics.user_id, reviewStatistics.id],
          set: {
            meaning_correct: sql`excluded.meaning_correct`,
            meaning_incorrect: sql`excluded.meaning_incorrect`,
            reading_correct: sql`excluded.reading_correct`,
            reading_incorrect: sql`excluded.reading_incorrect`,
            meaning_current_streak: sql`excluded.meaning_current_streak`,
            reading_current_streak: sql`excluded.reading_current_streak`,
            meaning_max_streak: sql`excluded.meaning_max_streak`,
            reading_max_streak: sql`excluded.reading_max_streak`,
            percentage_correct: sql`excluded.percentage_correct`,
            hidden: sql`excluded.hidden`,
            data_updated_at: sql`excluded.data_updated_at`,
            synced_at: sql`now()`,
          },
        });
    }
    buffer.length = 0;
  };

  for await (const page of paginate(
    `${WK_BASE}/v2/review_statistics${qs}`,
    token,
  )) {
    for (const raw of page as WKReviewStatRaw[]) {
      const d = raw.data;
      buffer.push({
        id: raw.id,
        user_id: userId,
        subject_id: d.subject_id,
        subject_type: d.subject_type,
        meaning_correct: d.meaning_correct,
        meaning_incorrect: d.meaning_incorrect,
        reading_correct: d.reading_correct,
        reading_incorrect: d.reading_incorrect,
        meaning_current_streak: d.meaning_current_streak,
        reading_current_streak: d.reading_current_streak,
        meaning_max_streak: d.meaning_max_streak,
        reading_max_streak: d.reading_max_streak,
        percentage_correct: d.percentage_correct,
        hidden: d.hidden,
        data_updated_at: ts(raw.data_updated_at),
      });
      total++;
    }
    if (buffer.length >= BATCH_SIZE) await flush();
  }
  if (buffer.length > 0) await flush();

  await setUserSyncedAt(userId, 'review_statistics', total);
  return total;
}

// ─── Level progressions sync (small, always full) ─────────────────────────────

type WKLevelProgressionRaw = {
  id: number;
  data: {
    level: number;
    unlocked_at: string | null;
    started_at: string | null;
    passed_at: string | null;
    completed_at: string | null;
    abandoned_at: string | null;
    created_at: string | null;
  };
};

export async function syncLevelProgressions(userId: string): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const rows: (typeof levelProgressions.$inferInsert)[] = [];

  for await (const page of paginate(
    `${WK_BASE}/v2/level_progressions`,
    token,
  )) {
    for (const raw of page as WKLevelProgressionRaw[]) {
      const d = raw.data;
      rows.push({
        id: raw.id,
        user_id: userId,
        level: d.level,
        unlocked_at: ts(d.unlocked_at),
        started_at: ts(d.started_at),
        passed_at: ts(d.passed_at),
        completed_at: ts(d.completed_at),
        abandoned_at: ts(d.abandoned_at),
        created_at: ts(d.created_at),
      });
    }
  }

  if (rows.length > 0) {
    for (const chunk of chunks(rows, BATCH_SIZE)) {
      await db
        .insert(levelProgressions)
        .values(chunk)
        .onConflictDoUpdate({
          target: [levelProgressions.user_id, levelProgressions.id],
          set: {
            level: sql`excluded.level`,
            unlocked_at: sql`excluded.unlocked_at`,
            started_at: sql`excluded.started_at`,
            passed_at: sql`excluded.passed_at`,
            completed_at: sql`excluded.completed_at`,
            abandoned_at: sql`excluded.abandoned_at`,
            synced_at: sql`now()`,
          },
        });
    }
  }

  await setUserSyncedAt(userId, 'level_progressions', rows.length);
  return rows.length;
}

// ─── Resets sync (small, always full) ────────────────────────────────────────

type WKResetRaw = {
  id: number;
  data: {
    original_level: number;
    target_level: number;
    confirmed_at: string | null;
    created_at: string | null;
  };
};

export async function syncResets(userId: string): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const rows: (typeof resetsTable.$inferInsert)[] = [];

  for await (const page of paginate(`${WK_BASE}/v2/resets`, token)) {
    for (const raw of page as WKResetRaw[]) {
      const d = raw.data;
      rows.push({
        id: raw.id,
        user_id: userId,
        original_level: d.original_level,
        target_level: d.target_level,
        confirmed_at: ts(d.confirmed_at),
        created_at: ts(d.created_at),
      });
    }
  }

  if (rows.length > 0) {
    for (const chunk of chunks(rows, BATCH_SIZE)) {
      await db
        .insert(resetsTable)
        .values(chunk)
        .onConflictDoUpdate({
          target: [resetsTable.user_id, resetsTable.id],
          set: {
            original_level: sql`excluded.original_level`,
            target_level: sql`excluded.target_level`,
            confirmed_at: sql`excluded.confirmed_at`,
            synced_at: sql`now()`,
          },
        });
    }
  }

  await setUserSyncedAt(userId, 'resets', rows.length);
  return rows.length;
}

// ─── Study materials sync ─────────────────────────────────────────────────────

type WKStudyMaterialRaw = {
  id: number;
  data_updated_at: string;
  data: {
    subject_id: number;
    subject_type: string;
    meaning_note: string | null;
    reading_note: string | null;
    meaning_synonyms: string[];
    hidden: boolean;
  };
};

export async function syncStudyMaterials(
  userId: string,
  incremental = true,
): Promise<number> {
  const token = process.env.WANIKANI_API_TOKEN!;
  const lastSync = incremental
    ? await getUserSyncedAt(userId, 'study_materials')
    : null;

  const qs = lastSync
    ? `?updated_after=${lastSync.toISOString()}`
    : '';

  let total = 0;
  const buffer: (typeof studyMaterials.$inferInsert)[] = [];

  const flush = async () => {
    for (const chunk of chunks(buffer, BATCH_SIZE)) {
      await db
        .insert(studyMaterials)
        .values(chunk)
        .onConflictDoUpdate({
          target: [studyMaterials.user_id, studyMaterials.id],
          set: {
            meaning_note: sql`excluded.meaning_note`,
            reading_note: sql`excluded.reading_note`,
            meaning_synonyms: sql`excluded.meaning_synonyms`,
            hidden: sql`excluded.hidden`,
            data_updated_at: sql`excluded.data_updated_at`,
            synced_at: sql`now()`,
          },
        });
    }
    buffer.length = 0;
  };

  for await (const page of paginate(
    `${WK_BASE}/v2/study_materials${qs}`,
    token,
  )) {
    for (const raw of page as WKStudyMaterialRaw[]) {
      const d = raw.data;
      buffer.push({
        id: raw.id,
        user_id: userId,
        subject_id: d.subject_id,
        subject_type: d.subject_type,
        meaning_note: d.meaning_note,
        reading_note: d.reading_note,
        meaning_synonyms: d.meaning_synonyms,
        hidden: d.hidden,
        data_updated_at: ts(raw.data_updated_at),
      });
      total++;
    }
    if (buffer.length >= BATCH_SIZE) await flush();
  }
  if (buffer.length > 0) await flush();

  await setUserSyncedAt(userId, 'study_materials', total);
  return total;
}

// ─── Orchestrators ────────────────────────────────────────────────────────────

/** Full sync: pages through all data, ignoring the last-sync timestamps. */
export async function runFullSync(): Promise<Record<string, number>> {
  const userId = await ensureAdminUser();
  if (!userId) throw new Error('No WANIKANI_API_TOKEN set or token is invalid.');

  const [subjectsN, assignmentsN, reviewStatsN, levelsN, resetsN, studyN] =
    await Promise.all([
      // Subjects can be done in parallel with per-user data
      syncSubjects(true),
      syncAssignments(userId, false),
      syncReviewStatistics(userId, false),
      syncLevelProgressions(userId),
      syncResets(userId),
      syncStudyMaterials(userId, false),
    ]);

  // Update the platform_users.last_synced_at
  await db
    .update(platformUsers)
    .set({ last_synced_at: new Date() })
    .where(eq(platformUsers.id, userId));

  return {
    subjects: subjectsN,
    assignments: assignmentsN,
    review_statistics: reviewStatsN,
    level_progressions: levelsN,
    resets: resetsN,
    study_materials: studyN,
  };
}

/** Incremental sync: uses updated_after for fast delta updates. */
export async function runIncrementalSync(): Promise<Record<string, number>> {
  const userId = await ensureAdminUser();
  if (!userId) throw new Error('No WANIKANI_API_TOKEN set or token is invalid.');

  const [subjectsN, assignmentsN, reviewStatsN, levelsN, resetsN, studyN] =
    await Promise.all([
      syncSubjects(false),            // respects 24h debounce
      syncAssignments(userId, true),
      syncReviewStatistics(userId, true),
      syncLevelProgressions(userId),  // small, always full
      syncResets(userId),            // small, always full
      syncStudyMaterials(userId, true),
    ]);

  await db
    .update(platformUsers)
    .set({ last_synced_at: new Date() })
    .where(eq(platformUsers.id, userId));

  return {
    subjects: subjectsN,
    assignments: assignmentsN,
    review_statistics: reviewStatsN,
    level_progressions: levelsN,
    resets: resetsN,
    study_materials: studyN,
  };
}
