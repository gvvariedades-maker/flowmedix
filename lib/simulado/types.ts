export type SimuladoSessionStatus = 'aberto' | 'concluido' | 'cancelado';
export type SimuladoModo = 'treino' | 'prova';

export type SimuladoSessionSummary = {
  id: string;
  status: SimuladoSessionStatus;
  modo: SimuladoModo;
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
  tempo_total_ms: number;
  tempo_medio_ms: number;
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
  tempo_ms: number | null;
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
  resumed?: boolean;
  session: {
    id: string;
    total_questoes: number;
    status: SimuladoSessionStatus;
    modo: SimuladoModo;
    created_at: string;
  };
  questoes: Array<{ modulo_slug: string; ordem: number }>;
};

export type SimuladoOpenSessionResponse = {
  has_open_session: boolean;
  session: {
    id: string;
    total_questoes: number;
    status: SimuladoSessionStatus;
    modo: SimuladoModo;
    created_at: string;
    filtros?: Record<string, unknown>;
  } | null;
};

export type SimuladoAnswerResponse = {
  success: true;
  acertou: boolean | null;
  opcao_correta_id: string | null;
  session_status: SimuladoSessionStatus;
};

export type SimuladoPoolCountResponse = {
  estimated_count: number;
};

export type SimuladoQuestaoPayloadResponse = {
  dados: {
    meta: {
      ano?: string;
      banca: string;
      orgao?: string;
      prova?: string;
      header_line?: string;
      cargo_header?: string;
      topico: string;
      subtopico?: string;
    };
    question_data: {
      instruction: string;
      text_fragment?: string;
      options: Array<{
        id: string;
        text: string;
      }>;
    };
  };
};
