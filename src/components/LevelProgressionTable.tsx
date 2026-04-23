'use client';

import type { LevelProgressionRow } from '@/lib/queries';
import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/translations';

interface Props {
  rows: LevelProgressionRow[];
  currentLevel: number;
}

function daysBetween(a: Date | null, b: Date | null): string {
  if (!a) return '—';
  const end = b ?? new Date();
  const d = Math.floor((end.getTime() - a.getTime()) / 86_400_000);
  return `${d}d`;
}

function fmt(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusBadge(row: LevelProgressionRow, currentLevel: number) {
  if (row.abandoned_at)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">
        Abandoned
      </span>
    );
  if (row.passed_at)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
        ✓ Passed
      </span>
    );
  if (row.level === currentLevel)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
        Current
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">
      Locked
    </span>
  );
}

export function LevelProgressionTable({ rows, currentLevel }: Props) {
  const { locale } = useLocale();

  if (rows.length === 0) {
    return (
      <p className="text-sm opacity-50 italic">{t(locale, 'levels.noData')}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 font-semibold opacity-60 w-16">
              {t(locale, 'levels.level')}
            </th>
            <th className="px-4 py-3 font-semibold opacity-60">
              {t(locale, 'levels.started')}
            </th>
            <th className="px-4 py-3 font-semibold opacity-60">
              {t(locale, 'levels.passed')}
            </th>
            <th className="px-4 py-3 font-semibold opacity-60">
              {t(locale, 'levels.duration')}
            </th>
            <th className="px-4 py-3 font-semibold opacity-60">Status</th>
          </tr>
        </thead>
        <tbody>
          {[...rows].reverse().map((row) => {
            const isCurrent = row.level === currentLevel;
            return (
              <tr
                key={row.id}
                className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                  isCurrent ? 'bg-blue-500/5' : ''
                }`}
              >
                <td className="px-4 py-3 font-bold text-base">
                  {row.level}
                </td>
                <td className="px-4 py-3 font-mono text-xs opacity-70">
                  {fmt(row.started_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs opacity-70">
                  {fmt(row.passed_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold">
                  {daysBetween(row.started_at, row.passed_at)}
                </td>
                <td className="px-4 py-3">
                  {statusBadge(row, currentLevel)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
