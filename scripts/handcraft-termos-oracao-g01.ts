#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — termos-oracao-g01 (8 slugs · Termos da oração · lote 1/4).
 *
 *   npx tsx scripts/handcraft-termos-oracao-g01.ts
 *   npm run audit:questao-readiness -- --lote=termos-oracao-g01 --strict-v2-pedagogy
 *   npm run validate:goldens -- --lote=termos-oracao-g01 --strict
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'termos-oracao-g01';
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
type Family = 'conceito' | 'text_fragment' | 'certo_errado';

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
      reviewer: 'handcraft:termos-oracao-g01',
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
  'selecon-porto-gauchos-termos-missao-3852270': {
    family: 'text_fragment',
    source_tec_id: '3852270',
    source_note: 'Termos OI «à missão» — SELECON Recep CM Porto dos Gaúchos 2026 tec 3852270',
    meta: {
      banca: 'SELECON',
      prova: 'Recep (CM Porto dos Gaúchos)',
      orgao: 'CM Porto dos Gaúchos',
      ano: '2026',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em «Em carta enviada aos acionistas da Innospace, Soo-jong disse que lamentava transmitir resultados que não atenderam às expectativas daqueles que apoiaram a missão» (2º parágrafo). O trecho em destaque classifica-se sintaticamente como:',
    text_fragment:
      '<p>Excerto sobre o lançamento do foguete HANBIT-Nano em Alcântara. «Em carta enviada aos acionistas da Innospace, Soo-jong disse que lamentava transmitir resultados que não atenderam às expectativas daqueles que apoiaram <strong>a missão</strong>».</p>',
    options: [
      { id: 'A', text: 'objeto direto', is_correct: false },
      { id: 'B', text: 'objeto indireto', is_correct: true },
      { id: 'C', text: 'agente da passiva', is_correct: false },
      { id: 'D', text: 'complemento nominal', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Integrante × acessório',
        chip_label: 'Matriz simples',
        meta: slideMeta,
        items: [
          { label: 'Verbo nuclear', detail: 'Apoiaram — quem? o quê? a quem?', icon: 'CornerDownRight' },
          { label: 'Prep. + missão', detail: 'Regência: apoiar a missão → complemento verbal com prep.', icon: 'Link' },
          { label: '≠ Agente passiva', detail: 'Agente = por quem se fez a ação passiva — não é o caso.', icon: 'UserX' },
          { label: '≠ CN', detail: 'CN completa nome; aqui o núcleo é verbo «apoiaram».', icon: 'Box' },
          { label: 'Pegadinha: OD', detail: 'Sem preposição parece OD — mas «a missão» vem de verbo que exige prep.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Integrante do verbo → pergunta «a quem? / de quê?» com prep.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        slide_title: 'Apoiaram → cargo',
        meta: slideMeta,
        steps: [
          'Texto Alcântara/Innospace: isolar «a missão» no trecho dos acionistas.',
          'Verbo: apoiaram — transitivo; liga-se ao complemento com preposição a.',
          'Pergunta: apoiaram a quê? → a missão — objeto indireto.',
          'A/C: não é agente da passiva (oração ativa).',
          'D: não completa nome — completa verbo.',
          'Gabarito B — objeto indireto.',
          'Em similares: verbo + prep. → OI; sem prep. direto → OD.',
        ],
        footer_rule: 'Regência do verbo decide OD × OI.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Matriz de bolso',
        meta: slideMeta,
        content: 'VERBO → CARGO',
        rows: [
          { label: 'OI', value: 'Verbo exige prep. — a quem? de quê? com prep.' },
          { label: 'OD', value: 'Complemento sem preposição — o quê?' },
          { label: 'Agente passiva', value: 'Por quem? — só em voz passiva analítica.' },
          { label: 'CN', value: 'Completa nome — de quê? + prep. após substantivo.' },
          { label: 'Nesta questão', value: 'apoiaram a missão → OI (B)' },
        ],
        footer_rule: 'Apoiar + a missão = OI.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Trocar integrantes do verbo',
        items: [
          { label: 'A — OD', detail: '«Missão» parece coisa apoiada diretamente.', correct: 'Há preposição a — integrante indireto.' },
          { label: 'C — agente', detail: '«Pelos acionistas» confunde com passiva.', correct: 'Oração é ativa; agente seria «por…» na passiva.' },
          { label: 'D — CN', detail: '«Missão» parece nome complementado.', correct: 'Núcleo é verbo apoiaram, não substantivo isolado.' },
          { label: 'Em outra banca…', detail: 'Podem destacar «aos acionistas».', correct: 'Mesma matriz: regência verbal com prep. → OI.' },
        ],
        footer_rule: 'B: objeto indireto de apoiaram.',
      },
    ],
  },

  'selecon-lrv-termos-agente-passiva-1360962': {
    family: 'text_fragment',
    source_tec_id: '1360962',
    source_note: 'Agente da passiva «pelo IBGE» — SELECON ACS Pref LRV 2025 tec 1360962',
    meta: {
      banca: 'SELECON',
      prova: 'ACS (Pref LRV)',
      orgao: 'Pref. Lagoa do Rio Verde',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'No trecho «A estimativa foi divulgada nesta quinta-feira (28) pelo Instituto Brasileiro de Geografia e Estatística (IBGE)», o termo em destaque classifica-se sintaticamente como:',
    text_fragment:
      '<p>Texto sobre população brasileira (213,4 milhões). «A estimativa foi divulgada nesta quinta-feira (28) <strong>pelo Instituto Brasileiro de Geografia e Estatística (IBGE)</strong>».</p>',
    options: [
      { id: 'A', text: 'agente da passiva', is_correct: true },
      { id: 'B', text: 'predicativo do objeto', is_correct: false },
      { id: 'C', text: 'predicativo do sujeito', is_correct: false },
      { id: 'D', text: 'complemento nominal', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Voz passiva — quem praticou?',
        meta: slideMeta,
        items: [
          { label: 'Foi divulgada', detail: 'Voz passiva analítica — sujeito paciente da ação.', icon: 'Shield' },
          { label: 'Pelo IBGE', detail: 'Instituto Brasileiro de Geografia — agente com por.', icon: 'User' },
          { label: 'Estimativa', detail: 'Sujeito paciente — o que foi divulgada.', icon: 'Target' },
          { label: '≠ CN', detail: 'Complemento nominal completa nome — não estrutura passiva.', icon: 'XCircle' },
          { label: 'Pegadinha: CN', detail: '«Divulgada pelo…» parece nome — mas é oração passiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Passiva analítica → agente com por/pelo.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Reconhecer passiva: «foi divulgada» — sujeito sofre a ação.',
          'Pergunta da passiva: por quem foi divulgada? → pelo IBGE.',
          'Cargo: agente da passiva (por + locução).',
          'B/C: não há predicativo — não qualifica estimativa nem agente.',
          'D: não completa nome; completa estrutura passiva.',
          'Gabarito A.',
          'Em similares: foi + particípio + por/pelo → agente da passiva.',
        ],
        footer_rule: 'Por quem? na passiva = agente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PASSIVA ANALÍTICA',
        rows: [
          { label: 'Sujeito paciente', value: 'A estimativa — quem sofre divulgação.' },
          { label: 'Agente', value: 'Por quem? pelo IBGE.' },
          { label: '≠ Pred. sujeito', value: 'Atribui estado ao sujeito — outro teste.' },
          { label: 'Nesta questão', value: 'pelo IBGE → agente da passiva (A)' },
        ],
        footer_rule: 'Ser + particípio + por = agente.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Confundir agente com predicativo',
        items: [
          { label: 'B — pred. objeto', detail: '«Pelo IBGE» parece qualificar «estimativa».', correct: 'É agente da passiva, não predicativo.' },
          { label: 'C — pred. sujeito', detail: 'Quinta-feira parece atributo.', correct: 'Destaque é pelo IBGE — agente, não predicativo.' },
          { label: 'D — CN', detail: 'Instituto parece nome complementado.', correct: 'Função na oração passiva, não após nome.' },
          { label: 'Em outra banca…', detail: 'Trocam «pelo IBGE» por «pela imprensa».', correct: 'Mesmo padrão: por + agente na passiva.' },
        ],
        footer_rule: 'A: agente da passiva.',
      },
    ],
  },

  'selecon-hemominas-termos-agente-passiva-3416691': {
    family: 'text_fragment',
    source_tec_id: '3416691',
    source_note: 'Agente «pelos ex-chefes» — SELECON ATHH HEMOMINAS 2025 tec 3416691',
    meta: {
      banca: 'SELECON',
      prova: 'ATHH (HEMOMINAS)',
      orgao: 'HEMOMINAS',
      ano: '2025',
      cargo_header: 'AUXILIAR ADMINISTRATIVO',
    },
    instruction:
      '«Ao me formar, rapidamente consegui empregos, sempre fui bem recomendada pelos ex-chefes, e sempre fui adiante de cabeça erguida» (5º parágrafo). O termo em destaque é sintaticamente classificado como:',
    text_fragment:
      '<p>Crônica «Quando eu deixei de acreditar em mim» (Mayara Godoy). «Ao me formar, rapidamente consegui empregos, sempre fui bem recomendada <strong>pelos ex-chefes</strong>, e sempre fui adiante de cabeça erguida».</p>',
    options: [
      { id: 'A', text: 'sujeito', is_correct: false },
      { id: 'B', text: 'objeto direto', is_correct: false },
      { id: 'C', text: 'objeto indireto', is_correct: false },
      { id: 'D', text: 'agente da passiva', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Recomendada — por quem?',
        meta: slideMeta,
        items: [
          { label: 'Fui recomendada', detail: 'Passiva: eu recebo a recomendação.', icon: 'Shield' },
          { label: 'Pelos ex-chefes', detail: 'Agente da passiva — quem recomendou.', icon: 'User' },
          { label: 'Cabeça erguida', detail: 'Outro trecho do parágrafo — adjunto adverbial de modo.', icon: 'CornerDownRight' },
          { label: '≠ OI', detail: 'Objeto indireto é de verbo ativo — aqui é passiva.', icon: 'Ban' },
          { label: 'Pegadinha: OI', detail: '«Pelos» parece indireto de verbo ativo — na passiva vira agente.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Bem recomendada pelos… = passiva + agente.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Crônica «Quando eu deixei de acreditar em mim»: «fui bem recomendada pelos ex-chefes» — passiva.',
          'Sujeito paciente: eu (fui recomendada).',
          'Por quem? pelos ex-chefes → agente da passiva.',
          'A: eu sou sujeito, não o termo destacado.',
          'B/C: em passiva o complemento de agente não é OD/OI do ativo.',
          'Gabarito D.',
          'Em similares: particípio + por/pelo → agente, não OI.',
        ],
        footer_rule: 'Destaque em «pelos ex-chefes» → agente.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FOI + PARTICÍPIO',
        rows: [
          { label: 'Passiva', value: 'Fui recomendada — ação recebida.' },
          { label: 'Agente', value: 'Pelos ex-chefes — por quem?' },
          { label: '≠ OI', value: 'Objeto indireto — verbo ativo; aqui é passiva.' },
          { label: '≠ CN', value: 'Complemento nominal completa nome.' },
          { label: 'Nesta questão', value: 'D — agente da passiva' },
        ],
        footer_rule: 'Por + agente na passiva.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Ler passiva como ativa',
        items: [
          { label: 'A — sujeito', detail: '«Ex-chefes» parece quem pratica.', correct: 'Sujeito é eu; ex-chefes são agente da passiva.' },
          { label: 'B — OD', detail: 'Recomendada parece OD de chefes.', correct: 'Chefes não são sujeito ativo — são agente.' },
          { label: 'C — OI', detail: 'Pelos induz prep. = OI.', correct: 'Na passiva, por/pelo = agente, não OI.' },
          { label: 'Em outra banca…', detail: 'Trocam por «pela equipe».', correct: 'Mesmo teste: passiva + por.' },
        ],
        footer_rule: 'D sobrou: agente da passiva.',
      },
    ],
  },

  'avancasp-fusam-termos-excepto-adnominal-3460242': {
    family: 'text_fragment',
    source_tec_id: '3460242',
    source_note: 'EXCETO adjunto adnominal — AVANÇASP Cont FUSAM 2025 tec 3460242',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Cont (FUSAM)',
      orgao: 'FUSAM',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Em todas as sentenças a seguir, a expressão em destaque desempenha a mesma função, qualificando o nome a que se refere, exceto em:',
    text_fragment:
      '<p>«O homem rouco» (Rubem Braga). Compare as funções das expressões destacadas nas alternativas sobre adjunto adnominal e oração subordinada.</p>',
    options: [
      { id: 'A', text: '«página de jornal não é lugar para a gente falar essas coisas».', is_correct: false },
      { id: 'B', text: '«Uma leitora me receitou pelo telefone chá de pitangueira».', is_correct: false },
      { id: 'C', text: '«por favor, mais um pedaço de gelo».', is_correct: false },
      { id: 'D', text: '«tudo isso agravado por um dente de alho bem moído».', is_correct: false },
      { id: 'E', text: '«Alguém me disse que se trata de rouquidão nervosa».', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Adjunto adnominal',
        meta: slideMeta,
        items: [
          { label: 'Modifica nome?', detail: 'Adjunto adnominal caracteriza substantivo próximo.', icon: 'Box' },
          { label: 'A–D', detail: 'Trechos qualificam nome (lugar, leitora, pedaço, dente).', icon: 'Check' },
          { label: 'E — oração', detail: '«Que se trata…» é oração subordinada, não adjunto.', icon: 'GitBranch' },
          { label: 'EXCETO', detail: 'Ache a letra que NÃO qualifica nome como as outras.', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Todas parecem «complementar» algo — teste o núcleo nome.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto adnominal = perto do nome; EXCETO em E.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto homem rouco (Braga): comando EXCETO em adjunto adnominal.',
          'A: «de jornal» qualifica «página» — adjunto adnominal.',
          'B/C/D: qualificam leitora, pedaço, dente — adjunto adnominal.',
          'E: «que se trata de rouquidão nervosa» — oração subordinada substantiva/objeto.',
          'E não qualifica nome como adjunto — é exceção.',
          'Gabarito E.',
          'Em similares: EXCETO em termos — compare função, não só sentido.',
        ],
        footer_rule: 'E = oração, não adjunto adnominal.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ADJUNTO ADNOMINAL',
        rows: [
          { label: 'Teste', value: 'Modifica qual nome? Característica estável.' },
          { label: '≠ Oração sub.', value: 'Verbo conjugado/subordinada — outro cargo.' },
          { label: 'EXCETO', value: 'Três adjuntos + uma função distinta.' },
          { label: 'Nesta questão', value: 'E — exceção' },
        ],
        footer_rule: 'Nome + característica = adjunto adnominal.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — cada letra certa exceto E',
        items: [
          { label: 'A — página de jornal', detail: 'Parece circunstância.', correct: '«De jornal» caracteriza página — adjunto adnominal correto.' },
          { label: 'B — chá de pitangueira', detail: 'Parece objeto.', correct: 'Qualifica o que foi receitado — adjunto adnominal.' },
          { label: 'C — pedaço de gelo', detail: 'Parece OD.', correct: '«De gelo» caracteriza pedaço — adjunto adnominal.' },
          { label: 'D — dente de alho', detail: 'Parece complemento verbal.', correct: '«De alho» caracteriza dente — adjunto adnominal.' },
          {
            label: 'E — rouquidão nervosa',
            detail: 'Oração subordinada parece qualificar «alguém».',
            correct: 'EXCETO: função distinta — oração subordinada, não adjunto adnominal.',
          },
          { label: 'Em outra banca…', detail: 'Trocam E por outra oração subordinada.', correct: 'Mesmo trilho: oração ≠ adjunto adnominal.' },
        ],
        footer_rule: 'Só E foge do padrão adjunto adnominal.',
      },
    ],
  },

  'cpcon-uepb-nazarezinho-termos-regencia-explicar-3483810': {
    family: 'text_fragment',
    source_tec_id: '3483810',
    source_note: 'Regência explicar OD+OI — CPCON UEPB Nazarezinho 2025 tec 3483810',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag (Pref Nazarezinho)',
      orgao: 'Pref. Nazarezinho',
      ano: '2025',
      cargo_header: 'COMBATE ÀS ENDEMIAS',
    },
    instruction:
      'No trecho «Minha avó tentou me explicar que Jesus não era Deus», a regência do verbo «explicar» exige, neste contexto:',
    text_fragment:
      '<p>«O papa vai ao banheiro?» (Tiago Germano). «Minha avó tentou me explicar que Jesus não era Deus».</p>',
    options: [
      { id: 'A', text: 'dois objetos diretos.', is_correct: false },
      { id: 'B', text: 'um objeto direto e um objeto indireto.', is_correct: true },
      { id: 'C', text: 'apenas um objeto direto.', is_correct: false },
      { id: 'D', text: 'apenas um objeto indireto.', is_correct: false },
      { id: 'E', text: 'complemento nominal.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Explicar — dupla regência',
        meta: slideMeta,
        items: [
          { label: 'Explicar algo', detail: 'Objeto direto: o conteúdo (que Jesus…).', icon: 'CornerDownRight' },
          { label: 'Explicar a alguém', detail: 'Objeto indireto: me — a quem se explica.', icon: 'User' },
          { label: 'Papa / banheiro', detail: 'Texto Germano — avó explica criança sobre Jesus.', icon: 'BookOpen' },
          { label: '≠ CN', detail: 'Complemento nominal completa nome — não verbo explicar.', icon: 'XCircle' },
          { label: 'Pegadinha: só OD', detail: 'Ignorar o pronome «me».', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Explicar + conteúdo + a alguém.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Texto papa/banheiro (Germano): verbo explicar — transitivo direto e indireto.',
          'OD: «que Jesus não era Deus» — o quê explicou?',
          'OI: «me» — a quem explicou?',
          'A: dois OD — «me» não é OD.',
          'C/D: falta um dos complementos.',
          'E: CN completa nome, não verbo explicar.',
          'Gabarito B — OD + OI.',
          'Em similares: explicar/dizer/contar + me/te/lhe → OD + OI.',
        ],
        footer_rule: 'Conteúdo (OD) + destinatário (OI).',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXPLICAR',
        rows: [
          { label: 'OD', value: 'O quê? — oração/conteúdo.' },
          { label: 'OI', value: 'A quem? — me, te, lhe…' },
          { label: '≠ 2 OD', value: 'Pronome oblíquo átono = OI.' },
          { label: 'Nesta questão', value: 'B — OD + OI' },
        ],
        footer_rule: 'Explicar-me que… = OI + OD.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Regência de explicar',
        items: [
          { label: 'A — 2 OD', detail: '«Me» e «que» parecem dois objetos diretos.', correct: '«Me» é OI (a quem), não segundo OD.' },
          { label: 'C — só OD', detail: 'Esquece o pronome átono.', correct: '«Me» é complemento obrigatório — OI.' },
          { label: 'D — só OI', detail: 'Só olha «me».', correct: 'Falta o conteúdo «que Jesus…» — OD.' },
          { label: 'E — CN', detail: '«Deus» parece nome complementado.', correct: 'CN após nome; aqui é complemento verbal.' },
          { label: 'Em outra banca…', detail: 'Trocam por «ensinar-lhe que…».', correct: 'Mesma dupla: OD + OI.' },
        ],
        footer_rule: 'B: um OD e um OI.',
      },
    ],
  },

  'educa-pb-pedras-fogo-termos-objeto-direto-3576833': {
    family: 'conceito',
    source_tec_id: '3576833',
    source_note: 'OD imperativo Procure — EDUCA PB Pedras de Fogo 2025 tec 3576833',
    meta: {
      banca: 'EDUCA PB',
      prova: 'Aten CD (Pref Pedras de Fogo)',
      orgao: 'Pref. Pedras de Fogo',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      '«Procure o conselho tutelar, delegacia ou disque 100.» O termo destacado exerce a função de:',
    options: [
      { id: 'A', text: 'Sujeito simples.', is_correct: false },
      { id: 'B', text: 'Objeto direto.', is_correct: true },
      { id: 'C', text: 'Complemento nominal.', is_correct: false },
      { id: 'D', text: 'Adjunto adverbial de autoridade.', is_correct: false },
      { id: 'E', text: 'Vocativo.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imperativo + complemento',
        meta: slideMeta,
        items: [
          { label: 'Procure', detail: 'Imperativo — verbo transitivo direto.', icon: 'CornerDownRight' },
          { label: 'O quê?', detail: 'Conselho tutelar… — complemento sem prep.', icon: 'Target' },
          { label: 'OD', detail: 'Responde ao verbo sem preposição.', icon: 'Check' },
          { label: '≠ Vocativo', detail: 'Não chama interlocutor — é destino da ação.', icon: 'UserX' },
          { label: 'Pegadinha: sujeito', detail: '«Conselho» parece quem age.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Imperativo: sujeito elíptico (você).',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Verbo «Procure» — imperativo; sujeito = você (elipse).',
          'Transitivo direto: procure o quê?',
          '«O conselho tutelar, delegacia ou disque 100» — OD (enumeração).',
          'A: conselho não é sujeito — quem age é você.',
          'C/D/E: não são CN, adjunto nem vocativo.',
          'Gabarito B — objeto direto.',
          'Em similares: imperativo + o quê? → OD.',
        ],
        footer_rule: 'Procure + destino = OD.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMPERATIVO',
        rows: [
          { label: 'Sujeito', value: 'Você (elíptico) — quem deve procurar.' },
          { label: 'OD', value: 'O quê procurar — sem preposição.' },
          { label: '≠ Vocativo', value: 'Chama alguém — não completa verbo.' },
          { label: 'Nesta questão', value: 'B — objeto direto' },
        ],
        footer_rule: 'Procure + OD.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Função do termo destacado',
        items: [
          { label: 'A — sujeito', detail: '«Conselho tutelar» parece agente.', correct: 'Sujeito é você; conselho é meta da ação — OD.' },
          { label: 'C — CN', detail: '«Tutelar» parece nome complementado.', correct: 'Completa verbo procurar, não substantivo isolado.' },
          { label: 'D — adv. autoridade', detail: 'Parece circunstância.', correct: 'É complemento verbal direto, não circunstância.' },
          { label: 'E — vocativo', detail: 'Parece chamamento.', correct: 'Vocativo isola interlocutor — aqui é OD.' },
          { label: 'Em outra banca…', detail: 'Trocam por «Busque a delegacia».', correct: 'Mesmo padrão: OD do imperativo.' },
        ],
        footer_rule: 'B: objeto direto de Procure.',
      },
    ],
  },

  'cpcon-olivedos-termos-complemento-nominal-3709441': {
    family: 'text_fragment',
    source_tec_id: '3709441',
    source_note: 'CN «papel importante» — CPCON UEPB Olivedos 2025 tec 3709441',
    meta: {
      banca: 'CPCON UEPB',
      prova: 'Ag Adm (Pref Olivedos)',
      orgao: 'Pref. Olivedos',
      ano: '2025',
      cargo_header: 'TÉCNICO',
    },
    instruction:
      'Observe o trecho «A leitura também desempenha um papel importante na saúde mental, oferecendo uma forma de escapismo saudável e relaxamento», ressalta Andréia. A expressão em destaque funciona como:',
    text_fragment:
      '<p>Texto sobre hábito de leitura no Brasil (Andréia Roma / Jovem Pan). «A leitura também desempenha um <strong>papel importante</strong> na saúde mental…»</p>',
    options: [
      { id: 'A', text: 'objeto direto preposicionado.', is_correct: false },
      { id: 'B', text: 'objeto indireto.', is_correct: false },
      { id: 'C', text: 'complemento nominal.', is_correct: true },
      { id: 'D', text: 'adjunto adverbial de modo.', is_correct: false },
      { id: 'E', text: 'predicativo do sujeito.', is_correct: false },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nome + de quê?',
        meta: slideMeta,
        items: [
          { label: 'Papel', detail: 'Núcleo nominal — nome a ser complementado.', icon: 'Box' },
          { label: 'Importante', detail: 'De quê? + prep. — completa o nome «papel».', icon: 'User' },
          { label: 'CN', detail: 'Regência nominal: papel importante em/na…', icon: 'Check' },
          { label: '≠ OD', detail: 'Não completa verbo desempenhar diretamente.', icon: 'XCircle' },
          { label: 'Pegadinha: adj. modo', detail: '«Importante» parece circunstância.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Adjunto adnominal ou CN — teste o núcleo nome.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Estrutura: desempenha um papel importante na saúde mental.',
          '«Importante» liga-se a «papel» — complemento nominal (característica do nome).',
          'Alternativa: adjunto adnominal — mas a banca classifica CN em «papel importante».',
          'A/B: não são complementos verbais de desempenhar isoladamente.',
          'D: não é circunstância de modo do verbo.',
          'E: não atribui estado ao sujeito «leitura» como predicativo.',
          'Gabarito C — complemento nominal.',
          'Em similares: papel/função/ideia + adj. + prep. → CN ou adjunto adnominal (leia o gabarito).',
        ],
        footer_rule: 'Papel + importante → complemento do nome.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPLEMENTO NOMINAL',
        rows: [
          { label: 'Teste', value: 'De quê? — completa substantivo com prep.' },
          { label: '× Verbo', value: 'OD/OI completam verbo — outro eixo.' },
          { label: '× Predicativo', value: 'Atribui ao sujeito via verbo de ligação.' },
          { label: 'Nesta questão', value: 'C — complemento nominal' },
        ],
        footer_rule: 'Nome papel + importante.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'CN × adjunto × OD',
        items: [
          { label: 'A — OD prep.', detail: '«Na saúde mental» parece OD.', correct: 'Destaque é «importante» ligado a papel — CN.' },
          { label: 'B — OI', detail: 'Prep. induz OI.', correct: 'Prep. ligada ao nome, não ao verbo como OI.' },
          { label: 'D — adv. modo', detail: 'Importante parece modo de desempenhar.', correct: 'Caracteriza papel, não o verbo.' },
          { label: 'E — pred. sujeito', detail: 'Leitura parece «importante».', correct: 'Importante qualifica papel, não sujeito.' },
          { label: 'Em outra banca…', detail: 'Podem trocar por «papel fundamental».', correct: 'Mesma matriz: de quê? + nome.' },
        ],
        footer_rule: 'C: complemento nominal.',
      },
    ],
  },

  'avancasp-sm-arcanjo-termos-transitivo-direto-3709806': {
    family: 'text_fragment',
    source_tec_id: '3709806',
    source_note: 'Transitividade produzir TD — AVANÇASP Ag Pref SM Arcanjo 2025 tec 3709806',
    meta: {
      banca: 'AVANÇASP',
      prova: 'Ag (Pref SM Arcanjo)',
      orgao: 'Pref. São Miguel Arcanjo',
      ano: '2025',
      cargo_header: 'SANEAMENTO',
    },
    instruction:
      'Releia o trecho: «Não posso mais produzir abotoaduras de punho para camisas sem punho (…).» Em relação à regência verbal do verbo «produzir» que ocorre especificamente no trecho destacado do texto, assinale a alternativa correta. O verbo «produzir» na frase acima é:',
    text_fragment:
      '<p>«Abotoaduras» (Carlos Drummond de Andrade, adaptado). «Não posso mais produzir abotoaduras de punho para camisas sem punho».</p>',
    options: [
      { id: 'A', text: 'Transitivo indireto.', is_correct: false },
      { id: 'B', text: 'Transitivo direto pronominal.', is_correct: false },
      { id: 'C', text: 'Intransitivo.', is_correct: false },
      { id: 'D', text: 'Transitivo indireto pronominal.', is_correct: false },
      { id: 'E', text: 'Transitivo direto.', is_correct: true },
    ],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Produzir — o quê?',
        meta: slideMeta,
        items: [
          { label: 'Produzir', detail: 'Verbo transitivo — exige complemento.', icon: 'CornerDownRight' },
          { label: 'Abotoaduras', detail: 'OD — o quê produzir? Sem preposição obrigatória.', icon: 'Target' },
          { label: 'TD', detail: 'Transitivo direto — complemento sem prep.', icon: 'Check' },
          { label: '≠ TI', detail: '«Para camisas» é adjunto, não OI obrigatório.', icon: 'Ban' },
          { label: 'Pegadinha: intransitivo', detail: 'Achar que «produzir» basta sozinho.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Produzir + coisa = transitivo direto.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Verbo: produzir — necessita complemento (o quê?).',
          '«Abotoaduras de punho» — objeto direto.',
          '«Para camisas» — adjunto adverbial final (finalidade), não OI.',
          'A/D: não há OI obrigatório com prep.',
          'B: não há pronome oblíquo como OD.',
          'C: verbo não é intransitivo — há OD.',
          'Gabarito E — transitivo direto.',
          'Em similares: produzir/fabricar/criar + coisa → TD.',
        ],
        footer_rule: 'OD presente → transitivo direto.',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRANSITIVIDADE',
        rows: [
          { label: 'TD', value: 'Produzir algo — OD sem prep.' },
          { label: 'TI', value: 'Exige prep. no complemento — não é o caso.' },
          { label: 'Intransitivo', value: 'Verbo completo sem complemento — falso aqui.' },
          { label: 'Nesta questão', value: 'E — transitivo direto' },
        ],
        footer_rule: 'Produzir abotoaduras = TD.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'Para camisas ≠ OI',
        items: [
          { label: 'A — TI', detail: '«Para camisas» parece complemento obrigatório.', correct: 'É adjunto de finalidade, não OI de produzir.' },
          { label: 'B — TD pronominal', detail: 'Busca pronome no trecho.', correct: 'Não há pronome oblíquo como OD.' },
          { label: 'C — intransitivo', detail: '«Não posso mais produzir» parece completo.', correct: 'Falta o quê? — abotoaduras (OD).' },
          { label: 'D — TI pronominal', detail: 'Mistura pronome e prep.', correct: 'Sem OI pronominal no trecho.' },
          { label: 'Em outra banca…', detail: 'Trocam por «fabricar camisas».', correct: 'Fabricar + coisa = TD; «para» pode ser adjunto.' },
        ],
        footer_rule: 'E: transitivo direto.',
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
