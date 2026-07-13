import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  applyViasA4MinimoMitigation,
  auditViasA4Minimo,
  buildViasA4MinimoEfficacyContract,
  VIAS_A4_MINIMO_AGENT,
} from '@/lib/catalogMigration/viasA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const CONSULPAM = path.join(
  process.cwd(),
  'examples/questao-premium-consulpam-vias-absorcao-oral.json',
);
const CPCON_IM = path.join(
  process.cwd(),
  'examples/questao-premium-cpcon-vias-im-vf.json',
);

describe('viasA4Minimo', () => {
  it('resolve registry aponta Vias', () => {
    expect(resolveA4MinimoConfig('Vias de Administração')?.packageId).toBe('vias');
  });

  it('golden Consulpam absorção — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(CONSULPAM, 'utf8'));
    const audit = auditViasA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining([
        'absorcao-trilho-im-sc',
        'vo-delgado-absorcao',
        'sublingual-bypass-irritante',
        'via-retal-bypass',
        'parenteral-classica',
      ]),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applyViasA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildViasA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(VIAS_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });

  it('golden CPCON IM V/F — whitelist PASS com pegadinhas I e IV', () => {
    const payload = JSON.parse(fs.readFileSync(CPCON_IM, 'utf8'));
    const audit = auditViasA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining([
        'absorcao-trilho-im-sc',
        'ventrogluteo-seguro',
        'im-tecnica-palpar',
        'pegadinha-im-lenta-falsa',
        'pegadinha-ventrogluteo-inseguro',
      ]),
    );
  });

  it('afirmar IM mais lenta que SC em golden_rule bloqueia', () => {
    const payload = {
      meta: {
        subtopico: 'Vias de Administração',
        family: 'vf',
        content_review: { exam_vs_current: 'none' },
        sources: [{ tier: 'A', covers: ['absorção IM x SC'] }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [{ label: 'Trilho', detail: 'Absorção parenteral: IM e SC no mesmo tema.' }],
        },
        { type: 'logic_flow', steps: ['a', 'b', 'c', 'Fixação: trilho IM>SC na prova.'] },
        {
          type: 'golden_rule',
          content: 'Vias',
          rows: [
            {
              label: 'IM',
              value: 'IM é mais lenta que SC por menor vascularização muscular.',
            },
          ],
        },
        {
          type: 'danger_zone',
          content: 'Pegadinhas',
          items: [
            { label: 'a', detail: 'd', correct: 'Parenteral clássica IV IM SC.' },
            { label: 'b', detail: 'd', correct: 'SC lenta na hipoderme.' },
            { label: 'c', detail: 'd', correct: 'Transferência em outra banca.' },
          ],
        },
      ],
    };

    const audit = auditViasA4Minimo(payload);
    expect(audit.agentA4Eligible).toBe(false);
    expect(audit.unmatchedSensitiveSnippets).toContain('im_mais_lenta_teaching_affirmed');
  });
});
