/** 41 subtópicos canônicos AVANT (CLAUDE.md §9). */
export const CANONICAL_SUBTOPICOS = [
  'História da Enfermagem',
  'Noções de Anatomia',
  'Noções de Fisiologia',
  'Processo de Enfermagem',
  'Farmacodinâmica e Farmacocinética',
  'Cálculo de Administração de Medicamentos e Infusões',
  'Vias de Administração',
  'Cuidados na Administração de Medicamentos',
  'Verificação de Sinais Vitais',
  'Instalação e Manejo de Sondas',
  'Oxigenoterapia e Cuidados Respiratórios',
  'Curativos e Manejo de Feridas',
  'Punção Venosa e Cuidados com Cateteres',
  'Coleta de Exames Laboratoriais',
  'Mobilização e Posicionamento do Paciente',
  'Procedimentos Diversos',
  'Feridas e Queimaduras',
  'Processamento de Artigos e Produtos de Saúde',
  'Enfermagem em Central de Material e Esterilização (CME)',
  'Medidas de Prevenção e Precaução de Contato',
  'Infecções no Contexto da Biossegurança',
  'Segurança do Paciente',
  'Epidemiologia e Vigilância Epidemiológica',
  'Promoção à Saúde e Prevenção de Agravos',
  'Imunização',
  'Atenção Básica / Saúde da Família',
  'Infecções Sexualmente Transmissíveis (ISTs)',
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
  'Doenças Parasitárias e Zoonoses',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
  'Questões Mescladas e Outras Doenças Agudas',
  'Doenças Respiratórias Crônicas (Asma, DPOC)',
  'Assistência Perioperatória (Inclui SRPA)',
  'Enfermagem em Centro Cirúrgico',
  'Urgências e Emergências',
  'Enfermagem do Trabalho',
  'Saúde Mental',
  'Saúde da Criança',
  'Saúde do Adolescente',
  'Saúde da Mulher',
] as const;

export type CanonicalSubtopico = (typeof CANONICAL_SUBTOPICOS)[number];

/** Bucket legado já usado no catálogo (DCNT mescladas) — alvo de consolidação. */
export const DCNT_MESCLADAS_LABEL =
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';

export const CANONICAL_SUBTOPICO_SET = new Set<string>([
  ...CANONICAL_SUBTOPICOS,
  DCNT_MESCLADAS_LABEL,
]);

export function isCanonicalSubtopico(label: string | null | undefined): boolean {
  if (!label?.trim()) return false;
  return CANONICAL_SUBTOPICO_SET.has(label.trim());
}
