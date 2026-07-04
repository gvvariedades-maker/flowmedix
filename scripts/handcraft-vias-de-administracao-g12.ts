#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g12 (8 slugs P0 via_vf_absorcao + biodisponibilidade).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g12.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g12';
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
    'via sublingual',
    'via intradérmica',
    'insulina SC',
    'NPT endovenosa',
    '1ª passagem hepática',
    'indicação de via',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção lenta', '1ª passagem hepática', 'via sublingual', 'via oral', 'NPT'],
};

const MS_INSULINA_SOURCE = {
  id: 'ms-insulina-sc',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cuidados na administração de insulina — via subcutânea',
  year: 2020,
  covers: ['caneta 4mm', 'rodízio de sítios', 'assepsia', 'prega cutânea', 'armazenamento'],
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
  sources?: typeof COFEN_SOURCE[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(
  q: Q,
  family: string,
  guideline: string,
  slug: string,
  roiError?: string,
  sources = [COFEN_SOURCE, POTTER_SOURCE],
) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      handcraft_lote: LOTE,
      ...(roiError ? { roi_error: roiError } : {}),
    },
    sources,
  };
}

const SPECS: Record<string, Pack> = {
  'selecon-enfermagem-vias-de-administracao-1776056401060-3': {
    family: 'conceito',
    guideline: 'COFEN/Potter — IM = via parenteral · absorção rápida no trilho · músculo vascularizado',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM × classificação parenteral — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'IM tem absorção rápida — identifique a classificação ampla da via (parenteral), não a rota enteral.',
            icon: 'Target',
          },
          {
            label: 'Intramuscular (IM)',
            detail: 'Depósito na massa muscular — absorção mais rápida que SC no trilho parenteral.',
            icon: 'Bone',
          },
          {
            label: 'Parenteral',
            detail: 'Fora do TGI: IV, IM, SC, ID — IM pertence a este grupo.',
            icon: 'Syringe',
          },
          {
            label: 'Enteral × parenteral',
            detail: 'Oral e enteral passam pelo lúmen digestivo — não descrevem punção IM.',
            icon: 'GitCompare',
          },
          {
            label: 'Sublingual',
            detail: 'Via de mucosa oral — absorção rápida, mas não é parenteral nem IM.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha oral/enteral',
            detail: 'Letras A e B trocam classificação enteral quando o enunciado fixa IM.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'IM ∈ parenteral — enteral ≠ punção muscular',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler: IM com absorção rápida — qual classificação da via?',
          'IM é injeção fora do trânsito digestivo → categoria parenteral.',
          'Eliminar A (oral) — deglutição, não punção.',
          'Eliminar B (enteral) — sinônimo funcional de oral/TGI.',
          'Eliminar D (sublingual) — mucosa oral, não parenteral clássica da questão.',
          'Confirmar C (parenteral) — engloba IM, IV, SC, ID.',
          'Marcar C.',
          'Fixação: classifique antes de confundir com sublingual.',
        ],
        footer_rule: 'Parenteral = fora do TGI → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação de vias',
        meta: slideMeta,
        content: 'VIAS — PARENTERAL × ENTERAL',
        rows: [
          { label: 'Parenteral', value: 'IV · IM · SC · ID — fora do TGI', badge: 'hot', exam_hint: 'Gabarito C.' },
          { label: 'Intramuscular', value: 'Absorção rápida no trilho — músculo vascularizado', badge: 'ok' },
          { label: 'Enteral/oral', value: 'Deglutição — passa pelo TGI', badge: 'warn' },
          { label: 'Sublingual', value: 'Mucosa oral — bypass parcial hepático, não parenteral', badge: 'info' },
          { label: 'Trilho absorção', value: 'IV > IM > SC — IM mais rápida que SC', badge: 'ok' },
        ],
        footer_rule: 'IM sempre parenteral — nunca oral/enteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO IM',
        items: [
          {
            label: 'Letra A — oral',
            detail: 'Via de deglutição — oposto da punção intramuscular.',
            correct: 'IM não passa pelo trato digestivo — é parenteral.',
          },
          {
            label: 'Letra B — enteral',
            detail: 'Sinônimo de vias que usam o TGI.',
            correct: 'Enteral descreve oral/SNG — não injeção no músculo.',
          },
          {
            label: 'Letra D — sublingual',
            detail: 'Absorção bucal rápida, mas não é a classificação pedida para IM.',
            correct: 'Sublingual é mucosa oral; IM é parenteral muscular.',
          },
          {
            label: 'Responder “oral” pela absorção',
            detail: 'Aluno confunde “rápida” com sublingual/IV.',
            correct: 'Comando pede a via ampla (parenteral), não a mais rápida absoluta.',
          },
        ],
        footer_rule: 'Nomeie a categoria (parenteral) antes da técnica',
      },
    ],
  },

  'selecon-enfermagem-vias-de-administracao-1778968687469-1': {
    family: 'conceito',
    guideline: 'Potter/COFEN — sublingual: mucosa oral · absorção rápida · não mastigar/engolir · bypass parcial hepático',
    roi_error: 'sublingual_irritante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via sublingual — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Medicamento sob a língua — absorção mais rápida que VO e sem mastigar/engolir.',
            icon: 'Target',
          },
          {
            label: 'Mecanismo sublingual',
            detail: 'Mucosa oral rica em vasos — absorção direta, evita TGI e reduz 1ª passagem hepática.',
            icon: 'Droplets',
          },
          {
            label: 'Não mastigar nem engolir',
            detail: 'Manter sob a língua até dissolver — engolir desloca para via oral comum.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha endovenosa',
            detail: 'Letra A cita acesso venoso — não é colocado sob a língua.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha parenteral genérica',
            detail: 'Letra B é categoria ampla — comando descreve técnica oral específica.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha ocular',
            detail: 'Letra D — via local de olho, não de língua.',
            icon: 'Eye',
          },
        ],
        footer_rule: 'Sublingual = sob a língua · rápida · sem deglutição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar pistas: “debaixo da língua”, “não mastigar/engolir”, “mais rápida que oral”.',
          'Via sublingual absorve pela mucosa oral — bypass parcial do fígado.',
          'Eliminar A (endovenosa) — requer punção venosa.',
          'Eliminar B (parenteral) — categoria ampla; enunciado descreve mucosa oral.',
          'Eliminar D (ocular) — via oftálmica.',
          'Confirmar C (sublingual) — única que fecha todas as pistas.',
          'Marcar C.',
          'Fixação: sublingual ≠ parenteral; é via oral especializada.',
        ],
        footer_rule: 'Três pistas → sublingual → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via sublingual',
        meta: slideMeta,
        content: 'VIA SUBLINGUAL — ABSORÇÃO E TÉCNICA',
        rows: [
          { label: 'Local', value: 'Sob a língua — mucosa oral vascularizada', badge: 'hot' },
          { label: 'Velocidade', value: 'Mais rápida que VO comum — efeito em minutos', badge: 'ok' },
          { label: '1ª passagem hepática', value: 'Reduzida — parte vai direto à circulação sistêmica', badge: 'warn' },
          { label: 'Técnica', value: 'Não mastigar · não engolir · manter até dissolver', badge: 'ok' },
          { label: 'Exemplos', value: 'Nitroglicerina SL · alguns benzodiazepínicos', badge: 'info' },
          { label: 'Não confundir', value: 'Parenteral = punção; sublingual = mucosa oral', badge: 'warn' },
        ],
        footer_rule: 'Decore: língua + rápida + não engolir = sublingual',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SUBLINGUAL',
        items: [
          {
            label: 'Letra A — endovenosa',
            detail: 'EV exige cateter/venóclise — não há comprimido sob a língua.',
            correct: 'Acesso venoso é parenteral direto, não mucosa oral.',
          },
          {
            label: 'Letra B — parenteral',
            detail: 'Categoria correta para IM/IV, mas genérica demais para o enunciado.',
            correct: 'Comando pede via específica (sublingual), não classe ampla.',
          },
          {
            label: 'Letra D — ocular',
            detail: 'Colírios e pomadas oftálmicas — via local do olho.',
            correct: 'Ocular não usa mucosa sublingual.',
          },
          {
            label: 'Marcar parenteral por “rápida”',
            detail: 'Sublingual também é rápida — leia o sítio anatômico.',
            correct: '“Debaixo da língua” fecha sublingual, não parenteral.',
          },
        ],
        footer_rule: 'Sítio anatômico > velocidade isolada',
      },
    ],
  },

  'unifil-enfermagem-vias-de-administracao-1778968609115-3': {
    family: 'vf',
    guideline: 'MS — insulina SC: armazenamento 2–8°C · caneta 4mm · assepsia · rodízio ~14 dias · prega se escasso tecido',
    roi_error: 'vias_concept_generic_farmacologia',
    sources: [MS_INSULINA_SOURCE, COFEN_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados insulina SC — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre insulina SC — apenas III está incorreta (gabarito C).',
            icon: 'Target',
          },
          {
            label: 'I — armazenamento',
            detail: 'Seguir fabricante; congelamento acidental invalida o frasco — VERDADEIRA.',
            icon: 'Thermometer',
          },
          {
            label: 'II — prega com 4mm',
            detail: 'Escassez de tecido SC → orientar prega mesmo com agulha curta — VERDADEIRA.',
            icon: 'Hand',
          },
          {
            label: 'III — álcool dispensável',
            detail: 'Assepsia não é dispensável em ambiente clínico — ÚNICA INCORRETA.',
            icon: 'AlertTriangle',
          },
          {
            label: 'IV — rodízio de sítios',
            detail: 'Quadrantes e reutilizar área após cicatrização do sítio previne lipohipertrofia — VERDADEIRA.',
            icon: 'RotateCcw',
          },
          {
            label: 'Erro ROI',
            detail: 'Pegadinha: dispensar assepsia (III) — MS exige higiene da pele.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'I, II e IV corretas · III erra na assepsia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: julgar I–IV e achar “apenas III incorreta”.',
          'I: armazenar conforme fabricante; não usar se congelou → VERDADEIRA.',
          'II: prega cutânea com 4mm se pouco tecido SC → VERDADEIRA.',
          'III: dispensar álcool 70% na assepsia → FALSA — assepsia é necessária.',
          'IV: rodízio por quadrante; reutilizar área após cicatrização → VERDADEIRA.',
          'Conjunto: I, II e IV corretas; só III errada.',
          'Eliminar A (só I e IV), B (só II), D (só I incorreta).',
          'Marcar C — Apenas III está incorreta.',
          'Fixação: assepsia da pele não é opcional na aplicação clínica.',
        ],
        footer_rule: 'III é a única falsa → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina SC',
        meta: slideMeta,
        content: 'INSULINA SC — CUIDADOS MS',
        rows: [
          { label: 'Armazenamento', value: 'Refrigerar conforme fabricante · não congelar · validade após abertura', badge: 'ok' },
          { label: 'Caneta 4mm', value: 'Prega se escasso tecido adiposo — mesmo agulha curta', badge: 'ok' },
          { label: 'Assepsia', value: 'Higienizar pele antes da aplicação — não dispensável', badge: 'hot', exam_hint: 'Item III erra aqui.' },
          { label: 'Rodízio', value: 'Quadrantes · reutilizar sítio após cicatrização', badge: 'ok' },
          { label: 'Pós-aplicação', value: 'Não massagear — risco de absorção irregular', badge: 'warn' },
          { label: 'Via', value: 'Sempre subcutânea — nunca IM ou IV de rotina', badge: 'info' },
        ],
        footer_rule: 'Assepsia + rodízio + temperatura = tríade MS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA UNIFIL',
        items: [
          {
            label: 'Letra A — Apenas I e IV',
            detail: 'Exclui II verdadeira sobre prega com 4mm.',
            correct: 'II também é correta — escassez de tecido exige prega.',
          },
          {
            label: 'Letra B — Apenas II',
            detail: 'Ignora I e IV verdadeiras.',
            correct: 'I (armazenamento) e IV (rodízio de sítios) estão corretas.',
          },
          {
            label: 'Letra D — Apenas I incorreta',
            detail: 'Inverte I — armazenamento e congelamento estão corretos.',
            correct: 'I é verdadeira; a única falsa é III (assepsia dispensável).',
          },
          {
            label: 'Aceitar III como verdadeira',
            detail: 'Dispensar álcool 70% em ambiente de saúde.',
            correct: 'MS orienta assepsia da pele — III é a pegadinha do gabarito.',
          },
        ],
        footer_rule: 'Não dispensar assepsia — III é a armadilha',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1776056338955-3': {
    family: 'conceito',
    guideline: 'COFEN — SC: absorção lenta e contínua · hipoderme pouco vascularizada · insulina/heparina',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Indicação SC — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: '“Via subcutânea indicada quando a medicação…” — critério farmacocinético, não técnica de punção.',
            icon: 'Target',
          },
          {
            label: 'Perfil SC',
            detail: 'Depósito no tecido adiposo → absorção lenta e contínua, sem pico imediato.',
            icon: 'TrendingDown',
          },
          {
            label: 'Trilho parenteral',
            detail: 'IV imediata > IM rápida > SC lenta — letra A erra ao pedir absorção rápida.',
            icon: 'GitCompare',
          },
          {
            label: 'Volume e dose',
            detail: 'SC usa volumes pequenos — letra D erra com “doses grandes + efeito rápido”.',
            icon: 'Droplets',
          },
          {
            label: 'Exemplos clínicos',
            detail: 'Insulina, heparina, analgésicos SC — liberação gradual.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha velocidade',
            detail: 'ROI inverter_velocidade_im_sc — aluno marca rápida (A) quando SC é lenta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC = lenta e contínua — não rápida, não dose grande',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando pede indicação da via SC — perfil de absorção desejado.',
          'SC = hipoderme → absorção lenta, contínua, prolongada.',
          'Eliminar A: “absorvida rapidamente” → perfil IV/IM.',
          'Confirmar B: “absorção mais lenta e contínua” → fecha SC.',
          'Eliminar C: viscosidade alta não é critério clássico de indicação SC.',
          'Eliminar D: doses grandes + efeito rápido — oposto do perfil SC.',
          'Eliminar E: “alta pressão” — não descreve técnica SC.',
          'Marcar B.',
          'Fixação: “via X indicada quando” → teste velocidade antes da técnica.',
        ],
        footer_rule: 'Lenta + contínua = B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — indicação SC',
        meta: slideMeta,
        content: 'VIAS — VELOCIDADE DE ABSORÇÃO',
        rows: [
          { label: 'Intravenosa (IV)', value: 'Imediata — efeito rápido', badge: 'info' },
          { label: 'Intramuscular (IM)', value: 'Rápida — músculo vascularizado', badge: 'info' },
          { label: 'Subcutânea (SC)', value: 'Lenta e contínua — indicação da questão', badge: 'hot', exam_hint: 'Letra B.' },
          { label: 'Oral (VO)', value: 'Variável — passa pelo TGI', badge: 'info' },
          { label: 'Volume típico SC', value: 'Pequeno (até ~1–1,5 mL por sítio)', badge: 'warn' },
          { label: 'Mnemônico', value: 'SC = Slow & Continuous (lenta e contínua)', badge: 'ok' },
        ],
        footer_rule: 'Indicação SC = farmacocinética gradual',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INDICAÇÃO SC VUNESP',
        items: [
          {
            label: 'Letra A — absorção rápida',
            detail: 'Descreve IV ou IM — oposto da indicação SC.',
            correct: 'SC é para liberação lenta no tecido hipodérmico.',
          },
          {
            label: 'Letra C — alta viscosidade',
            detail: 'Parece técnico, mas não é critério farmacológico de escolha da via.',
            correct: 'Indicação = perfil de absorção, não viscosidade isolada.',
          },
          {
            label: 'Letra D — dose grande + efeito rápido',
            detail: 'Dois erros: SC não usa volume alto nem busca pico imediato.',
            correct: 'SC = volume pequeno + absorção gradual.',
          },
          {
            label: 'Letra E — alta pressão',
            detail: 'Confunde com infusão pressurizada IV.',
            correct: 'SC é administrada lentamente, sem alta pressão.',
          },
        ],
        footer_rule: 'Velocidade define a via — A/D/E erram o trilho',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1776056357082-7': {
    family: 'conceito',
    guideline: 'MS — insulina caneta 4mm: manter botão até retirar agulha · assepsia · sem massagem · prega se indicado',
    roi_error: 'vias_concept_generic_farmacologia',
    sources: [MS_INSULINA_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina caneta 4mm — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'G.J., diabete melito tipo 1, infecção urinária, insulina Lispro (Humalog) SC por caneta com agulha 4mm — técnica de aplicação segura.',
            icon: 'Target',
          },
          {
            label: 'Prescrição e dispositivo',
            detail:
              'Prescrição médica de Lispro SC — dispositivo caneta para aplicação pelo técnico de enfermagem na unidade de clínica médica.',
            icon: 'ClipboardList',
          },
          {
            label: 'Paciente eutrófico',
            detail: 'G.J. eutrófico — influencia técnica de prega e ângulo com agulha ultracurta.',
            icon: 'User',
          },
          {
            label: 'Prega no abdome',
            detail: 'Letra A: prega “obrigatória” no abdome — em eutrófico com 4mm, não é regra fixa.',
            icon: 'Hand',
          },
          {
            label: 'Ângulo 45° braço',
            detail: 'Letra B: 45° na face posterior do braço — técnica desatualizada para caneta 4mm.',
            icon: 'Gauge',
          },
          {
            label: 'Assepsia',
            detail: 'Letra D dispensa álcool — incorreto em ambiente hospitalar.',
            icon: 'Shield',
          },
          {
            label: 'Massagem pós-aplicação',
            detail: 'Letra E: massagem vigorosa — contraindicada na insulina (absorção irregular).',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Caneta 4mm: botão até sair agulha · assepsia · sem massagem',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: G.J., diabete melito tipo 1, insulina Lispro (Humalog) SC, caneta, agulha 4mm, paciente eutrófico.',
          'Eliminar A: prega obrigatória no abdome — não é universal com 4mm em eutrófico.',
          'Eliminar B: 45° no braço posterior — canetas curtas usam 90° na maioria dos sítios.',
          'Confirmar C: manter botão até retirar agulha completamente — técnica correta.',
          'Eliminar D: assepsia dispensável — falso em ambiente clínico.',
          'Eliminar E: massagem vigorosa — aumenta risco de hipoglicemia rápida/irregular.',
          'Marcar C.',
          'Fixação: contagem de segundos com botão pressionado evita subdose.',
        ],
        footer_rule: 'C = dose completa antes de retirar agulha',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica caneta insulina',
        meta: slideMeta,
        content: 'CANETA INSULINA 4MM — TÉCNICA',
        rows: [
          { label: 'Botão injetor', value: 'Pressionar até retirar agulha do tecido — dose plena', badge: 'hot', exam_hint: 'Gabarito C.' },
          { label: 'Ângulo 4mm', value: '90° na maioria dos sítios em adultos eutróficos', badge: 'ok' },
          { label: 'Prega cutânea', value: 'Se escasso tecido — não obrigatória em todo abdome eutrófico', badge: 'warn' },
          { label: 'Assepsia', value: 'Higienizar pele antes — não dispensar no hospital', badge: 'ok' },
          { label: 'Pós-aplicação', value: 'Não massagear o local', badge: 'warn' },
          { label: 'Contexto VUNESP', value: 'Prescrição Lispro SC · caneta · dispositivo de aplicação', badge: 'info' },
          { label: 'Subcutânea', value: 'Via prescrita — insulina no tecido adiposo', badge: 'ok' },
        ],
        footer_rule: 'Botão até sair · assepsia · sem massagem',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CANETA INSULINA',
        items: [
          {
            label: 'Letra A — prega obrigatória no abdome',
            detail: 'Generaliza prega mesmo em eutrófico com agulha ultracurta.',
            correct: '4mm em abdome de eutrófico costuma ser 90° sem prega obrigatória.',
          },
          {
            label: 'Letra B — 45° no braço posterior',
            detail: 'Técnica de agulhas longas — incompatível com perfil 4mm.',
            correct: 'Canetas curtas: inserção perpendicular na maioria dos sítios.',
          },
          {
            label: 'Letra D — assepsia dispensável',
            detail: 'Minimiza higiene em ambiente de internação.',
            correct: 'Assepsia da pele permanece recomendada no contexto hospitalar.',
          },
          {
            label: 'Letra E — massagem vigorosa',
            detail: 'Acelera absorção de forma irregular — risco de hipoglicemia.',
            correct: 'Não massagear após insulina SC.',
          },
        ],
        footer_rule: 'Cada distrator erra um passo da técnica MS',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1778968609115-2': {
    family: 'conceito',
    guideline: 'COFEN — IM: 90° no músculo · absorção mais rápida que SC · depósito muscular prolongado',
    roi_error: 'inverter_velocidade_im_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM — ângulo 90° × absorção — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Administração de medicamentos em enfermagem — parenteral com absorção lenta, prolongada e angulação da agulha a 90°.',
            icon: 'Target',
          },
          {
            label: 'Segurança na administração',
            detail:
              'Conhecimentos e técnicas de enfermagem minimizam riscos e garantem segurança do profissional e do paciente.',
            icon: 'Shield',
          },
          {
            label: 'Fármacos parenterais',
            detail: 'Aplicação de fármacos que exigem absorção lenta e prolongada com angulação da agulha.',
            icon: 'Syringe',
          },
          {
            label: 'Depósito IM',
            detail: 'Massa muscular retém o fármaco — liberação prolongada relativa a IV.',
            icon: 'Bone',
          },
          {
            label: 'Pegadinha SC',
            detail: 'Letra B: SC é mais lenta que IM, mas ângulo clássico não é 90° fixo.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha EV/ID',
            detail: 'Letras A e C não combinam 90° muscular com “lenta prolongada” da forma cobrada.',
            icon: 'AlertTriangle',
          },
          {
            label: 'ROI absorção × ângulo',
            detail: 'Aluno marca SC por “lenta”; banca chave IM pelo 90° — feche ângulo primeiro.',
            icon: 'TrendingUp',
          },
        ],
        footer_rule: '90° no músculo = IM — não confunda só pela velocidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: administração parenteral em enfermagem — absorção lenta, prolongada e angulação da agulha a 90°.',
          'Ângulo 90° perpendicular → intramuscular (deltoide, ventroglútea, vasto).',
          'Eliminar A (endovenosa) — acesso venoso, não 90° muscular.',
          'Eliminar B (subcutânea) — SC usa 45–90° no adiposo, não definição da questão.',
          'Eliminar C (intradérmica) — 10–15° com pápula.',
          'Eliminar D (auricular) — via otológica, fora do parenteral injetável clássico.',
          'Confirmar E (intramuscular) — única que fecha 90° + depósito muscular.',
          'Marcar E.',
          'Fixação: em VUNESP, ângulo 90° fecha IM mesmo quando texto diz “lenta”.',
        ],
        footer_rule: '90° muscular → E intramuscular',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — IM técnica e absorção',
        meta: slideMeta,
        content: 'VIA IM — ÂNGULO E ABSORÇÃO',
        rows: [
          { label: 'Ângulo', value: '90° no músculo — perpendicular à pele', badge: 'hot', exam_hint: 'Pista decisiva da questão.' },
          { label: 'Sítios', value: 'Ventroglútea · deltoide · vasto lateral', badge: 'ok' },
          { label: 'Absorção', value: 'Rápida no trilho parenteral — mais que SC', badge: 'warn', exam_hint: 'Texto diz “lenta” vs IV — não confunda com SC.' },
          { label: 'SC × IM', value: 'SC mais lenta; IM mais rápida — ângulo diferencia', badge: 'ok' },
          { label: 'ID', value: '10–15° — pápula cutânea', badge: 'info' },
          { label: 'EV', value: 'Imediata — acesso venoso', badge: 'info' },
        ],
        footer_rule: 'Decore ângulos: ID 15° · SC 45° · IM 90°',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IM 90° VUNESP',
        items: [
          {
            label: 'Letra B — subcutânea',
            detail: 'SC é mais lenta, mas ângulo 90° no enunciado aponta músculo.',
            correct: '“Lenta” seduz para SC; ângulo 90° fecha IM (E).',
          },
          {
            label: 'Letra A — endovenosa',
            detail: 'Absorção imediata — oposto de depósito prolongado relativo.',
            correct: 'EV não usa ângulo 90° no músculo.',
          },
          {
            label: 'Letra C — intradérmica',
            detail: 'Superficial com pápula — ângulo baixo.',
            correct: 'ID = 10–15°, não 90°.',
          },
          {
            label: 'Letra D — auricular',
            detail: 'Via otológica — fora do escopo parenteral injetável da questão.',
            correct: 'Parenteral injetável clássico: IV, IM, SC, ID.',
          },
        ],
        footer_rule: 'Ângulo 90° > palavra “lenta” nesta banca',
      },
    ],
  },

  'vunesp-enfermagem-vias-de-administracao-1778968768987-5': {
    family: 'conceito',
    guideline: 'Potter/MS — NPT = nutrição parenteral total · TGI não funcionante · via endovenosa central/periférica',
    roi_error: 'lista_parenteral_incompleta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'NPT — via de administração — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'NPT para TGI não funcionante ou repouso intestinal — qual via de administração?',
            icon: 'Target',
          },
          {
            label: 'Nutrição parenteral total',
            detail: 'Nutrientes na corrente sanguínea — bypass completo do TGI.',
            icon: 'Zap',
          },
          {
            label: 'Endovenosa',
            detail: 'Via de eleição — infusão contínua por acesso venoso central ou periférico dedicado.',
            icon: 'Activity',
          },
          {
            label: 'Enteral × parenteral',
            detail: 'Letra A (enteral) exige TGI funcionante — contraindicada no cenário.',
            icon: 'GitCompare',
          },
          {
            label: 'Rotas especiais',
            detail: 'Letra B (intratecal) — espaço subaracnóideo, não nutrição sistêmica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'IM/VO inadequadas',
            detail: 'Letras D e E não administram mistura nutricional completa de NPT.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'NPT = EV · TGI off → não enteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: TGI não funcionante ou repouso intestinal → precisa bypass digestivo.',
          'NPT = solução nutritiva completa na circulação.',
          'Eliminar A (enteral) — sonda/TGI necessário.',
          'Eliminar B (intratecal) — via neurológica, não nutricional sistêmica.',
          'Confirmar C (endovenosa) — infusão venosa contínua de NPT.',
          'Eliminar D (intramuscular) — volume/composição incompatíveis.',
          'Eliminar E (oral) — TGI não funcionante impede VO.',
          'Marcar C.',
          'Fixação: NPT sempre endovenosa — enteral é NE, não NPT.',
        ],
        footer_rule: 'TGI off + nutrição completa = EV (C)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — NPT',
        meta: slideMeta,
        content: 'NPT — VIA E INDICAÇÃO',
        rows: [
          { label: 'Definição', value: 'Nutrição parenteral total — nutrientes IV', badge: 'hot' },
          { label: 'Via', value: 'Endovenosa — central preferencial em uso prolongado', badge: 'ok', exam_hint: 'Gabarito C.' },
          { label: 'Indicação', value: 'TGI não funcionante · repouso intestinal · má absorção', badge: 'ok' },
          { label: 'NE (enteral)', value: 'TGI funcionante — não é NPT', badge: 'warn' },
          { label: 'Cuidados', value: 'Técnica asséptica · glicemia · eletrólitos · infecção de cateter', badge: 'info' },
        ],
        footer_rule: 'NPT = EV · NE = enteral — não trocar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NPT',
        items: [
          {
            label: 'Letra A — enteral',
            detail: 'Nutrição enteral usa TGI — cenário exclui.',
            correct: 'TGI não funcionante → NPT endovenosa, não enteral.',
          },
          {
            label: 'Letra B — intratecal',
            detail: 'Via espinal para fármacos neurológicos.',
            correct: 'NPT é nutrição sistêmica por veia, não espaço subaracnóideo.',
          },
          {
            label: 'Letra D — intramuscular',
            detail: 'IM não comporta volume/composição da NPT.',
            correct: 'Mistura hiperosmolar exige acesso venoso.',
          },
          {
            label: 'Letra E — oral',
            detail: 'Repouso intestinal e TGI off impedem deglutição/absorção.',
            correct: 'VO contraindicada — gabarito endovenosa.',
          },
        ],
        footer_rule: 'Parenteral nutricional = sempre EV nesta questão',
      },
    ],
  },

  'furb-enfermagem-vias-de-administracao-1778968609115-4': {
    family: 'conceito',
    guideline: 'Potter — sublingual: absorção rápida · bypass parcial 1ª passagem hepática · mucosa oral',
    roi_error: 'retal_sempre_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: '1ª passagem hepática — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Via que permite absorção rápida EVITANDO 1ª passagem hepática.',
            icon: 'Target',
          },
          {
            label: '1ª passagem hepática',
            detail: 'VO comum → fígado metaboliza antes da circulação sistêmica plena.',
            icon: 'GitCompare',
          },
          {
            label: 'Sublingual',
            detail: 'Mucosa oral → absorção direta parcial à sistêmica — reduz metabolismo hepático inicial.',
            icon: 'Droplets',
          },
          {
            label: 'Oral/SNG',
            detail: 'Letras A e D passam pelo TGI e fígado — não evitam 1ª passagem.',
            icon: 'Pill',
          },
          {
            label: 'Parenteral IM',
            detail: 'Letra B evita TGI, mas não é o foco “rápida + evitar fígado” da mucosa oral.',
            icon: 'Syringe',
          },
          {
            label: 'Retal',
            detail: 'Letra C: porção inferior pode ter bypass parcial — mas gabarito é sublingual (E).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sublingual = rápida + menor 1ª passagem hepática',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Dois critérios: absorção rápida + evitar 1ª passagem hepática.',
          'VO/SNG (A, D) passam pelo fígado — eliminar.',
          'IM (B) é parenteral sem TGI, mas enunciado foca mucosa oral rápida.',
          'Retal (C) tem bypass parcial inferior — não é a resposta da banca aqui.',
          'Sublingual (E): mucosa vascularizada, efeito rápido, reduz metabolismo hepático inicial.',
          'Marcar E.',
          'Fixação: sublingual é a via oral que mais bypassa o fígado com rapidez.',
        ],
        footer_rule: 'Rápida + evitar fígado → sublingual (E)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1ª passagem hepática',
        meta: slideMeta,
        content: 'VIAS × 1ª PASSAGEM HEPÁTICA',
        rows: [
          { label: 'Oral (VO)', value: 'Alta 1ª passagem — fígado metaboliza antes do efeito pleno', badge: 'warn' },
          { label: 'Sublingual', value: 'Bypass parcial — absorção mucosa rápida', badge: 'hot', exam_hint: 'Gabarito E.' },
          { label: 'Retal', value: 'Porção inferior: bypass parcial possível — variável', badge: 'info' },
          { label: 'Parenteral IV/IM', value: 'Sem TGI — não é “1ª passagem” no sentido oral', badge: 'ok' },
          { label: 'SNG', value: 'Equivalente enteral — passa pelo fígado', badge: 'warn' },
        ],
        footer_rule: 'Sublingual = rápida + menor metabolismo hepático inicial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 1ª PASSAGEM FURB',
        items: [
          {
            label: 'Letra A — sonda nasogástrica',
            detail: 'Enteral clássica — nutrientes/fármacos vão ao fígado.',
            correct: 'SNG não evita 1ª passagem hepática.',
          },
          {
            label: 'Letra B — intramuscular',
            detail: 'Parenteral sem TGI, mas não responde ao par “rápida + evitar fígado” oral.',
            correct: 'Comando aponta mucosa oral (sublingual), não músculo.',
          },
          {
            label: 'Letra C — retal',
            detail: 'Bypass parcial possível na porção inferior — pegadinha avançada.',
            correct: 'Banca FURB chave sublingual (E) como resposta canônica.',
          },
          {
            label: 'Letra D — oral',
            detail: 'Máxima 1ª passagem hepática entre as opções enterais.',
            correct: 'VO é o oposto de “evitar fígado”.',
          },
        ],
        footer_rule: 'Retal seduz — sublingual é gabarito FURB',
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
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.sources),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g12] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g12] total=${ok}`);
}

main();
