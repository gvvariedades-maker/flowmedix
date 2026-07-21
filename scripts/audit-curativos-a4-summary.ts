#!/usr/bin/env tsx
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyA4MinimoMitigation,
  auditA4Minimo,
} from '@/lib/catalogMigration/a4MinimoCore';
import { CURATIVOS_A4_MINIMO_CONFIG } from '@/lib/catalogMigration/curativosA4Minimo';
import {
  DEFAULT_AUTO_APPROVAL_POLICY,
  scoreQuestaoRisk,
  shouldSampleForHumanReview,
} from '@/lib/catalogMigration/riskScoring';

let stamped = 0;
let human = 0;
let total = 0;
const blockers: Record<string, number> = {};

for (let g = 1; g <= 12; g++) {
  const lote = `curativos-e-manejo-de-feridas-g${String(g).padStart(2, '0')}`;
  const dir = join('data/catalog-migration', lote, 'questions');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    total++;
    const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const slug = f.replace('.json', '');
    const audit = auditA4Minimo(CURATIVOS_A4_MINIMO_CONFIG, raw);
    const base = scoreQuestaoRisk(raw, { productionReady: true, autoApprovalEnabled: true });
    const risk = applyA4MinimoMitigation(CURATIVOS_A4_MINIMO_CONFIG, base, audit, {
      autoApprovalEnabled: true,
    });
    if (!audit.agentA4Eligible) {
      human++;
      const key = audit.blockers[0] ?? 'unknown';
      blockers[key] = (blockers[key] ?? 0) + 1;
      console.log(`BLOCK\t${slug}\t${audit.blockers.join('; ')}`);
      continue;
    }
    if (risk.approval_mode === 'human_required') {
      human++;
      console.log(`RISK\t${slug}`);
      continue;
    }
    const sampled = shouldSampleForHumanReview(
      risk.risk_tier,
      {
        ...DEFAULT_AUTO_APPROVAL_POLICY,
        enabled: true,
        sample_rate: { baixo: 0.05, medio: 0.2 },
      },
      slug,
    );
    if (sampled) {
      human++;
      console.log(`SAMPLE\t${slug}`);
      continue;
    }
    stamped++;
  }
}

console.log(`TOTAL\t${total}\tSTAMPED\t${stamped}\tHUMAN\t${human}`);
console.log('BLOCKERS', JSON.stringify(blockers, null, 2));
