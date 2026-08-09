import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Epidemiologia e vigilância epidemiológica.
 * Fonte: Lista Nacional de Notificação Compulsória (Portarias GM/MS 10.175/2026 e 11.211/2026)
 * + Guia de Vigilância em Saúde (conceitos estáveis).
 * @see https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria
 */
export const EPIDEMIOLOGIA_MS: GuidelineTable = {
  id: 'epidemiologia-ms',
  snapshot: 'Notificação compulsória Lista Nacional 2026 + indicadores',
  issuer: 'Ministério da Saúde',
  title: 'Epidemiologia e vigilância epidemiológica',
  year: 2026,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
  entries: [
    {
      id: 'incidencia',
      label: 'Incidência',
      value: 'casos novos em período / população em risco',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'prevalencia',
      label: 'Prevalência',
      value: 'casos existentes em período / população',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'vigilancia-epidemiologica',
      label: 'Vigilância epidemiológica',
      value: 'coleta, análise e disseminação de dados sobre eventos de saúde',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'notificacao-compulsoria',
      label: 'Notificação compulsória',
      value: 'obrigatória para agravos da Lista Nacional (SINAN)',
      detail:
        'Lista atualizada por Portarias GM/MS (ex.: 10.175/2026 e 11.211/2026). Imediata (≤24h) ou semanal conforme agravo.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'lista-nc-2026-novos',
      label: 'Lista NC 2026 — inclusões recentes',
      value: 'anomalias congênitas; caxumba (parotidite); febre do Oropouche',
      detail:
        'Portarias GM/MS 10.175/2026 e 11.211/2026. Covid-19 sai como item isolado e permanece sob síndrome gripal/SRAG confirmada — checar lista vigente na prova.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'pfa-vigilancia',
      label: 'PFA — vigilância',
      value: 'investigar toda paralisia flácida aguda',
      detail: 'Síndrome sentinela para poliomielite.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'polio-ultimo-caso-br',
      label: 'Poliomielite — último caso selvagem no Brasil',
      value: '1989',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'polio-americas',
      label: 'Poliomielite — Américas',
      value: 'certificadas livres de transmissão autóctone do poliovírus selvagem',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'polio-prevencao',
      label: 'Prevenção poliomielite',
      value: 'vacinação é principal medida (VIP/VOP)',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'rn-protecao-passiva',
      label: 'RN e poliomielite',
      value: 'proteção materna passiva e temporária',
      detail: 'Não é ausência total de proteção — pegadinha de prova.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'surto-def',
      label: 'Surto',
      value: 'aumento de casos acima do esperado em área ou grupo delimitado',
      detail: 'Guia de Vigilância em Saúde — exige investigação epidemiológica imediata.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'endemia-def',
      label: 'Endemia',
      value: 'ocorrência habitual de agravo em determinada área',
      detail: 'Presença constante — nível basal conhecido na população.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'epidemia-def',
      label: 'Epidemia',
      value: 'aumento de casos acima do esperado em região ou período',
      detail: 'Supera o limiar endêmico — pode evoluir para surto ou pandemia conforme extensão.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'pandemia-def',
      label: 'Pandemia',
      value: 'epidemia com disseminação ampla — múltiplos países ou continentes',
      detail: 'COVID-19 (2020) é exemplo — vigilância internacional coordenada (OMS).',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'taxa-mortalidade',
      label: 'Taxa de mortalidade',
      value: 'óbitos por agravo / população exposta em período × fator (ex.: 100.000)',
      detail: 'Indicador de gravidade — distinto de letalidade (óbitos/casos).',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'taxa-letalidade',
      label: 'Taxa de letalidade',
      value: 'óbitos por agravo / total de casos do agravo × 100',
      detail: 'Mede proporção de mortes entre os doentes — não confundir com mortalidade.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'vigilancia-sentinela',
      label: 'Vigilância sentinela',
      value: 'unidades selecionadas monitoram agravos específicos continuamente',
      detail: 'Ex.: ILI/SARI para influenza — detecta tendências antes da notificação universal.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'sinan-def',
      label: 'SINAN',
      value: 'Sistema de Informação de Agravos de Notificação',
      detail: 'Banco nacional de notificações compulsórias — alimentado por ficha individual por agravo.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'notificacao-imediata-24h',
      label: 'Notificação imediata',
      value: 'comunicar à autoridade de saúde em até 24 horas',
      detail:
        'Lista Nacional vigente — ex.: sarampo/doenças exantemáticas, meningite, raiva, violência, PFA, botulismo. Confirmar coluna MS/SES/SMS na portaria.',
      sourceId: 'epidemiologia-ms',
    },
    {
      id: 'notificacao-semanal-7dias',
      label: 'Notificação semanal',
      value: 'comunicar à autoridade de saúde em até 7 dias',
      detail:
        'Agravos de rotina na Lista Nacional (ex.: dengue casos, esquistossomose, hepatites conforme periodicidade da portaria vigente).',
      sourceId: 'epidemiologia-ms',
    },
  ],
};
