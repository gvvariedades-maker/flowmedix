import { aggregateStudyPerformance } from '@/lib/desempenho/studyPerformance';
import type {
  CatalogDesempenhoRow,
  DesempenhoEstudoData,
  DesempenhoEstudoFilters,
  HistoricoDesempenhoRow,
} from '@/lib/desempenho/types';
import { E2E_DESEMPENHO_TITULO_AULA } from '@/lib/e2e/constants';

const E2E_NOW = new Date('2026-08-11T15:00:00.000Z');

/**
 * Seed in-memory para `/desempenho` com `E2E_DASHBOARD_BYPASS`.
 * Libera o mapa (≥10 respondidas) e um assunto fraco com CTA "Praticar".
 */
export function getE2eDesempenhoEstudoData(
  filters: DesempenhoEstudoFilters,
): DesempenhoEstudoData {
  const catalog: CatalogDesempenhoRow[] = [];
  const historico: HistoricoDesempenhoRow[] = [];

  for (let i = 0; i < 12; i++) {
    const slug = `e2e-desempenho-vias-${i}`;
    catalog.push({
      modulo_slug: slug,
      titulo_aula: E2E_DESEMPENHO_TITULO_AULA,
      modulo_nome: 'Enfermagem',
      banca: 'FGV',
    });
    historico.push({
      id: `e2e-h-vias-${i}`,
      modulo_slug: slug,
      acertou: i < 3,
      created_at: '2026-08-10T12:00:00.000Z',
      banca: 'FGV',
      estudo_reverso_concluido: i === 0,
      respondida: true,
    });
  }

  for (let i = 0; i < 5; i++) {
    const slug = `e2e-desempenho-imuno-${i}`;
    catalog.push({
      modulo_slug: slug,
      titulo_aula: 'Imunização',
      modulo_nome: 'Enfermagem',
      banca: 'FGV',
    });
    historico.push({
      id: `e2e-h-imuno-${i}`,
      modulo_slug: slug,
      acertou: true,
      created_at: '2026-08-10T14:00:00.000Z',
      banca: 'FGV',
      estudo_reverso_concluido: false,
      respondida: true,
    });
  }

  return aggregateStudyPerformance(historico, catalog, filters, E2E_NOW);
}
