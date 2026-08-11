import type { VitrineDisciplinaId } from '@/lib/vitrine/disciplina';
import type { GrandeAreaId, RiskBandId } from '@/lib/desempenho/taxonomiaEnfermagem';

/** Amostra mínima para colorir/ranquear % de acerto (plano Hub Desempenho). */
export const DESEMPENHO_MIN_SAMPLE = 5;

/** Respondidas para liberar o mapa (empty state de coach). */
export const DESEMPENHO_COACH_UNLOCK = 10;

/** Focos sugeridos na dobra NextPractice. */
export const DESEMPENHO_NEXT_PRACTICE_LIMIT = 5;

/** Meta diária padrão (questões com última prática “hoje”). */
export const DESEMPENHO_META_DIA_DEFAULT = 10;

export type DesempenhoPeriodo = '7d' | '30d' | '90d' | '12m' | 'all';

export type DesempenhoEstudoFilters = {
  periodo: DesempenhoPeriodo;
  banca?: string | null;
  areaId?: GrandeAreaId | null;
  disciplina?: VitrineDisciplinaId | null;
};

/** Linha mínima de histórico para agregação (1 por questão; upsert sobrescreve created_at). */
export type HistoricoDesempenhoRow = {
  id: string;
  modulo_slug: string;
  acertou: boolean;
  created_at: string;
  banca?: string | null;
  estudo_reverso_concluido?: boolean | null;
  /**
   * false = placeholder de “marcar como estudado” sem alternativa (não conta no %).
   * Ausente/`true` = tentativa real (compatível com histórico pré-coluna).
   */
  respondida?: boolean | null;
};

/** Linha mínima do catálogo liberado ao aluno. */
export type CatalogDesempenhoRow = {
  modulo_slug: string;
  titulo_aula: string | null;
  modulo_nome: string | null;
  banca: string;
};

export type AssuntoPerformance = {
  tituloAula: string;
  canonicalSubtopico: string | null;
  areaId: GrandeAreaId;
  areaLabel: string;
  riskBandId: RiskBandId;
  disciplina: VitrineDisciplinaId;
  respondidas: number;
  acertos: number;
  erros: number;
  /** null quando amostra < DESEMPENHO_MIN_SAMPLE — UI mostra contagem, não %. */
  percentual: number | null;
  coberturaPct: number;
  totalDisponivel: number;
  ultimaPratica: string | null;
  amostraSuficiente: boolean;
  bancas: string[];
};

export type AreaPerformance = {
  areaId: GrandeAreaId;
  areaLabel: string;
  riskBandId: RiskBandId;
  respondidas: number;
  acertos: number;
  erros: number;
  percentual: number | null;
  coberturaPct: number;
  totalDisponivel: number;
  amostraSuficiente: boolean;
  assuntos: AssuntoPerformance[];
};

export type RiskBandPerformance = {
  riskBandId: RiskBandId;
  label: string;
  respondidas: number;
  acertos: number;
  erros: number;
  percentual: number | null;
  coberturaPct: number;
  totalDisponivel: number;
  amostraSuficiente: boolean;
};

export type PracticeFocusReason = 'weak_accuracy' | 'wrong_unreviewed' | 'low_coverage';

export type PracticeFocus = {
  tituloAula: string;
  reason: PracticeFocusReason;
  percentual: number | null;
  respondidas: number;
  erros: number;
  /** Valor exato para `/estudar?assunto=…` (match vitrine). */
  deepLinkAssunto: string;
};

export type RecentAttempt = {
  id: string;
  moduloSlug: string;
  tituloAula: string | null;
  acertou: boolean;
  estudoReversoConcluido: boolean;
  createdAt: string;
};

export type DesempenhoEstudoPlacar = {
  respondidas: number;
  acertos: number;
  erros: number;
  percentual: number | null;
  metaDoDia: {
    respondidasHoje: number;
    meta: number;
  };
  coachUnlocked: boolean;
};

/** Linha mínima do ledger EE para série P4 (`regular_practice`). */
export type AttemptSeriesEventRow = {
  attempt_id: string;
  question_id: string;
  correct: boolean;
  response_time_ms: number | null;
  response_time_status: string;
  created_at: string;
  context: string;
};

export type AttemptSeriesDay = {
  /** YYYY-MM-DD (calendário local do servidor). */
  date: string;
  attempts: number;
  acertos: number;
  /** null quando o dia não tem tentativas. */
  percentual: number | null;
};

/**
 * Série P4 a partir de `evidence_attempt_events`.
 * `available: false` = flag off / erro — UI esconde a dobra e P0 segue.
 */
export type AttemptSeriesData = {
  available: boolean;
  unavailableReason: 'flag_off' | 'empty' | 'error' | null;
  daily: AttemptSeriesDay[];
  /** Média só com `response_time_status = valid`. */
  tempoMedioMs: number | null;
  /** % de acerto na primeira tentativa por `question_id`. */
  firstAttemptAccuracyPct: number | null;
  /** Tentativas médias por questão distinta. */
  attemptsPerQuestionAvg: number | null;
  totalEvents: number;
  distinctQuestions: number;
  /** ISO do primeiro evento no recorte — aviso "dados a partir de". */
  dadosDesde: string | null;
  /** Histórico P0 mais antigo que o ledger (ou gap de contagem). */
  coberturaParcial: boolean;
};

export type DesempenhoEstudoData = {
  placar: DesempenhoEstudoPlacar;
  assuntos: AssuntoPerformance[];
  areas: AreaPerformance[];
  riskBands: RiskBandPerformance[];
  weakAreas: AssuntoPerformance[];
  nextPractice: PracticeFocus[];
  recentAttempts: RecentAttempt[];
  filtersApplied: DesempenhoEstudoFilters;
  /** P4 — null só em agregação pura sem orquestração; runtime preenche. */
  attemptSeries: AttemptSeriesData;
};
