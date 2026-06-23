import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Asma e DPOC — PCDT MS / SBPT.
 * Complementa oxigenoterapia-dispositivos-ms para SpO₂ alvo.
 */
export const RESPIRATORIO_CRONICO_MS: GuidelineTable = {
  id: 'respiratorio-cronico-ms',
  snapshot: 'Asma e DPOC — diferenciação e O₂',
  issuer: 'Ministério da Saúde / SBPT',
  title: 'Doenças respiratórias crônicas (asma, DPOC)',
  year: 2021,
  url: 'https://www.gov.br/saude/',
  entries: [
    {
      id: 'asma-reversibilidade',
      label: 'Asma',
      value: 'obstrução reversível das vias aéreas',
      detail: 'Resposta a broncodilatadores.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-persistente',
      label: 'DPOC',
      value: 'obstrução persistente e progressiva',
      detail: 'Risco de retenção de CO₂ na descompensação.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-o2-titulado',
      label: 'O₂ na DPOC descompensada',
      value: 'oxigênio titulado com monitorização',
      detail: 'Evitar altas concentrações sem controle.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-alvo',
      label: 'SpO₂ alvo DPOC retentor',
      value: '88 a 92%',
      detail: 'Não buscar 98–100% cegamente — risco de hipercapnia.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-tabagismo',
      label: 'Fator de risco DPOC',
      value: 'tabagismo é principal fator modificável',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'asma-crise',
      label: 'Crise asmática',
      value: 'broncodilatador de curta ação é primeira linha',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'pegadinha-spo2-98',
      label: 'Pegadinha SpO₂',
      value: '98 a 100% não é meta universal no DPOC retentor',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'peak-flow',
      label: 'Peak flow (PFE)',
      value: 'monitorização domiciliar da asma — zonas verde, amarela e vermelha',
      detail: 'Queda >20% do melhor valor pessoal sugere descompensação.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'corticoide-inalatorio',
      label: 'Corticoide inalatório',
      value: 'medicamento controlador da asma — uso regular',
      detail: 'PCDT MS: base do tratamento de manutenção; não substitui broncodilatador de resgate.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-descompensacao',
      label: 'Descompensação DPOC',
      value: 'dispneia intensa, alteração do escarro, cianose e confusão mental',
      detail: 'Sinais de retenção de CO₂ — buscar atendimento urgente.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-tempo-expiratorio',
      label: 'DPOC — padrão respiratório',
      value: 'tempo expiratório prolongado e uso de musculatura acessória',
      detail: 'Indica obstrução grave na exacerbação.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'asma-noturna',
      label: 'Asma noturna',
      value: 'despertares noturnos por dispneia indicam controle inadequado',
      detail: 'Critério de asma não controlada — revisar tratamento de manutenção.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'espacador',
      label: 'Espaçador (valvulado)',
      value: 'melhora deposição pulmonar do broncodilatador inalatório',
      detail: 'Recomendado com spray doseado — reduz depósito orofaríngeo.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'asma-b2-resgate',
      label: 'Broncodilatador de resgate',
      value: 'beta-2 agonista de curta ação na crise — via inalatória',
      detail: 'Uso repetido sem melhora exige avaliação urgente.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-escarro-purulento',
      label: 'Escarro purulento na DPOC',
      value: 'sinal de exacerbação infecciosa — avaliar antibiótico conforme protocolo',
      sourceId: 'respiratorio-cronico-ms',
    },
  ],
};
