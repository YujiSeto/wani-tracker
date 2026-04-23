import type { Metadata } from 'next';
import { getAdminUser, getAllLevelsProgress } from '@/lib/queries';
import { LevelsClient } from '@/components/LevelsClient';

export const metadata: Metadata = {
  title: 'All Levels — WaniTracker',
  description: 'Progress overview for every WaniKani level.',
};

export default async function LevelsPage() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-yellow-400">Database not synced. Run /api/sync/full first.</p>
      </div>
    );
  }

  const levels = await getAllLevelsProgress(adminUser.id);

  return (
    <LevelsClient
      levels={levels}
      currentLevel={adminUser.wanikani_level ?? 1}
    />
  );
}
