#!/usr/bin/env tsx
/** Audit A4 blockers — Punção onda 2. */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { auditPuncaoA4Minimo, PUNCAO_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/puncaoA4Minimo';
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';

type Row = {
  slug: string;
  lote: string;
  reviewer?: string;
  blockers: string[];
  family?: string;
  exam_vs_current?: string;
};

const rows: Row[] = [];

for (let i = 1; i <= 15; i++) {
  const lote = `puncao-venosa-e-cuidados-com-cateteres-g${String(i).padStart(2, '0')}`;
  const dir = join('data/catalog-migration', lote, 'questions');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
      modulo_slug?: string;
      meta?: {
        family?: string;
        content_review?: { exam_vs_current?: string };
        efficacy_contract?: { a4_reviewer?: string };
      };
    };
    const slug = q.modulo_slug ?? f.replace(/\.json$/, '');
    const audit = auditPuncaoA4Minimo(q as never);
    const risk = scoreQuestaoRisk(q as never, { productionReady: true, autoApprovalEnabled: true });
    rows.push({
      slug,
      lote,
      reviewer: q.meta?.efficacy_contract?.a4_reviewer,
      blockers: audit.blockers,
      family: q.meta?.family,
      exam_vs_current: q.meta?.content_review?.exam_vs_current,
    });
  }
}

const handcraftQc = rows.filter((r) => r.reviewer === 'handcraft-qc');
const agent = rows.filter((r) => r.reviewer?.startsWith('agent:'));
const blockerCounts: Record<string, number> = {};
for (const r of rows) {
  for (const b of r.blockers) {
    const key = b.split(':')[0] ?? b;
    blockerCounts[key] = (blockerCounts[key] ?? 0) + 1;
  }
}

const out = {
  generated_at: new Date().toISOString(),
  total: rows.length,
  handcraft_qc: handcraftQc.length,
  agent: agent.length,
  blocker_counts: blockerCounts,
  handcraft_qc_slugs: handcraftQc.map((r) => ({
    slug: r.slug,
    lote: r.lote,
    blockers: r.blockers,
    family: r.family,
    exam_vs_current: r.exam_vs_current,
  })),
  calc: rows.filter((r) => r.family === 'calc'),
  exam_divergence: rows.filter((r) => r.exam_vs_current && r.exam_vs_current !== 'none'),
};

const outPath = resolve(process.cwd(), 'artifacts/puncao-onda2-a4-audit.json');
mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`[audit-puncao-a4] total=${rows.length} handcraft_qc=${handcraftQc.length} agent=${agent.length}`);
console.log('[audit-puncao-a4] blockers', blockerCounts);
console.log(`[audit-puncao-a4] report=${outPath}`);
