#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — concordancia-verbal-e-nominal-g02 (8 slugs · Concordância · lote 2).
 *
 *   npx tsx scripts/handcraft-concordancia-verbal-e-nominal-g02.ts
 *   npm run audit:questao-readiness -- --lote=concordancia-verbal-e-nominal-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=concordancia-verbal-e-nominal-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'concordancia-verbal-e-nominal-g02';
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
    'existe/existem',
    'partitivo (maioria)',
    'subjuntivo com sujeito plural',
    'expressões de tempo (passar de)',
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
      reviewer: 'handcraft:concordancia-verbal-e-nominal-g02',
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
  'vunesp-tenf-concordancia-charlotte-alunas-3840783': {
    family: 'text_fragment',
    source_tec_id: '3840783',
    source_note: 'Charlotte ioga 102 anos — alunas dedicadas — VUNESP TEnf Pref Osasco 2026 tec 3840783',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Leia o texto a seguir para responder a questão. Assinale a alternativa em que o enunciado, adaptado do texto, está redigido de acordo com a norma-padrão de concordância verbal e nominal.',
    text_fragment:
      '<p>Professora de ioga de 102 anos ensina sua abordagem simples para envelhecer bem. Desde 1982, Charlotte, agora com 102 anos, ensina ioga em Léré, uma vila francesa na região do Loire. Suas ruas sinuosas são ladeadas por casas precárias e pequenos comércios. Nesse cenário, está localizado seu estúdio — instalado no prédio de uma antiga delegacia; os vestiários já foram celas de prisão. Charlotte só experimentou a ioga aos 50 anos. Segundo Charlotte, o que mais a sustenta são suas <strong>alunas</strong> e o apoio social que elas oferecem. (Danielle Friedman, O Estado de S.Paulo. Adaptado)</p>',
    options: [
      {
        id: 'A',
        text: 'Foram constatados que casas precárias e pequenos comércios ladeiam as ruas sinuosas de Léré.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O estúdio de ioga de Charlotte dispõem de vestiários bem rústico, que um dia já foi cela de prisão.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A idosa, sempre dinâmica, conta com a companhia de alunas bastante dedicadas, que não a deixam sentir solidão.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Charlotte e o filho é domiciliado num chalé que está em sua família já fazem pelo menos cem anos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Para não ficar entediada, Charlotte e as amigas começaram a praticarem ioga com rigorosa disciplina.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que concorda?', icon: 'Focus' },
          { label: 'Verbo × sujeito', detail: 'Número e pessoa do verbo seguem o núcleo — não o vizinho.', icon: 'Target' },
          { label: 'Nominal', detail: 'Adj/adjunto flexiona com o nome que modifica.', icon: 'Box' },
          { label: 'Charlotte', detail: 'Texto sobre professora de ioga de 102 anos em Léré.', icon: 'User' },
          { label: 'Alunas dedicadas', detail: '«Alunas… que não a deixam» — relativa plural correta.', icon: 'Users' },
          { label: 'Pegadinha', detail: 'Sujeito composto ou impessoal mal alinhado ao verbo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Achar o núcleo antes de julgar a letra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Núcleo → verbo → letras',
        meta: slideMeta,
        steps: [
          'Comando: frase adaptada do texto com concordância verbal e nominal corretas.',
          'A «Foram constatados que»: impessoal exige «Foi constatado» — eliminar.',
          'B «estúdio dispõem» + «rústico»: sujeito sing. + verbo pl. + adj sing. — eliminar.',
          'C «alunas… que não a deixam»: sujeito «alunas» (pl.) + relativa «deixam» — correto.',
          'D «Charlotte e o filho é domiciliado… já fazem»: sujeito composto desalinhado — eliminar.',
          'E «começaram a praticarem»: infinitivo indevido após «começar» — eliminar.',
          'Gabarito C.',
          'Em similares: teste núcleo verbal, nominal e da oração relativa.',
        ],
        footer_rule: 'Núcleo em foco — verbal e nominal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'NÚCLEO → VERBO / NOME',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo do sujeito? Com o que concorda?' },
          { label: 'Relativa', value: 'Verbo concorda com o antecedente («alunas» → «deixam»).' },
          { label: 'Sujeito composto', value: '«A e B» → plural na maioria dos casos.' },
          { label: 'Impessoal', value: '«Foi constatado que» — não «foram constatados».' },
          { label: 'Nesta questão', value: 'C: alunas dedicadas que não a deixam sentir solidão.' },
        ],
        footer_rule: 'Relativa: antecedente manda no verbo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra por desalinhar núcleo',
        items: [
          { label: 'A — Foram constatados', detail: 'Impessoal mal flexionado no plural.', correct: '«Foi constatado que casas… ladeiam…».' },
          { label: 'B — dispõem / rústico', detail: '«Estúdio» (sing.) com «dispõem» e adj. singular «rústico».', correct: '«Dispõe de vestiários rústicos».' },
          { label: 'D — é domiciliado / fazem', detail: 'Sujeito duplo com verbos em número diferente.', correct: '«Charlotte e o filho são domiciliados…».' },
          { label: 'E — praticarem', detail: '«Começar a» + infinitivo sem flexão extra.', correct: '«Começaram a praticar ioga».' },
          { label: 'Em outra banca…', detail: 'Trocam «alunas» por «discípulas» ou «estudantes».', correct: 'Mesmo trilho: relativa plural com antecedente plural.' },
        ],
        footer_rule: 'Só C mantém verbal e nominal corretas.',
      },
    ],
  },

  'selecon-rece-concordancia-houve-danos-3852271': {
    family: 'conceito',
    source_tec_id: '3852271',
    source_note: 'Haver impessoal «não houve danos» — SELECON Recep CM Porto dos Gaúchos 2026 tec 3852271',
    meta: {
      banca: 'SELECON',
      prova: 'Recep (CM Porto dos Gaúchos)',
      orgao: 'CM Porto dos Gaúchos',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir: CEO da empresa sul-coreana responsável por foguete que explodiu em Alcântara pede desculpas. […] Soo-jong disse que não houve danos a pessoas ou instalações terrestres e que todos os procedimentos e controles para garantir a segurança do lançamento foram realizados conforme os padrões internacionais de instituições competentes, incluindo a Força Aérea Brasileira (FAB). (Fonte: Excerto. Acesso em 24/12/2023) «Soo-jong disse que não houve danos a pessoas ou instalações terrestres» (4º parágrafo). Nesse trecho, a flexão do verbo HAVER está:',
    options: [
      {
        id: 'A',
        text: 'correta, pois o sujeito do verbo é Soo-jong',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'correta, pois o verbo indicado está sendo usado de modo impessoal',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'incorreta, pois a palavra "danos" deveria levar a flexão verbal à forma "houveram"',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'incorreta, pois o termo "pessoas ou instalações terrestres" deveria concordar com "houveram"',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Haver impessoal',
        chip_label: 'M13 — haver',
        meta: slideMeta,
        items: [
          { label: 'Soo-jong', detail: 'CEO citado no trecho sobre o foguete em Alcântara.', icon: 'User' },
          { label: 'Não houve danos', detail: 'Trecho do 4º parágrafo — flexão do verbo HAVER.', icon: 'Focus' },
          { label: 'Pessoas / instalações', detail: 'Complemento plural não pluraliza haver impessoal.', icon: 'Building' },
          { label: 'Haver impessoal', detail: '«Houve danos» — verbo no singular; modo impessoal.', icon: 'Check' },
          { label: 'Pegadinha C/D', detail: '«Houveram» por «danos» ou «pessoas» — erro clássico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Haver impessoal → houve/havia, não houveram.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: «Soo-jong disse que não houve danos a pessoas ou instalações terrestres».',
          'Pergunta: a flexão do verbo HAVER está correta ou incorreta?',
          '«Disse» concorda com Soo-jong; «houve» é outra oração — haver impessoal.',
          'A atribui «houve» a Soo-jong — erro de análise — eliminar.',
          'B: haver no modo impessoal/existencial — correto.',
          'C: «danos» plural não puxa «houveram» — eliminar.',
          'D: complemento plural não pluraliza haver impessoal — eliminar.',
          'Gabarito B — verbo impessoal: não houve danos.',
          'Em similares: «houve problemas», «houve feridos» — haver impessoal no singular.',
        ],
        footer_rule: 'Houve danos = impessoal correto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HAVER IMPESSOAL',
        rows: [
          { label: 'Pergunta-teste', value: 'Haver indica existência? → singular.' },
          { label: 'Forma', value: '«Houve danos» / «Havia pessoas» — não «houveram».' },
          { label: 'Sujeito', value: 'Impessoal — sem sujeito determinado.' },
          { label: 'Nesta questão', value: 'B — uso impessoal de haver' },
        ],
        footer_rule: 'Danos (pl.) não pluraliza houve.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises erradas do trecho',
        items: [
          { label: 'A — sujeito Soo-jong', detail: 'Confunde sujeito de «disse» com «houve».', correct: '«Houve» é impessoal na oração subordinada.' },
          { label: 'C — houveram danos', detail: 'Pluraliza haver pelo complemento «danos».', correct: '«Não houve danos» — impessoal no singular.' },
          { label: 'D — houveram pessoas', detail: 'Complemento plural não muda haver impessoal.', correct: '«Houve danos a pessoas» — mesma regra.' },
          { label: 'Em outra banca…', detail: 'Trocam por «não houve feridos» ou «houve vítimas».', correct: 'Transferência: haver existencial sempre no singular.' },
        ],
        footer_rule: 'B: haver impessoal — forma correta.',
      },
    ],
  },

  'avancasp-afa-concordancia-mafalda-existem-3962461': {
    family: 'conceito',
    source_tec_id: '3962461',
    source_note: 'Mafalda «existem mundos que possuem» — AVANÇASP AFar Pref Nova Odessa 2026 tec 3962461',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AFar (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'QUINO. Mafalda. Disponível em <content/uploads/2011/05/mafalda-quino.pdf>. "(...) há mundos que têm discos voadores" Reescrevendo o trecho da charge acima com verbos de mesmo sentido, fica correta a seguinte forma:',
    options: [
      { id: 'A', text: 'têm mundos que tem discos voadores', is_correct: false },
      { id: 'B', text: 'existe mundos que possui discos voadores', is_correct: false },
      { id: 'C', text: 'existem mundos que possui discos voadores', is_correct: false },
      { id: 'D', text: 'existe mundos que possuem discos voadores', is_correct: false },
      { id: 'E', text: 'existem mundos que possuem discos voadores', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Existir pessoal',
        chip_label: 'M13 — existir',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo de cada oração? Com o que concorda?', icon: 'Focus' },
          { label: 'Há → existir', detail: '«Há mundos» = «Existem mundos» — verbo pessoal no plural.', icon: 'Users' },
          { label: 'Relativa', detail: '«mundos que possuem» — núcleo plural → «possuem».', icon: 'Link2' },
          { label: 'Haver × existir', detail: 'Haver impessoal (sing.) ≠ existir pessoal (pl.).', icon: 'Ban' },
          { label: 'Pegadinha', detail: '«Existe mundos» ou «possui» com sujeito plural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mundos (pl.) → existem / possuem.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge Mafalda: «há mundos que têm discos voadores» — reescrever com sinônimos.',
          '1ª oração: «mundos» (pl.) → «existem mundos» (não «existe»).',
          'A «têm mundos que tem»: ordem e concordância quebradas — eliminar.',
          'B «existe mundos que possui»: dois erros de número — eliminar.',
          'C «existem… possui»: relativa no singular — eliminar.',
          'D «existe… possuem»: principal no singular — eliminar.',
          'E «existem mundos que possuem»: ambas as concordâncias corretas.',
          'Gabarito E.',
          'Em similares: há/existir — teste o núcleo de cada verbo.',
        ],
        footer_rule: 'Existem mundos que possuem.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HÁ → EXISTIR',
        rows: [
          { label: 'Há mundos', value: '→ Existem mundos (pessoal, plural).' },
          { label: 'que têm', value: '→ que possuem (relativa, plural).' },
          { label: 'Pergunta-teste', value: 'Núcleo de cada oração?' },
          { label: 'Nesta questão', value: 'E — existem mundos que possuem' },
        ],
        footer_rule: 'Dupla concordância: principal + relativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros por oração',
        items: [
          { label: 'A — têm mundos', detail: 'Inversão inadequada; «tem» na relativa.', correct: '«Existem mundos que possuem».' },
          { label: 'B — existe / possui', detail: 'Singular em ambas com «mundos» plural.', correct: 'Plural: existem / possuem.' },
          { label: 'C — possui', detail: 'Relativa singular com antecedente plural.', correct: '«que possuem discos voadores».' },
          { label: 'D — existe', detail: 'Principal singular com «mundos».', correct: '«Existem mundos…».' },
          { label: 'Em outra banca…', detail: 'Trocam por «há planetas que têm vida».', correct: 'Mesma regra: existem planetas que possuem.' },
        ],
        footer_rule: 'E: existir + possuir no plural.',
      },
    ],
  },

  'avancasp-esc-concordancia-lacunas-chegou-3963915': {
    family: 'conceito',
    source_tec_id: '3963915',
    source_note: 'Lacunas Chegou/apreciam/Havia/Choveram — AVANÇASP Esc Pref Nova Odessa 2026 tec 3963915',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Nova Odessa)',
      orgao: 'Pref. Nova Odessa',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa cujas palavras preenchem corretamente as lacunas a seguir, de acordo com a concordância correta do verbo.\n- _______ a relação de mantimentos para doação.\n- O diretor e seu sócio _______ uma boa feijoada.\n- _______ muitas despesas previstas em caixa.\n- _______ elogios para você naquela reunião',
    options: [
      { id: 'A', text: 'Chegaram – aprecia – Havia – Choveram', is_correct: false },
      { id: 'B', text: 'Chegou – aprecia – Haviam – Choveram', is_correct: false },
      { id: 'C', text: 'Chegou – apreciam – Haviam – Choveu', is_correct: false },
      { id: 'D', text: 'Chegou – apreciam – Havia – Choveram', is_correct: true },
      { id: 'E', text: 'Chegaram – aprecia – Haviam – Choveu', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quatro lacunas',
        chip_label: 'M13 — pacote',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo de cada lacuna?', icon: 'Focus' },
          { label: '1ª — relação', detail: '«A relação» (sing.) → «Chegou».', icon: 'Package' },
          { label: '2ª — diretor e sócio', detail: 'Sujeito composto → «apreciam» (pl.).', icon: 'Users' },
          { label: '3ª — haver', detail: '«Havia despesas» — impessoal singular.', icon: 'Wallet' },
          { label: '4ª — chover', detail: '«Choveram elogios» — impessoal com pl. (norma culta).', icon: 'CloudRain' },
        ],
        footer_rule: 'Uma regra por lacuna — não misture.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quatro lacunas com concordância correta.',
          '1ª «a relação…»: sujeito singular → «Chegou».',
          '2ª «diretor e sócio»: composto → «apreciam».',
          '3ª «despesas» com haver → «Havia» (impessoal, não «haviam»).',
          '4ª «elogios» com chover → «Choveram» (pl. aceito) ou «Choveu» — pacote D fecha.',
          'A/B/E erram em pelo menos uma lacuna — eliminar.',
          'C «Choveu» na 4ª não fecha o pacote da banca — eliminar.',
          'Gabarito D — Chegou / apreciam / Havia / Choveram.',
          'Em similares: relação (sing.) → chegou; diretor e sócio → apreciam; haver → havia; chover → choveram elogios.',
        ],
        footer_rule: 'D: quatro concordâncias alinhadas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PACOTE DE LACUNAS',
        rows: [
          { label: 'Relação', value: 'Chegou (sing.)' },
          { label: 'Diretor e sócio', value: 'apreciam (pl.)' },
          { label: 'Haver', value: 'Havia despesas (impessoal)' },
          { label: 'Chover', value: 'Choveram elogios' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Havia — nunca haviam (existencial).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erro típico por lacuna',
        items: [
          { label: 'A — Chegaram', detail: '«Relação» é singular.', correct: '«Chegou a relação…».' },
          { label: 'B — Haviam', detail: 'Haver existencial no plural.', correct: '«Havia muitas despesas».' },
          { label: 'C — Choveu', detail: 'Pacote incompleto para a 4ª lacuna da banca.', correct: 'D com «Choveram elogios».' },
          { label: 'E — mistura', detail: 'Chegaram + aprecia — inconsistência.', correct: 'Chegou + apreciam no pacote D.' },
          { label: 'Em outra banca…', detail: 'Trocam «mantimentos» por «doações».', correct: 'Mesmo teste: núcleo de cada lacuna.' },
        ],
        footer_rule: 'Só D fecha as quatro lacunas.',
      },
    ],
  },

  'vunesp-tenf-concordancia-adolescentes-lazer-3999762': {
    family: 'text_fragment',
    source_tec_id: '3999762',
    source_note: 'Adolescentes têm buscado — VUNESP TEnf Pref Sorocaba 2026 tec 3999762',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref. Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Leia o texto a seguir para responder a questão. Assinale a alternativa que atende à norma-padrão de concordância.',
    text_fragment:
      '<p><strong>Consumo abusivo de álcool é desafio nacional.</strong> A boa notícia fica com a nova geração, formada por pessoas nascidas a partir de 1997, que tem se dedicado a novos rumos para o lazer e para as celebrações. Pesquisa do Cisa aponta que a abstinência passou de 46% para 64% entre pessoas de 18 a 24 anos. (Editorial, 18.02.2026. Adaptado)</p>',
    options: [
      {
        id: 'A',
        text: 'No Brasil, cerca de 30% dos acidentes fatais que ocorre está relacionado com motoristas sob efeito de álcool.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'A aceitação cultural da ingestão de álcool dificulta o entendimento dos riscos existente dessa substância.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Há aspectos que pode fazer variar a metabolização do álcool, mas o impacto é certeiro em qualquer cenário.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'A boa notícia é que esses adolescentes da nova geração têm buscado novos rumos para o lazer e para as celebrações.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'O tempo passa, e surge, na vida adulta, os danos do perigoso hábito de ingerir bastantes doses de álcool.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Núcleo em foco',
        chip_label: 'M13 — concordância',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo? Verbo, adjetivo e relativa alinhados?', icon: 'Focus' },
          { label: 'Consumo abusivo', detail: 'Texto editorial sobre álcool e nova geração.', icon: 'Wine' },
          { label: 'Adolescentes', detail: '«Esses adolescentes da nova geração têm buscado» — sujeito pl.', icon: 'Users' },
          { label: 'Abstinência', detail: 'Pesquisa Cisa: 46% → 64% entre 18–24 anos.', icon: 'TrendingDown' },
          { label: 'Lazer e celebrações', detail: 'Trecho da boa notícia — concordância verbal correta.', icon: 'PartyPopper' },
          { label: 'Relativa', detail: '«acidentes que ocorrem» — antecedente plural.', icon: 'Link2' },
          { label: 'Nominal', detail: '«riscos existentes» — adj. plural com «riscos».', icon: 'Box' },
          { label: 'Pegadinha', detail: '«surge os danos» — verbo sing. + sujeito pl.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Núcleo manda em verbo e adjetivo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: consumo abusivo de álcool — boa notícia na nova geração.',
          'A «acidentes que ocorre»: relativa deveria ser «ocorrem» — eliminar.',
          'B «riscos existente»: adj. deveria ser «existentes» — eliminar.',
          'C «aspectos que pode»: núcleo plural → «podem» — eliminar.',
          'D «adolescentes… têm buscado»: sujeito pl. + verbo pl. — correto.',
          'E «surge os danos»: verbo singular com sujeito plural — eliminar.',
          'Gabarito D.',
          'Em similares: relativa e adjetivo seguem o núcleo.',
        ],
        footer_rule: 'D: adolescentes têm buscado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÚCLEO → FORMA',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo do sujeito / antecedente?' },
          { label: 'Relativa', value: '«acidentes que ocorrem» — plural.' },
          { label: 'Nominal', value: '«riscos existentes» — adj. no plural.' },
          { label: 'Verbal', value: '«adolescentes têm buscado» — plural.' },
          { label: 'Nesta questão', value: 'D' },
        ],
        footer_rule: 'Surge (sing.) ≠ os danos (pl.).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Desalinhamento em cada letra',
        items: [
          { label: 'A — ocorre', detail: 'Relativa com «acidentes» (pl.).', correct: '«acidentes que ocorrem».' },
          { label: 'B — existente', detail: 'Adj. singular com «riscos» plural.', correct: '«riscos existentes dessa substância».' },
          { label: 'C — pode', detail: '«Aspectos» plural exige «podem».', correct: '«aspectos que podem fazer variar».' },
          { label: 'E — surge os danos', detail: 'Verbo singular + sujeito plural.', correct: '«surgem os danos» ou «surge o dano».' },
          { label: 'Em outra banca…', detail: 'Trocam «adolescentes» por «jovens».', correct: 'Mesmo trilho: sujeito plural → verbo plural.' },
        ],
        footer_rule: 'Só D está correta.',
      },
    ],
  },

  'avancasp-gcm-concordancia-c-e-choveram-4001123': {
    family: 'conceito',
    source_tec_id: '4001123',
    source_note: 'C/E choveram/haviam — AVANÇASP GCM Pref Taiúva 2026 tec 4001123',
    meta: {
      banca: 'AVANÇASP',
      prova: 'GCM (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale C ou E conforme cada enunciado abaixo esteja respectivamente certo ou errado em relação à concordância do verbo destacado. A seguir, assinale a sequência obtida.\n( ) O relógio da catedral bateu dez horas.\n( ) Choveram confetes durante a festa.\n( ) Haviam muitos pontos importantes.\n( ) Homologou-se a lista de intenções.',
    options: [
      { id: 'A', text: 'E – E – E – C', is_correct: false },
      { id: 'B', text: 'C – E – C – C', is_correct: false },
      { id: 'C', text: 'C – C – C – E', is_correct: false },
      { id: 'D', text: 'C – C – E – C', is_correct: true },
      { id: 'E', text: 'E – E – C – E', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'C ou E — quatro itens',
        chip_label: 'M13 — especial',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada verbo concorda com seu núcleo ou regra impessoal?', icon: 'Focus' },
          { label: '1 — bateu', detail: '«Relógio» (sing.) → «bateu» — C.', icon: 'Clock' },
          { label: '2 — Choveram', detail: 'Chover impessoal → «Choveu confetes» — E.', icon: 'CloudRain' },
          { label: '3 — Haviam', detail: 'Haver existencial → «Havia pontos» — E.', icon: 'Ban' },
          { label: '4 — Homologou-se', detail: '«Lista» posposta → «Homologou-se» — C.', icon: 'Check' },
        ],
        footer_rule: 'Sequência: C – C – E – C.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: marcar C/E em cada item e montar a sequência.',
          '1 «relógio… bateu»: concordância correta — C.',
          '2 «Choveram confetes»: chover impessoal → «Choveu» — E.',
          '3 «Haviam pontos»: haver impessoal → «Havia» — E.',
          '4 «Homologou-se a lista»: sujeito posposto sing. — C.',
          'Sequência C – C – E – C.',
          'Gabarito D.',
          'Em similares: chover/haver impessoais não pluralizam na norma culta.',
        ],
        footer_rule: 'Itens 2 e 3 erram por plural indevido.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'C / E — REGRAS',
        rows: [
          { label: 'Relógio bateu', value: 'C — sujeito sing.' },
          { label: 'Chover', value: 'E — «Choveu confetes» (impessoal)' },
          { label: 'Haver', value: 'E — «Havia pontos» (impessoal)' },
          { label: 'Homologou-se', value: 'C — impessoal + sujeito posposto' },
          { label: 'Sequência', value: 'C – C – E – C (letra D)' },
        ],
        footer_rule: 'Não pluralize haver/chover impessoais.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Por que 2 e 3 são E',
        items: [
          { label: 'A — tudo E', detail: 'Marca item 1 e 4 como errados.', correct: 'Item 1 «bateu» está correto — C.' },
          { label: 'B — Haviam C', detail: 'Aceita haver no plural.', correct: '«Havia muitos pontos» — impessoal singular.' },
          { label: 'C — Choveram C', detail: 'Aceita chover no plural.', correct: '«Choveu confetes» — forma impessoal.' },
          { label: 'E — mistura', detail: 'Sequência não fecha C-C-E-C.', correct: 'D: C – C – E – C.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Choveram elogios» como aceito.', correct: 'Nesta prova: choveu/havia no singular.' },
        ],
        footer_rule: 'Gabarito D — sequência C – C – E – C.',
      },
    ],
  },

  'avancasp-acs-concordancia-existem-havia-4003524': {
    family: 'conceito',
    source_tec_id: '4003524',
    source_note: 'Existem/havia/existe/haverá — AVANÇASP ACS Pref Taiúva 2026 tec 4003524',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACS (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa cujas formas verbais preenchem corretamente as lacunas abaixo, na mesma ordem:\n- _______ muitas coisas para lhe contar.\n- Já _______ muitas pessoas no local da festa.\n- Naquele paraíso, _______ tudo de bom.\n- Ainda _______ muitos segredos entre nós.',
    options: [
      { id: 'A', text: 'Existe – haviam – existe – haverá', is_correct: false },
      { id: 'B', text: 'Existem – haviam – existem – haverá', is_correct: false },
      { id: 'C', text: 'Existe – haviam – existem – haverão', is_correct: false },
      { id: 'D', text: 'Existem – havia – existem – haverão', is_correct: false },
      { id: 'E', text: 'Existem – havia – existe – haverá', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Existir × haver',
        chip_label: 'M13 — dupla',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Cada lacuna: existir pessoal ou haver impessoal?', icon: 'Focus' },
          { label: '1ª — coisas', detail: '«Muitas coisas» → «Existem» (pessoal).', icon: 'Layers' },
          { label: '2ª — pessoas', detail: '«Já havia pessoas» — haver impessoal.', icon: 'Users' },
          { label: '3ª — tudo', detail: '«Tudo» (sing.) → «existe» de bom.', icon: 'Sparkles' },
          { label: '4ª — segredos', detail: '«Haverá segredos» — futuro impessoal sing.', icon: 'Lock' },
        ],
        footer_rule: 'Existir segue núcleo; haver impessoal no sing.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Quatro lacunas — testar existir vs haver em cada uma.',
          '1ª «muitas coisas»: plural → «Existem».',
          '2ª «pessoas» com já: «Já havia pessoas» — impessoal.',
          '3ª «tudo de bom»: «tudo» sing. → «existe».',
          '4ª «segredos»: futuro de haver → «haverá» (sing.).',
          'A/B/C/D erram haviam, haverão ou existem na 3ª — eliminar.',
          'Gabarito E — Existem / havia / existe / haverá.',
          'Em similares: tudo = sing.; coisas/pessoas = pl. com existir.',
        ],
        footer_rule: 'E fecha o pacote inteiro.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUATRO LACUNAS',
        rows: [
          { label: 'coisas', value: 'Existem (pl. pessoal)' },
          { label: 'pessoas', value: 'havia (impessoal)' },
          { label: 'tudo', value: 'existe (sing.)' },
          { label: 'segredos', value: 'haverá (fut. impessoal)' },
          { label: 'Nesta questão', value: 'E' },
        ],
        footer_rule: 'Haverá — não haverão (impessoal).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Erros por lacuna',
        items: [
          { label: 'A — Existe coisas', detail: 'Singular com «muitas coisas».', correct: '«Existem muitas coisas».' },
          { label: 'B — existem tudo', detail: '«Tudo» exige singular na 3ª.', correct: '«existe tudo de bom».' },
          { label: 'C — haverão', detail: 'Futuro impessoal no plural.', correct: '«haverá muitos segredos».' },
          { label: 'D — haverão', detail: 'Mesmo erro na 4ª lacuna.', correct: 'E com «haverá».' },
          { label: 'Em outra banca…', detail: 'Trocam «paraíso» por «refúgio».', correct: 'Mesma lógica: tudo existe / coisas existem.' },
        ],
        footer_rule: 'E: Existem – havia – existe – haverá.',
      },
    ],
  },

  'cpcon-uepb-concordancia-haviam-pedreiros-4018203': {
    family: 'conceito',
    source_tec_id: '4018203',
    source_note: 'Haviam plantado — senhores brutos — CPCON UEPB Ag Adm Pref Nova Floresta 2026 tec 4018203',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Nova Floresta)',
      orgao: 'Pref. Nova Floresta',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto II e responda à questão. Texto II O Jardim e o Quintal Por Roberto Menezes [trecho] Esses senhores brutos não haviam plantado nada: nenhuma árvore, nem pé de fruta, nem pé de flor. (Fonte: literaturabr.com. Acesso em 12 dez. 2025.) Observe o trecho: "Esses senhores brutos não haviam plantado nada: nenhuma árvore, nem pé de fruta, nem pé de flor." Considerando a norma-padrão da língua portuguesa, a frase apresentada está adequada quanto às regras de:',
    options: [
      {
        id: 'A',
        text: 'concordância nominal, pois o adjetivo "brutos" concorda com "árvore", "fruta" e "flor".',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'regência verbal, pois o verbo "plantar" exige complemento preposicionado, o que foi respeitado.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'colocação pronominal, pois o pronome "nada" está corretamente posposto ao verbo.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'concordância verbal, pois a forma verbal "haviam" concorda com o sujeito plural "senhores brutos".',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'regência nominal, pois o substantivo "senhores" exige o uso de preposição antes de "brutos".',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sujeito × verbo',
        chip_label: 'M13 — verbal',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual o núcleo do sujeito? Com o que «haviam» concorda?', icon: 'Focus' },
          { label: 'Senhores brutos', detail: 'Sujeito plural → «haviam plantado».', icon: 'Users' },
          { label: 'Brutos', detail: 'Adj. concorda com «senhores» — nominal ok, mas não é o foco.', icon: 'Box' },
          { label: 'Plantar', detail: 'VTD «plantar nada» — regência respeitada, mas não é gabarito.', icon: 'Sprout' },
          { label: 'Pegadinha A', detail: '«Brutos» não concorda com árvore/fruta/flor.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Haviam → senhores (pl.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho: «Esses senhores brutos não haviam plantado nada…»',
          'Núcleo do sujeito: «senhores» (pl.) — «brutos» é adjetivo.',
          'Verbo «haviam plantado» no plural — concordância verbal correta.',
          'A erra nominal: «brutos» qualifica «senhores», não árvore/fruta — eliminar.',
          'B/C/E: regência/colocação/regência nominal — não descrevem o acerto central — eliminar.',
          'D identifica concordância verbal «haviam» × «senhores brutos» — correto.',
          'Gabarito D.',
          'Em similares: ache o núcleo antes de julgar a análise.',
        ],
        footer_rule: 'D: concordância verbal correta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ANÁLISE DO TRECHO',
        rows: [
          { label: 'Pergunta-teste', value: 'Qual o núcleo? «Senhores» (pl.)' },
          { label: 'Verbal', value: '«haviam plantado» — plural com sujeito.' },
          { label: 'Nominal', value: '«brutos» concorda com «senhores» — não com árvore.' },
          { label: 'Nesta questão', value: 'D — concordância verbal' },
        ],
        footer_rule: 'Senhores brutos → haviam.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Análises incorretas',
        items: [
          { label: 'A — brutos × árvore', detail: 'Adjetivo não se liga aos objetos de «plantar».', correct: '«Brutos» modifica «senhores».' },
          { label: 'B — regência', detail: '«Plantar» é VTDI, mas a questão cobra concordância.', correct: 'Gabarito é concordância verbal (D).' },
          { label: 'C — nada posposto', detail: 'Colocação não é o aspecto destacado pela banca.', correct: 'Foco: haviam × senhores.' },
          { label: 'E — regência nominal', detail: '«Senhores brutos» não exige preposição.', correct: 'Adj. epiteto direto — sem prep.' },
          { label: 'Em outra banca…', detail: 'Trocam por «os pedreiros não tinham semeado».', correct: 'Mesmo teste: sujeito plural → verbo plural.' },
        ],
        footer_rule: 'Só D descreve o acerto da frase.',
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
