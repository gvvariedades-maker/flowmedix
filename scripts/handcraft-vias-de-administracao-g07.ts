#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g07 (8 slugs P0 via_vf_absorcao / técnica).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g07.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g07';
const SUBTOPICO = 'Vias de Administração';
const BRANCH = 'via_vf_absorcao';
const REVIEWED = '2026-07-03';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'absorção IM × SC',
    'via subcutânea',
    'via intradérmica',
    'ângulos de punção',
    'sítios anatômicos',
    'via endovenosa',
    'agulhas por via',
    'classificação de vias',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção lenta', 'técnica de punção', 'sítios ID/SC/IM', 'classificação parenteral'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc';
  guideline: string;
  roi_error?: string;
  branch?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(
  q: Q,
  family: string,
  guideline: string,
  slug: string,
  roiError?: string,
  branch: string = BRANCH,
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: branch,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(roiError ? { roi_error: roiError } : {}),
    },
    sources: [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SC_COSPEC_SLIDES = (bancaLabel: string) => [
  {
    type: 'concept_map',
    slide_title: 'Via subcutânea (SC) — mapa da prova',
    meta: slideMeta,
    items: [
      {
        label: 'Comando da prova',
        detail: `Indicação de substâncias para SC — julgue perfil de absorção, irritabilidade e ângulo de punção (${bancaLabel}).`,
        icon: 'Target',
      },
      {
        label: 'Trilho SC no parenteral',
        detail: 'SC = hipoderme, absorção lenta/contínua — não confundir com IM (músculo, mais rápida).',
        icon: 'TrendingUp',
      },
      {
        label: 'Substância adequada',
        detail: 'Fármacos de fácil absorção e não irritantes — insulina, heparina, vacinas de baixa reatividade.',
        icon: 'Syringe',
      },
      {
        label: 'Ângulo clássico',
        detail: '45° a 90° conforme tecido adiposo — não 15° (perfil de ID ou punção superficial errada).',
        icon: 'Gauge',
      },
      {
        label: 'Pegadinha ângulo × via',
        detail: 'Letra B aplica 45° no músculo (IM) e letra D usa 15° na SC — erro ROI angulo_im_errado.',
        icon: 'GitCompare',
      },
      {
        label: 'Pegadinha absorção rápida',
        detail: 'Letras B e D citam “rápida absorção” — perfil de IV/IM, não de hipoderme pouco vascularizada.',
        icon: 'AlertTriangle',
      },
    ],
    footer_rule: 'SC = não irritante · absorção gradual · 45° na hipoderme',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Contexto: substâncias indicadas para via subcutânea/intracutânea.',
      'Eliminar A — curtas/densas + 15° fase interna braço: mistura critério de volume com ângulo de ID.',
      'Eliminar B — rápida absorção + irritantes + 45° nos músculos: descreve IM, não SC.',
      'Eliminar C — alta densidade hidroeletrolítica + 15°: critério inventado, sem base clínica.',
      'Eliminar D — rápida absorção + não irritantes + 15°: irritabilidade ok, mas ângulo e velocidade errados.',
      'Confirmar E — fácil absorção, não irritantes, ~45°: perfil e técnica compatíveis com SC.',
      'Marcar E.',
      'Fixação: SC = lenta no trilho + 45° no tecido adiposo.',
    ],
    footer_rule: 'Feche perfil (lento) + ângulo (45°) antes da letra',
  },
  {
    type: 'golden_rule',
    slide_title: 'Referência — via subcutânea',
    meta: slideMeta,
    content: 'VIA SC — INDICAÇÃO E TÉCNICA',
    rows: [
      { label: 'Perfil de absorção', value: 'Lenta e contínua — hipoderme pouco vascularizada', badge: 'hot' },
      { label: 'Substâncias', value: 'Não irritantes · fácil absorção (insulina, heparina)', badge: 'ok' },
      { label: 'Ângulo', value: '45° a 90° conforme tecido adiposo', badge: 'warn', exam_hint: 'E acerta ~45°; D erra com 15°.' },
      { label: 'Sítios comuns', value: 'Abdome · face externa braço · coxa anterior', badge: 'info' },
      { label: 'IM × SC', value: 'IM absorve mais rápido — músculo mais vascularizado', badge: 'ok' },
      { label: 'ID × SC', value: 'ID = 10–15° com pápula — não confundir ângulos', badge: 'warn' },
    ],
    footer_rule: 'Decore: SC lenta · 45° · não irritante',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — INDICAÇÃO SC',
    items: [
      {
        label: 'Letra A — 15° fase interna do braço',
        detail: 'Ângulo de ID/teste cutâneo, não técnica SC terapêutica clássica.',
        correct: 'SC usa pinça de pele e ~45° no tecido adiposo — não 15° superficial.',
      },
      {
        label: 'Letra B — irritantes no músculo',
        detail: 'Irritantes e 45° no músculo descrevem punção IM, não hipoderme.',
        correct: 'SC exige não irritantes; irritantes costumam ir para IM com volume adequado.',
      },
      {
        label: 'Letra C — densidade hidroeletrolítica',
        detail: 'Critério sem respaldo nas referências de enfermagem para escolha da via.',
        correct: 'Volume e perfil de absorção definem SC — não “densidade hidroeletrolítica”.',
      },
      {
        label: 'Letra D — rápida absorção + 15°',
        detail: 'Une perfil de IV/IM (rápido) com ângulo de ID — duplo erro.',
        correct: 'SC é gradual; ângulo correto ~45°, não 15°.',
      },
    ],
    footer_rule: 'Cada distrator erra um eixo: ângulo · sítio · velocidade',
  },
];

const SPECS: Record<string, Pack> = {
  'objetiva-concursos-enfermagem-vias-de-administracao-1778968687469-4': {
    family: 'conceito',
    guideline: 'COFEN — ângulos ID 10–15° · SC 45–90° · IM 90° · EV cubital 15°',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica parenteral — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Associar quatro vias (ID, SC, IM, EV) às descrições técnicas — eixo ângulo e sítio, não velocidade de absorção.',
            icon: 'Target',
          },
          {
            label: 'Intramuscular (3)',
            detail: 'Músculo vascularizado, pouca inervação, agulha perpendicular ou 90° — absorção rápida no trilho.',
            icon: 'Bone',
          },
          {
            label: 'Endovenosa (4)',
            detail: 'Vaso superficial cubital, 15° ou paralela à pele — acesso direto à corrente sanguínea.',
            icon: 'Zap',
          },
          {
            label: 'Subcutânea (2)',
            detail: 'Ângulo variável 45°, 60° ou 90° conforme tecido adiposo — não fixar só 90°.',
            icon: 'Syringe',
          },
          {
            label: 'Intradérmica (1)',
            detail: 'Bisel para cima, 10–15° ou paralela, pápula visível — teste cutâneo clássico.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha trocar vias',
            detail: 'Banca embaralha descrições entre IM/SC/EV/ID — decore ângulo + sítio antes de numerar.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'IM 90° · EV cubital 15° · SC 45–90° · ID pápula 10–15°',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler as quatro descrições e rotular mentalmente: IM · EV · SC · ID.',
          'Descrição 1 (músculo vascularizado, 90°) → via 3 (IM).',
          'Descrição 2 (cubital, 15°) → via 4 (EV).',
          'Descrição 3 (ângulo variável 45–90° no tecido) → via 2 (SC).',
          'Descrição 4 (bisel cima, pápula, 10–15°) → via 1 (ID).',
          'Sequência: 3 – 4 – 2 – 1.',
          'Eliminar A (1-2-3-4), C (4-2-3-1) e D (2-1-4-3) — permutam pares IM/SC/ID.',
          'Marcar B.',
          'Fixação: feche ângulo + camada tecidual antes de olhar as letras.',
        ],
        footer_rule: '3-4-2-1 = IM · EV · SC · ID',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos e sítios',
        meta: slideMeta,
        content: 'PUNÇÃO PARENTERAL — TÉCNICA',
        rows: [
          { label: 'Intramuscular', value: '90° no músculo — ventroglúteo/deltoide/vasto', badge: 'ok' },
          { label: 'Endovenosa', value: '15° ou paralela — veia cubital/antebrço', badge: 'hot', exam_hint: 'Segunda descrição do enunciado.' },
          { label: 'Subcutânea', value: '45° a 90° — pinça de pele no tecido adiposo', badge: 'warn' },
          { label: 'Intradérmica', value: '10–15° — pápula visível, bisel superior', badge: 'warn' },
          { label: 'Calibre ID', value: 'Agulha fina curta (ex. 13×0,38) — não confundir com IM', badge: 'info' },
        ],
        footer_rule: 'Ângulo define a via — não marque por intuição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSOCIAÇÃO DE VIAS',
        items: [
          {
            label: 'Letra A — 1-2-3-4',
            detail: 'Coloca ID na descrição de IM e embaralha EV/SC.',
            correct: 'IM (descrição 1) é via 3, não via 1 (ID com pápula).',
          },
          {
            label: 'Letra C — 4-2-3-1',
            detail: 'Inicia com EV na descrição de IM — primeiro par já invertido.',
            correct: 'Primeira descrição = músculo 90° → IM (3), não EV (4).',
          },
          {
            label: 'Letra D — 2-1-4-3',
            detail: 'Troca SC com ID e fecha com IM na descrição de EV.',
            correct: 'Pápula 10–15° = ID (1); cubital = EV (4) — pares não permutáveis.',
          },
          {
            label: 'Confundir SC com IM pelo ângulo',
            detail: 'Ambas podem usar 90° em tecido espesso — leia sítio (adiposo × músculo).',
            correct: 'Descrição 3 fala em constituição do tecido adiposo → SC, não IM.',
          },
        ],
        footer_rule: 'Decore os quatro pares antes de montar a sequência',
      },
    ],
  },

  'coseac-uff-enfermagem-vias-de-administracao-1778969007166-5': {
    family: 'conceito',
    guideline: 'COFEN — SC: não irritantes · absorção gradual · ângulo ~45°',
    roi_error: 'angulo_im_errado',
    slides: SC_COSPEC_SLIDES('Coseac UFF'),
  },

  'fundatec-enfermagem-vias-de-administracao-1778968825263-2': {
    family: 'conceito',
    guideline: 'COFEN — calibre/agulha por via: ID fina · SC curta · IM média · EV curta · aspiração grande calibre',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Agulhas por via — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Relacionar três tipos de agulha às cinco funções (ID, SC, aspiração, IM, EV) — eixo material, não absorção.',
            icon: 'Target',
          },
          {
            label: 'Agulha 1 — 13×0,45 mm',
            detail: 'Curta e fina — intradérmica e subcutânea (insulina, testes).',
            icon: 'Droplets',
          },
          {
            label: 'Agulha 2 — 30×0,70 mm',
            detail: 'Média — intramuscular e acesso venoso periférico.',
            icon: 'Syringe',
          },
          {
            label: 'Agulha 3 — 40×12 mm',
            detail: 'Grande calibre — aspiração de frascos (calibre largo).',
            icon: 'Package',
          },
          {
            label: 'Pegadinha calibre × via',
            detail: 'Banca repete números na sequência — valide cada par antes de fechar a letra.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'ID/SC = fina · aspiração = grossa · IM/EV = média',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Listar coluna 2: ID · SC · aspiração · IM · EV.',
          'ID → agulha 1 (13×0,45 fina).',
          'SC → agulha 1 (mesmo perfil curto fino).',
          'Aspiração → agulha 3 (40×12 — calibre largo para retirar do frasco).',
          'IM → agulha 2 (30×0,70 — alcance muscular).',
          'EV → agulha 2 (30×0,70 — venosa periférica).',
          'Sequência: 1 – 1 – 3 – 2 – 2 → letra C.',
          'Eliminar demais letras que trocam aspiração (3) com IM/EV.',
          'Marcar C.',
          'Fixação: calibre largo só na aspiração do medicamento.',
        ],
        footer_rule: '1-1-3-2-2 fecha ID·SC·aspiração·IM·EV',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — agulhas',
        meta: slideMeta,
        content: 'AGULHAS — VIA E CALIBRE',
        rows: [
          { label: 'Intradérmica', value: 'Curta fina (13×0,45) — pápula', badge: 'warn' },
          { label: 'Subcutânea', value: 'Curta fina — mesmo perfil que ID em muitos serviços', badge: 'ok' },
          { label: 'Aspiração', value: 'Calibre largo (40×12) — retirar solução do frasco', badge: 'hot', exam_hint: 'Terceiro par da sequência = 3.' },
          { label: 'Intramuscular', value: 'Média 30×0,70 — atinge massa muscular', badge: 'ok' },
          { label: 'Endovenosa', value: 'Média 30×0,70 — veia periférica', badge: 'ok' },
        ],
        footer_rule: 'Aspiração ≠ punção — calibre maior no frasco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AGULHAS',
        items: [
          {
            label: 'Letra A — 1-2-3-2-1',
            detail: 'Coloca agulha grossa (3) na IM e fina na EV.',
            correct: 'Aspiração = agulha 3; IM/EV compartilham agulha 2, não 1 na EV.',
          },
          {
            label: 'Letra B — 2-2-1-3-3',
            detail: 'Inverte ID/SC (deveria ser 1) e fecha EV com agulha 3.',
            correct: 'ID e SC usam agulha 1; calibre 3 é para aspiração, não acesso venoso.',
          },
          {
            label: 'Letra D — 3-1-2-1-1',
            detail: 'Começa com agulha grossa na ID — calibre incompatível.',
            correct: 'ID exige agulha fina curta (1), não 40×12.',
          },
          {
            label: 'Letra E — 1-2-2-3-2',
            detail: 'Troca aspiração (deveria ser 3) com IM (2).',
            correct: 'Terceiro parêntese = aspiração do frasco → sempre agulha 3 nesta questão.',
          },
        ],
        footer_rule: 'Valide aspiração (3) antes de fechar IM/EV',
      },
    ],
  },

  'omni-enfermagem-vias-de-administracao-1778968956139-5': {
    family: 'conceito',
    guideline: 'COFEN — IM: massa muscular · soluções aquosas/oleosas · vacinas irritantes',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via intramuscular — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinale a alternativa CORRETA sobre IM — banca troca definições entre SC, ID, IM e IV.',
            icon: 'Target',
          },
          {
            label: 'Núcleo IM',
            detail: 'Injeção na massa muscular — absorção mais rápida que SC; aceita soluções aquosas e oleosas.',
            icon: 'Bone',
          },
          {
            label: 'Vacinas irritantes',
            detail: 'IM é via clássica para vacinas com soluções mais irritantes (volume e vascularização adequados).',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha SC × IM',
            detail: 'Letra A descreve hipoderme (SC) quando o comando pede IM.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha ID × IM',
            detail: 'Letra C mistura intradérmica com deltoide muscular — camadas e indicações distintas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'IM = músculo · irritantes · aquoso/oleoso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Filtro: só alternativas que descrevem intramuscular (IM).',
          'Eliminar A — hipoderme/SC: locais de SC (braço, abdome, coxa), não definição de IM.',
          'Confirmar B — massa muscular, aquoso/oleoso, vacinas irritantes: perfil IM completo.',
          'Eliminar C — intradérmica no deltoide com BCG: confunde ID (pele) com músculo.',
          'Eliminar D — veia/corrente sanguínea: definição de endovenosa.',
          'Marcar B.',
          'Fixação: leia a camada tecidual antes de aceitar a letra.',
        ],
        footer_rule: 'Músculo + irritante = B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via IM',
        meta: slideMeta,
        content: 'VIA IM — DEFINIÇÃO E INDICAÇÃO',
        rows: [
          { label: 'Sítio', value: 'Massa muscular — deltoide, vasto, ventroglúteo', badge: 'hot' },
          { label: 'Absorção', value: 'Rápida no trilho parenteral (músculo vascularizado)', badge: 'ok' },
          { label: 'Soluções', value: 'Aquosas e oleosas — volumes moderados', badge: 'ok' },
          { label: 'Vacinas irritantes', value: 'IM clássica quando irritabilidade exige músculo', badge: 'warn', exam_hint: 'B fecha o gabarito.' },
          { label: 'SC × IM', value: 'SC = hipoderme lenta; IM = músculo mais rápido', badge: 'info' },
        ],
        footer_rule: 'IM ≠ hipoderme ≠ veia ≠ pápula cutânea',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO IM',
        items: [
          {
            label: 'Letra A — hipoderme',
            detail: 'Descreve tecido subcutâneo e locais clássicos de SC.',
            correct: 'IM exige massa muscular — hipoderme é via SC.',
          },
          {
            label: 'Letra C — intradérmica no deltoide',
            detail: 'ID fica entre derme/epiderme; deltoide é alvo muscular (IM).',
            correct: 'BCG é intradérmica superficial — não definir IM como “entre derme e epiderme”.',
          },
          {
            label: 'Letra D — corrente sanguínea',
            detail: 'Acesso venoso direto = endovenosa, não intramuscular.',
            correct: 'IV introduz na veia; IM deposita no músculo para absorção gradual.',
          },
          {
            label: 'Transferência SC → IM',
            detail: 'Aluno reconhece locais de punção mas não a camada.',
            correct: 'Pergunte: agulha no músculo ou no tecido adiposo?',
          },
        ],
        footer_rule: 'Camada tecidual define a via',
      },
    ],
  },

  'coseac-uff-enfermagem-vias-de-administracao-1778969007166-8': {
    family: 'conceito',
    guideline: 'COFEN — SC: não irritantes · absorção gradual · ângulo ~45° (FMS Niterói)',
    roi_error: 'angulo_im_errado',
    slides: SC_COSPEC_SLIDES('Coseac FMS Niterói'),
  },

  'ibade-enfermagem-vias-de-administracao-1778968862077-0': {
    family: 'conceito',
    guideline: 'COFEN — sítios ID: face anterior antebraço · região subescapular (testes cutâneos)',
    roi_error: 'vias_concept_generic_farmacologia',
    branch: 'via_tecnica_admin',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítios intradérmicos — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Locais indicados para via intradérmica — não confundir com SC (abdome/coxa) nem IM (ventroglútea).',
            icon: 'Target',
          },
          {
            label: 'Antebraço anterior',
            detail: 'Clássico para testes de sensibilidade e algumas vacinas — pele fina com pápula visível.',
            icon: 'Droplets',
          },
          {
            label: 'Região subescapular',
            detail: 'Alternativa de sítio ID em serviços — mantém técnica superficial.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha SC × ID',
            detail: 'Letra A cita abdome e faces do braço — locais de SC, não ID terapêutica.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha IM × ID',
            detail: 'Letra E ventroglútea é sítio IM — não intradérmica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'ID = antebraço/subescapular · SC = abdome/coxa · IM = ventroglútea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Filtro: sítios de punção intradérmica (superficial, pápula).',
          'Eliminar A — faces externa/posterior braço e abdome: perfil SC.',
          'Eliminar B — anterolateral da coxa: SC clássica.',
          'Confirmar C — antebraço anterior + subescapular: par ID aceito.',
          'Eliminar D — lateral coxa e infraescapular: mistura SC com região dorsal sem critério ID.',
          'Eliminar E — ventroglútea: sítio IM seguro.',
          'Marcar C.',
          'Fixação: ID = pele superficial com pápula — não músculo nem hipoderme profunda.',
        ],
        footer_rule: 'Antebraço + subescapular → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios ID',
        meta: slideMeta,
        content: 'INTRADÉRMICA — SÍTIOS',
        rows: [
          { label: 'Antebraço anterior', value: 'Padrão para testes e vacinas ID', badge: 'hot', exam_hint: 'Metade do gabarito C.' },
          { label: 'Subescapular', value: 'Alternativa dorsal para ID', badge: 'ok', exam_hint: 'Outra metade do gabarito C.' },
          { label: 'SC — abdome/coxa', value: 'Hipoderme — não ID', badge: 'warn' },
          { label: 'IM — ventroglútea', value: 'Músculo profundo — não ID', badge: 'warn' },
          { label: 'Técnica ID', value: '10–15° · pápula · bisel superior', badge: 'info' },
        ],
        footer_rule: 'Decore três sítios: ID superficial · SC adiposo · IM muscular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIOS ID',
        items: [
          {
            label: 'Letra A — abdome e braço',
            detail: 'Locais clássicos de insulina/heparina SC.',
            correct: 'ID usa antebraço ou região dorsal superficial — não abdome.',
          },
          {
            label: 'Letra B — anterolateral da coxa',
            detail: 'Coxa anterior é SC frequente em pediatria/adulto.',
            correct: 'ID não é sítio de coxa muscular nem adiposa profunda nesta questão.',
          },
          {
            label: 'Letra E — ventroglútea',
            detail: 'Sítio IM de eleição em adultos.',
            correct: 'Ventroglútea exige agulha no músculo — camada errada para ID.',
          },
          {
            label: 'Letra D — infraescapular + coxa',
            detail: 'Mistura região dorsal com coxa sem par ID clássico.',
            correct: 'Gabarito exige antebraço anterior + subescapular — par específico.',
          },
        ],
        footer_rule: 'Nomeie a camada antes do sítio anatômico',
      },
    ],
  },

  'quadrix-enfermagem-vias-de-administracao-1778968877204-3': {
    family: 'conceito',
    guideline: 'COFEN/Potter — parenteral = fora do TGI · IV direta na veia · ID superficial · VO múltiplas formas',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificação de vias — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Administração segura de medicamentos na prática da enfermagem — assinale a alternativa correta sobre vias.',
            icon: 'Target',
          },
          {
            label: 'Base de conhecimento',
            detail: 'Conhecimento técnico sobre vias permite administração segura — definição literal antes de marcar.',
            icon: 'BookOpen',
          },
          {
            label: 'Endovenosa',
            detail: 'Medicamento diretamente na veia — absorção imediata no trilho.',
            icon: 'Zap',
          },
          {
            label: 'Parenteral amplo',
            detail: 'Fora do TGI: IV, IM, SC, ID — não se reduz à derme apenas.',
            icon: 'Syringe',
          },
          {
            label: 'Via oral',
            detail: 'Comprimidos, cápsulas, soluções, suspensões — não só líquido.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha ID × IM',
            detail: 'Letra D descreve nádegas/deltoide — sítio IM, não intradérmica.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'IV = veia · parenteral ≠ só derme · VO ≠ só líquido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: administração de medicamentos exige conhecimento das vias para prática segura de enfermagem.',
          'Testar A — oral só solução líquida: falso — comprimidos e cápsulas também são VO.',
          'Confirmar B — EV na veia do paciente: definição correta.',
          'Eliminar C — parenteral = injeção na derme: reduz parenteral à ID; ignora IV/IM/SC.',
          'Eliminar D — ID = nádegas/deltoide: descreve IM, não pápula intradérmica.',
          'Marcar B.',
          'Fixação: parenteral é categoria ampla; IV é subtipo com acesso venoso.',
        ],
        footer_rule: 'Só B define corretamente a endovenosa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — definições',
        meta: slideMeta,
        content: 'VIAS — DEFINIÇÕES DE PROVA',
        rows: [
          { label: 'Endovenosa (IV)', value: 'Diretamente na veia — efeito imediato', badge: 'hot', exam_hint: 'Gabarito B.' },
          { label: 'Parenteral', value: 'IV · IM · SC · ID — fora do lúmen digestivo', badge: 'warn' },
          { label: 'Intradérmica', value: '10–15° na derme — pápula; não músculo', badge: 'ok' },
          { label: 'Oral (VO)', value: 'Sólidos e líquidos por deglutição', badge: 'info' },
          { label: 'IM', value: 'Massa muscular — deltoide, ventroglútea, vasto', badge: 'ok' },
        ],
        footer_rule: 'Definição literal antes de marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÕES',
        items: [
          {
            label: 'Letra A — oral só líquido',
            detail: 'Ignora comprimidos, drágeas e cápsulas.',
            correct: 'VO abrange sólidos e líquidos — não restringir a solução.',
          },
          {
            label: 'Letra C — parenteral = derme',
            detail: 'Reduz categoria ampla à intradérmica.',
            correct: 'Parenteral inclui IV, IM e SC — não é sinônimo de ID.',
          },
          {
            label: 'Letra D — ID = nádegas',
            detail: 'Nádegas/deltoide são alvos musculares (IM).',
            correct: 'ID é superficial com pápula — antebraço clássico.',
          },
          {
            label: 'Marcar IV por exclusão rápida',
            detail: 'B parece simples — valide mecanismo antes de fechar.',
            correct: 'B é correta porque descreve acesso venoso direto — única definição íntegra.',
          },
        ],
        footer_rule: 'C e D trocam categoria parenteral × camada',
      },
    ],
  },

  'cpcon-uepb-enfermagem-vias-de-administracao-1778968629127-0': {
    family: 'conceito',
    guideline: 'Potter/COFEN — vantagens/desvantagens por via: inalatória respiratória · parenteral sem TGI · tópicas locais/transdérmicas',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vantagens por via — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Associar seis vias (I–VI) a vantagens/desvantagens — eixo indicação clínica, não técnica de punção.',
            icon: 'Target',
          },
          {
            label: 'VI Inalatória',
            detail: 'Alívio respiratório local + gases anestésicos — primeira descrição do enunciado.',
            icon: 'Wind',
          },
          {
            label: 'V Mucosas tópicas',
            detail: 'Alternativa quando VO contraindicada — mucosa absorve sem deglutição.',
            icon: 'Droplets',
          },
          {
            label: 'IV Transdérmica',
            detail: 'Efeito sistêmico com dor mínima — adesivo libera através da pele.',
            icon: 'Activity',
          },
          {
            label: 'III Tópica pele',
            detail: 'Desvantagem: resíduo oleoso/pastoso que suja roupas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'II Parenteral',
            detail: 'Quando VO impossível — bypass parcial do TGI (IV/IM/SC/ID).',
            icon: 'Syringe',
          },
          {
            label: 'I Oral/bucal/sublingual',
            detail: 'Desvantagem com disfunção GI — motilidade reduzida pós-anestesia.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha inalatória × oral',
            detail: 'Banca troca gases anestésicos (VI) com vantagens da via oral — erro ROI de associação.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'VI inalação · V mucosa · IV adesivo · III resíduo · II parenteral · I GI',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rotular cada descrição 1–6 com a via I–VI antes das letras.',
          '1 (alívio respiratório + gases) → VI Inalatória.',
          '2 (quando VO contraindicada — mucosa) → V Tópicas mucosas.',
          '3 (efeito local, indolor, poucos efeitos colaterais) → IV Transdérmica.',
          '4 (resíduo oleoso na pele) → III Tópica pele.',
          '5 (quando VO contraindicada — injeção) → II Parenteral.',
          '6 (desvantagem com alteração GI/motilidade) → I Oral/bucal/sublingual.',
          'Sequência: VI, V, IV, III, II, I → letra B.',
          'Eliminar A, C, D, E — permutam inalatória com oral ou tópicas.',
          'Marcar B.',
          'Fixação: leia se a vantagem é local, sistêmica ou bypass do TGI.',
        ],
        footer_rule: 'VI-V-IV-III-II-I → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vantagens por via',
        meta: slideMeta,
        content: 'VIAS — VANTAGENS E LIMITES',
        rows: [
          { label: 'Inalatória', value: 'Ação respiratória local · anestésicos gasosos', badge: 'hot' },
          { label: 'Tópica mucosa', value: 'Bypass da deglutição — VO contraindicada', badge: 'ok' },
          { label: 'Transdérmica', value: 'Sistêmica lenta · conforto · adesivo', badge: 'ok' },
          { label: 'Tópica pele', value: 'Pomadas podem manchar/oleosidade', badge: 'warn' },
          { label: 'Parenteral', value: 'IV/IM/SC quando VO inviável', badge: 'ok' },
          { label: 'Oral', value: 'Depende de motilidade e integridade GI', badge: 'warn', exam_hint: 'Última descrição = desvantagem da via I.' },
        ],
        footer_rule: 'Associe efeito desejado à via antes da letra',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSOCIAÇÃO CPCON',
        items: [
          {
            label: 'Pegadinha inalatória × oral — Letra A',
            detail: 'Repete transdérmica e coloca via oral na descrição de gases anestésicos respiratórios.',
            correct: 'Primeira descrição é inalatória (VI) com gases — não oral/bucal/sublingual (I).',
          },
          {
            label: 'Letra A — I, II, III, IV, V, IV',
            detail: 'Repete IV transdérmica e coloca oral na inalação.',
            correct: 'Primeira descrição é inalatória (VI), não oral (I).',
          },
          {
            label: 'Letra C — VI, I, V, III, II, IV',
            detail: 'Troca segunda descrição (mucosa) com oral.',
            correct: '“VO contraindicada” na 2ª linha = mucosa (V), não oral (I).',
          },
          {
            label: 'Letra D — V, VI, III, IV, I, II',
            detail: 'Inverte inalatória com mucosa no início.',
            correct: 'Gases anestésicos respiratórios = VI, não V.',
          },
          {
            label: 'Letra E — I, II, III, IV, VI, V',
            detail: 'Coloca oral na inalação e desloca parenteral.',
            correct: 'Resíduo oleoso = tópica pele (III); disfunção GI = desvantagem oral (I) na última.',
          },
        ],
        footer_rule: 'Respiratório → VI · mucosa → V · GI → I',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.branch ?? BRANCH),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g07] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g07] total=${ok}`);
}

main();
