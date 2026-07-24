#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — denotacao-conotacao-g02 (8 slugs · Denotação/conotação · lote 2).
 *
 *   npx tsx scripts/handcraft-denotacao-conotacao-g02.ts
 *   npm run audit:questao-readiness -- --lote=denotacao-conotacao-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=denotacao-conotacao-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'denotacao-conotacao-g02';
const SUBTOPICO = 'Denotação, conotação e figuras de linguagem';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_denotacao_conotacao';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-vunesp-portugues-denotacao-literal-figurado.json';

const DENOTACAO_SOURCE = {
  id: 'pt-denotacao-conotacao-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Denotação, conotação e figuras de linguagem',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'denotação',
    'conotação',
    'sentido literal',
    'sentido figurado',
    'metáfora',
    'metonímia',
    'eufemismo',
    'ironia',
    'pergunta-teste',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment';

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
  figure_policy?: 'transcribed' | 'required';
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
      reviewer: 'handcraft:denotacao-conotacao-g02',
      guideline_snapshot: `Elias TE-simples — pergunta «Literal ou figurado?» · lente dicionário × efeito (denotacaoConotacao.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      DENOTACAO_SOURCE,
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
  const qd: {
    instruction: string;
    options: Opt[];
    text_fragment?: string;
    figure_policy?: 'transcribed' | 'required';
  } = {
    instruction: spec.instruction,
    options: spec.options,
  };
  if (spec.text_fragment) qd.text_fragment = spec.text_fragment;
  if (spec.figure_policy) qd.figure_policy = spec.figure_policy;
  return {
    meta: metaBase(spec, slug),
    question_data: qd,
    reverse_study_slides: spec.slides,
  };
}

const SPECS: Record<string, Spec> = {
  'vunesp-tenf-denotacao-leia-o-texto-a-seguir-para-responder-3999753': {
    family: 'text_fragment',
    source_tec_id: '3999753',
    source_note: 'Editorial álcool/Nando Reis — expressão em sentido próprio — VUNESP TEnf Pref Sorocaba 2026 tec 3999753',
    meta: {
      banca: 'VUNESP',
      prova: 'TEnf (Pref Sorocaba)',
      orgao: 'Pref. Sorocaba',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em que a expressão destacada está empregada em sentido próprio.',
    text_fragment:
      '<p><strong>Consumo abusivo de álcool é desafio nacional</strong> (Editorial, 18.02.2026 — adaptado)</p>' +
      '<p>Quando se fala no combate ao consumo abusivo de álcool, o depoimento de quem convive com a doença é fundamental para conscientizar quem enfrenta a <strong>árdua batalha</strong>. ' +
      'O músico <strong>Nando Reis</strong> <strong>abriu o jogo</strong> e falou dos <strong>maus bocados</strong> vividos por conta da dependência — sobretudo da vodca.</p>' +
      '<p>A sociedade banaliza o consumo do álcool. O chamado <strong>binge drinking</strong> nos fins de semana pode ser tão prejudicial quanto a ingestão diária. ' +
      'A <strong>metabolização</strong> do álcool varia conforme aspectos físicos e genéticos, mas o <strong>impacto</strong> é certeiro em qualquer cenário.</p>' +
      '<p>O Brasil precisa combater o consumo como <strong>guerreou</strong> contra o tabagismo desde os anos 1980. O <strong>Denatran</strong> estima que 30% dos acidentes fatais envolvem motoristas sob efeito de álcool.</p>' +
      '<p>Pesquisa do Centro de Informações sobre Saúde e Álcool (Cisa) aponta que a <strong>abstinência</strong> passou de 46% para 64% entre pessoas de 18 a 24 anos.</p>',
    options: [
      {
        id: 'A',
        text: '...quem enfrenta a árdua batalha contra o consumo abusivo de álcool.',
        is_correct: false,
      },
      {
        id: 'B',
        text: '...o músico Nando Reis abriu o jogo e falou com detalhes sobre os maus bocados que passou por conta da dependência...',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Ainda que a metabolização do álcool varie de acordo com aspectos físicos e genéticos, o impacto é certeiro em qualquer cenário.',
        is_correct: false,
      },
      {
        id: 'D',
        text: '...é preciso que o Brasil comece a combater o consumo de álcool como guerreou contra o tabagismo a partir dos anos de 1980...',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Pesquisa do Centro de Informações sobre Saúde e Álcool (Cisa) aponta que a abstinência passou de 46% para 64% entre pessoas de 18 a 24 anos.',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lente literal × figurado',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Consumo abusivo', detail: 'Editorial sobre alcool — desafio nacional de saude publica.', icon: 'Wine' },
          { label: 'Pergunta-teste', detail: 'Qual destaque é literal — dicionário, sem transferência?', icon: 'Eye' },
          { label: 'Árdua batalha', detail: 'Metáfora da luta contra a dependência — figurado.', icon: 'Swords' },
          { label: 'Nando Reis', detail: 'Depoimento real do artista — «abrir o jogo» é figurado.', icon: 'Mic' },
          { label: 'Metabolização', detail: 'Processo biológico do álcool no organismo — termo técnico.', icon: 'Activity' },
          { label: 'Binge drinking', detail: 'Padrão de exagero nos fins de semana — conceito de saúde.', icon: 'Wine' },
          { label: 'Denatran', detail: 'Dados de acidentes com álcool — uso institucional literal.', icon: 'Car' },
          { label: 'Abstinência Cisa', detail: '46% → 64% entre 18–24 anos — dado estatístico objetivo.', icon: 'TrendingUp' },
          { label: 'Pegadinha', detail: 'Confundir metáfora de combate com dado de pesquisa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dado percentual da Cisa = sentido próprio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Destaque → lente → letras',
        meta: slideMeta,
        steps: [
          'Editorial: consumo abusivo de alcool — desafio nacional; Nando Reis, binge drinking, metabolização, Denatran, abstinência Cisa.',
          'Comando: expressão destacada em sentido próprio (literal).',
          'A «árdua batalha»: luta contra dependência — metáfora — figurado — eliminar.',
          'B «abriu o jogo / maus bocados»: expressões idiomáticas — figurado — eliminar.',
          'C «impacto certeiro»: precisão do dano — imagem transferida — figurado — eliminar.',
          'D «guerreou tabagismo»: comparação bélica da campanha — figurado — eliminar.',
          'E abstinência 46%–64%: percentual da pesquisa Cisa — dado objetivo — próprio.',
          'Gabarito E. Em similares: estatística e instituição costumam ancorar sentido literal.',
        ],
        footer_rule: 'Tap = trocar de lente antes de marcar.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'LITERAL × FIGURADO',
        rows: [
          { label: 'Consumo abusivo', value: 'Tema do editorial — desafio nacional.' },
          { label: 'Próprio', value: 'Dicionário ou dado objetivo — sem imagem transferida.' },
          { label: 'Figurado', value: 'Batalha, guerreou, abrir o jogo — metáfora/locução.' },
          { label: 'Cisa', value: 'Abstinência 46% → 64% (18–24 anos) — literal.' },
          { label: 'Metabolização', value: 'Processo físico do álcool — termo técnico literal.' },
          { label: 'Denatran', value: '30% acidentes com álcool — dado literal.' },
          { label: 'Nesta questão', value: 'E — percentual de abstinência (próprio).' },
        ],
        footer_rule: 'Número de pesquisa ≠ metáfora de combate.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Figurado nas outras letras',
        items: [
          { label: 'A — árdua batalha', detail: 'Luta contra dependência como guerra.', correct: 'Sentido figurado: «batalha» transfere combate — não guerra literal.' },
          { label: 'B — abriu o jogo', detail: 'Confissão franca sobre dependência.', correct: 'Sentido figurado: locução — não jogo esportivo.' },
          { label: 'C — impacto certeiro', detail: 'Dano inevitável do álcool.', correct: 'Sentido figurado: «certeiro» transfere precisão de tiro.' },
          { label: 'D — guerreou', detail: 'Campanha antitabagismo comparada a guerra.', correct: 'Sentido figurado: «guerreou» = combateu metaforicamente.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A pesquisa apontou 64% de abstinência entre jovens.»',
            correct: 'Sentido literal: percentual objetivo — não metáfora.',
          },
        ],
        footer_rule: 'E: dado Cisa em sentido próprio.',
      },
    ],
  },

  'avancasp-gcm-denotacao-assinale-a-alternativa-cuja-palavra-4001115': {
    family: 'conceito',
    source_tec_id: '4001115',
    source_note: '«remédio» contra males da sociedade — AVANÇASP GCM Pref Taiúva 2026 tec 4001115',
    meta: {
      banca: 'AVANÇASP',
      prova: 'GCM (Pref Taiúva)',
      orgao: 'Pref. Taiúva',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa cuja palavra destacada está sendo empregada em sentido figurado.',
    options: [
      { id: 'A', text: 'Preciso de um comprimido eficaz contra dores de cabeça.', is_correct: false },
      { id: 'B', text: 'O antídoto utilizado em picadas de cobras é feito a partir delas mesmas.', is_correct: false },
      { id: 'C', text: 'Consegui recuperar uma receita de família para fazer pães saborosíssimos.', is_correct: false },
      { id: 'D', text: 'O remédio contra os males da sociedade são a justiça e a fraternidade.', is_correct: true },
      { id: 'E', text: 'O principal ingrediente em produtos ultraprocessados não é nada natural.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Remédio literal ou imagem?',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Remédio» = medicamento ou solução simbólica?', icon: 'Eye' },
          { label: 'Próprio A/B', detail: 'Comprimido, antídoto — farmácia e saúde literal.', icon: 'Pill' },
          { label: 'Figurado D', detail: 'Justiça e fraternidade como «remédio» social.', icon: 'Scale' },
          { label: 'Receita C', detail: 'Modo de preparo culinário — sentido literal.', icon: 'ChefHat' },
          { label: 'Pegadinha', detail: 'Achar que toda ocorrência de «remédio» é farmácia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Remédio social = metáfora.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: palavra destacada em sentido figurado.',
          'A comprimido: medicamento físico — literal — eliminar.',
          'B antídoto: substância contra veneno — literal — eliminar.',
          'C receita: instrução de preparo — literal — eliminar.',
          'D «remédio contra males da sociedade»: justiça e fraternidade — metáfora — figurado.',
          'E ingrediente: componente alimentar — literal — eliminar.',
          'Gabarito D.',
          'Em similares: abstrato + «remédio» costuma ser figura.',
        ],
        footer_rule: 'Sociedade + remédio = transferência.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'REMÉDIO — LENTE',
        rows: [
          { label: 'Literal', value: 'Medicamento, antídoto, fórmula farmacêutica.' },
          { label: 'Figurado', value: 'Solução para problema social — metáfora.' },
          { label: 'Pergunta-teste', value: 'Fala de saúde ou de valores?' },
          { label: 'Nesta questão', value: 'D — remédio = justiça e fraternidade.' },
        ],
        footer_rule: 'Males da sociedade não se curam com comprimido.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Uso literal nas demais',
        items: [
          { label: 'A — comprimido', detail: 'Medicamento contra dor de cabeça.', correct: 'Sentido literal: remédio farmacêutico.' },
          { label: 'B — antídoto', detail: 'Substância contra veneno de cobra.', correct: 'Sentido literal: produto de saúde.' },
          { label: 'C — receita', detail: 'Instrução para fazer pães.', correct: 'Sentido literal: modo de preparo.' },
          { label: 'E — ingrediente', detail: 'Componente de ultraprocessado.', correct: 'Sentido literal: matéria do produto.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A educação é o remédio para a violência urbana.»',
            correct: 'Sentido figurado: «remédio» transfere solução — não medicamento.',
          },
        ],
        footer_rule: 'D: remédio social figurado.',
      },
    ],
  },

  'cpcon-uepb-a-denotacao-leia-o-texto-i-e-responda-a-questao-4018186': {
    family: 'text_fragment',
    source_tec_id: '4018186',
    source_note: 'Tirinha Instagram «carinho» conotativo — CPCON UEPB Ag Adm Pref Nova Floresta 2026 tec 4018186',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Nova Floresta)',
      orgao: 'Pref. Nova Floresta',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I e responda à questão.\n\nO Texto I utiliza expressões que adquirem sentidos diferentes conforme o contexto em que aparecem. Nesse caso, o termo «carinho» está empregado com valor:',
    text_fragment:
      '<p><strong>Texto I — Tirinha (Instagram — adaptado)</strong></p>' +
      '<p><strong>1º quadro:</strong> Um menino entrega flores a uma menina e diz que Lucas está «atrasado» por dar flores depois do Dia da Mulher.</p>' +
      '<p><strong>2º quadro:</strong> Outro menino responde: «Pra mostrar nosso <strong>carinho</strong> não tem dia! «Atrasado» é quem não sabe disso!» — defendendo que o afeto não se resume ao gesto material das flores.</p>' +
      '<p><strong>3º quadro:</strong> O diálogo reforça atitude simbólica de respeito e afeto, além da data comemorativa.</p>',
    figure_policy: 'transcribed',
    options: [
      {
        id: 'A',
        text: 'denotativo, porque designa objetivamente a entrega de flores como forma concreta de afeto.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'conotativo, pois não se refere apenas a um gesto físico ou material, mas a uma atitude simbólica.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'homonímico, visto que a palavra «carinho» apresenta significados distintos, mas grafia e pronúncia idênticas.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'antonímico, uma vez que o termo se opõe semanticamente à palavra «atrasado».',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'paronímico, já que «carinho» se assemelha a outro termo de escrita e som parecidos, mas com sentido diferente.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Carinho: flores ou atitude?',
        chip_label: 'Conotação',
        meta: slideMeta,
        items: [
          { label: 'Tirinha', detail: 'Flores no 1º quadro × defesa do carinho no 2º.', icon: 'Image' },
          { label: 'Carinho', detail: 'Afeto simbólico — não só objeto (flores).', icon: 'Heart' },
          { label: 'Conotação', detail: 'Carga afetiva e social do termo no contexto.', icon: 'Sparkles' },
          { label: 'Denotação A', detail: 'Gestão material das flores — leitura literal demais.', icon: 'Flower' },
          { label: 'Atrasado', detail: 'Jogo de sentidos no humor — outro eixo da tira.', icon: 'Clock' },
          { label: 'Pegadinha', detail: 'Confundir conotação com homonímia/paronímia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Carinho aqui = atitude, não só flores.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: tirinha — entrega de flores, «atrasado», «carinho não tem dia».',
          'Comando: valor de «carinho» — denotativo ou conotativo?',
          'Menino defende carinho como atitude contínua — além do gesto material.',
          'A denotativo: reduz a flores — ignora o sentido simbólico — eliminar.',
          'C homonímico: não há duas palavras homônimas — eliminar.',
          'D antonímico: «atrasado» não é antônimo de «carinho» — eliminar.',
          'E paronímico: não há par de palavras parecidas — eliminar.',
          'B conotativo: afeto simbólico — além do gesto físico.',
          'Gabarito B.',
          'Em similares: gesto material ≠ valor afetivo — teste se o termo carrega simbolismo.',
        ],
        footer_rule: 'Tap = separar gesto de significado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CARINHO — VALOR',
        rows: [
          { label: 'Denotação', value: 'Objeto/gesto literal — flores entregues.' },
          { label: 'Conotação', value: 'Atitude simbólica de afeto e respeito.' },
          { label: 'Tirinha', value: '«Não tem dia» — carinho contínuo.' },
          { label: 'Pegadinha', value: 'Rotular homonímia/paronímia sem base.' },
          { label: 'Nesta questão', value: 'B — conotativo.' },
        ],
        footer_rule: 'Contexto da fala define o valor.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Classificações erradas',
        items: [
          { label: 'A — denotativo', detail: 'Reduz carinho à entrega material de flores.', correct: 'Conotativo: afeto simbólico além do gesto físico.' },
          { label: 'C — homonímico', detail: 'Não há duas palavras idênticas com sentidos distintos.', correct: 'Não é homonímia — é conotação contextual.' },
          { label: 'D — antonímico', detail: '«Atrasado» não se opõe a «carinho».', correct: 'Não é relação de antonímia.' },
          { label: 'E — paronímico', detail: 'Não há par de palavras parecidas em jogo.', correct: 'Não é paronímia — é carga conotativa.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Seu carinho me aqueceu o coração.»',
            correct: 'Sentido figurado/conotativo: «aquecer» transfere conforto emocional.',
          },
        ],
        footer_rule: 'B: carinho conotativo na tirinha.',
      },
    ],
  },

  'vunesp-aux-s-denotacao-leia-o-texto-para-responder-a-questa-3323729': {
    family: 'text_fragment',
    source_tec_id: '3323729',
    source_note: 'Santa Casa/SUS — palavra em sentido próprio — VUNESP Aux Sau Buc Pref Osasco 2025 tec 3323729',
    meta: {
      banca: 'VUNESP',
      prova: 'Aux Sau Buc (Pref Osasco)',
      orgao: 'Pref. Osasco',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nAssinale a alternativa em que a palavra destacada foi empregada em sentido próprio.',
    text_fragment:
      '<p>A <strong>Santa Casa de Misericórdia de São Paulo</strong> anunciou a venda de sete imóveis para arrecadar R$ 200 milhões e quitar parte dos R$ 650 milhões em dívidas. ' +
      'Trata-se de um <strong>paliativo</strong> que não estancará o <strong>sangramento</strong> sofrido pela Santa Casa e por toda a rede de hospitais filantrópicos do País.</p>' +
      '<p>O <strong>Sistema Único de Saúde (SUS)</strong> é prestado em grande parte por entes privados sem fins lucrativos. ' +
      'Há décadas os valores de <strong>repasse</strong> da Tabela do SUS estão <strong>defasados</strong>. Hoje, os repasses não cobrem mais que 50% do custo dos procedimentos.</p>' +
      '<p>Muitos hospitais não resistiram à <strong>pressão</strong> financeira. Estima-se que, entre 2017 e 2021, 500 Santas Casas fecharam. ' +
      'O <strong>colapso</strong> do sistema pode ser súbito. A lei de 2024 prevê revisão da tabela, mas não basta para recompor anos de <strong>hemorragia financeira</strong>.</p>' +
      '<p>(O Estado de S.Paulo, «Luz no fim do túnel para as Santas Casas», 06.11.2024 — adaptado)</p>',
    options: [
      { id: 'A', text: 'Trata-se de um paliativo que não estancará o sangramento sofrido… (1º parágrafo)', is_correct: false },
      {
        id: 'B',
        text: 'Há décadas os valores de repasse da Tabela do SUS estão defasados. (3º parágrafo)',
        is_correct: true,
      },
      { id: 'C', text: 'Muitos não resistiram à pressão. (4º parágrafo)', is_correct: false },
      { id: 'D', text: '… a continuar assim o colapso pode ser súbito… (4º parágrafo)', is_correct: false },
      { id: 'E', text: '… para recompor as perdas de anos de hemorragia financeira... (5º parágrafo)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde: literal ou imagem?',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Santa Casa', detail: 'Misericordia anunciou venda de imoveis — milhoes em dividas.', icon: 'Building' },
          { label: 'SUS / repasse', detail: 'Tabela defasada — financiamento público.', icon: 'HeartPulse' },
          { label: 'Defasados', detail: 'Valores abaixo do custo real — sentido próprio.', icon: 'TrendingDown' },
          { label: 'Sangramento', detail: 'Perda financeira contínua — metáfora médica.', icon: 'Droplet' },
          { label: 'Hemorragia', detail: 'Prejuízo acumulado — figura de linguagem.', icon: 'AlertCircle' },
          { label: 'Colapso', detail: 'Queda do sistema — sentido figurado.', icon: 'TrendingDown' },
          { label: 'Pegadinha', detail: 'Achar que toda palavra de saúde é figurada.', icon: 'AlertTriangle' },
        ],
        footer_rule: '«Defasados» = desatualizados — literal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: Santa Casa de misericordia — anunciou venda de imoveis; SUS, repasses defasados, milhoes em dividas.',
          'Comando: palavra destacada em sentido próprio.',
          'A paliativo/sangramento: cura temporária e perda de dinheiro como sangue — figurado — eliminar.',
          'B defasados: valores da tabela abaixo do custo — desatualizados — próprio.',
          'C pressão: cobrança financeira intensa — figurado — eliminar.',
          'D colapso: queda do sistema de saúde — figurado — eliminar.',
          'E hemorragia financeira: perda massiva de recursos — figurado — eliminar.',
          'Gabarito B.',
          'Em similares: adjetivo técnico-econômico costuma ser literal.',
        ],
        footer_rule: 'Defasados = desatualizados (literal).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANTA CASA — LENTE',
        rows: [
          { label: 'Próprio', value: 'Defasados = valores desatualizados da tabela.' },
          { label: 'Figurado', value: 'Sangramento, hemorragia, colapso — imagem médica.' },
          { label: 'SUS', value: 'Repasse insuficiente — eixo do texto.' },
          { label: 'Santa Casa', value: 'Misericordia — imoveis vendidos, milhoes em dividas.' },
          { label: 'Nesta questão', value: 'B — «defasados» em sentido próprio.' },
        ],
        footer_rule: 'Metáfora médica ≠ adjetivo econômico literal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Figuras nas outras letras',
        items: [
          { label: 'A — sangramento', detail: 'Perda financeira comparada a sangue.', correct: 'Sentido figurado: metáfora da crise hospitalar.' },
          { label: 'C — pressão', detail: 'Cobrança financeira insustentável.', correct: 'Sentido figurado: «pressão» transfere força física.' },
          { label: 'D — colapso', detail: 'Queda abrupta do sistema.', correct: 'Sentido figurado: estrutura que «desmorona».' },
          { label: 'E — hemorragia', detail: 'Perda massiva de recursos ao longo dos anos.', correct: 'Sentido figurado: hemorragia financeira.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Os repasses do SUS estão defasados há uma década.»',
            correct: 'Sentido literal: «defasados» = desatualizados, abaixo do custo.',
          },
        ],
        footer_rule: 'B: defasados — uso próprio.',
      },
    ],
  },

  'vunesp-age-p-denotacao-leia-o-texto-para-responder-a-questa-3336079': {
    family: 'text_fragment',
    source_tec_id: '3336079',
    source_note: '«radiografa» efeitos nefastos — VUNESP Age Pres Prudente 2025 tec 3336079',
    meta: {
      banca: 'VUNESP',
      prova: 'Age (Pres Prudente)',
      orgao: 'Pref. Presidente Prudente',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nO verbo destacado está empregado em sentido figurado na passagem:',
    text_fragment:
      '<p><strong>A tragédia das crianças sem saneamento</strong> (adaptado)</p>' +
      '<p>A falta de saneamento básico afasta milhões de crianças de zero a seis anos de suas atividades, segundo estudo do <strong>Instituto Trata Brasil</strong>.</p>' +
      '<p>Sem esgoto tratado e creches, crianças crescem com herança nefasta: renda 46,1% menor na vida adulta. ' +
      'O estudo do Trata Brasil <strong>radiografa</strong> uma série de <strong>efeitos nefastos</strong> que se acumulam na vida de quem não conta com saneamento na primeira infância.</p>' +
      '<p>Sem água tratada ou banheiro, crianças têm dificuldade para ler o relógio ou calcular troco — habilidades básicas travadas pelo déficit estrutural.</p>',
    options: [
      {
        id: 'A',
        text: '...aprendem pouco ou quase nada, como demonstram indicadores nacionais e internacionais de educação... (5º parágrafo)',
        is_correct: false,
      },
      {
        id: 'B',
        text: '...jovens de 19 anos sem acesso a saneamento tenham, em média, atraso de 1,8 ano na escolaridade... (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'O estudo do Trata Brasil radiografa uma série de efeitos nefastos... (3º parágrafo)',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'Garantir acesso à água e ao esgoto tratados, bem como à educação, é o melhor investimento... (4º parágrafo)',
        is_correct: false,
      },
      {
        id: 'E',
        text: '...expostos a enfermidades que deveriam pertencer ao passado... (4º parágrafo)',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Radiografar = examinar?',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Trata Brasil', detail: 'Saneamento básico e primeira infância.', icon: 'Droplets' },
          { label: 'Radiografa', detail: 'Revela com clareza — metáfora do exame de imagem.', icon: 'Scan' },
          { label: 'Efeitos nefastos', detail: 'Consequências negativas acumuladas.', icon: 'AlertTriangle' },
          { label: 'Saneamento', detail: 'Água, esgoto, creche — déficit estrutural.', icon: 'Home' },
          { label: 'Pergunta-teste', detail: 'Verbo de exame médico ou de análise figurada?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Marcar passagem só descritiva sem verbo figurado.', icon: 'Ban' },
        ],
        footer_rule: 'Radiografar = metáfora de revelar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: Trata Brasil, saneamento, crianças, renda, efeitos nefastos.',
          'Comando: verbo destacado em sentido figurado.',
          'A indicadores educacionais: descrição factual — sem verbo figurado central — eliminar.',
          'B atraso escolar: dado estatístico — literal — eliminar.',
          'C «radiografa»: estudo «tira raio-X» dos efeitos — metáfora — figurado.',
          'D investimento em água/educação: argumento — literal — eliminar.',
          'E enfermidades do passado: expressão figurada, mas não é o verbo pedido — eliminar.',
          'Gabarito C.',
          'Em similares: verbo de medicina + objeto abstrato = figura.',
        ],
        footer_rule: 'Radiografar efeitos = figurado.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RADIOGRAFAR',
        rows: [
          { label: 'Literal', value: 'Exame de imagem com raios-X.' },
          { label: 'Figurado', value: 'Revelar/analisar com nitidez — metáfora.' },
          { label: 'Trata Brasil', value: 'Estudo sobre saneamento e infância.' },
          { label: 'Pergunta-teste', value: 'Exame físico ou análise simbólica?' },
          { label: 'Nesta questão', value: 'C — «radiografa» efeitos nefastos.' },
        ],
        footer_rule: 'Estudo não usa aparelho de raio-X.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras passagens',
        items: [
          { label: 'A — aprendem pouco', detail: 'Descrição de indicadores educacionais.', correct: 'Sem verbo figurado destacado — uso descritivo literal.' },
          { label: 'B — atraso 1,8 ano', detail: 'Dado numérico de escolaridade.', correct: 'Sentido literal: estatística objetiva.' },
          { label: 'D — melhor investimento', detail: 'Argumento sobre política pública.', correct: 'Sentido literal: «investimento» econômico comum.' },
          { label: 'E — pertencer ao passado', detail: 'Doenças antigas — expressão temporal.', correct: 'Figura possível, mas não é o verbo «radiografa» pedido.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O relatório radiografou os problemas da escola.»',
            correct: 'Sentido figurado: «radiografar» transfere exame — não raio-X literal.',
          },
        ],
        footer_rule: 'C: radiografa — metáfora.',
      },
    ],
  },

  'vunesp-ag-as-denotacao-leia-a-tira-a-seguir-para-responder-3345640': {
    family: 'text_fragment',
    source_tec_id: '3345640',
    source_note: 'Tira Willian Leite Anésia #762 «ferramenta» — VUNESP Ag AS Pref Campinas 2025 tec 3345640',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag AS (Pref Campinas)',
      orgao: 'Pref. Campinas',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia a tira a seguir para responder à questão abaixo.\n\n(Willian Leite. Anésia #762. Disponível em: instagram.com)\n\nNa tira, foi empregada em sentido figurado a palavra:',
    text_fragment:
      '<p><strong>Anésia #762 — Willian Leite (adaptado)</strong></p>' +
      '<p><strong>1º quadro:</strong> Personagem lista «vantagens» de estar na internet.</p>' +
      '<p><strong>2º quadro:</strong> Diz que a <strong>internet</strong> é uma <strong>ferramenta</strong> poderosa para conectar pessoas e compartilhar ideias.</p>' +
      '<p><strong>3º quadro:</strong> Menciona o contato com «pessoas» de todo o mundo.</p>' +
      '<p><strong>4º quadro:</strong> Cita a própria «internet» como meio de comunicação.</p>' +
      '<p><strong>5º quadro:</strong> Ironiza as «desvantagens» do uso excessivo.</p>' +
      '<p>No 2º quadro, «ferramenta» designa a internet como recurso social — não objeto de oficina.</p>',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: '«vantagens» (1º quadro)', is_correct: false },
      { id: 'B', text: '«pessoas» (3º quadro)', is_correct: false },
      { id: 'C', text: '«internet» (4º quadro)', is_correct: false },
      { id: 'D', text: '«desvantagens» (5º quadro)', is_correct: false },
      { id: 'E', text: '«ferramenta» (2º quadro)', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ferramenta digital',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Anésia #762', detail: 'Tira de Willian Leite — humor sobre internet.', icon: 'Image' },
          { label: 'Ferramenta', detail: 'Internet como recurso de conexão — figurado.', icon: 'Wrench' },
          { label: 'Internet', detail: 'Meio tecnológico — pode ser literal no quadro.', icon: 'Wifi' },
          { label: 'Vantagens', detail: 'Lista irônica — uso lexical comum.', icon: 'List' },
          { label: 'Pergunta-teste', detail: 'Oficina/martelo ou recurso social?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Marcar «internet» literal em vez de «ferramenta».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ferramenta = metáfora da internet.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Tira Anésia #762: quadros sobre vantagens, internet, pessoas, desvantagens.',
          'Comando: palavra em sentido figurado.',
          'A «vantagens»: termo comum de lista — literal — eliminar.',
          'B «pessoas»: seres humanos reais — literal — eliminar.',
          'C «internet» (4º quadro): nome da rede — uso denotativo — eliminar.',
          'D «desvantagens»: oposto de vantagens — literal — eliminar.',
          'E «ferramenta» (2º quadro): internet como instrumento social — metáfora.',
          'Gabarito E.',
          'Em similares: recurso abstrato + «ferramenta» = figura.',
        ],
        footer_rule: '2º quadro: ferramenta figurada.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FERRAMENTA — LENTE',
        rows: [
          { label: 'Literal', value: 'Instrumento físico de trabalho.' },
          { label: 'Figurado', value: 'Recurso/meio para atingir fim — internet.' },
          { label: 'Quadro 2', value: '«Ferramenta» = conexão e ideias.' },
          { label: 'Pergunta-teste', value: 'Martelo ou meio digital?' },
          { label: 'Nesta questão', value: 'E — «ferramenta» (2º quadro).' },
        ],
        footer_rule: 'Internet não é chave de fenda.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Uso literal nas outras',
        items: [
          { label: 'A — vantagens', detail: 'Lista de benefícios na tira.', correct: 'Sentido literal: palavra comum sem transferência.' },
          { label: 'B — pessoas', detail: 'Seres humanos contactados online.', correct: 'Sentido literal: referência direta a pessoas.' },
          { label: 'C — internet', detail: 'Nome da rede no 4º quadro.', correct: 'Sentido literal: tecnologia nomeada.' },
          { label: 'D — desvantagens', detail: 'Aspectos negativos listados.', correct: 'Sentido literal: termo oposto a vantagens.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A educação é ferramenta de transformação social.»',
            correct: 'Sentido figurado: «ferramenta» transfere instrumento — não objeto físico.',
          },
        ],
        footer_rule: 'E: ferramenta figurada.',
      },
    ],
  },

  'vunesp-an-op-denotacao-leia-o-texto-para-responder-a-questa-3354412': {
    family: 'text_fragment',
    source_tec_id: '3354412',
    source_note: 'Fernando Reinach «vai por água abaixo» — VUNESP An OP Sertãozinho 2025 tec 3354412',
    meta: {
      banca: 'VUNESP',
      prova: 'An OP (Sertãozinho)',
      orgao: 'Pref. Sertãozinho',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto para responder à questão.\n\nHá expressão empregada em sentido figurado em:',
    text_fragment:
      '<p><strong>Marte e a gravidade zero</strong> (Fernando Reinach — Estadão, 28.10.2024 — adaptado)</p>' +
      '<p>A humanidade se divide: bilhões acreditam que o futuro está na Terra; um grupo minúsculo aposta em <strong>colônias em Marte</strong>.</p>' +
      '<p>Construir o foguete e pousar em Marte é factível. Mas será que o ser humano aguenta a viagem de meses? ' +
      'Se não aguentar, o plano <strong>vai por água abaixo</strong>, pois não existe no <strong>horizonte</strong> engenharia capaz de criar um ser humano adaptado à vida no foguete ou em Marte.</p>' +
      '<p>Estudo com mini-corações humanos: na <strong>ausência de gravidade</strong>, o coração deteriora em menos de um mês — risco para viagens longas.</p>',
    options: [
      {
        id: 'A',
        text: 'talvez Marte, onde deveríamos estabelecer colônias. Construir o foguete e pousar em Marte é factível com a tecnologia atual.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Mas será que o ser humano aguenta a viagem de meses?',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Se não aguentar, o plano vai por água abaixo, pois não existe no horizonte engenharia capaz de criar um ser humano adaptado à vida no foguete ou em Marte.',
        is_correct: true,
      },
      {
        id: 'D',
        text: 'São feitos de tecido cardíaco vivo, ligados a dois pontos de fixação dentro de um aparelho que tem um reservatório de alimentos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'A conclusão é que o coração humano deteriora e envelhece rapidamente na ausência de gravidade.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Plano que afunda',
        chip_label: 'Locução',
        meta: slideMeta,
        items: [
          { label: 'Reinach', detail: 'Marte, foguete, gravidade, mini-corações.', icon: 'Rocket' },
          { label: 'Vai por água abaixo', detail: 'Plano fracassa — locução figurada.', icon: 'Waves' },
          { label: 'No horizonte', detail: 'Sem perspectiva próxima — sentido figurado.', icon: 'Sunrise' },
          { label: 'Marte', detail: 'Colônia espacial — referência literal possível.', icon: 'Globe' },
          { label: 'Gravidade', detail: 'Ausência afeta coração — dado científico.', icon: 'Activity' },
          { label: 'Pegadinha', detail: 'Confundir trecho científico com locução figurada.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Água abaixo = fracasso, não rio.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Reinach: Marte, viagem espacial, gravidade, deterioração cardíaca.',
          'Comando: há expressão em sentido figurado.',
          'A Marte/foguete: descrição tecnológica — literal — eliminar.',
          'B pergunta retórica sobre viagem: sem locução figurada central — eliminar.',
          'C «vai por água abaixo» + «no horizonte»: plano fracassa / sem perspectiva — figurado.',
          'D tecido cardíaco/aparelho: descrição do experimento — literal — eliminar.',
          'E deterioração do coração: conclusão científica — literal — eliminar.',
          'Gabarito C.',
          'Em similares: locuções fixas costumam ser figuradas.',
        ],
        footer_rule: 'C: locuções figuradas do plano espacial.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LOCUÇÕES FIGURADAS',
        rows: [
          { label: 'Vai por água abaixo', value: 'Fracassa, desmorona — figurado.' },
          { label: 'No horizonte', value: 'Sem perspectiva visível — figurado.' },
          { label: 'Literal', value: 'Marte, gravidade, tecido cardíaco — ciência.' },
          { label: 'Pergunta-teste', value: 'Imagem de água/horizonte ou fato?' },
          { label: 'Nesta questão', value: 'C — expressões figuradas.' },
        ],
        footer_rule: 'Plano não flutua em rio.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trechos literais',
        items: [
          { label: 'A — Marte', detail: 'Colônia e foguete com tecnologia atual.', correct: 'Sentido literal: descrição de viagem espacial.' },
          { label: 'B — viagem', detail: 'Pergunta sobre resistência humana.', correct: 'Sentido literal: dúvida sobre meses de viagem.' },
          { label: 'D — tecido cardíaco', detail: 'Montagem do experimento científico.', correct: 'Sentido literal: descrição do aparelho.' },
          { label: 'E — deteriora', detail: 'Conclusão sobre coração sem gravidade.', correct: 'Sentido literal: resultado do estudo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Se não estudar, o plano vai por água abaixo.»',
            correct: 'Sentido figurado: locução — plano fracassa, não cai em rio.',
          },
        ],
        footer_rule: 'C: água abaixo + horizonte.',
      },
    ],
  },

  'fgv-ag-pref-denotacao-assinale-a-opcao-que-apresenta-a-fra-3430191': {
    family: 'conceito',
    source_tec_id: '3430191',
    source_note: '«noite era um cobertor» metáfora — FGV Ag Pref Canaã Carajás 2025 tec 3430191',
    meta: {
      banca: 'FGV',
      prova: 'Ag (Pref Canaã Carajás)',
      orgao: 'Pref. Canaã dos Carajás',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a opção que apresenta a frase em que o termo sublinhado está empregado em sentido figurado.',
    options: [
      { id: 'A', text: 'Outrora, um rei governou aqui.', is_correct: false },
      { id: 'B', text: 'Os vidros da sala estão embaçados.', is_correct: false },
      { id: 'C', text: 'A noite era um cobertor sobre a cidade.', is_correct: true },
      { id: 'D', text: 'As receitas de minha avó eram excelentes.', is_correct: false },
      { id: 'E', text: 'Houve proibição legal de falar-se sobre esse tema.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Noite-cobertor',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual frase transfere sentido por imagem?', icon: 'Eye' },
          { label: 'Metáfora C', detail: 'Noite = cobertor que envolve a cidade.', icon: 'Moon' },
          { label: 'Literal A/B', detail: 'Rei governou; vidros embaçados — factual.', icon: 'BookOpen' },
          { label: 'Literal D/E', detail: 'Receitas culinárias; proibição legal.', icon: 'FileText' },
          { label: 'Pegadinha', detail: 'Achar metáfora onde há só descrição objetiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cobertor sobre cidade = imagem.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frase com termo sublinhado em sentido figurado.',
          'A rei governou: fato histórico — literal — eliminar.',
          'B vidros embaçados: estado físico do vidro — literal — eliminar.',
          'C «noite era um cobertor»: noite envolve cidade como manta — metáfora.',
          'D receitas da avó: comida — literal — eliminar.',
          'E proibição legal: norma jurídica — literal — eliminar.',
          'Gabarito C.',
          'Em similares: «X é Y» sem «como» costuma ser metáfora.',
        ],
        footer_rule: 'Noite não é tecido de cama.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'METÁFORA',
        rows: [
          { label: 'Metáfora', value: '«Noite era cobertor» — identificação sem «como».' },
          { label: 'Literal', value: 'Rei, vidros, receitas, lei — factual.' },
          { label: 'Pergunta-teste', value: 'Imagem poética ou fato objetivo?' },
          { label: 'Nesta questão', value: 'C — noite como cobertor.' },
        ],
        footer_rule: 'Cidade coberta = efeito poético.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Frases literais',
        items: [
          { label: 'A — rei', detail: 'Governo de um monarca no passado.', correct: 'Sentido literal: fato histórico objetivo.' },
          { label: 'B — embaçados', detail: 'Condensação no vidro da sala.', correct: 'Sentido literal: estado físico dos vidros.' },
          { label: 'D — receitas', detail: 'Preparos culinários da avó.', correct: 'Sentido literal: comida.' },
          { label: 'E — proibição', detail: 'Vedação jurídica de falar sobre o tema.', correct: 'Sentido literal: norma legal.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A neve era um lençol branco sobre as montanhas.»',
            correct: 'Sentido figurado: metáfora — neve comparada a lençol.',
          },
        ],
        footer_rule: 'C: metáfora do cobertor.',
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
