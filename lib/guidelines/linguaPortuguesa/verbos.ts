import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Verbos — tempos, modos e vozes — regras portáteis para concursos.
 * Card vitrine: "Verbos — tempos, modos e vozes". Ramo L3: pt_verbos.
 */
export const PT_VERBOS: GuidelineTable = {
  id: 'pt-verbos-concursos',
  snapshot: 'Verbos — tempo, modo, voz e correlação temporal',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Verbos — tempos, modos e vozes',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'verb-pergunta-teste',
      label: 'Pergunta-teste (M14)',
      value: 'Qual tempo/modo? A ação é anterior, simultânea ou posterior?',
      detail: 'Tempo = quando · Modo = atitude do falante · Voz = sujeito ativo ou paciente.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-presente',
      label: 'Presente do indicativo',
      value: 'ação atual, habitual ou atemporal',
      detail: '«O enfermeiro **atende**» — fato habitual ou verdade geral.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-pret-perfeito',
      label: 'Pretérito perfeito',
      value: 'ação concluída no passado',
      detail: '«O paciente **melhorou**» — fato pontual, encerrado.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-pret-imperfeito',
      label: 'Pretérito imperfeito',
      value: 'ação contínua, habitual ou interrompida no passado',
      detail: '«**Chovia** quando saí» — ação em curso ou cenário de fundo.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-pret-mais-que-perfeito',
      label: 'Mais-que-perfeito',
      value: 'ação anterior a outra passada',
      detail: '«**Tinha** chegado quando liguei» — anterioridade no passado.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-futuro',
      label: 'Futuro do presente / pretérito',
      value: 'ação futura ou futura vista do passado',
      detail: '«**Farei**» (presente) · «**Faria**» (pretérito do futuro / condicional).',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-subjuntivo',
      label: 'Subjuntivo',
      value: 'dúvida, desejo, hipótese, concessão',
      detail: 'Presente, imperfeito, futuro — após «que» em orações subordinadas e em «talvez».',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-imperativo',
      label: 'Imperativo',
      value: 'ordem, pedido, conselho',
      detail: 'Afirmativo → ênclise possível · Negativo → próclise («Não **me** diga»).',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-locucao-verbal',
      label: 'Locução verbal',
      value: 'verbo auxiliar + infinitivo/gerúndio/particípio',
      detail: '«**Está** estudando» · «**Vai** fazer» — tempo/aspecto na locução.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-voz-ativa-passiva',
      label: 'Voz ativa × passiva',
      value: 'ativa: sujeito pratica · passiva: sujeito sofre a ação',
      detail: '«O médico atendeu» (ativa) · «O paciente foi atendido» (passiva analítica).',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-voz-reflexiva',
      label: 'Voz reflexiva',
      value: 'sujeito pratica e sofre a ação sobre si',
      detail: '«Ele **se** feriu» — pronome reflexivo = sujeito = paciente.',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-correlacao-temporal',
      label: 'Correlação temporal',
      value: 'tempos harmonizados entre orações',
      detail: '«**Estudava** quando **chegou**» — imperfeito (fundo) + perfeito (pontual).',
      sourceId: 'pt-verbos-concursos',
    },
    {
      id: 'verb-pegadinha-participio',
      label: 'Pegadinha — particípio irregular',
      value: 'aceito, eleito, pago, morto… — conferir forma',
      detail: 'Particípio errado invalida locução e concordância verbal (ter + particípio).',
      sourceId: 'pt-verbos-concursos',
    },
  ],
};
