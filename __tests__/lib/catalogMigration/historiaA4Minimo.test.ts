import fs from 'node:fs';
import path from 'node:path';

import {
  applyHistoriaA4MinimoMitigation,
  auditHistoriaA4Minimo,
  buildHistoriaA4MinimoEfficacyContract,
  HISTORIA_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/historiaA4Minimo';
import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(
  process.cwd(),
  'examples/questao-premium-cpcon-historia-enfermagem-nightingale.json',
);

describe('historiaA4Minimo', () => {
  it('resolve registry aponta História', () => {
    expect(resolveA4MinimoConfig('História da Enfermagem')?.packageId).toBe('historia');
  });

  it('golden Nightingale — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    // golden_rule tem row Gabarito — ok para audit de whitelist (não é lint v2 aqui)
    const audit = auditHistoriaA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining(['nightingale-fundadora', 'cofen-etica', 'enfermagem-pre-sus']),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applyHistoriaA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildHistoriaA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(HISTORIA_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });

  it('forbid Código de Ética do COREN bloqueia', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const slides = payload.reverse_study_slides as Array<Record<string, unknown>>;
    const gr = slides.find((s) => s.type === 'golden_rule') as {
      rows: Array<{ label: string; value: string }>;
    };
    gr.rows[1].value = 'Código de Ética é norma do COREN — errado de propósito.';

    const audit = auditHistoriaA4Minimo(payload);
    expect(audit.agentA4Eligible).toBe(false);
  });
});
