#!/usr/bin/env tsx
/**
 * Audita resolução L3 dos 10 JSONs handcraft — respiratório crônico.
 * Uso: npx tsx scripts/audit-respiratorio-l3-molds.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { resolveSlidePresentation } from '@/components/slides/core/slidePresentation';
import { detectMoldL3Mismatch } from '@/lib/slides/detectMoldL3Mismatch';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import {
  inferRespiratorioLane,
  inferRespiratorioTrapSlot,
} from '@/lib/slides/respiratorioCronicoSlideUtils';

const EXPECTED: Record<string, string> = {
  concept_map: 'respiratorio-asma-dpoc-duel-deck',
  golden_rule: 'respiratorio-spo2-reference-board',
  logic_flow: 'respiratorio-vf-juggle-tap',
  danger_zone: 'respiratorio-spo2-trap-arena',
};

const DIRS = [
  'data/catalog-migration/respiratorio-cronico-g01/questions',
  'data/catalog-migration/respiratorio-cronico-micro-01-goldens/questions',
];

type Row = {
  slug: string;
  family: string;
  variants: Record<string, string>;
  fallback: boolean;
  issues: string[];
  uxNotes: string[];
};

const rows: Row[] = [];

for (const dir of DIRS) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const slug = file.replace(/\.json$/, '');
    const q = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
      meta?: { family?: FamilyId };
      question_data?: { instruction?: string };
      reverse_study_slides?: Record<string, unknown>[];
    };
    const slides = q.reverse_study_slides ?? [];
    const variants: Record<string, string> = {};
    let fallback = false;
    const issues = detectMoldL3Mismatch(q, {
      slug,
      familyId: q.meta?.family,
    }).map((i) => `${i.slideType}: ${i.message}`);

    slides.forEach((slide, i) => {
      const type = String(slide.type ?? '');
      const r = resolveSlidePresentation(slide as Parameters<typeof resolveSlidePresentation>[0], {
        questionSlug: slug,
        slideIndex: i,
        familyId: q.meta?.family,
        instruction: q.question_data?.instruction,
      });
      variants[type] = r.layoutVariant;
      if (r.moldFallback) fallback = true;
      const expected = EXPECTED[type];
      if (expected && r.layoutVariant !== expected) {
        issues.push(`${type}: esperado ${expected}, obteve ${r.layoutVariant}`);
      }
    });

    const uxNotes: string[] = [];
    const lanes = new Set<string>();
    const traps = new Set<string>();
    let logicSteps = 0;
    let goldenRows = 0;
    let hasSpo2Corpus = false;

    for (const s of slides) {
      const corpus = JSON.stringify(s).toLowerCase();
      if (/spo2|88.?92|oxigen|titulad|hipoxemia/.test(corpus)) hasSpo2Corpus = true;
      if (s.type === 'concept_map' && Array.isArray(s.items)) {
        for (const raw of s.items) {
          const it = raw as { label?: string; detail?: string };
          lanes.add(inferRespiratorioLane(String(it.label ?? ''), String(it.detail ?? '')));
        }
      }
      if (s.type === 'danger_zone' && Array.isArray(s.items)) {
        for (const raw of s.items) {
          const it = raw as { label?: string; detail?: string; correct?: string };
          traps.add(
            inferRespiratorioTrapSlot(
              String(it.label ?? ''),
              String(it.detail ?? ''),
              String(it.correct ?? ''),
            ),
          );
        }
      }
      if (s.type === 'logic_flow') logicSteps = Array.isArray(s.steps) ? s.steps.length : 0;
      if (s.type === 'golden_rule') goldenRows = Array.isArray(s.rows) ? s.rows.length : 0;
    }

    const hasAsmaDpoc = /asma|dpoc/i.test(JSON.stringify(q.question_data ?? {}));
    if (!hasSpo2Corpus && !hasAsmaDpoc) uxNotes.push('conteúdo sem SpO₂/O₂ explícito nos slides');
    if (!lanes.has('asma') && !lanes.has('dpoc')) {
      uxNotes.push(`duel-deck: sem trilho asma/dpoc (lanes: ${[...lanes].join(', ')})`);
    } else if (lanes.size < 2) {
      uxNotes.push(`duel-deck: poucos trilhos distintos (${[...lanes].join(', ')})`);
    }
    if (logicSteps < 3) uxNotes.push(`logic_flow: ${logicSteps} passos (<3 — juggle limitado)`);
    if (goldenRows < 2) uxNotes.push(`golden_rule: ${goldenRows} rows`);
    if (traps.size < 2) uxNotes.push(`trap-arena: 1 eixo só (${[...traps].join(', ')})`);

    rows.push({
      slug,
      family: String(q.meta?.family ?? '—'),
      variants,
      fallback,
      issues,
      uxNotes,
    });
  }
}

const withIssues = rows.filter((r) => r.issues.length > 0 || r.fallback);
const withUxNotes = rows.filter((r) => r.uxNotes.length > 0);

console.log(
  JSON.stringify(
    {
      total: rows.length,
      l3_ok: rows.length - withIssues.length,
      l3_failures: withIssues,
      ux_polish_suggestions: withUxNotes.map((r) => ({
        slug: r.slug,
        family: r.family,
        notes: r.uxNotes,
      })),
    },
    null,
    2,
  ),
);

if (withIssues.length > 0) process.exit(1);
