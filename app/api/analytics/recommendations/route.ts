import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateRecommendations } from '@/lib/recommendations';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Next.js já cuida dos cookies
            }
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const prioritizeWeakAreas = searchParams.get('prioritizeWeakAreas') !== 'false';
    const includeNotAttempted = searchParams.get('includeNotAttempted') !== 'false';

    const recommendations = await generateRecommendations(session.user.id, {
      maxRecommendations: limit,
      prioritizeWeakAreas,
      includeNotAttempted,
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    logger.error('Failed to get recommendations', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
