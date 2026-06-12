import { getCatalogStats } from '@/lib/cache';
import { logger } from '@/lib/logger';
import VitrineCatalogStatsStrip from '@/components/vitrine/VitrineCatalogStatsStrip';

export default async function VitrineCatalogStatsSection() {
  const catalogStats = await getCatalogStats().catch((err) => {
    logger.warn('SSR vitrine: falha ao carregar estatísticas do catálogo', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { totalQuestions: 0, totalSlides: 0 };
  });

  return (
    <VitrineCatalogStatsStrip
      totalQuestions={catalogStats.totalQuestions}
      totalSlides={catalogStats.totalSlides}
    />
  );
}
