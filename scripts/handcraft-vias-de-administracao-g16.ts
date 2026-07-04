#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g16 (8 slugs P1 via_tecnica_admin).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g16.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g16';
const SUBTOPICO = 'Vias de Administração';
const BRANCH = 'via_tecnica_admin';
const REVIEWED = '2026-07-03';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'ângulos SC/IM/ID',
    'volumes por sítio IM',
    'ventroglúteo seguro',
    'contraindicações locais',
    'via intratecal',
    'técnica em Z',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Técnica de punção',
  year: 2020,
  covers: ['ângulos de injeção', 'volumes IM', 'sítios anatômicos', 'pinça de pele SC'],
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

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch ?? BRANCH,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'ibade-enfermagem-vias-de-administracao-1776056418941-5': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    guideline: 'COFEN — SC: 45° a 90° conforme espessura do tecido adiposo',
    roi_error: 'angulo_sc_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ângulo SC — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Tecido subcutâneo moderado — escolha ângulo que atinja hipoderme sem perfurar músculo.',
            icon: 'Target',
          },
          {
            label: 'Via subcutânea',
            detail: 'Hipoderme/adiposo — absorção lenta; não confundir com IM (90° no músculo).',
            icon: 'Syringe',
          },
          {
            label: 'Espessura moderada',
            detail: 'Tecido adiposo intermediário → inclinação ~45° é clássica de referência.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha 90°',
            detail: '90° sem prega espessa pode transfixar até o músculo — erro ROI angulo_sc_errado.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha 15°–30°',
            detail: 'Ângulos rasos são perfil de ID/teste cutâneo, não SC terapêutica padrão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC moderada → 45° · IM = 90° no músculo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via SC com espessura de tecido subcutâneo moderada — ângulo seguro.',
          'Eliminar C (90°): perfil de IM ou SC com prega espessa; sem prega, risco de atingir músculo.',
          'Eliminar D (30°) e E (15°): ângulos de intradérmica/teste, não hipoderme terapêutica.',
          'Eliminar B (60°): intermediário atípico — referência clássica para adiposo moderado é 45°.',
          'Confirmar A (45°): inclinação compatível com tecido subcutâneo de espessura moderada.',
          'Marcar A.',
          'Fixação: SC moderada = 45° · IM = 90°.',
        ],
        footer_rule: 'Feche via (SC) + espessura antes do ângulo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos por via',
        meta: slideMeta,
        content: 'ÂNGULOS DE PUNÇÃO — DECORE',
        rows: [
          { label: 'Intradérmica (ID)', value: '10–15° — pápula cutânea', badge: 'info' },
          { label: 'SC adiposo fino', value: '45° com pinça de pele', badge: 'ok' },
          { label: 'SC adiposo espesso', value: '90° na prega cutânea', badge: 'warn' },
          { label: 'IM', value: '90° perpendicular ao músculo', badge: 'hot' },
          { label: 'Espessura moderada', value: '~45° na hipoderme', badge: 'ok' },
        ],
        footer_rule: 'Via + tecido definem o ângulo — não decorar um número só',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÂNGULO SC',
        items: [
          {
            label: 'Letra B — 60°',
            detail: 'Inclinação intermediária sem respaldo clássico para adiposo moderado.',
            correct: 'Referência de prova para SC moderada: 45° (A), não 60°.',
          },
          {
            label: 'Letra C — 90°',
            detail: 'Sem prega espessa, 90° pode transfixar o subcutâneo e atingir o músculo.',
            correct: '90° na SC exige prega cutânea espessa; moderada → 45°.',
          },
          {
            label: 'Letra D — 30°',
            detail: 'Ângulo raso típico de intradérmica, não depósito na hipoderme.',
            correct: 'SC terapêutica usa 45–90° conforme adiposo — não 30°.',
          },
          {
            label: 'Letra E — 15°',
            detail: 'Perfil de teste cutâneo/ID — superficial demais para SC.',
            correct: '15° é ID; hipoderme moderada → 45° (A).',
          },
        ],
        footer_rule: 'Cada distrator confunde SC com ID ou IM',
      },
    ],
  },
  'ibade-enfermagem-vias-de-administracao-1778968825263-8': {
    family: 'calc',
    guideline: 'Potter — dorsoglútea até ~5 mL · deltoide até ~2 mL em adultos',
    roi_error: 'volume_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volumes IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Regiões intramuscular — dosagem máxima administrada respectivamente na dorsoglútea e no músculo deltoide.',
            icon: 'Target',
          },
          {
            label: 'Dorsoglútea',
            detail: 'Músculo glúteo maior — aceita volumes maiores (até ~5 mL em adultos).',
            icon: 'Syringe',
          },
          {
            label: 'Deltoide',
            detail: 'Braço — volume restrito (~2 mL) por massa muscular e proximidade do nervo radial.',
            icon: 'Gauge',
          },
          {
            label: 'Erro ROI — inverter volumes',
            detail: 'Trocar volumes entre sítios — volume_im_errado.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha deltoide',
            detail: 'Alternativa superestima volume no deltoide — clássico de prova é até 2 mL.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Dorsoglútea > deltoide em volume · deltoide ~2 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: volume máximo dorsoglútea E deltoide, nessa ordem.',
          'Fixar dorsoglútea: até ~5 mL em referências de enfermagem.',
          'Fixar deltoide: até ~2 mL — vacinas e doses pequenas.',
          'Eliminar A: subestima dorsoglútea (primeiro valor baixo).',
          'Eliminar C: deltoide com volume superestimado na alternativa.',
          'Eliminar D: excede limites usuais dos dois sítios.',
          'Eliminar E: dorsoglútea abaixo do padrão cobrado.',
          'Confirmar B (5 mL + 2 mL).',
          'Marcar B.',
        ],
        footer_rule: 'Ordem do enunciado: glúteo primeiro · braço depois',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volumes IM',
        meta: slideMeta,
        content: 'VOLUMES MÁXIMOS IM — ADULTO',
        rows: [
          { label: 'Deltoide', value: 'Até ~2 mL', badge: 'hot' },
          { label: 'Dorsoglútea', value: 'Até ~5 mL', badge: 'ok' },
          { label: 'Ventroglútea', value: 'Até ~3 mL (referências variam)', badge: 'info' },
          { label: 'Vasto lateral', value: 'Até ~5 mL na coxa', badge: 'ok' },
          { label: 'Regra prática', value: 'Sítio pequeno = volume menor', badge: 'warn' },
        ],
        footer_rule: 'Decore par dorsoglútea 5 mL · deltoide 2 mL',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VOLUME IM',
        items: [
          {
            label: 'Letra A — dorsoglútea subestimada',
            detail: 'Subestima capacidade do glúteo maior.',
            correct: 'Dorsoglútea admite até ~5 mL — par correto é 5 + 2 mL (B).',
          },
          {
            label: 'Letra C — deltoide superestimado',
            detail: 'Superdimensiona volume no braço — risco de dor, extravasamento e lesão neural.',
            correct: 'Deltoide clássico: até 2 mL — alternativa C excede o limite do sítio.',
          },
          {
            label: 'Letra D — volumes excedidos',
            detail: 'Excede limites seguros usuais em ambos os sítios.',
            correct: 'Referência de prova: 5 mL glúteo + 2 mL deltoide.',
          },
          {
            label: 'Letra E — dorsoglútea baixa',
            detail: 'Erro no primeiro valor — dorsoglútea comporta mais volume.',
            correct: '5 mL no glúteo + 2 mL no deltoide fecha B.',
          },
        ],
        footer_rule: 'Volume segue anatomia — não inverta sítios',
      },
    ],
  },
  'inaz-do-para-enfermagem-vias-de-administracao-1776056427936-8': {
    family: 'conceito',
    guideline: 'COFEN — contraindicação local: pele lesionada, inflamada ou infectada no sítio',
    roi_error: 'contraindicacao_im_ignorada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Contraindicações IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identifique contraindicação real à punção IM — barreira local de segurança.',
            icon: 'Target',
          },
          {
            label: 'Integridade da pele',
            detail: 'Lesão, inflamação ou infecção no sítio impedem qualquer punção.',
            icon: 'Shield',
          },
          {
            label: 'Não são contraindicações',
            detail: 'Peso, HAS, idade ou FC isolados não vetam IM sem contexto clínico específico.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — contraindicação ignorada',
            detail:
              'Erro reproduzível: escolher comorbidade sistêmica (peso, HAS, idade) em vez de lesão na pele no sítio.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Pele íntegra no sítio = pré-requisito de qualquer injeção',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: contraindicação para injeção intramuscular.',
          'Eliminar A (peso elevado): obesidade muda sítio/técnica, não contraindica IM.',
          'Eliminar B (hipertensão): comorbidade sem veto absoluto à punção IM.',
          'Eliminar D (bradicardia): sinal vital isolado não contraindica técnica local.',
          'Eliminar E (idade avançada): idoso recebe IM com adaptação de sítio.',
          'Confirmar C (lesão na pele no sítio): integridade cutânea comprometida.',
          'Marcar C.',
          'Fixação: pele lesionada = não puncionar na região.',
        ],
        footer_rule: 'Contraindicação local > comorbidade sistêmica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — barreiras à punção',
        meta: slideMeta,
        content: 'QUANDO NÃO PUNCIONAR',
        rows: [
          { label: 'Pele', value: 'Lesão · inflamação · infecção no sítio', badge: 'hot' },
          { label: 'Circulação local', value: 'Gangrena · trombose extensa na área', badge: 'warn' },
          { label: 'Medicamento', value: 'Via IM contraindicada na bula', badge: 'info' },
          { label: 'Não é veto automático', value: 'HAS · idade · peso (isolados)', badge: 'ok' },
          { label: 'Alternativa', value: 'Trocar sítio íntegro ou outra via', badge: 'ok' },
        ],
        footer_rule: 'Inspecione a pele antes de preparar a agulha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONTRAINDICAÇÃO IM',
        items: [
          {
            label: 'Letra A — peso elevado',
            detail: 'Obesidade exige técnica e sítio adequados, não proíbe IM.',
            correct: 'Peso isolado não contraindica — lesão cutânea local sim (C).',
          },
          {
            label: 'Letra B — hipertensão',
            detail: 'Comorbidade cardiovascular frequente — IM é rotina hospitalar.',
            correct: 'HAS não é contraindicação local; pele lesionada é.',
          },
          {
            label: 'Letra D — bradicardia',
            detail: 'Sinal vital sem relação direta com técnica de punção muscular.',
            correct: 'FC baixa não impede IM; integridade da pele impede.',
          },
          {
            label: 'Letra E — idade avançada',
            detail: 'Idosos recebem vacinas e analgésicos IM com frequência.',
            correct: 'Idade exige cuidado, não contraindicação; lesão na pele contraindica.',
          },
        ],
        footer_rule: 'Banca mistura sistêmico com barreira local',
      },
    ],
  },
  'instituto-access-enfermagem-vias-de-administracao-1776056409987-5': {
    family: 'conceito',
    guideline: 'Potter — SC com agulha curta (12×7 mm): prega cutânea + 90° na prega',
    roi_error: 'angulo_sc_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SC agulha curta — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Injeção hipodérmica (SC) com agulha 12×7 mm em adulto não obeso — técnica da prega.',
            icon: 'Target',
          },
          {
            label: 'Hipodérmica = SC',
            detail: 'Tecido conjuntivo abaixo da derme — mesma via subcutânea.',
            icon: 'Syringe',
          },
          {
            label: 'Agulha curta',
            detail: '12×7 mm exige pinça de pele para criar coluna de tecido adiposo.',
            icon: 'Gauge',
          },
          {
            label: 'Técnica da prega',
            detail: 'Pinçar adiposo e inserir 90° na prega — agulha curta não alcança músculo.',
            icon: 'Shield',
          },
          {
            label: 'Erro ROI',
            detail: 'Aplicar 45° sem prega ou 90° direto na pele plana — angulo_sc_errado.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Agulha curta + prega = 90° na prega · sem prega = 45°',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: hipodérmica (SC) · agulha 12×7 mm · adulto padrão.',
          'Reconhecer limitação: agulha curta precisa de prega cutânea espessa.',
          'Eliminar A (30°), B (45°), C (60°): sem prega, perfil de SC clássica seria 45°.',
          'Com prega e agulha curta, referência é inserção perpendicular à prega (90°).',
          'Confirmar D (90°).',
          'Marcar D.',
          'Fixação: curta + prega → 90° na prega; plana → 45°.',
        ],
        footer_rule: 'Leia agulha + técnica antes do ângulo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SC e agulha',
        meta: slideMeta,
        content: 'SC — ÂNGULO × AGULHA',
        rows: [
          { label: 'Agulha longa', value: '45° na pele plana (adiposo moderado)', badge: 'ok' },
          { label: 'Agulha curta 12×7 mm', value: 'Prega cutânea + 90° na prega', badge: 'hot' },
          { label: 'IM', value: '90° no músculo sem prega', badge: 'warn' },
          { label: 'ID', value: '10–15° com pápula', badge: 'info' },
          { label: 'Adulto não obeso', value: 'Prega garante depósito na hipoderme', badge: 'ok' },
        ],
        footer_rule: 'Agulha curta exige prega — 90° na prega',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SC AGULHA CURTA',
        items: [
          {
            label: 'Letra A — 30°',
            detail: 'Ângulo de ID — superficial demais para depósito SC com agulha curta.',
            correct: 'Com prega e agulha 12×7 mm, use 90° na prega (D).',
          },
          {
            label: 'Letra B — 45°',
            detail: 'Clássico em pele plana com agulha longa — não combina com 12×7 mm citado.',
            correct: 'Agulha curta + prega → perpendicular (90°), não 45° isolado.',
          },
          {
            label: 'Letra C — 60°',
            detail: 'Intermediário sem base na técnica de prega com agulha curta.',
            correct: 'Enunciado ancora agulha curta — feche 90° na prega (D).',
          },
        ],
        footer_rule: 'Não decore 45° cegamente — leia agulha do enunciado',
      },
    ],
  },
  'instituto-aocp-enfermagem-vias-de-administracao-1776056409987-6': {
    family: 'conceito',
    guideline: 'COFEN — vasto lateral: terço médio da coxa · ventroglúteo seguro · deltoide ~2 mL',
    roi_error: 'inverter_sitio_im_seguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'CORRETA sobre IM — julgue sítio, volume, técnica e segurança neurológica.',
            icon: 'Target',
          },
          {
            label: 'Vasto lateral (coxa)',
            detail: 'Terço médio da face anterolateral — sítio seguro, especialmente em pediatria.',
            icon: 'Syringe',
          },
          {
            label: 'Deltoide',
            detail: 'Volume máximo ~2 mL — distrator superestima capacidade.',
            icon: 'Gauge',
          },
          {
            label: 'Ventroglúteo',
            detail: 'Sítio mais seguro em adultos — afasta nervo ciático; banca inverte como “maior risco”.',
            icon: 'Shield',
          },
          {
            label: 'Técnica em Z',
            detail: 'Desloca pele para reduzir vazamento — não aumenta irritação local.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Ventroglúteo seguro · deltoide 2 mL · Z-track reduz vazamento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale alternativa correta sobre via IM.',
          'Testar A: vasto lateral — porção inferior do terço médio, menos inervada → VERDADEIRA (gabarito da prova).',
          'Eliminar B: deltoide “sem limitações” com volume superestimado.',
          'Eliminar C: técnica em Z “aumenta irritação” — inverte efeito (reduz extravasamento).',
          'Eliminar D: ventroglúteo “maior risco” — inverte; é sítio seguro longe do ciático.',
          'Confirmar A.',
          'Marcar A.',
        ],
        footer_rule: 'Banca inverte ventroglúteo e superdimensiona deltoide',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios e técnica IM',
        meta: slideMeta,
        content: 'IM — SÍTIO · VOLUME · TÉCNICA',
        rows: [
          { label: 'Vasto lateral', value: 'Terço médio da coxa — poucos nervos', badge: 'ok' },
          { label: 'Ventroglúteo', value: 'Mais seguro no adulto — longe do ciático', badge: 'hot' },
          { label: 'Deltoide', value: 'Até ~2 mL — volume restrito', badge: 'warn' },
          { label: 'Técnica em Z', value: 'Reduz vazamento cutâneo pós-IM irritante', badge: 'info' },
          { label: 'Dorsoglúteo', value: 'Risco de ciático se marcos imprecisos', badge: 'warn' },
        ],
        footer_rule: 'Decore: ventroglúteo seguro · deltoide 2 mL · Z-track protege',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CORRETA IM',
        items: [
          {
            label: 'Letra B — deltoide sem limitações',
            detail: 'Superdimensiona volume e minimiza limitações do braço.',
            correct: 'Deltoide admite até ~2 mL — alternativa B superestima capacidade do sítio.',
          },
          {
            label: 'Letra C — Z-track irrita',
            detail: 'Inverte finalidade da técnica em Z.',
            correct: 'Z-track desloca pele para reduzir irritação/vazamento — não aumenta.',
          },
          {
            label: 'Letra D — ventroglúteo perigoso',
            detail: 'Classifica o sítio mais seguro como o de maior risco.',
            correct: 'Ventroglúteo afasta ciático — dorsoglúteo é que exige marcos.',
          },
        ],
        footer_rule: 'Três distratores invertem técnica ou anatomia',
      },
    ],
  },
  'instituto-consulplan-enfermagem-vias-de-administracao-1778968768987-0': {
    family: 'conceito',
    guideline: 'COFEN — IM 90° perpendicular · SC 45–90° · ID 10–15°',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ângulos por via — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro formas de injeção — cada uma com inclinação correta. Citação: “aplicada no ângulo de 90°, entra verticalmente na pele”.',
            icon: 'Target',
          },
          {
            label: 'IM — 90°',
            detail: 'Perpendicular ao músculo — atinge fibras musculares profundas.',
            icon: 'Syringe',
          },
          {
            label: 'SC — 45–90°',
            detail: 'Inclinada na hipoderme — não é inserção vertical clássica na pele plana.',
            icon: 'Gauge',
          },
          {
            label: 'ID — 10–15°',
            detail: 'Quase paralela à pele — pápula intradérmica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'IV',
            detail: 'Canulação venosa — ângulo de acesso distinto (15–30° na veia).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: '90° vertical no músculo = IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: injeção a 90°, vertical na pele — qual via?',
          'Eliminar A (IV): acesso venoso usa ângulo menor na veia, não 90° vertical clássico.',
          'Eliminar B (ID): 10–15° quase paralelo — oposto de vertical.',
          'Eliminar C (SC): hipoderme usa 45° ou 90° na prega, não “vertical na pele” sem contexto.',
          'Confirmar D (IM): 90° perpendicular ao músculo.',
          'Marcar D.',
          'Fixação: vertical no músculo = IM.',
        ],
        footer_rule: 'Palavra-chave: 90° vertical → IM',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos clássicos',
        meta: slideMeta,
        content: 'ÂNGULO × VIA — DECORE',
        rows: [
          { label: 'IM', value: '90° perpendicular ao músculo', badge: 'hot' },
          { label: 'SC', value: '45° (plana) ou 90° (prega)', badge: 'ok' },
          { label: 'ID', value: '10–15° com pápula', badge: 'info' },
          { label: 'IV', value: '15–30° na veia (canulação)', badge: 'warn' },
          { label: 'Mnemônico', value: 'IM = noventa no músculo', badge: 'ok' },
        ],
        footer_rule: '90° vertical = IM em provas de técnico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÂNGULO 90°',
        items: [
          {
            label: 'Letra A — intravenosa',
            detail: 'Canulação venosa não usa 90° vertical na pele.',
            correct: '90° vertical clássico de prova = IM (D), não IV.',
          },
          {
            label: 'Letra B — intradérmica',
            detail: 'ID é quase paralela à pele (10–15°).',
            correct: 'Vertical 90° não descreve ID — fecha IM.',
          },
          {
            label: 'Letra C — subcutânea',
            detail: 'SC é inclinada ou 90° na prega — não “vertical na pele” isolado.',
            correct: 'Citação de 90° vertical sem prega = perfil IM.',
          },
        ],
        footer_rule: 'Cada distrator traz ângulo de outra via',
      },
    ],
  },
  'instituto-consulplan-enfermagem-vias-de-administracao-1778968787431-2': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    guideline: 'Potter — via intratecal: espaço subaracnóideo entre vértebras lombares',
    roi_error: 'confundir_via_intratecal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via intratecal — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Onde a agulha é inserida na via intratecal — anatomia espinal.',
            icon: 'Target',
          },
          {
            label: 'Intratecal',
            detail: 'Medicação no espaço subaracnóideo — alcança líquor e medula.',
            icon: 'Brain',
          },
          {
            label: 'Sítio clássico',
            detail: 'Espaço intervertebral lombar — abaixo do término da medula (L2–L3).',
            icon: 'Syringe',
          },
          {
            label: 'Não é IV',
            detail: 'Letra A descreve veia — rota vascular, não espinal.',
            icon: 'GitCompare',
          },
          {
            label: 'Não é IM',
            detail: 'Letra C descreve músculo — punção muscular comum, não intratecal.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Intratecal = entre vértebras · espaço subaracnóideo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: inserção da agulha na via intratecal.',
          'Eliminar A (veia): perfil endovenoso — não acessa líquor.',
          'Eliminar B (gengiva/bochecha): via oral/bucal — sem relação com medula.',
          'Eliminar C (músculo abaixo da pele): descrição genérica de IM.',
          'Confirmar D (entre vértebras lombares, espaço ao redor da medula).',
          'Marcar D.',
          'Fixação: intratecal = punção lombar no espaço subaracnóideo.',
        ],
        footer_rule: 'Lombar · intervertebral · líquor',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias especiais',
        meta: slideMeta,
        content: 'INTRATECAL — ANATOMIA',
        rows: [
          { label: 'Destino', value: 'Espaço subaracnóideo — líquor cefalorraquidiano', badge: 'hot' },
          { label: 'Sítio', value: 'Intervertebral lombar (L3–L4 ou L4–L5)', badge: 'ok' },
          { label: 'Indicação', value: 'Anestesia raquidiana · quimioterapia intratecal', badge: 'info' },
          { label: '≠ IV', value: 'Não é canulação venosa', badge: 'warn' },
          { label: '≠ IM', value: 'Não é depósito no músculo', badge: 'warn' },
        ],
        footer_rule: 'Decore: vértebra lombar + espaço subaracnóideo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIA INTRATECAL',
        items: [
          {
            label: 'Letra A — veia',
            detail: 'Confunde via intratecal com acesso venoso.',
            correct: 'Intratecal atinge líquor entre vértebras — não veia.',
          },
          {
            label: 'Letra B — gengiva/bochecha',
            detail: 'Rota oral/mucosa — sem relação com coluna.',
            correct: 'Intratecal é punção espinal lombar (D).',
          },
          {
            label: 'Letra C — músculo',
            detail: 'Descrição vaga de IM — não acessa espaço subaracnóideo.',
            correct: 'IM deposita no músculo; intratecal = espaço perimedular.',
          },
        ],
        footer_rule: 'Banca mistura parenteral clássica com via espinal',
      },
    ],
  },
  'instituto-evo-enfermagem-vias-de-administracao-1776056374837-5': {
    family: 'conceito',
    guideline: 'COFEN — ventroglúteo: sítio preferencial em adultos — menor risco de nervo ciático',
    roi_error: 'inverter_sitio_im_seguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítio IM seguro — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Local mais indicado em adultos para IM evitando lesão do nervo ciático.',
            icon: 'Target',
          },
          {
            label: 'Ventroglútea',
            detail: 'Glúteo médio/mínimo — palpar ilíaco e trocanter; longe do ciático.',
            icon: 'Shield',
          },
          {
            label: 'Dorsoglútea',
            detail: 'Tradicional, mas risco de ciático se quadrante superior mal localizado.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide / vasto',
            detail: 'Sítios válidos, mas enunciado pede “mais indicado” para evitar ciático no adulto.',
            icon: 'GitCompare',
          },
          {
            label: 'Erro ROI',
            detail: 'Escolher dorsoglútea pelo hábito — inverter_sitio_im_seguro.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'Evitar ciático → ventroglútea no adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: melhor sítio IM em adulto para evitar nervo ciático.',
          'Eliminar A (dorsoglútea): clássica, porém maior risco de ciático sem marcos precisos.',
          'Eliminar B (deltoide): sítio do braço — não responde ao foco glúteo/ciático.',
          'Eliminar C (vasto lateral): coxa segura, mas ventroglútea é resposta “mais indicada” no adulto.',
          'Confirmar D (ventroglútea): glúteo médio — referência de segurança neurológica.',
          'Marcar D.',
          'Fixação: ventroglútea = longe do ciático.',
        ],
        footer_rule: 'Palavra-chave: evitar ciático → ventroglútea',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM e ciático',
        meta: slideMeta,
        content: 'IM — SEGURANÇA NEUROLÓGICA',
        rows: [
          { label: 'Ventroglútea', value: 'Preferencial adulto — glúteo médio', badge: 'hot' },
          { label: 'Dorsoglútea', value: 'Risco de ciático — uso restrito', badge: 'warn' },
          { label: 'Vasto lateral', value: 'Coxa — seguro, comum em pediatria', badge: 'ok' },
          { label: 'Deltoide', value: 'Braço — volume pequeno', badge: 'info' },
          { label: 'Marcos', value: 'Ilíaco + trocanter maior antes da punção glútea', badge: 'ok' },
        ],
        footer_rule: 'Ventroglútea > dorsoglútea para evitar ciático',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM',
        items: [
          {
            label: 'Letra A — dorsoglútea',
            detail: 'Sítio tradicional com risco de atingir nervo ciático.',
            correct: 'Para evitar ciático, ventroglútea (D) é mais indicada no adulto.',
          },
          {
            label: 'Letra B — deltoide',
            detail: 'Braço não é foco da questão sobre ciático no glúteo.',
            correct: 'Enunciado pede sítio que evita ciático — ventroglútea, não deltoide.',
          },
          {
            label: 'Letra C — vasto lateral',
            detail: 'Sítio seguro na coxa, mas não é a resposta “mais indicada” do enunciado.',
            correct: 'Ventroglútea é referência clássica para afastar ciático em adultos.',
          },
        ],
        footer_rule: 'Hábito ≠ segurança — dorsoglútea perde para ventroglútea',
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
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:vias-g16] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g16] total=${ok}`);
}

main();
