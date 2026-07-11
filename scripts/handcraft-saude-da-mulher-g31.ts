#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g31 (3 slugs — tail final handcraft).
 *
 *   npm run handcraft:saude-da-mulher-g31
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g31 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g31';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const SM_SOURCE = {
  id: 'ms-saude-mulher-aps',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — rastreio do câncer do colo e PNAISM',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['citologia cervical', 'PNAISM', 'indicadores perinatais'],
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

type Branch = 'mulher_generico';

type Pack = {
  family: 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
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
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [SM_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'legalle-enfermagem-processo-de-enfermagem-1780010579953-6': {
    family: 'protocolo',
    branch: 'mulher_generico',
    guideline:
      'MS/INCA 2016 — preparo citopatológico: medicamentos vaginais 48h; abstinência só com lubrificante/espermicida; menstruação não contraindica se oportunidade única; duchas sem benefício',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Citologia — preparo',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Correlacionar orientações de preparo do exame citopatológico do colo — qualidade da amostra.', icon: 'Target' },
          { label: 'Qualidade amostra', detail: 'Orientações melhoram leitura — nem todas adiam coleta obrigatoriamente.', icon: 'Microscope' },
          { label: 'Pegadinha adiar menstruação', detail: 'Ideal aguardar dias após fluxo — mas oportunidade única não contraindica.', icon: 'AlertTriangle' },
          { label: 'Pegadinha duchas vaginais', detail: 'Não traz benefício — não incentivar como rotina antes da coleta.', icon: 'Ban' },
        ],
        footer_rule: 'Correlação preparo — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Preparo citológico',
        meta: slideMeta,
        content: 'COLETA COLP',
        rows: [
          { label: 'Medicamentos vaginais', value: 'Evitar 48h antes — interferem na amostra', badge: 'hot', emphasis: 'highlight' },
          { label: 'Abstinência sexual', value: 'Restrição se preservativo com lubrificante/espermicida', badge: 'hot' },
          { label: 'Menstruação', value: 'Aguardar se possível — não adia se única chance', badge: 'warn' },
          { label: 'Duchas vaginais', value: 'Sem benefício — não rotina', badge: 'info' },
        ],
        footer_rule: 'Ordem 1-2-3-4 — letra E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citologia cervical — correlacionar preparo.',
          'Eliminar A — ordem inverte duchas e medicamentos.',
          'Eliminar B — menstruação não fica na última posição.',
          'Eliminar C — abstinência e medicamentos trocados.',
          'Eliminar D — medicamentos vaginais fora da posição 48h.',
          'Marcar letra E — sequência 1-2-3-4.',
        ],
        footer_rule: 'E = 1 – 2 – 3 – 4',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO CITOLOGIA',
        items: [
          { label: 'Letra A — inverte duchas', detail: 'Ducha não é primeira orientação de qualidade.', correct: 'Pegadinha duchas — eliminar A; ordem 1-2-3-4.' },
          { label: 'Letra B — menstruação no fim', detail: 'Menstruação é item 3, não último par.', correct: 'Pegadinha adiar menstruação — eliminar B.' },
          { label: 'Letra C — abstinência invertida', detail: 'Abstinência ligada a lubrificante/espermicida.', correct: 'Medicamentos 48h — eliminar C.' },
          { label: 'Letra D — medicamentos no meio', detail: 'Medicamentos vaginais = 48h (posição 4 na coluna II).', correct: 'Correlação correta — marcar E.' },
        ],
        footer_rule: 'Não confundir adiar × qualidade',
      },
    ],
  },

  'unifil-enfermagem-processo-de-enfermagem-1780004452857-9': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline:
      'MS — PNAISM (Portaria GM/MS 2010+): integralidade, equidade, universalidade, direitos humanos; pilares ciclo de vida, SSR e enfrentamento desigualdade de gênero',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PNAISM — princípios',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Política Nacional de Atenção Integral à Saúde da Mulher — princípios e pilares no SUS.', icon: 'Target' },
          { label: 'Integralidade SUS', detail: 'Promoção, prevenção, tratamento e reabilitação — não só cura.', icon: 'Heart' },
          { label: 'Pegadinha exclusiva mortalidade', detail: 'Reduzir mortalidade materna importa — mas política não é só isso nem só universalidade/hierarquia.', icon: 'AlertTriangle' },
          { label: 'Pegadinha fragmentada', detail: 'Pilares não são ações curativas isoladas sem determinantes sociais.', icon: 'Ban' },
        ],
        footer_rule: 'Integralidade + equidade — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'PNAISM — referência',
        meta: slideMeta,
        content: 'PNAISM',
        rows: [
          { label: 'Princípios', value: 'Integralidade, equidade, universalidade, direitos humanos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ciclo de vida', value: 'Atenção em todas as fases', badge: 'hot' },
          { label: 'SSR', value: 'Direitos sexuais e reprodutivos', badge: 'info' },
          { label: 'Gênero', value: 'Enfrentar desigualdades históricas', badge: 'warn' },
        ],
        footer_rule: 'Não reduzir a especializada — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PNAISM — princípios e pilares.',
          'Eliminar A — não é exclusivamente mortalidade materna nem só universalidade/hierarquia.',
          'Testar B — integralidade, equidade, ciclo de vida, SSR e gênero.',
          'Eliminar C — não é fragmentada só curativa.',
          'Eliminar D — inclui promoção, prevenção e participação social.',
          'Marcar letra B.',
        ],
        footer_rule: 'Política integral — letra B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PNAISM',
        items: [
          { label: 'Letra A — exclusiva', detail: 'Mortalidade materna + só universalidade/hierarquia.', correct: 'Pegadinha exclusiva mortalidade — eliminar A.' },
          { label: 'Letra C — fragmentada', detail: 'Só curativo sem determinantes sociais.', correct: 'Pegadinha fragmentada — eliminar C.' },
          { label: 'Letra D — só especializada', detail: 'Ignora promoção e prevenção na APS.', correct: 'Integralidade SUS — eliminar D.' },
        ],
        footer_rule: 'Pilares amplos — marcar B',
      },
    ],
  },

  'vunesp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-4': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline:
      'OMS — mortalidade perinatal: óbitos fetais tardios + óbitos neonatais precoces; indicador de assistência obstétrica e neonatal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Indicador obstétrico',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Indicador para analisar assistência obstétrica, neonatal e uso dos serviços.', icon: 'Target' },
          { label: 'Perinatal', detail: 'Abrange feto tardio e neonato precoce — qualidade do parto e puerpério imediato.', icon: 'Activity' },
          { label: 'Pegadinha só neonatal', detail: 'Neonatal isolado não inclui óbito fetal tardio do período perinatal.', icon: 'AlertTriangle' },
          { label: 'Pegadinha pós-neonatal', detail: 'Após a primeira semana já é outro indicador — não cobre assistência ao parto.', icon: 'Ban' },
        ],
        footer_rule: 'Obstétrico + neonatal — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mortalidade perinatal',
        meta: slideMeta,
        content: 'OMS — PERINATAL',
        rows: [
          { label: 'Fetal tardio', value: 'Óbito fetal no período perinatal (definição OMS)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Neonatal precoce', value: 'Óbito do recém-nascido na primeira semana', badge: 'hot' },
          { label: 'Uso', value: 'Avaliar assistência obstétrica e neonatal', badge: 'info' },
          { label: 'Pegadinha', value: 'Neonatal sozinho ≠ período perinatal completo', badge: 'warn' },
        ],
        footer_rule: 'Índice perinatal — letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Indicador obstétrico-neonatal — qual escolher?',
          'Eliminar A — causas específicas é recorte, não índice perinatal.',
          'Eliminar B — neonatal isolado não inclui óbito fetal tardio.',
          'Eliminar C — pós-neonatal é após a primeira semana.',
          'Eliminar E — proporcional por causas não é o índice pedido.',
          'Marcar letra D — perinatal.',
        ],
        footer_rule: 'Parto + RN precoce — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MORTALIDADE',
        items: [
          { label: 'Letra B — neonatal', detail: 'Só recém-nascido — sem feto tardio.', correct: 'Pegadinha só neonatal — eliminar B.' },
          { label: 'Letra C — pós-neonatal', detail: 'Período após primeira semana.', correct: 'Pegadinha pós-neonatal — eliminar C.' },
          { label: 'Letra A — causas específicas', detail: 'Recorte etiológico, não índice perinatal.', correct: 'Perinatal integra parto — eliminar A.' },
          { label: 'Letra E — proporcional', detail: 'Não mede assistência obstétrica direta.', correct: 'Índice perinatal — marcar D.' },
        ],
        footer_rule: 'Perinatal = fetal tardio + RN precoce',
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
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: questionRest,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g31] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g31] total=${ok}`);
}

main();
