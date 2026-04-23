'use client';

import type { SRSMatrix } from '@/lib/queries';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';

interface Props {
  matrix: SRSMatrix;
}

const STAGES = [
  {
    key: 'apprentice' as const,
    color: '#e32b2b',
    bg: 'rgba(227,43,43,0.12)',
    labelKey: 'srs.apprentice',
  },
  {
    key: 'guru' as const,
    color: '#882d9e',
    bg: 'rgba(136,45,158,0.12)',
    labelKey: 'srs.guru',
  },
  {
    key: 'master' as const,
    color: '#294ddb',
    bg: 'rgba(41,77,219,0.12)',
    labelKey: 'srs.master',
  },
  {
    key: 'enlightened' as const,
    color: '#0093dd',
    bg: 'rgba(0,147,221,0.12)',
    labelKey: 'srs.enlightened',
  },
  {
    key: 'burned' as const,
    color: '#444',
    bg: 'rgba(68,68,68,0.12)',
    labelKey: 'srs.burned',
  },
] as const;

const TYPE_KEYS = [
  { key: 'radical' as const, labelKey: 'srs.radical' },
  { key: 'kanji' as const, labelKey: 'srs.kanji' },
  { key: 'vocabulary' as const, labelKey: 'srs.vocab' },
] as const;

// Fixed locale prevents SSR/client hydration mismatch:
// toLocaleString() without args uses system locale on server (en-US)
// but browser locale on client (e.g. pt-BR → "1.071" vs "1,071")
function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export function SRSBars({ matrix }: Props) {
  const { locale } = useLocale();
  const grand = matrix.totals.total || 1; // avoid divide-by-zero

  return (
    <div className="w-full overflow-x-auto">
      {/* Header row */}
      <div className="grid grid-cols-[160px_1fr_1fr_1fr_80px] gap-2 mb-2 px-2 text-xs font-semibold uppercase tracking-wider opacity-50">
        <span />
        <span className="text-center">{t(locale, 'srs.radical')}</span>
        <span className="text-center">{t(locale, 'srs.kanji')}</span>
        <span className="text-center">{t(locale, 'srs.vocab')}</span>
        <span className="text-right">{t(locale, 'srs.total')}</span>
      </div>

      {STAGES.map(({ key, color, bg, labelKey }) => {
        const row = matrix[key];
        const pct = Math.round((row.total / grand) * 100);
        return (
          <div
            key={key}
            className="grid grid-cols-[160px_1fr_1fr_1fr_80px] gap-2 items-center mb-1"
          >
            {/* Stage label + bar */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: color }}
              />
              <span className="text-sm font-medium">{t(locale, labelKey)}</span>
            </div>

            {/* Per-type counts */}
            {TYPE_KEYS.map(({ key: typeKey }) => (
              <div
                key={typeKey}
                className="text-center text-sm font-mono tabular-nums py-1 rounded"
                style={{ background: row[typeKey] > 0 ? bg : 'transparent' }}
              >
                {row[typeKey] > 0 ? fmt(row[typeKey]) : '—'}
              </div>
            ))}

            {/* Row total */}
            <div
              className="text-right text-sm font-bold font-mono tabular-nums pr-2"
              style={{ color }}
            >
              {fmt(row.total)}
            </div>
          </div>
        );
      })}

      {/* Totals row */}
      <div className="grid grid-cols-[160px_1fr_1fr_1fr_80px] gap-2 items-center mt-3 pt-3 border-t border-white/10 dark:border-white/10">
        <span className="text-sm font-semibold opacity-70">
          {t(locale, 'srs.total')}
        </span>
        {TYPE_KEYS.map(({ key: typeKey }) => (
          <div
            key={typeKey}
            className="text-center text-sm font-bold font-mono tabular-nums"
          >
            {fmt(matrix.totals[typeKey])}
          </div>
        ))}
        <div className="text-right text-sm font-bold font-mono tabular-nums pr-2">
          {fmt(matrix.totals.total)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden mt-4 gap-px">
        {STAGES.map(({ key, color }) => {
          const pct = (matrix[key].total / grand) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease' }}
            />
          );
        })}
      </div>
    </div>
  );
}
