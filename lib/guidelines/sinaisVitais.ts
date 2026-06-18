import type { GuidelineTable } from '@/lib/guidelines/types';

/** Faixas de referência adulto — builders de Sinais Vitais. */
export const SINAIS_VITAIS_ADULTO: GuidelineTable = {
  id: 'sv-adulto-referencia',
  snapshot: 'Referência clássica de prova (adulto)',
  issuer: 'COFEN / protocolos de enfermagem',
  title: 'Faixas de sinais vitais — adulto em repouso',
  year: 2024,
  entries: [
    {
      id: 'fc-adulto',
      label: 'FC',
      value: '60 a 100 bpm',
      detail: 'Taquicardia >100; bradicardia <60',
      sourceId: 'sv-adulto-referencia',
    },
    {
      id: 'fr-adulto',
      label: 'FR',
      value: '12 a 20 irpm',
      detail: 'Taquipneia >20',
      sourceId: 'sv-adulto-referencia',
    },
    {
      id: 'pa-adulto',
      label: 'PA',
      value: 'Normotenso ~90–140 × 60–90 mmHg (varia por fonte)',
      sourceId: 'sv-adulto-referencia',
    },
    {
      id: 'temp-axilar',
      label: 'Temperatura axilar',
      value: 'Afebril ~36–37,5°C; febre ≥37,8°C (critério comum em prova)',
      sourceId: 'sv-adulto-referencia',
    },
    {
      id: 'spo2',
      label: 'SpO₂',
      value: '≥95% adequada em ar ambiente (contexto clínico)',
      sourceId: 'sv-adulto-referencia',
    },
  ],
};
