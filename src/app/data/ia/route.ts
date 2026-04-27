import { NextResponse } from 'next/server';
import {
  fetchUser,
  fetchSummary,
  isFetchError,
  countAvailable,
} from '@/lib/wanikani';
import { getAdminUser, getBurnedItems } from '@/lib/queries';

export async function GET() {
  const [userResult, summaryResult, adminUser] = await Promise.all([
    fetchUser(),
    fetchSummary(),
    getAdminUser(),
  ]);

  const burnedItems = adminUser ? await getBurnedItems(adminUser.id) : [];

  const user = !isFetchError(userResult) ? userResult.data : null;
  const summary = !isFetchError(summaryResult) ? summaryResult.data : null;

  const lessonsCount = summary ? countAvailable(summary.lessons) : null;
  const reviewsCount = summary ? countAvailable(summary.reviews) : null;

  const exportPayload = {
    generated_at: new Date().toISOString(),
    source: 'WaniKani V2 API',
    cache_revalidation_seconds: 60,
    user: user
      ? {
          username: user.username,
          level: user.level,
          subscription_active: user.subscription.active,
          subscription_type: user.subscription.type,
          subscription_max_level: user.subscription.max_level_granted,
        }
      : {
          error: isFetchError(userResult) ? userResult.message : 'Unknown error',
        },
    study_summary: summary
      ? {
          available_lessons: lessonsCount,
          pending_reviews: reviewsCount,
          next_reviews_at: summary.next_reviews_at,
        }
      : {
          error: isFetchError(summaryResult) ? summaryResult.message : 'Unknown error',
        },
    burned_items: burnedItems,
  };

  return NextResponse.json(exportPayload);
}
