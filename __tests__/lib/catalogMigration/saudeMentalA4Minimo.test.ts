import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applySaudeMentalA4MinimoMitigation,
  auditSaudeMentalA4Minimo,
  buildSaudeMentalA4MinimoEfficacyContract,
  SAUDE_MENTAL_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/saudeMentalA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(process.cwd(), 'examples/questao-premium-fau-unicentro-saude-mental-raps.json');

describe('saudeMentalA4Minimo', () => {
  it('resolve registry aponta Saúde Mental', () => {
    expect(resolveA4MinimoConfig('Saúde Mental')?.packageId).toBe('saude-mental');
  });

  it('golden RAPS/CAPS — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const audit = auditSaudeMentalA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining(['caps-tm-graves', 'raps-reforma']),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applySaudeMentalA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildSaudeMentalA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(SAUDE_MENTAL_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });
});
