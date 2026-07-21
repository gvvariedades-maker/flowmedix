#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — classes-de-palavras-g06 (8 slugs · Classes de palavras · lote 6 · Preposição/Conjunção).
 *
 *   npx tsx scripts/handcraft-classes-de-palavras-g06.ts
 *   npm run audit:questao-readiness -- --lote=classes-de-palavras-g06 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=classes-de-palavras-g06 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'classes-de-palavras-g06';
const SUBTOPICO = 'Classes de palavras';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_classes_palavras';
const REVIEWED = '2026-07-20';
const GOLDEN_REFERENCE = 'examples/questao-formacao-palavras-siglas.json';

const CLASSES_SOURCE = {
  id: 'pt-classes-palavras-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Classes de palavras — preposição e conjunção (valor semântico)',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: [
    'preposição e valor de causa',
    'conjunção coordenada e subordinada',
    'conjunção adversativa e explicativa',
    'conjunção comparativa e consecutiva',
    'pergunta-teste M02/M03',
    'classificação morfológica',
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
      reviewer: 'handcraft:classes-de-palavras-g06',
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

const LEVI_STRAUSS_FRAGMENT =
  '<p>Acreditou-se por muito tempo que, deixando-se de lado a Revolução Industrial, a produção de bens de consumo nunca aumentou de forma tão rápida e robusta quanto por obra da invenção da agricultura. Graças à agricultura, pensava-se, os grupos humanos puderam tornar-se sedentários e assegurar uma provisão regular, conservando os grãos. Como dispunham de excedentes, as sociedades puderam dar-se ao luxo de manter indivíduos ou classes — chefes, nobres, sacerdotes, artesãos — que não participavam da produção de alimentos.</p><p>No espaço de quatro ou cinco milênios, a impulsão dada pela agricultura e mantida por ela teria levado os homens de um modo de vida precário, ameaçado pela fome, a uma existência estável, primeiro em aldeias e finalmente em impérios. Essas eram as visões que prevaleciam até recentemente. Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas.</p><p>Pesquisas entre os povos sem agricultura demonstram que a maior parte deles leva uma vida confortável. Descobriu-se, por exemplo, que os indígenas das regiões desérticas da Califórnia, onde hoje uma pequena população branca subsiste com dificuldade, consumiam uma grande variedade de plantas selvagens de alto valor nutritivo. Calculou-se que, entre os povos que viviam da caça e da coleta de produtos selvagens, um homem supria as necessidades de quatro ou cinco pessoas, ou seja, tinha uma produtividade superior à de muitos camponeses europeus.</p><p><em>(Claude Lévi-Strauss. Somos todos canibais, 2022. Adaptado)</em></p>';

const ASKIANAKIS_FRAGMENT =
  '<p><strong>Ele tem 22 anos e uma missão: varrer o lixo espacial da órbita da Terra</strong></p><p>Leonidas Askianakis monitora detritos na órbita terrestre. Milhares de toneladas orbitam a Terra, como satélites desativados, pedaços de foguetes e detritos. É por esse motivo que a órbita terrestre é monitorada 24 horas por dia. Mas, quanto menores os fragmentos, mais difícil é encontrá-los. «Como o lixo espacial pode permanecer em órbita por 200 anos e ninguém faz nada a respeito?», pergunta o jovem. Como que por intervenção divina, pouco depois de fundar a Project-S, a nova lei espacial da União Europeia entrou em vigor obrigando operadores a remover detritos.</p><p><em>Adaptado de notícia DW, nov. 2025</em></p>';

const SPECS: Record<string, Spec> = {
  'fgv-acs-pref-classes-assinale-a-opcao-a-seguir-em-que-o-t-3719032': {
    family: 'conceito',
    source_tec_id: '3719032',
    source_note: 'Preposição «de» causa — FGV ACS Pref Nova Iguaçu 2025 tec 3719032',
    meta: {
      banca: 'FGV',
      prova: 'ACS (Pref Nova Iguaçu)',
      orgao: 'Pref Nova Iguaçu',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a opção a seguir em que o termo destacado apresenta um valor de causa.',
    options: [
      { id: 'A', text: 'Passaram toda a tarde conversando de política.', is_correct: false },
      { id: 'B', text: 'Retornou às atividades porque acabou o tempo de licença.', is_correct: false },
      { id: 'C', text: 'Essa construção toda foi feita com madeira de demolição.', is_correct: false },
      { id: 'D', text: 'Naquela cena do filme, todos gritaram de susto.', is_correct: true },
      { id: 'E', text: 'Falou de maneira ríspida na última reunião.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preposição de causa',
        chip_label: 'M02 — preposição',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«De» liga termos e indica causa, origem ou matéria?', icon: 'Focus' },
          { label: 'De susto (D)', detail: 'Causa do grito — por causa do susto.', icon: 'Zap' },
          { label: 'De política (A)', detail: 'Tema/assunto da conversa — não causa.', icon: 'MessageCircle' },
          { label: 'De demolição (C)', detail: 'Matéria/origem da madeira — não causa do verbo.', icon: 'Hammer' },
          { label: 'Pegadinha', detail: 'Confundir causa com assunto (de política) ou modo (de maneira).', icon: 'AlertTriangle' },
        ],
        footer_rule: 'De susto = causa; de política = assunto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Causa → gabarito',
        meta: slideMeta,
        steps: [
          'Comando: «de» destacado com valor de CAUSA.',
          'D «de susto»: gritaram por causa do susto → preposição causal.',
          'A «de política»: assunto tratado — valor temático, não causal.',
          'B «porque»: conjunção causal — eliminar (não é preposição).',
          'C «de demolição»: origem/material — não causa da construção.',
          'E «de maneira»: locução adverbial de modo — eliminar.',
          'Gabarito D — de susto.',
          'Em similares: teste «por causa de» — se couber, é causa.',
        ],
        footer_rule: 'D — de susto (causa).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREPOSIÇÃO DE CAUSA',
        rows: [
          { label: 'Pergunta-teste', value: 'Substitui por «por causa de» / «em razão de»?' },
          { label: 'De susto', value: 'Gritaram de susto = por causa do susto.' },
          { label: '× Assunto', value: 'Conversar de política — tema, não causa.' },
          { label: '× Material', value: 'Madeira de demolição — origem, não causa.' },
          { label: 'Nesta questão', value: 'D — valor causal de «de».' },
        ],
        footer_rule: 'Causa: de susto, de fome, de medo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outros valores de «de»',
        items: [
          { label: 'A — de política', detail: 'Parece explicar o verbo «conversando».', correct: 'Indica assunto — não causa do ato.' },
          { label: 'B — porque', detail: 'É causal, mas é conjunção, não preposição.', correct: 'Comando pede termo destacado «de» — letra errada.' },
          { label: 'C — de demolição', detail: '«De» indica procedência da madeira.', correct: 'Valor de origem/material — não causa.' },
          { label: 'E — de maneira', detail: 'Locução adverbial de modo.', correct: 'Modifica «falou» — não preposição causal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «morreu de tédio» ou «tremia de frio».', correct: 'Mesmo trilho: de + substantivo = causa.' },
        ],
        footer_rule: 'Só D — de susto.',
      },
    ],
  },

  'vunesp-acs-p-classes-leia-o-texto-a-seguir-para-responder-3776325': {
    family: 'text_fragment',
    source_tec_id: '3776325',
    source_note: 'Conjunção «já que» causal — VUNESP ACS Pref Jundiaí 2026 tec 3776325',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Jundiaí)',
      orgao: 'Pref Jundiaí',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nNo trecho «Fazia bastante tempo eu tinha ido a um show dele, __________ eu resolvi ir neste final de semana por ser beneficente», a lacuna deve ser preenchida por:',
    text_fragment:
      '<p>Um vídeo do reencontro entre o cantor João Gomes e a sua ex-professora de Petrolina viralizou nas redes. «Professora minha ali no canto, que eu sei que sente orgulho, porque foi com vocês que aprendi a ser um rapaz direito», disse o cantor em show beneficente. Verlandia Fernandes, 48 anos, deu aulas para João Gomes por quatro anos no ensino fundamental. A disciplina preferida dele era literatura — base para a carreira de compositor.</p><p>«Fazia bastante tempo eu tinha ido a um show dele, <strong>__________</strong> eu resolvi ir neste final de semana por ser beneficente», contou a professora.</p>',
    options: [
      { id: 'A', text: 'contanto que.', is_correct: false },
      { id: 'B', text: 'contudo.', is_correct: false },
      { id: 'C', text: 'já que.', is_correct: true },
      { id: 'D', text: 'conquanto.', is_correct: false },
      { id: 'E', text: 'porém.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacuna causal',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Segunda oração justifica a primeira?', icon: 'Focus' },
          { label: 'Já que', detail: 'Conjunção causal/explicativa — motivo de ir ao show.', icon: 'Link' },
          { label: 'Contudo/porém', detail: 'Adversativas — opõem ideias, não explicam.', icon: 'GitBranch' },
          { label: 'Contanto que', detail: 'Condicional — «desde que».', icon: 'Shield' },
          { label: 'Pegadinha', detail: 'Trocar adversativa por causal na fala da professora.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Motivo de ir = beneficente → já que.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto João Gomes: professora explica por que foi ao show neste fim de semana.',
          'Segunda oração dá MOTIVO: «por ser beneficente» — causal/explicativa.',
          'A «contanto que» = condição — eliminar.',
          'B «contudo» e E «porém» = oposição — eliminar.',
          'D «conquanto» = concessão — eliminar.',
          'C «já que» = pois, visto que — encaixa a justificativa.',
          'Gabarito C.',
          'Em similares: se a segunda oração explica o motivo, teste «pois/já que».',
        ],
        footer_rule: 'C — já que (causa).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONJUNÇÃO CAUSAL',
        rows: [
          { label: 'Causais', value: 'porque, pois, já que, visto que, uma vez que.' },
          { label: 'Adversativas', value: 'mas, porém, contudo, todavia.' },
          { label: 'Condicionais', value: 'contanto que, desde que, se.' },
          { label: 'Nesta questão', value: 'C — já que (motivo do show beneficente).' },
        ],
        footer_rule: 'Explica motivo → já que.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada distrator erra o sentido',
        items: [
          { label: 'A — contanto que', detail: 'Exige condição para validar a ação.', correct: 'Não é «desde que» — é motivo já dado (beneficente).' },
          { label: 'B — contudo', detail: 'Contrasta com a primeira oração.', correct: 'Não há oposição — há explicação.' },
          { label: 'D — conquanto', detail: 'Concessiva — «embora».', correct: 'A professora não admite obstáculo — justifica ida.' },
          { label: 'E — porém', detail: 'Mesma função adversativa de B.', correct: 'Relação é de causa, não de contraste.' },
          { label: 'Em outra banca…', detail: 'Trocam «beneficente» por «em sua cidade».', correct: 'Mesmo trilho: segunda oração explica → já que.' },
        ],
        footer_rule: 'Só C fecha a lacuna.',
      },
    ],
  },

  'vunesp-acs-p-classes-ainda-que-seja-utilizada-frequenteme-3776327': {
    family: 'conceito',
    source_tec_id: '3776327',
    source_note: 'Conjunção «e» contraste — VUNESP ACS Pref Jundiaí 2026 tec 3776327',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Jundiaí)',
      orgao: 'Pref Jundiaí',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Ainda que seja utilizada frequentemente com valor semântico de adição, no trecho «Fui para homenagear o menino João e a homenageada fui eu», a conjunção «e» estabelece relação de sentido de',
    options: [
      { id: 'A', text: 'alternância.', is_correct: false },
      { id: 'B', text: 'contraste.', is_correct: true },
      { id: 'C', text: 'explicação.', is_correct: false },
      { id: 'D', text: 'conclusão.', is_correct: false },
      { id: 'E', text: 'conformidade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'E aditivo × e contrastivo',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«E» soma ou opõe as ideias?', icon: 'Focus' },
          { label: 'Fui homenagear João', detail: 'Expectativa: ela homenageia o aluno.', icon: 'User' },
          { label: 'E a homenageada fui eu', detail: 'Inversão irônica — quem homenageou foi homenageada.', icon: 'RefreshCw' },
          { label: 'Contraste', detail: 'Papel esperado × resultado real.', icon: 'GitCompare' },
          { label: 'Pegadinha', detail: '«E» costuma adicionar — aqui contrasta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'E pode contrastar — não só somar.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enunciado avisa: «e» muitas vezes é adição — mas não neste trecho.',
          'Ideia 1: ela foi homenagear João Gomes.',
          'Ideia 2: quem recebeu homenagem foi ela mesma.',
          'Há inversão de papéis → relação de CONTRASTE (ironia).',
          'A alternância exigiria troca sucessiva — não é o caso.',
          'C explicação / D conclusão / E conformidade não encaixam.',
          'Gabarito B — contraste.',
          'Em similares: leia o efeito discursivo, não só a forma «e».',
        ],
        footer_rule: 'B — e contrastivo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONJUNÇÃO «E»',
        rows: [
          { label: 'Adição', value: 'João e Maria foram — soma.' },
          { label: 'Contraste', value: 'Fui homenageá-lo e fui eu homenageada.' },
          { label: 'Pista', value: 'Inversão de expectativa → adversidade/contraste.' },
          { label: 'Nesta questão', value: 'B — contraste irônico.' },
        ],
        footer_rule: 'E nem sempre é «e também».',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Valor automático de «e»',
        items: [
          { label: 'A — alternância', detail: 'Sugere revezamento entre sujeitos.', correct: 'Não há alternância — há inversão de papéis (contraste).' },
          { label: 'C — explicação', detail: 'Segunda oração não justifica a primeira.', correct: 'Não explica — surpreende com oposição.' },
          { label: 'D — conclusão', detail: 'Falta conectivo conclusivo (logo, portanto).', correct: 'Não tira conclusão — contrapõe fatos.' },
          { label: 'E — conformidade', detail: 'Não indica conformidade ou comparação.', correct: 'Sentido é opositivo/irônico.' },
          { label: 'Em outra banca…', detail: 'Trocam por «vim ajudar e quem foi ajudada fui eu».', correct: 'Mesma estrutura contrastiva com «e».' },
        ],
        footer_rule: 'Só B — contraste.',
      },
    ],
  },

  'quadrix-tec-classes-texto-para-a-questao-leandro-karnal-3779677': {
    family: 'text_fragment',
    source_tec_id: '3779677',
    source_note: 'Conjunção adversativa «No entanto» — QUADRIX Tec Enf SES SP 2026 tec 3779677',
    meta: {
      banca: 'QUADRIX',
      prova: 'Tec Enf (SES SP)',
      orgao: 'SES SP',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Texto para a questão.\n\nAssinale a opção correta, quanto à análise semântica e sintática do segundo parágrafo do texto (trecho que começa por «No entanto»).',
    text_fragment:
      '<p>Leandro Karnal — profissional de enfermagem vai sofrer: pode adoecer, perder alguém, lidar com dor alheia o dia inteiro. Budistas e estoicos diziam: «Eu não controlo o mundo, controlo como o mundo me influencia». A dor é inevitável; o sofrimento, não.</p><p><strong>No entanto</strong>, se eu aumentar a dor com xingamentos e sentimentos negativos, transformo a dor em sofrimento. Se bater o pé na quina, sinto dor; se revolto-me, sofro.</p><p><em>Adaptado de portal COREN-SP</em></p>',
    options: [
      {
        id: 'A',
        text: 'A semântica permanece ao trocarmos a conjunção que abre o segundo parágrafo por «Mas também».',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O segundo parágrafo estabelece relação de contraste em relação ao primeiro. A conjunção coordenativa que abre esse sentido poderia ser substituída, sem alteração do sentido original do texto, por «Todavia».',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'A relação entre o primeiro e o segundo parágrafo é de alternância, visto que a conjunção poderia ser substituída por «Contudo» sem prejuízo ao sentido do tempo.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Há inconsistência na conjunção do segundo parágrafo, pois a linguagem formal inviabiliza conectivo contraditório de ideias.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'No segundo parágrafo, «tanto...quanto» estabelece comparação ao relacionar budistas e filósofos estoicos.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'No entanto — contraste',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '2º parágrafo opõe ou soma ao 1º?', icon: 'Focus' },
          { label: 'Karnal / enfermagem', detail: 'Texto COREN: dor inevitável × sofrimento evitável.', icon: 'Heart' },
          { label: 'Parágrafo 1', detail: 'Budistas e estoicos — controlo sobre influência do mundo.', icon: 'BookOpen' },
          { label: 'No entanto', detail: 'Adversativa — introduz contraste (revolta agrava dor).', icon: 'GitBranch' },
          { label: 'Pegadinha E', detail: '«Tanto...quanto» está no 1º parágrafo, não no 2º.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'No entanto = todavia = contraste.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Karnal: 1º parágrafo — dor × sofrimento; 2º — exemplo da quina.',
          '«No entanto» liga os parágrafos por OPOSIÇÃO/CONTRASTE.',
          'A «Mas também» adiciona — mudaria o sentido — eliminar.',
          'B: contraste + troca por «Todavia» sem alterar sentido — correto.',
          'C fala em alternância e «tempo» — incorreto.',
          'D nega adversativa em texto formal — incorreto.',
          'E confunde «tanto...quanto» do 1º parágrafo — eliminar.',
          'Gabarito B.',
          'Em similares: 2º § com «no entanto/porém» contrasta com o 1º — teste troca por «Todavia».',
        ],
        footer_rule: 'B — adversativa «No entanto»/«Todavia».',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADVERSATIVAS',
        rows: [
          { label: 'Coordenadas', value: 'mas, porém, contudo, todavia, no entanto.' },
          { label: 'Função', value: 'Contraste entre ideias ou parágrafos.' },
          { label: '× Adição', value: '«Mas também» soma — não substitui «no entanto».' },
          { label: 'Nesta questão', value: 'B — contraste; «Todavia» cabe.' },
        ],
        footer_rule: '2º § contrasta com o 1º.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir parágrafos e conectivos',
        items: [
          { label: 'A — mas também', detail: 'Adiciona em vez de contrastar.', correct: '«No entanto» opõe — «mas também» altera a semântica.' },
          { label: 'C — alternância', detail: 'Mistura «contudo» com noção de tempo.', correct: 'Relação é adversativa, não alternância temporal.' },
          { label: 'D — formalidade', detail: 'Texto formal admite adversativas.', correct: '«No entanto/todavia» é padrão em registro formal.' },
          { label: 'E — tanto...quanto', detail: 'Correlata está no 1º parágrafo (budistas e estoicos).', correct: 'Não é comparação no 2º § — é adversativa «no entanto».' },
          { label: 'Em outra banca…', detail: 'Trocam Karnal por outro texto com «porém».', correct: 'Mesmo teste: parágrafo 2 contrasta com o 1º.' },
        ],
        footer_rule: 'Só B descreve o 2º parágrafo.',
      },
    ],
  },

  'vunesp-ag-ad-classes-leia-o-texto-a-seguir-para-responder-3789284': {
    family: 'text_fragment',
    source_tec_id: '3789284',
    source_note: 'Comparação «superior à» — VUNESP Ag Adm Pref SJRP 2026 tec 3789284',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref SJRP',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nAssinale a alternativa em cujo trecho há uma comparação.',
    text_fragment: LEVI_STRAUSS_FRAGMENT,
    options: [
      {
        id: 'A',
        text: 'Graças à agricultura, pensava-se, os grupos humanos puderam tornar-se sedentários e assegurar uma provisão regular, conservando os grãos.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Calculou-se que, entre os povos que viviam da caça e da coleta de produtos selvagens, um homem supria as necessidades de quatro ou cinco pessoas, ou seja, tinha uma produtividade superior à de muitos camponeses europeus.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Como dispunham de excedentes, as sociedades puderam dar-se ao luxo de manter indivíduos ou classes que não participavam da produção de alimentos.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Essas eram as visões que prevaleciam até recentemente.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas.',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Marcadores de comparação',
        chip_label: 'M02 — comparação',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Há «mais/menos que», «tão...quanto», «superior a»?', icon: 'Focus' },
          { label: 'Lévi-Strauss', detail: 'Acreditou-se: produção de bens de consumo × Revolução Industrial.', icon: 'BookOpen' },
          { label: 'Superior à (B)', detail: 'Comparativo — produtividade × camponeses europeus.', icon: 'TrendingUp' },
          { label: 'Agricultura', detail: 'Impulsão da agricultura — sedentarização e excedentes.', icon: 'Wheat' },
          { label: 'Pegadinha', detail: 'Confundir causa (como/grças) com comparação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Superior à = comparação explícita.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Lévi-Strauss: acreditou-se na produção de bens de consumo e Revolução Industrial.',
          'Comando: trecho com COMPARAÇÃO entre referentes.',
          'B «produtividade superior à de muitos camponeses europeus» — comparativo explícito.',
          'A «Graças à agricultura» — causal, não comparativa.',
          'C «Como dispunham» — causal/explicativa.',
          'D e E — afirmações sem marcador comparativo.',
          'Gabarito B.',
          'Em similares: procure «mais/menos/tão/superior/inferior» + «que/a».',
        ],
        footer_rule: 'B — superior à (comparação).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPARAÇÃO NO TEXTO',
        rows: [
          { label: 'Marcadores', value: 'mais/menos que; tão...quanto; superior/inferior a.' },
          { label: 'Trecho B', value: 'superior à de camponeses europeus.' },
          { label: '× Causal', value: 'Graças à / como (causa) ≠ comparação.' },
          { label: 'Nesta questão', value: 'B — única com comparativo explícito.' },
        ],
        footer_rule: 'Superior à = comparação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Causal × comparativo',
        items: [
          { label: 'A — Graças à', detail: 'Introduz causa da sedentarização.', correct: 'Valor causal — não estabelece comparação.' },
          { label: 'C — Como dispunham', detail: '«Como» explica excedentes.', correct: 'Conjunção causal — não comparativa.' },
          { label: 'D — visões', detail: 'Frase descritiva sem comparativo.', correct: 'Sem termo comparativo entre dois termos.' },
          { label: 'E — ruínas', detail: 'Metáfora «jaz em ruínas» — não compara dois grupos.', correct: 'Não é comparação gramatical pedida.' },
          { label: 'Em outra banca…', detail: 'Trocam por «menos trabalhoso que» no mesmo texto.', correct: 'Mesmo teste: marcador comparativo explícito.' },
        ],
        footer_rule: 'Só B compara produtividades.',
      },
    ],
  },

  'vunesp-ag-ad-classes-leia-o-texto-a-seguir-para-responder-3789333': {
    family: 'text_fragment',
    source_tec_id: '3789333',
    source_note: 'Colchetes [comparação] — VUNESP Ag Adm Pref SJRP 2026 tec 3789333',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref SJRP',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nO sentido indicado entre colchetes associa-se corretamente à expressão destacada em:',
    text_fragment: LEVI_STRAUSS_FRAGMENT,
    options: [
      {
        id: 'A',
        text: '«Acreditou-se por muito tempo que... nunca aumentou de forma tão rápida e robusta quanto por obra da invenção da agricultura.» [comparação]',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«Graças à agricultura, pensava-se, os grupos humanos puderam tornar-se sedentários...» [causa]',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«Descobriu-se... que os indígenas das regiões desérticas da Califórnia, onde hoje uma pequena população branca subsiste com dificuldade...» [comparação]',
        is_correct: true,
      },
      {
        id: 'D',
        text: '«Calculou-se que... um homem supria as necessidades de quatro ou cinco pessoas...» [adição]',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas.» [conclusão]',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Colchete × trecho',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'O valor entre [ ] casa com o trecho destacado?', icon: 'Focus' },
          { label: 'Lévi-Strauss', detail: 'Acreditou-se: produção de bens × Revolução Industrial.', icon: 'BookOpen' },
          { label: 'C — Califórnia', detail: 'Indígenas desérticas × população branca com dificuldade.', icon: 'GitCompare' },
          { label: 'Agricultura', detail: 'Impulsão da agricultura — visões que prevaleciam.', icon: 'Wheat' },
          { label: 'Pegadinha', detail: 'Escolher «tão...quanto» sem ler contraste social.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Califórnia: contraste = [comparação].',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Lévi-Strauss: acreditou-se na produção de bens de consumo — agricultura × caça-coleta.',
          'Comando: par [colchete] + trecho destacado CORRETOS.',
          'C: indígenas na Califórnia × população branca «com dificuldade» — contraste comparativo.',
          'A tem comparação lexical, mas o par oficial é C (contraste entre grupos no deserto).',
          'B [causa] casa com «Graças à», porém não é a letra pedida.',
          'D [adição] não explica «ou seja» explicativo do trecho.',
          'E [conclusão] não marca conclusão lógica do período.',
          'Gabarito C.',
          'Em similares: leia o trecho inteiro antes do colchete.',
        ],
        footer_rule: 'C — [comparação] no trecho da Califórnia.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COLCHETES VUNESP',
        rows: [
          { label: 'Comparação', value: 'Contraste entre dois grupos/situações.' },
          { label: 'Causa', value: 'Graças à / porque / pois.' },
          { label: 'Trecho C', value: 'Indígenas × população branca em dificuldade.' },
          { label: 'Nesta questão', value: 'C — par correto.' },
        ],
        footer_rule: 'Leia trecho + [valor] juntos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Colchete aparente',
        items: [
          { label: 'A — tão...quanto', detail: 'Há comparativo, mas não é o par destacado da prova.', correct: 'Gabarito C — contraste Califórnia × brancos.' },
          { label: 'B — [causa]', detail: 'Par causal válido para outro trecho.', correct: 'Correto para «Graças à», mas não é a alternativa pedida.' },
          { label: 'D — [adição]', detail: '«Ou seja» é explicativo, não aditivo.', correct: 'Valor [adição] não associa ao trecho.' },
          { label: 'E — [conclusão]', detail: '«Jaz em ruínas» é constatação, não conclusão dedutiva.', correct: '[conclusão] não encaixa.' },
          { label: 'Em outra banca…', detail: 'Trocam colchetes por sinônimos de conectivos.', correct: 'Mesmo método: trecho + valor semântico.' },
        ],
        footer_rule: 'Só C fecha par trecho/[ ].',
      },
    ],
  },

  'vunesp-ag-cs-classes-leia-o-trecho-a-seguir-da-cronica-de-3799252': {
    family: 'text_fragment',
    source_tec_id: '3799252',
    source_note: 'Conjunção «como» comparação — VUNESP Ag CS Pref SJRP 2026 tec 3799252',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag CS (Pref SJRP)',
      orgao: 'Pref SJRP',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o trecho a seguir, da crônica de Nelson Rodrigues, para responder à questão.\n\nNo trecho «Sob o estímulo da pusilanimidade, tubarões e pés-rapados largam a mesma baba, elástica e bovina, como se fossem iguais», a conjunção «como» estabelece relação de sentido de',
    text_fragment:
      '<p>Ontem, presenciei uma cena que me pareceu uma pequena lição de vida. Na esquina de Carioca com Uruguaiana, alguém gritou «Olha o rapa!». Houve pânico coletivo — senhoras, advogados, psiquiatras. O medo nivelou todos. <strong>Sob o estímulo da pusilanimidade, tubarões e pés-rapados largam a mesma baba, elástica e bovina, como se fossem iguais</strong>. Era rebate falso; não havia rapa. Imediatamente as caras resplandeceram, lavadas do medo.</p><p><em>(Nelson Rodrigues, adaptado)</em></p>',
    options: [
      { id: 'A', text: 'modo.', is_correct: false },
      { id: 'B', text: 'condição.', is_correct: false },
      { id: 'C', text: 'consequência.', is_correct: true },
      { id: 'D', text: 'comparação.', is_correct: false },
      { id: 'E', text: 'conclusão.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Como — valor no trecho',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Como» introduz modo, comparação ou consecutiva?', icon: 'Focus' },
          { label: 'Nelson Rodrigues', detail: 'Crônica do «rapa» falso na Carioca/Uruguaiana.', icon: 'BookOpen' },
          { label: 'Pusilanimidade', detail: 'Medo nivelador — tubarões e pés-rapados iguais.', icon: 'Users' },
          { label: 'Como se iguais', detail: 'Efeito do estímulo — consecutiva/consequência.', icon: 'ArrowRight' },
          { label: 'Pegadinha D', detail: '«Como» parece comparação, mas liga causa→efeito.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Medo → mesma reação: consequência.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica do «rapa» falso: medo iguala classes sociais.',
          'Trecho: estímulo da pusilanimidade → todos largam «a mesma baba».',
          'Relação: efeito decorrente do medo — valor consecutivo/consequência.',
          'A modo puro descreveria apenas a maneira — incompleto.',
          'B condição exigiria hipótese («se»).',
          'D comparação isolada ignora o nexo causa→efeito do período.',
          'E conclusão pediria «logo/portanto».',
          'Gabarito C — consequência.',
        ],
        footer_rule: 'C — consequência do medo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: '«COMO» POLISSÊMICO',
        rows: [
          { label: 'Modo', value: 'Fez como mandei.' },
          { label: 'Comparação', value: 'Corre como o vento.' },
          { label: 'Consecutiva', value: 'Efeito que decorre (como/consecutiva).' },
          { label: 'Nesta questão', value: 'C — reação consequente ao medo.' },
        ],
        footer_rule: 'Estímulo → efeito = consequência.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Fixar só «como = comparação»',
        items: [
          { label: 'A — modo', detail: 'Foca só a maneira da «baba».', correct: 'O período enfatiza efeito do medo — consequência.' },
          { label: 'B — condição', detail: 'Não há «se» condicionando.', correct: 'Medo já ocorreu — não é hipótese.' },
          { label: 'D — comparação', detail: '«Como se» simula igualdade, mas nexo é consecutivo.', correct: 'Prova marca consequência do estímulo.' },
          { label: 'E — conclusão', detail: 'Não tira conclusão lógica final.', correct: 'Descreve efeito imediato — consecutiva.' },
          { label: 'Em outra banca…', detail: 'Trocam trecho por «como Tolstoi descreveria».', correct: 'Ler função no período — não decorar «como» fixo.' },
        ],
        footer_rule: 'Só C no trecho do medo.',
      },
    ],
  },

  'instituto-ao-classes-considere-o-texto-a-seguir-para-resp-3804085': {
    family: 'text_fragment',
    source_tec_id: '3804085',
    source_note: 'Valor INCORRETO «Como» causal — Instituto AOCP TAA SES SC 2026 tec 3804085',
    meta: {
      banca: 'Instituto AOCP',
      prova: 'TAA (SES SC)',
      orgao: 'SES SC',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder à questão.\n\nAssinale a alternativa que apresenta, entre parênteses, o valor semântico INCORRETO para o termo destacado.',
    text_fragment: ASKIANAKIS_FRAGMENT,
    options: [
      {
        id: 'A',
        text: '«É por esse motivo que a órbita terrestre é monitorada 24 horas por dia.» (valor causal).',
        is_correct: false,
      },
      {
        id: 'B',
        text: '«Mas, quanto menores os fragmentos, mais difícil é encontrá-los.» (valor adversativo).',
        is_correct: false,
      },
      {
        id: 'C',
        text: '«Como o lixo espacial pode permanecer em órbita por 200 anos e ninguém faz nada a respeito?» (valor explicativo).',
        is_correct: true,
      },
      {
        id: 'D',
        text: '«Como que por intervenção divina, pouco depois de sua fundação, a nova lei espacial da União Europeia entrou em vigor...» (valor comparativo).',
        is_correct: false,
      },
      {
        id: 'E',
        text: '«Milhares de toneladas deles orbitam a Terra, como satélites desativados, pedaços de foguetes e detritos.» (valor comparativo).',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parêntese errado',
        chip_label: 'M02 — conjunção',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Qual par termo/(valor) está trocado?', icon: 'Focus' },
          { label: 'Askianakis', detail: 'Texto sobre lixo espacial e órbita terrestre.', icon: 'Rocket' },
          { label: 'Como (C)', detail: '«Como pode permanecer...?» = causa — não explicativo.', icon: 'HelpCircle' },
          { label: 'Por esse motivo (A)', detail: 'Causal — par correto.', icon: 'Check' },
          { label: 'Pegadinha', detail: 'Chamar «Como» pergunta de «explicativo».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Como indignado = causal, não explicativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor INCORRETO entre parênteses.',
          'A «por esse motivo» — causal — par correto.',
          'B «Mas» — adversativo — par correto.',
          'C «Como o lixo...?» — pergunta retórica de CAUSA (por que ninguém age?).',
          'Parêntese diz «explicativo» — INCORRETO → letra C.',
          'D «como que por intervenção divina» — comparação/coincidência — aceitável.',
          'E «como satélites» — comparação — par correto.',
          'Gabarito C.',
          'Em similares: «Como» em pergunta indignada = causal — não rotule de explicativo.',
        ],
        footer_rule: 'C — explicativo errado; é causal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMO — CAUSA × EXPLICAÇÃO',
        rows: [
          { label: 'Causal', value: 'Como ninguém faz nada? = por que?' },
          { label: 'Explicativo', value: 'Pois, porque, já que — explicitam motivo em afirmativa.' },
          { label: 'Comparativo', value: 'Como satélites — semelhança.' },
          { label: 'Nesta questão', value: 'C — (explicativo) está errado.' },
        ],
        footer_rule: 'Pergunta «como» = causa/indignação.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'INCORRETO — cada par',
        items: [
          { label: 'A — causal', detail: '«Por esse motivo» é causal mesmo.', correct: 'Par correto — não é o INCORRETO.' },
          { label: 'B — adversativo', detail: '«Mas» opõe dificuldade à monitoração.', correct: 'Adversativo certo — eliminar.' },
          { label: 'D — comparativo', detail: '«Como que por intervenção divina» = como se fosse coincidência.', correct: 'Valor comparativo/coincidente plausível.' },
          { label: 'E — como satélites', detail: 'Comparação exemplificativa clara.', correct: 'Par (comparativo) correto.' },
          { label: 'Em outra banca…', detail: 'Trocam «Como» por «Por que» na pergunta.', correct: 'Mesma função causal — não explicativa.' },
        ],
        footer_rule: 'Só C tem parêntese errado.',
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
