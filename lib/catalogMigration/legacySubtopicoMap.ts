import { CANONICAL_SUBTOPICOS, DCNT_MESCLADAS_LABEL } from '@/lib/catalogMigration/canonicalSubtopicos';

export type LegacyMapTier = 'alias' | 'best_fit';

export type LegacySubtopicoMapping = {
  canonical: string;
  tier: LegacyMapTier;
  note?: string;
};

/**
 * Mapeamento legado → canônico (Fase 1 — consolidação de rótulos de importação).
 * Chaves devem coincidir exatamente com `titulo_aula` no Supabase.
 */
export const LEGACY_SUBTOPICO_MAP: Record<string, LegacySubtopicoMapping> = {
  // Aliases diretos (alta confiança)
  'Semiologia em Enfermagem': {
    canonical: 'Verificação de Sinais Vitais',
    tier: 'alias',
    note: 'Mesmo assunto; rótulo TecConcursos legado',
  },
  'Exames Laboratoriais': {
    canonical: 'Coleta de Exames Laboratoriais',
    tier: 'alias',
  },
  'Exames complementares': {
    canonical: 'Coleta de Exames Laboratoriais',
    tier: 'alias',
    note: 'Exames de apoio diagnóstico',
  },
  'Doenças Virais de Interesse Epidemiológico': {
    canonical: CANONICAL_SUBTOPICOS[27],
    tier: 'alias',
    note: 'Label curto → canônico longo',
  },
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc)': {
    canonical: CANONICAL_SUBTOPICOS[28],
    tier: 'alias',
    note: 'Falta ponto final no legado',
  },
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase, etc)': {
    canonical: CANONICAL_SUBTOPICOS[28],
    tier: 'alias',
    note: 'Vírgula antes de etc',
  },
  'Doenças Bacterianas e Fúngicas': {
    canonical: CANONICAL_SUBTOPICOS[28],
    tier: 'alias',
    note: 'Label curto',
  },

  // Best-fit (melhoria de vitrine; revisão amostral recomendada)
  'Teorias em Enfermagem': {
    canonical: 'História da Enfermagem',
    tier: 'best_fit',
  },
  'Auditoria e Gestão da Qualidade (Enfermagem)': {
    canonical: 'Segurança do Paciente',
    tier: 'best_fit',
  },
  'Nutrição Aplicada à Enfermagem': {
    canonical: 'Atenção Básica / Saúde da Família',
    tier: 'best_fit',
  },
  'Protocolos e Diretrizes do Ministério da Saúde': {
    canonical: 'Promoção à Saúde e Prevenção de Agravos',
    tier: 'best_fit',
  },
  'Cuidados Gerais com Higiene e Conforto do Paciente': {
    canonical: 'Procedimentos Diversos',
    tier: 'best_fit',
  },
  'Saúde do Idoso': {
    canonical: 'Promoção à Saúde e Prevenção de Agravos',
    tier: 'best_fit',
  },
  'Saúde do Homem': {
    canonical: 'Promoção à Saúde e Prevenção de Agravos',
    tier: 'best_fit',
  },
  'Enfermagem em UTI': {
    canonical: 'Urgências e Emergências',
    tier: 'best_fit',
  },
  'Acidente Vascular Cerebral (AVC)': {
    canonical: 'Urgências e Emergências',
    tier: 'best_fit',
  },
  'Dependência Química': {
    canonical: 'Saúde Mental',
    tier: 'best_fit',
  },
  'Efeitos Adversos dos Medicamentos': {
    canonical: 'Farmacodinâmica e Farmacocinética',
    tier: 'best_fit',
  },
  'Procedimentos': {
    canonical: 'Procedimentos Diversos',
    tier: 'alias',
  },
  'Outros Temas de Enfermagem': {
    canonical: 'Procedimentos Diversos',
    tier: 'best_fit',
  },
  'Cuidados Paliativos': {
    canonical: 'Procedimentos Diversos',
    tier: 'best_fit',
  },
  'Enfermagem em Oncologia': {
    canonical: 'Procedimentos Diversos',
    tier: 'best_fit',
  },
  'Doenças Cardiovasculares e Metabólicas Crônicas (Diabete, Hipertensão, ICC etc)': {
    canonical: DCNT_MESCLADAS_LABEL,
    tier: 'best_fit',
  },
  'Doenças Cardiovasculares e Metabólicas Crônicas (Diabete, Hipertensão, ICC, etc)': {
    canonical: DCNT_MESCLADAS_LABEL,
    tier: 'best_fit',
  },
  'Doenças Autoimunes e Reumatológicas': {
    canonical: DCNT_MESCLADAS_LABEL,
    tier: 'best_fit',
  },
  'Doenças Renais e Hematológicas Crônicas': {
    canonical: DCNT_MESCLADAS_LABEL,
    tier: 'best_fit',
  },
  'Neoplasias e Câncer': {
    canonical: DCNT_MESCLADAS_LABEL,
    tier: 'best_fit',
  },
};

export function resolveCanonicalSubtopico(
  tituloAula: string | null | undefined,
): LegacySubtopicoMapping | null {
  const key = tituloAula?.trim();
  if (!key) return null;
  return LEGACY_SUBTOPICO_MAP[key] ?? null;
}
