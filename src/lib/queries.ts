/**
 * Server-side DB query helpers.
 * All functions read from Supabase via Drizzle. Never import in Client Components.
 */

import { db } from '@/db';
import {
  assignments,
  levelProgressions,
  platformUsers,
  resets,
  studyMaterials,
  subjects,
} from '@/db/schema';
import { and, eq, ilike, or, sql } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SRSStageData {
  radical: number;
  kanji: number;
  vocabulary: number; // vocabulary + kana_vocabulary combined
  total: number;
}

export interface SRSMatrix {
  apprentice: SRSStageData;  // srs_stage 1–4
  guru: SRSStageData;        // srs_stage 5–6
  master: SRSStageData;      // srs_stage 7
  enlightened: SRSStageData; // srs_stage 8
  burned: SRSStageData;      // srs_stage 9
  totals: SRSStageData;
}

export interface SubjectCounts {
  radical: number;
  kanji: number;
  vocabulary: number;
  kana_vocabulary: number;
  total: number;
}

export interface SubjectSearchResult {
  id: number;
  object: string;
  slug: string | null;
  characters: string | null;
  level: number;
  document_url: string | null;
  srs_stage: number | null;
  started_at: Date | null;
  passed_at: Date | null;
  burned_at: Date | null;
  available_at: Date | null;
  primaryMeaning: string | null;
}

export type LevelProgressionRow = typeof levelProgressions.$inferSelect;
export type ResetRow = typeof resets.$inferSelect;

// ─── Admin user lookup ────────────────────────────────────────────────────────

/** Returns the platform_users row for the admin API token, or null if not synced. */
export async function getAdminUser() {
  const token = process.env.WANIKANI_API_TOKEN;
  if (!token) return null;

  const [user] = await db
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.wanikani_api_token, token))
    .limit(1);

  return user ?? null;
}

// ─── SRS Matrix ───────────────────────────────────────────────────────────────

function emptyStage(): SRSStageData {
  return { radical: 0, kanji: 0, vocabulary: 0, total: 0 };
}

function stageGroup(
  stage: number,
): keyof Omit<SRSMatrix, 'totals'> | null {
  if (stage >= 1 && stage <= 4) return 'apprentice';
  if (stage === 5 || stage === 6) return 'guru';
  if (stage === 7) return 'master';
  if (stage === 8) return 'enlightened';
  if (stage === 9) return 'burned';
  return null;
}

function normalizeType(t: string): 'radical' | 'kanji' | 'vocabulary' {
  if (t === 'radical') return 'radical';
  if (t === 'kanji') return 'kanji';
  return 'vocabulary'; // vocabulary + kana_vocabulary
}

/** Builds the full SRS matrix from the assignments table. Single DB query. */
export async function getSRSMatrix(userId: string): Promise<SRSMatrix> {
  const rows = await db
    .select({
      subject_type: assignments.subject_type,
      srs_stage: assignments.srs_stage,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.user_id, userId),
        eq(assignments.hidden, false),
        sql`${assignments.srs_stage} > 0`,
      ),
    )
    .groupBy(assignments.subject_type, assignments.srs_stage);

  const matrix: SRSMatrix = {
    apprentice: emptyStage(),
    guru: emptyStage(),
    master: emptyStage(),
    enlightened: emptyStage(),
    burned: emptyStage(),
    totals: emptyStage(),
  };

  for (const row of rows) {
    const group = stageGroup(row.srs_stage);
    if (!group) continue;
    const type = normalizeType(row.subject_type);
    matrix[group][type] += row.count;
    matrix[group].total += row.count;
    matrix.totals[type] += row.count;
    matrix.totals.total += row.count;
  }

  return matrix;
}

// ─── Subject counts ───────────────────────────────────────────────────────────

/** Counts of all subjects in the library by type. */
export async function getSubjectCounts(): Promise<SubjectCounts> {
  const rows = await db
    .select({
      object: subjects.object,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(subjects)
    .groupBy(subjects.object);

  const counts: SubjectCounts = {
    radical: 0,
    kanji: 0,
    vocabulary: 0,
    kana_vocabulary: 0,
    total: 0,
  };

  for (const row of rows) {
    const key = row.object as keyof Omit<SubjectCounts, 'total'>;
    if (key in counts) {
      counts[key] = row.count;
      counts.total += row.count;
    }
  }

  return counts;
}

// ─── Level progressions ───────────────────────────────────────────────────────

export async function getLevelProgressions(
  userId: string,
): Promise<LevelProgressionRow[]> {
  return db
    .select()
    .from(levelProgressions)
    .where(eq(levelProgressions.user_id, userId))
    .orderBy(levelProgressions.level);
}

// ─── Resets ───────────────────────────────────────────────────────────────────

export async function getResets(userId: string): Promise<ResetRow[]> {
  return db
    .select()
    .from(resets)
    .where(eq(resets.user_id, userId))
    .orderBy(resets.created_at);
}

// ─── Study materials count ────────────────────────────────────────────────────

export async function getStudyMaterialsCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(studyMaterials)
    .where(
      and(eq(studyMaterials.user_id, userId), eq(studyMaterials.hidden, false)),
    );
  return row?.count ?? 0;
}

// ─── Subject search ───────────────────────────────────────────────────────────

/**
 * Minimal romaji → hiragana converter using a greedy syllabic parser.
 * Consumes the longest matching romaji token at each position so that
 * e.g. "hito" correctly becomes "ひと" rather than "hいtお".
 * Handles standard Hepburn romanization for WaniKani reading searches.
 */
const ROMAJI_TO_HIRAGANA_TABLE: Record<string, string> = Object.assign(Object.create(null), {
  // 3-char digraphs first (longest match wins)
  shi:'し', chi:'ち', tsu:'つ', sha:'しゃ', shu:'しゅ', sho:'しょ',
  cha:'ちゃ', chu:'ちゅ', cho:'ちょ', tchi:'っち',
  kya:'きゃ', kyu:'きゅ', kyo:'きょ',
  nya:'にゃ', nyu:'にゅ', nyo:'にょ',
  mya:'みゃ', myu:'みゅ', myo:'みょ',
  rya:'りゃ', ryu:'りゅ', ryo:'りょ',
  hya:'ひゃ', hyu:'ひゅ', hyo:'ひょ',
  bya:'びゃ', byu:'びゅ', byo:'びょ',
  pya:'ぴゃ', pyu:'ぴゅ', pyo:'ぴょ',
  // 2-char syllables
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ',
  sa:'さ', si:'し', su:'す', se:'せ', so:'そ',
  ta:'た', ti:'ち', te:'て', to:'と',
  na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ',
  ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ',
  ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wi:'ゐ', we:'ゑ', wo:'を',
  ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  da:'だ', di:'ぢ', du:'づ', de:'で', do:'ど',
  ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご',
  za:'ざ', zi:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  ja:'じゃ', ji:'じ', ju:'じゅ', jo:'じょ',
  // single vowels
  a:'あ', i:'い', u:'う', e:'え', o:'お',
  // n
  n:'ん',
});

function romajiToHiragana(str: string): string {
  const s = str.toLowerCase();
  let result = '';
  let pos = 0;
  while (pos < s.length) {
    // Try longest match first (4, 3, 2, 1)
    let matched = false;
    for (const len of [4, 3, 2, 1]) {
      const token = s.slice(pos, pos + len);
      const match = ROMAJI_TO_HIRAGANA_TABLE[token];
      if (typeof match === 'string') {
        // For bare 'n': don't consume if followed by a vowel or 'y' (it's part of a syllable)
        if (token === 'n' && pos + 1 < s.length && /[aeiouy]/.test(s[pos + 1])) break;
        result += match;
        pos += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Double consonant → っ (e.g. kk, tt, pp, ss)
      if (pos + 1 < s.length && s[pos] === s[pos + 1] && /[ktsphbdgzcrm]/.test(s[pos])) {
        result += 'っ';
        pos++;
      } else {
        result += s[pos];
        pos++;
      }
    }
  }
  return result;
}


/**
 * Searches subjects by:
 *   - slug (romanized English for radicals, e.g. "person", "water")
 *   - characters (Japanese, e.g. "人", "水道")
 *   - meaning inside data JSONB (covers synonyms)
 *   - reading inside data JSONB in hiragana (romaji query converted first)
 *
 * Results are ordered: kanji first, then vocabulary/kana_vocabulary, then radical.
 * This prevents the LIMIT from being filled entirely by radicals (which have lower IDs).
 */
export async function searchSubjects(
  query: string,
  userId: string,
): Promise<SubjectSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Convert romaji input to hiragana to support reading-based searches (e.g. "hito" → "ひと")
  const hiragana = romajiToHiragana(trimmed);
  const readingPattern = '%' + hiragana + '%';

  // Priority sort: kanji=1, vocabulary/kana_vocabulary=2, radical=3
  const typePriority = sql<number>`
    case ${subjects.object}
      when 'kanji'          then 1
      when 'vocabulary'     then 2
      when 'kana_vocabulary'then 2
      else 3
    end`;

  const primaryMeaningSql = sql<string | null>`(
    SELECT m->>'meaning'
    FROM jsonb_array_elements(${subjects.data}->'meanings') m
    WHERE (m->>'primary')::boolean
    LIMIT 1
  )`;

  const rows = await db
    .select({
      id: subjects.id,
      object: subjects.object,
      slug: subjects.slug,
      characters: subjects.characters,
      level: subjects.level,
      document_url: subjects.document_url,
      primaryMeaning: primaryMeaningSql,
      srs_stage: assignments.srs_stage,
      started_at: assignments.started_at,
      passed_at: assignments.passed_at,
      burned_at: assignments.burned_at,
      available_at: assignments.available_at,
    })
    .from(subjects)
    .leftJoin(
      assignments,
      and(
        eq(assignments.subject_id, subjects.id),
        eq(assignments.user_id, userId),
      ),
    )
    .where(
      or(
        ilike(subjects.slug, `%${trimmed}%`),
        ilike(subjects.characters, `%${trimmed}%`),
        // Search meanings inside JSONB data
        sql`exists (
          select 1 from jsonb_array_elements(${subjects.data}->'meanings') m
          where m->>'meaning' ilike ${'%' + trimmed + '%'}
        )`,
        // Search readings inside JSONB data (romaji converted to hiragana)
        sql`exists (
          select 1 from jsonb_array_elements(${subjects.data}->'readings') r
          where r->>'reading' ilike ${readingPattern}
        )`,
      ),
    )
    .orderBy(typePriority, subjects.level, subjects.id)
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    object: r.object,
    slug: r.slug,
    characters: r.characters,
    level: r.level,
    document_url: r.document_url,
    srs_stage: r.srs_stage ?? null,
    started_at: r.started_at ?? null,
    passed_at: r.passed_at ?? null,
    burned_at: r.burned_at ?? null,
    available_at: r.available_at ?? null,
    primaryMeaning: r.primaryMeaning,
  }));
}

// ─── Level overview (all levels) ─────────────────────────────────────────────

export interface TypeProgress {
  total: number;
  unlocked: number;
  passed: number;
  burned: number;
}

export interface LevelProgress {
  level: number;
  radical: TypeProgress;
  kanji: TypeProgress;
  vocab: TypeProgress;
}

export async function getAllLevelsProgress(userId: string): Promise<LevelProgress[]> {
  const rows = await db
    .select({
      level: subjects.level,
      object: subjects.object,
      total:    sql<number>`cast(count(*) as int)`,
      unlocked: sql<number>`cast(count(case when ${assignments.srs_stage} >= 1 then 1 end) as int)`,
      passed:   sql<number>`cast(count(case when ${assignments.srs_stage} >= 5 then 1 end) as int)`,
      burned:   sql<number>`cast(count(case when ${assignments.srs_stage} = 9  then 1 end) as int)`,
    })
    .from(subjects)
    .leftJoin(
      assignments,
      and(eq(assignments.subject_id, subjects.id), eq(assignments.user_id, userId)),
    )
    .groupBy(subjects.level, subjects.object)
    .orderBy(subjects.level);

  const empty = (): TypeProgress => ({ total: 0, unlocked: 0, passed: 0, burned: 0 });
  const map = new Map<number, LevelProgress>();

  for (const row of rows) {
    if (!map.has(row.level)) {
      map.set(row.level, { level: row.level, radical: empty(), kanji: empty(), vocab: empty() });
    }
    const l = map.get(row.level)!;
    const p: TypeProgress = { total: row.total, unlocked: row.unlocked, passed: row.passed, burned: row.burned };
    if (row.object === 'radical') l.radical = p;
    else if (row.object === 'kanji') l.kanji = p;
    else { l.vocab.total += p.total; l.vocab.unlocked += p.unlocked; l.vocab.passed += p.passed; l.vocab.burned += p.burned; }
  }

  return Array.from(map.values()).sort((a, b) => a.level - b.level);
}

// ─── Subject detail (one level) ───────────────────────────────────────────────

export interface SubjectItem {
  id: number;
  object: string;
  characters: string | null;
  slug: string | null;
  level: number;
  documentUrl: string | null;
  primaryMeaning: string | null;
  primaryReading: string | null;
  srs_stage: number | null;
}

export async function getSubjectsByLevel(level: number, userId: string): Promise<SubjectItem[]> {
  const primaryMeaningSql = sql<string | null>`(
    SELECT m->>'meaning'
    FROM jsonb_array_elements(${subjects.data}->'meanings') m
    WHERE (m->>'primary')::boolean
    LIMIT 1
  )`;

  const primaryReadingSql = sql<string | null>`(
    SELECT r->>'reading'
    FROM jsonb_array_elements(${subjects.data}->'readings') r
    WHERE (r->>'primary')::boolean
    LIMIT 1
  )`;

  const rows = await db
    .select({
      id: subjects.id,
      object: subjects.object,
      characters: subjects.characters,
      slug: subjects.slug,
      level: subjects.level,
      document_url: subjects.document_url,
      primaryMeaning: primaryMeaningSql,
      primaryReading: primaryReadingSql,
      srs_stage: assignments.srs_stage,
    })
    .from(subjects)
    .leftJoin(
      assignments,
      and(eq(assignments.subject_id, subjects.id), eq(assignments.user_id, userId)),
    )
    .where(eq(subjects.level, level))
    .orderBy(subjects.object, subjects.id);

  return rows.map((r) => ({
    id: r.id,
    object: r.object,
    characters: r.characters,
    slug: r.slug,
    level: r.level,
    documentUrl: r.document_url,
    primaryMeaning: r.primaryMeaning,
    primaryReading: r.primaryReading,
    srs_stage: r.srs_stage ?? null,
  }));
}

// ─── AI Export (Burned items) ────────────────────────────────────────────────

export interface BurnedItem {
  id: number;
  object: string;
  level: number;
  slug: string | null;
  characters: string | null;
  primary_meaning: string | null;
  primary_reading: string | null;
  burned_at: Date | null;
}

export async function getBurnedItems(userId: string): Promise<BurnedItem[]> {
  const primaryMeaningSql = sql<string | null>`(
    SELECT m->>'meaning'
    FROM jsonb_array_elements(${subjects.data}->'meanings') m
    WHERE (m->>'primary')::boolean
    LIMIT 1
  )`;

  const primaryReadingSql = sql<string | null>`(
    SELECT r->>'reading'
    FROM jsonb_array_elements(${subjects.data}->'readings') r
    WHERE (r->>'primary')::boolean
    LIMIT 1
  )`;

  const rows = await db
    .select({
      id: subjects.id,
      object: subjects.object,
      level: subjects.level,
      slug: subjects.slug,
      characters: subjects.characters,
      primary_meaning: primaryMeaningSql,
      primary_reading: primaryReadingSql,
      burned_at: assignments.burned_at,
    })
    .from(assignments)
    .innerJoin(subjects, eq(assignments.subject_id, subjects.id))
    .where(
      and(
        eq(assignments.user_id, userId),
        eq(assignments.srs_stage, 9),
        eq(assignments.hidden, false)
      )
    )
    .orderBy(subjects.level, subjects.object, subjects.id);

  return rows.map((r) => ({
    id: r.id,
    object: r.object,
    level: r.level,
    slug: r.slug,
    characters: r.characters,
    primary_meaning: r.primary_meaning,
    primary_reading: r.primary_reading,
    burned_at: r.burned_at ?? null,
  }));
}
