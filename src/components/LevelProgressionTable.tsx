'use client';

import { useState } from 'react';
import type { LevelProgressionRow } from '@/lib/queries';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';

interface Props {
  rows: LevelProgressionRow[];
  currentLevel: number;
}

const TOTAL_LEVELS = 60;

function daysBetweenNum(a: Date | string | null, b: Date | string | null): number {
  if (!a) return 0;
  const start = typeof a === 'string' ? new Date(a) : a;
  const end = typeof b === 'string' ? new Date(b) : (b ?? new Date());
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
}

function fmt(d: Date | string | null, localeTag: string): string {
  if (!d) return '—';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  return dateObj.toLocaleDateString(localeTag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns a color and info for a given duration.
 */
function getSpeedInfo(days: number, isPassed: boolean, isCurrent: boolean) {
  if (!isPassed && !isCurrent) return { color: 'transparent', label: 'Locked', bg: 'bg-gray-100 dark:bg-white/5' };

  // Smooth gradient recalibrated around 20 days
  if (days <= 7) return { color: '#f43f5e', bg: 'bg-rose-500' };
  if (days <= 12) return { color: '#fb7185', bg: 'bg-rose-400' };
  if (days <= 16) return { color: '#fb923c', bg: 'bg-orange-400' };
  if (days <= 20) return { color: '#fbbf24', bg: 'bg-amber-400' }; // Pivot point
  if (days <= 28) return { color: '#60a5fa', bg: 'bg-blue-400' };
  if (days <= 40) return { color: '#3b82f6', bg: 'bg-blue-600' };
  if (days <= 60) return { color: '#2563eb', bg: 'bg-blue-700' };
  return { color: '#1e40af', bg: 'bg-indigo-900' };
}

export function LevelProgressionTable({ rows, currentLevel }: Props) {
  const { locale } = useLocale();
  const localeTag = locale === 'ja' ? 'ja-JP' : locale === 'pt' ? 'pt-BR' : 'en-US';
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm opacity-50 italic">{t(locale, 'levels.noData')}</p>;
  }

  // Map rows to a level map for quick access
  const levelMap = new Map<number, LevelProgressionRow>();
  rows.forEach((r) => levelMap.set(r.level, r));

  // Calculate stats
  const passedRows = rows.filter((r) => r.passed_at);
  const avgDays = passedRows.length > 0
    ? Math.round(passedRows.reduce((acc, r) => acc + daysBetweenNum(r.started_at, r.passed_at), 0) / passedRows.length)
    : 0;

  const activeLevelData = hoveredLevel ? levelMap.get(hoveredLevel) : levelMap.get(currentLevel);
  const displayLevel = hoveredLevel ?? currentLevel;
  const isDisplayCurrent = displayLevel === currentLevel;
  
  let displayDays = 0;
  if (activeLevelData) {
    displayDays = daysBetweenNum(activeLevelData.started_at, activeLevelData.passed_at ?? (isDisplayCurrent ? null : activeLevelData.started_at));
  }

  return (
    <div className="space-y-8">
      {/* ── Stats Summary ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-6 items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">
            {t(locale, 'levels.duration')} Avg.
          </p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {avgDays} <span className="text-sm font-normal opacity-50">days / level</span>
          </p>
        </div>
        <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-white/10" />
        
        <div className="flex-1 min-w-[200px] min-h-[80px] flex items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
          {activeLevelData ? (
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-bold text-wk-pink uppercase tracking-tighter">
                  Level {displayLevel} {isDisplayCurrent ? '• ' + t(locale, 'levels.current') : ''}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-white/90">
                  {fmt(activeLevelData.started_at, localeTag)} 
                  {activeLevelData.passed_at ? ` → ${fmt(activeLevelData.passed_at, localeTag)}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {displayDays}d{isDisplayCurrent ? ' ↗' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <p className="text-xs font-bold text-gray-400 dark:text-white/20 uppercase tracking-tighter">Level {displayLevel}</p>
              <p className="text-sm text-gray-400 dark:text-white/30 italic">({t(locale, 'levels.statusLocked')})</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Level Grid (Mosaic) ──────────────────────────────────── */}
      <div className="relative group">
        <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const lv = i + 1;
            const data = levelMap.get(lv);
            const isPassed = !!data?.passed_at;
            const isCurrent = lv === currentLevel;
            
            const durationForColor = data ? daysBetweenNum(data.started_at, data.passed_at) : 0;
            const { bg, color } = getSpeedInfo(durationForColor, isPassed, isCurrent);
            const isHovered = hoveredLevel === lv;

            return (
              <div
                key={lv}
                onMouseEnter={() => setHoveredLevel(lv)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`
                  relative aspect-square rounded-md sm:rounded-lg cursor-help transition-all duration-300
                  ${bg} ${lv <= currentLevel ? 'opacity-100' : 'opacity-20'}
                  ${isCurrent ? 'animate-pulse ring-2 ring-gray-300 dark:ring-white/50 z-20' : ''}
                  ${isHovered ? 'scale-110 z-30 ring-2 ring-gray-400 dark:ring-white shadow-xl brightness-125' : 'hover:scale-105'}
                `}
                style={(isPassed || isCurrent) ? { boxShadow: `0 0 15px ${color}33` } : {}}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-black/50 dark:text-white/80">
                  {lv}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 pt-6 border-t border-gray-200 dark:border-white/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/20">
            {t(locale, 'levels.speed')}
          </span>
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <span className="text-[10px] font-bold uppercase text-rose-500 dark:text-rose-400 shrink-0">
              {t(locale, 'levels.fast')}
            </span>
            <div className="flex h-1.5 flex-1 max-w-[400px] rounded-full overflow-hidden bg-gray-200 dark:bg-white/5">
              <div 
                className="h-full w-full" 
                style={{ 
                  background: 'linear-gradient(90deg, #f43f5e, #fb7185, #fb923c, #fbbf24, #60a5fa, #3b82f6, #2563eb, #1e40af)' 
                }}
              />
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 shrink-0">
              {t(locale, 'levels.slow')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse w-fit sm:ml-4">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/20 ring-2 ring-gray-400 dark:ring-white/50" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/60">
            {t(locale, 'levels.current')}
          </span>
        </div>
      </div>
    </div>
  );
}


