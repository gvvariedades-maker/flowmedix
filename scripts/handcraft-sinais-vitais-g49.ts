#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g49 (3 slugs SHORT LOTE cauda_repair).
 * CAUDA/REPAIR — últimos slugs do catálogo (354) após g01–g48 + exceto piloto.
 *
 *   npm run handcraft:sinais-vitais-g49
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g49';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-07';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Sinais vitais — definição, faixas e terminologia',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'Quarteto clássico: temperatura · pulso · respiração · PA',
    'FR adulto 12–20 irpm (eupneia)',
    'Taquipneia — FR aumentada (>20 irpm)',
    'Bradipneia — FR diminuída · Apneia — ausência de respiração',
    'Temperatura — variação circadiana e contexto clínico',
    'SV isolado não diagnostica — avaliar conjunto e contexto',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Branch = 'vitals_generico' | 'vitals_pa_tecnica';

type Pack = {
  family: 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cotec-fadenor-enfermagem-verificacao-de-sinais-vitais-1779343956155-0': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline:
      'MS/COFEN — Taquipneia: frequência respiratória aumentada (>20 irpm no adulto; enunciado >30 irpm + dispnéia); bradipneia = FR baixa; apneia = ausência de respiração',
    exam_vs_current:
      'Builder legado rotulou como PA — conteúdo cobrado é terminologia respiratória (taquipneia × bradipneia × apneia)',
    roi_error: 'taquipneia_terminologia_fr',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia respiratória — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'FR >30 irpm + sensação de falta de ar — identificar o termo clínico para respiração acelerada.',
            icon: 'Target',
          },
          {
            label: 'Taquipneia',
            detail:
              'Frequência respiratória aumentada — adulto eupneico: 12–20 irpm; >20 = taquipneia (enunciado >30 confirma).',
            icon: 'Wind',
          },
          {
            label: 'Bradipneia',
            detail: 'FR abaixo do normal — oposto de taquipneia; não combina com “superior a 30”.',
            icon: 'TrendingDown',
          },
          {
            label: 'Apneia',
            detail: 'Ausência de movimentos respiratórios — paciente do caso respira (>30), logo não é apneia.',
            icon: 'Ban',
          },
          {
            label: 'Distratores PA',
            detail:
              'Hipertensão e hipotensão classificam pressão arterial — não descrevem padrão respiratório.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'FR alta + dispnéia = taquipneia — não confunda com PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FR superior a 30 irpm + falta de ar — nome da condição respiratória.',
          'Identificar parâmetro: frequência respiratória (não pressão arterial).',
          'FR >30 irpm = respiração acelerada → taquipneia.',
          'Eliminar A (bradipneia) — FR baixa, oposto do enunciado.',
          'Eliminar B (hipertensão) e C (hipotensão) — termos de PA, não de respiração.',
          'Eliminar E (apneia) — paciente respira (>30 irpm), não há ausência de respiração.',
          'Marcar D — taquipneia.',
        ],
        footer_rule: 'FR >20 (ou >30 no caso) = taquipneia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões respiratórios',
        meta: slideMeta,
        content: 'TERMINOLOGIA RESPIRATÓRIA',
        rows: [
          { label: 'Eupneia', value: 'FR normal adulto: 12–20 irpm', sv_kind: 'fr', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR aumentada (>20 irpm)', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: 'FR diminuída (<12 irpm)', sv_kind: 'fr', badge: 'warn' },
          { label: 'Apneia', value: 'Ausência de respiração', sv_kind: 'meta', badge: 'warn' },
          { label: 'Caso da prova', value: 'FR >30 irpm + dispnéia → taquipneia (D)', sv_kind: 'fr', badge: 'hot' },
        ],
        footer_rule: 'Hipertensão/hipotensão = PA — não entram em FR',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMINOLOGIA FR',
        items: [
          {
            label: 'Letra A — bradipneia',
            detail: 'Bradipneia = FR baixa — oposto de “superior a 30 incursões/minuto”.',
            correct:
              'Bradipneia indica respiração lenta; enunciado descreve FR elevada (>30) com dispnéia = taquipneia.',
          },
          {
            label: 'Letra B — hipertensão',
            detail: 'Termo de pressão arterial sistólica/diastólica elevada.',
            correct:
              'Hipertensão classifica PA, não frequência respiratória — gabarito D (taquipneia).',
          },
          {
            label: 'Letra C — hipotensão',
            detail: 'Pressão arterial baixa — distrator clássico quando o tema é outro SV.',
            correct:
              'Hipotensão não nomeia padrão respiratório acelerado — condição do caso é taquipneia.',
          },
          {
            label: 'Letra E — apneia',
            detail: 'Ausência total de movimentos respiratórios.',
            correct:
              'Apneia = zero respiração; paciente com FR >30 irpm respira aceleradamente, não está em apneia.',
          },
        ],
        footer_rule: 'FR alta = taquipneia — gabarito D',
      },
    ],
  },

  'educa-pb-enfermagem-verificacao-de-sinais-vitais-1779343883917-4': {
    family: 'protocolo',
    branch: 'vitals_generico',
    guideline:
      'MS/COFEN — Temperatura varia circadianamente; SV em contexto · FR 12–20 irpm · FC 60–100 bpm · HAS ≥140×90 mmHg · técnico afera SV',
    exam_vs_current:
      'Builder legado rotulou como FC — conteúdo cobrado é variações fisiológicas de SV (temperatura em contexto)',
    roi_error: 'sv_variacao_contexto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Variações fisiológicas dos SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Durante o processo de enfermagem — assinalar afirmativa CORRETA sobre variações e fatores que influenciam sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Temperatura em contexto',
            detail:
              'Varia circadianamente e com exercício, alimentação e ambiente — sempre interpretar no conjunto clínico (letra C).',
            icon: 'Thermometer',
          },
          {
            label: 'FC isolada',
            detail:
              '60–100 bpm em repouso é faixa normal, mas um único SV nunca basta para diagnóstico imediato.',
            icon: 'Activity',
          },
          {
            label: 'PA e sintomas',
            detail:
              'HAS se define por valores (≥140×90 mmHg), não exige dor torácica ou tontura para classificar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Papel do técnico',
            detail:
              'Aferição de SV integra rotina do técnico de enfermagem — não é função exclusiva do enfermeiro.',
            icon: 'UserCheck',
          },
        ],
        footer_rule: 'SV sempre em contexto — temperatura varia fisiologicamente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre variações fisiológicas dos sinais vitais.',
          'Testar A — FC 60–100 ok, mas “sinal isolado basta para diagnóstico”: absolutismo falso → eliminar.',
          'Testar B — HAS “só com sintomas”: hipertensão se define por valor, não por queixa → eliminar.',
          'Testar C — temperatura varia com dia, exercício, alimentação, ambiente; avaliar em contexto: correto.',
          'Testar D — FR normal 20–30 irpm: faixa errada (referência 12–20) → eliminar.',
          'Testar E — SV exclusivo do enfermeiro: técnico também afera → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Contexto clínico + variação fisiológica = letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas e contexto',
        meta: slideMeta,
        content: 'SV NO ADULTO — FAIXAS E INTERPRETAÇÃO',
        rows: [
          { label: 'FC repouso', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR adulto', value: '12–20 irpm (não 20–30)', sv_kind: 'fr', badge: 'hot' },
          { label: 'HAS', value: '≥140×90 mmHg — valor, não sintoma', sv_kind: 'pa', badge: 'warn' },
          { label: 'Temperatura', value: 'Varia circadiana + fatores externos', sv_kind: 'temp', badge: 'hot' },
          { label: 'Técnico', value: 'Aferição de SV faz parte da rotina', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Nunca diagnostique por um SV isolado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VARIAÇÕES DE SV',
        items: [
          {
            label: 'Letra A — diagnóstico por SV isolado',
            detail: 'FC 60–100 correta, mas “sempre suficiente para diagnóstico imediato” é absolutismo.',
            correct:
              'Um sinal vital isolado orienta monitoramento — diagnóstico exige contexto clínico, história e outros achados.',
          },
          {
            label: 'Letra B — HAS depende de sintomas',
            detail: 'Condiciona hipertensão a dor torácica ou tontura.',
            correct:
              'Hipertensão arterial se classifica por valores de PA (≥140×90 mmHg), independentemente de sintomas.',
          },
          {
            label: 'Letra D — FR 20–30 como normal',
            detail: 'Eleva o teto da FR adulta e diz que abaixo disso “sempre é normal”.',
            correct:
              'FR de referência no adulto: 12–20 irpm; 20–30 irpm inclui taquipneia — faixa da alternativa está errada.',
          },
          {
            label: 'Letra E — SV só para enfermeiro',
            detail: 'Restringe aferição ao enfermeiro com supervisão direta.',
            correct:
              'Técnico de enfermagem afera sinais vitais na rotina assistencial — competência prevista na prática do cargo.',
          },
        ],
        footer_rule: 'Temperatura em contexto = gabarito C',
      },
    ],
  },

  'ibfc-enfermagem-verificacao-de-sinais-vitais-1779344137078-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — Sinais vitais clássicos: temperatura, pulso (FC), frequência respiratória e pressão arterial — indicadores do estado geral e existência de vida',
    roi_error: 'sv_quarteto_classico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quarteto clássico de sinais vitais',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Definir quais sinais sobre o funcionamento do corpo humano devem ser compreendidos e conhecidos como sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Temperatura',
            detail: 'Reflete equilíbrio térmico — um dos quatro pilares clássicos de SV.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso (FC)',
            detail: 'Frequência e qualidade cardíaca percebidas à palpação — sinal vital central.',
            icon: 'Activity',
          },
          {
            label: 'Respiração (FR)',
            detail: 'Frequência e padrão respiratório — indicador ventilatório básico.',
            icon: 'Wind',
          },
          {
            label: 'Pressão arterial',
            detail: 'Pressão exercida pelo sangue nas artérias — completa o quarteto clássico cobrado em prova.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'T · P · R · PA = sinais vitais clássicos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: listar sinais vitais sobre o funcionamento do corpo humano.',
          'Fixar quarteto clássico: temperatura + pulso + respiração + pressão arterial.',
          'Eliminar A — inclui “visão”: função sensorial, não sinal vital de rotina.',
          'Eliminar B — “coordenação motora” e “audição”: não compõem o pacote clássico de SV.',
          'Eliminar D — tem PA e respiração, mas troca temperatura por “audição”.',
          'Marcar C — temperatura, respiração, pulso e pressão arterial.',
        ],
        footer_rule: 'Quatro pilares: temperatura · pulso · respiração · PA',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sinais vitais clássicos',
        meta: slideMeta,
        content: 'QUARTETO DE SINAIS VITAIS',
        rows: [
          { label: 'Temperatura', value: 'Equilíbrio térmico corporal', sv_kind: 'temp', badge: 'hot' },
          { label: 'Pulso (FC)', value: 'Frequência cardíaca à palpação', sv_kind: 'fc', badge: 'hot' },
          { label: 'Respiração (FR)', value: 'Frequência e padrão ventilatório', sv_kind: 'fr', badge: 'hot' },
          { label: 'Pressão arterial', value: 'Pressão nas artérias (mmHg)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Não são SV', value: 'Visão · audição · coordenação motora', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Decore T + P + R + PA — visão e audição são distratores',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LISTA DE SV',
        items: [
          {
            label: 'Letra A — visão',
            detail: 'Acrescenta acuidade visual ao quarteto — função neurológica/sensorial, não SV de rotina.',
            correct:
              'Visão não integra o pacote clássico de sinais vitais — quarteto = temperatura, pulso, respiração e PA (letra C).',
          },
          {
            label: 'Letra B — coordenação motora e audição',
            detail: 'Mistura funções neurológicas/sensoriais com parâmetros cardiovasculares e respiratórios.',
            correct:
              'Coordenação motora e audição não são sinais vitais de aferição rotineira — gabarito C mantém os quatro clássicos.',
          },
          {
            label: 'Letra D — audição no lugar de temperatura',
            detail: 'Tem PA, pulso e respiração corretos, mas substitui temperatura por audição.',
            correct:
              'Temperatura é pilar clássico de SV; audição é distractor — alternativa C lista os quatro corretos.',
          },
        ],
        footer_rule: 'T · P · R · PA = gabarito C',
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
    console.log(`[handcraft:sv-g49] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g49] total=${ok}`);
}

main();
