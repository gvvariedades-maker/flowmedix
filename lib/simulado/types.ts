export type SimuladoSessionStatus = 'aberto' | 'concluido' | 'cancelado';
export type SimuladoModo = 'treino' | 'prova';

export type SimuladoSessionSummary = {
  id: string;
  status: SimuladoSessionStatus;
  modo: SimuladoModo;
  titulo: string;
  ritmo_meta_segundos_por_questao: number | null;
  prova_iniciada_em: string | null;
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
    titulo: string;
    ritmo_meta_segundos_por_questao: number | null;
    prova_iniciada_em: string | null;
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
    titulo: string;
    ritmo_meta_segundos_por_questao: number | null;
    prova_iniciada_em: string | null;
    created_at: string;
    filtros?: Record<string, unknown>;
  } | null;
};

export type SimuladoAnswerResponse = {
  success: true;
  acertou: boolean | null;
  opcao_correta_id: string | null;
  session_status: SimuladoSessionStatus;
  questao_atualizada: SimuladoQuestaoRespondida;
  resumo: SimuladoResumo;
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

export type SimuladoAnalyticsResponse = {
  filters: {
    periodo: '7d' | '30d' | '90d' | '12m';
    modo: 'todos' | 'treino' | 'prova';
    banca: string | null;
    topico: string | null;
    subtopico: string | null;
  };
  kpis: {
    total_simulados: number;
    media_acerto: number | null;
    melhor_score: number | null;
    tempo_medio_ms: number | null;
  };
  evolucao_temporal: Array<{
    data_ref: string;
    total_questoes: number;
    acertos: number;
    erros: number;
    percentual_acerto: number | null;
    tempo_total_ms: number;
    tempo_medio_ms: number | null;
  }>;
  desempenho: {
    por_banca: Array<{
      nome: string;
      total_questoes: number;
      acertos: number;
      erros: number;
      percentual_acerto: number | null;
    }>;
    por_topico: Array<{
      nome: string;
      total_questoes: number;
      acertos: number;
      erros: number;
      percentual_acerto: number | null;
    }>;
    por_subtopico: Array<{
      nome: string;
      total_questoes: number;
      acertos: number;
      erros: number;
      percentual_acerto: number | null;
    }>;
  };
  padroes_erro: Array<{
    banca: string;
    topico: string;
    subtopico: string;
    total_questoes: number;
    erros: number;
    taxa_erro: number | null;
  }>;
  metas_streaks: {
    streaks: {
      dias_ativos_periodo: number;
      streak_atual_dias: number;
      melhor_streak_dias: number;
    };
    metas: {
      meta_semanal_sessoes: number;
      sessoes_ultimos_7d: number;
      progresso_meta_semanal: number;
      meta_mensal_questoes: number;
      questoes_ultimos_30d: number;
      progresso_meta_mensal: number;
    };
  };
  history_preview: Array<{
    id: string;
    status: string;
    modo: 'treino' | 'prova';
    titulo: string;
    percentual_acerto: number | null;
    created_at: string;
    concluida_em: string | null;
  }>;
};

export type SimuladoTemplateSummary = {
  id: string;
  titulo: string;
  modo: SimuladoModo;
  quantidade: number;
  filtros: Record<string, unknown>;
  ritmo_meta: '2min' | '3min' | 'none';
  ritmo_meta_segundos_por_questao: number | null;
  ultimo_uso_em: string | null;
  created_at: string;
};

export type SimuladoTemplatesListResponse = {
  templates: SimuladoTemplateSummary[];
};

export type SimuladoTemplateCreateResponse = {
  success: true;
  template: SimuladoTemplateSummary;
};

export type SimuladoProvaEvolucaoItem = {
  id: string;
  titulo: string;
  percentual_acerto: number | null;
  tempo_total_ms: number | null;
  tempo_label: string | null;
  concluida_em: string | null;
  created_at: string;
};

export type SimuladoProvaEvolucaoResponse = {
  titulo_base: string;
  items: SimuladoProvaEvolucaoItem[];
};

export type SimuladoHistoryResponse = {
  filters: {
    periodo: '7d' | '30d' | '90d' | '12m';
    modo: 'todos' | 'treino' | 'prova';
    banca: string | null;
    topico: string | null;
    subtopico: string | null;
    status: 'todos' | 'aberto' | 'concluido' | 'cancelado';
  };
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  sessions: Array<{
    id: string;
    status: string;
    modo: 'treino' | 'prova';
    titulo: string;
    total_questoes: number | null;
    acertos: number | null;
    erros: number | null;
    percentual_acerto: number | null;
    tempo_total_ms: number | null;
    tempo_medio_ms: number | null;
    created_at: string;
    concluida_em: string | null;
  }>;
};
