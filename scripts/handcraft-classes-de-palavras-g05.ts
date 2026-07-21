#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g05 (8 slugs · Classes de palavras · lote 5 · Advérbio/Numeral/Preposição).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g05.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g05 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g05 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g05';
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
    'advérbio adjetivo e modo',
    'numeral ordinal e cardinal',
    'artigo × preposição',
    'locução prepositiva',
    'preposição e valor semântico',
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
      reviewer: 'handcraft:classes-de-palavras-g05',
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
  'apice-ag-adm-classes-leia-a-charge-abaixo-e-responda-a-qu-3793476': {
    family: 'conceito',
    source_tec_id: '3793476',
    source_note: '«muito/especial/calmamente» adv+adj+adv charge Enem — Ápice Ag Adm Pref R Bacamarte 2025 tec 3793476',
    meta: {
      banca: 'ÁPICE',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref R Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a charge abaixo e responda a questão.\n\nFonte: https://blogdoaftm.com.br/charge-enem/.\n\nEm «é que o Enem é uma data muito especial, quero acordar bem cedo para me atrasar calmamente para a prova!», considerando o contexto em que ocorre, os vocábulos «muito», «especial» e «calmamente», do ponto de vista morfológico, classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'advérbio, adjetivo, advérbio.', is_correct: true },
      { id: 'B', text: 'adjetivo, adjetivo, advérbio.', is_correct: false },
      { id: 'C', text: 'advérbio, adjetivo, interjeição.', is_correct: false },
      { id: 'D', text: 'adjetivo, adjetivo, adjetivo.', is_correct: false },
      { id: 'E', text: 'advérbio, advérbio, advérbio.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Muito · especial · calmamente',
        chip_label: 'M02 — adv × adj',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Modifica verbo/adj/adv ou qualifica substantivo?', icon: 'Focus' },
          { label: 'Muito', detail: 'Intensifica «especial» — advérbio de grau.', icon: 'Zap' },
          { label: 'Especial', detail: 'Qualifica «data» — adjetivo.', icon: 'Star' },
          { label: 'Calmamente', detail: 'Modo de «atrasar» — advérbio de modo (-mente).', icon: 'Clock' },
          { label: 'Pegadinha', detail: '«Muito» parece adjetivo; «especial» parece advérbio.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Muito (adv.) + especial (adj.) + calmamente (adv.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Trinca → gabarito',
        meta: slideMeta,
        steps: [
          'Charge Enem: classificar «muito», «especial», «calmamente» em ordem.',
          '«Data muito especial» — «muito» intensifica adjetivo → advérbio.',
          '«Especial» caracteriza «data» → adjetivo.',
          '«Atrasar calmamente» — modo da ação, terminação -mente → advérbio.',
          'B troca «muito» por adjetivo — eliminar.',
          'C coloca interjeição onde há advérbio de modo — eliminar.',
          'D transforma os três em adjetivos — eliminar.',
          'E faz «especial» advérbio — eliminar.',
          'Gabarito A — advérbio, adjetivo, advérbio.',
          'Fixação: -mente → advérbio de modo; «muito» antes de adjetivo → advérbio de grau.',
        ],
        footer_rule: 'A — adv., adj., adv.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MUITO × ESPECIAL × -MENTE',
        rows: [
          { label: 'Pergunta-teste', value: 'Modifica o quê? Qualifica nome?' },
          { label: 'Muito', value: 'Advérbio de intensidade — modifica adjetivo.' },
          { label: 'Especial', value: 'Adjetivo — qualifica «data».' },
          { label: 'Calmamente', value: 'Advérbio de modo — modifica verbo «atrasar».' },
          { label: 'Nesta questão', value: 'A — advérbio, adjetivo, advérbio' },
        ],
        footer_rule: 'Intensidade + qualificação + modo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar ordem das classes',
        items: [
          { label: 'B — muito adjetivo', detail: '«Muito» parece valor adjetivo isolado.', correct: 'Intensifica «especial» — função adverbial de grau.' },
          { label: 'C — interjeição', detail: 'Tom irônico da charge sugere exclamação.', correct: '«Calmamente» é advérbio derivado, não interjeição.' },
          { label: 'D — três adjetivos', detail: '«-mente» confunde com adjetivo.', correct: 'Só «especial» qualifica substantivo; os outros modificam.' },
          { label: 'E — especial advérbio', detail: '«Especial» pode parecer circunstância.', correct: 'Está ligado a «data» — adjetivo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «bem cedo» / «devagar».', correct: 'Mesmo teste: bem/calmamente = advérbio de modo.' },
        ],
        footer_rule: 'Só A — adv., adj., adv.',
      },
    ],
  },

  'cpcon-uepb-a-classes-leia-o-texto-3-para-responder-a-ques-3483808': {
    family: 'conceito',
    source_tec_id: '3483808',
    source_note: '«primeiro» numeral ordinal Tiago Germano — CPCON UEPB Ag Pref Nazarezinho 2025 tec 3483808',
    meta: {
      banca: 'CPCON',
      prova: 'Ag (Pref Nazarezinho)',
      orgao: 'Pref Nazarezinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto 3 para responder à questão abaixo.\n\nTEXTO 3\n\nO papa vai ao banheiro?\nPor Tiago Germano\n\nNo terceiro mês do catecismo, o padre nos deu a chance esperada: depois de doze semanas de aulas e de leituras bíblicas, tão pouco frequentadas quanto pouco entendidas, podíamos perguntar o que quiséssemos. Fui o primeiro a erguer o braço. O padre, encanecido, pediu que eu me levantasse. Com a coragem que hoje, nos eventos de que participo, procuro, mas não acho, arranquei do fundo da alma a dúvida atordoante: «Padre, o Papa vai ao banheiro?»\n\nFonte: GERMANO, Tiago. Demônios Domésticos. [S. L.]: Le Chien, 2017.\n\nNo trecho «Fui o primeiro a erguer o braço», a palavra «primeiro» é classificada como:',
    options: [
      { id: 'A', text: 'numeral ordinal.', is_correct: true },
      { id: 'B', text: 'pronome demonstrativo.', is_correct: false },
      { id: 'C', text: 'substantivo abstrato.', is_correct: false },
      { id: 'D', text: 'numeral cardinal.', is_correct: false },
      { id: 'E', text: 'advérbio de modo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O primeiro a erguer',
        chip_label: 'M02 — numeral',
        meta: slideMeta,
        items: [
          { label: 'Texto 3 Germano', detail: 'Memória de catecismo — dúvida sobre o Papa.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'Indica ordem, quantidade ou qualifica nome?', icon: 'Focus' },
          { label: 'Primeiro a erguer o braço', detail: 'Ordem entre os alunos — numeral ordinal.', icon: 'ListOrdered' },
          { label: 'Padre encanecido', detail: 'Contexto: primeiro a levantar a mão na aula.', icon: 'User' },
          { label: '× Cardinal', detail: 'Cardinal conta unidades (um, dois) — não ordem.', icon: 'Hash' },
          { label: 'Pegadinha', detail: 'Confundir com advérbio («primeiro, levantei-me»).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primeiro = ordem → numeral ordinal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Classe → gabarito',
        meta: slideMeta,
        steps: [
          'Texto 3 Germano / catecismo: «Fui o primeiro a erguer o braço».',
          'Padre pediu que o narrador se levantasse — «primeiro» marca ordem na turma.',
          '«Primeiro» indica posição na sequência — numeral ordinal.',
          'B pronome demonstrativo apontaria («este», «aquele») — eliminar.',
          'C substantivo abstrato nomearia conceito — eliminar.',
          'D cardinal contaria quantidade sem ordem — eliminar.',
          'E advérbio de modo indicaria maneira — eliminar.',
          'Gabarito A — numeral ordinal.',
          'Em similares: «segundo a falar», «terceiro da fila» — ordem = ordinal.',
        ],
        footer_rule: 'A — numeral ordinal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRIMEIRO = ORDEM',
        rows: [
          { label: 'Pergunta-teste', value: 'Indica posição na série?' },
          { label: 'Primeiro', value: 'Numeral ordinal — 1.º na sequência.' },
          { label: '× cardinal', value: 'Um, dois, três — quantidade, não ordem.' },
          { label: '× advérbio', value: 'Seria «primeiramente» ou posição deslocada.' },
          { label: 'Nesta questão', value: 'A — numeral ordinal' },
        ],
        footer_rule: 'Ordem na fila → ordinal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras classes não encaixam',
        items: [
          { label: 'B — demonstrativo', detail: '«Primeiro» parece apontar o aluno.', correct: 'Indica ordem de ação, não demonstração espacial.' },
          { label: 'C — substantivo', detail: '«O primeiro» funciona como núcleo.', correct: 'Classificação morfológica: palavra «primeiro» = ordinal.' },
          { label: 'D — cardinal', detail: '«Primeiro» deriva de «um».', correct: 'Cardinal não expressa sequência — ordinal sim.' },
          { label: 'E — advérbio', detail: 'Posição antes do verbo sugere modo.', correct: 'Aqui é adjunto ordinal ligado ao sujeito — não advérbio.' },
          { label: 'Em outra banca…', detail: 'Trocam por «foi o segundo a falar».', correct: 'Mesmo teste: segundo/terceiro = ordinais.' },
        ],
        footer_rule: 'Só A — ordinal.',
      },
    ],
  },

  'quadrix-aux-classes-texto-para-a-questao-imagine-um-time-3738680': {
    family: 'conceito',
    source_tec_id: '3738680',
    source_note: '«terceira» numeral ordinal doenças autoimunes — QUADRIX Aux FUABC 2025 tec 3738680',
    meta: {
      banca: 'QUADRIX',
      prova: 'Aux (FUABC)',
      orgao: 'FUABC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto para a questão.\n\nImagine um time de futebol atacado por um surto enlouquecedor, em que os jogadores saem marcando gol desvairadamente contra a própria equipe. É isso que o corpo faz quando acometido por doenças autoimunes. O sistema de defesa do organismo deixa de reconhecer o próprio corpo e passa a atacar células ou tecidos saudáveis do organismo.\n\nHipóteses à parte, sabe-se que, para desenvolver uma doença autoimune, são necessárias três condições, explica Scheinberg. A primeira é ter predisposição genética para a doença. A segunda é o problema ser desencadeado por um fator do ambiente externo. Já a terceira, mais óbvia, é haver desequilíbrio das células do sistema imunológico.\n\nInternet: <desenbahia.ba.gov.br> (com adaptações).\n\nA palavra do texto que pertence à classe dos numerais é',
    options: [
      { id: 'A', text: '«um», em «Imagine um time de futebol».', is_correct: false },
      { id: 'B', text: '«segundo», em «, segundo o imunologista Momtchilo Russo».', is_correct: false },
      { id: 'C', text: '«alguns», em «alguns estudos revelam».', is_correct: false },
      { id: 'D', text: '«uma», em «para desenvolver uma doença autoimune».', is_correct: false },
      { id: 'E', text: '«terceira», em «Já a terceira, mais óbvia, é haver desequilíbrio das células».', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Numeral no texto',
        chip_label: 'M02 — numeral',
        meta: slideMeta,
        items: [
          { label: 'Doenças autoimunes', detail: 'Texto compara corpo a time de futebol enlouquecido.', icon: 'Activity' },
          { label: 'Scheinberg — 3 condições', detail: 'Predisposição genética, ambiente, desequilíbrio imunológico.', icon: 'ListOrdered' },
          { label: 'Pergunta-teste', detail: 'Indica ordem/quantidade ou é artigo/pronome/preposição?', icon: 'Focus' },
          { label: 'Terceira condição', detail: '3.ª exigência — numeral ordinal (gabarito).', icon: 'CheckCircle' },
          { label: 'Um / uma / alguns', detail: 'Artigos e pronome — não numerais.', icon: 'Circle' },
          { label: 'Segundo (Russo)', detail: 'Preposição «conforme» — homônimo do ordinal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Terceira = ordinal; um/uma = artigo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Qual é numeral?',
        meta: slideMeta,
        steps: [
          'Texto doenças autoimunes / Scheinberg: três condições — primeira, segunda, terceira.',
          'Comando: palavra que pertence à classe dos numerais no texto.',
          'A «um time» — artigo indefinido — eliminar.',
          'B «segundo o imunologista Momtchilo Russo» — preposição — eliminar.',
          'C «alguns estudos revelam» — pronome indefinido — eliminar.',
          'D «uma doença autoimune» — artigo indefinido — eliminar.',
          'E «a terceira, mais óbvia» — ordem na lista — numeral ordinal.',
          'Gabarito E.',
          'Em similares: «a segunda condição», «a terceira hipótese» — enumeração = ordinal.',
        ],
        footer_rule: 'E — terceira (ordinal).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NUMERAL × ARTIGO × PREP.',
        rows: [
          { label: 'Texto autoimunes', value: 'Time de futebol × corpo — três condições de Scheinberg.' },
          { label: 'Pergunta-teste', value: 'Ordem ou quantidade explícita?' },
          { label: 'Terceira', value: 'Numeral ordinal — 3.ª condição.' },
          { label: 'Um / uma', value: 'Artigos indefinidos — determinam substantivo.' },
          { label: 'Segundo X', value: 'Preposição (= conforme X) — homônimo do ordinal.' },
          { label: 'Nesta questão', value: 'E — terceira' },
        ],
        footer_rule: 'Enumeração 1.ª 2.ª 3.ª → ordinal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Homônimos e artigos',
        items: [
          { label: 'A — um', detail: '«Um» parece numeral cardinal.', correct: 'Antecede «time» como artigo indefinido — não numeral na função.' },
          { label: 'B — segundo', detail: 'Palavra igual ao ordinal «segundo».', correct: 'Aqui = preposição «conforme o imunologista».' },
          { label: 'C — alguns', detail: 'Quantifica «estudos».', correct: 'Pronome indefinido — não numeral.' },
          { label: 'D — uma', detail: '«Uma» pode parecer cardinal.', correct: 'Artigo indefinido antes de «doença».' },
          { label: 'Em outra banca…', detail: 'Trocam por «a segunda hipótese».', correct: 'Mesmo padrão: segunda/terceira = ordinais.' },
        ],
        footer_rule: 'Só E — numeral.',
      },
    ],
  },

  'avancasp-aae-classes-assinale-a-alternativa-em-que-o-voca-3839714': {
    family: 'conceito',
    source_tec_id: '3839714',
    source_note: '«a» preposição × artigo regência — AVANÇASP AAE Pref Potim 2026 tec 3839714',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AAE (Pref Potim)',
      orgao: 'Pref Potim',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa em que o vocábulo «a» em destaque NÃO exerce a função de artigo.',
    options: [
      { id: 'A', text: 'A atleta conquistou uma medalha em cada competição que disputou.', is_correct: false },
      { id: 'B', text: 'A meta principal do projeto é reduzir o desperdício de água.', is_correct: false },
      { id: 'C', text: 'Se houver uma solução viável, poderemos evitar a interdição do restaurante.', is_correct: false },
      { id: 'D', text: 'O grupo venceu a etapa do torneio com facilidade.', is_correct: false },
      { id: 'E', text: 'O professor indicou uma leitura obrigatória a alunos e alunas.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'A = artigo ou prep.',
        chip_label: 'M02 — preposição',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Antecede substantivo (artigo) ou liga termos (prep.)?', icon: 'Focus' },
          { label: 'A atleta / a meta', detail: '«A» determina substantivo — artigo definido.', icon: 'Type' },
          { label: 'A interdição / a etapa', detail: 'Artigo antes de substantivo feminino.', icon: 'Check' },
          { label: 'Indicou a alunos', detail: '«A» liga verbo a complemento — preposição.', icon: 'Link' },
          { label: 'Pegadinha', detail: '«A» minúsculo após substantivo parece artigo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Artigo determina nome; preposição regência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'NÃO artigo → gabarito',
        meta: slideMeta,
        steps: [
          'Comando: «a» que NÃO é artigo (função de preposição).',
          'A «A atleta» — artigo definido — eliminar.',
          'B «A meta» — artigo definido — eliminar.',
          'C «a interdição» — artigo definido — eliminar.',
          'D «a etapa» — artigo definido — eliminar.',
          'E «indicou… a alunos» — preposição de regência (indicar algo a alguém).',
          'Gabarito E — único «a» preposicional.',
          'Em similares: entregar a, falar a, indicar a — preposição obrigatória.',
        ],
        footer_rule: 'E — preposição.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'A × A',
        rows: [
          { label: 'Pergunta-teste', value: 'Determina substantivo ou regência verbal?' },
          { label: 'Artigo', value: 'A/o/as/os + substantivo (a meta, a etapa).' },
          { label: 'Preposição', value: 'Verbo + a + complemento (indicar a alunos).' },
          { label: 'Regência', value: 'Indicar, entregar, falar, assistir exigem «a».' },
          { label: 'Nesta questão', value: 'E — preposição' },
        ],
        footer_rule: 'Indicar a = preposição.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada «a» artigo',
        items: [
          { label: 'A — atleta', detail: '«A» inicia a frase — parece preposição.', correct: 'Artigo definido feminino antes de «atleta».' },
          { label: 'B — meta', detail: 'Mesmo padrão inicial.', correct: 'Artigo definido — determina «meta».' },
          { label: 'C — interdição', detail: '«A» após verbo «evitar».', correct: 'Ainda artigo: «evitar a interdição».' },
          { label: 'D — etapa', detail: '«Venceu a etapa» — objeto direto.', correct: '«A» artigo definido antes de «etapa».' },
          { label: 'Em outra banca…', detail: 'Trocam por «entregou o relatório a Maria».', correct: '«A» preposicional de regência — mesmo teste.' },
        ],
        footer_rule: 'Só E — não é artigo.',
      },
    ],
  },

  'selecon-rece-classes-leia-o-texto-a-seguir-ceo-da-empresa-3852269': {
    family: 'conceito',
    source_tec_id: '3852269',
    source_note: '«segundos/segundo» substantivo+preposição foguete Alcântara — SELECON Recep CM Porto dos Gaúchos 2026 tec 3852269',
    meta: {
      banca: 'SELECON',
      prova: 'Recep (CM Porto dos Gaúchos)',
      orgao: 'CM Porto dos Gaúchos',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir:\n\nCEO da empresa sul-coreana responsável por foguete que explodiu em Alcântara pede desculpas.\n\nFalha ocorreu cerca de 30 segundos após a decolagem e não deixou feridos, segundo a FAB.\n\nKim Soo-jong, CEO da Innospace, lamentou nesta terça-feira, 23, uma anomalia que fez com que o foguete colidisse com o solo pouco após a decolagem na Base Espacial de Alcântara, no Maranhão.\n\nO HANBIT-Nano foi lançado às 22h13 (horário de Brasília) desta segunda-feira, 22, do Centro de Lançamento de Alcântara (CLA). A FAB informou que, pouco após a decolagem, o foguete sofreu uma anomalia e colidiu com o solo.\n\nFonte: Excerto. Acesso em 24/12/2023.\n\n«Falha ocorreu cerca de 30 segundos após a decolagem e não deixou feridos, segundo a FAB». Nesse trecho, as palavras em destaque classificam-se, respectivamente, como:',
    options: [
      { id: 'A', text: 'substantivo e preposição', is_correct: true },
      { id: 'B', text: 'substantivo e conjunção', is_correct: false },
      { id: 'C', text: 'verbo e preposição', is_correct: false },
      { id: 'D', text: 'verbo e conjunção', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Segundos × segundo',
        chip_label: 'M02 — homônimo',
        meta: slideMeta,
        items: [
          { label: 'Foguete Alcântara', detail: 'HANBIT-Nano — falha após decolagem na Base Espacial.', icon: 'Rocket' },
          { label: 'Pergunta-teste', detail: 'Nomeia unidade de tempo ou introduz fonte?', icon: 'Focus' },
          { label: '30 segundos', detail: 'Substantivo — intervalo após a decolagem.', icon: 'Clock' },
          { label: 'Segundo a FAB', detail: 'Preposição — «conforme» a Força Aérea Brasileira.', icon: 'Shield' },
          { label: '× Verbo', detail: 'Não há ação verbal em «segundos».', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Segundo» parece ordinal numeral.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Segundos (sub.) + segundo (prep.).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Par → gabarito',
        meta: slideMeta,
        steps: [
          'Manchete CEO Innospace / foguete em Alcântara: trecho «30 segundos… segundo a FAB».',
          '«Segundos» após decolagem — nomeia intervalo de tempo → substantivo.',
          '«Segundo a FAB» — indica fonte oficial → preposição.',
          'B conjunção — «segundo» não liga cláusulas aqui — eliminar.',
          'C «segundos» não é verbo — eliminar.',
          'D verbo e conjunção — eliminar.',
          'Gabarito A — substantivo e preposição.',
          'Em similares: «conforme a OMS», «segundo a matéria» — preposição de autoridade.',
        ],
        footer_rule: 'A — subst. + prep.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEGUNDOS ≠ SEGUNDO',
        rows: [
          { label: 'Pergunta-teste', value: 'Unidade de tempo ou «conforme»?' },
          { label: 'Segundos', value: 'Substantivo — medida de tempo.' },
          { label: 'Segundo a FAB', value: 'Preposição — segundo = conforme.' },
          { label: '× ordinal', value: '«Segundo lugar» seria ordinal — contexto diferente.' },
          { label: 'Nesta questão', value: 'A — substantivo e preposição' },
        ],
        footer_rule: 'Homônimos — teste a função.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par incorreto',
        items: [
          { label: 'B — conjunção', detail: '«Segundo» parece conectar ideias.', correct: 'Introduz fonte (FAB) — preposição, não conjunção.' },
          { label: 'C — verbo', detail: '«Segundos» lembra flexão verbal.', correct: 'Substantivo plural — unidade de tempo.' },
          { label: 'D — verbo+conj.', detail: 'Combinação extrema de distratores.', correct: 'Nenhuma palavra é verbo; «segundo» é preposição.' },
          { label: 'Em outra banca…', detail: 'Trocam por «conforme a OMS» ou «segundo a matéria».', correct: 'Mesmo valor preposicional de autoridade.' },
        ],
        footer_rule: 'Só A — subst. + prep.',
      },
    ],
  },

  'apice-ap-ei-classes-inteligencia-artificial-e-a-transfor-4037406': {
    family: 'conceito',
    source_tec_id: '4037406',
    source_note: '«além da» locução prepositiva IA Unifor — Ápice AP EI Pref SJ Cordeiros 2026 tec 4037406',
    meta: {
      banca: 'ÁPICE',
      prova: 'AP EI (Pref SJ Cordeiros)',
      orgao: 'Pref SJ Cordeiros',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Inteligência artificial e a transformação das profissões do futuro. Por Unifor — 15/07/2025.\n\nA inteligência artificial (IA) já deixou de ser um conceito do futuro e passou a fazer parte da realidade de diversas profissões. Para o professor Marcos Blaque, entender como a IA transforma a lógica das carreiras é um passo fundamental para quem está planejando o próprio futuro profissional.\n\nDe acordo com Blaque, o avanço da IA não significa o fim de todas as profissões, mas sim uma profunda transformação. Com as mudanças constantes, a flexibilidade se torna competência indispensável.\n\nFonte: Inteligência artificial e a transformação das profissões do futuro | G1. Acesso em 06 mar. 2026.\n\nConsiderando o trecho: «O profissional deve estar pronto para desenvolver habilidades além da sua área de atuação.» A expressão em destaque é classificada como:',
    options: [
      { id: 'A', text: 'substantivo.', is_correct: false },
      { id: 'B', text: 'adjetivo.', is_correct: false },
      { id: 'C', text: 'advérbio.', is_correct: false },
      { id: 'D', text: 'locução prepositiva.', is_correct: true },
      { id: 'E', text: 'locução conjuntiva.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Além da',
        chip_label: 'M02 — locução',
        meta: slideMeta,
        items: [
          { label: 'IA e profissões', detail: 'Texto Unifor / professor Marcos Blaque sobre mercado.', icon: 'Cpu' },
          { label: 'Habilidades além da área', detail: 'Trecho sobre flexibilidade profissional.', icon: 'Briefcase' },
          { label: 'Pergunta-teste', detail: 'Grupo com valor de preposição ou conjunção?', icon: 'Focus' },
          { label: 'Além da', detail: 'Locução prepositiva — ultrapassa «área de atuação».', icon: 'ArrowRight' },
          { label: '× Conjuntiva', detail: 'Não liga orações — não é «além de que».', icon: 'XCircle' },
          { label: 'Pegadinha', detail: '«Além» isolado parece advérbio.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Além de/da/do = locução prepositiva.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Expressão → gabarito',
        meta: slideMeta,
        steps: [
          'Texto inteligência artificial / Blaque: «habilidades além da sua área de atuação».',
          'Profissional deve desenvolver competências — expressão em destaque: «além da».',
          '«Além da sua área» — grupo introduz complemento (ultrapassar a área).',
          'A substantivo — eliminar. B adjetivo — eliminar. C advérbio simples — eliminar.',
          'E locução conjuntiva liga orações — não é o caso — eliminar.',
          'D locução prepositiva — valor de preposição composta.',
          'Gabarito D.',
          'Em similares: «além de», «apesar de», «junto com» — locuções prepositivas.',
        ],
        footer_rule: 'D — locução prepositiva.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ALÉM DE/DA',
        rows: [
          { label: 'Pergunta-teste', value: 'Preposição composta + complemento?' },
          { label: 'Além da', value: 'Locução prepositiva — ultrapassar limites.' },
          { label: 'Regência', value: 'Além de + substantivo (área de atuação).' },
          { label: '× conjuntiva', value: 'Não conecta orações adversativas.' },
          { label: 'Nesta questão', value: 'D — locução prepositiva' },
        ],
        footer_rule: 'Além da = prep. composta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classe isolada',
        items: [
          { label: 'A — substantivo', detail: '«Além» parece nome.', correct: 'Função preposicional do grupo «além da».' },
          { label: 'B — adjetivo', detail: 'Qualificaria «habilidades».', correct: 'Modifica relação espacial/limitativa — locução prep.' },
          { label: 'C — advérbio', detail: '«Além» isolado é advérbio de lugar.', correct: 'Com «da» forma locução prepositiva, não advérbio simples.' },
          { label: 'E — conjuntiva', detail: '«Além» sugere adição de ideias.', correct: 'Não liga orações — complementa «desenvolver habilidades».' },
          { label: 'Em outra banca…', detail: 'Trocam por «apesar de» ou «junto com».', correct: 'Mesma classe: locução prepositiva.' },
        ],
        footer_rule: 'Só D — loc. prep.',
      },
    ],
  },

  'avancasp-ace-classes-marque-a-alternativa-que-preenche-as-3353967': {
    family: 'conceito',
    source_tec_id: '3353967',
    source_note: 'Regência preposições estádio/contra/para — AVANÇASP ACEVA Pref Amparo 2025 tec 3353967',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACEVA (Pref Amparo (SP))',
      orgao: 'Pref Amparo (SP)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Marque a alternativa que preenche as lacunas a seguir conforme a regência verbal e nominal da língua portuguesa:\n\nNo fim de semana fomos ___ estádio assistir ___ um jogo de futebol do nosso time ___ o time da casa. Durante o intervalo fizeram uma homenagem ___ o maior jogador da história do clube.',
    options: [
      { id: 'A', text: 'com – contra – sobre – de', is_correct: false },
      { id: 'B', text: 'sobre – em – com – desde', is_correct: false },
      { id: 'C', text: 'a – entre – para – sobre', is_correct: false },
      { id: 'D', text: 'de – com – entre – após', is_correct: false },
      { id: 'E', text: 'ao – a – contra – para', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preposições no estádio',
        chip_label: 'M02 — regência',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual preposição a regência exige?', icon: 'Focus' },
          { label: 'Fomos ao estádio', detail: 'Ir a + o → «ao» — destino.', icon: 'MapPin' },
          { label: 'Assistir a', detail: 'Verbo «assistir» exige preposição «a».', icon: 'Eye' },
          { label: 'Contra o time', detail: 'Adversário — «contra» a equipe da casa.', icon: 'Swords' },
          { label: 'Homenagem para', detail: 'Destinatário da homenagem — «para» o jogador.', icon: 'Award' },
        ],
        footer_rule: 'ao + a + contra + para.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacunas → gabarito',
        meta: slideMeta,
        steps: [
          'Quatro lacunas: estádio / assistir / adversário / homenagem.',
          '1.ª «fomos ___ estádio» → ir a + o = «ao» — só E começa com «ao».',
          '2.ª «assistir ___ um jogo» → regência «assistir a» — E tem «a».',
          '3.ª «time ___ o time da casa» → jogo contra adversário — «contra».',
          '4.ª «homenagem ___ o maior jogador» → destinatário — «para».',
          'E completa: ao – a – contra – para.',
          'Gabarito E.',
          'Em similares: ir ao, assistir a, jogar contra, homenagem para/a.',
        ],
        footer_rule: 'E — regência correta.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REGÊNCIA FUTEBOL',
        rows: [
          { label: 'Lacuna 1', value: 'Fomos ao estádio (ir a + o).' },
          { label: 'Lacuna 2', value: 'Assistir a um jogo.' },
          { label: 'Lacuna 3', value: 'Time contra o time da casa.' },
          { label: 'Lacuna 4', value: 'Homenagem para o jogador.' },
          { label: 'Nesta questão', value: 'E — ao, a, contra, para' },
        ],
        footer_rule: 'Preposição = regência + sentido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Preposição errada',
        items: [
          { label: 'A — com/ sobre', detail: '«Com estádio» parece companhia.', correct: 'Destino exige «ao» (ir a).' },
          { label: 'B — sobre/em', detail: '«Sobre estádio» indica tema.', correct: 'Movimento ao local = «ao».' },
          { label: 'C — a/entre/para', detail: '«Entre times» sugere meio-termo.', correct: 'Adversário em jogo = «contra».' },
          { label: 'D — de/com/após', detail: '«De estádio» indica origem.', correct: '«Fomos» indica destino — «ao».' },
          { label: 'Em outra banca…', detail: 'Trocam por «fomos à praia assistir ao show».', correct: 'Mesma lógica de regência com «a».' },
        ],
        footer_rule: 'Só E fecha as quatro.',
      },
    ],
  },

  'fgv-ass-adm-classes-use-o-texto-a-seguir-para-responder-3382225': {
    family: 'conceito',
    source_tec_id: '3382225',
    source_note: '«para/consumo» finalidade conectivos água — FGV Ass Adm EBSERH 2025 tec 3382225',
    meta: {
      banca: 'FGV',
      prova: 'Ass Adm (EBSERH)',
      orgao: 'EBSERH',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Use o texto a seguir para responder à questão.\n\nTexto 2\n\nEconomizar água\n\nApesar de parecer muita, devido ao aumento excessivo da população mundial e à poluição que o homem produz, diariamente, a água potável do mundo está cada vez mais escassa. E a falta de água para consumo, principalmente em regiões mais pobres, populosas e áridas do mundo, já é uma realidade preocupante. Segundo a Organização das Nações Unidas (ONU), o Brasil é um país de sorte e vai contra essa tendência mundial.\n\nAcima estão sublinhados cinco conectivos do texto.\n\nAssinale aquele conectivo que tem seu valor semântico corretamente indicado.',
    options: [
      { id: 'A', text: 'para / finalidade.', is_correct: true },
      { id: 'B', text: 'em / tempo.', is_correct: false },
      { id: 'C', text: 'segundo / ordem.', is_correct: false },
      { id: 'D', text: 'e / oposição.', is_correct: false },
      { id: 'E', text: 'contra / comparação.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conectivos do texto',
        chip_label: 'M02 — prep./valor',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual valor semântico a preposição/conjunção expressa?', icon: 'Focus' },
          { label: 'Para consumo', detail: 'Finalidade — água destinada ao consumo.', icon: 'Target' },
          { label: 'Em regiões', detail: 'Lugar, não tempo — B erra «tempo».', icon: 'Map' },
          { label: 'Segundo a ONU', detail: 'Autoridade/fonte — não «ordem».', icon: 'BookOpen' },
          { label: 'E / contra', detail: '«E» adiciona; «contra» = oposição, não comparação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Para = finalidade (correto).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Par correto',
        meta: slideMeta,
        steps: [
          'Texto água potável: cinco conectivos sublinhados — achar par palavra/valor certo.',
          'A «para consumo» — indica finalidade (água para ser consumida) — CORRETO.',
          'B «em» no texto indica lugar («em regiões»), não tempo — eliminar.',
          'C «segundo a ONU» = conforme/fonte, não ordem numérica — eliminar.',
          'D «e» liga ideias (adição), não oposição — eliminar.',
          'E «contra essa tendência» = oposição, não comparação — eliminar.',
          'Gabarito A — para / finalidade.',
          'Em similares: para + infinitivo/substantivo = finalidade.',
        ],
        footer_rule: 'A — para / finalidade.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PAR PALAVRA × VALOR',
        rows: [
          { label: 'Para', value: 'Finalidade — água para consumo.' },
          { label: 'Em', value: 'Lugar (regiões) — não tempo aqui.' },
          { label: 'Segundo', value: 'Fonte/autoridade — não ordem.' },
          { label: 'E / contra', value: 'Adição / oposição — pares errados em D e E.' },
          { label: 'Nesta questão', value: 'A — para / finalidade' },
        ],
        footer_rule: 'Só A acerta palavra e valor.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valor semântico trocado',
        items: [
          { label: 'B — em/tempo', detail: '«Em» pode marcar tempo em outro contexto.', correct: 'No texto: «em regiões» = lugar, não tempo.' },
          { label: 'C — segundo/ordem', detail: '«Segundo» parece ordinal.', correct: '«Segundo a ONU» = conforme — preposição de autoridade.' },
          { label: 'D — e/oposição', detail: '«E» liga períodos do texto.', correct: 'Função aditiva — não oposição.' },
          { label: 'E — contra/comparação', detail: '«Contra» parece comparar tendências.', correct: 'Oposição à tendência mundial — não comparação.' },
          { label: 'Em outra banca…', detail: 'Trocam por «a fim de» / «visando».', correct: 'Mesmo valor de finalidade que «para».' },
        ],
        footer_rule: 'Só A — par correto.',
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
