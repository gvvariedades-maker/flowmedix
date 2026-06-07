import { NextResponse } from 'next/server';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await getTodayReviews(user.id);

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error('Failed to get reviews', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 },
    );
  }
}
