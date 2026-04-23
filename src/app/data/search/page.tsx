import type { Metadata } from 'next';
import {
  getAdminUser,
  searchSubjects,
  type SubjectSearchResult,
} from '@/lib/queries';
import { SearchClient } from '@/components/SearchClient';

export const metadata: Metadata = {
  title: 'Subject Search — WaniTracker',
  description: 'Search any WaniKani radical, kanji, or vocabulary and see its level and SRS stage.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const adminUser = await getAdminUser();

  const results: SubjectSearchResult[] =
    adminUser && q?.trim()
      ? await searchSubjects(q.trim(), adminUser.id)
      : [];

  return (
    <SearchClient
      q={q?.trim() ?? ''}
      results={results}
      hasAdmin={!!adminUser}
    />
  );
}
