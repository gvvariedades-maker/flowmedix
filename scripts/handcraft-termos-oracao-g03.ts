#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — termos-oracao-g03 (8 slugs · Termos da oração · lote 3/4).
 *
 *   npx tsx scripts/handcraft-termos-oracao-g03.ts
 *   npm run audit:questao-readiness -- --lote=termos-oracao-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=termos-oracao-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'termos-oracao-g03';
const SUBTOPICO = 'Termos da oração';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_termos_oracao';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-termos-matrix-folhetos.json';

const TERMOS_SOURCE = {
  id: 'pt-termos-oracao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Termos da oração — objetos, complementos, agente da passiva, adjuntos',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'objeto direto e indireto',
    'complemento nominal',
    'agente da passiva',
    'adjunto adnominal',
    'transitividade verbal',
    'regência de explicar',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment' | 'certo_errado' | 'vf';

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
      reviewer: 'handcraft:termos-oracao-g03',
      guideline_snapshot: `M05/M06 Elias TE-simples — matriz de cargos · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      TERMOS_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', 'matriz pt-term-matrix'],
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
  'apice-monteiro-termos-aposto-faculdade-4024905': {
    family: 'text_fragment',
    source_tec_id: '4024905',
    source_note: 'Aposto explicativo Escola de Cirurgia — Ápice ACS Pref Monteiro 2026 tec 4024905',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Monteiro)',
      orgao: 'Pref. Monteiro',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No seguinte trecho: «As universidades chegaram tardiamente ao país. A primeira faculdade criada, a Escola de Cirurgia da Bahia, surgiu em 1808, e o acesso ao ensino superior permaneceu, por muito tempo, restrito às elites.», o termo destacado funciona sintaticamente como:',
    text_fragment:
      '<p>«As universidades e o desafio da desigualdade social» (Cesar Martins / Folha). «As universidades chegaram tardiamente ao país. A <strong>primeira faculdade criada, a Escola de Cirurgia da Bahia</strong>, surgiu em 1808, e o acesso ao ensino superior permaneceu restrito às elites.»</p>',
    options: [
      { id: 'A', text: 'adjunto adnominal.', is_correct: false },
      { id: 'B', text: 'adjunto adverbial.', is_correct: false },
      { id: 'C', text: 'vocativo.', is_correct: false },
      { id: 'D', text: 'aposto explicativo.', is_correct: true },
      { id: 'E', text: 'objeto direto pleonástico.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Aposto × adjunto',
        chip_label: 'Modifica nome',
        meta: slideMeta,
        items: [
          { label: 'Primeira faculdade', detail: 'Núcleo nominal — nome a ser esclarecido.', icon: 'Box' },
          { label: 'Escola de Cirurgia', detail: 'Explica qual faculdade — aposto explicativo.', icon: 'GitBranch' },
          { label: '≠ Adjunto adnominal', detail: 'Adjunto adnominal modifica nome; aposto identifica/explica o mesmo termo.', icon: 'XCircle' },
          { label: '≠ Vocativo', detail: 'Vocativo chama interlocutor — não há chamamento aqui.', icon: 'UserX' },
          { label: 'Pegadinha: adjunto', detail: '«Criada» parece adjunto; destaque é a Escola de Cirurgia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aposto explica o termo anterior — mesma referência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Faculdade → qual?',
        meta: slideMeta,
        steps: [
          'Texto desigualdade/universidades: isolar «a Escola de Cirurgia da Bahia».',
          'Termo anterior: «primeira faculdade criada» — mesmo referente.',
          'Função: aposto explicativo — esclarece qual faculdade.',
          'A: «criada» seria adjunto adnominal; destaque é outro nome.',
          'B: não modifica verbo — não é adjunto adverbial.',
          'C: não chama ninguém — não é vocativo.',
          'Gabarito D — aposto explicativo.',
          'Em similares: nome, aposto — mesma pessoa/coisa; aposto identifica.',
        ],
        footer_rule: 'Vírgulas isolam aposto explicativo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Matriz de bolso',
        meta: slideMeta,
        content: 'APOSTO × ADJUNTO',
        rows: [
          { label: 'Aposto', value: 'Explica/identifica o termo anterior — mesma referência.' },
          { label: 'Adjunto adnominal', value: 'Modifica nome — característica (de quê?).' },
          { label: 'Adjunto adverbial', value: 'Modifica verbo — circunstância (quando? como?).' },
          { label: 'Vocativo', value: 'Chama interlocutor — isolado por vírgula.' },
          { label: 'Nesta questão', value: 'Escola de Cirurgia → aposto (D)' },
        ],
        footer_rule: 'Primeira faculdade, a Escola… = aposto.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir aposto com adjunto',
        items: [
          { label: 'A — adjunto adnominal', detail: '«Criada» parece caracterizar faculdade.', correct: 'Destaque é Escola de Cirurgia — aposto, não adjunto.' },
          { label: 'B — adjunto adverbial', detail: '«Tardiamente» no parágrafo confunde.', correct: 'Destaque modifica nome, não verbo surgiu.' },
          { label: 'C — vocativo', detail: 'Vírgulas parecem chamamento.', correct: 'Não há interlocutor — é explicação do nome.' },
          { label: 'E — OD pleonástico', detail: 'Segundo termo parece repetir objeto.', correct: 'Não completa verbo; explica substantivo anterior.' },
          { label: 'Em outra banca…', detail: 'Trocam por «a Faculdade de Medicina».', correct: 'Mesmo padrão: nome, aposto explicativo.' },
        ],
        footer_rule: 'D: aposto explicativo.',
      },
    ],
  },

  'ibfc-ses-se-termos-vocativo-liduina-3450774': {
    family: 'text_fragment',
    source_tec_id: '3450774',
    source_note: 'Vocativo «Querida tia Liduína» — IBFC SES SE Tec Enf 2025 tec 3450774',
    meta: {
      banca: 'IBFC',
      prova: 'Tec Enf (SES SE)',
      orgao: 'SES SE',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Ainda que o texto não seja um exemplo de correspondência oficial, é possível identificar um elemento que, guardadas as diferenças de formalidade, é comum no padrão desses documentos. Trata-se:',
    text_fragment:
      '<p>«Bordado em branco» (Jarid Arraes). <strong>Querida tia Liduína,</strong> Hoje é um dia péssimo, como a senhora sabe. Setembro é, invariavelmente, um mês em que sinto meu corpo doer… A senhora é a única que compreende.</p>',
    options: [
      { id: 'A', text: 'do vocativo seguido por vírgula.', is_correct: true },
      { id: 'B', text: 'da primeira pessoa do discurso.', is_correct: false },
      { id: 'C', text: 'do fecho indicando a despedida.', is_correct: false },
      { id: 'D', text: 'da extensão regular dos parágrafos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Carta — vocativo',
        meta: slideMeta,
        items: [
          { label: 'Querida tia Liduína', detail: 'Chama a destinatária da carta — vocativo.', icon: 'User' },
          { label: 'Vírgula', detail: 'Isola o vocativo do restante da oração.', icon: 'Pause' },
          { label: 'Correspondência', detail: 'Padrão de carta: vocativo + vírgula no início.', icon: 'Mail' },
          { label: '≠ 1ª pessoa', detail: '«Eu» no texto não é elemento formal de abertura.', icon: 'XCircle' },
          { label: 'Pegadinha: discurso', detail: 'Carta inteira é em 1ª pessoa — mas o padrão pedido é vocativo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vocativo + vírgula = abertura de carta.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Arraes «Bordado em branco»: abertura «Querida tia Liduína,».',
          'Função: vocativo — chama a tia Liduína, destinatária.',
          'Vírgula isola o vocativo — padrão de correspondência.',
          'B: 1ª pessoa aparece no corpo, não é o elemento formal buscado.',
          'C: não há fecho/despedida no trecho citado.',
          'D: extensão de parágrafos não é marca sintática.',
          'Gabarito A — vocativo seguido por vírgula.',
          'Em similares: início de carta com nome + vírgula → vocativo.',
        ],
        footer_rule: 'Querida tia Liduína, = vocativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VOCATIVO',
        rows: [
          { label: 'Teste', value: 'Chama interlocutor — não integra sujeito/verbo.' },
          { label: 'Pontuação', value: 'Vírgula(s) isolam o vocativo.' },
          { label: 'Carta', value: 'Destinatário no início — padrão formal.' },
          { label: 'Nesta questão', value: 'A — vocativo seguido por vírgula' },
        ],
        footer_rule: 'Vocativo não modifica verbo nem nome.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Elementos da carta',
        items: [
          { label: 'B — 1ª pessoa', detail: '«Hoje é um dia péssimo» está em eu.', correct: 'Padrão formal buscado é vocativo de abertura, não pessoa gramatical.' },
          { label: 'C — fecho', detail: 'Carta longa parece ter despedida.', correct: 'Trecho não traz fecho — vocativo está no início.' },
          { label: 'D — parágrafos', detail: 'Texto tem vários parágrafos.', correct: 'Extensão não é função sintática de termo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Prezado senhor,».', correct: 'Mesmo padrão: vocativo + vírgula.' },
        ],
        footer_rule: 'A: vocativo seguido por vírgula.',
      },
    ],
  },

  'cpcon-nova-palmeira-termos-adjuntos-aipim-3599766': {
    family: 'text_fragment',
    source_tec_id: '3599766',
    source_note: 'Adjuntos adnominais variação aipim/mandioca — CPCON UEPB Nova Palmeira 2025 tec 3599766',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nova Palmeira)',
      orgao: 'Pref. Nova Palmeira',
      ano: '2025',
      cargo_header: 'ADMINISTRATIVO',
    },
    instruction:
      'Do ponto de vista sintático, de aipim, de mandioca e de macaxeira são exemplos de:',
    text_fragment:
      '<p>Variação linguística (Louise Oliveira / Norma Culta). Sinônimos regionais para a mesma planta: <strong>de aipim, de mandioca e de macaxeira</strong> — expressões que caracterizam o nome ao qual se ligam.</p>',
    options: [
      { id: 'A', text: 'predicativos do sujeito.', is_correct: false },
      { id: 'B', text: 'adjuntos adverbiais.', is_correct: false },
      { id: 'C', text: 'agentes da passiva.', is_correct: false },
      { id: 'D', text: 'adjuntos adnominais.', is_correct: true },
      { id: 'E', text: 'apostos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Variação — modifica nome',
        meta: slideMeta,
        items: [
          { label: 'De aipim…', detail: 'Prep. + nome — caracteriza substantivo próximo.', icon: 'Box' },
          { label: 'Adjunto adnominal', detail: 'Modifica nome — sinônimo regional (variação).', icon: 'Check' },
          { label: 'Mandioca / macaxeira', detail: 'Mesma referência, nomes diferentes — adjuntos paralelos.', icon: 'Layers' },
          { label: '≠ Adv. adverbial', detail: 'Não circunstancia verbo — qualifica nome.', icon: 'Ban' },
          { label: 'Pegadinha: aposto', detail: 'Sinônimos parecem explicar — mas ligam-se ao nome com de.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De + nome após substantivo → adjunto adnominal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto variação linguística: «de aipim, de mandioca e de macaxeira».',
          'Pergunta: modifica verbo ou nome? → modifica nome (adjunto adnominal).',
          'Função: caracterizar o substantivo — variedade lexical regional.',
          'A: não atribui estado ao sujeito — não é predicativo.',
          'B: não indica tempo/modo/lugar do verbo.',
          'C: não há voz passiva.',
          'E: aposto repete/explica sem prep. obrigatória — aqui é de + nome.',
          'Gabarito D — adjuntos adnominais.',
          'Em similares: de + nome ligado a substantivo → adjunto adnominal.',
        ],
        footer_rule: 'Modifica nome = adjunto adnominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADNOMINAL',
        rows: [
          { label: 'Teste', value: 'Modifica nome — de quê? qual tipo?' },
          { label: '× Adv. adverbial', value: 'Modifica verbo — quando? como? onde?' },
          { label: '× Aposto', value: 'Explica/identifica termo — geralmente entre vírgulas.' },
          { label: 'Nesta questão', value: 'D — adjuntos adnominais' },
        ],
        footer_rule: 'De aipim/mandioca/macaxeira → adjunto adnominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função dos «de + nome»',
        items: [
          { label: 'A — pred. sujeito', detail: '«Aipim» parece atributo do sujeito.', correct: 'Caracteriza substantivo, não sujeito via verbo de ligação.' },
          { label: 'B — adv. adverbial', detail: 'Três expressões parecem circunstância.', correct: 'Modificam nome, não verbo — adjunto adnominal.' },
          { label: 'C — agente passiva', detail: '«De» induz prep. = agente.', correct: 'Não há passiva; prep. liga ao nome.' },
          { label: 'E — aposto', detail: 'Sinônimos parecem explicar.', correct: 'Aposto identifica; aqui «de + nome» caracteriza — adjunto adnominal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «batata, mandioca e inhame».', correct: 'Mesma matriz: modifica nome.' },
        ],
        footer_rule: 'D: adjuntos adnominais.',
      },
    ],
  },

  'selecon-nova-mutum-termos-adjunto-sensivel-3649276': {
    family: 'text_fragment',
    source_tec_id: '3649276',
    source_note: 'Adjunto adnominal «sensível» — SELECON Nova Mutum 2025 tec 3649276',
    meta: {
      banca: 'SELECON',
      prova: 'Ag (Pref Nova Mutum)',
      orgao: 'Pref. Nova Mutum',
      ano: '2025',
      cargo_header: 'ADMINISTRATIVO',
    },
    instruction:
      '«A narrativa sensível conquistou público e crítica, acumulando prêmios em dezenas de festivais e premiações ao redor do mundo» (3º parágrafo). No trecho, o termo em destaque classifica-se sintaticamente como:',
    text_fragment:
      '<p>«Ainda Estou Aqui» (Walter Salles). «A <strong>narrativa sensível</strong> conquistou público e crítica, acumulando prêmios em dezenas de festivais e premiações ao redor do mundo.»</p>',
    options: [
      { id: 'A', text: 'adjunto adnominal', is_correct: true },
      { id: 'B', text: 'agente da passiva', is_correct: false },
      { id: 'C', text: 'predicativo do objeto', is_correct: false },
      { id: 'D', text: 'predicativo do sujeito', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sensível — qual nome?',
        meta: slideMeta,
        items: [
          { label: 'Narrativa', detail: 'Núcleo nominal — nome a ser caracterizado.', icon: 'Box' },
          { label: 'Sensível', detail: 'Qualifica narrativa — adjunto adnominal.', icon: 'Sparkles' },
          { label: 'Modifica nome', detail: 'Característica estável do substantivo narrativa.', icon: 'Check' },
          { label: '≠ Predicativo', detail: 'Não vem após verbo de ligação ao sujeito.', icon: 'XCircle' },
          { label: 'Pegadinha: pred. sujeito', detail: '«Conquistou» parece atribuir sensível ao filme.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto adnominal modifica nome antes do verbo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto «Ainda Estou Aqui»: isolar «sensível» em «narrativa sensível».',
          '«Sensível» liga-se a «narrativa» — modifica nome (adjunto adnominal).',
          'Verbo «conquistou» tem sujeito «narrativa sensível» — sensível não é predicativo.',
          'B: não há passiva nem agente com por.',
          'C/D: predicativo viria após verbo de ligação — aqui é adjetivo junto ao nome.',
          'Gabarito A — adjunto adnominal.',
          'Em similares: adj. antes do verbo + ligado ao nome → adjunto adnominal.',
        ],
        footer_rule: 'Narrativa sensível = nome + adjunto adnominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADNOMINAL',
        rows: [
          { label: 'Teste', value: 'Modifica nome — de quê? qual característica?' },
          { label: '× Pred. sujeito', value: 'Após verbo de ligação — atribui ao sujeito.' },
          { label: '× Agente passiva', value: 'Por quem? — só na passiva.' },
          { label: 'Nesta questão', value: 'A — adjunto adnominal' },
        ],
        footer_rule: 'Sensível caracteriza narrativa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sensível × predicativo',
        items: [
          { label: 'B — agente passiva', detail: '«Pelo público» no contexto confunde.', correct: 'Não há estrutura passiva no trecho destacado.' },
          { label: 'C — pred. objeto', detail: '«Crítica» parece objeto qualificado.', correct: 'Sensível modifica narrativa, não objeto crítica.' },
          { label: 'D — pred. sujeito', detail: 'Filme parece «ser sensível».', correct: 'Sensível está junto ao nome, não após verbo de ligação.' },
          { label: 'Em outra banca…', detail: 'Trocam por «história emocionante».', correct: 'Mesmo padrão: adjunto adnominal.' },
        ],
        footer_rule: 'A: adjunto adnominal.',
      },
    ],
  },

  'educa-pb-umbuzeiro-termos-adv-maio-3661932': {
    family: 'text_fragment',
    source_tec_id: '3661932',
    source_note: 'Adjunto adverbial «também em 21 de maio» — EDUCA PB Umbuzeiro 2025 tec 3661932',
    meta: {
      banca: 'EDUCA PB',
      prova: 'AgA (Pref Umbuzeiro)',
      orgao: 'Pref. Umbuzeiro',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Na Câmara Municipal de Campina Grande, o vereador Sargento Wellington Cobra (PSB) apresentou o PL 529/2025, também em 21 de maio.» O trecho destacado é:',
    text_fragment:
      '<p>Projeto de lei sobre bebês reborn na Paraíba. «Na Câmara Municipal de Campina Grande, o vereador Sargento Wellington Cobra (PSB) apresentou o PL 529/2025, <strong>também em 21 de maio</strong>.»</p>',
    options: [
      { id: 'A', text: 'Aposto.', is_correct: false },
      { id: 'B', text: 'Vocativo.', is_correct: false },
      { id: 'C', text: 'Adjunto adnominal.', is_correct: false },
      { id: 'D', text: 'Complemento nominal.', is_correct: false },
      { id: 'E', text: 'Adjunto adverbial.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quando? — circunstância',
        meta: slideMeta,
        items: [
          { label: 'Apresentou', detail: 'Verbo nuclear — ação do vereador.', icon: 'CornerDownRight' },
          { label: 'Em 21 de maio', detail: 'Indica tempo da apresentação — adjunto adverbial.', icon: 'Calendar' },
          { label: 'Também', detail: 'Reforça coincidência temporal com outros projetos.', icon: 'Plus' },
          { label: 'Modifica verbo', detail: 'Circunstância de tempo — não caracteriza nome.', icon: 'Check' },
          { label: 'Pegadinha: aposto', detail: 'Data parece explicar PL — mas circunstancia verbo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto adverbial modifica verbo — quando?',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto bebês reborn: destaque «também em 21 de maio».',
          'Pergunta: modifica verbo ou nome? → modifica verbo apresentou (quando?).',
          'Função: adjunto adverbial de tempo.',
          'A: não explica termo anterior — não é aposto.',
          'B: não chama interlocutor.',
          'C: não caracteriza PL ou vereador como adjunto adnominal.',
          'D: complemento nominal completa nome com prep. — aqui circunstancia verbo.',
          'Gabarito E — adjunto adverbial.',
          'Em similares: em + data após verbo → adjunto adverbial de tempo.',
        ],
        footer_rule: 'Também em 21 de maio = quando apresentou.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADVERBIAL',
        rows: [
          { label: 'Teste', value: 'Modifica verbo — quando? onde? como?' },
          { label: '× Adjunto adnominal', value: 'Modifica nome — característica.' },
          { label: '× Complemento nominal', value: 'Completa substantivo — de quê?' },
          { label: 'Nesta questão', value: 'E — adjunto adverbial' },
        ],
        footer_rule: 'Em 21 de maio → tempo da ação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Data após verbo',
        items: [
          { label: 'A — aposto', detail: '«21 de maio» parece explicar PL.', correct: 'Circunstancia o verbo apresentou — adjunto adverbial.' },
          { label: 'B — vocativo', detail: 'Nome do vereador confunde.', correct: 'Destaque é data, não chamamento.' },
          { label: 'C — adjunto adnominal', detail: '«Também» parece caracterizar PL.', correct: 'Modifica verbo (quando), não nome.' },
          { label: 'D — complemento nominal', detail: 'Prep. «em» induz CN.', correct: 'CN completa nome; aqui circunstancia verbo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «no dia 18 de maio».', correct: 'Mesmo cargo: adjunto adverbial de tempo.' },
        ],
        footer_rule: 'E: adjunto adverbial.',
      },
    ],
  },

  'cpcon-olivedos-termos-vocativos-vovo-3709443': {
    family: 'text_fragment',
    source_tec_id: '3709443',
    source_note: 'Dois vocativos «Vovô» e «Meu jovem» — CPCON Olivedos 2025 tec 3709443',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Olivedos)',
      orgao: 'Pref. Olivedos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe as falas dos dois primeiros balões e as palavras que foram destacadas: «Vovô, você está velho demais para frequentar uma faculdade.» e «Meu jovem, não existe idade para parar de aprender. Só envelhece quem para de aprender.» Respectivamente, qual função sintática desempenham os termos em destaque nos períodos em que estão?',
    text_fragment:
      '<p>Tirinha sobre idade e estudo (blogdoaftm). Balão 1: «<strong>Vovô</strong>, você está velho demais para frequentar uma faculdade.» Balão 2: «<strong>Meu jovem</strong>, não existe idade para parar de aprender.»</p>',
    options: [
      { id: 'A', text: 'Vocativo e sujeito.', is_correct: false },
      { id: 'B', text: 'Ambos são sujeitos.', is_correct: false },
      { id: 'C', text: 'Ambos são vocativos.', is_correct: true },
      { id: 'D', text: 'Ambos são apostos.', is_correct: false },
      { id: 'E', text: 'Aposto e sujeito.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dois chamamentos',
        meta: slideMeta,
        items: [
          { label: 'Vovô', detail: 'Neto chama o avô — vocativo no 1º balão (blogdoaftm).', icon: 'User' },
          { label: 'Meu jovem', detail: 'Avô responde ao neto — vocativo no 2º balão.', icon: 'User' },
          { label: 'Faculdade / aprender', detail: 'Frequentar faculdade e parar de aprender — núcleo verbal, não vocativo.', icon: 'BookOpen' },
          { label: '≠ Adjunto adnominal', detail: 'Não modifica nome — vocativo chama interlocutor.', icon: 'XCircle' },
          { label: 'Pegadinha: sujeito', detail: '«Vovô» parece quem «está velho demais».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Termos da oração: vocativo chama — sujeito é você.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tirinha blogdoaftm: balão 1 «Vovô, você está velho demais para frequentar uma faculdade.»',
          'Balão 2 «Meu jovem, não existe idade para parar de aprender.» — dois chamamentos.',
          'Função sintática: vocativo — não modifica verbo nem nome.',
          'A: Vovô não é sujeito — sujeito é você.',
          'B: nenhum dos dois é sujeito das orações.',
          'D/E: não são aposto nem adjunto adnominal.',
          'Gabarito C — ambos são vocativos.',
          'Em similares: nome + vírgula + você → vocativo, não sujeito.',
        ],
        footer_rule: 'Vovô e Meu jovem = vocativos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TERMOS DA ORAÇÃO',
        rows: [
          { label: 'Vocativo', value: 'Chama interlocutor — termo acessório.' },
          { label: '× Modifica nome', value: 'Adjunto adnominal caracteriza substantivo.' },
          { label: '× Modifica verbo', value: 'Adjunto adverbial = circunstância.' },
          { label: 'Nesta questão', value: 'C — ambos vocativos' },
        ],
        footer_rule: 'Chamamento = vocativo nos dois balões.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Vovô × sujeito',
        items: [
          { label: 'A — vocativo e sujeito', detail: '«Vovô» parece sujeito de «está velho».', correct: 'Sujeito é você; Vovô é vocativo.' },
          { label: 'B — ambos sujeitos', detail: 'Nomes parecem agentes das ações.', correct: 'Sujeito elíptico é você em ambos.' },
          { label: 'D — ambos apostos', detail: 'Termos parecem explicar algo.', correct: 'Chamam interlocutor — vocativo.' },
          { label: 'E — aposto e sujeito', detail: 'Mistura funções dos dois balões.', correct: 'Ambos são vocativos — C.' },
          { label: 'Em outra banca…', detail: 'Trocam por diálogo avó/neta.', correct: 'Mesmo teste: vírgula + chamamento = vocativo.' },
        ],
        footer_rule: 'C: ambos são vocativos.',
      },
    ],
  },

  'apice-bacamarte-termos-vf-virgula-adv-3793442': {
    family: 'vf',
    source_tec_id: '3793442',
    source_note: 'VF vírgula vicária + adjunto adverbial — Ápice R Bacamarte 2025 tec 3793442',
    meta: {
      banca: 'Ápice',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref. R Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto abaixo e responda da questão.\n\nSociedade do cansaço: estamos cansados demais para perceber? Mesmo no descanso, tentamos ser eficientes. E, assim, vamos nos desconectando do que é essencial: o tédio, o vazio, o silêncio (Genesson Honorato).\n\nAnalise as afirmativas:\n\nI - Em «A produtividade virou virtude. A exaustão, uma medalha invisível.», a vírgula foi utilizada para marcar a elipse do verbo, essa vírgula também é chamada de vírgula vicária.\n\nII - Em «A produtividade virou virtude. A exaustão, uma medalha invisível.», a vírgula foi utilizada para marcar a elipse do complemento verbal, essa vírgula também é chamada de vírgula vicária.\n\nIII - Em «À noite, o sono chega ansioso», a vírgula foi utilizada para separar um adjunto adverbial deslocado.\n\nIV - Em «À noite, o sono chega ansioso», a vírgula foi empregada para isolar um objeto direto pleonástico.\n\nV - Em «À noite, o sono chega ansioso», a vírgula foi empregada para isolar um vocativo.\n\nEstá correto o que se afirma em:',
    options: [
      { id: 'A', text: 'II e V.', is_correct: false },
      { id: 'B', text: 'I e IV.', is_correct: false },
      { id: 'C', text: 'I e III.', is_correct: true },
      { id: 'D', text: 'II e III.', is_correct: false },
      { id: 'E', text: 'I e V.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF — vírgula e termos',
        meta: slideMeta,
        items: [
          { label: 'I — vicária', detail: '«A exaustão, uma medalha» — elipse de «virou» (verbo).', icon: 'Check' },
          { label: 'II — falsa', detail: 'Elipse é do verbo, não do complemento verbal.', icon: 'XCircle' },
          { label: 'III — adv. deslocado', detail: '«À noite» no início — adjunto adverbial + vírgula.', icon: 'Check' },
          { label: 'IV/V — falsas', detail: 'À noite não é OD pleonástico nem vocativo.', icon: 'Ban' },
          { label: 'Sequência', detail: 'I e III corretas → gabarito C.', icon: 'ListOrdered' },
        ],
        footer_rule: 'VF: julgue cada afirmativa no contexto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto sociedade do cansaço: duas estruturas para testar.',
          'I: «A exaustão, uma medalha invisível» — elipse de «virou» → vírgula vicária → CERTO.',
          'II: elipse não é de complemento verbal — ERRADO.',
          'III: «À noite, o sono chega» — adjunto adverbial deslocado → vírgula separa → CERTO.',
          'IV: «À noite» não é objeto direto pleonástico — ERRADO.',
          'V: «À noite» não é vocativo — ERRADO.',
          'Gabarito C — I e III.',
          'Em similares: vicária = elipse de verbo; adv. deslocado = vírgula após circunstância.',
        ],
        footer_rule: 'C = I e III corretas.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF TERMOS + VÍRGULA',
        rows: [
          { label: 'I — vicária', value: 'Elipse do verbo «virou» — vírgula vicária' },
          { label: 'II', value: 'Falsa — não é elipse de complemento' },
          { label: 'III — adv. deslocado', value: '«À noite» = adjunto adverbial no início' },
          { label: 'IV / V', value: 'Falsas — não é OD pleonástico nem vocativo' },
          { label: 'Nesta questão', value: 'C — I e III' },
        ],
        footer_rule: 'Vírgula vicária + adjunto adverbial deslocado.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Sequências VF incorretas',
        items: [
          { label: 'A — II e V', detail: 'II erra a elipse; V trata «À noite» como vocativo.', correct: 'I e III são as corretas — não A.' },
          { label: 'B — I e IV', detail: 'I certa, mas IV erra «À noite» como OD pleonástico.', correct: 'III é a par certa de I, não IV.' },
          { label: 'D — II e III', detail: 'III certa, mas II erra o tipo de elipse.', correct: 'I (não II) combina com III.' },
          { label: 'E — I e V', detail: 'I certa, mas V erra vocativo.', correct: 'III (adjunto adverbial deslocado) é a par de I.' },
          { label: 'Em outra banca…', detail: 'Trocam «À noite» por «De manhã,».', correct: 'Mesmo teste: circunstância deslocada = adjunto adverbial.' },
        ],
        footer_rule: 'C passa: I e III.',
      },
    ],
  },

  'apice-bacamarte-termos-vocativo-junior-3793473': {
    family: 'conceito',
    source_tec_id: '3793473',
    source_note: 'Vocativo «Júnior» — Ápice R Bacamarte 2025 tec 3793473',
    meta: {
      banca: 'Ápice',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref. R Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em «Parabéns, Júnior, você nunca acordou nesse horário.», sobre o vocábulo «Júnior», no contexto em que se encontra, é correto o que se afirma em:',
    options: [
      { id: 'A', text: '«Júnior» é um termo acessório da oração e classifica-se como adjunto adverbial.', is_correct: false },
      { id: 'B', text: '«Júnior» é um termo acessório da oração e classifica-se como aposto.', is_correct: false },
      { id: 'C', text: '«Júnior» é o adjunto adnominal.', is_correct: false },
      { id: 'D', text: '«Júnior» é o vocativo.', is_correct: true },
      { id: 'E', text: '«Júnior» é o núcleo do sujeito da oração em análise.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parabéns, Júnior',
        meta: slideMeta,
        items: [
          { label: 'Júnior', detail: 'Nome do interlocutor — vocativo entre vírgulas.', icon: 'User' },
          { label: 'Parabéns', detail: 'Interjeição — saudação à criança.', icon: 'PartyPopper' },
          { label: 'Você', detail: 'Sujeito da oração — quem nunca acordou cedo.', icon: 'Target' },
          { label: '≠ Adjunto adnominal', detail: 'Não modifica nome — chama pessoa.', icon: 'XCircle' },
          { label: 'Pegadinha: sujeito', detail: '«Júnior» parece quem acordou.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vocativo isola interlocutor — sujeito é você.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge ENEM: «Parabéns, Júnior, você nunca acordou nesse horário.»',
          '«Júnior» entre vírgulas — chama o menino — vocativo.',
          'Sujeito da oração principal: você (nunca acordou).',
          'A: não modifica verbo — não é adjunto adverbial.',
          'B: não explica termo anterior — não é aposto.',
          'C: não caracteriza nome — não é adjunto adnominal.',
          'E: sujeito é você, não Júnior.',
          'Gabarito D — vocativo.',
          'Em similares: nome isolado por vírgulas + você como sujeito → vocativo.',
        ],
        footer_rule: 'Júnior = vocativo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VOCATIVO',
        rows: [
          { label: 'Teste', value: 'Chama interlocutor — termo acessório.' },
          { label: '× Modifica nome', value: 'Adjunto adnominal caracteriza substantivo.' },
          { label: '× Modifica verbo', value: 'Adjunto adverbial = circunstância.' },
          { label: 'Nesta questão', value: 'D — vocativo' },
        ],
        footer_rule: 'Parabéns, Júnior, = vocativo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função de Júnior',
        items: [
          { label: 'A — adv. adverbial', detail: '«Nesse horário» confunde com circunstância.', correct: 'Júnior chama pessoa — vocativo, não adjunto adverbial.' },
          { label: 'B — aposto', detail: 'Nome parece explicar «Parabéns».', correct: 'Aposto explica termo; aqui chama interlocutor.' },
          { label: 'C — adjunto adnominal', detail: '«Júnior» parece qualificar algo.', correct: 'Não modifica nome — é vocativo.' },
          { label: 'E — sujeito', detail: 'Júnior parece quem acordou.', correct: 'Sujeito é você; Júnior é vocativo.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Parabéns, Maria,».', correct: 'Mesmo padrão: vocativo entre vírgulas.' },
        ],
        footer_rule: 'D: vocativo.',
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
