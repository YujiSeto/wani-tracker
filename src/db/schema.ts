import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Timestamps helper ────────────────────────────────────────────────────────

const tsz = (name: string) => timestamp(name, { withTimezone: true });

// ─── GLOBAL table (shared across all users) ───────────────────────────────────

/**
 * WaniKani subject catalogue — radicals, kanji, vocabulary, kana_vocabulary.
 * This data is the same for every user; it is synced once every 24 h.
 */
export const subjects = pgTable('subjects', {
  id: integer('id').primaryKey(),
  object: text('object').notNull(),            // radical | kanji | vocabulary | kana_vocabulary
  slug: text('slug'),                          // romanized identifier, e.g. "hito"
  characters: text('characters'),              // Japanese characters, e.g. "人"
  level: integer('level').notNull(),
  document_url: text('document_url'),
  data: jsonb('data').notNull(),               // full raw API payload (meanings, readings, …)
  data_updated_at: tsz('data_updated_at'),
  synced_at: tsz('synced_at').defaultNow(),
});

/** Tracks the last time each globally-shared endpoint was synced. */
export const globalSyncLog = pgTable('global_sync_log', {
  endpoint: text('endpoint').primaryKey(),
  last_synced_at: tsz('last_synced_at'),
  total_synced: integer('total_synced').notNull().default(0),
});

// ─── PER-USER tables ──────────────────────────────────────────────────────────

/**
 * Platform user accounts.
 * In Phase 1 there is one row (the admin).
 * In Phase 2 every WaniKani user who logs in gets a row.
 */
export const platformUsers = pgTable('platform_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  wanikani_username: text('wanikani_username').unique().notNull(),
  wanikani_level: integer('wanikani_level').notNull(),
  wanikani_api_token: text('wanikani_api_token').notNull(),
  subscription_active: boolean('subscription_active').notNull().default(false),
  subscription_type: text('subscription_type').notNull().default('free'),
  stripe_customer_id: text('stripe_customer_id'),    // Phase 3
  created_at: tsz('created_at').defaultNow(),
  last_synced_at: tsz('last_synced_at'),
});

/** Stripe subscription state — schema ready for Phase 3. */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => platformUsers.id, { onDelete: 'cascade' }),
  stripe_subscription_id: text('stripe_subscription_id').unique(),
  stripe_customer_id: text('stripe_customer_id'),
  status: text('status').notNull().default('inactive'), // trialing | active | past_due | cancelled
  plan_id: text('plan_id'),
  current_period_end: tsz('current_period_end'),
  created_at: tsz('created_at').defaultNow(),
});

/** SRS assignments — one row per (user, subject). */
export const assignments = pgTable(
  'assignments',
  {
    id: integer('id').notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    subject_id: integer('subject_id').notNull(),
    subject_type: text('subject_type').notNull(),
    srs_stage: integer('srs_stage').notNull().default(0),
    unlocked_at: tsz('unlocked_at'),
    started_at: tsz('started_at'),
    passed_at: tsz('passed_at'),
    burned_at: tsz('burned_at'),
    available_at: tsz('available_at'),
    resurrected_at: tsz('resurrected_at'),
    hidden: boolean('hidden').notNull().default(false),
    data_updated_at: tsz('data_updated_at'),
    synced_at: tsz('synced_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.id] })],
);

/** Per-subject accuracy statistics. */
export const reviewStatistics = pgTable(
  'review_statistics',
  {
    id: integer('id').notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    subject_id: integer('subject_id').notNull(),
    subject_type: text('subject_type').notNull(),
    meaning_correct: integer('meaning_correct').notNull().default(0),
    meaning_incorrect: integer('meaning_incorrect').notNull().default(0),
    reading_correct: integer('reading_correct').notNull().default(0),
    reading_incorrect: integer('reading_incorrect').notNull().default(0),
    meaning_current_streak: integer('meaning_current_streak').notNull().default(0),
    reading_current_streak: integer('reading_current_streak').notNull().default(0),
    meaning_max_streak: integer('meaning_max_streak').notNull().default(0),
    reading_max_streak: integer('reading_max_streak').notNull().default(0),
    percentage_correct: integer('percentage_correct').notNull().default(0),
    hidden: boolean('hidden').notNull().default(false),
    data_updated_at: tsz('data_updated_at'),
    synced_at: tsz('synced_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.id] })],
);

/** History of the user's progression through each WaniKani level. */
export const levelProgressions = pgTable(
  'level_progressions',
  {
    id: integer('id').notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    level: integer('level').notNull(),
    unlocked_at: tsz('unlocked_at'),
    started_at: tsz('started_at'),
    passed_at: tsz('passed_at'),
    completed_at: tsz('completed_at'),
    abandoned_at: tsz('abandoned_at'),
    created_at: tsz('created_at'),
    synced_at: tsz('synced_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.id] })],
);

/** Account reset history. */
export const resets = pgTable(
  'resets',
  {
    id: integer('id').notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    original_level: integer('original_level').notNull(),
    target_level: integer('target_level').notNull(),
    confirmed_at: tsz('confirmed_at'),
    created_at: tsz('created_at'),
    synced_at: tsz('synced_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.id] })],
);

/** User personal notes and meaning synonyms. */
export const studyMaterials = pgTable(
  'study_materials',
  {
    id: integer('id').notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    subject_id: integer('subject_id').notNull(),
    subject_type: text('subject_type').notNull(),
    meaning_note: text('meaning_note'),
    reading_note: text('reading_note'),
    meaning_synonyms: jsonb('meaning_synonyms'),
    hidden: boolean('hidden').notNull().default(false),
    data_updated_at: tsz('data_updated_at'),
    synced_at: tsz('synced_at').defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.id] })],
);

/** Tracks the last sync timestamp per (user, endpoint). */
export const syncLog = pgTable(
  'sync_log',
  {
    user_id: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    last_synced_at: tsz('last_synced_at'),
    total_synced: integer('total_synced').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.endpoint] })],
);

// ─── Inferred types (used across the codebase) ───────────────────────────────

export type Subject = typeof subjects.$inferSelect;
export type PlatformUser = typeof platformUsers.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type ReviewStatistic = typeof reviewStatistics.$inferSelect;
export type LevelProgression = typeof levelProgressions.$inferSelect;
export type Reset = typeof resets.$inferSelect;
export type StudyMaterial = typeof studyMaterials.$inferSelect;
