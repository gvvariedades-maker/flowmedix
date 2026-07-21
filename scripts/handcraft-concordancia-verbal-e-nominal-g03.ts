#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g03 (8 slugs · Concordância · lote 3).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g03.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g03';
const SUBTOPICO = 'Concordância verbal e nominal';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_concordancia';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp.json';

const CONCORDANCIA_SOURCE = {
  id: 'pt-concordancia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Concordância verbal e nominal — núcleo do sujeito e casos especiais',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'núcleo do sujeito',
    'concordância verbal',
    'concordância nominal',
    'sujeito pós-verbo',
    'impessoal com se',
    'haver existencial',
    'existir/existem',
    'partitivo (maioria)',
    'fazer + tempo',
    'sujeito composto',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado';

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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g03',
      guideline_snapshot: `M13 Elias TE-simples — pergunta «Qual o núcleo do sujeito?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      CONCORDANCIA_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt-subject-focus'],
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
  'apice-acs-pr-concordancia-considere-o-texto-a-seguir-para-resp-4024938': {
    family: 'text_fragment',
    source_tec_id: '4024938',
    source_note: 'Maioria das universidades conta — Ápice ACS Pref Monteiro 2026 tec 4024938',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nSobre o trecho: «Hoje, a maioria das universidades públicas conta com programas de inclusão, apoio estudantil e permanência, tornando esse espaço historicamente elitista mais diverso e representativo da sociedade brasileira.»\n\nSobre a concordância verbal nesse trecho, assinale a alternativa correta.',
    text_fragment:
      '<p><strong>As universidades e o desafio da desigualdade social</strong> — Cesar Martins, vice-reitor da Unesp. Trecho: «Hoje, a maioria das universidades públicas <strong>conta</strong> com programas de inclusão, apoio estudantil e permanência…»</p>',
    options: [
      {
        id: 'A',
        text: 'É caso de concordância obrigatória com o termo de plural mais próximo do verbo («universidades»), devendo o verbo estar no plural: «contam».',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Trata-se de um caso em que há duas possibilidades de concordância, visto que o verbo pode concordar com o substantivo ou com o núcleo do sujeito; a cada uma destas possibilidades corresponde um novo matiz de expressão.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'É um caso de concordância com verbo obrigatoriamente no singular, tendo em vista que o núcleo do sujeito é «a maioria».',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'É um caso de impessoalidade do sujeito, o que leva o verbo para o singular.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Trata-se de um caso de concordância em que deve ser feita apenas com o substantivo no plural, no caso, «essas políticas», portanto o verbo deveria estar no plural.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Partitivo — maioria de',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que «conta» concorda?', icon: 'Focus' },
          { label: 'A maioria de', detail: 'Concordância partitiva: verbo com «maioria» ou com «universidades».', icon: 'Users' },
          { label: 'Conta × contam', detail: '«Conta» (núcleo maioria) ou «contam» (núcleo universidades) — ambas corretas.', icon: 'Check' },
          { label: 'Não é impessoal', detail: 'Sujeito explícito — não confundir com «discute-se».', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Achar que só o singular ou só o plural é aceito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Maioria de + pl.: duas concordâncias possíveis.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Núcleo → verbo → letras',
        meta: slideMeta,
        steps: [
          'Trecho: «a maioria das universidades públicas conta com programas…»',
          'Sujeito partitivo: núcleo pode ser «a maioria» (sing.) ou «universidades» (pl.).',
          'A exige só plural com «universidades» — ignora concordância com «maioria» — eliminar.',
          'C diz «obrigatoriamente» singular — «conta» é possível, mas não única — eliminar.',
          'D trata como impessoal — há sujeito determinado — eliminar.',
          'E cita «essas políticas» — trecho errado da análise — eliminar.',
          'B: duas possibilidades de concordância, cada uma com matiz — correto.',
          'Gabarito B.',
          'Em similares: partitivo (maioria, metade, parte) admite dupla concordância.',
        ],
        footer_rule: 'Conta ou contam — ambas normativas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'MAIORIA DE + PL.',
        rows: [
          { label: 'Pergunta-teste', value: 'Núcleo = «maioria» ou termo de «de»?' },
          { label: 'Dupla forma', value: '«A maioria conta» ou «a maioria contam» (universidades).' },
          { label: 'Matiz', value: 'Sing. enfatiza o conjunto; pl. enfatiza os integrantes.' },
          { label: 'Nesta questão', value: 'B — duas possibilidades de concordância' },
        ],
        footer_rule: 'Não declare só uma forma obrigatória.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises erradas × B correta',
        items: [
          { label: 'A — só plural', detail: 'Exige «contam» com «universidades», negando «conta».', correct: 'Partitivo aceita «conta» (maioria) e «contam» (universidades).' },
          { label: 'C — só singular', detail: '«Obrigatoriamente» singular ignora a segunda opção.', correct: '«Conta» é possível, mas não exclusiva — B é mais precisa.' },
          { label: 'D — impessoal', detail: 'Confunde sujeito partitivo com oração sem sujeito.', correct: 'Há sujeito «a maioria das universidades públicas».' },
          { label: 'E — essas políticas', detail: 'Analisa frase diferente do trecho pedido.', correct: 'Trecho é «maioria… conta» — não «Essas políticas alteraram».' },
          { label: 'Em outra banca…', detail: 'Trocam por «a maior parte dos alunos».', correct: 'Mesma regra partitiva: dupla concordância.' },
        ],
        footer_rule: 'Gabarito B — duas possibilidades.',
      },
    ],
  },

  'vunesp-ag-as-concordancia-a-concordancia-nominal-e-verbal-esta-3345661': {
    family: 'conceito',
    source_tec_id: '3345661',
    source_note: 'Dia dos Mortos nominal+verbal — VUNESP Ag AS Pref Campinas 2025 tec 3345661',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag AS (Pref Campinas)',
      orgao: 'Pref. Campinas',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A concordância nominal e verbal está em conformidade com a norma-padrão na frase:',
    options: [
      { id: 'A', text: 'Durante a pandemia de covid-19, não houveram celebrações aos mortos em nenhum lugar.', is_correct: false },
      { id: 'B', text: 'Quem vai ao México no Dia dos Mortos assiste a uma festa que remetem aos antepassados.', is_correct: false },
      { id: 'C', text: 'Pintar o rosto no Dia dos Mortos representa uma tradição bastante difundidos no México.', is_correct: false },
      { id: 'D', text: 'Os europeus chegaram à América, e ali se estabeleceu um contato com os povos nativos.', is_correct: true },
      { id: 'E', text: 'Observa-se o respeito aos mortos em muitas culturas, o que é manifestadas de muitas formas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Verbal + nominal',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Verbo e adjetivo alinhados?', icon: 'Focus' },
          { label: 'Haver existencial', detail: '«Houve celebrações» — impessoal no singular.', icon: 'Ban' },
          { label: 'Relativa', detail: '«Festa que remete» — verbo com núcleo «festa» (sing.).', icon: 'Link2' },
          { label: 'Nominal', detail: '«Tradição difundida» — adj com núcleo «tradição» (fem. sing.).', icon: 'Box' },
          { label: 'Pegadinha', detail: 'Plural só no adj ou só no verbo — cadeia quebrada.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Teste verbal e nominal em cada letra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância nominal e verbal corretas.',
          'A «houveram celebrações»: haver existencial → «houve» — eliminar.',
          'B «festa que remetem»: núcleo «festa» (sing.) → «remete» — eliminar.',
          'C «tradição difundidos»: adj masc. pl. com «tradição» fem. sing. — eliminar.',
          'D «europeus chegaram… se estabeleceu contato»: sujeito posposto «contato» (sing.) — correto.',
          'E «o que é manifestadas»: «o que» (sing.) + «manifestadas» (pl.) — eliminar.',
          'Gabarito D.',
          'Em similares: relativa, haver e adjetivo — três testes por letra.',
        ],
        footer_rule: 'D: verbal e nominal corretas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIA COMPLETA',
        rows: [
          { label: 'Haver', value: 'Existencial → «houve celebrações» (sing.).' },
          { label: 'Relativa', value: 'Verbo concorda com antecedente «festa».' },
          { label: 'Nominal', value: 'Adj concorda com núcleo do sintagma.' },
          { label: 'Sujeito posposto', value: '«Se estabeleceu contato» — núcleo depois.' },
          { label: 'Nesta questão', value: 'D — europeus chegaram; estabeleceu-se contato' },
        ],
        footer_rule: 'Nominal + verbal na mesma letra.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra em um elo',
        items: [
          { label: 'A — houveram', detail: 'Haver no plural como existencial.', correct: '«Não houve celebrações» — impessoal singular.' },
          { label: 'B — remetem', detail: 'Relativa com verbo plural e antecedente singular.', correct: '«Festa que remete aos antepassados».' },
          { label: 'C — difundidos', detail: 'Adj masc. pl. com «tradição» fem. sing.', correct: '«Tradição bastante difundida».' },
          { label: 'E — manifestadas', detail: '«O que» singular com particípio plural.', correct: '«O que é manifestado» ou «que são manifestadas».' },
          { label: 'Em outra banca…', detail: 'Trocam «contato» por «acordo comercial».', correct: 'Mesmo padrão: sujeito posposto + verbo sing.' },
        ],
        footer_rule: 'Só D mantém toda a cadeia.',
      },
    ],
  },

  'vunesp-ag-pr-concordancia-assinale-a-alternativa-redigida-em-c-3352593': {
    family: 'conceito',
    source_tec_id: '3352593',
    source_note: 'Discute-se livros — VUNESP Ag Pref Sertãozinho 2025 tec 3352593',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa redigida em conformidade com a norma-padrão de concordância.',
    options: [
      { id: 'A', text: 'Acumula-se muitos livros quando se tem espaço suficiente em casa.', is_correct: false },
      { id: 'B', text: 'Haviam estudantes que não tinham dinheiro para comprar todos os livros.', is_correct: false },
      { id: 'C', text: 'Existe pessoas que são bibliófilos, ou seja, colecionadores de livros.', is_correct: false },
      { id: 'D', text: 'Ela se sentia meia insegura por não ter lido tanto quanto os demais.', is_correct: false },
      { id: 'E', text: 'Discute-se muito, nos dias de hoje, sobre os altos preços dos livros no país.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Índice + impessoal',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Haver, existir ou índice com se?', icon: 'Focus' },
          { label: 'Discute-se', detail: 'Índice de indeterminação — verbo no singular.', icon: 'MessageCircle' },
          { label: 'Acumula-se', detail: 'Índice sing. + «muitos livros» posposto — «acumulam-se» também ok; «acumula-se muitos» erra.', icon: 'BookOpen' },
          { label: 'Haver / existir', detail: 'Haver existencial sing.; existir pessoal com «pessoas» → «existem».', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Pluralizar haver ou singularizar existir com sujeito plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Índice com se → verbo no singular.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: concordância correta em uma das frases.',
          'A «Acumula-se muitos livros»: índice sing. + OD plural sem partitivo adequado — eliminar.',
          'B «Haviam estudantes»: haver existencial no plural — eliminar.',
          'C «Existe pessoas»: núcleo plural «pessoas» → «existem» — eliminar.',
          'D «meia insegura»: frase aceitável; gabarito é E — discute-se no singular — eliminar.',
          'E «Discute-se muito… sobre os preços»: índice de indeterminação — verbo sing. — correto.',
          'Gabarito E.',
          'Em similares: discute-se / fala-se / vende-se → singular.',
        ],
        footer_rule: 'E: impessoal com se no singular.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÍNDICE + EXISTENCIAL',
        rows: [
          { label: 'Discute-se', value: 'Índice de indeterminação → verbo singular.' },
          { label: 'Haver', value: '«Havia estudantes» — existencial no singular.' },
          { label: 'Existir', value: '«Existem pessoas» — pessoal, concorda com sujeito.' },
          { label: 'Nesta questão', value: 'E — Discute-se muito…' },
        ],
        footer_rule: 'Se + verbo = singular (índice).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros por regra especial',
        items: [
          { label: 'A — acumula-se muitos', detail: 'Índice sing. com construção inadequada para o plural posposto.', correct: '«Acumulam-se muitos livros» ou «Acumula-se livro».' },
          { label: 'B — haviam', detail: 'Haver existencial pluralizado.', correct: '«Havia estudantes que não tinham…».' },
          { label: 'C — existe pessoas', detail: 'Existir com sujeito plural.', correct: '«Existem pessoas que são bibliófilos».' },
          { label: 'D — meia', detail: '«Meio» advérbio (insegura) — não é o foco do gabarito.', correct: 'Frase aceitável; gabarito é E (discute-se).' },
          { label: 'Em outra banca…', detail: 'Trocam por «Vendem-se livros usados».', correct: 'Índice: «Vende-se» (sing.) ou concorda com sujeito posposto.' },
        ],
        footer_rule: 'E: discute-se no singular.',
      },
    ],
  },

  'avancasp-acs-concordancia-de-acordo-com-o-gramatico-evanildo-b-3352960': {
    family: 'conceito',
    source_tec_id: '3352960',
    source_note: 'Bechara elas preferiram — AVANÇASP ACS Pref Amparo 2025 tec 3352960',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Amparo)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'De acordo com o gramático Evanildo Bechara, «Diz-se concordância verbal a que se verifica em número e pessoa entre o sujeito (e às vezes o predicativo) e o verbo da oração». Assim, assinale a alternativa em que a concordância verbal está correta:',
    options: [
      { id: 'A', text: 'Devido ao imprevisto, elas preferiram remarcar a viagem.', is_correct: true },
      { id: 'B', text: 'Suzana e Sara, como todos os dias, brincou depois da escola.', is_correct: false },
      { id: 'C', text: 'Alguns deles era mais experientes no serviço do que outros.', is_correct: false },
      { id: 'D', text: 'Os dois engenheiros, em razão da complexidade, precisou de mais ajuda.', is_correct: false },
      { id: 'E', text: 'Infelizmente, as flores morreu no vaso novo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — Bechara',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Elas preferiram', detail: 'Sujeito «elas» (3ª pl.) → verbo «preferiram».', icon: 'Check' },
          { label: 'Sujeito composto', detail: '«Suzana e Sara» → «brincaram» — não «brincou».', icon: 'Users' },
          { label: 'Partitivo', detail: '«Alguns deles» → núcleo «alguns» (pl.) → «eram».', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Adjunto longo entre sujeito e verbo desvia o olhar.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Núcleo manda — ignore o intervalo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Bechara: verbo concorda em número e pessoa com o sujeito.',
          'A «elas preferiram»: 3ª pl. + pretérito pl. — correto.',
          'B «Suzana e Sara… brincou»: composto → «brincaram» — eliminar.',
          'C «Alguns deles era»: núcleo «alguns» (pl.) → «eram» — eliminar.',
          'D «engenheiros… precisou»: plural → «precisaram» — eliminar.',
          'E «flores morreu»: plural → «morreram» — eliminar.',
          'Gabarito A.',
          'Em similares: marque o núcleo antes do verbo, mesmo com vírgulas.',
        ],
        footer_rule: 'Só A alinha sujeito e verbo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÚCLEO → VERBO',
        rows: [
          { label: 'Bechara', value: 'Número e pessoa do verbo seguem o sujeito.' },
          { label: 'Composto', value: '«Suzana e Sara brincaram».' },
          { label: 'Partitivo', value: '«Alguns deles eram» — núcleo «alguns».' },
          { label: 'Nesta questão', value: 'A — elas preferiram' },
        ],
        footer_rule: 'Adjunto não altera a regra.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Desalinhamento em B–E',
        items: [
          { label: 'B — brincou', detail: 'Dois núcleos «Suzana e Sara» com verbo singular.', correct: '«Suzana e Sara brincaram depois da escola».' },
          { label: 'C — era', detail: '«Alguns» plural com «era» singular.', correct: '«Alguns deles eram mais experientes».' },
          { label: 'D — precisou', detail: '«Os dois engenheiros» plural com verbo singular.', correct: '«Os dois engenheiros precisaram de mais ajuda».' },
          { label: 'E — morreu', detail: '«As flores» plural com verbo singular.', correct: '«As flores morreram no vaso novo».' },
          { label: 'Em outra banca…', detail: 'Inserem adjunto «em razão da complexidade».', correct: 'Mesmo teste: núcleo «engenheiros» → plural.' },
        ],
        footer_rule: 'A: elas → preferiram.',
      },
    ],
  },

  'avancasp-ace-concordancia-de-acordo-com-o-gramatico-evanildo-b-3353963': {
    family: 'conceito',
    source_tec_id: '3353963',
    source_note: 'Bechara nós levamos — AVANÇASP ACEVA Pref Amparo 2025 tec 3353963',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACEVA (Pref Amparo)',
      orgao: 'Pref. Amparo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'De acordo com o gramático Evanildo Bechara, «Diz-se concordância verbal a que se verifica em número e pessoa entre o sujeito (e às vezes o predicativo) e o verbo da oração». Assim, assinale a alternativa em que a concordância verbal está correta:',
    options: [
      { id: 'A', text: 'As estradas no Brasil se estende de norte a sul.', is_correct: false },
      { id: 'B', text: 'Wagner e Luíza, desde 1996, morava naquele mesmo bairro.', is_correct: false },
      { id: 'C', text: 'Nós, como sempre, levamos a torta de morango para o almoço.', is_correct: true },
      { id: 'D', text: 'As nuvens se moveu rápido com o vento.', is_correct: false },
      { id: 'E', text: 'Eles conversou por muitas horas.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pessoa e número',
        chip_label: 'M13 — Bechara',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? 1ª pl., 3ª pl., sing. ou pl.?', icon: 'Focus' },
          { label: 'Nós levamos', detail: '1ª pessoa do plural — «levamos».', icon: 'Check' },
          { label: 'Pronome aposto', detail: '«Nós, como sempre,» — vírgulas não mudam a concordância.', icon: 'User' },
          { label: 'Reflexivo', detail: '«As estradas se estendem» — verbo com núcleo «estradas».', icon: 'Route' },
          { label: 'Pegadinha', detail: '«Se» colado ao verbo distrai do núcleo real.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aposto «nós» → levamos.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Bechara: número e pessoa do verbo com o sujeito.',
          'A «estradas se estende»: núcleo pl. → «estendem» — eliminar.',
          'B «Wagner e Luíza morava»: composto → «moravam» — eliminar.',
          'C «Nós… levamos»: 1ª pl. explícita + verbo «levamos» — correto.',
          'D «nuvens se moveu»: plural → «moveram» — eliminar.',
          'E «Eles conversou»: 3ª pl. → «conversaram» — eliminar.',
          'Gabarito C.',
          'Em similares: aposto entre vírgulas não isenta de concordar.',
        ],
        footer_rule: 'C: nós → levamos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PESSOA + NÚMERO',
        rows: [
          { label: 'Nós', value: '1ª pl. → «levamos».' },
          { label: 'Eles / estradas', value: '3ª pl. → «conversaram», «estendem», «moveram».' },
          { label: 'Composto', value: '«Wagner e Luíza moravam».' },
          { label: 'Nesta questão', value: 'C — Nós levamos a torta' },
        ],
        footer_rule: 'Aposto não muda pessoa do verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros clássicos B–E',
        items: [
          { label: 'A — estende', detail: '«Estradas» plural com verbo singular.', correct: '«As estradas no Brasil se estendem de norte a sul».' },
          { label: 'B — morava', detail: 'Sujeito composto com verbo singular.', correct: '«Wagner e Luíza moravam naquele bairro».' },
          { label: 'D — moveu', detail: '«Nuvens» plural com «moveu» singular.', correct: '«As nuvens se moveram rápido».' },
          { label: 'E — conversou', detail: '«Eles» com verbo singular.', correct: '«Eles conversaram por muitas horas».' },
          { label: 'Em outra banca…', detail: 'Trocam «nós» por «eu e minha irmã».', correct: 'Composto → «levamos» ou «levou» conforme núcleo.' },
        ],
        footer_rule: 'Só C concorda em pessoa e número.',
      },
    ],
  },

  'vunesp-an-op-concordancia-assinale-a-alternativa-cuja-frase-es-3354420': {
    family: 'conceito',
    source_tec_id: '3354420',
    source_note: 'Realizam-se estudos espaciais — VUNESP An OP Sertãozinho 2025 tec 3354420',
    meta: {
      banca: 'VUNESP',
      prova: 'An OP (Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa cuja frase está em conformidade com a norma-padrão de concordância verbal.',
    options: [
      { id: 'A', text: 'Existe ainda hoje riscos desconhecidos relativos à participação de seres humanos em viagens espaciais.', is_correct: false },
      { id: 'B', text: 'Fazem décadas que pesquisadores e cientistas se dedicam a conhecer e compreender o universo.', is_correct: false },
      { id: 'C', text: 'Realizam-se estudos acerca do comportamento do corpo humano durante uma viagem espacial.', is_correct: true },
      { id: 'D', text: 'Nunca houveram tantas pessoas interessadas na possível colonização de outros planetas.', is_correct: false },
      { id: 'E', text: 'O experimento dos cientistas contaram com a utilização de corações artificiais.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conformidade verbal espacial',
        chip_label: 'M13 — norma-padrão',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual frase está em conformidade com a norma-padrão?', icon: 'Focus' },
          { label: 'Viagem espacial', detail: 'Tema do enunciado — corpo humano, riscos, colonização.', icon: 'Rocket' },
          { label: 'Realizam-se estudos', detail: 'Comportamento do corpo humano — sujeito posposto plural.', icon: 'Check' },
          { label: 'Existir', detail: '«Riscos» (pl.) → «existem», não «existe».', icon: 'AlertTriangle' },
          { label: 'Fazer + tempo', detail: '«Faz décadas» — locução impessoal no singular.', icon: 'Clock' },
          { label: 'Haver', detail: '«Houve tantas pessoas» — existencial singular.', icon: 'Ban' },
        ],
        footer_rule: 'Estudos (pl.) → realizam-se.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase em conformidade com a norma-padrão de concordância verbal.',
          'Contexto: viagem espacial, corpo humano, riscos e colonização de planetas.',
          'A «existe riscos»: sujeito plural → «existem» — eliminar.',
          'B «Fazem décadas»: locução impessoal → «Faz décadas» — eliminar.',
          'C «Realizam-se estudos»: sujeito posposto plural — correto.',
          'D «houveram tantas pessoas»: haver existencial plural — eliminar.',
          'E «experimento… contaram»: sujeito sing. → «contou» — eliminar.',
          'Gabarito C.',
          'Em similares: localize núcleo posposto após «-se».',
        ],
        footer_rule: 'C: realizam-se estudos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ESPECIAL + POSPOSTO',
        rows: [
          { label: 'Realizam-se', value: 'Sujeito «estudos» (pl.) posposto.' },
          { label: 'Existir', value: '«Existem riscos» — pessoal plural.' },
          { label: 'Faz décadas', value: 'Locução impessoal — singular.' },
          { label: 'Haver', value: '«Houve pessoas» — existencial singular.' },
          { label: 'Nesta questão', value: 'C — Realizam-se estudos' },
        ],
        footer_rule: 'Não pluralize haver nem «faz» temporal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros por caso especial',
        items: [
          { label: 'A — existe riscos', detail: 'Existir com sujeito plural.', correct: '«Existem riscos desconhecidos».' },
          { label: 'B — fazem décadas', detail: 'Plural na locução de tempo.', correct: '«Faz décadas que pesquisadores…».' },
          { label: 'D — houveram', detail: 'Haver existencial no plural.', correct: '«Nunca houve tantas pessoas interessadas».' },
          { label: 'E — contaram', detail: '«Experimento» singular com verbo plural.', correct: '«O experimento contou com corações artificiais».' },
          { label: 'Em outra banca…', detail: 'Trocam por «Vendem-se ingressos».', correct: 'Sujeito posposto plural → verbo plural.' },
        ],
        footer_rule: 'Só C está correta.',
      },
    ],
  },

  'vunesp-ag-pr-concordancia-a-frase-que-esta-em-conformidade-com-3419181': {
    family: 'conceito',
    source_tec_id: '3419181',
    source_note: 'Solidão houver conexões — VUNESP Ag Pref Itapevi 2025 tec 3419181',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag (Pref Itapevi)',
      orgao: 'Pref. Itapevi',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'A frase que está em conformidade com a norma-padrão de concordância verbal se encontra na alternativa:',
    options: [
      {
        id: 'A',
        text: 'Quando precisamos nos adaptar a novos ambientes, existe mais possiblidades de sucesso se evitarmos o isolamento.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Predação e falta de recursos foram ameaças aos primatas, fato que os levaram a perceber que era mais vantajoso permanecer em grupo.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Se houver boas conexões sociais, teremos chances de ampliar nossa qualidade de vida e não sucumbir ao sofrimento agravado pela solidão.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Já se tomou algumas medidas contra os efeitos nocivos da solidão, a exemplo da criação de órgãos públicos que tratem desse tema.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Devido à extrema solidão, pode surgir problemas graves para algumas pessoas, como doenças cardiovasculares e depressão.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Subjuntivo e núcleo',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo de cada oração? Verbo alinhado?', icon: 'Focus' },
          { label: 'Se houver', detail: 'Subjuntivo concorda com sujeito da oração («conexões» → «houver» ok em futuro do subj.).', icon: 'Link2' },
          { label: 'Existir', detail: '«Possibilidades» (pl.) → «existem», não «existe».', icon: 'Users' },
          { label: 'Fato que', detail: '«Fato» (sing.) → «levou», não «levaram».', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Índice «se tomou» com «medidas» plural — exige «tomaram».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cada oração: um núcleo, um verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com concordância verbal correta.',
          'A «existe possibilidades»: plural → «existem» — eliminar.',
          'B «fato que os levaram»: núcleo «fato» (sing.) → «levou» — eliminar.',
          'C «Se houver conexões… teremos… não sucumbir»: encadeamento correto — manter.',
          'D «se tomou medidas»: sujeito «medidas» (pl.) → «tomaram» — eliminar.',
          'E «pode surgir problemas»: plural → «podem surgir» — eliminar.',
          'Gabarito C.',
          'Em similares: teste oração por oração — não pare no primeiro verbo.',
        ],
        footer_rule: 'C: houver / teremos / sucumbir.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ORAÇÃO A ORAÇÃO',
        rows: [
          { label: 'Existir', value: '«Existem possibilidades» — plural.' },
          { label: 'Fato que', value: '«Fato que levou» — núcleo singular.' },
          { label: 'Índice se', value: '«Tomaram-se medidas» — sujeito plural.' },
          { label: 'Pode surgir', value: '«Problemas» → «podem surgir».' },
          { label: 'Nesta questão', value: 'C — Se houver conexões… teremos' },
        ],
        footer_rule: 'Subjuntivo segue o núcleo da sua oração.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Desvio em A, B, D, E',
        items: [
          { label: 'A — existe possibilidades', detail: 'Sujeito plural com verbo singular.', correct: '«Existem mais possibilidades de sucesso».' },
          { label: 'B — levaram', detail: '«Fato» singular com verbo plural.', correct: '«Fato que os levou a perceber».' },
          { label: 'D — tomou medidas', detail: 'Índice com sujeito posposto plural.', correct: '«Já se tomaram algumas medidas».' },
          { label: 'E — pode surgir problemas', detail: '«Problemas» plural com «pode surgir» singular.', correct: '«Podem surgir problemas graves».' },
          { label: 'Em outra banca…', detail: 'Trocam «conexões» por «laços familiares».', correct: 'Mesmo trilho: subjuntivo + futuro alinhados.' },
        ],
        footer_rule: 'Só C passa em todas as orações.',
      },
    ],
  },

  'ibfc-tec-enf-concordancia-analise-o-texto-a-seguir-e-responda-3450785': {
    family: 'text_fragment',
    source_tec_id: '3450785',
    source_note: 'Faz 30 anos × houve — IBFC Tec Enf SES SE 2025 tec 3450785',
    meta: {
      banca: 'IBFC',
      prova: 'Tec Enf (SES SE)',
      orgao: 'SES SE',
      ano: '2025',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Analise o texto a seguir e responda à questão abaixo.\n\nConsidere a concordância que ocorre em «Faz 30 anos» (1º §). Assinale a alternativa que apresenta um exemplo desse mesmo tipo de concordância.',
    text_fragment:
      '<p>«As dores são muito interessantes porque sabemos muito pouco sobre elas. <strong>Faz 30 anos</strong> que trabalho na área e ainda aprendo algo novo todo dia», diz a médica Anne MacGregor, pesquisadora especialista nos efeitos hormonais das cefaleias.</p>',
    options: [
      { id: 'A', text: 'Todas as dores haviam desaparecido.', is_correct: false },
      { id: 'B', text: 'Sempre fazem reclamações sobre o tema.', is_correct: false },
      { id: 'C', text: 'Já houve muitos acidentes nessa região.', is_correct: true },
      { id: 'D', text: 'O setor faz pesquisas frequentes na área.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faz × houve impessoal',
        chip_label: 'M13 — cefaleias',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Mesmo tipo de «Faz 30 anos» no texto sobre dores?', icon: 'Focus' },
          { label: 'Dores / cefaleias', detail: 'Texto II — Anne MacGregor, pesquisadora de cefaleias hormonais.', icon: 'HeartPulse' },
          { label: 'Faz 30 anos', detail: 'Locução impessoal de tempo — «faz» no singular.', icon: 'Clock' },
          { label: 'Trabalho na área', detail: '«Faz 30 anos que trabalho» — verbo impessoal, não concorda com «anos».', icon: 'Briefcase' },
          { label: 'Houve acidentes', detail: 'Haver existencial — singular com sujeito posposto plural.', icon: 'Check' },
        ],
        footer_rule: 'Faz tempo = houve coisas — impessoal singular.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto II (dores/cefaleias): modelo = «Faz 30 anos que trabalho» — impessoal singular.',
          'Tipo: locução impessoal (tempo) ou haver existencial — verbo não pluraliza.',
          'A «haviam desaparecido»: haver no plural — tipo diferente — eliminar.',
          'B «fazem reclamações»: «fazer» pessoal plural — eliminar.',
          'C «Já houve muitos acidentes»: haver existencial singular + sujeito pl. posposto — mesmo tipo.',
          'D «setor faz pesquisas»: «fazer» pessoal transitivo — eliminar.',
          'Gabarito C.',
          'Em similares: «Faz dois anos» ≈ «Houve dois acidentes» — impessoal.',
        ],
        footer_rule: 'C: houve — existencial singular.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMPESSOAL SINGULAR',
        rows: [
          { label: 'Faz + tempo', value: '«Faz 30 anos» — verbo no singular.' },
          { label: 'Haver existencial', value: '«Houve acidentes» — singular + sujeito posposto.' },
          { label: 'Não confundir', value: '«Fazem reclamações» = pessoal (sujeito claro).' },
          { label: 'Nesta questão', value: 'C — Já houve muitos acidentes' },
        ],
        footer_rule: 'TE: dor de cabeça → faz anos / houve casos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Tipos diferentes de «faz»/«houve»',
        items: [
          { label: 'A — haviam', detail: 'Haver pessoal/plural — não é existencial impessoal.', correct: '«Todas as dores haviam desaparecido» — outro regime.' },
          { label: 'B — fazem', detail: 'Sujeito «reclamações» com verbo pessoal.', correct: 'Não é locução impessoal de tempo.' },
          { label: 'D — faz pesquisas', detail: '«Setor» como sujeito de «fazer» transitivo.', correct: 'Verbo pessoal com objeto — tipo distinto.' },
          { label: 'Transferência', detail: '«Fazem dez anos» em prova oral informal.', correct: 'Norma culta: «Faz dez anos» — singular.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Há muitos casos».', correct: '«Há» impessoal ≈ «Houve» — mesmo campo semântico.' },
        ],
        footer_rule: 'C espelha «Faz 30 anos» — impessoal.',
      },
    ],
  },
};

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const loteRoot = loteDir(LOTE);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(loteRoot, { recursive: true });

  const slugs = Object.keys(SPECS);
  let n = 0;
  for (const [slug, spec] of Object.entries(SPECS)) {
    const path = join(outDir, `${slug}.json`);
    writeFileSync(path, `${JSON.stringify(build(slug, spec), null, 2)}\n`, 'utf8');
    n += 1;
    console.log(`[handcraft] OK ${slug}`);
  }

  const catalog = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
