'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';
import type { LevelProgress } from '@/lib/queries';

interface Props {
  levels: LevelProgress[];
  currentLevel: number;
}

function pct(p: number, total: number) {
  return total === 0 ? 0 : Math.round((p / total) * 100);
}

function levelStatus(l: LevelProgress, currentLevel: number, locale: ReturnType<typeof useLocale>['locale']) {
  if (l.kanji.total > 0 && l.kanji.passed >= l.kanji.total)
    return { labelKey: 'levels.passed' as const, color: '#10b981' };
  if (l.level === currentLevel)
    return { labelKey: 'levels.current' as const, color: '#0093dd' };
  if (l.kanji.unlocked > 0)
    return { labelKey: 'levels.inProgress' as const, color: '#882d9e' };
  return { labelKey: 'levels.statusLocked' as const, color: '#555' };
}

function MiniBar({ value, total, color }: { value: number; total: number; color: string }) {
  const p = pct(value, total);
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div style={{ width: `${p}%`, background: color }} className="h-full rounded-full transition-all duration-500" />
      </div>
      <span className="font-mono tabular-nums text-gray-500 dark:text-white/40 w-14 text-right text-[10px]">
        {value}/{total}
      </span>
    </div>
  );
}

function LevelCard({ l, currentLevel }: { l: LevelProgress; currentLevel: number }) {
  const { locale } = useLocale();
  const status = levelStatus(l, currentLevel, locale);
  const isCurrent = l.level === currentLevel;

  return (
    <Link
      href={`/data/levels/${l.level}`}
      className={`group block rounded-2xl border p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-black/30 ${
        isCurrent ? 'border-sky-500/50 bg-sky-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl font-black text-gray-900 dark:text-white">{l.level}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: status.color }}
        >
          {t(locale, status.labelKey)}
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-[10px] text-gray-500 dark:text-white/30 mb-0.5">{t(locale, 'levels.radicals')}</p>
          <MiniBar value={l.radical.passed} total={l.radical.total} color="#0093dd" />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 dark:text-white/30 mb-0.5">{t(locale, 'srs.kanji')}</p>
          <MiniBar value={l.kanji.passed} total={l.kanji.total} color="#e32b2b" />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 dark:text-white/30 mb-0.5">{t(locale, 'levels.vocab')}</p>
          <MiniBar value={l.vocab.passed} total={l.vocab.total} color="#882d9e" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 text-[10px] text-gray-500 dark:text-white/30 flex justify-between">
        <span>🔥 {l.kanji.burned} {t(locale, 'levels.burnedCount')}</span>
        <span className="group-hover:text-wk-pink transition-colors">
          {t(locale, 'levels.view')} →
        </span>
      </div>
    </Link>
  );
}

export function LevelsClient({ levels, currentLevel }: Props) {
  const { locale } = useLocale();

  const LEGEND = [
    { labelKey: 'levels.passed' as const,      color: '#10b981' },
    { labelKey: 'levels.current' as const,     color: '#0093dd' },
    { labelKey: 'levels.inProgress' as const,  color: '#882d9e' },
    { labelKey: 'levels.statusLocked' as const,color: '#555' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">{t(locale, 'levels.allLevels')}</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm">
            {levels.length} {t(locale, 'levels.level').toLowerCase()} ·{' '}
            {t(locale, 'levels.current')}: <strong className="text-sky-400">Lv.{currentLevel}</strong>
          </p>
        </div>
        <Link href="/data" className="text-sm text-gray-500 dark:text-white/40 hover:text-wk-pink dark:hover:text-wk-pink transition-colors">
          ← {t(locale, 'dash.backHome')}
        </Link>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {LEGEND.map(({ labelKey, color }) => (
          <span key={labelKey} className="flex items-center gap-1.5 text-gray-600 dark:text-white/50">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {t(locale, labelKey)}
          </span>
        ))}
        <span className="text-gray-400 dark:text-white/25 ml-2">· {t(locale, 'levels.bars')}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {levels.map((l) => (
          <LevelCard key={l.level} l={l} currentLevel={currentLevel} />
        ))}
      </div>
    </div>
  );
}
