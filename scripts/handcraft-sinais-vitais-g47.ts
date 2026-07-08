#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g47 (2 slugs SHORT LOTE vitals_generico · certo_errado).
 * Cluster Certo ou errado (10 slugs — g47 fecha cluster; g46=8 batch 1).
 *
 *   npm run handcraft:sinais-vitais-g47
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g47';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / SBP / SBC',
  title: 'Sinais vitais — técnica pediátrica e rastreamento de HAS',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'PA pediátrica — deitado até 3 anos · sentado após com braço ao coração',
    'manguito pediátrico calibrado à circunferência braquial',
    'rastreamento HAS — ≥18 anos sem PA nos últimos 2 anos na APS',
    'braço nível do coração na aferição',
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

type Pack = {
  family: 'certo_errado';
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
    pedagogical_branch: 'vitals_generico',
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
  'igeduc-enfermagem-verificacao-de-sinais-vitais-1779344097180-0': {
    family: 'certo_errado',
    guideline:
      'SBP/MS — PA em crianças ≤3 anos: decúbito; maiores de 3 anos: sentado com braço apoiado ao nível do coração e manguito adequado à circunferência braquial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA pediátrica — posição e manguito',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar técnica de PA: deitado até 3 anos; sentado com braço ao coração e manguito correto após essa idade.',
            icon: 'Target',
          },
          {
            label: 'Até 3 anos',
            detail: 'Criança pequena — aferição com paciente deitado (decúbito) para estabilizar o membro.',
            icon: 'Baby',
          },
          {
            label: 'Maiores de 3 anos',
            detail: 'Posição sentada — braço apoiado na altura do coração (átrio).',
            icon: 'Heart',
          },
          {
            label: 'Manguito pediátrico',
            detail: 'Largura ~40% e comprimento ~80% da circunferência braquial — não usar adulto em braço fino.',
            icon: 'Ruler',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Descreve posição por idade + manguito — conduta técnica correta.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: '≤3 anos deitado · >3 anos sentado + braço ao coração',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar técnica de PA em crianças por faixa etária.',
          'Até 3 anos: paciente deitado — facilita imobilização e leitura confiável.',
          'Após 3 anos: sentado com braço na altura do coração — regra hidrostática igual ao adulto.',
          'Manguito correto: calibrado à circunferência braquial da criança.',
          'Assertiva alinha posição + manguito — sem erro técnico.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Posição por idade + manguito — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA pediátrica',
        meta: slideMeta,
        content: 'TÉCNICA PA — CRIANÇA',
        rows: [
          { label: '≤3 anos', value: 'Decúbito — paciente deitado', sv_kind: 'pa', badge: 'hot' },
          { label: '>3 anos', value: 'Sentado — braço ao nível do coração', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: '~80% circunferência braquial — tamanho pediátrico', sv_kind: 'pa', badge: 'ok' },
          { label: 'Repouso', value: '5 min antes da medida quando possível', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Idade manda na posição — manguito na medida do braço',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA NA CRIANÇA',
        items: [
          {
            label: 'Sentar lactente de 2 anos',
            detail: 'Aplicar posição de adulto/escolar em <3 anos.',
            correct:
              'Até 3 anos a referência é decúbito — sentado com braço ao coração vale para crianças maiores.',
          },
          {
            label: 'Manguito adulto no braço infantil',
            detail: 'Usar manguito padrão sem medir circunferência braquial.',
            correct:
              'Manguito estreito superestima a PA — escolher bolsa pediátrica calibrada ao braço da criança.',
          },
          {
            label: 'Marcar Errado por citar duas posições',
            detail: 'Desconfiar de regra que muda com a idade.',
            correct:
              'SBP orienta posição distinta antes e depois dos 3 anos — a assertiva está correta.',
          },
        ],
        footer_rule: 'Deitado ≤3 anos · sentado depois — Certo',
      },
    ],
  },

  'igeduc-enfermagem-verificacao-de-sinais-vitais-1779344097180-1': {
    family: 'certo_errado',
    guideline:
      'MS/DAB — rastreamento de hipertensão arterial: aferir PA em indivíduos ≥18 anos na APS sem registro de PA nos últimos 2 anos',
    roi_error: 'rastreamento_has_aps',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rastreamento de HAS — APS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar: rastrear HAS em ≥18 anos sem PA registrada no prontuário nos últimos 2 anos.',
            icon: 'Target',
          },
          {
            label: 'Público-alvo',
            detail: 'Adultos a partir de 18 anos — início do rastreamento na atenção primária.',
            icon: 'User',
          },
          {
            label: 'Gatilho do rastreio',
            detail: 'Ausência de registro de PA no prontuário nos últimos 24 meses.',
            icon: 'FileText',
          },
          {
            label: 'Onde aferir',
            detail: 'Unidade de Atenção Primária — consulta, procedimentos ou atividades educativas.',
            icon: 'Building2',
          },
          {
            label: 'Pegadinha — hipertensão já diagnosticada',
            detail:
              'Achar que rastreamento só vale para hipertensos — MS aferir PA em normotensos ≥18 anos sem registro nos últimos 2 anos no prontuário.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Reproduz recomendação MS para vigilância de PA na APS.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: '≥18 anos · sem PA em 2 anos → aferir na APS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar critério de rastreamento de hipertensão arterial.',
          'Idade: 18 anos ou mais — início do rastreio populacional na APS.',
          'Critério temporal: sem registro de PA nos últimos dois anos no prontuário.',
          'Ação: aferir e registrar PA quando o indivíduo estiver na unidade.',
          'Assertiva alinhada ao protocolo MS/DAB — correta.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Rastreamento HAS APS — gabarito Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — rastreamento PA',
        meta: slideMeta,
        content: 'RASTREAMENTO HAS — MS/APS',
        rows: [
          { label: 'Idade', value: '≥18 anos — iniciar rastreamento', sv_kind: 'pa', badge: 'hot' },
          { label: 'Intervalo', value: 'Sem PA registrada nos últimos 2 anos', sv_kind: 'pa', badge: 'ok' },
          { label: 'HAS estágio 1', value: 'PAS ≥140 e/ou PAD ≥90 mmHg (SBC)', sv_kind: 'pa', badge: 'warn' },
          { label: 'Onde', value: 'APS — consulta, procedimento ou educação em saúde', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Sem PA em 2 anos → aferir na próxima oportunidade na APS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RASTREAMENTO HAS',
        items: [
          {
            label: 'Rastrear só com sintomas',
            detail: 'Esperar cefaleia ou tontura para medir PA.',
            correct:
              'Rastreamento é populacional na APS — ≥18 anos sem PA nos últimos 2 anos devem ser aferidos.',
          },
          {
            label: 'Confundir intervalo de 1 ano',
            detail: 'Achar que basta PA no último ano.',
            correct:
              'O protocolo MS cita ausência de registro nos últimos dois anos — não reduza para 12 meses.',
          },
          {
            label: 'Marcar Errado por “rastreamento”',
            detail: 'Associar rastreio só a campanhas específicas.',
            correct:
              'Qualquer contato na APS (consulta, procedimento, atividade educativa) é oportunidade de aferir PA.',
          },
        ],
        footer_rule: 'Critério MS correto — marque Certo',
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
    console.log(`[handcraft:sv-g47] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g47] total=${ok}`);
}

main();
