import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applyRespiratorioA4MinimoMitigation,
  auditRespiratorioA4Minimo,
  buildRespiratorioA4MinimoEfficacyContract,
  RESPIRATORIO_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/respiratorioA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(
  process.cwd(),
  'examples/questao-premium-lab-respiratorio-cronico-4-moldes.json',
);

describe('respiratorioA4Minimo', () => {
  it('resolve registry aponta Respiratório crônico', () => {
    expect(resolveA4MinimoConfig('Doenças Respiratórias Crônicas (Asma, DPOC)')?.packageId).toBe(
      'respiratorio',
    );
  });

  it('golden DPOC SpO₂ — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const audit = auditRespiratorioA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining([
        'spo2-alvo-dpoc-88-92',
        'dpoc-persistente',
        'pegadinha-spo2-98-100',
      ]),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applyRespiratorioA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildRespiratorioA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(RESPIRATORIO_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });
});
