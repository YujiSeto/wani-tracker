'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

function fmt(d: Date | string | null, localeTag: string): string {
  if (!d) return '—';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  return dateObj.toLocaleDateString(localeTag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ResultCard({ r }: { r: SubjectSearchResult }) {
  const { locale } = useLocale();
  const localeTag = locale === 'ja' ? 'ja-JP' : locale === 'pt' ? 'pt-BR' : 'en-US';
  const srsStage = r.srs_stage;
  const srsColorHex = srsColor(srsStage);
  const srsLabel = t(locale, srsLabelKey(srsStage));
  const typeColor = TYPE_COLORS[r.object] ?? '#999';

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-4 sm:p-6 flex gap-3 sm:gap-5 items-start transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-white/20">
      {/* Character — vertical writing mode stacks multi-char words naturally */}
      <div
        className="font-black shrink-0 text-center text-3xl sm:text-4xl"
        style={{
          color: typeColor,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          minHeight: '2.5rem',
        }}
      >
        {r.characters ?? r.slug ?? '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-white"
            style={{ background: typeColor }}
          >
            {r.object.replace('_', ' ')}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t(locale, 'search.level')} {r.level}
          </span>
          {r.slug && r.slug !== r.characters && (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-mono">
              {r.slug}
            </span>
          )}
        </div>
        {r.primaryMeaning && (
          <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
            {r.primaryMeaning}
          </p>
        )}

        {/* SRS stage / not started + WK link always stacked */}
        <div className="mt-2 sm:mt-3 flex flex-col gap-2">
          {srsStage !== null ? (
            <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold text-white text-[10px] w-fit"
                style={{ background: srsColorHex }}
              >
                ⬛ {srsLabel}
              </span>
              {r.started_at && (
                <span className="text-gray-500 dark:text-gray-400">
                  {t(locale, 'search.started')}: {fmt(r.started_at, localeTag)}
                </span>
              )}
              {r.passed_at && (
                <span className="text-gray-500 dark:text-gray-400">
                  {t(locale, 'search.passed')}: {fmt(r.passed_at, localeTag)}
                </span>
              )}
              {r.burned_at && (
                <span className="text-gray-500 dark:text-gray-400">
                  {t(locale, 'search.burned')}: {fmt(r.burned_at, localeTag)}
                </span>
              )}
              {r.available_at && !r.burned_at && (
                <span className="text-gray-500 dark:text-gray-400">
                  {t(locale, 'search.nextReview')}: {fmt(r.available_at, localeTag)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 italic">
              {t(locale, 'search.notStarted')}
            </span>
          )}

          {/* WK link always on its own line */}
          {r.document_url && (
            <a
              href={r.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-wk-pink hover:underline w-fit"
            >
              {t(locale, 'search.viewOnWK')}
            </a>
          )}
        </div>
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
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
          {t(locale, 'search.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          {t(locale, 'search.subtitle')}
        </p>
      </div>

      {/* Search form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const query = formData.get('q') as string;
          router.push(`/data/search?q=${encodeURIComponent(query)}`);
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          id="search-input"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t(locale, 'search.placeholder')}
          autoFocus
          className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wk-pink/50 text-base sm:text-lg"
        />
        <button
          type="submit"
          id="search-submit-btn"
          className="px-6 py-2.5 sm:py-3 rounded-xl bg-wk-pink text-white font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
