import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/admin/requireAdmin';
import {
  aggregateReportsByPriority,
  evaluateContinuousHealth,
  fetchOpenReportsDetailed,
  fetchSessions30dBySubtopico,
  findStaleP0Reports,
  type ContinuousContentHealth,
} from '@/lib/catalogMigration/contentHealth';
import {
  findPacoteBySubtopico,
  loadHandcraftRegistry,
  type RegistryPacote,
} from '@/lib/catalogMigration/handcraftRegistry';
import { canSell, normalizeProductionStatus } from '@/lib/catalogMigration/shipGate';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

async function buildContentHealth(
  subtopico: string,
  pacote: RegistryPacote | null,
): Promise<ContinuousContentHealth> {
  const supabase = await createServerSupabase();
  const slo = pacote?.quality?.slo;
  const p0BlockHours = slo?.p0_block_after_hours ?? 24;
  const status = normalizeProductionStatus(pacote?.production_status);

  const [sessions30d, detailed] = await Promise.all([
    fetchSessions30dBySubtopico(supabase, subtopico),
    fetchOpenReportsDetailed(supabase, subtopico),
  ]);

  const open = aggregateReportsByPriority(detailed);
  const staleP0 =
    status === 'production_ready' || status === 'blocked'
      ? findStaleP0Reports(detailed, p0BlockHours).length
      : 0;

  return evaluateContinuousHealth(subtopico, sessions30d, open, slo, staleP0);
}

function pacotePayload(
  subtopico: string,
  pacote: RegistryPacote,
  health: ContinuousContentHealth,
) {
  const status = normalizeProductionStatus(pacote.production_status);
  return {
    subtopico,
    production_status: status,
    can_sell: canSell(pacote),
    quality: pacote.quality ?? null,
    continuous: pacote.quality?.continuous ?? null,
    content_health: health,
  };
}

/** GET /api/admin/subtopico-quality?subtopico=... | ?all=1 */
export async function GET(request: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const all = request.nextUrl.searchParams.get('all') === '1';

  try {
    const registry = loadHandcraftRegistry();

    if (all) {
      const items = [];
      for (const [subtopico, pacote] of Object.entries(registry.pacotes)) {
        if (pacote.status !== 'applied' || (pacote.handcraft_applied ?? 0) === 0) continue;
        const health = await buildContentHealth(subtopico, pacote);
        items.push(pacotePayload(subtopico, pacote, health));
      }
      return NextResponse.json({ items });
    }

    const subtopico = request.nextUrl.searchParams.get('subtopico')?.trim();
    if (!subtopico) {
      return NextResponse.json({ error: 'subtopico ou all=1 obrigatório' }, { status: 400 });
    }

    const found = findPacoteBySubtopico(registry, subtopico);
    const health = await buildContentHealth(subtopico, found?.pacote ?? null);

    if (!found) {
      return NextResponse.json({
        subtopico,
        production_status: 'none',
        can_sell: false,
        quality: null,
        continuous: null,
        content_health: health,
      });
    }

    return NextResponse.json(pacotePayload(subtopico, found.pacote, health));
  } catch (error) {
    logger.error('GET /api/admin/subtopico-quality', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
