import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applyBacterianasA4MinimoMitigation,
  auditBacterianasA4Minimo,
  BACTERIANAS_A4_MINIMO_AGENT,
  buildBacterianasA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/bacterianasA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(
  process.cwd(),
  'examples/questao-premium-cpcon-tuberculose-baar-aerossol-vf.json',
);

describe('bacterianasA4Minimo', () => {
  it('resolve registry aponta Doenças Bacterianas', () => {
    expect(
      resolveA4MinimoConfig(
        'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
      )?.packageId,
    ).toBe('doencas-bacterianas');
  });

  it('golden TB VF — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const audit = auditBacterianasA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining([
        'tb-notificacao-compulsoria',
        'tb-baar-escarro',
        'tb-precaucao-aerossol',
        'pegadinha-tb-contato-pele',
      ]),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applyBacterianasA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildBacterianasA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(BACTERIANAS_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });
});
