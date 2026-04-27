'use client';

import Link from 'next/link';

import { useLocale } from './LocaleProvider';
import { DashboardCard } from './DashboardCard';
import { ErrorCard } from './ErrorCard';
import { SRSBars } from './SRSBars';
import { LevelProgressionTable } from './LevelProgressionTable';
import { t } from '@/lib/translations';
import {
  isFetchError,
  countAvailable,
  type WaniKaniUser,
  type WaniKaniSummary,
  type FetchError,
} from '@/lib/wanikani';
import type {
  SRSMatrix,
  SubjectCounts,
  LevelProgressionRow,
  ResetRow,
} from '@/lib/queries';

interface DashboardClientProps {
  userResult: WaniKaniUser | FetchError;
  summaryResult: WaniKaniSummary | FetchError;
  // DB data
  syncRequired: boolean;
  srsMatrix: SRSMatrix | null;
  subjectCounts: SubjectCounts | null;
  levelProgressions: LevelProgressionRow[];
  resets: ResetRow[];
  studyMaterialsCount: number;
}

export function DashboardClient({
  userResult,
  summaryResult,
  syncRequired,
  srsMatrix,
  subjectCounts,
  levelProgressions,
  resets,
  studyMaterialsCount,
}: DashboardClientProps) {
  const { locale } = useLocale();

  // ── User error ──────────────────────────────────────────────────────────────
  if (isFetchError(userResult)) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
          {t(locale, 'dash.title')}
        </h1>
        <ErrorCard
          title={t(locale, 'error.title')}
          message={
            userResult.type === 'no_token'
              ? t(locale, 'error.noToken')
              : t(locale, 'error.fetchFailed')
          }
          hint={t(locale, 'error.retry')}
        />
      </div>
    );
  }

  const user = userResult.data;
  const summaryData = !isFetchError(summaryResult) ? summaryResult.data : null;
  const lessonsCount = summaryData ? countAvailable(summaryData.lessons) : 0;
  const reviewsCount = summaryData ? countAvailable(summaryData.reviews) : 0;

  return (
    <div className="space-y-12">
      {/* Page heading & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {t(locale, 'dash.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t(locale, 'dash.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            ← {t(locale, 'dash.backHome')}
          </Link>
          <Link
            href="/data/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            🔍 {t(locale, 'search.title')}
          </Link>
          <Link
            href="/data/ia"
            target="_blank"
            rel="noopener noreferrer"
            id="view-ai-page-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wk-purple text-white text-sm font-bold hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            🤖 {t(locale, 'dash.viewAI')}
          </Link>
        </div>
      </div>

      {/* Sync required banner */}
      {syncRequired && (
        <div
          role="alert"
          className="flex items-start gap-3 px-5 py-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 text-sm"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">{t(locale, 'sync.notSynced')}</p>
            <code className="text-xs opacity-70 mt-1 block">
              curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; /api/sync/full
            </code>
          </div>
        </div>
      )}

      {/* ── User cards ────────────────────────────────────────────────────────── */}
      <section aria-label="User information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            label={t(locale, 'dash.username')}
            value={user.username}
            icon="👤"
            accent="pink"
          />
          <DashboardCard
            label={t(locale, 'dash.level')}
            value={user.level}
            icon="🎌"
            accent="blue"
            description="WaniKani Level"
          />
          <DashboardCard
            label={t(locale, 'dash.subscription')}
            value={
              user.subscription.active
                ? t(locale, 'dash.subscription.active')
                : t(locale, 'dash.subscription.inactive')
            }
            icon={user.subscription.active ? '✅' : '❌'}
            accent={user.subscription.active ? 'green' : 'gray'}
            description={user.subscription.type}
          />
        </div>
      </section>

      {/* ── Study queue ───────────────────────────────────────────────────────── */}
      <section aria-label="Study statistics">
        {isFetchError(summaryResult) ? (
          <ErrorCard
            title={t(locale, 'error.title')}
            message={
              summaryResult.type === 'no_token'
                ? t(locale, 'error.noToken')
                : t(locale, 'error.fetchFailed')
            }
            hint={t(locale, 'error.retry')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DashboardCard
              label={t(locale, 'dash.lessons')}
              value={lessonsCount}
              icon="📚"
              accent="purple"
            />
            <DashboardCard
              label={t(locale, 'dash.reviews')}
              value={reviewsCount}
              icon="🔁"
              accent="gold"
            />
          </div>
        )}
      </section>

      {/* ── SRS Distribution ──────────────────────────────────────────────────── */}
      <section aria-label="SRS distribution">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {t(locale, 'srs.title')}
        </h2>
        {srsMatrix ? (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-6">
            <SRSBars matrix={srsMatrix} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            {t(locale, 'srs.noData')}
          </p>
        )}
      </section>

      {/* ── Subject Library ───────────────────────────────────────────────────── */}
      {subjectCounts && subjectCounts.total > 0 && (
        <section aria-label="Subject library">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {t(locale, 'subjects.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {(
              [
                { key: 'radical', label: t(locale, 'subjects.radical'), color: '#0093dd', icon: '🔵' },
                { key: 'kanji', label: t(locale, 'subjects.kanji'), color: '#e32b2b', icon: '🌸' },
                { key: 'vocabulary', label: t(locale, 'subjects.vocab'), color: '#882d9e', icon: '🟣' },
                { key: 'kana_vocabulary', label: t(locale, 'subjects.kanaVocab'), color: '#5a2d9e', icon: '🔮' },
              ] as const
            ).map(({ key, label, color, icon }) => (
              <div
                key={key}
                className="rounded-xl p-4 text-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div
                  className="text-2xl font-black font-mono tabular-nums"
                  style={{ color }}
                >
                  {subjectCounts[key].toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
            <div className="rounded-xl p-4 text-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-2xl font-black font-mono tabular-nums text-gray-700 dark:text-gray-200">
                {subjectCounts.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t(locale, 'subjects.total')}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Level Progression ─────────────────────────────────────────────────── */}
      <section aria-label="Level progression history">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t(locale, 'levels.title')}
          </h2>
          <Link
            href="/data/search"
            className="text-sm text-wk-pink hover:underline"
          >
            🔍 {t(locale, 'search.title')}
          </Link>
        </div>
        <LevelProgressionTable
          rows={levelProgressions}
          currentLevel={user.level}
        />
      </section>

      {/* ── Account details ───────────────────────────────────────────────────── */}
      <section aria-label="Account details">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            label={t(locale, 'notes.title')}
            value={studyMaterialsCount}
            icon="📝"
            accent="blue"
            description={t(locale, 'notes.count')}
          />
          <DashboardCard
            label={t(locale, 'resets.title')}
            value={resets.length}
            icon="🔄"
            accent={resets.length > 0 ? 'gold' : 'green'}
            description={resets.length === 0 ? t(locale, 'resets.none') : undefined}
          />
          <DashboardCard
            label="Vacation"
            value={user.current_vacation_started_at ? '🏖️ Active' : 'Inactive'}
            icon="📅"
            accent={user.current_vacation_started_at ? 'gold' : 'gray'}
          />
        </div>
      </section>

    </div>
  );
}
