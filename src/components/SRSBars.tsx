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
    bg: 'rgba(227,43,43,0.15)',
    labelKey: 'srs.apprentice',
  },
  {
    key: 'guru' as const,
    color: '#882d9e',
    bg: 'rgba(136,45,158,0.15)',
    labelKey: 'srs.guru',
  },
  {
    key: 'master' as const,
    color: '#294ddb',
    bg: 'rgba(41,77,219,0.15)',
    labelKey: 'srs.master',
  },
  {
    key: 'enlightened' as const,
    color: '#0093dd',
    bg: 'rgba(0,147,221,0.15)',
    labelKey: 'srs.enlightened',
  },
  {
    key: 'burned' as const,
    color: '#888',
    bg: 'rgba(136,136,136,0.12)',
    labelKey: 'srs.burned',
  },
] as const;

const TYPE_KEYS = [
  { key: 'radical' as const, labelKey: 'srs.radical' },
  { key: 'kanji' as const, labelKey: 'srs.kanji' },
  { key: 'vocabulary' as const, labelKey: 'srs.vocab' },
] as const;

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export function SRSBars({ matrix }: Props) {
  const { locale } = useLocale();
  const grand = matrix.totals.total || 1;

  return (
    <div className="w-full space-y-4">
      {/* ── Mobile: stacked cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {STAGES.map(({ key, color, bg, labelKey }) => {
          const row = matrix[key];
          if (row.total === 0) return null;
          const pct = Math.round((row.total / grand) * 100);
          return (
            <div
              key={key}
              className="rounded-xl p-4 border border-white/10"
              style={{ background: bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ background: color }}
                  />
                  <span className="text-sm font-semibold">{t(locale, labelKey)}</span>
                </div>
                <span
                  className="text-lg font-black font-mono tabular-nums"
                  style={{ color }}
                >
                  {fmt(row.total)}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500">
                {TYPE_KEYS.map(({ key: tk, labelKey: lk }) =>
                  row[tk] > 0 ? (
                    <span key={tk}>
                      <span className="opacity-60">{t(locale, lk)}</span>{' '}
                      <span className="font-mono font-semibold text-white/70">{fmt(row[tk])}</span>
                    </span>
                  ) : null,
                )}
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table layout ──────────────────────────────── */}
      <div className="hidden md:block w-full">
        {/* Header */}
        <div className="grid grid-cols-[180px_1fr_1fr_1fr_90px] gap-2 mb-2 px-2 text-xs font-semibold uppercase tracking-wider opacity-50">
          <span />
          <span className="text-center">{t(locale, 'srs.radical')}</span>
          <span className="text-center">{t(locale, 'srs.kanji')}</span>
          <span className="text-center">{t(locale, 'srs.vocab')}</span>
          <span className="text-right">{t(locale, 'srs.total')}</span>
        </div>

        {STAGES.map(({ key, color, bg, labelKey }) => {
          const row = matrix[key];
          return (
            <div
              key={key}
              className="grid grid-cols-[180px_1fr_1fr_1fr_90px] gap-2 items-center mb-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm shrink-0"
                  style={{ background: color }}
                />
                <span className="text-sm font-medium">{t(locale, labelKey)}</span>
              </div>

              {TYPE_KEYS.map(({ key: typeKey }) => (
                <div
                  key={typeKey}
                  className="text-center text-sm font-mono tabular-nums py-1 rounded"
                  style={{ background: row[typeKey] > 0 ? bg : 'transparent' }}
                >
                  {row[typeKey] > 0 ? fmt(row[typeKey]) : '—'}
                </div>
              ))}

              <div
                className="text-right text-sm font-bold font-mono tabular-nums pr-2"
                style={{ color }}
              >
                {fmt(row.total)}
              </div>
            </div>
          );
        })}

        {/* Totals */}
        <div className="grid grid-cols-[180px_1fr_1fr_1fr_90px] gap-2 items-center mt-3 pt-3 border-t border-white/10">
          <span className="text-sm font-semibold opacity-70">{t(locale, 'srs.total')}</span>
          {TYPE_KEYS.map(({ key: typeKey }) => (
            <div key={typeKey} className="text-center text-sm font-bold font-mono tabular-nums">
              {fmt(matrix.totals[typeKey])}
            </div>
          ))}
          <div className="text-right text-sm font-bold font-mono tabular-nums pr-2">
            {fmt(matrix.totals.total)}
          </div>
        </div>
      </div>

      {/* ── Progress bar (both) ────────────────────────────────── */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
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
