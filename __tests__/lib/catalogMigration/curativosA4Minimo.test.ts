import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applyCurativosA4MinimoMitigation,
  auditCurativosA4Minimo,
  buildCurativosA4MinimoEfficacyContract,
  CURATIVOS_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/curativosA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const SAMPLE = path.join(
  process.cwd(),
  'data/catalog-migration/curativos-e-manejo-de-feridas-g01/questions',
);
const hasSampleQuestions = fs.existsSync(SAMPLE);

function firstQuestionPath(): string {
  const dir = fs.readdirSync(SAMPLE).filter((f) => f.endsWith('.json'));
  if (dir.length === 0) throw new Error('no curativos g01 questions');
  return path.join(SAMPLE, dir[0]!);
}

describe('curativosA4Minimo', () => {
  it('resolve registry aponta Curativos e Manejo de Feridas', () => {
    expect(resolveA4MinimoConfig('Curativos e Manejo de Feridas')?.packageId).toBe(
      'curativos-e-manejo-de-feridas',
    );
  });

  (hasSampleQuestions ? it : it.skip)(
    'handcraft g01 — whitelist PASS e contrato agente',
    () => {
      const payload = JSON.parse(fs.readFileSync(firstQuestionPath(), 'utf8'));
      const audit = auditCurativosA4Minimo(payload);

      expect(audit.applicable).toBe(true);
      expect(audit.agentA4Eligible).toBe(true);
      expect(audit.matched.length).toBeGreaterThan(0);

      const base = scoreQuestaoRisk(payload, {
        productionReady: true,
        autoApprovalEnabled: true,
      });
      const mitigated = applyCurativosA4MinimoMitigation(base, audit, {
        autoApprovalEnabled: true,
      });
      expect(requiresHumanApproval(mitigated)).toBe(false);
      expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

      const contract = buildCurativosA4MinimoEfficacyContract(mitigated, audit);
      expect(contract?.a4_reviewer).toBe(CURATIVOS_A4_MINIMO_AGENT);
      expect(contract?.a4_reviewed).toBe(true);
    },
  );
});
