import type { VitrineDisciplinaId } from '@/lib/vitrine/disciplina';
import type { GrandeAreaId, RiskBandId } from '@/lib/desempenho/taxonomiaEnfermagem';
import type { ConfidenceLevelId } from '@/lib/desempenho/confidence';

/** Amostra mínima para colorir/ranquear % de acerto (plano Hub Desempenho). */
export const DESEMPENHO_MIN_SAMPLE = 5;

/** Respondidas para liberar o mapa (empty state de coach). */
export const DESEMPENHO_COACH_UNLOCK = 10;

/** Focos sugeridos na dobra NextPractice (contrato do agregador). */
export const DESEMPENHO_NEXT_PRACTICE_LIMIT = 5;

/** Home curta: áreas prioritárias visíveis antes de “Ver mapa completo”. */
export const DESEMPENHO_HOME_AREA_LIMIT = 3;

/** Home curta: focos compactos abaixo do destaque (além do 1º completo). */
export const DESEMPENHO_HOME_FOCI_COMPACT = 2;

/** Home curta: tentativas recentes visíveis antes de “Ver histórico”. */
export const DESEMPENHO_HOME_RECENT_LIMIT = 5;

/** Página de histórico: itens por cursor (sem infinite scroll). */
export const DESEMPENHO_HISTORICO_PAGE_SIZE = 20;

/** Busca no filtro de assunto quando a lista passa deste tamanho. */
export const DESEMPENHO_ASSUNTO_BUSCA_MIN = 8;

/** Meta diária padrão (questões com última prática “hoje”). */
export const DESEMPENHO_META_DIA_DEFAULT = 10;

export type DesempenhoPeriodo = '7d' | '30d' | '90d' | '12m' | 'all';

/**
 * Ordem canônica dos períodos na UI e na normalização de `searchParams`.
 * Fica em `types` (sem dependência de servidor) para poder ser importada por
 * componentes client — `studyPerformance` puxa `lib/cache`, que é server-only.
 */
export const DESEMPENHO_PERIODOS = [
  '7d',
  '30d',
  '90d',
  '12m',
  'all',
] as const satisfies ReadonlyArray<DesempenhoPeriodo>;

export type DesempenhoEstudoFilters = {
  periodo: DesempenhoPeriodo;
  banca?: string | null;
  areaId?: GrandeAreaId | null;
  disciplina?: VitrineDisciplinaId | null;
  /** `titulo_aula` exato; só vale com `areaId` (assunto depende da área). */
  assunto?: string | null;
};

/** Filtro de resultado — só na lista de `/desempenho/historico`, nunca no placar. */
export type HistoricoResultadoFilter = 'todos' | 'acerto' | 'erro' | 'reverso';

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
  /** Nível de confiança pela amostra (`lib/desempenho/confidence.ts`). */
  confidenceId: ConfidenceLevelId;
  /** Erros ainda sem estudo reverso concluído — evento concreto, não estatística. */
  errosSemReverso: number;
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
  confidenceId: ConfidenceLevelId;
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
  confidenceId: ConfidenceLevelId;
};

export type PracticeFocusReason = 'weak_accuracy' | 'wrong_unreviewed' | 'low_coverage';

export type PracticeFocus = {
  tituloAula: string;
  reason: PracticeFocusReason;
  percentual: number | null;
  respondidas: number;
  erros: number;
  acertos: number;
  /** Erros sem estudo reverso concluído (motivo `wrong_unreviewed`). */
  errosSemReverso: number;
  coberturaPct: number;
  totalDisponivel: number;
  confidenceId: ConfidenceLevelId;
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
  confidenceId: ConfidenceLevelId;
};

/** Recorte temporal aplicado — exibido no resumo ("amostra analisada"). */
export type DesempenhoPeriodoResumo = {
  periodo: DesempenhoPeriodo;
  /** YYYY-MM-DD inclusivo (null em `all`). */
  startYmd: string | null;
  /** YYYY-MM-DD do último dia coberto (hoje em Brasília). */
  endYmdInclusive: string;
  /** Datas civis cobertas (null em `all`). */
  civilDays: number | null;
};

/**
 * Estado de carregamento do painel.
 * `error` nunca deve ser exibido como zero/vazio (contrato §9 do mestre).
 */
export type DesempenhoLoadState = 'ok' | 'error';

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
  /**
   * Leitura atingiu o teto de registros (`SCALE_LIMITS.HISTORICO_ANALYTICS_READ`).
   * Nenhum limite pode ser silencioso: a UI avisa que a série é parcial.
   */
  truncated: boolean;
  /** Teto aplicado na leitura (null quando não houve leitura). */
  limiteRegistros: number | null;
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
  /** Recorte civil aplicado (Brasília, semiaberto). */
  periodoResumo: DesempenhoPeriodoResumo;
  /**
   * Respondidas sem período/área/assunto (disciplina e banca permanecem).
   * Numerador da linha “Exibindo X de Y” é `placar.respondidas`.
   */
  universoRespondidas: number;
  /** Títulos do catálogo no recorte de área/disciplina/banca — opções do filtro assunto. */
  assuntoOpcoes: string[];
  /** Leitura bateu `SCALE_LIMITS.HISTORICO_ANALYTICS_READ` — Y não é o total vitalício. */
  leituraTruncada: boolean;
  /** `error` = falha de leitura; a UI mostra estado de erro, não zeros. */
  loadState: DesempenhoLoadState;
  /** P4 — null só em agregação pura sem orquestração; runtime preenche. */
  attemptSeries: AttemptSeriesData;
};
