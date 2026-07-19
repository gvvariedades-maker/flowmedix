#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g02 (8 slugs · Crase).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g02.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g02 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g02 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';

const LOTE = 'lingua-portuguesa-g02';
const SUBTOPICO = 'Crase';
const TOPICO = 'Língua Portuguesa';
const BRANCH = 'pt_crase';
const REVIEWED = '2026-07-19';

const GOLDEN_REFERENCES = {
  eliminacao: 'examples/questao-premium-vunesp-portugues-crase-funil.json',
  lacunas: 'examples/questao-premium-vunesp-portugues-crase-lacunas-ioga.json',
} as const;

type AnchorStyle = keyof typeof GOLDEN_REFERENCES;

const SLUG_ANCHOR_STYLE: Record<string, AnchorStyle> = {
  'vunesp-jundiai-crase-tira-qual-3776323': 'eliminacao',
  'vunesp-sjrp-crase-lacunas-agricultura-3789364': 'lacunas',
  'vunesp-sjrp-crase-nelson-rodrigues-3799251': 'eliminacao',
  'avancasp-vinhedo-crase-correta-3826747': 'eliminacao',
  'avancasp-potim-crase-premiacao-mundial-3839721': 'eliminacao',
  'vunesp-osasco-crase-ioga-lacunas-3840787': 'lacunas',
  'avancasp-nova-odessa-crase-sacrificios-3962466': 'lacunas',
  'avancasp-jeriquara-crase-facultativo-3886649': 'eliminacao',
};

const PT_CRASE_SOURCE = {
  id: PT_CRASE_CONCURSOS.id,
  tier: 'A' as const,
  issuer: PT_CRASE_CONCURSOS.issuer,
  title: PT_CRASE_CONCURSOS.title,
  year: PT_CRASE_CONCURSOS.year,
  url: PT_CRASE_CONCURSOS.url,
  covers: ['funil 3 testes', 'teste ao', 'locução adverbial feminina', 'horas', 'pronome pessoal'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Family = 'conceito' | 'text_fragment';

type Spec = {
  family: Family;
  anchor_style?: AnchorStyle;
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
  const anchorStyle = spec.anchor_style ?? SLUG_ANCHOR_STYLE[slug] ?? 'eliminacao';
  const goldenReference = GOLDEN_REFERENCES[anchorStyle];
  return {
    ...spec.meta,
    topico: TOPICO,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: spec.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:lingua-portuguesa-g02',
      guideline_snapshot: `${PT_CRASE_CONCURSOS.snapshot} · âncora ${anchorStyle} → ${goldenReference}`,
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [
      PT_CRASE_SOURCE,
      {
        id: `portugues-caderno-tec-${spec.source_tec_id}`,
        tier: 'B' as const,
        issuer: 'AVANT — caderno interno Língua Portuguesa',
        title: spec.source_note,
        year: Number(spec.meta.ano) || 2026,
        covers: ['enunciado', 'alternativas', 'gabarito', `âncora ${anchorStyle}`],
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
  'vunesp-jundiai-crase-tira-qual-3776323': {
    family: 'conceito',
    source_tec_id: '3776323',
    source_note: 'Crase — VUNESP ACS Pref. Jundiaí 2026 (tira)',
    meta: { banca: 'VUNESP', prova: 'ACS (Pref Jundiaí)', orgao: 'Pref. Jundiaí', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa em que o sinal de crase está corretamente empregado na frase adaptada da tira.',
    options: [
      { id: 'A', text: 'Para falar à qualquer pessoa, saiba antes quem ela é.', is_correct: false },
      { id: 'B', text: 'Para falar à uma pessoa, saiba quem ela é.', is_correct: false },
      { id: 'C', text: 'Você sabe à quem está se dirigindo?', is_correct: false },
      { id: 'D', text: 'Você está se dirigindo à mim e sabe quem eu sou?', is_correct: false },
      { id: 'E', text: 'Você conhece a pessoa à qual está se dirigindo?', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crase na tira — eixos da banca',
        meta: slideMeta,
        items: [
          { label: 'À qual', detail: 'Prep. a + pronome relativo feminino (a qual) → crase.', icon: 'Link' },
          { label: 'Pronome pessoal', detail: 'Antes de mim, ti, ele… não há artigo a → sem crase.', icon: 'UserX' },
          { label: 'Qualquer / uma', detail: 'Determinantes que bloqueiam artigo a → sem crase.', icon: 'Ban' },
          { label: 'À quem', detail: 'Pronome relativo — em geral sem crase (não é a+a clássico).', icon: 'HelpCircle' },
          { label: 'Pegadinha', detail: '«À mim» soa formal, mas pronome pessoal barra o funil.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Relativo feminino «a qual» admite crase após prep. a.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Funil letra a letra',
        meta: slideMeta,
        steps: [
          'Comando: única frase com crase correta na norma-padrão.',
          'A: «à qualquer» — determinante bloqueia artigo → sem crase.',
          'B: «à uma» — artigo indefinido feminino não funde assim → incorreto.',
          'C: «à quem» — pronome relativo; crase não se aplica como em «a qual».',
          'D: «à mim» — pronome pessoal (T1/T pronome) → sem crase.',
          'E: «à qual» — prep. a + a qual (feminino) → fusão correta.',
          'Gabarito E — única com crase justificada.',
          'Em similares: «a qual/à qual» sim; «a mim/ti» nunca.',
        ],
        footer_rule: 'Tap = 1 estágio do funil.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'FUNIL: MASC → VERBO → A+A → PRONOME?',
        rows: [
          { label: 'Pronome pessoal', value: 'a mim, a ti, a ele — sem crase' },
          { label: 'Pronome relativo', value: 'a qual / à qual (fem.) — crase possível' },
          { label: 'Determinante', value: 'qualquer, uma, todo — sem crase após a' },
          { label: 'Teste ao', value: 'ao no masc. → à no fem. (quando couber)' },
        ],
        footer_rule: '«À qual» passa; «à mim» não.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o funil barra',
        meta: slideMeta,
        content: 'Crase automática na tira',
        items: [
          { label: 'A — à qualquer', detail: '«À» antes de «qualquer» parece rebuscado.', correct: 'Determinante indefinido — só prep. a, sem fusão.' },
          { label: 'B — à uma', detail: '«À uma pessoa» imita locução culta.', correct: 'Artigo indefinido feminino não recebe crase assim.' },
          { label: 'C — à quem', detail: '«À quem» ecoa pergunta formal.', correct: 'Relativo «quem» não segue regra de «a qual».' },
          { label: 'D — à mim', detail: '«Dirigir-se à mim» é pegadinha clássica.', correct: 'Pronome pessoal — regência com a, sem crase.' },
          { label: 'Em outra banca…', detail: 'Trocam «qual» por lugar ou hora.', correct: 'Funil igual: pronome × relativo × locução.' },
        ],
        footer_rule: 'E: a pessoa à qual está se dirigindo.',
      },
    ],
  },

  'vunesp-sjrp-crase-lacunas-agricultura-3789364': {
    family: 'conceito',
    source_tec_id: '3789364',
    source_note: 'Crase — VUNESP Ag Adm Pref. SJRP 2026 (lacunas)',
    meta: { banca: 'VUNESP', prova: 'Ag Adm (Pref SJRP)', orgao: 'Pref. SJRP', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa que completa, correta e respectivamente, as lacunas do texto.\nHá pessoas que se dedicam ___ investigar os hábitos alimentares de diferentes populações. Sabe-se que existem aquelas que praticam a agricultura e ___ recorrem ___ coleta de plantas selvagens ___ fim de obter alimentos de origem vegetal.',
    options: [
      { id: 'A', text: 'a ... as ... à ... a', is_correct: true },
      { id: 'B', text: 'a ... as ... à ... à', is_correct: false },
      { id: 'C', text: 'a ... às ... a ... a', is_correct: false },
      { id: 'D', text: 'à ... às ... à ... à', is_correct: false },
      { id: 'E', text: 'à ... as ... a ... a', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacunas — 4 decisões de crase',
        meta: slideMeta,
        items: [
          { label: 'Investigar', detail: 'dedicam-se a investigar hábitos — T2 (verbo).', icon: 'Search' },
          { label: 'Agricultura', detail: 'Populações que praticam agricultura — contexto do texto.', icon: 'Sprout' },
          { label: 'As que', detail: 'as que recorrem — artigo + pronome relativo.', icon: 'Layers' },
          { label: 'Coleta', detail: 'recorrem à coleta de plantas selvagens — a+a.', icon: 'Leaf' },
          { label: 'Vegetal', detail: 'alimentos de origem vegetal — fim da cadeia do texto.', icon: 'Apple' },
        ],
        footer_rule: 'Cada lacuna = 1 teste do funil.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Lacuna 1: «dedicam-se ___ investigar hábitos» — T2 (verbo) → a.',
          'Lacuna 2: «agricultura e ___ recorrem» — as que recorrem (populações).',
          'Lacuna 3: «recorrem ___ coleta de plantas selvagens» — a + a coleta → à.',
          'Lacuna 4: «___ fim de obter alimentos vegetais» — locução a fim de → a.',
          'Sequência: a / as / à / a — só a letra A.',
          'Eliminar D e E: crase indevida em «dedicam-se à investigar».',
          'Gabarito A.',
          'Em similares: infinitivo depois de a → nunca crase.',
        ],
        footer_rule: 'Ordem das lacunas guia o funil.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Lacunas de crase',
        meta: slideMeta,
        content: '4 LACUNAS = 4 TESTES',
        rows: [
          { label: 'Verbo', value: 'a + infinitivo — sem crase' },
          { label: 'Relativo', value: 'as que — artigo + pronome relativo' },
          { label: 'Singular fem.', value: 'à + substantivo feminino (a+a)' },
          { label: 'Locução', value: 'a fim de / a pé — sem crase' },
        ],
        footer_rule: 'a … as … à … a',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase onde só há prep. a',
        slide_title: 'Pegadinhas das lacunas',
        items: [
          { label: 'B — crase em «fim»', detail: 'Última lacuna com à parece simétrica.', correct: '«A fim de» é locução fixa — só a.' },
          { label: 'C — às no relativo', detail: 'Troca «as que» por «às».', correct: 'Segunda lacuna: as que recorrem — artigo + relativo.' },
          { label: 'D — à investigar', detail: 'Primeira lacuna com crase «culta».', correct: 'Antes de verbo/infinitivo não há fusão.' },
          { label: 'E — mistura sem regra', detail: 'Crase na abertura sem motivo.', correct: '«Dedicam-se a» — T2 barra à.' },
          { label: 'Em outra banca…', detail: 'Trocam «coleta» por «noite» ou horas.', correct: 'Locução fem. ou às + hora — card à parte.' },
        ],
        footer_rule: 'A = a / as / à / a.',
      },
    ],
  },

  'vunesp-sjrp-crase-nelson-rodrigues-3799251': {
    family: 'text_fragment',
    source_tec_id: '3799251',
    source_note: 'Crase — VUNESP Ag CS Pref. SJRP 2026 (Nelson Rodrigues)',
    meta: { banca: 'VUNESP', prova: 'Ag CS (Pref SJRP)', orgao: 'Pref. SJRP', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'A construção entre parênteses que substitui o trecho destacado, de acordo com a norma-padrão de regência verbal e crase, é:',
    text_fragment:
      '<p>Ontem, presenciei uma cena que me pareceu, salvo engano, uma pequena, incisiva e inefável lição de vida. [...] O <strong>último a recuperar um pouco de harmonia interior</strong> foi um psicanalista célebre.</p><p><em>(Nelson Rodrigues, adaptado)</em></p>',
    options: [
      { id: 'A', text: 'O último a recuperar um pouco de harmonia interior... (voltar à harmonia)', is_correct: true },
      { id: 'B', text: '... o cliente tem que ser, no mínimo, um estabelecimento bancário... (se obriga à uma condição de)', is_correct: false },
      { id: 'C', text: '... só o Tolstoi de Guerra e Paz ousaria descrever. (se atreveria à descrever)', is_correct: false },
      { id: 'D', text: '... tubarões e pés-rapados largam a mesma baba... (soltam à mesma baba)', is_correct: false },
      { id: 'E', text: 'Ontem presenciei uma cena... (assisti à uma cena)', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crase no parêntese',
        meta: slideMeta,
        items: [
          { label: 'Trecho-alvo', detail: '«último a recuperar» — infinitivo sem artigo.', icon: 'Target' },
          { label: 'Substituição A', detail: 'voltar à harmonia — a + a harmonia (fem.).', icon: 'CheckCircle2' },
          { label: 'Verbo no parêntese', detail: '«à descrever» / «à recuperar» — T2 barra.', icon: 'Ban' },
          { label: 'Uma cena', detail: 'Artigo indefinido após à — construção inválida.', icon: 'XCircle' },
          { label: 'Pegadinha', detail: 'Parêntese imita o trecho, mas muda a regência.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Leia o parêntese com o funil completo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Localizar o trecho destacado: «último a recuperar…».',
          'A: «voltar à harmonia» — a + a harmonia → crase correta no parêntese.',
          'B: «à uma condição» — artigo indefinido após à → incorreto.',
          'C: «à descrever» — verbo no parêntese → sem crase.',
          'D: «à mesma baba» — OD sem a+a claro; construção forçada.',
          'E: «à uma cena» — mesma pegadinha de artigo indefinido.',
          'Gabarito A — única substituição normativa.',
          'Em similares: parêntese não copia forma — testa regência+case.',
        ],
        footer_rule: 'Fragmento longo → decisão no parêntese.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Parêntese × funil',
        meta: slideMeta,
        content: 'SUBSTITUIÇÃO = NOVA FRASE',
        rows: [
          { label: 'Infinitivo', value: 'a recuperar / a descrever — sem crase' },
          { label: 'OD feminino', value: 'voltar à harmonia — a+a' },
          { label: 'Uma + fem.', value: 'à uma — em geral incorreto' },
          { label: 'Assisti', value: 'assisti a uma cena — sem crase antes de uma' },
        ],
        footer_rule: 'A: voltar à harmonia.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Parêntese enganoso',
        slide_title: 'Alternativas que imitam o texto',
        items: [
          { label: 'B — à condição', detail: 'Ecoa «estabelecimento bancário» do trecho.', correct: '«À uma condição» — artigo indefinido não funde assim.' },
          { label: 'C — à descrever', detail: 'Paralelismo com «ousaria descrever».', correct: 'Antes de verbo — só prep. a.' },
          { label: 'D — à mesma baba', detail: 'Repete léxico do episódio do medo.', correct: 'OD sem a+a canônico — construção inadequada.' },
          { label: 'E — à uma cena', detail: '«Assisti à» parece regência culta.', correct: 'Correto: assisti a uma cena — sem crase.' },
          { label: 'Em outra banca…', detail: 'Cortam o fragmento e testam só «à noite».', correct: 'Locução adverbial feminina — card separado.' },
        ],
        footer_rule: 'A substitui «a recuperar» por «voltar à harmonia».',
      },
    ],
  },

  'avancasp-vinhedo-crase-correta-3826747': {
    family: 'conceito',
    source_tec_id: '3826747',
    source_note: 'Crase — AVANÇASP Esc Pref. Vinhedo 2026',
    meta: { banca: 'AVANÇASP', prova: 'Esc (Pref Vinhedo)', orgao: 'Pref. Vinhedo', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction: 'Assinale a alternativa que se apresenta totalmente correta em relação à ocorrência ou não de crase.',
    options: [
      { id: 'A', text: 'Estaremos a postos sempre as 22 horas.', is_correct: false },
      { id: 'B', text: 'Você chegou à tempo de nos salvar.', is_correct: false },
      { id: 'C', text: 'Nunca aleguei isso à você.', is_correct: false },
      { id: 'D', text: 'A aula acontecia a medida que chovia.', is_correct: false },
      { id: 'E', text: 'A audiência foi marcada para as 10 horas.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crase × horas × locuções',
        meta: slideMeta,
        items: [
          { label: 'A postos', detail: 'Estaremos a postos — mas hora cheia pede às (não «as»).', icon: 'Clock' },
          { label: 'À tempo', detail: 'Você chegou a tempo de nos salvar — locução masc.', icon: 'Timer' },
          { label: 'A você', detail: 'Nunca aleguei isso a você — pronome sem crase.', icon: 'User' },
          { label: 'À medida', detail: 'A aula acontecia à medida que chovia.', icon: 'TrendingUp' },
          { label: 'Audiência', detail: 'Marcada para as horas — para + artigo, sem crase.', icon: 'Calendar' },
        ],
        footer_rule: 'Preposição muda o teste: para × às.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: única frase totalmente correta na crase.',
          'A: «as horas» em «a postos» — falta crase em hora cheia (use às).',
          'B: «à tempo» de nos salvar — locução masculina → a tempo (sem crase).',
          'C: «à você» — pronome de tratamento → a você.',
          'D: «a medida que chovia» — locução feminina exige à medida que.',
          'E: «audiência marcada para as horas» — prep. para + artigo plural — correto.',
          'Gabarito E.',
          'Em similares: às + hora; para as + hora — sem crase.',
        ],
        footer_rule: 'Para + artigo ≠ às.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Horas e locuções',
        meta: slideMeta,
        content: 'HORAS + LOCUÇÕES',
        rows: [
          { label: 'Hora cheia', value: 'às + hora(s) — com crase' },
          { label: 'Para + hora', value: 'para as horas — sem crase' },
          { label: 'A tempo', value: 'locução masc. — sem crase' },
          { label: 'À medida', value: 'locução fem. — com crase' },
        ],
        footer_rule: 'E: para as horas (sem crase após para).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Quase certo — crase indevida ou ausente',
        slide_title: 'Uma letra por erro',
        items: [
          { label: 'A — as horas', detail: 'Frase com «a postos» mascarando o erro.', correct: 'Correto: às + hora cheia — crase obrigatória.' },
          { label: 'B — à tempo', detail: '«À tempo» de nos salvar parece culto.', correct: 'Locução a tempo — sem crase.' },
          { label: 'C — à você', detail: '«Aleguei à você» imita tratamento formal.', correct: 'Alegar algo a você — sem crase.' },
          { label: 'D — a medida', detail: '«A medida que chovia» omite crase.', correct: 'À medida que — locução feminina com crase.' },
          { label: 'Em outra banca…', detail: 'Misturam desde as 8h com às 8h.', correct: 'Desde + artigo — sem crase; às + hora — com.' },
        ],
        footer_rule: 'Só E passa no funil inteiro.',
      },
    ],
  },

  'avancasp-potim-crase-premiacao-mundial-3839721': {
    family: 'conceito',
    source_tec_id: '3839721',
    source_note: 'Crase — AVANÇASP AAE Pref. Potim 2026 (Premiação Mundial)',
    meta: { banca: 'AVANÇASP', prova: 'AAE (Pref Potim)', orgao: 'Pref. Potim', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction: 'Assinale a alternativa que indica o emprego correto de crase.',
    options: [
      { id: 'A', text: 'Cheguei à pé ao trabalho.', is_correct: false },
      { id: 'B', text: 'O palestrante começou à falar sobre o tema central.', is_correct: false },
      { id: 'C', text: 'O relatório foi entregue à qualquer funcionário do setor.', is_correct: false },
      { id: 'D', text: 'O tempo começou à correr mais depressa.', is_correct: false },
      { id: 'E', text: 'O trabalho dedicado levará os amigos à Premiação Mundial no Japão.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Funil na frase inteira',
        meta: slideMeta,
        items: [
          { label: 'A pé', detail: 'Locução adverbial masculina — sem crase.', icon: 'Footprints' },
          { label: 'À + verbo', detail: 'começou a falar / a correr — T2.', icon: 'Ban' },
          { label: 'À qualquer', detail: 'Determinante masculino/indefinido — sem crase.', icon: 'XCircle' },
          { label: 'À Premiação', detail: 'a + a Premiação (fem.) — destino com artigo.', icon: 'Trophy' },
          { label: 'Pegadinha', detail: 'Crase antes de infinitivo «parece» norma culta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Uma frase certa = funil completo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'A: «à pé» — locução masc. → a pé.',
          'B: «à falar» — verbo → começou a falar.',
          'C: «à qualquer» — determinante → a qualquer.',
          'D: «à correr» — verbo → começou a correr.',
          'E: «à Premiação Mundial» — a + a premiação → crase correta.',
          'Gabarito E.',
          'Em similares: destino feminino com artigo → teste ao.',
        ],
        footer_rule: 'Tap até sobrar E.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: 'MASC → VERBO → A+A',
        rows: [
          { label: 'Locução masc.', value: 'a pé, a bordo — sem crase' },
          { label: 'Verbo', value: 'a falar, a correr — sem crase' },
          { label: 'Qualquer', value: 'a qualquer — sem crase' },
          { label: 'Destino fem.', value: 'à Premiação — a + a' },
        ],
        footer_rule: 'E: levará os amigos à Premiação Mundial.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase automática',
        slide_title: 'Quatro distratores clássicos',
        items: [
          { label: 'A — à pé', detail: '«À pé» imita locução culta de deslocamento.', correct: 'Locução adverbial masculina — a pé.' },
          { label: 'B — à falar', detail: '«Começou à» soa mais formal.', correct: 'Antes de infinitivo — só prep. a.' },
          { label: 'C — à qualquer', detail: 'Crase antes de funcionário atrai.', correct: '«A qualquer funcionário» — sem crase.' },
          { label: 'D — à correr', detail: 'Paralelo errado com «começou a».', correct: 'Verbo no infinitivo — sem fusão.' },
          { label: 'Em outra banca…', detail: 'Trocam Premiação por «noite» ou «escola».', correct: 'Mesmo funil a+a no feminino.' },
        ],
        footer_rule: 'E passa nos 3 testes.',
      },
    ],
  },

  'vunesp-osasco-crase-ioga-lacunas-3840787': {
    family: 'conceito',
    source_tec_id: '3840787',
    source_note: 'Crase lacunas — VUNESP TEnf Pref. Osasco 2026 (ioga) tec 3840787',
    meta: { banca: 'VUNESP', prova: 'TEnf (Pref Osasco)', orgao: 'Pref. Osasco', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Leia o texto a seguir: Quando amigas de Charlotte vão ___ aulas de ioga, proporcionam ___ ela a companhia de que precisa. Alentada por isso, ela ministra suas aulas de segunda ___ sexta-feira, sempre ___ 10h. De acordo com a norma-padrão de regência e emprego do sinal de crase, as lacunas são preenchidas respectivamente por:',
    options: [
      { id: 'A', text: 'às ... a ... a ... às', is_correct: true },
      { id: 'B', text: 'às ... à ... a ... as', is_correct: false },
      { id: 'C', text: 'às ... a ... à ... às', is_correct: false },
      { id: 'D', text: 'as ... a ... à ... as', is_correct: false },
      { id: 'E', text: 'as ... à ... a ... às', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '4 lacunas — um funil por buraco',
        chip_label: 'Funil simples',
        meta: slideMeta,
        items: [
          { label: '1. Olhe o verbo', detail: 'O verbo pede a? Ex.: vão a… / proporcionam a…', icon: 'GitBranch' },
          { label: '2. Pergunte: a + a?', detail: 'Tem prep. a + artigo feminino (a ou as)? Só aí nasce à/às.', icon: 'Filter' },
          { label: 'Lacuna 1 — às aulas', detail: 'a + as aulas → às (plural feminino com artigo).', icon: 'GraduationCap' },
          { label: 'Corte: pronome', detail: 'Antes de ela/mim/ti/você — só a, sem crase.', icon: 'User' },
          { label: 'Corte: intervalo', detail: 'De segunda a sexta — liga dias, não artigo feminino.', icon: 'Calendar' },
          { label: 'Passa: às 10h', detail: 'Hora cheia — crase automática: às + hora.', icon: 'Clock' },
        ],
        footer_rule: 'Cada lacuna: verbo → a+a? → pronome? intervalo? hora?',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        chip_label: 'Um toque = um corte',
        meta: slideMeta,
        steps: [
          'Comando: 4 buracos — só uma sequência passa no funil inteiro.',
          'Lacuna 1: «vão ___ aulas» — a + as → às. Corta D e E (abrem com as).',
          'Lacuna 2: «proporcionam ___ ela» — pronome pessoal → só a. Corta B e E (à ela).',
          'Lacuna 3: «de segunda ___ sexta» — intervalo de dias → a simples. Corta C (à sexta).',
          'Lacuna 4: «sempre ___ 10h» — hora cheia → às. B troca por as — fora.',
          'Sequência que sobrou: às / a / a / às.',
          'Gabarito A — única que não cai em pronome, intervalo ou hora errada.',
          'Em similares: a ela nunca vira à ela; de… a… nunca leva crase.',
        ],
        footer_rule: 'às … a … a … às — guarde a ordem.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso — lacunas',
        chip_label: 'Decore isto',
        meta: slideMeta,
        content: 'PERGUNTE: TEM A + A?',
        rows: [
          { label: 'Pergunta-chave', value: 'Tem a (liga) + a/as (artigo feminino)? → à / às', emphasis: 'highlight', badge: 'info' },
          { label: 'Plural feminino', value: 'às aulas — a + as', emphasis: 'success' },
          { label: 'Pronome pessoal', value: 'a ela / a mim / a você — sem crase', emphasis: 'alert' },
          { label: 'Intervalo', value: 'de segunda a sexta — prep. a simples', emphasis: 'alert' },
          { label: 'Hora cheia', value: 'às 10h — crase automática', emphasis: 'success' },
          { label: 'Nesta questão', value: 'Sequência: às / a / a / às' },
        ],
        footer_rule: 'Sem a + artigo = sem crase. Hora é exceção automática.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Cada erro = um corte do funil',
        slide_title: 'Onde o aluno cai',
        chip_label: 'Armadilhas',
        items: [
          { label: 'B — à ela', detail: '«Proporcionam à» imita regência culta.', correct: 'Pronome pessoal: a ela — nunca à ela.' },
          { label: 'C — à sexta', detail: 'Crase no dia da semana parece elegante.', correct: 'De segunda a sexta — ligação, não artigo.' },
          { label: 'D — as aulas', detail: 'Abre sem fusão no plural feminino.', correct: 'Vão às aulas — a + as → às.' },
          { label: 'E — à … as', detail: 'Crase no pronome + hora sem às.', correct: '2ª lacuna: a ela; 4ª: às 10h.' },
          { label: 'Em outra banca…', detail: 'Trocam ioga por UBS ou plantão.', correct: 'Mesmo funil: às aulas / a ela / a sexta / às 8h.' },
        ],
        footer_rule: 'A passa: às aulas · a ela · a sexta · às 10h.',
      },
    ],
  },

  'avancasp-nova-odessa-crase-sacrificios-3962466': {
    family: 'conceito',
    source_tec_id: '3962466',
    source_note: 'Crase — AVANÇASP AFar Pref. Nova Odessa 2026',
    meta: { banca: 'AVANÇASP', prova: 'AFar (Pref Nova Odessa)', orgao: 'Pref. Nova Odessa', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa cujos elementos preenchem as lacunas corretamente, na mesma ordem.\n- Estou disposto ___ muitos sacrifícios.\n- Fiz o convite ___ você e sua família.\n- Queremos ___ sua presença de qualquer jeito.\n- Viemos ___ custa de muito esforço.',
    options: [
      { id: 'A', text: 'a … a … a … à', is_correct: true },
      { id: 'B', text: 'à … à … à … à', is_correct: false },
      { id: 'C', text: 'a … à … à … à', is_correct: false },
      { id: 'D', text: 'a … a … à … a', is_correct: false },
      { id: 'E', text: 'à … à … à … a', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Regência + crase',
        meta: slideMeta,
        items: [
          { label: 'Disposto a', detail: 'Adj + prep. a + substantivo — sem crase.', icon: 'Heart' },
          { label: 'Convite a', detail: 'Fazer convite a alguém — pronome sem crase.', icon: 'Mail' },
          { label: 'Queremos a', detail: 'Verbo + prep. a + presença — sem artigo a.', icon: 'Users' },
          { label: 'À custa de', detail: 'Locução prepositiva feminina — crase.', icon: 'Scale' },
          { label: 'Pegadinha', detail: 'Crase em todas as lacunas «por simetria».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Só a última lacuna pede à.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: disposto a sacrifícios — regência, sem crase.',
          '2ª: convite a você — pronome, sem crase.',
          '3ª: queremos a presença — OD sem artigo feminino.',
          '4ª: à custa de — locução fem. fixa com crase.',
          'Padrão a / a / a / à — só A.',
          'B coloca crase em tudo; C/D/E erram 2ª ou 3ª.',
          'Gabarito A.',
          'Em similares: «à custa de» é card isolado de decore.',
        ],
        footer_rule: 'a … a … a … à',
      },
      {
        type: 'golden_rule',
        slide_title: '4 lacunas',
        meta: slideMeta,
        content: 'REGÊNCIA PRIMEIRO',
        rows: [
          { label: 'Disposto a', value: 'a + substantivo — sem crase' },
          { label: 'Convite a', value: 'a você — pronome' },
          { label: 'Querer a', value: 'a presença — sem artigo' },
          { label: 'À custa de', value: 'locução — com crase' },
        ],
        footer_rule: 'Última lacuna = à custa de.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Simetria falsa',
        slide_title: 'Crase em série',
        items: [
          { label: 'B — tudo com à', detail: 'Quatro crases «harmonizam» visualmente.', correct: 'Só «à custa de» admite crase.' },
          { label: 'C — à você', detail: 'Segunda lacuna formal demais.', correct: 'Convite a você — sem crase.' },
          { label: 'D — à presença', detail: 'Terceira lacuna com artigo forçado.', correct: 'Queremos a presença — a simples.' },
          { label: 'E — à sacrifícios', detail: 'Primeira lacuna com crase indevida.', correct: 'Disposto a sacrifícios.' },
          { label: 'Em outra banca…', detail: 'Trocam «custa» por «frente de».', correct: 'À frente de — outra locução fem.' },
        ],
        footer_rule: 'A = a / a / a / à.',
      },
    ],
  },

  'avancasp-jeriquara-crase-facultativo-3886649': {
    family: 'conceito',
    source_tec_id: '3886649',
    source_note: 'Crase — AVANÇASP AOE Pref. Jeriquara 2026 (a/à facultativo)',
    meta: { banca: 'AVANÇASP', prova: 'AOE (Pref Jeriquara)', orgao: 'Pref. Jeriquara', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa cuja lacuna pode ser preenchida tanto com «a» quanto com «à», de acordo com a norma-padrão.',
    options: [
      { id: 'A', text: 'Todos os fatos se deram ___ vista de todas as pessoas presentes no teatro.', is_correct: false },
      { id: 'B', text: 'Ele fez menção ___ tudo quanto era transeunte que aparecia na sua frente.', is_correct: false },
      { id: 'C', text: '«Terra ___ vista», disse o navegador assim que vislumbrou uma ilha no horizonte.', is_correct: false },
      { id: 'D', text: 'Pedi um empréstimo ___ minha namorada, prometendo-lhe pagar o mais breve possível.', is_correct: true },
      { id: 'E', text: 'Assim que subimos ___ bordo do navio, iniciamos nossa viagem de férias.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacuna: a ou à (norma-padrão)',
        meta: slideMeta,
        items: [
          { label: 'Empréstimo', detail: 'Pedi empréstimo a/à minha namorada — facultativo.', icon: 'Shuffle' },
          { label: 'À vista', detail: 'Todos os fatos à vista do teatro — locução fixa.', icon: 'Eye' },
          { label: 'Menção', detail: 'Fez menção a transeunte — regência com a.', icon: 'FileText' },
          { label: 'Terra à vista', detail: 'Navegador e ilha — locução adverbial.', icon: 'Globe' },
          { label: 'A bordo', detail: 'Subimos a bordo do navio — locução masc.', icon: 'Ship' },
        ],
        footer_rule: 'De acordo com a norma-padrão: prove na frase.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacuna preenchida com a ou à — norma-padrão.',
          'A: fatos à vista do teatro — locução fixa, não facultativo.',
          'B: menção a transeunte — regência com a, sem à.',
          'C: «Terra à vista» — navegador e ilha; locução fixa.',
          'D: empréstimo a/à minha namorada — ambas corretas.',
          'E: subimos a bordo do navio — locução masc., sem crase.',
          'Gabarito D.',
          'Em similares: facultativo costuma ser OD feminino determinado.',
        ],
        footer_rule: 'D = a ou à minha namorada.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Facultativo × fixo',
        meta: slideMeta,
        content: 'FACULTATIVO: EMPRÉSTIMO A/À NAMORADA',
        rows: [
          { label: 'Facultativo', value: 'empréstimo a/à minha namorada' },
          { label: 'Teatro', value: 'à vista do teatro — locução fixa' },
          { label: 'Transeunte', value: 'menção a transeunte — sem crase' },
          { label: 'Navio', value: 'a bordo — locução masc.' },
        ],
        footer_rule: 'D aceita as duas formas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar facultativo por locução',
        slide_title: 'Por que não são D',
        items: [
          { label: 'A — vista do teatro', detail: '«A vista» sem crase parece facultativo.', correct: 'Locução à vista do teatro — só com crase.' },
          { label: 'B — menção ao transeunte', detail: 'Crase antes de «tudo».', correct: 'Menção a transeunte — prep. a, sem fusão.' },
          { label: 'C — Terra (navegador)', detail: 'Mesma locução do horizonte.', correct: 'Terra à vista — locução adverbial fixa.' },
          { label: 'E — bordo do navio', detail: '«À bordo» imita embarque formal.', correct: 'Subir a bordo — locução masculina.' },
          { label: 'Em outra banca…', detail: 'Pedem entrega a/à escola ou empréstimo a vizinha.', correct: 'Facultativo em OD feminino determinado — teste ao.' },
        ],
        footer_rule: 'D: empréstimo a ou à minha namorada.',
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
