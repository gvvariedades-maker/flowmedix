/** Item de questão dentro de um grupo (assunto) na vitrine. */
export type VitrineQuestaoItem = {
  slug: string;
  numero: number;
  status: 'nao_estudada' | 'estudada';
  avant_codigo: number | null;
  created_at: string | null;
};

/** Grupo por `titulo_aula` — mesmo contrato que `VitrineClient`. */
export type VitrineGrupoSubtopico = {
  titulo_aula: string;
  modulo_nome: string;
  banca: string;
  questoes: VitrineQuestaoItem[];
  acertos: number;
  erros: number;
  totalResolvidas: number;
  totalQuestoes: number;
  trabalhadas: number;
  percentual: number;
  firstSlug: string;
};

export type VitrineFacets = {
  bancas: string[];
  assuntos: string[];
};

export type VitrinePagination = {
  page: number;
  perPage: number;
  totalGroups: number;
  totalPages: number;
};

export type VitrinePageResponse = {
  groups: VitrineGrupoSubtopico[];
  facets: VitrineFacets;
  pagination: VitrinePagination;
  /** Total de módulos (questões) após filtros, antes da paginação por assunto. */
  totalModulosFiltrados: number;
};
