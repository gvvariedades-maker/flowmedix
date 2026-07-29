import { NextResponse } from 'next/server';
import { getReviewsToday } from '@/lib/fsrs/reviewsToday';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getReviewsToday({
      userId: user.id,
      email: user.email,
    });

    if (result.source === 'fsrs') {
      return NextResponse.json({
        source: result.source,
        reviews: result.reviews,
        telemetry: result.telemetry,
      });
    }

    return NextResponse.json({
      source: result.source,
      reviews: result.reviews,
    });
  } catch (error) {
    logger.error('Failed to get reviews', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 },
    );
  }
}
