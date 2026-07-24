#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinonimos-antonimos-e-polissemia-g07 (8 slugs · lote 7).
 *
 *   npx tsx scripts/handcraft-sinonimos-antonimos-e-polissemia-g07.ts
 *   npm run audit:questao-readiness -- --lote=sinonimos-antonimos-e-polissemia-g07 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=sinonimos-antonimos-e-polissemia-g07 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinonimos-antonimos-e-polissemia-g07';
const SUBTOPICO = 'Sinônimos, antônimos e polissemia';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_sinonimos_polissemia';
const REVIEWED = '2026-07-24';
const GOLDEN_REFERENCE = 'examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json';

const SINONIMOS_SOURCE = {
  id: 'pt-sinonimos-polissemia-concursos',
  tier: 'A' as const,
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Sinônimos, antônimos e polissemia',
  year: 2024,
  url: 'https://www.academia.org.br/',
  covers: ['sinonímia', 'polissemia', 'parônimos', 'antonímia', 'pergunta-teste', 'contexto'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'certo_errado' | 'text_fragment' | 'vf';

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
      reviewer: 'handcraft:sinonimos-antonimos-e-polissemia-g07',
      guideline_snapshot: `Elias TE-simples — pergunta «Mesmo sentido na frase?» · lente contexto × dicionário (sinonimosPolissemia.ts) · âncora → ${GOLDEN_REFERENCE}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      SINONIMOS_SOURCE,
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
  'avancasp-aco-sinonimos-leia-o-texto-a-seguir-para-responder-3738879': {
    family: 'text_fragment',
    source_tec_id: '3738879',
    source_note:
      '«asquerosa» ≈ repugnante — princesa e o sapo Verissimo — AVANÇASP ACO Pref Cunha 2025 tec 3738879',
    meta: {
      banca: 'AVANÇASP',
      prova: 'ACO (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto a seguir para responder à questão abaixo.\n\n«Uma bruxa má lançou-me um encanto e transformei-me nesta rã asquerosa.»\n\nA palavra destacada na frase acima é sinônima de:',
    text_fragment:
      'A princesa e o sapo — Luís Fernando Verissimo (adaptado)\n\nEra uma vez uma princesa linda, independente e cheia de autoestima. Ela se deparou com uma rã enquanto contemplava o lago do castelo.\n\nA rã pulou para o seu colo e disse: linda princesa, eu já fui um príncipe muito bonito. Uma bruxa má lançou-me um encanto e transformei-me nesta rã asquerosa. Um beijo teu, no entanto, há de me transformar de novo num belo príncipe e poderemos casar no teu lindo castelo.\n\nA tua mãe poderia vir morar conosco e tu poderias preparar o meu jantar, lavar as minhas roupas, criar os nossos filhos...\n\nNaquela noite, enquanto saboreava pernas de rã sautée com molho acebolado e vinho branco, a princesa sorria, pensando: — Eu, hein?... nem morta!',
    options: [
      { id: 'A', text: '«falante».', is_correct: false },
      { id: 'B', text: '«cheirosa».', is_correct: false },
      { id: 'C', text: '«charmosa».', is_correct: false },
      { id: 'D', text: '«repugnante».', is_correct: true },
      { id: 'E', text: '«inteligente».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Asquerosa',
        chip_label: 'Princesa e o sapo',
        meta: slideMeta,
        items: [
          { label: 'Asquerosa', detail: 'Rã nojenta, repulsiva — tom irônico do sapo.', icon: 'Frown' },
          { label: 'Repugnante', detail: 'Que causa repulsa — equivalência.', icon: 'Ban' },
          { label: 'Verissimo', detail: 'Crônica «A princesa e o sapo».', icon: 'Crown' },
          { label: 'Princesa', detail: 'Independente — rejeita o príncipe sapo.', icon: 'Sparkles' },
          { label: 'Bruxa má', detail: 'Encanto transformou príncipe em rã.', icon: 'Wand2' },
          { label: 'Pergunta-teste', detail: 'Descreve nojo ou charme?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por charmosa ou cheirosa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Asquerosa ≈ repugnante — rã que a princesa rejeita.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Verissimo: sapo pede beijo; princesa cozinha pernas de rã — ironia feminista.',
          '«Rã asquerosa» — autoimagem negativa do sapo/príncipe encantado.',
          'A «falante»: quem fala — não cobre nojo — eliminar.',
          'B «cheirosa»: aroma agradável — oposto — eliminar.',
          'C «charmosa»: atraente — oposto de asquerosa — eliminar.',
          'D «repugnante»: nojenta, repulsiva — equivalência — manter.',
          'E «inteligente»: cognição — irrelevante — eliminar.',
          'Gabarito D.',
          'Em similares: asqueroso ≈ repugnante/nojento — prove no tom de repulsa.',
        ],
        footer_rule: 'Gabarito D — asquerosa equivale a repugnante.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ASQUEROSA × REPUGNANTE',
        rows: [
          { label: 'Asquerosa', value: 'Nojenta, repulsiva — rã encantada.' },
          { label: 'Repugnante', value: 'Sinônimo — causa repulsa.' },
          { label: 'Charmosa', value: 'Antônimo — pegadinha.' },
          { label: 'Nesta questão', value: 'D — repugnante.' },
        ],
        footer_rule: 'Charmosa/cheirosa = opostos de asquerosa.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Repulsa × elogio',
        items: [
          { label: 'A — falante', detail: 'Que fala, comunicativo.', correct: 'Sinônimo no contexto: «falante» descreve fala — não repulsa da rã.' },
          { label: 'B — cheirosa', detail: 'De bom cheiro.', correct: 'Antônimo no contexto: «cheirosa» opõe-se a asquerosa (nojenta).' },
          { label: 'C — charmosa', detail: 'Atraente, sedutora.', correct: 'Antônimo no contexto: «charmosa» contradiz «asquerosa».' },
          { label: 'E — inteligente', detail: 'Capaz, sagaz.', correct: 'Sinônimo no contexto: «inteligente» não substitui nojo/repulsa.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Achou o prato asqueroso e não comeu.»',
            correct: 'Sinônimo no contexto: «repugnante» — causa repulsa.',
          },
        ],
        footer_rule: 'Gabarito D — repugnante na crônica Verissimo.',
      },
    ],
  },

  'avancasp-mon-sinonimos-leia-o-texto-a-seguir-para-responder-3739261': {
    family: 'text_fragment',
    source_tec_id: '3739261',
    source_note:
      '«crepita» ≈ estala — labaredas Andersen vento — AVANÇASP Mon Pref Cunha 2025 tec 3739261',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Mon (Pref Cunha)',
      orgao: 'Pref. Cunha',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão abaixo.\n\n«Erguem-se as labaredas, o fogo crepita, voam fagulhas»\n\nA palavra destacada na frase acima é sinônima de:',
    text_fragment:
      'Histórias que o vento contou — Hans Christian Andersen (adaptado)\n\nQuando o Vento passa, o capim se encrespa como um lago e o trigal ondula como o mar. É a dança do Vento.\n\nNão ouves o Vento contar histórias? Sua voz é um canto, tem vários sons. Ouvido entre as árvores da floresta, tem um som; através dos buracos e rachaduras das paredes, tem outro.\n\nVês o Vento tangendo as nuvens como rebanho de ovelhas? Ouves o Vento uivar através do portão aberto? Com estranho gemido entra pela chaminé da lareira. Erguem-se as labaredas, o fogo crepita, voam fagulhas, o clarão das chamas ilumina todo o aposento.\n\nComo é bom ficar no aconchego da sala aquecida e ouvir o Vento lá fora assobiar e uivar. Ele conhece mais lendas e histórias do que todos nós juntos.',
    options: [
      { id: 'A', text: '«acende».', is_correct: false },
      { id: 'B', text: '«apaga».', is_correct: false },
      { id: 'C', text: '«estala».', is_correct: true },
      { id: 'D', text: '«alastra».', is_correct: false },
      { id: 'E', text: '«diminui».', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crepita',
        chip_label: 'Lareira',
        meta: slideMeta,
        items: [
          { label: 'Crepita', detail: 'Som seco do fogo na lareira.', icon: 'Flame' },
          { label: 'Estala', detail: 'Ruído de estalo — equivalência.', icon: 'Zap' },
          { label: 'Labaredas', detail: 'Erguem-se com o vento na chaminé.', icon: 'FireExtinguisher' },
          { label: 'Fagulhas', detail: 'Voam com o clarão das chamas.', icon: 'Sparkles' },
          { label: 'Andersen', detail: '«Histórias que o vento contou».', icon: 'Wind' },
          { label: 'Pergunta-teste', detail: 'Indica som ou ação de apagar?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Confundir com acende ou alastra.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Crepita ≈ estala — ruído do fogo na lareira.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Andersen: vento na chaminé — labaredas, fagulhas, aconchego da sala.',
          '«O fogo crepita» — som característico da lenha queimando.',
          'A «acende»: inicia fogo — não é som — eliminar.',
          'B «apaga»: extingue — oposto — eliminar.',
          'C «estala»: produz estalos — equivalência sonora — manter.',
          'D «alastra»: espalha — ação distinta — eliminar.',
          'E «diminui»: reduz — eliminar.',
          'Gabarito C.',
          'Em similares: crepitar ≈ estalar/crackling — prove no som da lareira.',
        ],
        footer_rule: 'Gabarito C — crepita equivale a estala.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CREPITA × ESTALA',
        rows: [
          { label: 'Crepita', value: 'Som seco do fogo — estalo contínuo.' },
          { label: 'Estala', value: 'Sinônimo — ruído de estalo.' },
          { label: 'Apaga', value: 'Antônimo de manter fogo.' },
          { label: 'Nesta questão', value: 'C — estala.' },
        ],
        footer_rule: 'Crepitar = estalar — onomatopeia do fogo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Som × ação do fogo',
        items: [
          { label: 'A — acende', detail: 'Inicia a chama.', correct: 'Sinônimo no contexto: «acende» indica início — não o som de crepitar.' },
          { label: 'B — apaga', detail: 'Extingue o fogo.', correct: 'Antônimo no contexto: «apaga» opõe-se a labaredas erguidas.' },
          { label: 'D — alastra', detail: 'Espalha, propaga.', correct: 'Sinônimo no contexto: «alastra» indica expansão — não ruído.' },
          { label: 'E — diminui', detail: 'Reduz intensidade.', correct: 'Sinônimo no contexto: «diminui» não cobre som de estalo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A lenha crepitava na lareira fria de outono.»',
            correct: 'Sinônimo no contexto: «estalava» — som seco do fogo.',
          },
        ],
        footer_rule: 'Gabarito C — estala no trecho Andersen.',
      },
    ],
  },

  'educa-pb-acd-sinonimos-leia-o-texto-a-seguir-e-responda-a-q-3746595': {
    family: 'text_fragment',
    source_tec_id: '3746595',
    source_note:
      '«afaga» ≈ acaricia — Versos íntimos Augusto dos Anjos — EDUCA PB ACD Pref Santa Cecília 2025 tec 3746595',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACD (Pref Santa Cecília)',
      orgao: 'Pref. Santa Cecília',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir e responda à questão.\n\nTEXTO III — Versos íntimos (Augusto dos Anjos)\n\nReleia o verso:\n«A mão que afaga é a mesma que apedreja.»\n\nAssinale a alternativa que apresenta uma substituição correta da palavra sublinhada sem alterar o sentido do verso:',
    text_fragment:
      'Versos íntimos — Augusto dos Anjos (trecho)\n\nVês! Ninguém assistiu ao formidável enterro de tua última quimera. Somente a Ingratidão — esta pantera — foi tua companheira inseparável!\n\nToma um fósforo. Acende teu cigarro! O beijo, amigo, é a véspera do escarro, a mão que afaga é a mesma que apedreja. Se a alguém causa inda pena a tua chaga, apedreja essa mão vil que te afaga, escarra nessa boca que te beija!',
    options: [
      { id: 'A', text: 'Ataca.', is_correct: false },
      { id: 'B', text: 'Acaricia.', is_correct: true },
      { id: 'C', text: 'Esmaga.', is_correct: false },
      { id: 'D', text: 'Apedreja.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Afaga',
        chip_label: 'Augusto dos Anjos',
        meta: slideMeta,
        items: [
          { label: 'Afaga', detail: 'Carinho com a mão — gesto suave.', icon: 'Hand' },
          { label: 'Acaricia', detail: 'Toque afetuoso — equivalência.', icon: 'Heart' },
          { label: 'Apedreja', detail: 'Par oposto no verso — violência.', icon: 'Shield' },
          { label: 'Antítese', detail: 'Mesma mão: carinho × agressão.', icon: 'Scale' },
          { label: 'Versos íntimos', detail: 'Tom pessimista — ingratidão humana.', icon: 'BookOpen' },
          { label: 'Pergunta-teste', detail: 'Substitui gesto de carinho?', icon: 'Eye' },
        ],
        footer_rule: 'Afaga ≈ acaricia — polo afetivo da antítese.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Augusto dos Anjos: antítese «afaga» × «apedreja» — mesma mão, gestos opostos.',
          'Pedido: sinônimo de «afaga» sem mudar sentido do verso.',
          'A «ataca»: agressão — confunde com «apedreja» — eliminar.',
          'B «acaricia»: carinho, toque suave — equivalência — manter.',
          'C «esmaga»: força violenta — não é carinho — eliminar.',
          'D «apedreja»: já está no verso como oposto — não substitui afaga — eliminar.',
          'Gabarito B.',
          'Em similares: afagar ≈ acariciar — prove no polo positivo da antítese.',
        ],
        footer_rule: 'Gabarito B — afaga equivale a acaricia.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AFAGA × ACARICIA',
        rows: [
          { label: 'Afaga', value: 'Gestos de carinho com a mão.' },
          { label: 'Acaricia', value: 'Sinônimo — toque afetuoso.' },
          { label: 'Apedreja', value: 'Polo oposto — não substitui afaga.' },
          { label: 'Nesta questão', value: 'B — acaricia.' },
        ],
        footer_rule: 'Apedreja = antônimo no mesmo verso.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Antítese no verso',
        items: [
          { label: 'A — ataca', detail: 'Agressão verbal ou física.', correct: 'Sinônimo no contexto: «ataca» aproxima-se de «apedreja» — não de «afaga».' },
          { label: 'C — esmaga', detail: 'Pressiona com força.', correct: 'Sinônimo no contexto: «esmaga» indica violência — não carinho.' },
          { label: 'D — apedreja', detail: 'Lança pedras — polo negativo.', correct: 'Antônimo no contexto: «apedreja» é o oposto pedido no verso — não substitui «afaga».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A mãe afaga o filho antes da bronca.»',
            correct: 'Sinônimo no contexto: «acaricia» — gesto de afeto.',
          },
        ],
        footer_rule: 'Gabarito B — acaricia no Versos íntimos.',
      },
    ],
  },

  'apice-ag-adm-sinonimos-leia-o-poema-abaixo-e-responda-a-que-3793485': {
    family: 'text_fragment',
    source_tec_id: '3793485',
    source_note:
      'langorosas→desanimadas; olores→fragrâncias — Mágoas Augusto dos Anjos — Ápice Ag Adm Pref R Bacamarte 2025 tec 3793485',
    meta: {
      banca: 'Ápice',
      prova: 'Ag Adm (Pref R Bacamarte)',
      orgao: 'Pref. R Bacamarte',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o poema abaixo e responda a questão.\n\nMágoas — Augusto dos Anjos\n\nReleia a estrofe:\n\nQuando nasci num mês de tantas flores\nTodas murcharam, tristes, langorosas\nTristes fanaram redolentes rosas\nMorreram todas, todas sem olores\n\nÉ possível, mantendo o sentido original, substituir os termos destacados, respectivamente, por',
    text_fragment:
      'Mágoas — Augusto dos Anjos (estrofe)\n\nQuando nasci num mês de tantas flores\nTodas murcharam, tristes, langorosas\nTristes fanaram redolentes rosas\nMorreram todas, todas sem olores\n\nOh! Minha infância nunca teve flores! Cansado de chorar pelas estradas, exausto de pisar mágoas pisadas, hoje eu carrego a cruz das minhas dores!',
    options: [
      { id: 'A', text: 'estimadas e fragrâncias.', is_correct: false },
      { id: 'B', text: 'lutulentas e cores.', is_correct: false },
      { id: 'C', text: 'lacônicas e cores.', is_correct: false },
      { id: 'D', text: 'desanimadas e fragrâncias.', is_correct: true },
      { id: 'E', text: 'irrequietas e cores.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Langorosas × olores',
        chip_label: 'Mágoas',
        meta: slideMeta,
        items: [
          { label: 'Langorosas', detail: 'Flores murchas, sem vigor — languidez.', icon: 'Flower2' },
          { label: 'Olores', detail: 'Perfumes, aromas das rosas.', icon: 'Wind' },
          { label: 'Desanimadas', detail: 'Sem ânimo — sinônimo de langorosas.', icon: 'CloudRain' },
          { label: 'Fragrâncias', detail: 'Aromas — sinônimo de olores.', icon: 'Sparkles' },
          { label: 'Murcharam', detail: 'Todas as flores morreram ao nascer o poeta.', icon: 'Skull' },
          { label: 'Pergunta-teste', detail: 'Par 1: languidez? Par 2: aroma?', icon: 'Eye' },
        ],
        footer_rule: 'Langorosas → desanimadas; olores → fragrâncias.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Poema «Mágoas»: flores murcham ao nascimento — tom melancólico.',
          '«Langorosas»: flores lânguidas, sem vigor, tristes.',
          '«Olores»: perfumes que as rosas deixaram de ter.',
          'A «estimadas»: queridas — não cobre languidez — eliminar.',
          'B/C/E «cores»: não substitui aromas — eliminar.',
          'D «desanimadas e fragrâncias»: par correto — manter.',
          'Gabarito D.',
          'Em similares: langoroso ≈ desanimado/lânguido; odor ≈ fragrância.',
        ],
        footer_rule: 'Gabarito D — desanimadas e fragrâncias.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LANGOROSAS × OLORES',
        rows: [
          { label: 'Langorosas', value: 'Lânguidas, desanimadas, murchas.' },
          { label: 'Olores', value: 'Perfumes, aromas, fragrâncias.' },
          { label: 'Cores', value: 'Pegadinha — não cobre olores.' },
          { label: 'Nesta questão', value: 'D — desanimadas / fragrâncias.' },
        ],
        footer_rule: 'Dois pares na ordem — vigor × aroma.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Par duplo na estrofe',
        items: [
          { label: 'A — estimadas', detail: 'Queridas, valorizadas.', correct: 'Sinônimo no contexto: «estimadas» não cobre languidez de flores murchas.' },
          { label: 'B — lutulentas', detail: 'Sujas de lama — sentido distinto.', correct: 'Sinônimo no contexto: «lutulentas» (ensanguentadas/sujas) ≠ langorosas.' },
          { label: 'C — lacônicas', detail: 'Concisas, breves.', correct: 'Sinônimo no contexto: «lacônicas» indica brevidade — não languidez.' },
          { label: 'E — irrequietas', detail: 'Agitadas, inquietas.', correct: 'Antônimo no contexto: «irrequietas» opõe-se a flores langorosas.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Rosas langorosas perderam os olores no canteiro.»',
            correct: 'Sinônimo no contexto: desanimadas + fragrâncias — par do poema.',
          },
        ],
        footer_rule: 'Gabarito D — par duplo em Mágoas.',
      },
    ],
  },

  'educa-pb-ace-sinonimos-considere-o-texto-a-seguir-para-resp-3820027': {
    family: 'text_fragment',
    source_tec_id: '3820027',
    source_note:
      '«conscientes» ≈ responsáveis — charge consumidores — EDUCA PB ACE Pref Ibiara 2025 tec 3820027',
    meta: {
      banca: 'EDUCA PB',
      prova: 'ACE (Pref Ibiara)',
      orgao: 'Pref. Ibiara',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto a seguir para responder a questão.\n\nLeia o trecho a seguir, extraído da charge: «...meu atual sonho de consumo é ter consumidores mais conscientes.»\n\nAssinale a alternativa que apresenta um sinônimo CORRETO para o termo destacado:',
    text_fragment:
      '[Charge transcrita — Tribuna Ribeirão, 15/03/2025]\n\nPersonagem empresarial em tom irônico diante de vitrine cheia de produtos. Balão de fala: «Meu atual sonho de consumo é ter consumidores mais conscientes.»\n\nContexto: crítica ao consumismo — «conscientes» = atentos às escolhas de consumo, responsáveis.',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'Distraídos.', is_correct: false },
      { id: 'B', text: 'Responsáveis.', is_correct: true },
      { id: 'C', text: 'Apáticos.', is_correct: false },
      { id: 'D', text: 'Desinformados.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conscientes',
        chip_label: 'Charge',
        meta: slideMeta,
        items: [
          { label: 'Conscientes', detail: 'Atentos ao consumo — escolha informada.', icon: 'ShoppingCart' },
          { label: 'Responsáveis', detail: 'Cientes das consequências — equivalência.', icon: 'CheckCircle' },
          { label: 'Charge', detail: 'Ironia — sonho de consumo do empresário.', icon: 'MessageSquare' },
          { label: 'Consumidores', detail: 'Público-alvo da crítica ao consumismo.', icon: 'Users' },
          { label: 'Sonho de consumo', detail: 'Expressão irônica na fala do personagem.', icon: 'Star' },
          { label: 'Pergunta-teste', detail: 'Indica atenção ou desleixo?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por distraídos ou apáticos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Conscientes ≈ responsáveis — consumo com critério.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Charge: empresário deseja «consumidores mais conscientes» — ironia.',
          '«Conscientes» = que refletem sobre o que consomem — responsáveis.',
          'A «distraídos»: desatentos — oposto — eliminar.',
          'B «responsáveis»: que assumem escolhas — equivalência — manter.',
          'C «apáticos»: indiferentes — oposto — eliminar.',
          'D «desinformados»: sem informação — oposto — eliminar.',
          'Gabarito B.',
          'Em similares: consumidor consciente ≈ responsável — prove na crítica ao consumismo.',
        ],
        footer_rule: 'Gabarito B — conscientes equivale a responsáveis.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONSCIENTES × RESPONSÁVEIS',
        rows: [
          { label: 'Conscientes', value: 'Atentos, críticos no consumo.' },
          { label: 'Responsáveis', value: 'Sinônimo — assumem consequências.' },
          { label: 'Distraídos', value: 'Antônimo — pegadinha.' },
          { label: 'Nesta questão', value: 'B — responsáveis.' },
        ],
        footer_rule: 'Apático/distraído = oposto de consciente.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Consumo consciente',
        items: [
          { label: 'A — distraídos', detail: 'Desatentos, dispersos.', correct: 'Antônimo no contexto: «distraídos» opõe-se a consumidores conscientes.' },
          { label: 'C — apáticos', detail: 'Indiferentes, sem interesse.', correct: 'Antônimo no contexto: «apáticos» contradizem atenção ao consumo.' },
          { label: 'D — desinformados', detail: 'Sem informação adequada.', correct: 'Antônimo no contexto: «desinformados» opõem-se a «conscientes».' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Queremos consumidores conscientes das marcas que compram.»',
            correct: 'Sinônimo no contexto: «responsáveis» — atentos às escolhas.',
          },
        ],
        footer_rule: 'Gabarito B — responsáveis na charge.',
      },
    ],
  },

  'vunesp-acs-p-sinonimos-leia-o-texto-a-seguir-para-responder-3844988': {
    family: 'text_fragment',
    source_tec_id: '3844988',
    source_note:
      '«utilizar» ≈ se servir de — democracia digital Wilson Gomes — VUNESP ACS Pref Vista A do Alto 2025 tec 3844988',
    meta: {
      banca: 'VUNESP',
      prova: 'ACS (Pref Vista A do Alto)',
      orgao: 'Pref. Vista A do Alto',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o texto a seguir para responder à questão.\n\nEm «... outras ferramentas capazes de utilizar um gigantesco volume de dados...», a palavra destacada pode ser substituída, em conformidade com a norma-padrão de regência, por:',
    text_fragment:
      'Democracia digital (Revista E — adaptado)\n\nNas primeiras duas décadas do século 21, o desenho da sociedade sofreu grandes alterações com o uso das redes sociais, da inteligência artificial e de outras ferramentas capazes de utilizar um gigantesco volume de dados na internet para os mais diversos fins.\n\nPor um lado, abriu-se caminho para vozes historicamente silenciadas; por outro, pavimentou-se uma via de disseminação de fake news, polarização ideológica e discursos de ódio.\n\nO professor Wilson Gomes (UFBA) alerta: a democracia digital depende da escolha de usar recursos digitais para fortalecer valores democráticos — mas os mesmos recursos podem solapar a vida democrática quando a convicção vacila.',
    options: [
      { id: 'A', text: 'dispor a', is_correct: false },
      { id: 'B', text: 'recorrer com', is_correct: false },
      { id: 'C', text: 'se servir de', is_correct: true },
      { id: 'D', text: 'se valer com', is_correct: false },
      { id: 'E', text: 'contar de', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Utilizar',
        chip_label: 'Regência',
        meta: slideMeta,
        items: [
          { label: 'Utilizar', detail: 'Fazer uso de dados na internet.', icon: 'Database' },
          { label: 'Se servir de', detail: 'Regência correta — equivalência.', icon: 'Link' },
          { label: 'Ferramentas', detail: 'IA, redes — volume gigantesco de dados.', icon: 'Cpu' },
          { label: 'Democracia digital', detail: 'Wilson Gomes — escolha de uso.', icon: 'Globe' },
          { label: 'Fake news', detail: 'Risco da polarização digital.', icon: 'AlertTriangle' },
          { label: 'Pergunta-teste', detail: 'A troca respeita regência verbal?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Regências erradas: dispor a, valer com.', icon: 'XCircle' },
        ],
        footer_rule: 'Utilizar dados ≈ servir-se de — regência padrão.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto: ferramentas digitais «utilizar» volume de dados na internet.',
          'Pedido: sinônimo com regência correta — não só sentido.',
          'A «dispor a»: regência inadequada — eliminar.',
          'B «recorrer com»: preposição errada — eliminar.',
          'C «se servir de»: utilizar algo — regência correta — manter.',
          'D «se valer com»: construção incorreta — eliminar.',
          'E «contar de»: não substitui utilizar — eliminar.',
          'Gabarito C.',
          'Em similares: utilizar ≈ servir-se de — prove regência + sentido.',
        ],
        footer_rule: 'Gabarito C — se servir de (regência correta).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'UTILIZAR × SE SERVIR DE',
        rows: [
          { label: 'Utilizar', value: 'Fazer uso de — transitivo direto.' },
          { label: 'Se servir de', value: 'Sinônimo — regência: de + objeto.' },
          { label: 'Dispor a', value: 'Regência incorreta — pegadinha.' },
          { label: 'Nesta questão', value: 'C — se servir de.' },
        ],
        footer_rule: 'Regência vale tanto quanto sinônimos.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Regência verbal',
        items: [
          { label: 'A — dispor a', detail: 'Preposição inadequada.', correct: 'Sinônimo no contexto: «dispor a» não substitui «utilizar» com regência correta.' },
          { label: 'B — recorrer com', detail: 'Recorrer a/de — não «com».', correct: 'Sinônimo no contexto: «recorrer com» viola regência padrão.' },
          { label: 'D — se valer com', detail: 'Valer-se de — não «com».', correct: 'Sinônimo no contexto: «se valer com» é construção incorreta.' },
          { label: 'E — contar de', detail: 'Contar com — sentido distinto.', correct: 'Sinônimo no contexto: «contar de» não equivale a utilizar dados.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A IA utiliza grandes volumes de dados.»',
            correct: 'Sinônimo no contexto: «serve-se de» — regência de + objeto.',
          },
        ],
        footer_rule: 'Gabarito C — se servir de no texto digital.',
      },
    ],
  },

  'apice-acs-pr-sinonimos-15-07-2026-19-38-27-98-257-258-259-o-3951867': {
    family: 'text_fragment',
    source_tec_id: '3951867',
    source_note:
      '«vacância» ≈ vaga — STF Penha massacre — Ápice ACS Pref Boa Vista 2025 tec 3951867',
    meta: {
      banca: 'Ápice',
      prova: 'ACS (Pref Boa Vista)',
      orgao: 'Pref. Boa Vista (PB)',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o artigo a seguir para responder à questão.\n\nNo período «No trono da justiça, uma cadeira do Supremo Tribunal Federal permanece vazia, e essa vacância ecoa o anseio profundo de um país por uma mulher negra naquele espaço de poder», o termo em destaque pode ser substituído, sem prejuízo semântico, por:',
    text_fragment:
      'O massacre na Penha obriga o país a escolher — Amarílis Costa (CartaCapital — adaptado)\n\nEnquanto isso, 132 casas amanhecem mais vazias no Complexo da Penha. Moradores transformaram a praça em necrotério improvisado, expondo corpos de jovens. O governo contabiliza sessenta e quatro mortos; a Defensoria fala em cento e trinta e dois.\n\nQuando o governador declara «sucesso» à operação, o verbo refere-se à manutenção da política de extermínio. O Estado antinegro administra a morte e racionaliza a ausência.\n\nNo trono da justiça, uma cadeira do Supremo Tribunal Federal permanece vazia, e essa vacância ecoa o anseio profundo de um país por uma mulher negra naquele espaço de poder. A eleição de 2026 se avizinha com urgência de encarar o projeto em curso.\n\nNo Brasil, o verbo existir se conjuga em sangue. Nós sobreviventes seguiremos tentando reinventar o verbo existir.',
    options: [
      { id: 'A', text: 'esse ministério.', is_correct: false },
      { id: 'B', text: 'essa posse.', is_correct: false },
      { id: 'C', text: 'essa promoção.', is_correct: false },
      { id: 'D', text: 'essa organização.', is_correct: false },
      { id: 'E', text: 'essa vaga.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacância',
        chip_label: 'STF',
        meta: slideMeta,
        items: [
          { label: 'Vacância', detail: 'Cadeira vazia no STF — lugar não ocupado.', icon: 'Armchair' },
          { label: 'Vaga', detail: 'Posição disponível — equivalência.', icon: 'CircleDot' },
          { label: 'Supremo', detail: 'Tribunal Federal — trono da justiça.', icon: 'Landmark' },
          { label: 'Penha', detail: 'Massacre — contexto do artigo CartaCapital.', icon: 'MapPin' },
          { label: 'Mulher negra', detail: 'Anseio de representatividade no STF.', icon: 'Users' },
          { label: 'Pergunta-teste', detail: 'Indica lugar vazio ou posse?', icon: 'Eye' },
          { label: 'Pegadinha', detail: 'Trocar por posse ou promoção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vacância ≈ vaga — cadeira não preenchida no STF.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Artigo Penha: crítica à necropolítica e ao STF com cadeira vazia.',
          '«Vacância» = estado de vago — ministro não nomeado.',
          'A «ministério»: cargo já existe — não é vazio — eliminar.',
          'B «posse»: ato de tomar cargo — não é vaga — eliminar.',
          'C «promoção»: ascensão — sentido distinto — eliminar.',
          'D «organização»: instituição — não cobre vazio — eliminar.',
          'E «vaga»: lugar disponível — equivalência — manter.',
          'Gabarito E.',
          'Em similares: vacância ≈ vaga — prove em cargo não ocupado.',
        ],
        footer_rule: 'Gabarito E — vacância equivale a vaga.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VACÂNCIA × VAGA',
        rows: [
          { label: 'Vacância', value: 'Estado de vago — cadeira sem ocupante.' },
          { label: 'Vaga', value: 'Sinônimo — posição disponível.' },
          { label: 'Posse', value: 'Ato de assumir — não é sinônimo.' },
          { label: 'Nesta questão', value: 'E — essa vaga.' },
        ],
        footer_rule: 'Posse/promoção ≠ vacância.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cargo vazio × assumir cargo',
        items: [
          { label: 'A — ministério', detail: 'Cargo de ministro.', correct: 'Sinônimo no contexto: «ministério» é o cargo — não o estado de vazio.' },
          { label: 'B — posse', detail: 'Cerimônia de assumir.', correct: 'Sinônimo no contexto: «posse» indica ato — não «vacância» (vazio).' },
          { label: 'C — promoção', detail: 'Ascensão hierárquica.', correct: 'Sinônimo no contexto: «promoção» não substitui estado de vaga.' },
          { label: 'D — organização', detail: 'Instituição, estrutura.', correct: 'Sinônimo no contexto: «organização» não cobre cadeira vazia.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «A vacância no tribunal aguarda indicação.»',
            correct: 'Sinônimo no contexto: «vaga» — lugar não preenchido.',
          },
        ],
        footer_rule: 'Gabarito E — vaga no artigo Penha/STF.',
      },
    ],
  },

  'fgv-ass-ts-p-sinonimos-assinale-a-afirmativa-que-apresenta-3587479': {
    family: 'conceito',
    source_tec_id: '3587479',
    source_note:
      'parônimos precedente/procedente — FGV Ass TS Pref SJC Enfermagem 2025 tec 3587479',
    meta: {
      banca: 'FGV',
      prova: 'Ass TS (Pref SJC)',
      orgao: 'Pref. SJC',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a afirmativa que apresenta o uso de parônimos.',
    options: [
      { id: 'A', text: 'O desgosto do suor traz o prazer da recompensa.', is_correct: false },
      { id: 'B', text: 'O estudo precedente carrega o argumento procedente.', is_correct: true },
      { id: 'C', text: 'O veículo mais sonhado, pelos clientes, é o carro.', is_correct: false },
      { id: 'D', text: 'O conserto de minha máquina fotográfica será para registrar o concerto no Teatro Municipal.', is_correct: false },
      { id: 'E', text: 'Mudar as leis faz modificar, também, a sociedade.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parônimos',
        chip_label: 'Forma × sentido',
        meta: slideMeta,
        items: [
          { label: 'Parônimos', detail: 'Palavras parecidas, sentidos diferentes.', icon: 'Copy' },
          { label: 'Precedente', detail: 'Anterior, que vem antes.', icon: 'ArrowLeft' },
          { label: 'Procedente', detail: 'Adequado, bem fundamentado.', icon: 'CheckCircle' },
          { label: 'Homônimos', detail: 'Mesma forma, origens distintas — D.', icon: 'Split' },
          { label: 'Sinônimos', detail: 'Mesmo sentido — E (mudar/modificar).', icon: 'Equal' },
          { label: 'Pergunta-teste', detail: 'Formas parecidas, sentidos distintos?', icon: 'Eye' },
        ],
        footer_rule: 'Parônimos: precedente × procedente — forma próxima.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pedido: afirmativa com parônimos — não sinônimos nem homônimos.',
          'A «desgosto/prazer»: antônimos — eliminar.',
          'B «precedente/procedente»: formas parecidas, sentidos distintos — parônimos — manter.',
          'C «veículo/carro»: hipônimo — eliminar.',
          'D «conserto/concerto»: homônimos homógrafos — eliminar.',
          'E «mudar/modificar»: sinônimos — eliminar.',
          'Gabarito B.',
          'Em similares: parônimo = forma similar, sentido diferente (não homônimo puro).',
        ],
        footer_rule: 'Gabarito B — precedente e procedente são parônimos.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARÔNIMOS — DECORE',
        rows: [
          { label: 'Parônimos', value: 'Forma parecida, sentido diferente.' },
          { label: 'Precedente', value: 'Anterior no tempo.' },
          { label: 'Procedente', value: 'Fundamentado, adequado.' },
          { label: 'Homônimos', value: 'Conserto/concerto — forma igual.' },
          { label: 'Nesta questão', value: 'B — parônimos.' },
        ],
        footer_rule: 'Não confundir parônimo com homônimo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parônimo × homônimo × sinônimo',
        items: [
          { label: 'A — desgosto/prazer', detail: 'Sentidos opostos.', correct: 'Antônimo no contexto: «desgosto» e «prazer» são antônimos — não parônimos.' },
          { label: 'C — veículo/carro', detail: 'Gênero e espécie.', correct: 'Sinônimo no contexto: «carro» é tipo de «veículo» — relação hiperônimo.' },
          { label: 'D — conserto/concerto', detail: 'Mesma grafia, origens distintas.', correct: 'Polissemia: «conserto/concerto» são homônimos — não parônimos (forma idêntica).' },
          { label: 'E — mudar/modificar', detail: 'Mesmo sentido.', correct: 'Sinônimo no contexto: «mudar» e «modificar» equivalem — não parônimos.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Eminente médico de mérito eminente.»',
            correct: 'Parônimo no contexto: «eminente» (ilustre) × «iminente» (próximo) — forma próxima.',
          },
        ],
        footer_rule: 'Gabarito B — parônimos precedente/procedente.',
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
