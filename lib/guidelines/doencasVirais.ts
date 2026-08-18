import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Doenças virais de interesse epidemiológico.
 * Fontes: MS/SVSA — vigilância (sarampo/rubéola); Estratégia Influenza 2026; CNV/PNI.
 * @see https://www.gov.br/saude/pt-br/composicao/svsa/pni/notas-tecnicas/2026
 */
export const DOENCAS_VIRAIS_MS: GuidelineTable = {
  id: 'doencas-virais-ms',
  snapshot: 'Vigilância viral MS + Influenza/Sarampo NT 2026',
  issuer: 'Ministério da Saúde',
  title: 'Doenças virais de interesse epidemiológico',
  year: 2026,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/pni/notas-tecnicas/2026',
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
      value: 'vacina anual trivalente — calendário + estratégia especial',
      detail:
        'CNV: rotina 6 m a <6 a, ≥60 a e gestantes. Estratégia 2026 (NE/CO/S/SE): Dia D 28/03/2026 até 30/05/2026; Norte no 2º semestre (sazonalidade). Prioritários adicionais na campanha — ver informe MS vigente.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'influenza-esquema-crianca',
      label: 'Influenza — esquema na criança',
      value: 'já vacinada: 1 dose/ano; primeira vez (6 m–8 a): 2 doses, intervalo ≥4 semanas',
      detail:
        'Informe Estratégia Influenza 2026 (MS): aplica-se também a indígenas e crianças com comorbidade até 8 anos sem histórico.',
      sourceId: 'doencas-virais-ms',
    },
    {
      id: 'sarampo-bloqueio-dose-zero',
      label: 'Sarampo — dose zero (bloqueio)',
      value: 'SCR dose zero: 6 a 11 meses e 29 dias em bloqueio/varredura',
      detail:
        'NT MS 21/2026: dose zero não conta como rotina; completar esquema SCR aos 12 e 15 meses conforme calendário.',
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
