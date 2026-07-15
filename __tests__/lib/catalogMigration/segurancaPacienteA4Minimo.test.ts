import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applySegurancaPacienteA4MinimoMitigation,
  auditSegurancaPacienteA4Minimo,
  buildSegurancaPacienteA4MinimoEfficacyContract,
  SEGURANCA_PACIENTE_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/segurancaPacienteA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(
  process.cwd(),
  'examples/questao-premium-cesgranrio-seguranca-paciente-identificacao-vf.json',
);

describe('segurancaPacienteA4Minimo', () => {
  it('resolve registry aponta Segurança do Paciente', () => {
    expect(resolveA4MinimoConfig('Segurança do Paciente')?.packageId).toBe('seguranca-do-paciente');
  });

  it('golden identificação VF — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const audit = auditSegurancaPacienteA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining(['dois-identificadores', 'pulseira-identificacao', 'pegadinha-urgencia-id']),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applySegurancaPacienteA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildSegurancaPacienteA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(SEGURANCA_PACIENTE_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });
});
