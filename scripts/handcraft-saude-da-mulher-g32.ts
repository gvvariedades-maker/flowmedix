#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g32 (4 slugs absorbed · mulher_prenatal).
 *
 *   npm run handcraft:saude-da-mulher-g32
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g32 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g32';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['sinais de certeza', 'hipertensão gestacional', 'consulta pré-natal', 'ameaça de aborto'],
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

type Branch = 'mulher_prenatal';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
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
    sources: [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/≥\s*≥/g, '')
    .replace(/coriogonadotrófico/gi, 'gonadotrófico coriônico')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'cotec-fadenor-enfermagem-saude-da-mulher-1777104301763-2': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — sinais de certeza: hCG, BCF audível, palpação fetal; BCF não na 1ª semana',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais de certeza',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'V/F sobre sinais de certeza da gestação — ordem correta.', icon: 'Target' },
          { label: 'hCG urina e sangue', detail: 'Dosagem positiva confirma gravidez — ambos verdadeiros.', icon: 'TestTube' },
          { label: 'Pegadinha BCF 1ª semana', detail: 'Ausculta fetal na primeira semana é falsa — BCF audível mais tardiamente.', icon: 'AlertTriangle' },
          { label: 'Palpação fetal', detail: 'Partes fetais no abdome materno — sinal de certeza exclusivo da gestação.', icon: 'Baby' },
        ],
        footer_rule: 'V,V,F,V — letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Certeza gestacional',
        meta: slideMeta,
        content: 'SINAIS DE CERTEZA',
        rows: [
          { label: 'hCG', value: 'Urina ou sangue — positivo indica gravidez', badge: 'hot', emphasis: 'highlight' },
          { label: 'BCF', value: 'Audível após viabilidade — não na 1ª semana', badge: 'warn' },
          { label: 'Palpação', value: 'Partes fetais — exclusiva da gestação', badge: 'hot' },
          { label: 'Pegadinha', value: 'Presunção (amenorreia) ≠ certeza', badge: 'info' },
        ],
        footer_rule: 'Terceira afirmativa é falsa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinais de certeza — julgar cada afirmativa V/F.',
          'Julgar I: hCG na urina indica gravidez → VERDADEIRA.',
          'Julgar II: hCG no sangue indica gravidez → VERDADEIRA.',
          'Julgar III: BCF na primeira semana → FALSA.',
          'Julgar IV: palpação de partes fetais exclusiva da gestação → VERDADEIRA.',
          'Sequência V,V,F,V — eliminar A, B, D e E.',
          'Marcar letra C.',
        ],
        footer_rule: 'BCF precoce demais — F na 3ª linha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CERTEZA',
        items: [
          { label: 'Letra A — V,F,V,V', detail: 'II falsa — hCG sangue é positivo.', correct: 'Pegadinha BCF 1ª semana — hCG sangue é verdadeiro.' },
          { label: 'Letra B — quatro V', detail: 'III falsa — BCF não na 1ª semana.', correct: 'Terceira linha F — eliminar B.' },
          { label: 'Letra D — F,V,V,F', detail: 'I e IV verdadeiros — inverte hCG urina.', correct: 'hCG urina confirma — eliminar D.' },
          { label: 'Letra E — F,V,F,V', detail: 'IV verdadeira — palpação fetal.', correct: 'V,V,F,V — marcar C.' },
        ],
        footer_rule: 'Não aceitar BCF na 1ª semana',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-geral-saude-da-mulher-1777104382533-5': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline:
      'Caderno AB 32 (MS 2012) — PA gestacional: decúbito sentado, manguito adequado; auscultatório padrão-ouro; HAS ≥140×90 mmHg com confirmação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS na gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativa CORRETA sobre hipertensão arterial na gestação.', icon: 'Target' },
          { label: 'Auscultatório (C)', detail: 'Método manual é padrão-ouro — aparelhos automáticos subestimam na pré-eclâmpsia grave.', icon: 'HeartPulse' },
          { label: 'Pegadinha PA em pé', detail: 'Medida preferencial sentada, braço na altura do coração — não em pé.', icon: 'AlertTriangle' },
          { label: 'Pegadinha sem confirmação', detail: 'HAS exige medidas repetidas — não uma única aferição isolada.', icon: 'Ban' },
        ],
        footer_rule: 'Padrão-ouro auscultatório — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'PA no pré-natal',
        meta: slideMeta,
        content: 'AFERIÇÃO PA',
        rows: [
          { label: 'Posição', value: 'Sentada, repouso, manguito adequado', badge: 'hot', emphasis: 'highlight' },
          { label: 'Método', value: 'Auscultatório manual — referência na gestação', badge: 'hot' },
          { label: 'Critério HAS', value: '≥140 × 90 mmHg — confirmar em nova medida', badge: 'warn' },
          { label: 'Automático', value: 'Pode subestimar na pré-eclâmpsia grave', badge: 'info' },
        ],
        footer_rule: 'Aferir em toda consulta pré-natal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'HAS na gestação — qual alternativa correta?',
          'Eliminar A — PA em pé: posição inadequada para aferição.',
          'Eliminar B — 140/90 sem confirmação: exige nova medida.',
          'Testar C — auscultatório manual padrão-ouro na gestação.',
          'Eliminar D — HAS crônica: definição temporal da alternativa não é o foco correto aqui.',
          'Eliminar E — predição 3º trimestre: rastreio precoce no pré-natal.',
          'Marcar letra C.',
        ],
        footer_rule: 'Manual > automático na gestação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA GESTACIONAL',
        items: [
          { label: 'Letra A — em pé', detail: 'Posição inadequada para aferir PA.', correct: 'Pegadinha PA em pé — eliminar A; sentada com manguito adequado.' },
          { label: 'Letra B — sem confirmação', detail: 'Uma medida isolada não fecha diagnóstico.', correct: 'HAS exige confirmação — eliminar B.' },
          { label: 'Letra D — crônica', detail: 'Definição temporal — distrator nesta questão.', correct: 'Padrão-ouro auscultatório — eliminar D.' },
          { label: 'Letra E — 3º trimestre', detail: 'Rastreio não se restringe ao 3º trimestre.', correct: 'Método manual — marcar C.' },
        ],
        footer_rule: 'Auscultatório na gestação — C',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'educa-pb-enfermagem-saude-da-mulher-1777104408379-1': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline:
      'Caderno AB 32 (MS 2012) — consulta de enfermagem obstétrica: anamnese, vacinas, exames, plano de parto, exame obstétrico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Consulta pré-natal TE',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Procedimentos corretos da consulta de enfermagem obstétrica no pré-natal.', icon: 'Target' },
          { label: 'Anamnese e vacinas', detail: 'I e II — queixas e caderneta vacinal atualizada.', icon: 'ClipboardList' },
          { label: 'Exames e suplementos', detail: 'III — revisar exames, prescrever novos, ferro e ácido fólico.', icon: 'Pill' },
          { label: 'Pegadinha omitir plano', detail: 'IV plano de parto e V exame obstétrico fazem parte — não cortar.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I a V corretas — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Consulta obstétrica',
        meta: slideMeta,
        content: 'PRÉ-NATAL — TE',
        rows: [
          { label: 'Anamnese', value: 'Queixas e história completa', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vacinas', value: 'Atualizar caderneta vacinal', badge: 'info' },
          { label: 'Exames', value: 'Analisar anteriores + solicitar + ferro/folato', badge: 'hot' },
          { label: 'Plano de parto', value: 'Elaboração conjunta com a gestante', badge: 'info' },
          { label: 'Exame obstétrico', value: 'AFU, BCF e manobras de Leopold', badge: 'hot' },
        ],
        footer_rule: 'Integralidade na consulta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Consulta pré-natal — julgar I a V.',
          'Julgar I: anamnese completa → VERDADEIRA.',
          'Julgar II: caderneta vacinal → VERDADEIRA.',
          'Julgar III: exames e suplementação → VERDADEIRA.',
          'Julgar IV: plano de parto conjunto → VERDADEIRA.',
          'Julgar V: exame obstétrico (AFU, BCF, Leopold) → VERDADEIRA.',
          'Todas corretas — eliminar A, B, C e D.',
          'Marcar letra E.',
        ],
        footer_rule: 'Não excluir plano de parto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO',
        items: [
          { label: 'Letra A — sem IV', detail: 'Omite plano de parto.', correct: 'Pegadinha omitir plano — IV entra na consulta.' },
          { label: 'Letra B — sem V', detail: 'Corta exame obstétrico.', correct: 'Leopold e BCF são do TE — eliminar B.' },
          { label: 'Letra C — sem I', detail: 'Exclui anamnese.', correct: 'Anamnese abre consulta — eliminar C.' },
          { label: 'Letra D — sem III', detail: 'Ignora exames e suplementos.', correct: 'Todas I–V — marcar E.' },
        ],
        footer_rule: 'Integralidade I a V',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iset-enfermagem-saude-da-mulher-1777104376057-0': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline:
      'Caderno AB 32 (MS 2012) — 1º trimestre: sangramento + dor abdominal — ameaça/aborto espontâneo; diferenciar placenta prévia e ectópica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sangramento 8 semanas',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: '8 semanas — dor abdominal intensa e sangramento vaginal.', icon: 'User' },
          { label: 'Aborto (D)', detail: 'Sangramento + dor no 1º trimestre — principal suspeita da prova.', icon: 'AlertCircle' },
          { label: 'Pegadinha ectópica', detail: 'Ectópica entra no diferencial — mas gabarito prioriza aborto neste enunciado.', icon: 'AlertTriangle' },
          { label: 'Pegadinha placenta prévia', detail: 'Prévia costuma sangrar sem dor e mais tardiamente.', icon: 'Ban' },
        ],
        footer_rule: 'Sangramento + dor — aborto D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sangramento 1º tri',
        meta: slideMeta,
        content: 'DIFERENCIAL',
        rows: [
          { label: 'Aborto', value: 'Dor + sangramento no 1º trimestre', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ectópica', value: 'Dor em flanco + atraso — investigar β-hCG/USG', badge: 'warn' },
          { label: 'Prévia', value: 'Sangramento indolor — gestação mais avançada', badge: 'info' },
          { label: 'Hiperêmese', value: 'Náuseas/vômitos — sem sangramento', badge: 'info' },
        ],
        footer_rule: 'Caso clínico da prova → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          '8 semanas — dor + sangramento: principal hipótese?',
          'Eliminar A — ectópica: diferencial, mas prova aponta aborto.',
          'Eliminar B — placenta prévia: semanas precoces e sem dor típica.',
          'Eliminar C — hiperêmese: sem sangramento vaginal.',
          'Testar D — aborto espontâneo: sangramento e dor abdominal.',
          'Eliminar E — cálculo renal: sem sangramento vaginal.',
          'Marcar letra D.',
        ],
        footer_rule: '1º trimestre — aborto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANGRAMENTO',
        items: [
          { label: 'Letra A — ectópica', detail: 'Dor pode sugerir, mas gabarito é aborto.', correct: 'Pegadinha ectópica — eliminar A; sangramento + dor 8 sem.' },
          { label: 'Letra B — placenta prévia', detail: 'Gestação muito inicial para prévia clássica.', correct: 'Pegadinha placenta prévia — eliminar B.' },
          { label: 'Letra C — hiperêmese', detail: 'Sem sangramento.', correct: 'Náuseas isoladas — eliminar C.' },
          { label: 'Letra E — cálculo renal', detail: 'Sem sangramento vaginal.', correct: 'Aborto espontâneo — marcar D.' },
        ],
        footer_rule: 'Dor + sangramento → aborto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g32] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g32] total=${ok}`);
}

main();
