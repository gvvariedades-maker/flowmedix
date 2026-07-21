import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Colocação pronominal — próclise, ênclise, mesóclise (norma culta / concursos).
 * Card vitrine: "Pronomes e colocação pronominal".
 * Complementa skill professor-lingua-portuguesa.
 */
export const PT_COLOCACAO_PRONOMINAL: GuidelineTable = {
  id: 'pt-colocacao-pronominal',
  snapshot: 'Colocação pronominal — próclise / ênclise / mesóclise',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Colocação pronominal',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'coloc-definicao',
      label: 'O que é colocação',
      value: 'posição do pronome oblíquo átono em relação ao verbo',
      detail: 'me, te, se, o, a, lhe, nos, vos, os, as, lhes…',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-proclise',
      label: 'Próclise',
      value: 'pronome antes do verbo',
      detail: 'Ex.: não me diga. Atração por palavra atrativa.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-enclise',
      label: 'Ênclise',
      value: 'pronome depois do verbo',
      detail: 'Ex.: diga-me. Padrão quando não há atrativo e o verbo inicia a oração.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-mesoclise',
      label: 'Mesóclise',
      value: 'pronome no meio do verbo (futuro do presente/pretérito)',
      detail: 'Ex.: dir-lhe-ei, cantar-se-ia. Só com futuro; se houver atrativo → próclise.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-atrativos',
      label: 'Palavras atrativas (próclise)',
      value: 'negação, relativos, indefinidos, interrogativos, certos advérbios',
      detail: 'não, nunca, ninguém, que, quem, onde, quanto, sempre, já, talvez…',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-negacao',
      label: 'Negação',
      value: 'não / nunca / jamais → próclise',
      detail: 'Ex.: não se preocupe. Ênclise após negação = erro clássico.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-relativo',
      label: 'Pronome relativo / conjunção',
      value: 'que / quem / onde / quando / se → próclise',
      detail: 'Ex.: o livro que me deram. “que” atrai o átono.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-inicio-oracao',
      label: 'Início de oração',
      value: 'verbo iniciando período → ênclise (norma culta)',
      detail: 'Ex.: Diga-me a verdade. Próclise no início = falha típica de prova.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-infinitivo',
      label: 'Infinitivo',
      value: 'ênclise comum; próclise se houver atrativo antes',
      detail: 'Ex.: quero vê-lo / para não o ver. Preposição + infinitivo: banca varia — provar.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-gerundio',
      label: 'Gerúndio',
      value: 'ênclise padrão; próclise com atrativo',
      detail: 'Ex.: fazendo-o / não o fazendo.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-participio',
      label: 'Particípio',
      value: 'particípio não admite ênclise',
      detail: 'Ênclise no auxiliar: tinha-me dito. Com atrativo: não me tinha dito.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-locucao-verbal',
      label: 'Locução verbal',
      value: 'pronome junto ao verbo principal ou ao auxiliar (regras de atração)',
      detail: 'Auxiliar + principal: se houver atrativo, próclise no conjunto; senão ênclise no principal é comum.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-futuro-atrativo',
      label: 'Futuro com atrativo',
      value: 'atrativo + futuro → próclise (não mesóclise)',
      detail: 'Ex.: não lhe direi (não: não dir-lhe-ei).',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-o-a-lo-la',
      label: 'o/a → lo/la após R/S/Z',
      value: 'verbo terminado em r/s/z + o/a → lo/la; perde a consoante',
      detail: 'Ex.: fazê-lo, amá-la. Após -mos: no-lo / vo-lo.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-imperativo',
      label: 'Imperativo',
      value: 'afirmativo → ênclise; negativo → próclise',
      detail: 'Ex.: diga-me / não me diga.',
      sourceId: 'pt-colocacao-pronominal',
    },
    {
      id: 'coloc-pegadinha-inicio',
      label: 'Pegadinha — próclise no início',
      value: 'não iniciar frase com átono (norma culta)',
      detail: '“Me diga” atraente na fala; na prova culta = diga-me (salvo atrativo).',
      sourceId: 'pt-colocacao-pronominal',
    },
  ],
};
