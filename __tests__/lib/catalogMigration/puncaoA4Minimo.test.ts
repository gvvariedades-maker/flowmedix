import fs from 'node:fs';
import path from 'node:path';

import {
  applyPuncaoA4MinimoMitigation,
  auditPuncaoA4Minimo,
  buildPuncaoA4MinimoEfficacyContract,
  PUNCAO_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/puncaoA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const FACET_CVC = path.join(
  process.cwd(),
  'data/catalog-migration/puncao-venosa-e-cuidados-com-cateteres-g12/questions/facet-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-2.json',
);

describe('puncaoA4Minimo', () => {
  it('FACET CVC — whitelist PASS e mitiga alto → medio', () => {
    const payload = JSON.parse(fs.readFileSync(FACET_CVC, 'utf8'));
    const audit = auditPuncaoA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining(['hub-alcool-70', 'antibiotico-nao-bundle']),
    );
    expect(audit.axesHit).toEqual(expect.arrayContaining(['hub', 'curativo', 'bundle']));

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    expect(base.risk_tier).toBe('alto');

    const mitigated = applyPuncaoA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(mitigated.risk_tier).toBe('medio');
    expect(mitigated.approval_mode).toBe('auto_conditional');
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildPuncaoA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewed).toBe(true);
    expect(contract?.a4_reviewer).toBe(PUNCAO_A4_MINIMO_AGENT);
    expect(contract?.a4_checklist_passed?.length).toBeGreaterThan(0);
  });

  it('forbid álcool 90% bloqueia A4 agente', () => {
    const payload = JSON.parse(fs.readFileSync(FACET_CVC, 'utf8'));
    const slides = payload.reverse_study_slides as Array<Record<string, unknown>>;
    const gr = slides.find((s) => s.type === 'golden_rule') as {
      rows: Array<{ label: string; value: string }>;
    };
    gr.rows[0].value = 'Álcool 90% após cada administração — errado de propósito.';

    const audit = auditPuncaoA4Minimo(payload);
    expect(audit.agentA4Eligible).toBe(false);
    expect(audit.blockers.some((b) => b.includes('forbid') || b.includes('unmatched'))).toBe(
      true,
    );
  });

  it('subtópico não-Punção → applicable false', () => {
    const audit = auditPuncaoA4Minimo({
      meta: { subtopico: 'Imunização', family: 'conceito' },
      reverse_study_slides: [],
    });
    expect(audit.applicable).toBe(false);
    expect(audit.agentA4Eligible).toBe(false);
  });
});
