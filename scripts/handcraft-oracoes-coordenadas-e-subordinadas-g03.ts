#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — oracoes-coordenadas-e-subordinadas-g03 (8 slugs · Orações coordenadas e subordinadas · lote 3).
 *
 *   npx tsx scripts/handcraft-oracoes-coordenadas-e-subordinadas-g03.ts
 *   npm run audit:questao-readiness -- --lote=oracoes-coordenadas-e-subordinadas-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=oracoes-coordenadas-e-subordinadas-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'oracoes-coordenadas-e-subordinadas-g03';
const SUBTOPICO = 'Orações coordenadas e subordinadas';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_oracoes_subordinadas';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-oracoes-adversativa-pocinhos.json';

const ORACOES_SOURCE = {
  id: 'pt-oracoes-subordinadas-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Orações coordenadas e subordinadas — dependência, conectivos e classificação',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'coordenação × subordinação',
    'oração subordinada adjetiva restritiva',
    'oração subordinada adjetiva explicativa',
    'vírgula: restritiva × explicativa',
    'pronome relativo «que» — funções',
    'substituição de pronome relativo (em que / no qual / cujo)',
    'contagem de orações em período composto',
    'pergunta-teste de dependência',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment';

type Spec = {
  family: Family;
  meta: {
    banca: string;
    prova: string;
    orgao: string;
    ano: string;
    cargo_header?: string;
  };
  instruction: string;
  text_fragment?: string;
  options: Opt[];
  source_tec_id: string;
  source_note: string;
  slides: unknown[];
  guidelineOverride?: string;
};

const slideMeta = { topico: TOPICO, subtopico: SUBTOPICO };

function metaBase(spec: Spec, slug: string) {
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:oracoes-coordenadas-e-subordinadas-g03',
      guideline_snapshot:
        spec.guidelineOverride ??
        `M07 Elias TE-simples — trilho período → dependência → conectivo · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      ORACOES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'coordenação e subordinação'],
      },
    ],
  };
}

function build(slug: string, spec: Spec) {
  const qd: { instruction: string; options: Opt[]; text_fragment?: string } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'cpcon-uepb-a-oracoes-leia-o-texto-i-para-responder-a-ques-3651723': {
    family: 'text_fragment',
    source_tec_id: '3651723',
    source_note:
      'As formigas (Lygia Fagundes Telles) — «que» adjetiva restritiva — CPCON UEPB Ag Adm (Pref São Bentinho) 2025 tec 3651723',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref São Bentinho)',
      orgao: 'Pref. São Bentinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «Demorei para reconhecer minha prima que me segurava pelos cotovelos», a oração introduzida pelo conectivo «que» pode ser classificada como:',
    text_fragment:
      '<p>Trecho de «As formigas», de Lygia Fagundes Telles (adaptado). «No topo da escada o anão me agarrou pelos pulsos e rodopiou comigo até o quarto. Acorda, acorda! <strong>Demorei para reconhecer minha prima que me segurava pelos cotovelos</strong>. Estava lívida. E vesga.»</p>',
    options: [
      { id: 'A', text: 'oração adjetiva.', is_correct: true },
      { id: 'B', text: 'oração substantiva.', is_correct: false },
      { id: 'C', text: 'oração coordenada sindética.', is_correct: false },
      { id: 'D', text: 'oração adverbial.', is_correct: false },
      { id: 'E', text: 'oração coordenada assindética.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A quem o «que» se refere',
        chip_label: 'Ache o antecedente',
        meta: slideMeta,
        items: [
          {
            label: '1. Ache o antecedente',
            detail: '«Que» vem logo depois de «minha prima» — um substantivo (pessoa).',
            icon: 'Search',
          },
          {
            label: '2. Substantivo → adjetiva',
            detail: 'Pronome relativo retomando substantivo = oração subordinada adjetiva.',
            icon: 'GitBranch',
          },
          {
            label: '3. Sem vírgula = restritiva',
            detail: 'Não há vírgula antes de «que» — a oração especifica qual prima, não é acessória.',
            icon: 'Minus',
          },
          {
            label: 'Pegadinha',
            detail: 'Sonolência da narradora pode distrair — o teste sintático é sempre o mesmo: o que o «que» retoma?',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '«Que» + substantivo antecedente = oração adjetiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'As formigas → cargo',
        meta: slideMeta,
        steps: [
          'Trecho «As formigas»: «Demorei para reconhecer minha prima que me segurava pelos cotovelos».',
          'B: substantiva completaria um verbo (dizer que, achar que) — aqui «que» retoma «prima», não completa «demorei».',
          'C/E: coordenada exige oração independente ligada à anterior — «que me segurava» depende de «prima», não é independente.',
          'D: adverbial pede noção de tempo/causa/condição — aqui não há; o «que» apenas qualifica «prima».',
          '«Que me segurava pelos cotovelos» especifica qual prima, sem vírgula — é termo do substantivo «prima».',
          'Gabarito A — oração subordinada adjetiva.',
          'Em similares: sempre teste se o «que» está colado a um substantivo (adjetiva) ou a um verbo que pede complemento (substantiva).',
        ],
        footer_rule: '«Que» colado a substantivo = adjetiva, não substantiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Teste do antecedente',
        meta: slideMeta,
        content: 'A QUEM O «QUE» SE REFERE?',
        rows: [
          { label: 'Adjetiva', value: '«Que» retoma substantivo antecedente (prima que…, livro que…).' },
          { label: 'Substantiva', value: '«Que» completa verbo de discurso/opinião (disse que, acha que…).' },
          { label: 'Restritiva', value: 'Sem vírgula — especifica qual elemento entre vários.' },
          { label: 'Explicativa', value: 'Com vírgula — acrescenta informação extra, não restringe.' },
          { label: 'Nesta questão', value: 'prima que… → adjetiva restritiva (A)' },
        ],
        footer_rule: 'Substantivo antes do «que» é o primeiro sinal de adjetiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir função do «que» pelo verbo anterior',
        items: [
          {
            label: 'B — substantiva',
            detail: '«Demorei para reconhecer» parece um verbo que pede complemento com «que».',
            correct: 'O «que» não completa «demorei»; ele qualifica «prima», que está mais próxima — é adjetiva.',
          },
          {
            label: 'C — coordenada sindética',
            detail: 'Duas ideias seguidas na narrativa parecem apenas somadas.',
            correct: '«Que me segurava» depende de «prima» — não é oração independente coordenada.',
          },
          {
            label: 'D — adverbial',
            detail: 'O clima de sono e susto sugere uma circunstância (quando, enquanto).',
            correct: 'Não há conectivo de tempo/causa; «que» apenas especifica «prima».',
          },
          {
            label: 'E — coordenada assindética',
            detail: 'Ausência de outro conectivo antes de «que» pode sugerir independência.',
            correct: 'Assindética exigiria duas orações independentes sem conjunção — aqui há dependência clara ao substantivo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «prima» por outro substantivo (colega, vizinho).',
            correct: 'Mesmo trilho: substantivo + que + qualificação = adjetiva restritiva.',
          },
        ],
        footer_rule: 'A: oração subordinada adjetiva (restritiva).',
      },
    ],
  },

  'cpcon-uepb-a-oracoes-leia-o-texto-i-para-responder-a-ques-3654542': {
    family: 'text_fragment',
    source_tec_id: '3654542',
    source_note:
      'As formigas (Lygia Fagundes Telles) — «que» adjetiva restritiva — CPCON UEPB ACS (Pref R Sto Antônio) 2025 tec 3654542',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref R Sto Antônio)',
      orgao: 'Pref. R Sto Antônio',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'No trecho «Demorei para reconhecer minha prima que me segurava pelos cotovelos», a oração introduzida pelo conectivo «que» pode ser classificada como:',
    text_fragment:
      '<p>Trecho de «As formigas», de Lygia Fagundes Telles (adaptado). «No topo da escada o anão me agarrou pelos pulsos e rodopiou comigo até o quarto. Acorda, acorda! <strong>Demorei para reconhecer minha prima que me segurava pelos cotovelos</strong>. Estava lívida. E vesga.»</p>',
    options: [
      { id: 'A', text: 'oração adjetiva.', is_correct: true },
      { id: 'B', text: 'oração substantiva.', is_correct: false },
      { id: 'C', text: 'oração coordenada sindética.', is_correct: false },
      { id: 'D', text: 'oração adverbial.', is_correct: false },
      { id: 'E', text: 'oração coordenada assindética.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A quem o «que» se refere',
        chip_label: 'Ache o antecedente',
        meta: slideMeta,
        items: [
          {
            label: '1. Ache o antecedente',
            detail: '«Que» aparece logo após «minha prima» — um substantivo concreto.',
            icon: 'Search',
          },
          {
            label: '2. Substantivo → adjetiva',
            detail: 'Retomar substantivo com pronome relativo = subordinada adjetiva.',
            icon: 'GitBranch',
          },
          {
            label: '3. Sem vírgula = restritiva',
            detail: 'A oração especifica qual prima — não é informação à parte.',
            icon: 'Minus',
          },
          {
            label: 'Pegadinha',
            detail: 'O clima de susto do conto distrai; o critério sintático não muda: o que o «que» retoma?',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '«Que» + substantivo antecedente = oração adjetiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'As formigas → posto de saúde',
        meta: slideMeta,
        steps: [
          'Trecho «As formigas»: «Demorei para reconhecer minha prima que me segurava pelos cotovelos».',
          'B: para ser substantiva, «que» teria de completar um verbo de discurso — aqui ele qualifica «prima», não «demorei».',
          'C/E: coordenada precisa de oração independente ligada à anterior — «que me segurava» depende do substantivo «prima».',
          'D: adverbial pede circunstância (tempo, causa, condição) — não há esse valor aqui.',
          '«Que me segurava pelos cotovelos» diz qual prima, sem vírgula — termo do substantivo.',
          'Gabarito A — oração subordinada adjetiva.',
          'Em similares: teste se o «que» está preso a um substantivo (adjetiva) ou a um verbo de opinião/discurso (substantiva).',
        ],
        footer_rule: '«Que» colado a substantivo = adjetiva, não substantiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Teste do antecedente',
        meta: slideMeta,
        content: 'A QUEM O «QUE» SE REFERE?',
        rows: [
          { label: 'Adjetiva', value: '«Que» retoma substantivo antecedente (prima que…, vizinho que…).' },
          { label: 'Substantiva', value: '«Que» completa verbo de discurso/opinião (disse que, sabe que…).' },
          { label: 'Restritiva', value: 'Sem vírgula — especifica qual elemento entre vários.' },
          { label: 'Explicativa', value: 'Com vírgula — acrescenta informação extra, sem restringir.' },
          { label: 'Nesta questão', value: 'prima que… → adjetiva restritiva (A)' },
        ],
        footer_rule: 'Substantivo antes do «que» é o primeiro sinal de adjetiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir função do «que» pelo verbo anterior',
        items: [
          {
            label: 'B — substantiva',
            detail: '«Demorei para reconhecer» parece pedir complemento com «que».',
            correct: 'O «que» não completa «demorei»; ele qualifica «prima» — é adjetiva.',
          },
          {
            label: 'C — coordenada sindética',
            detail: 'A sequência de ações no conto parece apenas somada.',
            correct: '«Que me segurava» depende do substantivo «prima» — não é oração independente.',
          },
          {
            label: 'D — adverbial',
            detail: 'O suspense da cena sugere circunstância de tempo.',
            correct: 'Não há conectivo temporal/causal; o «que» apenas especifica «prima».',
          },
          {
            label: 'E — coordenada assindética',
            detail: 'Ausência de outra conjunção antes de «que» pode enganar.',
            correct: 'Assindética exige duas orações independentes — aqui há dependência ao substantivo «prima».',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «prima» por «vizinha» ou «amiga».',
            correct: 'Mesmo trilho: substantivo + que + qualificação = adjetiva restritiva.',
          },
        ],
        footer_rule: 'A: oração subordinada adjetiva (restritiva).',
      },
    ],
  },

  'facet-moto-p-oracoes-leia-o-periodo-as-criancas-que-brinc-3670230': {
    family: 'conceito',
    source_tec_id: '3670230',
    source_note: 'Crianças que brincavam na praça — adjetiva explicativa (vírgula) — FACET Moto (Pref Congo) 2025 tec 3670230',
    meta: {
      banca: 'FACET',
      prova: 'Moto (Pref Congo)',
      orgao: 'Pref. Congo',
      ano: '2025',
      cargo_header: 'MOTORISTA',
    },
    instruction:
      'Leia o período: «As crianças, que brincavam na praça, alegravam a tarde com suas vozes.» O trecho «que brincavam na praça» estabelece uma relação sintática com o substantivo antecedente. Assinale a alternativa que descreve corretamente sua classificação.',
    options: [
      {
        id: 'A',
        text: 'Oração subordinada adjetiva restritiva, especificando substantivo antecedente no enunciado principal.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Oração subordinada substantiva objetiva direta, completando sentido de verbo transitivo empregado.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Oração coordenada sindética aditiva, criando encadeamento semântico entre proposições independentes.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Oração subordinada adverbial temporal, estabelecendo circunstância cronológica do acontecimento.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Oração subordinada adjetiva explicativa, acrescentando informação acessória sobre substantivo antecedente.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A vírgula decide o tipo',
        chip_label: 'Restritiva × explicativa',
        meta: slideMeta,
        items: [
          {
            label: '1. Ache o antecedente',
            detail: '«Que brincavam na praça» retoma «as crianças» — pronome relativo + substantivo = adjetiva.',
            icon: 'GitBranch',
          },
          {
            label: '2. Duas vírgulas',
            detail: 'A oração fica isolada por vírgulas dos dois lados — sinal de informação acessória.',
            icon: 'Minus',
          },
          {
            label: '3. Retire a oração',
            detail: '«As crianças alegravam a tarde» continua com sentido completo — a oração não é indispensável.',
            icon: 'Scissors',
          },
          {
            label: 'Pegadinha',
            detail: 'Sem as vírgulas, a mesma frase seria restritiva (só as crianças que brincavam, não todas).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vírgulas isolando o «que» = adjetiva explicativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Crianças na praça → prova',
        meta: slideMeta,
        steps: [
          'Período-modelo: «As crianças, que brincavam na praça, alegravam a tarde com suas vozes.»',
          'A: restritiva não tem vírgula — aqui há vírgula dos dois lados, então não restringe, apenas acrescenta.',
          'B: substantiva completaria um verbo de discurso/opinião; «alegravam» não pede esse tipo de complemento.',
          'C: não há conjunção coordenativa (e, mas) ligando orações independentes — há um pronome relativo dependente.',
          'D: adverbial temporal exigiria «quando», «enquanto» — aqui o «que» qualifica o substantivo «crianças».',
          'Retirando «que brincavam na praça», a frase continua completa: «as crianças alegravam a tarde» — logo é acessória.',
          'Gabarito E — adjetiva explicativa. Em similares: teste sempre se dá para apagar a oração sem perder sentido essencial.',
        ],
        footer_rule: 'Se pode apagar sem perder sentido essencial = explicativa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Restritiva × explicativa',
        meta: slideMeta,
        content: 'A VÍRGULA MUDA O SENTIDO',
        rows: [
          { label: 'Restritiva', value: 'Sem vírgula — seleciona um grupo específico dentro de um todo.' },
          { label: 'Explicativa', value: 'Com vírgula(s) — acrescenta informação sobre todo o grupo, sem restringir.' },
          { label: 'Teste', value: 'Consegue apagar a oração sem mudar o sentido principal? Sim → explicativa.' },
          { label: '≠ Substantiva', value: 'Substantiva completa verbo; aqui o «que» qualifica um substantivo.' },
          { label: 'Nesta questão', value: 'crianças, que brincavam… → adjetiva explicativa (E)' },
        ],
        footer_rule: 'Vírgula = pausa gráfica de informação extra.',
      },
      {
        type: 'danger_zone',
        content: 'Confundir vírgula com outros valores',
        meta: slideMeta,
        items: [
          {
            label: 'A — restritiva',
            detail: 'Parece só especificar quais crianças, entre várias, brincavam.',
            correct: 'A vírgula nos dois lados isola a oração — ela é acessória (explicativa), não restringe.',
          },
          {
            label: 'B — substantiva objetiva direta',
            detail: '«Que» logo após um substantivo é confundido com complemento verbal.',
            correct: '«Alegravam» não é verbo de discurso; o «que» qualifica «crianças», não completa o verbo.',
          },
          {
            label: 'C — coordenada aditiva',
            detail: 'Duas ideias na frase parecem apenas somadas.',
            correct: 'Não há conjunção coordenativa; há dependência sintática ao substantivo «crianças».',
          },
          {
            label: 'D — adverbial temporal',
            detail: 'Brincar e alegrar parecem ações simultâneas no tempo.',
            correct: 'Falta conectivo temporal; a oração qualifica o substantivo, não marca circunstância.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem remover as vírgulas para virar restritiva (só as crianças que brincavam).',
            correct: 'Mesmo trilho: presença/ausência de vírgula decide explicativa × restritiva.',
          },
        ],
        footer_rule: 'E: oração subordinada adjetiva explicativa.',
      },
    ],
  },

  'selecon-ass-oracoes-leia-o-texto-a-seguir-a-fruta-que-aj-3692802': {
    family: 'text_fragment',
    source_tec_id: '3692802',
    source_note:
      'Laranja e vitamina C — «que» adjetiva explicativa — SELECON Ass Adm (Pref Tapurah) 2025 tec 3692802',
    meta: {
      banca: 'SELECON',
      prova: 'Ass Adm (Pref Tapurah)',
      orgao: 'Pref. Tapurah',
      ano: '2025',
      cargo_header: 'ASSISTENTE ADMINISTRATIVO',
    },
    instruction:
      'Excerto: «A exposição constante a poluentes atmosféricos, fumaça de cigarro ou partículas em suspensão gera radicais livres, que danificam as células pulmonares e provocam inflamação crônica» (2º parágrafo). A oração em destaque pode ser classificada como:',
    text_fragment:
      '<p>A fruta que ajuda a eliminar toxinas e reduz a inflamação nas vias aéreas (adaptado). «As laranjas estão entre as frutas mais ricas em vitamina C, um micronutriente essencial para combater o estresse oxidativo, especialmente nos pulmões. A exposição constante a poluentes atmosféricos, fumaça de cigarro ou partículas em suspensão gera radicais livres, <strong>que danificam as células pulmonares e provocam inflamação crônica</strong>.»</p>',
    options: [
      { id: 'A', text: 'subordinada adjetiva restritiva', is_correct: false },
      { id: 'B', text: 'subordinada adjetiva explicativa', is_correct: true },
      { id: 'C', text: 'coordenada sindética explicativa', is_correct: false },
      { id: 'D', text: 'subordinada adverbial consecutiva', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Radicais livres, que danificam…',
        chip_label: 'Vírgula antes do «que»',
        meta: slideMeta,
        items: [
          {
            label: '1. Antecedente',
            detail: '«Que danificam…» retoma «radicais livres» — substantivo antes do pronome relativo.',
            icon: 'GitBranch',
          },
          {
            label: '2. Vírgula presente',
            detail: 'Há vírgula antes de «que» — sinal gráfico de informação acessória, não seletiva.',
            icon: 'Minus',
          },
          {
            label: '3. Já sabemos o que são',
            detail: 'O texto já apresentou «radicais livres» ao falar de laranjas e vitamina C — a oração só acrescenta o efeito deles.',
            icon: 'Info',
          },
          {
            label: 'Pegadinha',
            detail: 'Explicativa não é coordenada — ainda depende do substantivo «radicais livres».',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vírgula + substantivo já identificado = adjetiva explicativa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Laranja e vitamina C → prova',
        meta: slideMeta,
        steps: [
          'Excerto: «...gera radicais livres, que danificam as células pulmonares e provocam inflamação crônica.»',
          'A: restritiva exige ausência de vírgula e a função de selecionar um subgrupo — aqui há vírgula, então não é restritiva.',
          'C: coordenada exigiria conjunção coordenativa (e, mas) ligando orações independentes — «que» é pronome relativo dependente.',
          'D: consecutiva pede conectivo de consequência (de modo que, tanto que) — não é o caso do «que» relativo.',
          'A oração vem após vírgula e qualifica «radicais livres», sem restringir um subgrupo — é informação acessória.',
          'Gabarito B — subordinada adjetiva explicativa.',
          'Em similares: vírgula antes do «que» relativo quase sempre indica explicativa, não restritiva.',
        ],
        footer_rule: 'Vírgula antes do «que» relativo = explicativa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vírgula antes do pronome relativo',
        meta: slideMeta,
        content: 'SINAL GRÁFICO QUE MUDA A CLASSIFICAÇÃO',
        rows: [
          { label: 'Restritiva', value: 'Sem vírgula — escolhe um grupo específico dentro do substantivo.' },
          { label: 'Explicativa', value: 'Com vírgula — acrescenta dado sobre o substantivo já identificado.' },
          { label: '≠ Coordenada', value: 'Pronome relativo («que») dependente ≠ conjunção coordenativa independente.' },
          { label: '≠ Consecutiva', value: 'Precisa de «de modo que» / «tanto que» — não é o caso aqui.' },
          { label: 'Nesta questão', value: 'laranjas, vitamina C e radicais livres, que danificam… → adjetiva explicativa (B)' },
        ],
        footer_rule: 'A vírgula antes do «que» é o sinal decisivo.',
      },
      {
        type: 'danger_zone',
        content: 'Trocar explicativa por restritiva, coordenada ou consecutiva',
        meta: slideMeta,
        items: [
          {
            label: 'A — restritiva',
            detail: 'Parece só selecionar quais radicais livres causam dano.',
            correct: 'A vírgula antes do «que» indica informação acessória sobre todos os radicais livres, não seleção.',
          },
          {
            label: 'C — coordenada sindética explicativa',
            detail: '«Que» após vírgula é confundido com conjunção explicativa (pois, que).',
            correct: '«Que» aqui é pronome relativo retomando «radicais livres» — dependência sintática, não coordenação.',
          },
          {
            label: 'D — adverbial consecutiva',
            detail: 'O efeito «danificam… e provocam» parece consequência.',
            correct: 'Falta conectivo consecutivo (de modo que); a oração qualifica o substantivo, não indica consequência.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «radicais livres» por outro substantivo técnico.',
            correct: 'Mesmo trilho: vírgula + substantivo já definido + «que» = adjetiva explicativa.',
          },
        ],
        footer_rule: 'B: subordinada adjetiva explicativa.',
      },
    ],
  },

  'quadrix-aux-oracoes-texto-para-a-questao-imagine-um-time-3738648': {
    family: 'text_fragment',
    source_tec_id: '3738648',
    source_note:
      'Doenças autoimunes — substituição de «em que» por «no qual» — QUADRIX Aux (FUABC) 2025 tec 3738648',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'AUXILIAR ADMINISTRATIVO',
    },
    instruction:
      'No período «Imagine um time de futebol atacado por um surto enlouquecedor, em que os jogadores saem marcando gol desvairadamente contra a própria equipe.», a expressão «em que» poderia ser substituída, mantendo-se a correção gramatical e o sentido original, por:',
    text_fragment:
      '<p>Texto sobre doenças autoimunes (adaptado). «<strong>Imagine um time de futebol atacado por um surto enlouquecedor, em que os jogadores saem marcando gol desvairadamente contra a própria equipe.</strong> É isso o que o corpo faz quando acometido por doenças autoimunes.»</p>',
    options: [
      { id: 'A', text: 'onde.', is_correct: false },
      { id: 'B', text: 'o qual.', is_correct: false },
      { id: 'C', text: 'cujo.', is_correct: false },
      { id: 'D', text: 'que.', is_correct: false },
      { id: 'E', text: 'no qual.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preposição + pronome relativo',
        chip_label: 'Não perca a preposição',
        meta: slideMeta,
        items: [
          {
            label: '1. Ache o antecedente',
            detail: '«Em que» retoma «surto» — substantivo abstrato, não lugar físico.',
            icon: 'Search',
          },
          {
            label: '2. A preposição «em» é obrigatória',
            detail: 'O verbo «atacado (em)» exige a preposição — ela precisa continuar na substituição.',
            icon: 'Link',
          },
          {
            label: '3. «No qual» = em + o qual',
            detail: 'Contração de preposição + pronome relativo, concordando em gênero/número com «surto».',
            icon: 'CornerDownRight',
          },
          {
            label: 'Pegadinha',
            detail: '«Onde» só substitui «em que» quando o antecedente é lugar físico — «surto» é abstrato.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Troque «em que» só por algo que preserve a preposição «em».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Time de futebol → prova',
        meta: slideMeta,
        steps: [
          'Trecho: «...um surto enlouquecedor, em que os jogadores saem marcando gol contra a própria equipe.»',
          'A: «onde» substitui «em que» apenas com antecedente de lugar físico — «surto» não é lugar.',
          'B: «o qual» sozinho perde a preposição «em», que é exigida pelo sentido («atacado em surto»).',
          'C: «cujo» tem valor possessivo (de quem, de que) — não é o caso; não há relação de posse aqui.',
          'D: «que» sozinho também perde a preposição «em» — mudaria a regência.',
          '«No qual» = «em» + «o qual», mantendo a preposição e concordando com «surto» (masculino singular).',
          'Gabarito E. Em similares: ao trocar «em que», sempre verifique se a preposição do verbo/nome precisa ser preservada.',
        ],
        footer_rule: '«Em que» → «no(a) qual» preserva a preposição regida.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Substituição de «em que»',
        meta: slideMeta,
        content: 'PRESERVE A PREPOSIÇÃO',
        rows: [
          { label: 'em que → no(a) qual', value: 'Mantém a preposição «em» + concordância de gênero/número.' },
          { label: 'em que → onde', value: 'Só quando o antecedente é lugar físico (a casa em que morei = onde morei).' },
          { label: '≠ cujo', value: 'Valor possessivo — «cujo surto» exigiria relação de posse, que não existe aqui.' },
          { label: '≠ que (sozinho)', value: 'Perde a preposição «em» exigida pelo verbo/sentido — regência quebrada.' },
          { label: 'Nesta questão', value: 'em que → no qual (E)' },
        ],
        footer_rule: 'Teste: a preposição do original precisa sobreviver na troca.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar preposição sem critério',
        items: [
          {
            label: 'A — onde',
            detail: '«Onde» parece sempre substituir «em que».',
            correct: '«Onde» só vale para lugar físico; «surto» é abstrato, não um espaço.',
          },
          {
            label: 'B — o qual',
            detail: 'Sozinho parece equivalente por reter o pronome relativo.',
            correct: 'Falta a preposição «em», exigida pela regência de «atacado em» — perde o sentido original.',
          },
          {
            label: 'C — cujo',
            detail: '«Cujo» soa formal e é confundido com qualquer substituição elegante de «que».',
            correct: '«Cujo» expressa posse (de quem); aqui não há relação possessiva entre surto e jogadores.',
          },
          {
            label: 'D — que',
            detail: '«Que» é o pronome relativo mais comum e parece sempre servir.',
            correct: 'Sozinho, «que» também perde a preposição «em» — quebraria a regência do verbo.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem pedir a troca de «na qual», «pelo qual» — mesma lógica de preposição + qual.',
            correct: 'Mesmo trilho: identifique a preposição regida e mantenha-a na substituição.',
          },
        ],
        footer_rule: 'E: «em que» → «no qual» preserva a preposição.',
      },
    ],
  },

  'instituto-ao-oracoes-analise-as-duas-versoes-do-comunicad-3754333': {
    family: 'conceito',
    source_tec_id: '3754333',
    source_note:
      'Comunicado com/sem vírgula — restritiva × explicativa (sentido) — Instituto AOCP Ass Cult (Pref Joinville) 2025 tec 3754333',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'Ass Cult (Pref Joinville)',
      orgao: 'Pref. Joinville',
      ano: '2025',
      cargo_header: 'ASSISTENTE CULTURAL',
    },
    instruction:
      'Analise as duas versões do comunicado a seguir e assinale a alternativa que apresenta corretamente a diferença de sentido entre elas. Texto I: «Os servidores da prefeitura que precisam atualizar seus dados pessoais no sistema estão convocados a comparecer ao departamento responsável.» Texto II: «Os servidores da prefeitura, que precisam atualizar seus dados pessoais no sistema, estão convocados a comparecer ao departamento responsável.»',
    options: [
      {
        id: 'A',
        text: 'No Texto I, a atualização dos dados é obrigatória para todos os servidores; no Texto II, é obrigatória apenas para alguns.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'No Texto I, a atualização dos dados é obrigatória apenas para alguns servidores; no Texto II, é obrigatória para todos.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'No Texto I, o comparecimento ao departamento é opcional; no Texto II, é obrigatório.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Nos dois textos, o sentido é o mesmo, sendo a vírgula no Texto II um recurso estilístico para uma pausa mais longa.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'O Texto II está gramaticalmente incorreto devido ao uso inadequado das vírgulas.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A vírgula muda quem é convocado',
        chip_label: 'Restritiva × explicativa',
        meta: slideMeta,
        items: [
          {
            label: '1. Texto I — sem vírgula',
            detail: '«Servidores que precisam atualizar…» restringe: só esse grupo é convocado.',
            icon: 'Minus',
          },
          {
            label: '2. Texto II — com vírgula',
            detail: '«Servidores, que precisam atualizar…,» é explicativa: vale para todos os servidores.',
            icon: 'GitBranch',
          },
          {
            label: '3. Consequência prática',
            detail: 'No Texto II, a atualização é dita obrigatória para todo o quadro, não só para alguns.',
            icon: 'Users',
          },
          {
            label: 'Pegadinha',
            detail: 'A vírgula parece só estilo, mas muda quem precisa comparecer — não é escolha estética.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Restritiva seleciona um grupo; explicativa fala do grupo todo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Comunicado da prefeitura → prova',
        meta: slideMeta,
        steps: [
          'Texto I: «servidores que precisam atualizar…» sem vírgula → restritiva, seleciona só quem precisa atualizar.',
          'Texto II: «servidores, que precisam atualizar…,» com vírgula → explicativa, vale para todos os servidores.',
          'A: inverte a lógica — diz que o Texto I é para todos e o II para alguns; é o contrário.',
          'C: não há nada no texto sobre o comparecimento ser opcional — ambos convocam a comparecer.',
          'D: a vírgula não é só estilo — ela muda o sentido de restritiva para explicativa.',
          'E: o Texto II está corretamente pontuado; vírgulas isolando explicativa são obrigatórias, não erro.',
          'Gabarito B — Texto I restringe (alguns servidores); Texto II generaliza (todos os servidores).',
        ],
        footer_rule: 'Sem vírgula = alguns; com vírgula = todos.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vírgula muda quem é atingido',
        meta: slideMeta,
        content: 'RESTRITIVA × EXPLICATIVA NO SENTIDO PRÁTICO',
        rows: [
          { label: 'Sem vírgula (restritiva)', value: 'Seleciona um subgrupo — só quem precisa atualizar dados.' },
          { label: 'Com vírgula (explicativa)', value: 'Fala do grupo inteiro — todos os servidores precisam atualizar.' },
          { label: 'Erro comum', value: 'Tratar a vírgula como estilo — ela é gramaticalmente obrigatória na explicativa.' },
          { label: 'Consequência', value: 'Muda quem é convocado a comparecer ao departamento.' },
          { label: 'Nesta questão', value: 'Texto I = alguns; Texto II = todos (B)' },
        ],
        footer_rule: 'A vírgula é regra, não escolha de estilo.',
      },
      {
        type: 'danger_zone',
        content: 'Inverter ou ignorar o efeito da vírgula',
        meta: slideMeta,
        items: [
          {
            label: 'A — inverte os textos',
            detail: 'Fácil trocar qual texto é restritivo e qual é explicativo sob pressão do tempo.',
            correct: 'Sem vírgula (Texto I) = restritiva (alguns); com vírgula (Texto II) = explicativa (todos) — é o oposto de A.',
          },
          {
            label: 'C — comparecimento opcional',
            detail: 'Nenhum dos textos fala de opcionalidade; distrai do foco real (quem precisa atualizar).',
            correct: 'Ambos os textos convocam a comparecer; a diferença está em quantos precisam atualizar dados.',
          },
          {
            label: 'D — vírgula é só estilo',
            detail: 'Parece razoável achar que a vírgula só cria uma pausa mais longa.',
            correct: 'A vírgula na explicativa é obrigatória e muda o sentido — não é recurso estilístico livre.',
          },
          {
            label: 'E — Texto II incorreto',
            detail: 'Duas vírgulas seguidas podem parecer erro de pontuação.',
            correct: 'É a pontuação correta para isolar uma oração adjetiva explicativa — não há erro.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem usar outro par de frases com/sem vírgula sobre outro tema administrativo.',
            correct: 'Mesmo trilho: vírgula presente = grupo todo; vírgula ausente = subgrupo restrito.',
          },
        ],
        footer_rule: 'B: sem vírgula restringe; com vírgula generaliza.',
      },
    ],
  },

  'educa-pb-acs-oracoes-considere-o-texto-a-seguir-para-resp-3819886': {
    family: 'text_fragment',
    source_tec_id: '3819886',
    source_note:
      'Direção defensiva — «que» adjetiva explicativa — EDUCA PB ACS (Pref Ibiara) 2025 tec 3819886',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACS (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'No trecho «Um outro é o da participação, que fundamenta a mobilização da sociedade para organizar-se em torno dos problemas de trânsito…», o conectivo «que» estabelece uma relação de:',
    text_fragment:
      '<p>Direção Defensiva e Convivência no Trânsito (adaptado). «O segundo princípio é a igualdade de direitos. Todos têm a possibilidade de exercer a cidadania plenamente. <strong>Um outro é o da participação, que fundamenta a mobilização da sociedade para organizar-se em torno dos problemas de trânsito</strong> e de suas consequências.»</p>',
    options: [
      { id: 'A', text: 'Explicação, retomando o termo anterior para detalhá-lo.', is_correct: true },
      { id: 'B', text: 'Causa, indicando o motivo da participação no trânsito.', is_correct: false },
      { id: 'C', text: 'Oposição, contrastando duas ideias contraditórias.', is_correct: false },
      { id: 'D', text: 'Condição, expressando hipótese futura.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O «que» detalha, não contrasta',
        chip_label: 'Vírgula antes do «que»',
        meta: slideMeta,
        items: [
          {
            label: '1. Antecedente',
            detail: '«Que fundamenta…» retoma «o da participação» (o princípio da participação).',
            icon: 'GitBranch',
          },
          {
            label: '2. Vírgula presente',
            detail: 'Há vírgula antes de «que» — sinal de explicação, não de restrição.',
            icon: 'Minus',
          },
          {
            label: '3. Detalha o princípio',
            detail: 'Assim como o texto detalha a igualdade de direitos, a oração explica o que é «a participação».',
            icon: 'Info',
          },
          {
            label: 'Pegadinha',
            detail: 'Não há «porque», «mas» ou «se» — só «que» explicativo; não confunda com causa/oposição/condição.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vírgula + «que» detalhando o termo anterior = explicação.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Direção defensiva → prova',
        meta: slideMeta,
        steps: [
          'Trecho: «Um outro é o da participação, que fundamenta a mobilização da sociedade... em torno dos problemas de trânsito.»',
          'B: causa exigiria «porque»/«já que» — «que» aqui só retoma «participação», sem indicar motivo.',
          'C: oposição exigiria «mas»/«porém» — não há contraste de ideias no trecho.',
          'D: condição exigiria «se»/«caso» — não há hipótese, apenas explicação do princípio.',
          'A oração «que fundamenta a mobilização…» detalha o que significa «a participação» — informação a mais sobre o termo.',
          'Gabarito A — relação de explicação, retomando o termo anterior para detalhá-lo.',
          'Em similares: «vírgula + que + detalhe sobre o termo anterior» = explicação, sem precisar decorar nome de oração.',
        ],
        footer_rule: 'Vírgula + «que» detalhando = explicação.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Função do «que» explicativo',
        meta: slideMeta,
        content: 'RETOMAR PARA DETALHAR',
        rows: [
          { label: 'Explicação', value: 'Vírgula + «que» + detalhe sobre o termo anterior, sem restringir.' },
          { label: '≠ Causa', value: 'Precisaria de «porque», «já que», «pois» — ausentes aqui.' },
          { label: '≠ Oposição', value: 'Precisaria de «mas», «porém», «contudo» — ausentes aqui.' },
          { label: '≠ Condição', value: 'Precisaria de «se», «caso», «desde que» — ausentes aqui.' },
          { label: 'Nesta questão', value: 'da participação, que fundamenta… → explicação (A)' },
        ],
        footer_rule: 'Procure o conectivo certo antes de nomear a relação.',
      },
      {
        type: 'danger_zone',
        content: 'Nomear a relação sem checar o conectivo',
        meta: slideMeta,
        items: [
          {
            label: 'B — causa',
            detail: 'A ideia de «mobilização» soa como motivo de algo.',
            correct: 'Não há «porque»/«já que»; o «que» apenas explica o princípio, não indica motivo.',
          },
          {
            label: 'C — oposição',
            detail: 'Comparar princípios diferentes no texto pode sugerir contraste.',
            correct: 'Não há conectivo adversativo; a oração soma informação, não contrasta ideias.',
          },
          {
            label: 'D — condição',
            detail: '«Organizar-se» pode parecer um requisito hipotético.',
            correct: 'Falta «se»/«caso»; a oração apenas detalha o que já foi afirmado sobre a participação.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem trocar «participação» por outro princípio do mesmo texto.',
            correct: 'Mesmo trilho: vírgula + «que» detalhando o termo anterior = explicação.',
          },
        ],
        footer_rule: 'A: relação de explicação (detalhamento do termo anterior).',
      },
    ],
  },

  'apice-acs-pr-oracoes-15-07-2026-19-38-80-98-369-370-apos-3951882': {
    family: 'text_fragment',
    source_tec_id: '3951882',
    source_note:
      'Tirinha da Mafalda — contagem de orações e «de que» adjetiva — Ápice ACS (Pref Boa Vista PB) 2025 tec 3951882',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Boa Vista PB)',
      orgao: 'Pref. Boa Vista (PB)',
      ano: '2025',
      cargo_header: 'AGENTE COMUNITÁRIO DE SAÚDE',
    },
    instruction:
      'Após leitura da tirinha da Mafalda, analise, como verdadeiras (V) ou falsas (F), as afirmativas a seguir. ( ) A palavra «indicador» possui o mesmo significado no segundo e no quarto quadrinho da tirinha da Mafalda. ( ) O termo «AAAAAH!...» classifica-se, morfologicamente, como uma preposição. ( ) No período «Esse deve ser o tal indicador de desemprego de que tanto se fala!», há três orações. ( ) A oração «de que tanto se fala» trata-se de uma subordinada adjetiva. Após análise das afirmativas, conclui-se que a sequência correta é:',
    text_fragment:
      '<p>Tirinha da Mafalda (Quino, adaptado). Mafalda observa o «indicador» (dedo) em um quadrinho e, depois, comenta o «indicador de desemprego» (índice econômico) em outro. Por fim, exclama: <strong>«Esse deve ser o tal indicador de desemprego de que tanto se fala!»</strong></p>',
    options: [
      { id: 'A', text: 'F – F – F – V.', is_correct: true },
      { id: 'B', text: 'F – F – V – V.', is_correct: false },
      { id: 'C', text: 'V – V – F – F.', is_correct: false },
      { id: 'D', text: 'V – V – V – V.', is_correct: false },
      { id: 'E', text: 'V – F – F – V.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro afirmativas, quatro testes',
        chip_label: 'Conte e classifique',
        meta: slideMeta,
        items: [
          {
            label: '1. «Indicador» tem 2 sentidos',
            detail: 'No 2º quadrinho é «dedo»; no 4º é «índice econômico» — significados diferentes.',
            icon: 'Repeat',
          },
          {
            label: '2. «AAAAAH!...» é interjeição',
            detail: 'Exclamação isolada expressa emoção — classe morfológica interjeição, não preposição.',
            icon: 'MessageCircle',
          },
          {
            label: '3. Conte os verbos',
            detail: '«Deve ser» + «se fala» → apenas 2 orações, não 3.',
            icon: 'ListOrdered',
          },
          {
            label: '4. «De que» retoma substantivo',
            detail: '«De que tanto se fala» qualifica «indicador de desemprego» — subordinada adjetiva.',
            icon: 'GitBranch',
          },
        ],
        footer_rule: 'Teste cada afirmativa isoladamente antes de montar a sequência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Mafalda → prova',
        meta: slideMeta,
        steps: [
          'Afirmativa 1: «indicador» no 2º quadrinho (dedo) ≠ «indicador» no 4º (índice econômico) → sentidos diferentes → F.',
          'Afirmativa 2: «AAAAAH!...» expressa emoção/exclamação isolada → é interjeição, não preposição → F.',
          'Afirmativa 3: no período há «deve ser» (1ª oração) e «se fala» (2ª oração) → apenas 2 orações, não 3 → F.',
          'Afirmativa 4: «de que tanto se fala» retoma «indicador de desemprego» com pronome relativo → subordinada adjetiva → V.',
          'Sequência: F (indicador) – F (interjeição) – F (só 2 orações) – V (adjetiva).',
          'Gabarito A — F, F, F, V.',
          'Em similares: teste palavra por palavra e oração por oração antes de julgar a sequência toda.',
        ],
        footer_rule: 'F-F-F-V: cada afirmativa cai em um teste diferente.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Quatro testes rápidos',
        meta: slideMeta,
        content: 'PALAVRA, CLASSE, CONTAGEM, FUNÇÃO',
        rows: [
          { label: 'Polissemia', value: 'Mesma palavra, sentidos diferentes conforme o contexto — «indicador» dedo × índice.' },
          { label: 'Interjeição', value: 'Exclamações isoladas (AAAAAH!, Ai!, Oba!) são interjeições, não preposições.' },
          { label: 'Contar orações', value: 'Um verbo (ou locução verbal) = uma oração; conte antes de afirmar quantidade.' },
          { label: 'De que → adjetiva', value: 'Preposição + pronome relativo retomando substantivo = subordinada adjetiva.' },
          { label: 'Nesta questão', value: 'F – F – F – V (A)' },
        ],
        footer_rule: 'Julgue cada afirmativa separadamente antes de somar a sequência.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Julgar rápido demais cada afirmativa',
        items: [
          {
            label: 'B — 2ª V, não F',
            detail: 'Achar que qualquer exclamação forte poderia ser preposição por engano de leitura rápida.',
            correct: '«AAAAAH!...» é interjeição — expressa emoção isolada, nunca liga termos como uma preposição.',
          },
          {
            label: 'C — 1ª e 2ª V',
            detail: 'Supor que «indicador» mantém o mesmo sentido em toda a tirinha.',
            correct: 'O humor da tira está exatamente na troca de sentido de «indicador» — são acepções diferentes.',
          },
          {
            label: 'D — tudo V',
            detail: 'Marcar tudo verdadeiro por parecer plausível cada afirmativa isoladamente.',
            correct: 'A 3ª afirmativa erra a contagem: há só 2 orações («deve ser» + «se fala»), não 3.',
          },
          {
            label: 'E — 1ª V',
            detail: 'Confundir repetição da palavra com repetição do sentido.',
            correct: 'Repetir a palavra «indicador» não garante o mesmo significado — o contexto muda o sentido.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem usar outra tirinha com jogo de palavras semelhante.',
            correct: 'Mesmo trilho: teste polissemia, classe morfológica, contagem de orações e função do pronome relativo.',
          },
        ],
        footer_rule: 'A: F – F – F – V.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
