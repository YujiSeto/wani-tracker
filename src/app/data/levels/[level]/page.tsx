import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminUser, getSubjectsByLevel } from '@/lib/queries';
import { LevelDetailClient } from '@/components/LevelDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  return {
    title: `Level ${level} — WaniTracker`,
    description: `All radicals, kanji, and vocabulary for WaniKani level ${level}.`,
  };
}

export default async function LevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelStr } = await params;
  const level = parseInt(levelStr, 10);
  if (isNaN(level) || level < 1 || level > 60) notFound();

  const adminUser = await getAdminUser();
  if (!adminUser) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-yellow-400">Database not synced. Run /api/sync/full first.</p>
      </div>
    );
  }

  const items = await getSubjectsByLevel(level, adminUser.id);
  if (items.length === 0) notFound();

  return (
    <LevelDetailClient
      level={level}
      currentLevel={adminUser.wanikani_level ?? 1}
      items={items}
    />
  );
}
