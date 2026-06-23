import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Queimaduras — classificação por profundidade.
 * Fonte: MS — protocolo de atendimento a queimaduras / ABQUEIMAD.
 */
export const FERIDAS_QUEIMADURAS_MS: GuidelineTable = {
  id: 'feridas-queimaduras-ms',
  snapshot: 'Queimaduras — graus e sinais clínicos',
  issuer: 'Ministério da Saúde',
  title: 'Feridas e queimaduras',
  year: 2021,
  url: 'https://www.gov.br/saude/',
  entries: [
    {
      id: 'queimadura-1grau',
      label: '1º grau',
      value: 'apenas epiderme — eritema e dor, sem bolhas',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'queimadura-2superficial',
      label: '2º grau superficial',
      value: 'bolhas e dor intensa — derme papilar',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'queimadura-2profundo',
      label: '2º grau profundo',
      value: 'menor dor — derme reticular, risco de cicatriz',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'queimadura-3grau',
      label: '3º grau',
      value: 'destruição de espessura total',
      detail: 'Aspecto branco/escuro — dor reduzida por lesão nervosa.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'pegadinha-dor-3grau',
      label: 'Pegadinha dor 3º grau',
      value: '3º grau não é sempre muito doloroso',
      detail: 'Destruição nervosa pode reduzir dor percebida.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'bolha-indica-grau',
      label: 'Bolhas',
      value: 'presença de bolha indica pelo menos 2º grau',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'regra-9',
      label: 'Regra dos 9 (adulto)',
      value: 'cabeça/pescoço 9%, tronco anterior 18%, cada membro superior 9%',
      detail: 'Estimativa de superfície corporal queimada.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'cicatrizacao-fases',
      label: 'Fases da cicatrização',
      value: 'inflamatória → proliferativa → maturação/remodelamento',
      detail: 'Sequência fisiológica de fechamento da ferida.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'cicatrizacao-inflamatoria',
      label: 'Fase inflamatória',
      value: 'primeiras 24 a 72 h — hemostasia e migração celular',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'curativo-umido',
      label: 'Curativo úmido',
      value: 'ambiente úmido favorece epitelização e reduz dor',
      detail: 'Princípio do tratamento moderno de feridas — não manter ferida seca de rotina.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'profilaxia-tetano',
      label: 'Profilaxia do tétano',
      value: 'avaliar esquema vacinal e necessidade de imunoglobulina',
      detail: 'Conforme tipo de ferida (limpa, contaminada, punctura) e status vacinal.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'escarectomia',
      label: 'Escarectomia',
      value: 'remoção de tecido necrótico/eschar em queimaduras profundas',
      detail: 'Facilita cicatrização; não romper bolhas íntegras sem indicação.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'bolha-integra',
      label: 'Bolhas íntegras',
      value: 'proteger a bolha — barreira natural contra infecção',
      detail: 'Esfacelar rotineiramente não é conduta padrão.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'queimadura-quimica',
      label: 'Queimadura química',
      value: 'lavagem abundante com água corrente por 15 a 20 min ou mais',
      detail: 'Remover roupa contaminada; não neutralizar com substâncias sem orientação.',
      sourceId: 'feridas-queimaduras-ms',
    },
    {
      id: 'queimadura-quimica-olhos',
      label: 'Queimadura química ocular',
      value: 'irrigação contínua imediata com SF 0,9% ou água',
      detail: 'Emergência oftalmológica — não aguardar para iniciar lavagem.',
      sourceId: 'feridas-queimaduras-ms',
    },
  ],
};
