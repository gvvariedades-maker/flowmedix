import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Doenças virais de interesse epidemiológico.
 * Fontes: MS/SVS — guias de vigilância (sarampo, influenza, poliomielite).
 */
export const DOENCAS_VIRAIS_MS: GuidelineTable = {
  id: 'doencas-virais-ms',
  snapshot: 'Vigilância viral — notificação e vacinação',
  issuer: 'Ministério da Saúde',
  title: 'Doenças virais de interesse epidemiológico',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sarampo',
  entries: [
    {
      id: 'sarampo-notificacao',
      label: 'Sarampo',
      value: 'notificação compulsória imediata',
      detail: 'Alta transmissibilidade — bloqueio vacinal em surtos.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'sarampo-prevencao',
      label: 'Prevenção sarampo',
      value: 'vacina tríplice viral (SCR)',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'influenza-transmissao',
      label: 'Influenza — transmissão',
      value: 'gotículas e contato',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'influenza-vacina',
      label: 'Influenza — vacina',
      value: 'vacina anual para grupos prioritários',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'polio-eliminacao',
      label: 'Poliomielite no Brasil',
      value: 'eliminada — manter cobertura vacinal',
      detail: 'Eliminação não dispensa vacinação — risco de reintrodução.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'covid-vigilancia',
      label: 'Covid-19',
      value: 'notificação e medidas conforme protocolos MS vigentes',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'viral-pegadinha-vacina',
      label: 'Pegadinha eliminação',
      value: 'erradicação/eliminacao não significa fim da vacinação',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'rubeola-notificacao',
      label: 'Rubéola',
      value: 'notificação compulsória — risco de síndrome da rubéola congênita',
      detail: 'Gestante exposta: investigar imunidade; vacina tríplice viral (SCR) na prevenção.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'varicela-notificacao',
      label: 'Varicela (catapora)',
      value: 'notificação compulsória — alta transmissibilidade',
      detail: 'Vacina no PNI; isolamento de contactantes suscetíveis; gestante sem imunidade — risco fetal.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'hepatite-b-transmissao',
      label: 'Hepatite B',
      value: 'transmissão parenteral, sexual e vertical (perinatal)',
      detail: 'Vacina hepatite B no calendário PNI (dose ao nascer); profilaxia em exposição ocupacional.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'covid-isolamento',
      label: 'Covid-19 — isolamento',
      value: 'Precaução de contato e gotículas; aerossóis em procedimentos geradores',
      detail: 'Máscara cirúrgica/N95 conforme risco; higiene das mãos; ventilação adequada do ambiente.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'febre-amarela',
      label: 'Febre amarela',
      value: 'transmissão por mosquitos (Aedes, Haemagogus) — notificação compulsória',
      detail: 'Vacinação em áreas de risco/endêmicas; dose única válida (reforço conforme calendário vigente).',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'rubeola-vacina',
      label: 'Prevenção rubéola',
      value: 'vacina tríplice viral (SCR) — contraindicada na gestação',
      detail: 'Mulher em idade fértil: vacinar antes da gravidez; aguardar 30 dias pós-vacina.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'hepatite-b-hbsag',
      label: 'Hepatite B — marcador',
      value: 'HBsAg positivo indica infecção ativa',
      detail: 'Anti-HBs indica imunidade (vacina ou cura); triagem em gestantes e profissionais de saúde.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'viral-pegadinha-antibiotico',
      label: 'Pegadinha viral × antibiótico',
      value: 'antibiótico não trata infecção viral — uso inadequado gera resistência',
      sourceId: 'doencas-virais-ms',
    },
  ],
};
