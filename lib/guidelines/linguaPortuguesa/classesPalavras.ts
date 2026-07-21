import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Classes de palavras — regras portáteis para concursos.
 * Card vitrine: "Classes de palavras". Ramo L3: pt_classes_palavras.
 */
export const PT_CLASSES_PALAVRAS: GuidelineTable = {
  id: 'pt-classes-palavras-concursos',
  snapshot: 'Morfologia — classe gramatical pela função na oração',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Classes de palavras',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'clas-pergunta-teste',
      label: 'Pergunta-teste (M02)',
      value: 'O que a palavra faz na oração?',
      detail: 'Classe morfológica × função sintática — prova cobra as duas camadas.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-substantivo',
      label: 'Substantivo',
      value: 'nomeia seres, objetos, ideias, lugares',
      detail: 'Comum/próprio · concreto/abstrato · simples/composto · coletivo.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-artigo',
      label: 'Artigo',
      value: 'antecede substantivo — definido (o, a) ou indefinido (um, uma)',
      detail: '«**O** paciente» (definido) · «**Um** paciente» (indefinido).',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-adjetivo',
      label: 'Adjetivo',
      value: 'caracteriza o substantivo',
      detail: '«Paciente **grave**» — pode ser predicativo com verbo de ligação.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-numeral',
      label: 'Numeral',
      value: 'indica quantidade ou ordem',
      detail: 'Cardinal (dois) × ordinal (segundo) × multiplicativo (dobro).',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-pronome',
      label: 'Pronome',
      value: 'substitui ou acompanha o nome',
      detail: 'Pessoal, possessivo, demonstrativo, relativo, indefinido — função muda a classificação.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-verbo',
      label: 'Verbo',
      value: 'indica ação, estado ou fenômeno',
      detail: 'Flexiona em tempo, modo, pessoa, número — núcleo do predicado.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-adverbio',
      label: 'Advérbio',
      value: 'modifica verbo, adjetivo ou outro advérbio',
      detail: '«Muito **bem**» · «**Ontem** chegou» — circunstância ou intensidade.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-preposicao',
      label: 'Preposição',
      value: 'liga termos, estabelecendo dependência',
      detail: 'de, em, por, para, com, a… — essencial à regência.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-conjuncao',
      label: 'Conjunção',
      value: 'liga orações ou termos de mesma função',
      detail: 'Coordenativa (e, mas) × subordinativa (que, porque, embora).',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-interjeicao',
      label: 'Interjeição',
      value: 'exprime emoção ou chamamento',
      detail: '«Ah!» · «Oxalá!» — isolada, sem função sintática com verbo.',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-pegadinha-adj-adv',
      label: 'Pegadinha — adjetivo × advérbio',
      value: '«plano novo» (adj.) × «plano **novo**» com verbo (adv.)',
      detail: '«O **novo** plano» (adj. ao nome) × «Comprou **novo**» (adv. ao verbo — raro; conferir).',
      sourceId: 'pt-classes-palavras-concursos',
    },
    {
      id: 'clas-pegadinha-pronome-artigo',
      label: 'Pegadinha — pronome × artigo',
      value: '«muito» antes de substantivo pode ser pronome indefinido',
      detail: '«Muitos pacientes» — «muitos» = pronome (quantidade), não advérbio.',
      sourceId: 'pt-classes-palavras-concursos',
    },
  ],
};
