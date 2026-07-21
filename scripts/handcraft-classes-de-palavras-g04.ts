#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g04 (8 slugs · Classes de palavras · lote 4 · Advérbio).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g04.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g04 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g04 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g04';
const SUBTOPICO = 'Classes de palavras';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_classes_palavras';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-formacao-palavras-siglas.json';

const CLASSES_SOURCE = {
  id: 'pt-classes-palavras-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Classes de palavras — morfologia e função na oração',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'advérbio e circunstância',
    'advérbio de modo tempo lugar intensidade',
    'locução adverbial',
    'adjetivo com função de advérbio',
    'pergunta-teste M02/M03',
    'classificação morfológica',
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
      reviewer: 'handcraft:classes-de-palavras-g04',
      guideline_snapshot: `M02/M03 Elias TE-simples — «O que a palavra faz na oração?» · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      CLASSES_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt_classes_palavras'],
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
  'avancasp-aee-classes-em-todas-as-construcoes-a-seguir-os-3374812': {
    family: 'certo_errado',
    source_tec_id: '3374812',
    source_note: 'EXCETO advérbio «de manhã» × substantivo — AVANÇASP AEE Pref Caieiras 2025 tec 3374812',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AEE (Pref Caieiras)',
      orgao: 'Pref Caieiras',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em todas as construções a seguir, os elementos destacados têm valor de advérbio, exceto em:',
    options: [
      { id: 'A', text: 'A feira acontece de manhã.', is_correct: false },
      { id: 'B', text: 'Tem viajado de trem.', is_correct: false },
      { id: 'C', text: 'O dia acabou de repente.', is_correct: false },
      { id: 'D', text: 'Apresentou-se de improviso.', is_correct: false },
      { id: 'E', text: 'Uma bela manhã de primavera.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Advérbio × substantivo',
        chip_label: 'M02 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Modifica verbo/adj/adv ou nomeia circunstância?', icon: 'Focus' },
          { label: 'De manhã / de trem', detail: 'Locuções adverbiais de tempo e modo — circunstanciam o verbo.', icon: 'Clock' },
          { label: 'De repente / de improviso', detail: 'Locuções adverbiais de modo — valor advérbial.', icon: 'Zap' },
          { label: 'E — manhã', detail: '«Manhã» é núcleo do sintagma nominal — substantivo comum.', icon: 'Box' },
          { label: 'Pegadinha EXCETO', detail: '«De manhã» (adv.) ≠ «uma manhã» (substantivo).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De + substantivo pode ser advérbio; substantivo sozinho, não.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'EXCETO → gabarito',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: quatro frases têm advérbio/locução adverbial; uma não.',
          'A «de manhã» — locução adverbial de tempo (quando a feira ocorre).',
          'B «de trem» — locução adverbial de modo/meio (como viaja).',
          'C «de repente» — locução adverbial de modo.',
          'D «de improviso» — locução adverbial de modo.',
          'E «uma bela manhã de primavera» — «manhã» é substantivo (núcleo nominal), não advérbio.',
          'Gabarito E — única sem valor adverbial no destaque.',
          'Em similares: «de manhã» (adv.) × «uma manhã» (sub.) — teste se nomeia ou circunstancia.',
        ],
        footer_rule: 'E — manhã substantivo, não advérbio.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'ADVÉRBIO × SUBSTANTIVO',
        rows: [
          { label: 'Pergunta-teste', value: 'Circunstancia verbo/adj/adv ou nomeia coisa?' },
          { label: 'Locução adverbial', value: 'De manhã, de repente, de improviso, de trem.' },
          { label: 'Substantivo', value: 'Uma manhã de primavera — «manhã» nomeia período.' },
          { label: 'EXCETO', value: 'Quatro advérbios/locuções + uma exceção nominal.' },
          { label: 'Nesta questão', value: 'E — substantivo «manhã»' },
        ],
        footer_rule: 'De manhã (adv.) ≠ uma manhã (sub.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — cada letra certa exceto E',
        items: [
          { label: 'A — de manhã', detail: 'Parece substantivo por conter «manhã».', correct: '«De manhã» é locução adverbial de tempo — valor advérbial.' },
          { label: 'B — de trem', detail: 'Confunde meio de transporte com substantivo.', correct: '«De trem» circunstancia o verbo «viajado» — advérbio.' },
          { label: 'C — de repente', detail: 'Locução fixa parece estranha.', correct: 'Locução adverbial de modo — conta como advérbio.' },
          { label: 'D — de improviso', detail: 'Mesmo padrão de C.', correct: 'Locução adverbial de modo — advérbio válido.' },
          { label: 'E — manhã', detail: '«Manhã» parece igual a «de manhã».', correct: 'Núcleo nominal «uma manhã» — substantivo, exceção do EXCETO.' },
          { label: 'Em outra banca…', detail: 'Trocam por «uma tarde de verão».', correct: 'Mesmo teste: substantivo no núcleo = exceção.' },
        ],
        footer_rule: 'Só E não é advérbio.',
      },
    ],
  },

  'avancasp-ag-classes-leia-o-texto-a-seguir-para-responder-3376854': {
    family: 'conceito',
    source_tec_id: '3376854',
    source_note: '«completamente» advérbio — Carlos Chagas — AVANÇASP Ag Pref Morungaba 2025 tec 3376854',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Morungaba)',
      orgao: 'Pref Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão abaixo.\n\nCarlos Chagas foi a primeira e até hoje única pessoa a descrever completamente uma doença infecciosa — a tripanossomíase americana. Com suas pesquisas, detalhou o patógeno, o vetor, os hospedeiros, as manifestações clínicas e a epidemiologia da doença que leva seu nome.\n\nNo trecho, a palavra «completamente» classifica-se morfologicamente como:',
    options: [
      { id: 'A', text: 'substantivo.', is_correct: false },
      { id: 'B', text: 'adjetivo.', is_correct: false },
      { id: 'C', text: 'advérbio.', is_correct: true },
      { id: 'D', text: 'preposição.', is_correct: false },
      { id: 'E', text: 'conjunção.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Completamente — circunstância',
        chip_label: 'M02 — advérbio',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Modifica verbo «descrever»? Indica modo/intensidade?', icon: 'Focus' },
          { label: 'Completamente', detail: 'Advérbio de modo/intensidade — como descreveu (por inteiro).', icon: 'Zap' },
          { label: '× Substantivo', detail: 'Não nomeia ser — qualifica a ação.', icon: 'XCircle' },
          { label: '× Adjetivo', detail: 'Não caracteriza nome — acompanha verbo.', icon: 'Ban' },
          { label: 'Pegadinha', detail: 'Termina em -mente → forte indício de advérbio.', icon: 'AlertTriangle' },
        ],
        footer_rule: '-mente após adjetivo → advérbio de modo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Carlos Chagas: «descrever completamente uma doença».',
          '«Completamente» acompanha o verbo «descrever» — indica modo/intensidade da ação.',
          'A substantivo: não nomeia coisa — eliminar.',
          'B adjetivo: não qualifica substantivo próximo — eliminar.',
          'D preposição / E conjunção: não ligam termos aqui — eliminar.',
          'C advérbio — modifica verbo «descrever».',
          'Gabarito C.',
          'Em similares: -mente + verbo = advérbio de modo/intensidade.',
        ],
        footer_rule: 'C — advérbio de modo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPLETAMENTE = ADVÉRBIO',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica verbo? Termina em -mente?' },
          { label: 'Função', value: 'Advérbio de modo/intensidade — circunstancia «descrever».' },
          { label: 'Formação', value: 'Completo + -mente → advérbio derivado.' },
          { label: '× outras classes', value: 'Não nomeia (sub.) nem qualifica nome (adj.).' },
          { label: 'Nesta questão', value: 'C — advérbio' },
        ],
        footer_rule: 'Verbo + completamente → advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras classes não encaixam',
        items: [
          { label: 'A — substantivo', detail: '«Completamente» parece nome abstrato.', correct: 'Circunstancia verbo — função adverbial, não nominal.' },
          { label: 'B — adjetivo', detail: 'Raiz «completo» confunde com adjetivo.', correct: 'Com -mente, perde função adjetival — vira advérbio.' },
          { label: 'D — preposição', detail: 'Palavra longa «parece» ligar termos.', correct: 'Não estabelece relação nominal/verbal de preposição.' },
          { label: 'E — conjunção', detail: 'Confunde com conectivo.', correct: 'Não liga orações nem termos coordenados.' },
          { label: 'Em outra banca…', detail: 'Trocam por «totalmente» ou «integralmente».', correct: 'Mesmo trilho: -mente + verbo = advérbio.' },
        ],
        footer_rule: 'Só C — advérbio.',
      },
    ],
  },

  'avancasp-acs-classes-os-adverbios-sao-palavras-que-modifi-3452344': {
    family: 'conceito',
    source_tec_id: '3452344',
    source_note: '«livremente» advérbio de modo — AVANÇASP ACS Pref Morungaba 2025 tec 3452344',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Morungaba)',
      orgao: 'Pref Morungaba',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Os advérbios são palavras que modificam o verbo, o adjetivo ou outro advérbio. Eles recebem a denominação da circunstância ou de outra ideia acessória que expressam.\n\nNa frase «Falou livremente para a plateia naquele dia.», o advérbio destacado modifica «Falou» e é classificado como:',
    options: [
      { id: 'A', text: 'Advérbio de dúvida', is_correct: false },
      { id: 'B', text: 'Advérbio de intensidade', is_correct: false },
      { id: 'C', text: 'Advérbio de modo', is_correct: true },
      { id: 'D', text: 'Advérbio de lugar', is_correct: false },
      { id: 'E', text: 'Advérbio de tempo', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Livremente — como falou',
        chip_label: 'M02 — advérbio de modo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Como falou? Circunstância de modo → advérbio de modo.', icon: 'Focus' },
          { label: 'Livremente', detail: 'Indica maneira da ação verbal — sem constrangimento.', icon: 'Mic' },
          { label: 'Modifica «Falou»', detail: 'Advérbio de modo sempre circunstancia verbo/adj/adv.', icon: 'ArrowRight' },
          { label: '× Tempo/lugar', detail: '«Naquele dia» é tempo; «livremente» não é.', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Confundir intensidade (muito) com modo (como).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Como? → advérbio de modo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Frase: «Falou livremente para a plateia naquele dia.»',
          'Advérbio destacado: «livremente» — modifica o verbo «Falou».',
          'Pergunta: como falou? → circunstância de modo.',
          'A dúvida (talvez, quiçá) — eliminar.',
          'B intensidade (muito, pouco) — «livremente» indica maneira, não grau.',
          'D lugar / E tempo — «livremente» não indica onde nem quando.',
          'C advérbio de modo — correto.',
          'Gabarito C.',
          'Em similares: «calmamente», «rapidamente» após verbo — sempre advérbio de modo.',
        ],
        footer_rule: 'Livremente = modo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVÉRBIO DE MODO',
        rows: [
          { label: 'Pergunta-teste', value: 'Como? De que maneira?' },
          { label: 'Livremente', value: 'Modo da fala — sem cerimônia.' },
          { label: 'Formação', value: 'Livre + -mente → advérbio derivado.' },
          { label: '≠ tempo', value: 'Naquele dia = tempo (outro advérbio na frase).' },
          { label: 'Nesta questão', value: 'C — advérbio de modo' },
        ],
        footer_rule: '-mente após adjetivo → modo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar circunstância',
        items: [
          { label: 'A — dúvida', detail: '«Livremente» não expressa incerteza.', correct: 'Dúvida = talvez, quiçá — não é o caso.' },
          { label: 'B — intensidade', detail: 'Confunde «de modo livre» com «muito».', correct: 'Indica maneira da ação — modo, não intensidade.' },
          { label: 'D — lugar', detail: '«Para a plateia» é destino, não o advérbio.', correct: 'Livremente não responde «onde?».' },
          { label: 'E — tempo', detail: '«Naquele dia» é tempo na frase.', correct: 'O destacado é «livremente» — modo, não tempo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «calmamente» ou «rapidamente».', correct: 'Mesmo teste: como? → modo.' },
        ],
        footer_rule: 'Só C — modo.',
      },
    ],
  },

  'avancasp-ag-classes-identifique-em-qual-das-sentencas-a-3457304': {
    family: 'conceito',
    source_tec_id: '3457304',
    source_note: 'Locução adverbial «de repente» — AVANÇASP Ag Pref Caconde 2025 tec 3457304',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref Caconde)',
      orgao: 'Pref Caconde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Identifique em qual das sentenças a seguir a expressão em destaque é uma locução adverbial.',
    options: [
      { id: 'A', text: 'Calou-se, ao invés de se manifestar em favor da vítima.', is_correct: false },
      { id: 'B', text: 'Todos os alunos do curso fizeram uma homenagem à professora.', is_correct: false },
      { id: 'C', text: 'Os convidados ouviram de repente um estalo no sótão.', is_correct: true },
      { id: 'D', text: 'Os doces de chocolate foram feitos ontem à noite.', is_correct: false },
      { id: 'E', text: 'A produção de brinquedos foi suspensa por falta de recursos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locução adverbial',
        chip_label: 'M03 — locução',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Grupo de palavras com valor de um advérbio?', icon: 'Focus' },
          { label: 'De repente', detail: 'Locução adverbial de modo — indica como ouviu o estalo.', icon: 'Zap' },
          { label: '× Ao invés de', detail: 'Locução prepositiva/concessiva — não adverbial.', icon: 'XCircle' },
          { label: '× À professora', detail: 'Locução prepositiva — indica destino.', icon: 'Ban' },
          { label: 'Pegadinha', detail: '«Ontem à noite» também é locução, mas o destaque é «de repente» em C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Locução adverbial = valor de advérbio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: achar locução adverbial na expressão destacada.',
          'A «ao invés de» — locução prepositiva (oposição) — eliminar.',
          'B «à professora» — locução prepositiva de destino — eliminar.',
          'C «de repente» — locução adverbial de modo (como ouviram) — candidata.',
          'D «ontem à noite» — locução de tempo, mas gabarito oficial é C (destaque «de repente»).',
          'E «por falta de» — locução prepositiva causal — eliminar.',
          'Gabarito C — de repente.',
          'Em similares: teste se o grupo circunstancia verbo como um só advérbio.',
        ],
        footer_rule: 'C — de repente (loc. adv.).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LOCUÇÃO ADVERBIAL',
        rows: [
          { label: 'Pergunta-teste', value: 'Duas+ palavras, valor de um advérbio?' },
          { label: 'De repente', value: 'Modo — súbito, inesperado.' },
          { label: '≠ prepositiva', value: 'Ao invés de, à professora, por falta de.' },
          { label: 'Exemplos', value: 'De improviso, às vezes, de manhã.' },
          { label: 'Nesta questão', value: 'C — de repente' },
        ],
        footer_rule: 'Circunstancia verbo = locução adverbial.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Locução prepositiva × adverbial',
        items: [
          { label: 'A — ao invés de', detail: 'Parece conectar ideias como advérbio.', correct: 'Locução prepositiva de oposição — não adverbial.' },
          { label: 'B — à professora', detail: '«À» atrai como locução adverbial.', correct: 'Destino/regência — locução prepositiva.' },
          { label: 'D — ontem à noite', detail: 'Também é locução de tempo.', correct: 'Gabarito C: destaque «de repente» — locução adverbial de modo.' },
          { label: 'E — por falta de', detail: 'Causal parece circunstância.', correct: 'Locução prepositiva causal — não adverbial.' },
          { label: 'Em outra banca…', detail: 'Trocam por «de súbito» ou «a brutos».', correct: 'Mesmo teste: grupo com valor adverbial único.' },
        ],
        footer_rule: 'Só C — locução adverbial.',
      },
    ],
  },

  'avancasp-con-classes-leia-o-texto-a-seguir-para-responder-3460251': {
    family: 'conceito',
    source_tec_id: '3460251',
    source_note: '«Precisamente» advérbio de intensidade — O homem rouco Braga — AVANÇASP Cont FUSAM 2025 tec 3460251',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Cont (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão abaixo.\n\n«O homem rouco» (Rubem Braga). Trecho: o narrador perde a voz, trata-se, questiona seus complexos e recorda a infância. Em um momento, pergunta retoricamente: «Terei muitos complexos? Precisamente quantos?»\n\nAssinale a alternativa em que o trecho apresenta um advérbio de intensidade (ênfase):',
    options: [
      { id: 'A', text: '«Dizia certamente outras coisas e numa delas me perdi».', is_correct: false },
      { id: 'B', text: '«Terei muitos complexos? Precisamente quantos?»', is_correct: true },
      { id: 'C', text: '«Ela sempre foi embrulhada e confusa».', is_correct: false },
      { id: 'D', text: '«Não farei essas coisas».', is_correct: false },
      { id: 'E', text: '«Quando era criança, agora me lembro, passei um ano gago».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Precisamente — ênfase',
        chip_label: 'M02 — intensidade',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Intensifica/ênfase no termo seguinte?', icon: 'Focus' },
          { label: 'Precisamente', detail: 'Advérbio de intensidade — reforça «quantos».', icon: 'Zap' },
          { label: 'Certamente / sempre', detail: 'Afirmação ou frequência — outras circunstâncias.', icon: 'Clock' },
          { label: 'Agora', detail: 'Advérbio de tempo no trecho E.', icon: 'Timer' },
          { label: 'Pegadinha', detail: 'Confundir afirmação (certamente) com ênfase (precisamente).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Precisamente quantos = ênfase no numeral.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Braga «O homem rouco»: comando pede advérbio de intensidade/ênfase.',
          'A «certamente» — advérbio de afirmação/probabilidade — eliminar.',
          'B «Precisamente quantos?» — intensifica a pergunta sobre o número — correto.',
          'C «sempre» — advérbio de tempo/frequência — eliminar.',
          'D «Não farei» — verbo no futuro, sem advérbio de ênfase destacado — eliminar.',
          'E «agora» — advérbio de tempo — eliminar.',
          'Gabarito B.',
          'Em similares: «exatamente», «precisamente» + numeral = intensidade.',
        ],
        footer_rule: 'B — Precisamente (intensidade).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVÉRBIO DE INTENSIDADE',
        rows: [
          { label: 'Pergunta-teste', value: 'Reforça grau/ênfase de outro termo?' },
          { label: 'Precisamente', value: 'Intensifica «quantos» — ironia/ênfase.' },
          { label: '≠ afirmação', value: 'Certamente = probabilidade, não ênfase numérica.' },
          { label: '≠ tempo', value: 'Sempre, agora = circunstância temporal.' },
          { label: 'Nesta questão', value: 'B — Precisamente' },
        ],
        footer_rule: 'Precisamente + quantos = ênfase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outros advérbios nas alternativas',
        items: [
          { label: 'A — certamente', detail: 'Também é advérbio — parece plausível.', correct: 'Afirmação/probabilidade — não intensifica numeral como «precisamente».' },
          { label: 'C — sempre', detail: 'Advérbio claro na frase.', correct: 'Frequência/tempo — não intensidade sobre «quantos».' },
          { label: 'D — não farei', detail: 'Foco na negação.', correct: 'Sem advérbio de ênfase — verbo + negação.' },
          { label: 'E — agora', detail: 'Advérbio de tempo visível.', correct: 'Tempo da lembrança — não intensidade.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Exatamente quantos?».', correct: 'Mesmo padrão: ênfase no numeral interrogativo.' },
        ],
        footer_rule: 'Só B — intensidade.',
      },
    ],
  },

  'avancasp-con-classes-um-adjetivo-funciona-como-adverbio-a-3460253': {
    family: 'conceito',
    source_tec_id: '3460253',
    source_note: '«alto» adjetivo como advérbio — AVANÇASP Cont FUSAM 2025 tec 3460253',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Cont (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Um adjetivo funciona como advérbio apenas em:',
    options: [
      { id: 'A', text: 'O amarelo da bandeira remete à riqueza do país.', is_correct: false },
      { id: 'B', text: 'De repente, a mídia, coagida, deixou de tocar no assunto.', is_correct: false },
      { id: 'C', text: 'A música na casa do vizinho tocou alto por trinta minutos.', is_correct: true },
      { id: 'D', text: 'A caligrafia no bilhete era charmosa, com traços finos.', is_correct: false },
      { id: 'E', text: 'A polícia seguiu o carro até a nova ponte da cidade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto — adj. → adv.',
        chip_label: 'M03 — função adverbial',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Palavra de qualidade modificando verbo (não nome)?', icon: 'Focus' },
          { label: 'Tocou alto', detail: '«Alto» = intensidade do som — função de advérbio.', icon: 'Volume2' },
          { label: '× O amarelo', detail: 'Substantivação — «amarelo» é núcleo nominal.', icon: 'Palette' },
          { label: '× Charmosa', detail: 'Adjetivo qualificando «caligrafia» — função adjetiva.', icon: 'Ban' },
          { label: 'Pegadinha', detail: '«De repente» já é locução adverbial, não adjetivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adj. + verbo (sem nome) → função adverbial.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: adjetivo com função de advérbio (modifica verbo).',
          'A «o amarelo» — substantivo (cor como nome) — eliminar.',
          'B «de repente» — locução adverbial pronta, não adjetivo — eliminar.',
          'C «tocou alto» — «alto» modifica verbo «tocou» (intensidade do som) — correto.',
          'D «charmosa» qualifica «caligrafia» — adjetivo puro — eliminar.',
          'E sem adjetivo funcionando como advérbio — eliminar.',
          'Gabarito C.',
          'Em similares: falar alto, cantar belo — adjetivo com valor adverbial.',
        ],
        footer_rule: 'C — alto (adv.).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJETIVO → ADVÉRBIO',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica verbo sem artigo antes?' },
          { label: 'Tocou alto', value: 'Alto = intensidade — função adverbial.' },
          { label: '× substantivo', value: 'O amarelo = nome da cor.' },
          { label: '× adjetivo', value: 'Charmosa = qualifica substantivo.' },
          { label: 'Nesta questão', value: 'C — alto como advérbio' },
        ],
        footer_rule: 'Verbo + alto/belo = advérbio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada distrator mantém outra função',
        items: [
          { label: 'A — amarelo', detail: 'Cor parece adjetivo.', correct: '«O amarelo» substantivado — função nominal.' },
          { label: 'B — de repente', detail: 'É advérbio, mas não adjetivo convertido.', correct: 'Locução adverbial fixa — não adj→adv.' },
          { label: 'D — charmosa', detail: 'Adjetivo visível na frase.', correct: 'Qualifica «caligrafia» — função adjetiva típica.' },
          { label: 'E — nova', detail: '«Nova ponte» — adjetivo adnominal.', correct: 'Caracteriza substantivo — não função adverbial.' },
          { label: 'Em outra banca…', detail: 'Trocam por «falou baixo» ou «correu rápido».', correct: 'Mesmo teste: adjetivo modificando verbo.' },
        ],
        footer_rule: 'Só C — adj. como adv.',
      },
    ],
  },

  'avancasp-acs-classes-leia-o-texto-a-seguir-para-responder-3661685': {
    family: 'conceito',
    source_tec_id: '3661685',
    source_note: '«principalmente» advérbio de modo — Osvaldo Coelho — AVANÇASP ACS Pref Cerquilho 2025 tec 3661685',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Cerquilho)',
      orgao: 'Pref Cerquilho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nTrecho de «Um coelho» (Rubem Braga): o narrador recebe Osvaldo Coelho de presente de Páscoa; a cozinheira protesta; ele sugere, em tom de brincadeira, preparar o animal. No final: «Eu, principalmente, estava encabuladíssimo, pois acabava de sugerir uma navalhada no pescoço dele.»\n\nNo texto, o advérbio destacado «principalmente» expressa noção de:',
    options: [
      { id: 'A', text: 'tempo.', is_correct: false },
      { id: 'B', text: 'modo.', is_correct: true },
      { id: 'C', text: 'restrição.', is_correct: false },
      { id: 'D', text: 'negação.', is_correct: false },
      { id: 'E', text: 'possibilidade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Principalmente — ênfase',
        chip_label: 'M02 — advérbio de modo',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Indica maneira/grau da ação ou estado?', icon: 'Focus' },
          { label: 'Osvaldo Coelho', detail: 'Narrador encabulado após sugerir «navalhada» no coelho de Páscoa.', icon: 'Rabbit' },
          { label: 'Principalmente', detail: 'Advérbio de modo — «sobretudo eu» estava encabuladíssimo.', icon: 'User' },
          { label: 'Cozinheira', detail: 'Contraste: ela também calou ao ouvir a sugestão violenta.', icon: 'Users' },
          { label: '× Restrição', detail: '«Só», «apenas» limitam — não é o caso.', icon: 'Ban' },
          { label: '× Negação', detail: '«Não» nega — principalmente afirma ênfase.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Confundir ênfase (modo) com tempo (quando).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Principalmente = sobretudo (modo).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Osvaldo Coelho: advérbio «principalmente» antes de «estava encabuladíssimo».',
          'Função: destacar que o narrador era o mais envergonhado — circunstância de modo/ênfase.',
          'A tempo — não indica quando — eliminar.',
          'B modo — indica maneira/grau de estar encabulado — correto.',
          'C restrição — seria «só eu» limitando — eliminar.',
          'D negação — não nega a ação — eliminar.',
          'E possibilidade — seria «talvez» — eliminar.',
          'Gabarito B.',
          'Em similares: «sobretudo», «especialmente» — advérbio de modo com ênfase no sujeito.',
        ],
        footer_rule: 'B — modo (ênfase).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRINCIPALMENTE',
        rows: [
          { label: 'Pergunta-teste', value: 'Sobretudo? De que modo/grau?' },
          { label: 'Osvaldo / Páscoa', value: 'Coelho de presente — contexto do trecho.' },
          { label: 'Principalmente', value: 'Advérbio de modo — ênfase no narrador encabuladíssimo.' },
          { label: '≠ restrição', value: 'Só/apenas limitam — principalmente intensifica.' },
          { label: 'Nesta questão', value: 'B — modo' },
        ],
        footer_rule: 'Principalmente = advérbio de modo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras noções semânticas',
        items: [
          { label: 'A — tempo', detail: '«Principalmente» parece marcar momento.', correct: 'Não indica quando — ênfase no sujeito (modo).' },
          { label: 'C — restrição', detail: 'Confunde ênfase com exclusão.', correct: 'Não limita a outros — destaca o narrador.' },
          { label: 'D — negação', detail: 'Pelo contexto de vergonha.', correct: 'Afirma estado encabulado — não nega.' },
          { label: 'E — possibilidade', detail: 'Tom incerto do narrador.', correct: 'Certeza do estado — não hipótese.' },
          { label: 'Em outra banca…', detail: 'Trocam por «sobretudo» ou «especialmente».', correct: 'Mesmo valor: advérbio de modo/ênfase.' },
        ],
        footer_rule: 'Só B — modo.',
      },
    ],
  },

  'quadrix-aux-classes-15-07-2026-19-33-47-88-110-111-112-t-3738663': {
    family: 'conceito',
    source_tec_id: '3738663',
    source_note: '«à toa» locução adverbial — doenças autoimunes — QUADRIX Aux FUABC 2025 tec 3738663',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto para a questão. Trecho sobre doenças autoimunes: o sistema imunológico ataca o próprio corpo; a incidência aumentou; há hipóteses sobre causas (higiene, infecções). «Não é à toa que as doenças autoimunes tanto assustam.»\n\nNo trecho, a expressão destacada «à toa» classifica-se como:',
    options: [
      { id: 'A', text: 'um substantivo.', is_correct: false },
      { id: 'B', text: 'um adjetivo.', is_correct: false },
      { id: 'C', text: 'um advérbio.', is_correct: false },
      { id: 'D', text: 'uma locução adjetiva.', is_correct: false },
      { id: 'E', text: 'uma locução adverbial.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'À toa — locução',
        chip_label: 'M03 — locução adverbial',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Grupo com valor de advérbio (causa/modo)?', icon: 'Focus' },
          { label: 'À toa', detail: 'Locução adverbial — «sem motivo» / «com razão» (negado).', icon: 'Link' },
          { label: 'Não é à toa que', detail: 'Expressão fixa de justificativa — valor adverbial.', icon: 'CheckCircle' },
          { label: '× Substantivo', detail: '«Toa» isolada não nomeia ser no trecho.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Crase atrai para locução adjetiva — teste função na oração.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'À toa = locução adverbial fixa.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto doenças autoimunes: «Não é à toa que… tanto assustam».',
          '«À toa» = locução com valor adverbial (causalidade: não é sem razão).',
          'A substantivo / B adjetivo — não qualificam nome isolado — eliminar.',
          'C advérbio simples — é grupo de palavras (preposição + substantivo) — eliminar.',
          'D locução adjetiva — não caracteriza substantivo — eliminar.',
          'E locução adverbial — circunstancia a oração inteira — correto.',
          'Gabarito E.',
          'Em similares: à toa, de repente, às vezes — locuções adverbiais.',
        ],
        footer_rule: 'E — locução adverbial.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'À TOA',
        rows: [
          { label: 'Pergunta-teste', value: 'Expressão fixa com valor de advérbio?' },
          { label: 'À toa', value: 'Locução adverbial — sem motivo / à toa.' },
          { label: 'Não é à toa que', value: 'Justificativa — não é sem razão.' },
          { label: '≠ adjetiva', value: 'Não qualifica nome («coisa à toa» seria outro teste).' },
          { label: 'Nesta questão', value: 'E — locução adverbial' },
        ],
        footer_rule: 'Grupo + valor adverbial = locução.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase e classe gramatical',
        items: [
          { label: 'A — substantivo', detail: '«Toa» parece nome.', correct: 'No trecho, função adverbial do grupo «à toa».' },
          { label: 'B — adjetivo', detail: 'Crase sugere «a» + «toa» adjetivando.', correct: 'Não qualifica substantivo — circunstancia oração.' },
          { label: 'C — advérbio', detail: 'É advérbio, mas alternativa pede forma.', correct: 'É locução (duas palavras) — não advérbio simples.' },
          { label: 'D — loc. adjetiva', detail: 'Crase confunde com «menina à toa».', correct: 'Aqui modifica oração — locução adverbial.' },
          { label: 'Em outra banca…', detail: 'Trocam por «de propósito» ou «sem razão».', correct: 'Mesmo valor adverbial do grupo.' },
        ],
        footer_rule: 'Só E — locução adverbial.',
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
    slugs,
  };
  writeFileSync(loteCatalogPath(LOTE), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] catalog.json written (${slugs.length} slugs)`);

  const manifest = {
    lote: LOTE,
    subtopico: SUBTOPICO,
    topico: TOPICO,
    pedagogical_branch: BRANCH,
    total: slugs.length,
    slugs,
  };
  writeFileSync(loteManifestPath(LOTE), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[handcraft] manifest.json written (${slugs.length} slugs)`);
  console.log(`[handcraft] lote=${LOTE} written=${n} dir=${outDir}`);
}

main();
