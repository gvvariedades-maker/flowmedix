import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Asma e DPOC — PCDT MS/CONITEC.
 * Complementa oxigenoterapia-dispositivos-ms para SpO₂ alvo.
 * Fontes: PCDT DPOC (Portaria/Relatório CONITEC 2025) · PCDT Asma (Portaria SAES/SECTICS 32/2023; atualização 2026).
 */
export const RESPIRATORIO_CRONICO_MS: GuidelineTable = {
  id: 'respiratorio-cronico-ms',
  snapshot: 'Asma PCDT + DPOC PCDT CONITEC 2025 — SpO₂ e O₂',
  issuer: 'Ministério da Saúde / CONITEC',
  title: 'Doenças respiratórias crônicas (asma, DPOC)',
  year: 2025,
  url: 'https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-da-doenca-pulmonar-obstrutiva-cronica',
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
      label: 'SpO₂ alvo DPOC retentor (exacerbação)',
      value: '88 a 92%',
      detail:
        'Titular O₂ para evitar hiperóxia/hipercapnia. PCDT DPOC: SpO₂ <92% em repouso → gasometria; LTOT se SpO₂ <88% (critérios abaixo).',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-espirometria',
      label: 'DPOC — diagnóstico',
      value: 'espirometria com VEF₁/CVF < 0,70 pós-broncodilatador',
      detail:
        'PCDT DPOC/GOLD: confirma obstrução persistente; classificação por sintomas e risco de exacerbações.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-gasometria',
      label: 'DPOC — SpO₂ e gasometria',
      value: 'SpO₂ < 92% → indicar gasometria arterial',
      detail:
        'PCDT DPOC CONITEC 2025: oximetria na 1ª consulta e no seguimento; VEF₁ <50% — SpO₂ em todas as consultas.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-ltot-criterios',
      label: 'Oxigenoterapia domiciliar contínua (LTOT)',
      value: 'PaO₂ < 55 mmHg ou SpO₂ < 88% (≥15 h/dia)',
      detail:
        'PCDT DPOC: ou PaO₂ 55–60 / SpO₂ = 88% com hipertensão pulmonar, edema/ICC ou Ht >55%; alvo SpO₂ ≥90% no ajuste de fluxo.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-89-ambiente',
      label: 'SpO₂ em ar ambiente (exacerbação)',
      value: '89% — hipoxemia na DPOC exacerbada',
      detail: 'Cenário de prova: indicar oxigenoterapia titulada com FiO₂ controlada.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-titulacao-exacerbacao',
      label: 'SpO₂ titulação na exacerbação',
      value: '90% a 93% — meta com O₂ de baixo fluxo',
      detail: 'Prescrição típica com Venturi; monitorar para evitar hiperóxia no retentor.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-93-limite',
      label: 'SpO₂ limite superior (titulação)',
      value: '93% — teto comum na exacerbação',
      detail: 'Acima disso aumenta risco de retenção de CO₂ no DPOC retentor.',
      sourceId: 'respiratorio-cronico-ms',
    },
    {
      id: 'dpoc-spo2-86-baseline',
      label: 'SpO₂ baseline na exacerbação',
      value: '86% — hipoxemia na DPOC descompensada',
      detail: 'Cenário de prova: indicar oxigenoterapia titulada com monitorização.',
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
