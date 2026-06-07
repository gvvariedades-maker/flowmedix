import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendations';
import { logger } from '@/lib/logger';
import { getServerUser } from '@/lib/supabase/server-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const prioritizeWeakAreas = searchParams.get('prioritizeWeakAreas') !== 'false';
    const includeNotAttempted = searchParams.get('includeNotAttempted') !== 'false';

    const recommendations = await generateRecommendations(user.id, {
      maxRecommendations: limit,
      prioritizeWeakAreas,
      includeNotAttempted,
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    logger.error('Failed to get recommendations', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 },
    );
  }
}
