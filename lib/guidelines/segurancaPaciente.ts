import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Segurança do Paciente — PNSP, identificação, quedas, eventos adversos, metas OMS.
 * Fontes: MS/PNSP Portaria 529/2013, OMS metas internacionais, ANVISA.
 */
export const SEGURANCA_PACIENTE_PNSP: GuidelineTable = {
  id: 'seguranca-paciente-pnsp',
  snapshot: 'PNSP — identificação, quedas, eventos adversos',
  issuer: 'Ministério da Saúde / OMS',
  title: 'Segurança do Paciente',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/composicao/sctie/nsp',
  entries: [
    {
      id: 'sp-dois-identificadores',
      label: 'Identificação segura',
      value: 'mínimo dois identificadores independentes antes de medicação e procedimento',
      detail: 'Nome + data de nascimento ou prontuário — pulseira recomendada.',
      sourceId: 'seguranca-paciente-pnsp',
    },
    {
      id: 'sp-pulseira-identificacao',
      label: 'Pulseira de identificação',
      value: 'nome completo e data de nascimento na admissão',
      detail: 'Reduz erro de paciente errado — conferir antes de cada intervenção.',
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
  ],
};
