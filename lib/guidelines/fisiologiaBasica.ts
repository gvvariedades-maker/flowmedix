import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Fisiologia humana e homeostase.
 * Complementa sv-adulto-referencia para temperatura oral e conceitos.
 */
export const FISIOLOGIA_HOMEOSTASE: GuidelineTable = {
  id: 'fisiologia-homeostase',
  snapshot: 'Homeostase e parâmetros fisiológicos adulto',
  issuer: 'Referência clínica / MS',
  title: 'Noções de Fisiologia',
  year: 2025,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
  entries: [
    {
      id: 'homeostase',
      label: 'Homeostase',
      value: 'manutenção do meio interno relativamente estável',
      detail: 'Equilíbrio dinâmico — temperatura, glicose, pH, líquidos.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'temp-oral-adulto',
      label: 'Temperatura oral adulto',
      value: '36,1 a 37,2 °C',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'taquicardia',
      label: 'Taquicardia adulto',
      value: 'FC superior a 100 bpm',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'bradicardia',
      label: 'Bradicardia adulto',
      value: 'FC inferior a 60 bpm',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'pegadinha-taqui-bradi',
      label: 'Pegadinha taqui/bradi',
      value: 'taquicardia não é FC inferior a 60 bpm',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'fc-normal-adulto',
      label: 'FC normal adulto repouso',
      value: '60 a 100 bpm',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'fr-normal-adulto',
      label: 'FR normal adulto',
      value: '12 a 20 irpm',
      detail: 'Taquipneia >20 irpm; bradipneia <12 irpm em repouso.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'pa-normal-adulto',
      label: 'PA normal adulto',
      value: 'Aproximadamente 120 × 80 mmHg (ótimo/normal)',
      detail:
        'Diretrizes Brasileiras de Hipertensão Arterial (SBC/DBHA): hipertensão ≥140 × 90 mmHg consultório — alinhar a sinais-vitais guideline.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'glicemia-jejum',
      label: 'Glicemia de jejum',
      value: '70 a 99 mg/dL — normal',
      detail:
        'SBD/MS: pré-diabetes 100–125 mg/dL; diabetes ≥126 mg/dL (duas dosagens ou critérios complementares).',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'hipoxia-conceito',
      label: 'Hipóxia',
      value: 'Deficiência de oxigênio nos tecidos',
      detail: 'SpO₂ <90% em ar ambiente indica hipoxemia significativa; causas respiratórias, circulatórias ou hematológicas.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'acidose-conceito',
      label: 'Acidose',
      value: 'pH sanguíneo <7,35',
      detail: 'Metabólica (ex.: cetoacidose, acidose láctica) ou respiratória (hipoventilação, DPOC). Alcalose: pH >7,45.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'alcalose-conceito',
      label: 'Alcalose',
      value: 'pH sanguíneo >7,45',
      detail: 'Pode ser metabólica (perda de H⁺ ou ganho de bicarbonato) ou respiratória (hiperventilação).',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'ph-normal-sangue',
      label: 'pH sanguíneo normal',
      value: '7,35 a 7,45',
      detail: 'Estreita faixa mantida por sistemas tampão renal e respiratório.',
      sourceId: 'fisiologia-homeostase',
    },
    {
      id: 'pegadinha-hipoxia-hipoxemia',
      label: 'Pegadinha hipóxia/hipoxemia',
      value: 'Hipoxemia é baixa PaO₂ no sangue; hipóxia é déficit de O₂ nos tecidos',
      sourceId: 'fisiologia-homeostase',
    },
  ],
};
