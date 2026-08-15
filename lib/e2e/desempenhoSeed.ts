import { aggregateStudyPerformance } from '@/lib/desempenho/studyPerformance';
import type {
  CatalogDesempenhoRow,
  DesempenhoEstudoData,
  DesempenhoEstudoFilters,
  HistoricoDesempenhoRow,
} from '@/lib/desempenho/types';
import {
  E2E_DESEMPENHO_TITULO_AULA,
  E2E_DESEMPENHO_TITULO_LONGO,
} from '@/lib/e2e/constants';

const E2E_NOW = new Date('2026-08-11T15:00:00.000Z');

/**
 * Seed in-memory para `/desempenho` com `E2E_DASHBOARD_BYPASS`.
 * Libera o mapa (≥10 respondidas) e um assunto fraco com CTA "Praticar".
 * Inclui 1 IST recente (Erro+Reverso) para overflow/captura — não rouba `nextPractice[0]`.
 */
export function getE2eDesempenhoEstudoData(
  filters: DesempenhoEstudoFilters,
  recentLimit?: number,
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

  catalog.push({
    modulo_slug: 'e2e-desempenho-ist-longo',
    titulo_aula: E2E_DESEMPENHO_TITULO_LONGO,
    modulo_nome: 'Enfermagem',
    banca: 'FGV',
  });
  historico.push({
    id: 'e2e-h-ist-longo',
    modulo_slug: 'e2e-desempenho-ist-longo',
    acertou: false,
    created_at: '2026-08-11T14:30:00.000Z',
    banca: 'FGV',
    estudo_reverso_concluido: true,
    respondida: true,
  });

  return aggregateStudyPerformance(historico, catalog, filters, E2E_NOW, 'ok', recentLimit);
}

/**
 * Captura/E2E: lista longa o bastante para cursor (~20/página).
 * Só com `E2E_DASHBOARD_BYPASS` + `?captura=historico-cursor`.
 */
export function getE2eDesempenhoHistoricoCursor(
  filters: DesempenhoEstudoFilters,
  recentLimit?: number,
): DesempenhoEstudoData {
  const catalog: CatalogDesempenhoRow[] = [];
  const historico: HistoricoDesempenhoRow[] = [];

  for (let i = 0; i < 25; i++) {
    const slug = `e2e-desempenho-cursor-${String(i).padStart(2, '0')}`;
    catalog.push({
      modulo_slug: slug,
      titulo_aula: E2E_DESEMPENHO_TITULO_AULA,
      modulo_nome: 'Enfermagem',
      banca: 'FGV',
    });
    historico.push({
      id: `e2e-h-cursor-${String(i).padStart(2, '0')}`,
      modulo_slug: slug,
      acertou: i % 2 === 0,
      created_at: new Date(Date.UTC(2026, 7, 11, 15, 0, 25 - i)).toISOString(),
      banca: 'FGV',
      estudo_reverso_concluido: i % 5 === 0,
      respondida: true,
    });
  }

  return aggregateStudyPerformance(historico, catalog, filters, E2E_NOW, 'ok', recentLimit);
}

export function getE2eDesempenhoLeituraTruncada(
  filters: DesempenhoEstudoFilters,
): DesempenhoEstudoData {
  return { ...getE2eDesempenhoEstudoData(filters), leituraTruncada: true };
}

export function getE2eDesempenhoLoadError(
  filters: DesempenhoEstudoFilters,
): DesempenhoEstudoData {
  return aggregateStudyPerformance([], [], filters, E2E_NOW, 'error');
}

/**
 * Captura/E2E: placar zerado (pós-reset 1A) com série EE visível.
 * Só usado com `E2E_DASHBOARD_BYPASS` + `?captura=placar-zerado`.
 */
export function getE2eDesempenhoEstudoPlacarZeradoComSerie(
  filters: DesempenhoEstudoFilters,
): DesempenhoEstudoData {
  const empty = aggregateStudyPerformance([], [], filters, E2E_NOW);
  return {
    ...empty,
    attemptSeries: {
      available: true,
      unavailableReason: null,
      daily: [
        { date: '2026-08-08', attempts: 4, acertos: 2, percentual: 50 },
        { date: '2026-08-09', attempts: 3, acertos: 1, percentual: 33 },
        { date: '2026-08-10', attempts: 5, acertos: 3, percentual: 60 },
      ],
      tempoMedioMs: 4200,
      firstAttemptAccuracyPct: 55,
      attemptsPerQuestionAvg: 1.5,
      totalEvents: 12,
      distinctQuestions: 8,
      dadosDesde: '2026-08-08T12:00:00.000Z',
      coberturaParcial: false,
      truncated: false,
      limiteRegistros: null,
    },
  };
}
