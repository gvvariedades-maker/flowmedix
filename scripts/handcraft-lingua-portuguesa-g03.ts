#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — lingua-portuguesa-g03 (8 slugs · Crase).
 *
 *   npx tsx scripts/handcraft-lingua-portuguesa-g03.ts
 *   npm run audit:questao-readiness -- --lote=lingua-portuguesa-g03 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=lingua-portuguesa-g03 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PT_CRASE_CONCURSOS } from '@/lib/guidelines/linguaPortuguesa/crase';

const LOTE = 'lingua-portuguesa-g03';
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
  'vunesp-sorocaba-crase-lacunas-3999773': 'lacunas',
  'caderno-pt-crase-alcool-lacunas-4001120': 'lacunas',
  'caderno-pt-crase-tendencia-suspender-4003508': 'lacunas',
  'caderno-pt-crase-facultativo-joana-4024877': 'eliminacao',
  'caderno-pt-crase-universidades-elites-4024955': 'eliminacao',
  'vunesp-osasco-crase-charge-prova-balas-3323742': 'eliminacao',
  'caderno-pt-crase-biblioteca-lacunas-3352963': 'lacunas',
  'caderno-pt-crase-neurociencia-lacunas-3358515': 'lacunas',
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
      reviewer: 'handcraft:lingua-portuguesa-g03',
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
  'vunesp-sorocaba-crase-lacunas-3999773': {
    family: 'conceito',
    source_tec_id: '3999773',
    source_note: 'Crase lacunas — VUNESP TEnf Pref. Sorocaba 2026 tec 3999773',
    meta: { banca: 'VUNESP', prova: 'TEnf (Pref Sorocaba)', orgao: 'Pref. Sorocaba', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa cujos elementos preenchem corretamente as lacunas abaixo, na mesma ordem:\n- ___ princípio, tudo deverá acontecer conforme ___ programação prevista.\n- ___ julgar pelas aparências, você se submeteu ___ chantagens da chefia.\n- Espere-me daqui ___ pouco, exatamente ___ uma hora da tarde.',
    options: [
      { id: 'A', text: 'À – à – À – às – a – a', is_correct: false },
      { id: 'B', text: 'A – a – A – às – a – à', is_correct: true },
      { id: 'C', text: 'A – à – À – as – a – a', is_correct: false },
      { id: 'D', text: 'À – a – À – as – à – à', is_correct: false },
      { id: 'E', text: 'À – a – A – as – à – a', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '6 lacunas — funil M11',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'A princípio', detail: 'Locução adverbial masc. — início de frase com A maiúsculo.', icon: 'Flag' },
          { label: 'Conforme a', detail: 'Conforme a programação — prep. a + OD sem fusão clássica.', icon: 'FileText' },
          { label: 'A julgar', detail: 'Locução a julgar pelas aparências — sem crase.', icon: 'Scale' },
          { label: 'Às chantagens', detail: 'Submeter-se a + as chantagens → às (plural fem.).', icon: 'AlertTriangle' },
          { label: 'A pouco', detail: 'Daqui a pouco — locução fixa, sem crase.', icon: 'Timer' },
          { label: 'À uma hora', detail: 'Hora determinada — crase antes de «uma hora da tarde».', icon: 'Clock' },
        ],
        footer_rule: 'Cada lacuna = pergunta «Tem a + a?».',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        chip_label: 'Um toque = um teste',
        meta: slideMeta,
        steps: [
          'Comando: 6 buracos — só uma sequência passa no funil inteiro.',
          '1ª: «___ princípio» — locução a princípio → A (início de período).',
          '2ª: «conforme ___ programação» — regência com a simples → a.',
          '3ª: «___ julgar pelas aparências» — locução fixa → A.',
          '4ª: «submeteu ___ chantagens» — a + as → às. Corta C/D/E (as sem crase).',
          '5ª: «daqui ___ pouco» — locução a pouco → a.',
          '6ª: «___ uma hora da tarde» — hora determinada → à.',
          'Sequência: A / a / A / às / a / à — gabarito B.',
          'Em similares: locução masc. × plural fem. × hora pontual.',
        ],
        footer_rule: 'B = A – a – A – às – a – à.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso — 6 lacunas',
        meta: slideMeta,
        content: 'PERGUNTE: TEM A + A?',
        rows: [
          { label: 'Locução masc.', value: 'a princípio / a julgar — sem crase' },
          { label: 'Conforme a', value: 'conforme a programação — a simples' },
          { label: 'Plural fem.', value: 'às chantagens — a + as' },
          { label: 'A pouco', value: 'daqui a pouco — locução fixa' },
          { label: 'Hora', value: 'à uma hora da tarde — crase no horário' },
          { label: 'Nesta questão', value: 'A – a – A – às – a – à' },
        ],
        footer_rule: 'Sem a + artigo fem. = sem crase (salvo hora).',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Onde o funil barra',
        meta: slideMeta,
        content: 'Crase automática nas 6 lacunas',
        items: [
          { label: 'A — crase em «programação»', detail: '«Conforme à programação» parece rebuscado.', correct: 'Conforme a programação — prep. a sem fusão.' },
          { label: 'C — as chantagens', detail: 'Plural sem crase após submeter-se.', correct: 'Submeteu-se às chantagens — a + as → às.' },
          { label: 'D — crase tripla', detail: '«À» no princípio e duas crases no fim.', correct: 'A princípio (loc. masc.) + à uma hora (hora).' },
          { label: 'E — as no meio', detail: 'Troca às por as na regência plural.', correct: '4ª lacuna exige às chantagens.' },
          { label: 'Em outra banca…', detail: 'Trocam chantagens por «regras» ou «normas».', correct: 'Mesmo funil: a + as → às no plural fem.' },
        ],
        footer_rule: 'B passa: A princípio · a programação · A julgar · às · a pouco · à uma hora.',
      },
    ],
  },

  'caderno-pt-crase-alcool-lacunas-4001120': {
    family: 'text_fragment',
    source_tec_id: '4001120',
    source_note: 'Crase lacunas — caderno PT editorial álcool/OMS (Nando Reis) tec 4001120',
    meta: { banca: 'Caderno PT', prova: 'Crase — editorial Correio Braziliense', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Considere as frases a seguir:\nO músico Nando Reis abriu o jogo e falou com detalhes sobre os maus bocados que passou devido ___ seu estado de dependência do álcool.\nSegundo a Organização Mundial da Saúde, o exagero restrito aos fins de semana pode ser tão prejudicial ___ saúde quanto a ingestão diária da substância.\nA boa notícia fica com a nova geração, formada por pessoas nascidas a partir de 1997, dedicada ___ novas perspectivas para o lazer e para as celebrações.\nDe acordo com a norma-padrão, as lacunas das frases devem ser preenchidas, respectivamente, com:',
    text_fragment:
      '<p><strong>Consumo abusivo de álcool é desafio nacional</strong></p><p>Quando se fala no combate ao consumo abusivo de álcool, o depoimento de pessoas que conviveram com a doença é fundamental. Em vídeos no YouTube, o músico <strong>Nando Reis</strong> falou sobre os maus bocados que passou por conta da <strong>dependência</strong> — sobretudo da vodca.</p><p>Segundo a <strong>Organização Mundial da Saúde (OMS)</strong>, não há dose segura. O exagero restrito aos fins de semana pode ser tão prejudicial quanto a ingestão diária. A nova geração tem se dedicado a novos rumos para o lazer e para as celebrações.</p><p><em>Editorial Correio Braziliense, 18.02.2026 — adaptado</em></p>',
    options: [
      { id: 'A', text: 'à … a … às', is_correct: false },
      { id: 'B', text: 'a … a … à', is_correct: false },
      { id: 'C', text: 'à … a … a', is_correct: false },
      { id: 'D', text: 'à … à … as', is_correct: false },
      { id: 'E', text: 'a … à … às', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 lacunas no editorial',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Nando Reis / álcool', detail: 'Maus bocados por dependência do álcool — devido a seu estado.', icon: 'Mic' },
          { label: 'OMS / ingestão', detail: 'Exagero nos fins de semana prejudicial à saúde — 2ª lacuna.', icon: 'HeartPulse' },
          { label: 'Geração / lazer', detail: 'Nova geração dedicada às perspectivas de lazer e celebrações.', icon: 'Sparkles' },
          { label: 'Consumo abusivo', detail: 'Editorial sobre combate ao consumo — contexto do text_fragment.', icon: 'Newspaper' },
          { label: 'Vodca / YouTube', detail: 'Depoimento no YouTube — reforça regência «devido a».', icon: 'Video' },
        ],
        footer_rule: 'Regência «devido a»; depois a+a em saúde/perspectivas.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Funil por frase',
        meta: slideMeta,
        steps: [
          'Texto: Nando Reis, dependência do álcool, OMS e nova geração (lazer/celebrações).',
          'Lacuna 1: «devido ___ seu estado de dependência do álcool» — devido a → a.',
          'Lacuna 2: «prejudicial ___ saúde quanto a ingestão diária» — prejudicial à saúde → à.',
          'Lacuna 3: «dedicada ___ novas perspectivas para lazer e celebrações» — dedicada às → às.',
          'Sequência: a / à / às — só E passa no funil das três frases.',
          'A erra na 1ª (devido à); B na 2ª (a saúde); C na 3ª; D erra em duas.',
          'Gabarito E — norma-padrão nas três lacunas.',
          'Em similares: devido a × prejudicial à saúde × dedicada às perspectivas.',
        ],
        footer_rule: 'E = a … à … às.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '3 TESTES NO EDITORIAL',
        rows: [
          { label: 'Devido a', value: 'devido a + substantivo — sem crase' },
          { label: 'Prejudicial', value: 'prejudicial à saúde — a+a fem.' },
          { label: 'Dedicada', value: 'dedicada às novas perspectivas — a+as' },
          { label: 'Nesta questão', value: 'a … à … às' },
        ],
        footer_rule: 'Regência «devido a» nunca leva crase.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        slide_title: 'Pegadinhas do texto',
        meta: slideMeta,
        content: 'Crase onde só há regência',
        items: [
          { label: 'A — devido à', detail: '«Devido à seu estado de dependência do álcool».', correct: 'Devido a seu estado — regência com a simples.' },
          { label: 'B — a saúde', detail: '«Prejudicial a saúde quanto a ingestão diária».', correct: 'Prejudicial à saúde — OD feminino com artigo.' },
          { label: 'C — dedicada a', detail: '«Dedicada a novas perspectivas de lazer».', correct: 'Dedicada às novas perspectivas — a + as.' },
          { label: 'D — crase dupla', detail: 'Devido à + prejudicial à no início das frases.', correct: '1ª lacuna: devido a — sem crase antes de «seu».' },
          { label: 'Em outra banca…', detail: 'Trocam OMS por Denatran ou binge drinking.', correct: 'Mesmo funil: devido a · prejudicial à · dedicada às.' },
        ],
        footer_rule: 'E passa: devido a · prejudicial à · dedicada às.',
      },
    ],
  },

  'caderno-pt-crase-tendencia-suspender-4003508': {
    family: 'conceito',
    source_tec_id: '4003508',
    source_note: 'Crase lacunas — caderno PT tendência/suspender/queima-roupa tec 4003508',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas regência', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa cujas palavras preenchem corretamente as lacunas a seguir, na mesma ordem:\n- Havia uma grande tendência ___ suspender as aulas em função do feriado prolongado.\n- Pedi ___ ela que mantivesse ___ más companhias afastadas, para sua segurança.\n- Foi disparado um tiro ___ queima-roupa, conforme foi relatado ___ polícia técnica.',
    options: [
      { id: 'A', text: 'à – à – às – à – à', is_correct: false },
      { id: 'B', text: 'a – à – às – a – à', is_correct: false },
      { id: 'C', text: 'a – a – às – a – a', is_correct: false },
      { id: 'D', text: 'à – à – as – a – a', is_correct: false },
      { id: 'E', text: 'a – a – as – à – à', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '5 lacunas — regência + crase',
        meta: slideMeta,
        items: [
          { label: 'Tendência a', detail: 'Tendência a suspender — verbo/infinitivo → a.', icon: 'TrendingUp' },
          { label: 'Pedi a ela', detail: 'Pronome pessoal — só a, sem crase.', icon: 'User' },
          { label: 'As companhias', detail: 'Mantivesse as más companhias — artigo plural.', icon: 'Users' },
          { label: 'À queima-roupa', detail: 'Tiro à queima-roupa — locução fem. com crase.', icon: 'Crosshair' },
          { label: 'À polícia', detail: 'Relatado à polícia técnica — a + a polícia → à.', icon: 'Shield' },
        ],
        footer_rule: 'Verbo e pronome barra crase; locução fem. pede à.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «tendência ___ suspender» — infinitivo → a. Corta A e D (à).',
          '2ª: «pedi ___ ela» — pronome → a. Corta B (à ela).',
          '3ª: «mantivesse ___ más companhias» — artigo as (plural).',
          '4ª: «tiro ___ queima-roupa» — locução à queima-roupa → à.',
          '5ª: «relatado ___ polícia técnica» — a + a polícia → à.',
          'Sequência: a / a / as / à / à — gabarito E.',
          'C troca as por às; B erra no pronome.',
          'Em similares: tendência a + a ela + locução fem.',
        ],
        footer_rule: 'E = a – a – as – à – à.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '5 LACUNAS = 5 CORTES',
        rows: [
          { label: 'Infinitivo', value: 'tendência a suspender — sem crase' },
          { label: 'Pronome', value: 'pedi a ela — sem crase' },
          { label: 'Artigo pl.', value: 'as más companhias — as, não às' },
          { label: 'Locução fem.', value: 'à queima-roupa — crase fixa' },
          { label: 'OD fem.', value: 'relatado à polícia — a+a' },
        ],
        footer_rule: 'a – a – as – à – à.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase em série',
        slide_title: 'Simetria falsa',
        items: [
          { label: 'A — cinco crases', detail: 'Todas as lacunas com à «harmonizam».', correct: 'Só locuções/OD fem. (4ª e 5ª) pedem crase.' },
          { label: 'B — à ela', detail: '«Pedi à ela» imita tratamento formal.', correct: 'Pronome pessoal: pedi a ela.' },
          { label: 'C — às companhias', detail: 'Crase no artigo plural sem motivo.', correct: 'Mantivesse as más companhias — as simples.' },
          { label: 'D — à suspender', detail: 'Crase antes de infinitivo na 1ª.', correct: 'Tendência a suspender — verbo barra crase.' },
          { label: 'Em outra banca…', detail: 'Trocam queima-roupa por «curta distância».', correct: 'Locução fem. à + substantivo — card à parte.' },
        ],
        footer_rule: 'E passa nos 5 testes.',
      },
    ],
  },

  'caderno-pt-crase-facultativo-joana-4024877': {
    family: 'conceito',
    source_tec_id: '4024877',
    source_note: 'Crase facultativo — caderno PT pedi a/à Joana tec 4024877',
    meta: { banca: 'Caderno PT', prova: 'Crase — a/à facultativo', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa cuja lacuna pode ser preenchida tanto com "a" quanto com "à", resultando numa frase correta com ambas as formas.',
    options: [
      { id: 'A', text: 'Quando eu vier para a escola, vou avisar ___ professora que não me sinto bem.', is_correct: false },
      { id: 'B', text: 'Ontem mesmo eu fiz menção ___ decisão do Colegiado, que tanto desagradou a todos.', is_correct: false },
      { id: 'C', text: 'Não me refiro ___ extravagâncias em geral, mas gostaria de fazer isso.', is_correct: false },
      { id: 'D', text: 'De sol ___ sol, o trabalho pesado nas lavouras é um risco para a comunidade.', is_correct: false },
      { id: 'E', text: 'Assim que cheguei de viagem, pedi ___ Joana que me preparasse uma boa refeição.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Facultativo: a ou à',
        meta: slideMeta,
        items: [
          { label: 'Pedi a/à Joana', detail: 'Assim que cheguei, pedi a/à Joana — facultativo (E).', icon: 'Shuffle' },
          { label: 'Avisar professora', detail: 'Vou avisar a professora — regência com a, sem à (A).', icon: 'Bell' },
          { label: 'Menção decisão', detail: 'Fez menção a decisão do Colegiado — prep. a (B).', icon: 'FileText' },
          { label: 'Extravagâncias', detail: 'Não me refiro a extravagâncias — sem crase (C).', icon: 'MessageSquare' },
          { label: 'De sol a sol', detail: 'De sol a sol nas lavouras — intervalo, não facultativo (D).', icon: 'Sun' },
        ],
        footer_rule: 'Facultativo = pedi a/à Joana (E).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacuna aceita a e à — norma-padrão.',
          'A: avisar a professora — só a (regência verbal).',
          'B: menção a decisão — regência fixa, sem à.',
          'C: refiro-me a extravagâncias — prep. a, sem fusão.',
          'D: de sol a sol — intervalo, não facultativo.',
          'E: pedi a Joana / pedi à Joana — ambas corretas.',
          'Gabarito E.',
          'Teste ao: pedi ao João → pedi à Joana (facultativo).',
          'Em similares: empréstimo a/à vizinha, carta a/à diretora.',
        ],
        footer_rule: 'E = pedi a ou à Joana.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Facultativo × fixo',
        meta: slideMeta,
        content: 'A OU À — QUANDO?',
        rows: [
          { label: 'Facultativo', value: 'pedi a/à Joana — OD fem. determinado' },
          { label: 'Regência', value: 'avisar a professora — só a' },
          { label: 'Menção', value: 'menção a decisão — sem crase' },
          { label: 'Intervalo', value: 'de sol a sol — a simples' },
        ],
        footer_rule: 'E aceita as duas formas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar facultativo por locução',
        slide_title: 'Por que não são E',
        items: [
          { label: 'A — à professora', detail: '«Avisar à professora» parece facultativo.', correct: 'Avisar a professora — regência verbal com a.' },
          { label: 'B — à decisão', detail: 'Crase antes de «decisão» atrai.', correct: 'Menção a decisão — prep. a, sem fusão.' },
          { label: 'C — às extravagâncias', detail: 'Plural com crase forçada.', correct: 'Referir-se a extravagâncias — a simples.' },
          { label: 'D — à sol', detail: '«De sol à sol» imita intervalo culto.', correct: 'De sol a sol — ligação temporal, não artigo.' },
          { label: 'Em outra banca…', detail: 'Pedem entrega a/à escola ou carta a/à mãe.', correct: 'Facultativo em OD fem. — teste ao no masc.' },
        ],
        footer_rule: 'E: pedi a ou à Joana.',
      },
    ],
  },

  'caderno-pt-crase-universidades-elites-4024955': {
    family: 'text_fragment',
    source_tec_id: '4024955',
    source_note: 'Crase — caderno PT universidades/restrito às elites (Folha) tec 4024955',
    meta: { banca: 'Caderno PT', prova: 'Crase — regência CN (Folha UOL)', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'No trecho: "A primeira faculdade criada, a Escola de Cirurgia da Bahia, surgiu em 1808, e o acesso ao ensino superior permaneceu, por muito tempo, restrito às elites.", o acento grave indicador de crase em "às elites" se justifica por:',
    text_fragment:
      '<p>As universidades e o desafio da desigualdade social</p><p><em>Cesar Martins — Vice-reitor da Unesp</em></p><p>[...] As universidades chegaram tardiamente ao país. A primeira faculdade criada, a Escola de Cirurgia da Bahia, surgiu em 1808, e o <strong>acesso ao ensino superior permaneceu, por muito tempo, restrito às elites</strong>. Embora tardio, o Brasil adotou relativamente cedo o modelo de universidades públicas, em princípio abertas a todos. Na prática, porém, essas instituições continuaram acessíveis a uma parcela reduzida da sociedade [...]</p><p><em>Fonte: Folha/UOL, 2026 — adaptado</em></p>',
    options: [
      { id: 'A', text: 'regra de regência, inicia um complemento verbal.', is_correct: false },
      { id: 'B', text: 'ser uma locução adverbial formada por palavra feminina.', is_correct: false },
      { id: 'C', text: 'regra de concordância verbal.', is_correct: false },
      { id: 'D', text: 'regra de concordância nominal.', is_correct: false },
      { id: 'E', text: 'regra de regência, inicia um complemento nominal.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Por que «às elites»?',
        meta: slideMeta,
        items: [
          { label: 'Universidades / elites', detail: 'Acesso restrito às elites — adj. + prep. a + as elites.', icon: 'GraduationCap' },
          { label: 'Escola de Cirurgia', detail: 'Primeira faculdade na Bahia (1808) — trecho do texto.', icon: 'Landmark' },
          { label: 'Restrito às', detail: 'Crase em «restrito às elites» — CN, não CV.', icon: 'Filter' },
          { label: 'Não é locução', detail: 'Não é «à moda de» — regência nominal do adj.', icon: 'XCircle' },
          { label: 'Desigualdade', detail: 'Tema do artigo: universidades e desigualdade social.', icon: 'Scale' },
        ],
        footer_rule: 'Adjetivo restrito + às elites = complemento nominal.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Localizar: «restrito às elites» — crase no trecho destacado.',
          'Pergunta: «Tem a + a?» — restrito a + as elites → às.',
          'A: complemento verbal — «restrito» não rege verbo.',
          'B: locução adverbial — não é «à noite»/«à moda».',
          'C/D: concordância — crase não vem de concordância.',
          'E: complemento nominal — «restrito às elites» completa o adj.',
          'Gabarito E — regência nominal com a+a.',
          'Em similares: «acessível às classes», «limitado às áreas».',
        ],
        footer_rule: 'Adj + a + OD fem. = CN com crase.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Regência nominal',
        meta: slideMeta,
        content: 'RESTRITO ÀS ELITES',
        rows: [
          { label: 'Estrutura', value: 'restrito (adj.) + às elites (CN)' },
          { label: 'Funil', value: 'restrito a + as elites → às' },
          { label: 'Não é CV', value: 'complemento verbal exige verbo transitivo' },
          { label: 'Não é locução', value: 'locução adverbial = à noite, à moda' },
        ],
        footer_rule: 'E: regência — complemento nominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir CN com CV ou locução',
        slide_title: 'Alternativas que parecem certas',
        items: [
          { label: 'A — complemento verbal', detail: '«Regência verbal» soa técnico e seguro.', correct: 'Restrito é adjetivo — completa nome, não verbo.' },
          { label: 'B — locução adverbial', detail: '«Às elites» parece modo/lugar.', correct: 'Não é locução fixa — é CN do adj. restrito.' },
          { label: 'C — concordância verbal', detail: 'Crase ligada ao verbo «permaneceu».', correct: 'Crase está em «restrito às», não no verbo.' },
          { label: 'D — concordância nominal', detail: 'Elites concorda com acesso?', correct: 'Concordância não gera crase — regência sim.' },
          { label: 'Em outra banca…', detail: 'Pedem justificativa de «acessível às».', correct: 'Mesma lógica: adj + a + as → CN com crase.' },
        ],
        footer_rule: 'E: regência nominal — restrito às elites.',
      },
    ],
  },

  'vunesp-osasco-crase-charge-prova-balas-3323742': {
    family: 'conceito',
    source_tec_id: '4024955',
    source_note:
      'Crase charge à prova de balas — Ápice ACS Pref Monteiro 2026 tec 4024955 (slug legado termina em 3323742)',
    meta: { banca: 'Ápice', prova: 'ACS (Pref Monteiro)', orgao: 'Pref. Monteiro', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Leia e analise a charge a seguir para responder a questão.\nEm: "Ela já vem blindada e com vidros à prova de balas.", o uso do acento grave é justificado por:',
    options: [
      { id: 'A', text: 'ser uma locução conjuntiva formada por palavra feminina.', is_correct: false },
      { id: 'B', text: 'ser uma locução prepositiva formada por palavra feminina.', is_correct: true },
      { id: 'C', text: 'ser uma locução adverbial formada por palavra feminina.', is_correct: false },
      { id: 'D', text: 'ser uma locução interjetiva formada por palavra feminina.', is_correct: false },
      { id: 'E', text: 'ser uma locução adjetiva formada por palavra feminina.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'À prova de balas',
        meta: slideMeta,
        items: [
          { label: 'Locução prepositiva', detail: 'À prova de — liga termos (resistência/proteção).', icon: 'Shield' },
          { label: 'Palavra fem.', detail: 'Prova (substantivo fem.) — exige crase após a.', icon: 'FileCheck' },
          { label: 'Não conjuntiva', detail: 'Não liga orações — não é «à medida que».', icon: 'Ban' },
          { label: 'Não adverbial', detail: 'Não indica circunstância de tempo/modo isolada.', icon: 'XCircle' },
          { label: 'Decore', detail: 'À prova de / à mercê de / à sombra de — prep.', icon: 'BookOpen' },
        ],
        footer_rule: '«À prova de» = locução prepositiva feminina.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trecho da charge: «vidros à prova de balas».',
          'Funil: a + a prova → à prova (fem.).',
          'Classificar: liga «vidros» a «balas» — função prepositiva.',
          'A: conjuntiva — liga orações → não.',
          'C: adverbial — circunstância solta → não.',
          'D/E: interjetiva/adjetiva — categorias erradas.',
          'B: locução prepositiva feminina — gabarito.',
          'Em similares: à mercê de, à sombra de, à frente de.',
        ],
        footer_rule: 'B = locução prepositiva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Locuções prepositivas',
        meta: slideMeta,
        content: 'À PROVA DE = PREPOSITIVA',
        rows: [
          { label: 'Tipo', value: 'locução prepositiva feminina' },
          { label: 'Função', value: 'liga termos — proteção/resistência' },
          { label: 'Crase', value: 'a + a prova → à prova' },
          { label: 'Parêntese', value: 'à mercê de · à sombra de · à frente de' },
        ],
        footer_rule: 'Charge: vidros à prova de balas.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir tipo de locução',
        slide_title: 'Pegadinhas da classificação',
        items: [
          { label: 'A — conjuntiva', detail: '«À prova de» parece conectar ideias.', correct: 'Conjuntiva liga orações — aqui liga termos (prep.).' },
          { label: 'C — adverbial', detail: '«À prova de balas» parece modo do vidro.', correct: 'Modifica por região prepositiva, não adverbial solta.' },
          { label: 'D — interjetiva', detail: 'Categoria rara — distratores de decore.', correct: 'Interjeição é exclamação — não se aplica.' },
          { label: 'E — adjetiva', detail: '«Prova de balas» qualifica vidros.', correct: 'Locução prepositiva, não adjetiva isolada.' },
          { label: 'Em outra banca…', detail: 'Trocam por «à moda de» ou «à base de».', correct: 'Mesma classe: locução prepositiva fem. com crase.' },
        ],
        footer_rule: 'B: locução prepositiva — à prova de balas.',
      },
    ],
  },

  'caderno-pt-crase-biblioteca-lacunas-3352963': {
    family: 'conceito',
    source_tec_id: '3352963',
    source_note: 'Crase lacunas — caderno PT biblioteca/procurar/de que tec 3352963',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas biblioteca', orgao: 'AVANT', ano: '2026', cargo_header: 'TÉCNICO' },
    instruction:
      'Assinale a alternativa que completa, correta e respectivamente, as lacunas da frase. Quando fui ___ biblioteca pública da cidade, pus-me ___ procurar pelo livro ___ o professor falara.',
    options: [
      { id: 'A', text: 'a... à ... que', is_correct: false },
      { id: 'B', text: 'na ... à ... o qual', is_correct: false },
      { id: 'C', text: 'na ... a ... que', is_correct: false },
      { id: 'D', text: 'à ... a... de que', is_correct: true },
      { id: 'E', text: 'à ... à ... do qual', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '3 lacunas — ir, pôr-se, relativo',
        meta: slideMeta,
        items: [
          { label: 'Fui à biblioteca', detail: 'Ir a + a biblioteca (fem.) → à.', icon: 'Library' },
          { label: 'Pus-me a procurar', detail: 'Pôr-se a + infinitivo — verbo, sem crase.', icon: 'Search' },
          { label: 'De que falara', detail: 'Livro de que o professor falara — relativo.', icon: 'BookOpen' },
          { label: 'Na biblioteca', detail: '«Na» mistura prep. em + artigo — outra regência.', icon: 'MapPin' },
          { label: 'Pegadinha', detail: 'Crase em «procurar» antes de infinitivo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Destino fem. × verbo × relativo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '1ª: «fui ___ biblioteca» — ir à biblioteca → à. Corta A/C (a/na).',
          '2ª: «pus-me ___ procurar» — pôr-se a procurar → a. Corta B/E (à).',
          '3ª: «livro ___ o professor falara» — falar de que → de que.',
          'Sequência: à / a / de que — gabarito D.',
          'A erra na 1ª; B/C trocam na/à; E crase no infinitivo.',
          'Gabarito D.',
          'Em similares: ir à escola · pôr-se a estudar · de que falou.',
          'Funil: destino fem. → verbo → relativo.',
        ],
        footer_rule: 'D = à ... a ... de que.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '3 LACUNAS CLÁSSICAS',
        rows: [
          { label: 'Destino', value: 'fui à biblioteca — a+a fem.' },
          { label: 'Verbo', value: 'pus-me a procurar — infinitivo sem crase' },
          { label: 'Relativo', value: 'livro de que falara — de que' },
          { label: 'Nesta questão', value: 'à ... a ... de que' },
        ],
        footer_rule: 'Ir à + pôr-se a + de que.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase no infinitivo ou «na»',
        slide_title: 'Pegadinhas da frase',
        items: [
          { label: 'A — a biblioteca', detail: '«Fui a biblioteca» omite crase no destino.', correct: 'Fui à biblioteca pública — a + a biblioteca.' },
          { label: 'B — na biblioteca', detail: '«Na» parece indicar lugar correto.', correct: 'Verbo ir pede a/à, não em/na nesta construção.' },
          { label: 'C — na + a procurar', detail: 'Mistura em + verbo sem crase certa.', correct: '1ª: à biblioteca; 2ª: a procurar.' },
          { label: 'E — à procurar', detail: 'Crase antes de infinitivo «culta».', correct: 'Pus-me a procurar — verbo barra crase.' },
          { label: 'Em outra banca…', detail: 'Trocam biblioteca por «escola» ou «UBS».', correct: 'Mesmo funil: fui à + pôr-se a + de que.' },
        ],
        footer_rule: 'D passa: à biblioteca · a procurar · de que.',
      },
    ],
  },

  'caderno-pt-crase-neurociencia-lacunas-3358515': {
    family: 'conceito',
    source_tec_id: '3358515',
    source_note: 'Crase lacunas — caderno PT neurociência/córtex (Nexo) tec 3358515',
    meta: { banca: 'Caderno PT', prova: 'Crase — lacunas Nexo Jornal', orgao: 'AVANT', ano: '2024', cargo_header: 'TÉCNICO' },
    instruction:
      'Na neurociência, a relação entre ___ manutenção de padrões e a criatividade também é mediada principalmente pelo córtex pré-frontal, que desempenha um papel crucial nas funções executivas e nas tomadas de decisões. Próximo ___ essa área do cérebro temos o sistema límbico, relacionado ___ decisões mais emocionais e intuitivas. O neocórtex é responsável pelo pensamento crítico e por decisões mais estratégicas. A dinâmica entre esses sistemas é essencial para a resolução criativa de problemas, permitindo que questionemos nossas escolhas e desbloqueemos ___ capacidade de reconfigurar nosso pensamento e nossas experiências. (Rubens Bollos. www.nexojornal.com.br. 01.11.2024. Adaptado) Assinale a alternativa que preenche, correta e respectivamente, as lacunas.',
    options: [
      { id: 'A', text: 'a ... a ... às ... a', is_correct: true },
      { id: 'B', text: 'a ... à ... à ... a', is_correct: false },
      { id: 'C', text: 'à ... a ... às ... à', is_correct: false },
      { id: 'D', text: 'a ... à ... às ... à', is_correct: false },
      { id: 'E', text: 'à ... a ... à ... a', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: '4 lacunas — texto científico',
        chip_label: 'Tem a + a?',
        meta: slideMeta,
        items: [
          { label: 'Neurociência / córtex', detail: 'Relação entre a manutenção de padrões e criatividade — 1ª lacuna: a.', icon: 'Brain' },
          { label: 'Sistema límbico', detail: 'Próximo a essa área do cérebro — demonstrativo, sem crase.', icon: 'MapPin' },
          { label: 'Decisões emocionais', detail: 'Relacionado às decisões emocionais — a + as → às.', icon: 'GitBranch' },
          { label: 'Capacidade criativa', detail: 'Desbloqueamos a capacidade de reconfigurar — a simples.', icon: 'Unlock' },
          { label: 'Neocórtex', detail: 'Pensamento crítico e decisões estratégicas — contexto do texto.', icon: 'Cpu' },
        ],
        footer_rule: 'Demonstrativo «essa» barra crase após próximo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Lacuna a lacuna',
        meta: slideMeta,
        steps: [
          '1ª: «relação entre ___ manutenção» — entre a manutenção → a.',
          '2ª: «próximo ___ essa área» — próximo a essa → a (demonstrativo).',
          '3ª: «relacionado ___ decisões» — a + as decisões → às.',
          '4ª: «desbloqueamos ___ capacidade» — OD direto → a.',
          'Sequência: a / a / às / a — gabarito A.',
          'B erra no 2º e 3º; C na 1ª; D no 2º e 4º; E na 1ª e 3ª.',
          'Gabarito A.',
          'Em similares: próximo a essa × relacionado às × desbloquear a.',
        ],
        footer_rule: 'A = a ... a ... às ... a.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funil de bolso',
        meta: slideMeta,
        content: '4 LACUNAS NO TEXTO',
        rows: [
          { label: 'Entre a', value: 'relação entre a manutenção — a simples' },
          { label: 'Próximo a', value: 'próximo a essa área — sem crase' },
          { label: 'Relacionado às', value: 'relacionado às decisões — a+as' },
          { label: 'Desbloquear a', value: 'desbloqueamos a capacidade — a' },
          { label: 'Nesta questão', value: 'a ... a ... às ... a' },
        ],
        footer_rule: 'Demonstrativo ≠ artigo definido fem.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Crase automática no texto técnico',
        slide_title: 'Onde o aluno cai',
        items: [
          { label: 'B — próximo à essa', detail: '«Próximo à essa área» parece formal.', correct: 'Próximo a essa área — demonstrativo bloqueia crase.' },
          { label: 'C — entre à manutenção', detail: 'Crase no primeiro termo técnico.', correct: 'Entre a manutenção — prep. entre + a simples.' },
          { label: 'D — à capacidade', detail: 'Crase no objeto final «capacidade».', correct: 'Desbloqueamos a capacidade — sem artigo fem. claro.' },
          { label: 'E — relacionado à', detail: 'Singular com crase no 3º buraco.', correct: 'Relacionado às decisões — plural com às.' },
          { label: 'Em outra banca…', detail: 'Trocam neurociência por pedagogia ou SAE.', correct: 'Mesmo funil: próximo a + relacionado às.' },
        ],
        footer_rule: 'A passa: a · a · às · a.',
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
