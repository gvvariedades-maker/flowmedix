export type SimuladoSessionStatus = 'aberto' | 'concluido' | 'cancelado';

export type SimuladoSessionSummary = {
  id: string;
  status: SimuladoSessionStatus;
  total_questoes: number;
  filtros: Record<string, unknown>;
  created_at: string;
  concluida_em: string | null;
};

export type SimuladoResumo = {
  respondidas: number;
  pendentes: number;
  acertos: number;
  erros: number;
  percentual_acerto: number;
};

export type SimuladoQuestaoMeta = {
  banca: string | null;
  topico: string | null;
  subtopico: string | null;
};

export type SimuladoQuestaoNaoRespondida = {
  ordem: number;
  modulo_slug: string;
  respondida: false;
  meta: SimuladoQuestaoMeta;
};

export type SimuladoQuestaoRespondida = {
  ordem: number;
  modulo_slug: string;
  respondida: true;
  meta: SimuladoQuestaoMeta;
  acertou: boolean;
  opcao_id: string | null;
  opcao_correta_id: string | null;
  respondida_em: string | null;
};

export type SimuladoQuestaoItem = SimuladoQuestaoNaoRespondida | SimuladoQuestaoRespondida;

export function isSimuladoQuestaoRespondida(
  q: SimuladoQuestaoItem,
): q is SimuladoQuestaoRespondida {
  return q.respondida === true;
}

export type SimuladoSessionDetailResponse = {
  session: SimuladoSessionSummary;
  resumo: SimuladoResumo;
  questoes: SimuladoQuestaoItem[];
};

export type SimuladoCreateSessionResponse = {
  success: true;
  session: {
    id: string;
    total_questoes: number;
    status: SimuladoSessionStatus;
    created_at: string;
  };
  questoes: Array<{ modulo_slug: string; ordem: number }>;
};

export type SimuladoAnswerResponse = {
  success: true;
  acertou: boolean;
  opcao_correta_id: string;
  session_status: SimuladoSessionStatus;
};
