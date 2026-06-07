import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getAnalyticsSummary(user.id);

    return NextResponse.json(summary);
  } catch (error) {
    logger.error('Failed to get analytics summary', error);
    return NextResponse.json(
      { error: 'Failed to get analytics summary' },
      { status: 500 },
    );
  }
}
