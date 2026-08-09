import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Segurança do Paciente — PNSP, identificação, quedas, eventos adversos, metas OMS.
 * Fontes: Portaria MS 529/2013 (PNSP); Protocolos básicos MS/Anvisa (identificação, quedas, etc.);
 * Avaliação Nacional das Práticas 2025 (Anvisa) — protocolos ainda vigentes.
 * @see https://www.gov.br/saude/pt-br/composicao/saes/seguranca-do-paciente
 */
export const SEGURANCA_PACIENTE_PNSP: GuidelineTable = {
  id: 'seguranca-paciente-pnsp',
  snapshot: 'PNSP + Protocolos Anvisa (identificação/quedas) — revisão 2025',
  issuer: 'Ministério da Saúde / Anvisa',
  title: 'Segurança do Paciente',
  year: 2025,
  url: 'https://www.gov.br/saude/pt-br/composicao/saes/seguranca-do-paciente',
  entries: [
    {
      id: 'sp-dois-identificadores',
      label: 'Identificação segura',
      value: 'mínimo dois identificadores independentes antes de medicação e procedimento',
      detail:
        'Protocolo MS/Anvisa: nome completo, nome da mãe, data de nascimento ou prontuário — nunca leito/quarto como identificador.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-pulseira-identificacao',
      label: 'Pulseira de identificação',
      value: 'pulseira branca padronizada na admissão — conferir antes de cada cuidado',
      detail:
        'Protocolo Identificação do Paciente: aplicar a internados, hospital-dia, emergência e ambulatório. RN: nome da mãe + prontuário do RN.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-meta-1-identificar',
      label: 'Meta 1 OMS',
      value: 'identificar corretamente o paciente',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-meta-6-quedas',
      label: 'Meta 6 OMS',
      value: 'reduzir o risco de quedas',
      detail: 'Avaliação de risco (ex.: Morse), ambiente seguro, grades e supervisão.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-morse-escala',
      label: 'Escala de Morse',
      value: 'instrumento de estratificação de risco de queda',
      detail: 'Pontuação guia intervenções — não substitui cuidado contínuo.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-grades-cama',
      label: 'Grades da cama',
      value: 'elevadas enquanto o paciente estiver no leito — complemento, não medida única',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-evento-adverso',
      label: 'Evento adverso',
      value: 'incidente que resultou em dano ao paciente',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-incidente-sem-dano',
      label: 'Incidente sem dano',
      value: 'atingiu o paciente mas não causou dano',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-quase-erro',
      label: 'Quase-erro (near miss)',
      value: 'não atingiu o paciente',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-notificacao-evento',
      label: 'Notificação de eventos',
      value: 'cultura de segurança — notificar para aprendizado organizacional',
      detail: 'PNSP Portaria 529/2013 — sem cultura de punição.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-pegadinha-urgencia-id',
      label: 'Pegadinha — urgência dispensa ID',
      value: 'falso — alto risco exige identificação mesmo em urgência',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-pegadinha-quarto-id',
      label: 'Pegadinha — quarto como identificador',
      value: 'leito/quarto não substitui identificação no paciente',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-higienizacao-maos',
      label: 'Higienização das mãos',
      value: 'meta internacional — momento da higiene das mãos',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-protocolos-basicos-pnsp',
      label: 'Protocolos básicos PNSP (MS/Anvisa)',
      value: 'cirurgia segura · identificação · LPP · HH · quedas · medicamentos',
      detail:
        'Seis protocolos nacionais do PNSP — base da Avaliação Nacional das Práticas de Segurança do Paciente (Anvisa 2025).',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-confirmar-antes-cuidado',
      label: 'Confirmar ID antes do cuidado',
      value: 'medicação, sangue, coleta, dieta e procedimento invasivo',
      detail: 'Protocolo Identificação: confirmar mesmo conhecendo o paciente — a cada intervenção.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-rdc-36-nsp',
      label: 'NSP (RDC Anvisa 36/2013)',
      value: 'Núcleo de Segurança do Paciente + Plano de Segurança do Paciente',
      detail: 'Serviços de saúde devem implementar NSP e PSP com protocolos de gestão de risco.',
      sourceId: 'seguranca-paciente-pnsp',
    },
  ],
};
