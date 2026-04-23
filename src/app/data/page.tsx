import type { Metadata } from 'next';
import { fetchUser, fetchSummary } from '@/lib/wanikani';
import { DashboardClient } from '@/components/DashboardClient';
import {
  getAdminUser,
  getSRSMatrix,
  getSubjectCounts,
  getLevelProgressions,
  getResets,
  getStudyMaterialsCount,
} from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Dashboard — WaniTracker',
  description: 'Your WaniKani study progress: level, lessons, reviews, and SRS breakdown.',
};

export default async function DataPage() {
  // Live API calls — small, fast, always current
  const [userResult, summaryResult] = await Promise.all([
    fetchUser(),
    fetchSummary(),
  ]);

  // DB queries — instant reads from Supabase
  const adminUser = await getAdminUser();
  const syncRequired = !adminUser;

  const [srsMatrix, subjectCounts, levelProgressions, resets, studyMaterialsCount] =
    adminUser
      ? await Promise.all([
          getSRSMatrix(adminUser.id),
          getSubjectCounts(),
          getLevelProgressions(adminUser.id),
          getResets(adminUser.id),
          getStudyMaterialsCount(adminUser.id),
        ])
      : [null, null, [], [], 0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <DashboardClient
        userResult={userResult}
        summaryResult={summaryResult}
        syncRequired={syncRequired}
        srsMatrix={srsMatrix}
        subjectCounts={subjectCounts}
        levelProgressions={levelProgressions}
        resets={resets}
        studyMaterialsCount={studyMaterialsCount}
      />
    </div>
  );
}

