'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';
import { srsColor, srsLabelKey } from '@/lib/srsUtils';
import type { SubjectItem } from '@/lib/queries';
import type { TranslationKey } from '@/lib/translations';

// ─── Item box ─────────────────────────────────────────────────────────────────

function ItemBox({ item }: { item: SubjectItem }) {
  const { locale } = useLocale();
  const bg = srsColor(item.srs_stage);
  const char = item.characters ?? item.slug ?? '?';
  const label = t(locale, srsLabelKey(item.srs_stage));

  return (
    <a
      href={item.documentUrl ?? '#'}
      target={item.documentUrl ? '_blank' : undefined}
      rel="noopener noreferrer"
      title={`${char} · ${item.primaryMeaning ?? ''} · ${label}`}
      className="group flex flex-col items-center gap-1 transition-transform duration-150 hover:scale-110"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 dark:from-white/10 to-transparent pointer-events-none" />
        <span
          className="relative text-white font-bold leading-none select-none"
          style={{ fontSize: char.length > 3 ? '0.7rem' : char.length > 1 ? '1.1rem' : '1.5rem' }}
        >
          {char}
        </span>
      </div>
      {item.primaryReading && (
        <span className="text-[10px] text-gray-600 dark:text-white/50 font-mono">{item.primaryReading}</span>
      )}
      <span className="text-[10px] text-gray-500 dark:text-white/40 text-center leading-tight max-w-[3.5rem] truncate">
        {item.primaryMeaning}
      </span>
    </a>
  );
}

// ─── Type section ─────────────────────────────────────────────────────────────

function ItemSection({ type, items }: { type: string; items: SubjectItem[] }) {
  const { locale } = useLocale();
  if (items.length === 0) return null;

  type TypeKey = 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary';
  const TYPE_META: Record<TypeKey, { labelKey: TranslationKey; color: string; icon: string }> = {
    radical:         { labelKey: 'levels.radicals',  color: '#0093dd', icon: '🔵' },
    kanji:           { labelKey: 'srs.kanji',         color: '#e32b2b', icon: '🌸' },
    vocabulary:      { labelKey: 'levels.vocab',      color: '#882d9e', icon: '🟣' },
    kana_vocabulary: { labelKey: 'levels.kanaVocab',  color: '#5a2d9e', icon: '🔮' },
  };
  const meta = TYPE_META[type as TypeKey] ?? { labelKey: 'srs.vocab' as TranslationKey, color: '#888', icon: '📦' };

  const unlocked = items.filter((i) => (i.srs_stage ?? -1) > 0).length;
  const passed   = items.filter((i) => (i.srs_stage ?? -1) >= 5).length;

  return (
    <section>
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2" style={{ borderColor: meta.color }}>
        <span className="text-lg">{meta.icon}</span>
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">{t(locale, meta.labelKey)}</h2>
        <span className="text-sm text-gray-500 dark:text-white/40">
          {unlocked}/{items.length} {t(locale, 'levels.unlocked')} · {passed} {t(locale, 'levels.passed').toLowerCase()}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden ml-2">
          <div
            style={{ width: `${items.length ? Math.round((passed / items.length) * 100) : 0}%`, background: meta.color }}
            className="h-full rounded-full"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((item) => <ItemBox key={item.id} item={item} />)}
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  level: number;
  currentLevel: number;
  items: SubjectItem[];
}

export function LevelDetailClient({ level, currentLevel, items }: Props) {
  const { locale } = useLocale();

  const byType = (type: string) => items.filter((i) => i.object === type);
  const totalKanji  = byType('kanji').length;
  const passedKanji = byType('kanji').filter((i) => (i.srs_stage ?? 0) >= 5).length;

  const LEGEND: Array<{ labelKey: TranslationKey; color: string }> = [
    { labelKey: 'srs.locked',      color: '#3a3a3a' },
    { labelKey: 'srs.lesson',      color: '#555' },
    { labelKey: 'srs.apprentice',  color: '#e32b2b' },
    { labelKey: 'srs.guru',        color: '#882d9e' },
    { labelKey: 'srs.master',      color: '#294ddb' },
    { labelKey: 'srs.enlightened', color: '#0093dd' },
    { labelKey: 'srs.burned',      color: '#252525' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white">
              {t(locale, 'levels.level')} {level}
            </h1>
            {level === currentLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {t(locale, 'levels.current')}
              </span>
            )}
            {passedKanji >= totalKanji && totalKanji > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ {t(locale, 'levels.passed')}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-white/40 text-sm">
            {items.length} {t(locale, 'levels.itemsTotal')} · {passedKanji}/{totalKanji} {t(locale, 'levels.kanjiPassed')}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/data/levels"
            className="text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          >
            ← {t(locale, 'levels.allLevels')}
          </Link>
          {level > 1 && (
            <Link
              href={`/data/levels/${level - 1}`}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              ← Lv.{level - 1}
            </Link>
          )}
          <Link
            href={`/data/levels/${level + 1}`}
            className="text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          >
            Lv.{level + 1} →
          </Link>
        </div>
      </div>

      {/* SRS Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {LEGEND.map(({ labelKey, color }) => (
          <span key={labelKey} className="flex items-center gap-1.5 text-gray-600 dark:text-white/50">
            <span className="w-3 h-3 rounded-sm border border-gray-200 dark:border-white/10" style={{ background: color }} />
            {t(locale, labelKey)}
          </span>
        ))}
      </div>

      {/* Sections */}
      <ItemSection type="radical"          items={byType('radical')} />
      <ItemSection type="kanji"            items={byType('kanji')} />
      <ItemSection type="vocabulary"       items={byType('vocabulary')} />
      <ItemSection type="kana_vocabulary"  items={byType('kana_vocabulary')} />
    </div>
  );
}
