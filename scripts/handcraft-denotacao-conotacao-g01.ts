#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — denotacao-conotacao-g01 (8 slugs · Denotação/conotação · lote 1).
 *
 *   npx tsx scripts/handcraft-denotacao-conotacao-g01.ts
 *   npm run audit:questao-readiness -- --lote=denotacao-conotacao-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=denotacao-conotacao-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteCatalogPath, loteDir, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'denotacao-conotacao-g01';
const SUBTOPICO = 'Denotação, conotação e figuras de linguagem';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_denotacao_conotacao';
const REVIEWED = '2026-07-23';
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
      reviewer: 'handcraft:denotacao-conotacao-g01',
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
  'vunesp-ag-ad-denotacao-leia-o-texto-a-seguir-para-responder-3789297': {
    family: 'text_fragment',
    source_tec_id: '3789297',
    source_note: '«jaz em ruínas» figurado — VUNESP Ag Adm Pref SJRP 2026 tec 3789297 (âncora)',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag Adm (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em «Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas.» (2º parágrafo), a expressão destacada apresenta',
    text_fragment:
      'Acreditou-se por muito tempo que, deixando-se de lado a Revolução Industrial, a produção de bens de consumo nunca aumentou de forma tão rápida e robusta quanto por obra da invenção da agricultura. […] Essas eram as visões que prevaleciam até recentemente. Hoje, essa reconstrução simples e grandiosa da história humana jaz em ruínas. Pesquisas entre os povos sem agricultura demonstram que a maior parte deles leva uma vida confortável. (Claude Lévi-Strauss. Somos todos canibais, 2022. Adaptado)',
    options: [
      { id: 'A', text: 'sentido figurado e significa "foi abandonada".', is_correct: true },
      { id: 'B', text: 'sentido próprio e significa "foi adotada".', is_correct: false },
      { id: 'C', text: 'sentido próprio e significa "foi enterrada".', is_correct: false },
      { id: 'D', text: 'sentido figurado e significa "foi reconhecida".', is_correct: false },
      { id: 'E', text: 'sentido figurado e significa "foi comprovada".', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lente literal × figurado',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Denotação', detail: 'Dicionário: ruína = escombros, destroço físico.', icon: 'BookOpen' },
          { label: 'Conotação', detail: 'Efeito no texto: valor, emoção, imagem transferida.', icon: 'Sparkles' },
          { label: 'Pergunta-teste', detail: 'Literal ou figurado? Qual efeito a banca quer?', icon: 'Eye' },
          { label: 'Agricultura', detail: 'Revolução Industrial × invenção agrícola — eixo do 1º parágrafo.', icon: 'Wheat' },
          { label: 'Reconstrução', detail: '«Reconstrução… da história humana» — alvo de «jaz em ruínas».', icon: 'History' },
          { label: 'Metáfora', detail: '«Jaz em ruínas» — teoria desmoronou, não prédio.', icon: 'Layers' },
          { label: 'Pegadinha', detail: 'Literalizar metáfora — achar que «ruínas» é prédio caído.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sem lente dupla, a banca troca próprio por figurado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Duas camadas → letras',
        meta: slideMeta,
        steps: [
          'Texto Lévi-Strauss: agricultura, Revolução Industrial, produção de consumo, reconstrução da história.',
          'Trecho: «jaz em ruínas» — ideia de teoria histórica, não prédio.',
          'Dicionário: ruína = destroço material. No texto: teoria desmoronou.',
          'Figurado: transferência de sentido — abandonada, em desuso.',
          'B «próprio + adotada»: literaliza demais — eliminar.',
          'C «próprio + enterrada»: sepultamento físico — eliminar.',
          'D «figurado + reconhecida»: tipo certo, efeito errado — eliminar.',
          'E «figurado + comprovada»: inverte o tom — texto derruba a teoria — eliminar.',
          'A: figurado + «foi abandonada» — alinha com o contexto do parágrafo.',
          'Gabarito A. Em similares: pergunte «no dicionário» vs «no efeito do autor».',
        ],
        footer_rule: 'Tap = mudar de lente, não decorar lista.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore de bolso',
        meta: slideMeta,
        content: 'LITERAL × FIGURADO',
        rows: [
          { label: 'Denotação', value: 'Sentido de dicionário — neutro, objetivo.' },
          { label: 'Conotação', value: 'Carga emotiva ou social — autor + contexto.' },
          { label: 'Metáfora', value: 'Substituição sem «como» — ruínas = abandono.' },
          { label: 'Pegadinha', value: 'Marcar «próprio» onde há imagem transferida.' },
          { label: 'Nesta questão', value: 'A: figurado — reconstrução «jaz em ruínas» = abandonada.' },
          { label: 'Contexto', value: 'Lévi-Strauss — agricultura, produção, povos sem agricultura.' },
        ],
        footer_rule: 'Literal no dicionário ≠ literal no enunciado da banca.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada letra erra a lente ou o efeito',
        items: [
          { label: 'B — próprio + adotada', detail: 'Trata a metáfora como adoção literal da teoria.', correct: 'Sentido figurado: a teoria não foi «adotada» — caiu em desuso.' },
          { label: 'C — próprio + enterrada', detail: 'Literaliza «ruínas» como sepultamento físico.', correct: 'Sentido figurado: não é enterro — é abandono da reconstrução.' },
          { label: 'D — figurado + reconhecida', detail: 'Acerta o tipo, erra o efeito (contexto nega validação).', correct: 'Figurado sim, mas significa desacreditar — não reconhecer.' },
          { label: 'E — figurado + comprovada', detail: 'Inverte o tom: o texto derruba a teoria.', correct: 'Figurado sim, mas efeito = abandono — não comprovação.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «O tempo voa quando estamos felizes.»',
            correct: 'Sentido figurado: «voar» transfere rapidez — tempo não tem asas.',
          },
        ],
        footer_rule: 'A sobrou: figurado + abandono da teoria.',
      },
    ],
  },

  'vunesp-ag-cs-denotacao-leia-o-trecho-a-seguir-da-cronica-de-3799250': {
    family: 'text_fragment',
    source_tec_id: '3799250',
    source_note: 'Nelson Rodrigues «Rigoletto» — palavra em sentido próprio — VUNESP Ag CS Pref SJRP 2026 tec 3799250',
    meta: {
      banca: 'VUNESP',
      prova: 'Ag CS (Pref SJRP)',
      orgao: 'Pref. São José do Rio Preto',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o trecho a seguir, da crônica de Nelson Rodrigues, para responder à questão.\n\nInefável: indescritível; encantadora\nPusilanimidade: medo, covardia\nDeslavada: descarada\n\nA passagem do texto em que a palavra destacada está empregada em sentido próprio é:',
    text_fragment:
      '<p>Ontem, presenciei uma cena que me pareceu, salvo engano, uma pequena, incisiva e inefável lição de vida. […] Os homens estacam para o surdo escoamento dos veículos. E, <strong>súbito</strong>, uma voz gaiata anuncia: — «Olha o rapa!». […] Todos se arremessaram: […] O medo é um grande e eficaz nivelador. Sob o estímulo da pusilanimidade, <strong>tubarões</strong> e pés-rapados largam a mesma <strong>baba</strong>, elástica e bovina. […] Imediatamente as caras começaram a <strong>resplandecer</strong>, já <strong>lavadas</strong> do medo, numa cínica, numa deslavada euforia. (Nelson Rodrigues, «Rigoletto de lança-perfume». Adaptado)</p>',
    options: [
      { id: 'A', text: '...tubarões e pés-rapados largam a mesma baba, elástica e bovina.', is_correct: false },
      { id: 'B', text: 'Os homens estacam para o surdo escoamento dos veículos.', is_correct: false },
      { id: 'C', text: 'O que houve a seguir foi um desses espasmos coletivos...', is_correct: false },
      { id: 'D', text: 'Imediatamente as caras começaram a resplandecer, já lavadas do medo...', is_correct: false },
      { id: 'E', text: 'E, súbito, uma voz gaiata anuncia...', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lente literal × figurado',
        chip_label: 'Pergunta-teste',
        meta: slideMeta,
        items: [
          { label: 'Sentido próprio', detail: 'Uso objetivo — dicionário, sem transferência.', icon: 'BookOpen' },
          { label: 'Sentido figurado', detail: 'Metáfora, hipérbole, personificação no contexto.', icon: 'Sparkles' },
          { label: 'Pergunta-teste', detail: 'Qual palavra destacada é literal no trecho?', icon: 'Eye' },
          { label: 'Crônica NR', detail: 'Linguagem imagética — tubarões, baba, lavadas do medo.', icon: 'PenLine' },
          { label: 'Pegadinha', detail: 'Confundir adjetivo poético com sentido denotativo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Localize o destaque — depois aplique a lente.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Destaque → lente → letras',
        meta: slideMeta,
        steps: [
          'Comando: passagem em que a palavra destacada está em sentido próprio.',
          'A «baba»: metáfora do medo animalizado — não saliva literal de tubarão — eliminar.',
          'B «surdo escoamento»: personificação — fluxo «surdo» ao ruído — figurado — eliminar.',
          'C «espasmos coletivos»: imagem de reação descontrolada — figurado — eliminar.',
          'D «resplandecer / lavadas do medo»: metáfora visual do alívio — figurado — eliminar.',
          'E «súbito»: advérbio de tempo — de repente, sem transferência de sentido.',
          'Gabarito E — única passagem com destaque em sentido próprio.',
          'Em similares: advérbio de tempo/causalidade costuma ser denotativo.',
        ],
        footer_rule: 'Súbito = de repente — lente literal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LITERAL × FIGURADO',
        rows: [
          { label: 'Pergunta-teste', value: 'Literal ou figurado no contexto do autor?' },
          { label: 'Próprio', value: 'Dicionário — súbito = de repente.' },
          { label: 'Figurado', value: 'Baba, surdo, lavadas — imagem transferida.' },
          { label: 'Crônica', value: 'Nelson Rodrigues — hiperbólico, mas um destaque é literal.' },
          { label: 'Nesta questão', value: 'E — «súbito» em sentido próprio.' },
        ],
        footer_rule: 'Nem todo adjetivo é figurado — teste o destaque.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Figurado nas outras letras',
        items: [
          { label: 'A — baba', detail: 'Imagem grotesca do medo coletivo.', correct: 'Sentido figurado: «baba» não é saliva literal de tubarão.' },
          { label: 'B — surdo', detail: 'Escoamento incapaz de «ouvir» o trânsito.', correct: 'Sentido figurado: personificação do fluxo de veículos.' },
          { label: 'C — espasmos', detail: 'Reação humana comparada a convulsão.', correct: 'Sentido figurado: metáfora do pânico coletivo.' },
          { label: 'D — lavadas', detail: 'Rosto «limpo» da emoção como roupa.', correct: 'Sentido figurado: metáfora visual do alívio pós-medo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Os homens estacam para o surdo escoamento dos veículos.»',
            correct: 'Sentido figurado: «surdo» transfere insensibilidade ao ruído — não surdez literal.',
          },
        ],
        footer_rule: 'E: súbito — advérbio literal de tempo.',
      },
    ],
  },

  'avancasp-esc-denotacao-assinale-a-alternativa-em-que-a-pala-3826734': {
    family: 'conceito',
    source_tec_id: '3826734',
    source_note: '«ar» sentido próprio Física — AVANÇASP Esc Pref Vinhedo 2026 tec 3826734',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Esc (Pref Vinhedo)',
      orgao: 'Pref. Vinhedo',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction: 'Assinale a alternativa em que a palavra "ar" está sendo empregada em seu sentido próprio, real.',
    options: [
      { id: 'A', text: 'Você acabou entrando na sala com um ar de superioridade.', is_correct: false },
      { id: 'B', text: 'Quero viajar para uma cidade do litoral para renovar o meu ar de angústia.', is_correct: false },
      { id: 'C', text: 'A dinâmica dos fluidos como o ar é muito bem descrita pela Física.', is_correct: true },
      { id: 'D', text: 'Ela está com um ar de quem comeu e não gostou.', is_correct: false },
      { id: 'E', text: 'As palavras dele ficaram no ar de tão sem sentido que eram.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ar: gás ou expressão?',
        chip_label: 'Polissemia',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Ar» = gás da atmosfera ou «jeito/expressão»?', icon: 'Eye' },
          { label: 'Sentido próprio', detail: 'Substância gasosa — objeto da Física.', icon: 'Wind' },
          { label: 'Sentido figurado', detail: '«Ar de superioridade» = aparência, atitude.', icon: 'User' },
          { label: '«No ar»', detail: 'Expressão fixa — suspensão, indefinição.', icon: 'Cloud' },
          { label: 'Pegadinha', detail: 'Confundir locução «ar de» com gás atmosférico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Contexto científico = ar literal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: «ar» em sentido próprio, real.',
          'A «ar de superioridade»: expressão = jeito, postura — figurado — eliminar.',
          'B «ar de angústia»: estado emocional personificado — figurado — eliminar.',
          'C «fluidos como o ar»: gás atmosférico — objeto da Física — próprio.',
          'D «ar de quem comeu»: aparência facial — figurado — eliminar.',
          'E «ficaram no ar»: locução = indefinição — figurado — eliminar.',
          'Gabarito C.',
          'Em similares: ciência/natureza costuma ancorar sentido denotativo.',
        ],
        footer_rule: 'Física + fluidos = ar literal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AR — DUAS LENTES',
        rows: [
          { label: 'Próprio', value: 'Gás da atmosfera — matéria, Física.' },
          { label: 'Figurado', value: '«Ar de» = aparência, jeito, atitude.' },
          { label: '«No ar»', value: 'Locução — indefinição (figurado).' },
          { label: 'Pergunta-teste', value: 'Fala de substância ou de expressão?' },
          { label: 'Nesta questão', value: 'C — ar como fluido físico.' },
        ],
        footer_rule: 'Disciplina do enunciado guia a lente.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: '«Ar de» em todas as outras',
        items: [
          { label: 'A — superioridade', detail: 'Postura arrogante, não gás.', correct: 'Sentido figurado: «ar de» = aparência, atitude.' },
          { label: 'B — angústia', detail: 'Estado emocional como «ar».', correct: 'Sentido figurado: metáfora do humor.' },
          { label: 'D — quem comeu', detail: 'Expressão facial, não atmosfera.', correct: 'Sentido figurado: «ar de» = semblante.' },
          { label: 'E — no ar', detail: 'Palavras sem conclusão.', correct: 'Sentido figurado: locução = indefinição.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Abra a janela para renovar o ar do quarto.»',
            correct: 'Sentido literal: «ar» = gás que circula no ambiente — não «jeito».',
          },
        ],
        footer_rule: 'Só C: ar = matéria.',
      },
    ],
  },

  'avancasp-tec-denotacao-15-07-2026-19-38-29-98-263-264-assin-3835992': {
    family: 'conceito',
    source_tec_id: '3835992',
    source_note: 'Chuva de pétalas figurado — AVANÇASP Tec Enf Pref Estiva Gerbi 2026 tec 3835992',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Tec Enf (Pref Estiva Gerbi)',
      orgao: 'Pref. Estiva Gerbi',
      ano: '2026',
      cargo_header: 'TÉCNICO DE ENFERMAGEM',
    },
    instruction:
      'Assinale a alternativa cuja palavra destacada está empregada em sentido figurado:',
    options: [
      { id: 'A', text: 'Terminado o casamento, houve uma chuva de pétalas de rosas sobre os noivos.', is_correct: true },
      { id: 'B', text: 'As nuvens escuras no céu são um indício de chuva.', is_correct: false },
      { id: 'C', text: 'Tive que fazer cópias da chave de casa para entregar a algumas pessoas de confiança.', is_correct: false },
      { id: 'D', text: 'A chave do cofre se perdeu em meio à bagunça da gaveta do armário.', is_correct: false },
      { id: 'E', text: 'Gosto de escrever e de desenhar em papel colorido, para dar destaque aos trabalhos.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Chuva literal ou imagem?',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: '«Chuva» = precipitação ou abundância figurada?', icon: 'Eye' },
          { label: 'Figurado A', detail: '«Chuva de pétalas» — volume intenso, imagem poética.', icon: 'Flower' },
          { label: 'Literal B', detail: 'Chuva meteorológica — água das nuvens.', icon: 'CloudRain' },
          { label: 'Outras letras', detail: 'Chave/papel — uso denotativo, sem figura.', icon: 'Key' },
          { label: 'Pegadinha', detail: 'Achar que pétalas físicas = sempre literal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Abundância comparada a chuva = figurado.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: palavra destacada em sentido figurado.',
          'A «chuva de pétalas»: abundância de pétalas comparada a precipitação — metáfora/hipérbole.',
          'B «indício de chuva»: precipitação atmosférica — sentido próprio — eliminar.',
          'C «chave de casa»: objeto metálico — literal — eliminar.',
          'D «chave do cofre»: objeto — literal — eliminar.',
          'E «papel colorido»: material — literal — eliminar.',
          'Gabarito A — «chuva» transferida para volume de pétalas.',
          'Em similares: substantivo de natureza + outro domínio = figura.',
        ],
        footer_rule: 'Chuva de X = imagem, não tempo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHUVA — LENTE',
        rows: [
          { label: 'Literal', value: 'Precipitação de água — meteorologia.' },
          { label: 'Figurado', value: '«Chuva de» = grande quantidade que «cai».' },
          { label: 'Pergunta-teste', value: 'Fala do tempo ou de abundância?' },
          { label: 'Nesta questão', value: 'A — chuva de pétalas (figurado).' },
        ],
        footer_rule: 'Chuva de pétalas ≠ previsão do tempo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Uso literal nas demais',
        items: [
          { label: 'B — chuva', detail: 'Nuvens escuras anunciam precipitação real.', correct: 'Sentido literal: chuva = água da atmosfera.' },
          { label: 'C — chave', detail: 'Objeto para abrir porta.', correct: 'Sentido literal: chave metálica de casa.' },
          { label: 'D — chave', detail: 'Objeto perdido na gaveta.', correct: 'Sentido literal: chave do cofre.' },
          { label: 'E — papel', detail: 'Material para escrever/desenhar.', correct: 'Sentido literal: suporte físico.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Houve uma chuva de abraços na despedida.»',
            correct: 'Sentido figurado: «chuva» transfere abundância — não precipitação.',
          },
        ],
        footer_rule: 'A: chuva figurada de pétalas.',
      },
    ],
  },

  'cpcon-uepb-a-denotacao-leia-o-texto-i-para-responder-a-ques-3836440': {
    family: 'text_fragment',
    source_tec_id: '3836440',
    source_note: 'VF «sob o pano da positividade» — CPCON UEPB ACS Pref Condado 2026 tec 3836440',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'ACS (Pref Condado (PB))',
      orgao: 'Pref Condado (PB)',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Leia o Texto I para responder à questão.\n\nAnalise as afirmativas sobre o texto:\n\nI — A expressão «sob o pano da positividade» tem sentido conotativo, pois «pano» sugere algo que encobre ou dissimula a realidade.\nII — O texto critica a máscara de positividade que esconde a exaustão da sociedade do cansaço.\nIII — Há ironia na valorização da positividade como fator de adoecimento.\nIV — O uso do termo «positividade» está em sentido denotativo, correspondendo apenas à ideia literal de ter pensamentos bons e atitudes alegres.\nV — O recurso estilístico presente é a metonímia, já que há substituição de um termo por outro com base em relação de causa e efeito.\n\nÉ CORRETO o que se afirma apenas em:',
    text_fragment:
      'Texto I — A sociedade do cansaço é cada vez mais realidade. Como se blindar? (Wanessa Ferrari, 2021 — adaptado)\n\n«Já amanheci cansada.» O meme resume a exaustão adulta. De acordo com Byung-Chul Han, vivemos na sociedade do cansaço, que naturalizou a cobrança excessiva por produtividade, alta performance e resultados — tudo isso sob o pano da positividade. Com tanta pressão, saúde física e mental pedem a conta. [...]',
    figure_policy: 'transcribed',
    options: [
      { id: 'A', text: 'I, II e III.', is_correct: true },
      { id: 'B', text: 'I e IV.', is_correct: false },
      { id: 'C', text: 'II, IV e V.', is_correct: false },
      { id: 'D', text: 'II e III.', is_correct: false },
      { id: 'E', text: 'V.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pano que encobre',
        chip_label: 'Conotação + ironia',
        meta: slideMeta,
        items: [
          { label: 'Han / cansaço', detail: 'Byung-Chul Han — produtividade sob pano da positividade.', icon: 'Brain' },
          { label: 'Wanessa Ferrari', detail: 'Texto I — meme «Já amanheci cansada» e exaustão.', icon: 'FileText' },
          { label: 'I — conotativo', detail: '«Pano» encobre — imagem, não tecido literal.', icon: 'Layers' },
          { label: 'II — crítica', detail: 'Positividade mascara exaustão — leitura do texto.', icon: 'MessageSquare' },
          { label: 'III — ironia', detail: 'Positividade que adoecimento — tom crítico.', icon: 'Smile' },
          { label: 'IV — falso', detail: '«Positividade» aqui é conotativa, não dicionário neutro.', icon: 'XCircle' },
          { label: 'V — falso', detail: '«Pano» é metáfora, não metonímia causa-efeito.', icon: 'Ban' },
        ],
        footer_rule: 'I + II + III = gabarito A.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto I: sociedade do cansaço, Wanessa Ferrari, meme «Já amanheci cansada», Byung-Chul Han, pano da positividade.',
          'I VERDADEIRA: «pano» encobre — conotação, não tecido.',
          'II VERDADEIRA: crítica à máscara de positividade sobre exaustão.',
          'III VERDADEIRA: ironia — positividade ligada ao adoecimento.',
          'IV FALSA: «positividade» não é uso denotativo neutro no contexto.',
          'V FALSA: figura é metáfora (pano que encobre), não metonímia.',
          'Combinação correta: I, II e III — letra A.',
          'Gabarito A. Em similares: teste cada item antes de cruzar letras.',
        ],
        footer_rule: 'Só A fecha I+II+III verdadeiras.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VF — SENTIDO',
        rows: [
          { label: 'I', value: 'Conotativo — pano encobre (metáfora).' },
          { label: 'II', value: 'Crítica — positividade mascara cansaço.' },
          { label: 'III', value: 'Ironia — positividade → adoecimento.' },
          { label: 'IV', value: 'FALSO — positividade não é denotativa aqui.' },
          { label: 'V', value: 'FALSO — metáfora, não metonímia.' },
          { label: 'Nesta questão', value: 'A — I, II e III.' },
        ],
        footer_rule: 'Metáfora ≠ metonímia — não troque figuras.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Itens falsos e combinações erradas',
        items: [
          { label: 'B — I e IV', detail: 'Mantém IV verdadeira — impossível.', correct: 'IV é falsa — combinação B não fecha.' },
          { label: 'C — II, IV e V', detail: 'Inclui IV falsa e V falsa junto com II.', correct: 'IV e V são falsas — eliminar C.' },
          { label: 'D — só II e III', detail: 'Esquece I, que também é verdadeira.', correct: 'I é verdadeira — falta na combinação D.' },
          { label: 'E — só V', detail: 'V isolada: metonímia onde há metáfora do pano.', correct: 'V é falsa — metáfora, não metonímia.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ela escondeu a tristeza sob o pano do sorriso.»',
            correct: 'Sentido figurado: «pano» transfere disfarce — não tecido literal.',
          },
        ],
        footer_rule: 'A: I, II e III corretas.',
      },
    ],
  },

  'avancasp-aoe-denotacao-assinale-a-alternativa-em-que-a-muda-3886650': {
    family: 'conceito',
    source_tec_id: '3886650',
    source_note: 'Ordem adjetivo grande jogador — AVANÇASP AOE Pref Jeriquara 2026 tec 3886650',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AOE (Pref Jeriquara)',
      orgao: 'Pref. Jeriquara',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Assinale a alternativa em que a mudança de ordem entre as palavras destacadas, apresentada entre parênteses, altera o significado básico da expressão.',
    options: [
      { id: 'A', text: 'Tenho que lhe repassar uma notícia importante ainda hoje. (importante notícia)', is_correct: false },
      { id: 'B', text: 'Dom Quixote tinha ao seu lado um fiel escudeiro, Sancho Pança. (escudeiro fiel)', is_correct: false },
      { id: 'C', text: 'Ouvi um longo sermão da minha mãe quando me atrasei. (sermão longo)', is_correct: false },
      { id: 'D', text: 'A jovem atriz desempenhou um importante papel na novela. (papel importante)', is_correct: false },
      {
        id: 'E',
        text: 'Todos esperavam conhecer pessoalmente o grande jogador de basquete. (jogador grande)',
        is_correct: true,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ordem do adjetivo',
        chip_label: 'Semântica',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Trocar ordem muda o sentido básico?', icon: 'Eye' },
          { label: 'Grande jogador', detail: 'Famoso, habilidoso — qualidade subjetiva.', icon: 'Trophy' },
          { label: 'Jogador grande', detail: 'Porte físico — altura/tamanho.', icon: 'Ruler' },
          { label: 'Outras letras', detail: 'Inversão não altera sentido essencial.', icon: 'Check' },
          { label: 'Pegadinha', detail: 'Achar que toda inversão muda significado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Posição do adjetivo pode mudar a leitura.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: inversão entre parênteses altera significado básico.',
          'A «importante notícia»: mesma ideia — adjetivo classificativo — eliminar.',
          'B «escudeiro fiel»: lealdade mantida — ordem livre — eliminar.',
          'C «sermão longo»: duração — inversão equivalente — eliminar.',
          'D «papel importante»: relevância — inversão não muda núcleo — eliminar.',
          'E «grande jogador» → «jogador grande»: fama × tamanho físico — muda sentido.',
          'Gabarito E.',
          'Em similares: adjetivo subjetivo antes/depois do nome pode bifurcar sentido.',
        ],
        footer_rule: 'Grande jogador ≠ jogador grande.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJ — POSIÇÃO',
        rows: [
          { label: 'Anteposto', value: 'Pode carregar valor subjetivo (grande = famoso).' },
          { label: 'Posposto', value: 'Pode indicar trait objetivo (grande = alto).' },
          { label: 'Pergunta-teste', value: 'A inversão muda qualidade ou só ordem?' },
          { label: 'Nesta questão', value: 'E — grande jogador × jogador grande.' },
        ],
        footer_rule: 'Teste as duas ordens em voz alta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Inversões que não mudam sentido',
        items: [
          { label: 'A — notícia', detail: '«Importante» qualifica «notícia» em ambas as ordens.', correct: 'Sentido literal: mesma informação — ordem flexível.' },
          { label: 'B — fiel', detail: 'Lealdade de Sancho Pança inalterada.', correct: 'Sentido literal: «fiel escudeiro» = «escudeiro fiel».' },
          { label: 'C — longo', detail: 'Duração do sermão preservada.', correct: 'Sentido literal: adjetivo de extensão — ordem livre.' },
          { label: 'D — importante', detail: 'Relevância do papel na novela.', correct: 'Sentido literal: classificação — inversão equivalente.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Era um velho amigo da família.» × «Era um amigo velho da família.»',
            correct: 'Sentido figurado: «velho amigo» = antigo; «amigo velho» = idoso — ordem muda leitura.',
          },
        ],
        footer_rule: 'Só E altera significado básico.',
      },
    ],
  },

  'avancasp-aoe-denotacao-o-bom-leitor-deixa-suas-armas-na-ent-3886652': {
    family: 'conceito',
    source_tec_id: '3886652',
    source_note: 'Julián Fuks leitor figurado — AVANÇASP AOE Pref Jeriquara 2026 tec 3886652',
    meta: {
      banca: 'AVANÇASP',
      prova: 'AOE (Pref Jeriquara)',
      orgao: 'Pref. Jeriquara',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«O bom leitor deixa suas armas na entrada, deposita a bagagem num canto, se despe de expectativas, de ilusões, essas suas roupas pré-fabricadas.» (Julián Fuks)\n\nO pensamento acima apresenta:',
    options: [
      { id: 'A', text: 'as ações de um guerreiro, no sentido próprio das palavras.', is_correct: false },
      { id: 'B', text: 'as posturas de um leitor, utilizando o sentido próprio das palavras.', is_correct: false },
      { id: 'C', text: 'as posturas de um leitor, utilizando o sentido figurado das palavras.', is_correct: true },
      { id: 'D', text: 'as ações de um viajante, no sentido próprio das palavras.', is_correct: false },
      { id: 'E', text: 'as características das roupas de um leitor, utilizando o sentido figurado das palavras.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leitor ou soldado?',
        chip_label: 'Metáfora',
        meta: slideMeta,
        items: [
          { label: 'Pergunta-teste', detail: 'Fala de leitura ou de combate literal?', icon: 'Eye' },
          { label: 'Armas / bagagem', detail: 'Metáfora — preconceitos e expectativas.', icon: 'Shield' },
          { label: 'Roupas pré-fabricadas', detail: 'Ilusões prontas — figurado.', icon: 'Shirt' },
          { label: 'Leitor', detail: 'Sujeito real — atitude diante do texto.', icon: 'BookOpen' },
          { label: 'Pegadinha', detail: 'Literalizar armas e roupas no sentido militar.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Metáfora do leitor — não cena de guerra.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citação Fuks: leitor «deixa armas», «bagagem», «roupas» — leitura como experiência.',
          'Não é guerreiro nem viajante literal — imagem transferida.',
          'A guerreiro próprio: armas reais — não é o tema — eliminar.',
          'B leitor + próprio: armas/bagagem não são literais na citação — eliminar.',
          'D viajante próprio: metáfora, não aeroporto — eliminar.',
          'E roupas figuradas, mas foco errado — não é moda — eliminar.',
          'C posturas de leitor + sentido figurado — armas = preconceitos.',
          'Gabarito C. Em similares: quem é o sujeito real por trás da imagem?',
        ],
        footer_rule: 'Leitor + figurado = C.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'METÁFORA DO LEITOR',
        rows: [
          { label: 'Sujeito', value: 'Leitor — atitude diante do texto.' },
          { label: 'Armas', value: 'Preconceitos — figurado.' },
          { label: 'Bagagem / roupas', value: 'Expectativas e ilusões — figurado.' },
          { label: 'Pergunta-teste', value: 'Literal ou imagem sobre leitura?' },
          { label: 'Nesta questão', value: 'C — posturas de leitor em sentido figurado.' },
        ],
        footer_rule: 'Fuks: metáfora da leitura aberta.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Literalizar a metáfora',
        items: [
          { label: 'A — guerreiro', detail: 'Armas como combate real.', correct: 'Sentido figurado: «armas» = preconceitos do leitor.' },
          { label: 'B — leitor próprio', detail: 'Trata armas/bagagem como objetos físicos.', correct: 'Sentido figurado: metáfora da atitude de leitura.' },
          { label: 'D — viajante', detail: 'Bagagem de aeroporto literal.', correct: 'Sentido figurado: «bagagem» = expectativas levadas ao texto.' },
          { label: 'E — roupas', detail: 'Foco nas vestes, não na postura.', correct: 'Sentido figurado amplo: leitor, não guarda-roupa.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Deposite seus preconceitos na porta da biblioteca.»',
            correct: 'Sentido figurado: «deposite» transfere atitude — não móveis reais.',
          },
        ],
        footer_rule: 'C: leitor em linguagem figurada.',
      },
    ],
  },

  'fcc-tec-denotacao-considere-o-texto-abaixo-para-respon-3908391': {
    family: 'text_fragment',
    source_tec_id: '3908391',
    source_note: 'Eufemismo «indesejável senhora» — FCC Tec SESAPI 2026 tec 3908391',
    meta: {
      banca: 'FCC',
      prova: 'Tec (SESAPI)',
      orgao: 'SESAPI',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Considere o texto abaixo para responder à questão.\n\n[...] Montaigne escreveu há mais de 450 anos: «Que fantasia inútil esperar a morte causada pela perda dos poderes trazida pela idade avançada... Uma vez que essa é a mais rara das mortes... Nós a chamamos de natural, como se fosse contrário à natureza ver um homem quebrar o pescoço numa queda... Morrer em idade avançada é um evento raro, singular e extraordinário, portanto menos natural do que os outros.» [...]\n\nAs pessoas se iludem supondo que [...]\n\nAssinale a alternativa que apresenta o mesmo recurso estilístico empregado no trecho «a mais rara das mortes» (parágrafo 6), ou seja, o eufemismo:',
    text_fragment:
      '<p>Certos medos e angústias não têm relação com a idade e são universais. Anos atrás, eu achava que os 80 anos me encontrariam num estado de serenidade plena. Os medos, a ansiedade, as frustrações e perdas atribuídas ao envelhecimento são universais. Lord Byron escreveu aos 36 anos: «Meus dias estão nas folhas amarelas!» Montaigne escreveu: «Morrer em idade avançada é um evento raro, singular e extraordinário, portanto menos natural do que os outros.» As pessoas se iludem supondo que [...] (Drauzio Varella, adaptado)</p>',
    options: [
      { id: 'A', text: 'É mais difícil lidar com o envelhecimento do que com a morte... (parágrafo 13)', is_correct: false },
      {
        id: 'B',
        text: 'Enquanto não recebo a visita da indesejável senhora, procuro conduzir a minha vida seguindo a filosofia do poeta [...]. (parágrafo 14)',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Assolados por doenças graves, guerras, fome e epidemias, completar 30 anos era privilégio de poucos no tempo das cavernas. (parágrafo 4)',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Morrer em idade avançada é um evento raro, singular e extraordinário, portanto menos natural do que os outros. (parágrafo 6)',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Algumas vezes em resposta às mensagens do corpo: uma flechada no peito, um ranger nos ossos da bacia. (parágrafo 8)',
        is_correct: false,
      },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Eufemismo — suavizar',
        chip_label: 'Figura de linguagem',
        meta: slideMeta,
        items: [
          { label: 'Eufemismo', detail: 'Suavizar tabu da morte — modelo no parágrafo 6.', icon: 'Heart' },
          { label: 'Montaigne', detail: '«A mais rara das mortes» — evita dizer «morte» direto.', icon: 'BookOpen' },
          { label: 'Byron', detail: '«Folhas amarelas» — angústia do envelhecimento no texto.', icon: 'Feather' },
          { label: 'Serenidade', detail: 'Ilusão de paz aos 80 — contradições do envelhecimento.', icon: 'Sun' },
          { label: 'Ansiedade', detail: 'Medos universais — não só da velhice.', icon: 'Activity' },
          { label: 'Drauzio', detail: 'Medos universais, filosofia diante da morte e do tempo.', icon: 'User' },
          { label: 'Paralelo B', detail: '«Indesejável senhora» — filosofia do poeta (par. 14).', icon: 'User' },
          { label: 'Pegadinha', detail: 'Confundir eufemismo com metáfora ou hipérbole.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Suavizar o tabu — mesmo recurso do modelo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto Drauzio Varella: medos universais, envelhecimento, serenidade, ansiedade, Lord Byron, Montaigne.',
          'Comando: mesmo recurso estilístico de «a mais rara das mortes» (parágrafo 6) — eufemismo.',
          'Montaigne: «fantasia inútil», «perda dos poderes», morte «natural» vs extraordinária.',
          'Modelo par. 6: «a mais rara das mortes» — eufemismo (evita «morte»).',
          'A: comparação envelhecimento/morte — não é eufemismo — eliminar.',
          'B «indesejável senhora» (par. 14): personificação suave da morte — paralelo ao modelo.',
          'C: privilégio aos 30 anos no tempo das cavernas — literal — eliminar.',
          'D: citação Montaigne — é o trecho-modelo, não outra alternativa — eliminar.',
          'E «flechada no peito»: metáfora da dor — não eufemismo — eliminar.',
          'Gabarito B.',
          'Em similares: identifique o recurso do modelo antes de buscar paralelo.',
        ],
        footer_rule: 'B = eufemismo paralelo ao trecho-modelo.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EUFEMISMO',
        rows: [
          { label: 'Definição', value: 'Suavizar termo desagradável/tabu.' },
          { label: 'Montaigne', value: '«A mais rara das mortes» — parágrafo 6.' },
          { label: 'Byron', value: '«Folhas amarelas» — angústia universal.' },
          { label: 'Paralelo B', value: '«Indesejável senhora» — morte (par. 14).' },
          { label: 'Filosofia', value: 'Conduzir a vida seguindo o poeta — parágrafo 14.' },
          { label: 'Indesejável', value: '«Indesejável senhora» — eufemismo da morte.' },
          { label: 'Nesta questão', value: 'B — eufemismo paralelo ao parágrafo 6.' },
        ],
        footer_rule: 'Senhora indesejável = morte suavizada.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Outras figuras nas letras',
        items: [
          { label: 'A — envelhecimento', detail: 'Comparação direta de dificuldades com a morte.', correct: 'Não é eufemismo — afirmação comparativa no parágrafo 13.' },
          { label: 'C — cavernas', detail: 'Completar 30 anos era privilégio — tempo das cavernas.', correct: 'Sentido literal: expectativa de vida no passado (par. 4).' },
          { label: 'D — Montaigne', detail: 'Trecho-modelo «morrer em idade avançada» citado no comando.', correct: 'É o exemplo base — não «outra» alternativa com mesmo recurso.' },
          { label: 'E — flechada', detail: '«Flechada no peito» — mensagens do corpo (par. 8).', correct: 'Metáfora da dor — não suaviza morte como eufemismo.' },
          {
            label: 'Transferência',
            detail: 'Classifique: «Ele partiu desta para melhor.»',
            correct: 'Sentido figurado: eufemismo — «partiu» suaviza a morte.',
          },
        ],
        footer_rule: 'B: eufemismo como «rara das mortes».',
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
