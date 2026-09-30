#!/usr/bin/env tsx
/** Gera artifacts da proposta de proveniência IGEDUC (sem apply). */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL } from '@/lib/neurocanvas/officialLaneProvenanceIgeducProposal';

const repoRoot = process.cwd();
const dir = resolve(repoRoot, 'artifacts');
mkdirSync(dir, { recursive: true });

const jsonPath = resolve(dir, 'neurocanvas-provenance-igeduc-proposal.json');
writeFileSync(
  jsonPath,
  JSON.stringify(OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL, null, 2),
  'utf8',
);

const mdPath = resolve(dir, 'neurocanvas-provenance-igeduc-proposal.md');
const p = OFFICIAL_LANE_PROVENANCE_IGEDUC_PROPOSAL;
const lines = [
  '# Proposta proveniência IGEDUC',
  '',
  `Status: **${p.status}** · materialization: **${p.materialization}**`,
  '',
  `| Decisão | Count |`,
  `|---------|------:|`,
  `| defer | ${p.batch_summary.decisions.defer} |`,
  `| choose_existing_candidate | ${p.batch_summary.decisions.choose_existing_candidate} |`,
  `| create_corrected_candidate | ${p.batch_summary.decisions.create_corrected_candidate} |`,
  '',
  `Baseline: **${p.baseline_ref.metrics}** · Fase 0B ready: **${p.phase_0b.ready}**`,
  '',
  'Ver `docs/NEUROCANVAS_PROVENANCE_IGEDUC.md`.',
  '',
];
for (const c of p.cases) {
  lines.push(
    `## ${c.case_id}`,
    '',
    `- slug atual: \`${c.current_catalog_slug}\``,
    `- slug proposto: \`${c.proposed_canonical_slug}\``,
    `- decisão: **${c.decision}**`,
    '',
    c.decision_rationale,
    '',
  );
}
writeFileSync(mdPath, lines.join('\n'), 'utf8');

console.log('[write-provenance-igeduc-proposal]', jsonPath);
console.log('[write-provenance-igeduc-proposal]', mdPath);
