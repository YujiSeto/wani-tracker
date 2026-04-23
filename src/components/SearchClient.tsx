'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';
import { srsColor, srsLabelKey } from '@/lib/srsUtils';
import type { SubjectSearchResult } from '@/lib/queries';

const TYPE_COLORS: Record<string, string> = {
  radical: '#0093dd',
  kanji: '#e32b2b',
  vocabulary: '#882d9e',
  kana_vocabulary: '#5a2d9e',
};

function fmt(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ResultCard({ r }: { r: SubjectSearchResult }) {
  const { locale } = useLocale();
  const srsStage = r.srs_stage;
  const srsColorHex = srsColor(srsStage);
  const srsLabel = t(locale, srsLabelKey(srsStage));
  const typeColor = TYPE_COLORS[r.object] ?? '#999';

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-6 flex gap-5 items-start transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-white/20">
      {/* Character */}
      <div
        className="text-5xl font-black leading-none flex-shrink-0 w-16 text-center"
        style={{ color: typeColor }}
      >
        {r.characters ?? r.slug ?? '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: typeColor }}
          >
            {r.object.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t(locale, 'search.level')} {r.level}
          </span>
          {r.slug && r.slug !== r.characters && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {r.slug}
            </span>
          )}
        </div>
        {r.primaryMeaning && (
          <p className="font-semibold text-gray-900 dark:text-white text-lg">
            {r.primaryMeaning}
          </p>
        )}

        {/* SRS stage */}
        {srsStage !== null ? (
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-white text-xs"
              style={{ background: srsColorHex }}
            >
              ⬛ {srsLabel}
            </span>
            {r.started_at && (
              <span className="text-gray-500 dark:text-gray-400">
                {t(locale, 'search.started')}: {fmt(r.started_at)}
              </span>
            )}
            {r.passed_at && (
              <span className="text-gray-500 dark:text-gray-400">
                {t(locale, 'search.passed')}: {fmt(r.passed_at)}
              </span>
            )}
            {r.burned_at && (
              <span className="text-gray-500 dark:text-gray-400">
                {t(locale, 'search.burned')}: {fmt(r.burned_at)}
              </span>
            )}
            {r.available_at && !r.burned_at && (
              <span className="text-gray-500 dark:text-gray-400">
                {t(locale, 'search.nextReview')}: {fmt(r.available_at)}
              </span>
            )}
          </div>
        ) : (
          <span className="mt-2 inline-block text-xs text-gray-400 dark:text-gray-500 italic">
            {t(locale, 'search.notStarted')}
          </span>
        )}

        {/* WK link */}
        {r.document_url && (
          <a
            href={r.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-wk-pink hover:underline"
          >
            {t(locale, 'search.viewOnWK')}
          </a>
        )}
      </div>
    </div>
  );
}

interface Props {
  q: string;
  results: SubjectSearchResult[];
  hasAdmin: boolean;
}

export function SearchClient({ q, results, hasAdmin }: Props) {
  const { locale } = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          {t(locale, 'search.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t(locale, 'search.subtitle')}
        </p>
      </div>

      {/* Search form */}
      <form method="GET" className="flex gap-3">
        <input
          id="search-input"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t(locale, 'search.placeholder')}
          autoFocus
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wk-pink/50 text-lg"
        />
        <button
          type="submit"
          id="search-submit-btn"
          className="px-6 py-3 rounded-xl bg-wk-pink text-white font-bold hover:opacity-90 transition-opacity"
        >
          {t(locale, 'search.button')}
        </button>
      </form>

      {/* Results */}
      {q && (
        <div>
          {results.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
              {t(locale, 'search.noResults')}
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                {locale === 'ja' ? (
                  <>{results.length} {t(locale, 'search.resultsFor')}</>
                ) : (
                  <>{results.length} {t(locale, 'search.resultsFor')} &ldquo;{q}&rdquo;</>
                )}
              </p>
              <div className="space-y-3">
                {results.map((r) => (
                  <ResultCard key={`${r.object}-${r.id}`} r={r} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* No DB yet */}
      {!hasAdmin && (
        <div
          role="alert"
          className="px-5 py-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 text-sm"
        >
          {t(locale, 'search.dbNotSynced')}
        </div>
      )}

      {/* Back link */}
      <Link
        href="/data"
        className="inline-block text-sm text-gray-500 dark:text-gray-400 hover:text-wk-pink transition-colors"
      >
        ← {t(locale, 'dash.backHome')}
      </Link>
    </div>
  );
}
