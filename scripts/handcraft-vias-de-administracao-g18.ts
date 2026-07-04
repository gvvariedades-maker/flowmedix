#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g18 (8 slugs P1 via_tecnica_admin).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g18.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g18';
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
    'técnica IM',
    'ângulo 90° IM',
    'volumes por sítio IM',
    'ventroglútea',
    'vasto lateral',
    'deltoide',
    'neonato IM',
    'marcos ósseos',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Técnica de punção IM',
  year: 2020,
  covers: ['sítios IM', 'volumes máximos', 'ventroglútea', 'deltoide', 'vasto lateral'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  sources?: typeof COFEN_SOURCE[];
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
    pedagogical_branch: BRANCH,
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
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'instituto-mais-enfermagem-vias-de-administracao-1778968862077-9': {
    family: 'vf',
    guideline: 'COFEN — IM 90° · vasto lateral até ~2–5 mL (não 6) · neonato = vasto lateral, não dorsoglútea',
    roi_error: 'vf_im_sem_julgamento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VF técnica IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas V/F sobre técnica IM — julgar cada item antes de montar a sequência.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — ângulo IM',
            detail: 'Inserção perpendicular à pele = 90° — técnica padrão para atingir ventre muscular.',
            icon: 'Gauge',
          },
          {
            label: 'Afirmativa II — volume vasto lateral',
            detail: 'Adulto: volume máximo do vasto lateral é menor que o citado no enunciado — afirmativa falsa.',
            icon: 'Droplets',
          },
          {
            label: 'Erro ROI — afirmativa III neonato',
            detail: 'III inverte sítio pediátrico: lactente/neonato → vasto lateral, não dorsoglútea (risco ciático).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Sequência gabarito',
            detail: 'V / F / F — apenas ângulo 90° é verdadeiro; volume e sítio neonatal estão errados.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'VF IM: julgue os três itens isolados antes de olhar A–D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: três proposições V/F sobre técnica IM — montar sequência só após julgar I, II e III.',
          'Julgar I — ângulo perpendicular à pele? → VERDADEIRO (90° na IM).',
          'Julgar II — volume máximo no vasto lateral como no enunciado? → FALSO (excede limite do sítio).',
          'Julgar III — neonato com dorsoglútea como mais seguro? → FALSO (vasto lateral na pediatria).',
          'Sequência correta: V / F / F.',
          'Eliminar A (V/F/V): III verdadeira — errado.',
          'Eliminar B (F/V/V): nega I (ângulo 90°) e aceita II falsa.',
          'Eliminar D (V/V/F): aceita II como verdadeira.',
          'Confirmar C: V / F / F.',
          'Marcar C.',
        ],
        footer_rule: 'Neonato + dorsoglútea = pegadinha clássica → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica IM na prova',
        meta: slideMeta,
        content: 'IM — ÂNGULO, VOLUME E SÍTIO',
        rows: [
          { label: 'Ângulo IM', value: '90° perpendicular ao músculo', badge: 'hot' },
          { label: 'Vasto lateral (adulto)', value: 'Volume limitado por sítio — II é falsa no enunciado', badge: 'warn' },
          { label: 'Neonato/lactente', value: 'Vasto lateral da coxa — sítio preferencial', badge: 'ok' },
          { label: 'Dorsoglútea', value: 'Evitar em crianças pequenas — risco nervo ciático', badge: 'warn' },
          { label: 'Deltoide', value: 'Volume pequeno (~1–2 mL) — vacinas e analgésicos', badge: 'info' },
        ],
        footer_rule: 'COFEN: 90° · volume por sítio · pediatria na coxa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VF TÉCNICA IM',
        items: [
          {
            label: 'Letra A — V / F / V',
            detail: 'Aceita dorsoglútea como sítio seguro em neonato (III = V).',
            correct: 'Neonato não usa dorsoglútea — vasto lateral é o sítio indicado; afirmativa III é falsa.',
          },
          {
            label: 'Letra B — F / V / V',
            detail: 'Nega I (ângulo 90°) e valida II (volume exagerado).',
            correct: 'IM exige 90° perpendicular; II excede volume seguro do vasto lateral em adulto.',
          },
          {
            label: 'Letra D — V / V / F',
            detail: 'Marca II (volume máximo citado) como verdadeira.',
            correct: 'II é falsa — vasto lateral não admite o volume máximo proposto no enunciado.',
          },
        ],
        footer_rule: 'Cada sequência errada falha em volume, ângulo ou sítio pediátrico',
      },
    ],
  },

  'instituto-verbena-enfermagem-vias-de-administracao-1776056409987-4': {
    family: 'conceito',
    guideline: 'COFEN/Potter — ventroglútea: EIAS + crista ilíaca + trocanter maior + glúteos médio/mínimo',
    roi_error: 'ventrogluteo_inseguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Marcos da ventroglútea — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Estruturas anatômicas para delimitar a região ventroglútea — marcos ósseos + músculos-alvo.',
            icon: 'Target',
          },
          {
            label: 'Espinha ilíaca anterossuperior',
            detail: 'Marco superior-anterior — dedo indicador na técnica em “V”.',
            icon: 'Bone',
          },
          {
            label: 'Crista ilíaca + trocanter maior',
            detail: 'Limites laterais do triângulo ventroglúteo — palpação antes da punção.',
            icon: 'MapPin',
          },
          {
            label: 'Glúteos médio e mínimo',
            detail: 'Ventres musculares no centro do triângulo — alvo da agulha IM.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI — processo acromial',
            detail: 'Banca mistura marco do deltoide (acromial) com ventroglútea — rotas anatômicas diferentes.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Erro ROI — artéria femoral',
            detail: 'Incluir vaso femoral na delimitação — risco vascular, não faz parte do método ventroglúteo.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Ventroglútea = EIAS + crista + trocanter + glúteo médio/mínimo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: estruturas para delimitar ventroglútea — pouca vascularização, fácil delimitação, menos dor.',
          'Fixar marcos: EIAS, crista ilíaca, trocanter maior, glúteos médio e mínimo.',
          'Eliminar B: inclui processo acromial — marco do deltoide, não da ventroglútea.',
          'Eliminar C: cita artéria femoral — estrutura vascular, não marco de delimitação IM.',
          'Eliminar D: glúteo máximo + espinha ilíaca posterossuperior — perfil dorsoglútea.',
          'Confirmar A: EIAS + crista + trocanter + glúteos médio e mínimo.',
          'Marcar A.',
          'Fixação: acromial = deltoide; glúteo máximo = dorsoglútea.',
        ],
        footer_rule: 'Sem acromial nem artéria femoral → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — delimitação ventroglútea',
        meta: slideMeta,
        content: 'VENTROGLÚTEA — MARCOS ANATÔMICOS',
        rows: [
          { label: 'EIAS', value: 'Espinha ilíaca anterossuperior — vértice do “V”', badge: 'hot' },
          { label: 'Crista ilíaca', value: 'Limite superior do triângulo — dedo médio afastado', badge: 'ok' },
          { label: 'Trocanter maior', value: 'Base do triângulo — palma sobre o fêmur', badge: 'ok' },
          { label: 'Músculos-alvo', value: 'Glúteo médio e mínimo — centro do triângulo', badge: 'hot' },
          { label: 'Não confundir', value: 'Acromial = deltoide · Glúteo máximo = dorsoglútea', badge: 'warn' },
        ],
        footer_rule: 'Técnica em V: centro do triângulo = punção segura',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MARCOS VENTROGLÚTEA',
        items: [
          {
            label: 'Letra B — processo acromial',
            detail: 'Lista acromial entre marcos da ventroglútea.',
            correct: 'Processo acromial delimita deltoide — não entra na técnica ventroglútea.',
          },
          {
            label: 'Letra C — artéria femoral',
            detail: 'Inclui artéria femoral e vasto lateral como estruturas de delimitação.',
            correct: 'Artéria femoral é risco vascular; marcos ventroglúteos são ósseos + glúteo médio/mínimo.',
          },
          {
            label: 'Letra D — glúteo máximo',
            detail: 'Cita glúteo máximo e espinha ilíaca posterossuperior.',
            correct: 'Conjunto descreve dorsoglútea — ventroglútea usa glúteo médio/mínimo, não o máximo.',
          },
        ],
        footer_rule: 'Cada distrator troca sítio IM ou inclui estrutura errada',
      },
    ],
  },

  'ivin-enfermagem-vias-de-administracao-1776056391403-3': {
    family: 'conceito',
    guideline: 'COFEN — ventroglútea: glúteo médio/mínimo cobertos pelo máximo, livre de nervos/vasos, menos SC',
    roi_error: 'ventrogluteo_inseguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítio IM mais seguro — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Região cientificamente mais segura para IM — descrição anatômica no enunciado.',
            icon: 'Target',
          },
          {
            label: 'Glúteo médio e mínimo',
            detail: 'Ventres profundos cobertos pelo glúteo máximo — alvo da ventroglútea.',
            icon: 'Shield',
          },
          {
            label: 'Livre de nervos e vasos',
            detail: 'Afasta nervo ciático e grandes vasos — vantagem sobre dorsoglútea.',
            icon: 'Heart',
          },
          {
            label: 'Menor tecido SC',
            detail: 'Hipoderme fina comparada a outros sítios — absorção muscular eficiente.',
            icon: 'Layers',
          },
          {
            label: 'Erro ROI — dorsoglútea',
            detail: 'Banca oferece dorsoglútea — sítio com risco de lesão do nervo ciático.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide e vasto',
            detail: 'Sítios válidos, mas enunciado descreve perfil ventroglúteo (glúteos médio/mínimo).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Descrição = ventroglútea, não dorsoglútea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: região mais segura para IM — glúteo médio/mínimo, sem nervos, menos SC.',
          'Reconhecer perfil: ventroglútea (glúteo médio coberto pelo máximo).',
          'Eliminar A: dorsoglútea — risco de nervo ciático, não é o mais seguro.',
          'Eliminar C: deltoide — volume limitado, não corresponde à descrição de glúteos.',
          'Eliminar D: vasto lateral — coxa pediátrica/adulto, sem glúteo médio/mínimo.',
          'Eliminar E: vasto medial — não é sítio IM clássico de prova.',
          'Confirmar B: ventroglútea.',
          'Marcar B.',
        ],
        footer_rule: 'Glúteo médio/mínimo + segurança = ventroglútea',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM seguros',
        meta: slideMeta,
        content: 'SÍTIOS IM — SEGURANÇA ANATÔMICA',
        rows: [
          { label: 'Ventroglútea', value: 'Glúteo médio/mínimo — mais segura, afasta ciático', badge: 'hot' },
          { label: 'Dorsoglútea', value: 'Risco nervo ciático — exige marcos e técnica', badge: 'warn' },
          { label: 'Vasto lateral', value: 'Preferencial lactentes — músculo desenvolvido ao nascer', badge: 'ok' },
          { label: 'Deltoide', value: 'Pequenos volumes — vacinas e analgésicos', badge: 'info' },
          { label: 'Técnica', value: '90° · assepsia · palpar antes da punção', badge: 'ok' },
        ],
        footer_rule: 'Ventroglútea = referência de segurança em adultos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM SEGURO',
        items: [
          {
            label: 'Letra A — dorsoglútea',
            detail: 'Escolhe região com risco de lesão do nervo ciático.',
            correct: 'Dorsoglútea não é a mais segura — ventroglútea afasta nervos e vasos importantes.',
          },
          {
            label: 'Letra C — deltoide',
            detail: 'Sítio de braço com volume limitado.',
            correct: 'Deltoide não tem glúteo médio/mínimo coberto pelo máximo — perfil do enunciado é ventroglútea.',
          },
          {
            label: 'Letra D — vasto lateral',
            detail: 'Músculo da coxa — opção pediátrica, não glútea.',
            correct: 'Vasto lateral é coxa; enunciado descreve ventres glúteos médio/mínimo.',
          },
        ],
        footer_rule: 'Cada distrator é sítio IM válido, mas não casa com o enunciado',
      },
    ],
  },

  'ivin-enfermagem-vias-de-administracao-1778968629127-5': {
    family: 'conceito',
    guideline: 'COFEN — técnica em V: palma no trocanter, indicador na EIAS, médio na crista ilíaca',
    roi_error: 'ventrogluteo_inseguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica em V — ventroglútea',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Delimitação da região mais segura para IM — técnica manual em “V”.',
            icon: 'Target',
          },
          {
            label: 'Palma no trocanter maior',
            detail: 'Mão não dominante sobre o fêmur — base do triângulo.',
            icon: 'Hand',
          },
          {
            label: 'Indicador na EIAS',
            detail: 'Espinha ilíaca anterossuperior — primeiro vértice do V.',
            icon: 'Bone',
          },
          {
            label: 'Médio na crista ilíaca',
            detail: 'Dedo médio o mais distante possível — abre o triângulo de punção.',
            icon: 'MapPin',
          },
          {
            label: 'Centro do triângulo',
            detail: 'Ponto de aplicação no glúteo médio — ventroglútea.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI — “glútea” genérica',
            detail: 'Letra A omite técnica em V — banca testa se você diferencia ventro de dorsoglútea.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Técnica em V = ventroglútea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: região mais segura + técnica em V com trocanter, EIAS e crista ilíaca.',
          'Reconhecer: descrição clássica da delimitação ventroglútea.',
          'Eliminar A: “glútea” genérica — não especifica ventro nem técnica em V.',
          'Eliminar B: dorsoglútea — técnica diferente (quadrante superior).',
          'Eliminar D: vasto lateral — coxa, sem marcos ilíacos.',
          'Eliminar E: deltoide — braço, processo acromial.',
          'Confirmar C: ventroglútea.',
          'Marcar C.',
        ],
        footer_rule: 'V com EIAS + crista + trocanter → ventroglútea',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica ventroglútea',
        meta: slideMeta,
        content: 'DELIMITAÇÃO VENTROGLÚTEA',
        rows: [
          { label: 'Passo 1', value: 'Palma sobre trocanter maior do fêmur', badge: 'ok' },
          { label: 'Passo 2', value: 'Indicador na espinha ilíaca anterossuperior', badge: 'ok' },
          { label: 'Passo 3', value: 'Médio na crista ilíaca — máximo afastamento', badge: 'ok' },
          { label: 'Punção', value: 'Centro do triângulo — glúteo médio', badge: 'hot' },
          { label: 'Segurança', value: 'Livre de nervo ciático e grandes vasos', badge: 'warn' },
        ],
        footer_rule: 'Mnemônico: palma-trocanter · indicador-EIAS · médio-crista',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA EM V',
        items: [
          {
            label: 'Letra A — glútea genérica',
            detail: 'Resposta vaga sem técnica de delimitação.',
            correct: 'Enunciado descreve técnica em V — ventroglútea, não “glútea” sem especificar.',
          },
          {
            label: 'Letra B — dorsoglútea',
            detail: 'Sítio posterior com outra delimitação.',
            correct: 'Dorsoglútea usa quadrante superior — não a técnica em V com EIAS e crista.',
          },
          {
            label: 'Letra D — vasto lateral',
            detail: 'Retângulo na coxa — outro sítio IM.',
            correct: 'Vasto lateral é delimitado na coxa, não com trocanter + EIAS + crista.',
          },
        ],
        footer_rule: 'Cada distrator troca sítio ou omite a técnica em V',
      },
    ],
  },

  'maranatha-assessoria-enfermagem-vias-de-administracao-1776056348175-4': {
    family: 'certo_errado',
    guideline: 'COFEN — vasto lateral: 90° IM · retângulo na coxa · volume acima do mínimo citado no distrator',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM no vasto lateral — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Técnica correta para IM no vasto lateral em adulto — evitar complicações.',
            icon: 'Target',
          },
          {
            label: 'Ângulo 90°',
            detail: 'IM exige perpendicular ao músculo — 15° é perfil de SC/ID, não IM.',
            icon: 'Gauge',
          },
          {
            label: 'Delimitação retangular',
            detail: 'Retângulo na coxa: 12–15 cm do trocanter e 9–12 cm acima do joelho.',
            icon: 'Square',
          },
          {
            label: 'Erro ROI — agulha fina e curta',
            detail: 'Calibre inadequado para IM profunda — típico de SC, não atinge ventre muscular.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Erro ROI — volume subestimado',
            detail: 'Subestima capacidade do vasto lateral — adulto admite volume maior que o citado no distrator.',
            icon: 'Droplets',
          },
          {
            label: 'Gabarito B',
            detail: 'Traçar retângulo com medidas do trocanter ao joelho — técnica COFEN.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Vasto lateral: 90° + retângulo na coxa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta para IM no vasto lateral em adulto.',
          'Eliminar A: ângulo 15° — IM requer 90°, não ângulo de SC.',
          'Eliminar C: agulha fina e curta — calibre de SC, não IM profunda.',
          'Eliminar D: volume máximo subestimado — vasto lateral admite mais que o citado.',
          'Confirmar B: retângulo 12–15 cm do trocanter e 9–12 cm acima do joelho.',
          'Marcar B.',
          'Fixação: 15° e agulha curta = pegadinhas de via errada.',
        ],
        footer_rule: 'Delimitação anatômica na coxa → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vasto lateral IM',
        meta: slideMeta,
        content: 'VASTO LATERAL — TÉCNICA',
        rows: [
          { label: 'Ângulo', value: '90° perpendicular ao músculo', badge: 'hot' },
          { label: 'Delimitação', value: 'Retângulo: 12–15 cm do trocanter · 9–12 cm acima do joelho', badge: 'hot' },
          { label: 'Volume adulto', value: 'Capacidade maior que 1 unidade fixa — ver limite por sítio', badge: 'ok' },
          { label: 'Agulha IM', value: 'Calibre adequado à profundidade muscular — não agulha curta de SC', badge: 'warn' },
          { label: 'Pediatria', value: 'Sítio preferencial <12 meses — músculo desenvolvido ao nascer', badge: 'info' },
        ],
        footer_rule: 'COFEN: marcos na coxa antes da punção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VASTO LATERAL',
        items: [
          {
            label: 'Letra A — ângulo 15°',
            detail: 'Propõe ângulo baixo para “minimizar lesão muscular”.',
            correct: 'IM exige 90° — 15° é técnica de SC/ID, não atinge ventre muscular adequadamente.',
          },
          {
            label: 'Letra C — agulha fina e curta',
            detail: 'Calibre inadequado para “IM profunda”.',
            correct: 'Agulhas curtas/finas são para SC — IM profunda requer calibre e comprimento maiores.',
          },
          {
            label: 'Letra D — volume subestimado',
            detail: 'Limita volume a valor mínimo no vasto lateral adulto.',
            correct: 'Vasto lateral admite volumes maiores — limite citado subestima capacidade do sítio.',
          },
        ],
        footer_rule: 'Cada distrator troca ângulo, agulha ou volume',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1776056338955-2': {
    family: 'vf',
    guideline: 'COFEN — deltoide: pequeno volume · acima da axila · vasto lateral <12 meses · dividir dose >3–4 mL',
    roi_error: 'vf_im_sem_julgamento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM I–IV — mapa V/F da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro itens sobre técnica IM — julgar I–IV antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'Item I — deltoide',
            detail: 'Pequeno volume, medicamentos não irritantes — vacinas, analgésicos, antieméticos: VERDADEIRO.',
            icon: 'Syringe',
          },
          {
            label: 'Item II — deltoide abaixo da axila',
            detail: 'IM deltoide abaixo do nível da axila — FALSO: aplicação no nível ou acima da axila.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Item III — vasto lateral <12 meses',
            detail: 'Músculo desenvolvido ao nascer — sítio preferencial em lactentes: VERDADEIRO.',
            icon: 'Baby',
          },
          {
            label: 'Item IV — dividir dose elevada',
            detail: 'Volumes maiores dividir em sítios distintos — VERDADEIRO.',
            icon: 'Droplets',
          },
          {
            label: 'Erro ROI — item II',
            detail: 'Banca inverte posição deltoide — abaixo da axila é conduta incorreta.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'V/F: I e III verdadeiros · II falso · IV verdadeiro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–IV + Está CORRETO — julgar cada item isoladamente.',
          'Julgar I: deltoide para pequeno volume não irritante? → VERDADEIRO.',
          'Julgar II: deltoide abaixo da axila? → FALSO (nível/acima da axila).',
          'Julgar III: vasto lateral preferencial <12 meses? → VERDADEIRO.',
          'Julgar IV: dividir dose em volumes elevados? → VERDADEIRO.',
          'Conjunto: I, III e IV verdadeiros.',
          'Eliminar A (I e II), B (I e III sem IV), D (II falso incluído).',
          'Confirmar C: apenas I, III e IV.',
          'Marcar C.',
        ],
        footer_rule: 'Item II (abaixo axila) é a chave falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica IM na prova',
        meta: slideMeta,
        content: 'IM — SÍTIOS E VOLUMES',
        rows: [
          { label: 'Deltoide', value: 'Pequeno volume · não irritante · nível/acima da axila', badge: 'hot' },
          { label: 'Vasto lateral', value: 'Preferencial lactentes <12 meses', badge: 'ok' },
          { label: 'Volume alto', value: 'Doses elevadas → dividir em sítios distintos', badge: 'warn' },
          { label: 'Ventroglútea', value: 'Adultos — sítio seguro, afasta ciático', badge: 'info' },
          { label: 'Ângulo IM', value: '90° perpendicular ao músculo', badge: 'ok' },
        ],
        footer_rule: 'Deltoide: posição anatômica correta é pegadinha clássica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IM I–IV',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Inclui item II (deltoide abaixo da axila) como verdadeiro.',
            correct: 'Item II é falso — deltoide IM aplica-se no nível ou acima da axila, não abaixo.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Omite item IV (dividir doses elevadas).',
            correct: 'Item IV é verdadeiro — volumes altos exigem divisão em sítios distintos.',
          },
          {
            label: 'Letra D — II, III e IV',
            detail: 'Aceita item II como verdadeiro.',
            correct: 'Deltoide abaixo da axila é conduta incorreta — item II deve ser excluído.',
          },
        ],
        footer_rule: 'II falso separa C das demais combinações',
      },
    ],
  },

  'objetiva-concursos-enfermagem-vias-de-administracao-1778968906156-3': {
    family: 'vf',
    guideline: 'Clayton/Stock — sítios IM: deltoide e ventroglútea; periumbilical é SC, não IM',
    roi_error: 'vf_im_sem_julgamento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítios IM Clayton — mapa V/F',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três itens sobre músculos para IM — julgar antes de combinar.',
            icon: 'Target',
          },
          {
            label: 'Item I — deltoide',
            detail: 'Músculo clássico para IM de pequeno volume — VERDADEIRO.',
            icon: 'Syringe',
          },
          {
            label: 'Item II — periumbilical',
            detail: 'Região periumbilical é sítio SC (insulina/heparina), não IM — FALSO.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Item III — ventroglúteo',
            detail: 'Glúteo médio — sítio IM seguro em adultos — VERDADEIRO.',
            icon: 'Shield',
          },
          {
            label: 'Erro ROI — periumbilical',
            detail: 'Banca mistura via SC com IM — periumbilical não é punção muscular.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Periumbilical = SC · deltoide + ventroglútea = IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–III + Está(ão) CORRETO(S) — V/F item a item.',
          'Julgar I: deltoide como sítio IM? → VERDADEIRO.',
          'Julgar II: periumbilical como sítio IM? → FALSO (é SC).',
          'Julgar III: ventroglúteo como sítio IM? → VERDADEIRO.',
          'Conjunto: apenas I e III.',
          'Eliminar A (só I), B (só II falso), C (I e II), E (todos).',
          'Confirmar D: somente I e III.',
          'Marcar D.',
        ],
        footer_rule: 'Periumbilical elimina B, C e E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM clássicos',
        meta: slideMeta,
        content: 'MÚSCULOS PARA IM',
        rows: [
          { label: 'Deltoide', value: 'Braço — pequenos volumes, vacinas', badge: 'ok' },
          { label: 'Ventroglútea', value: 'Glúteo médio — adultos, sítio seguro', badge: 'hot' },
          { label: 'Vasto lateral', value: 'Coxa — lactentes e crianças', badge: 'ok' },
          { label: 'Periumbilical', value: 'Sítio SC (insulina) — NÃO é IM', badge: 'warn' },
          { label: 'Dorsoglútea', value: 'IM com cautela — risco ciático', badge: 'info' },
        ],
        footer_rule: 'Não confundir sítio SC com músculo IM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIOS IM',
        items: [
          {
            label: 'Letra B — só item II',
            detail: 'Marca apenas periumbilical como correto.',
            correct: 'Periumbilical é via SC — não é músculo para punção IM.',
          },
          {
            label: 'Letra C — I e II',
            detail: 'Inclui periumbilical junto com deltoide.',
            correct: 'Item II é falso — região periumbilical não é sítio IM clássico.',
          },
          {
            label: 'Letra E — todos os itens',
            detail: 'Aceita periumbilical como IM válida.',
            correct: 'Ventroglútea e deltoide são IM; periumbilical pertence à técnica SC.',
          },
        ],
        footer_rule: 'Item II (periumbilical) é a armadilha central',
      },
    ],
  },

  'omni-enfermagem-vias-de-administracao-1778969007166-1': {
    family: 'certo_errado',
    guideline: 'COFEN — deltoide: localizar pelo acromial ~4 cm abaixo · ~1–2 mL · 90° · vacinas indicadas',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM deltoide — mapa CORRETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'É CORRETO afirmar sobre aplicação IM deltoide — uma alternativa verdadeira.',
            icon: 'Target',
          },
          {
            label: 'Localização acromial',
            detail: 'Processo acromial como referência — músculo ~4 cm abaixo: conduta correta (B).',
            icon: 'Bone',
          },
          {
            label: 'Erro ROI — volume 5 mL',
            detail: 'Deltoide admite ~1–2 mL — 5 mL excede capacidade do sítio.',
            icon: 'Droplets',
          },
          {
            label: 'Erro ROI — ângulo 45°',
            detail: 'IM exige 90° — 45° é técnica SC, não deltoide IM.',
            icon: 'Gauge',
          },
          {
            label: 'Erro ROI — contraindicar vacinas',
            detail: 'Deltoide é sítio clássico de vacinação — banca inverte indicação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Deltoide: acromial + 4 cm + 90° + pequeno volume',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre IM deltoide.',
          'Eliminar A: até 5 mL — deltoide limita ~1–2 mL.',
          'Eliminar C: ângulo 45° — IM requer 90° perpendicular.',
          'Eliminar D: contraindicado para vacinas — deltoide é sítio vacinal clássico.',
          'Confirmar B: acromial + músculo ~4 cm abaixo — técnica de localização.',
          'Marcar B.',
          'Fixação: volume alto + 45° + anti-vacina = três pegadinhas.',
        ],
        footer_rule: 'Localização pelo acromial → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — IM deltoide',
        meta: slideMeta,
        content: 'DELTOIDE — TÉCNICA IM',
        rows: [
          { label: 'Localização', value: 'Processo acromial — músculo ~4 cm abaixo', badge: 'hot' },
          { label: 'Volume', value: 'Até ~1–2 mL — não 5 mL', badge: 'warn' },
          { label: 'Ângulo', value: '90° perpendicular — não 45°', badge: 'hot' },
          { label: 'Indicação', value: 'Vacinas, analgésicos, antieméticos não irritantes', badge: 'ok' },
          { label: 'Posição', value: 'Nível ou acima da axila', badge: 'info' },
        ],
        footer_rule: 'COFEN: deltoide = pequeno volume + 90°',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IM DELTOIDE',
        items: [
          {
            label: 'Letra A — até 5 mL',
            detail: 'Propõe 5 mL para antibióticos e anti-inflamatórios.',
            correct: 'Deltoide admite ~1–2 mL — 5 mL excede volume seguro do sítio.',
          },
          {
            label: 'Letra C — ângulo 45°',
            detail: 'Aplicação em 45° em direção ao músculo.',
            correct: 'IM deltoide exige 90° perpendicular — 45° é técnica de SC.',
          },
          {
            label: 'Letra D — contraindicado vacinas',
            detail: 'Afirma que deltoide é contraindicado para vacinação.',
            correct: 'Deltoide é sítio clássico de vacinas — contraindicação é inverção da prática.',
          },
        ],
        footer_rule: 'Cada distrator erra volume, ângulo ou indicação',
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
    console.log(`[handcraft:vias-g18] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g18] total=${ok}`);
}

main();
