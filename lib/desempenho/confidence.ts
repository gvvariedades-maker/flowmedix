/**
 * Confiança por amostra — contrato único do hub `/desempenho`.
 *
 * Regra do produto: `100% em 1 questão` nunca vale o mesmo que `82% em 16`.
 * Abaixo de `DESEMPENHO_MIN_SAMPLE` a UI não usa tom conclusivo (verde/vermelho),
 * não ranqueia e não chama de ponto forte/fraco.
 *
 * Função pura, sem I/O — cobre as fronteiras 0 / 1–2 / 3–4 / 5–9 / 10+.
 * Contrato exibido em `docs/DESEMPENHO_METRICAS.md`.
 */

import { DESEMPENHO_COACH_UNLOCK, DESEMPENHO_MIN_SAMPLE } from '@/lib/desempenho/types';

export type ConfidenceLevelId =
  | 'sem_dados'
  | 'dados_iniciais'
  | 'tendencia_inicial'
  | 'evidencia_moderada'
  | 'diagnostico_confiavel';

export type ConfidenceLevel = {
  id: ConfidenceLevelId;
  /** Rótulo curto para chip/legenda ao lado da fração. */
  label: string;
  /** Frase completa para leitor de tela / tooltip. */
  description: string;
  /** Permite colorir % com semântica (danger/warning/success). */
  conclusiveTone: boolean;
  /** Permite ordenar/ranquear por taxa de acerto. */
  canRank: boolean;
  /** Permite afirmar ponto forte/fraco e recomendar por baixo acerto. */
  canDiagnose: boolean;
};

const LEVELS: Record<ConfidenceLevelId, ConfidenceLevel> = {
  sem_dados: {
    id: 'sem_dados',
    label: 'Sem dados',
    description: 'Sem questões respondidas neste recorte.',
    conclusiveTone: false,
    canRank: false,
    canDiagnose: false,
  },
  dados_iniciais: {
    id: 'dados_iniciais',
    label: 'Dados iniciais',
    description: 'Poucas questões — ainda não dá para concluir força ou fraqueza.',
    conclusiveTone: false,
    canRank: false,
    canDiagnose: false,
  },
  tendencia_inicial: {
    id: 'tendencia_inicial',
    label: 'Tendência inicial',
    description: 'Tendência inicial com baixa confiança — trate como indício.',
    conclusiveTone: false,
    canRank: false,
    canDiagnose: false,
  },
  evidencia_moderada: {
    id: 'evidencia_moderada',
    label: 'Evidência moderada',
    description: 'Amostra suficiente para ordenar, sempre lendo junto a fração.',
    conclusiveTone: true,
    canRank: true,
    canDiagnose: true,
  },
  diagnostico_confiavel: {
    id: 'diagnostico_confiavel',
    label: 'Diagnóstico mais confiável',
    description: 'Amostra confortável para recomendação normal.',
    conclusiveTone: true,
    canRank: true,
    canDiagnose: true,
  },
};

/** Classifica a amostra (questões respondidas) em nível de confiança. */
export function classifyDesempenhoConfidence(respondidas: number): ConfidenceLevel {
  const n = Number.isFinite(respondidas) ? Math.max(0, Math.trunc(respondidas)) : 0;
  if (n === 0) return LEVELS.sem_dados;
  if (n < 3) return LEVELS.dados_iniciais;
  if (n < DESEMPENHO_MIN_SAMPLE) return LEVELS.tendencia_inicial;
  if (n < DESEMPENHO_COACH_UNLOCK) return LEVELS.evidencia_moderada;
  return LEVELS.diagnostico_confiavel;
}

/** Metadados do nível já persistido no payload (`confidenceId`). */
export function getConfidenceLevel(id: ConfidenceLevelId): ConfidenceLevel {
  return LEVELS[id];
}

/** Atalho para o id (evita serializar o objeto inteiro no payload do RSC). */
export function desempenhoConfidenceId(respondidas: number): ConfidenceLevelId {
  return classifyDesempenhoConfidence(respondidas).id;
}

/** Amostra permite ranquear/diagnosticar por taxa de acerto. */
export function canRankBySample(respondidas: number): boolean {
  return classifyDesempenhoConfidence(respondidas).canRank;
}
