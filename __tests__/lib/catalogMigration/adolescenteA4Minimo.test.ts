import fs from 'node:fs';
import path from 'node:path';

import { resolveA4MinimoConfig } from '@/lib/catalogMigration/a4MinimoRegistry';
import {
  ADOLESCENTE_A4_MINIMO_AGENT,
  applyAdolescenteA4MinimoMitigation,
  auditAdolescenteA4Minimo,
  buildAdolescenteA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/adolescenteA4Minimo';
import {
  assertApprovalGate,
  requiresHumanApproval,
  scoreQuestaoRisk,
} from '@/lib/catalogMigration/riskScoring';

const GOLDEN = path.join(
  process.cwd(),
  'examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json',
);

describe('adolescenteA4Minimo', () => {
  it('resolve registry aponta Adolescente', () => {
    expect(resolveA4MinimoConfig('Saúde do Adolescente')?.packageId).toBe('adolescente');
  });

  it('golden CPCON gravidez — whitelist PASS e contrato agente', () => {
    const payload = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
    const audit = auditAdolescenteA4Minimo(payload);

    expect(audit.applicable).toBe(true);
    expect(audit.agentA4Eligible).toBe(true);
    expect(audit.matched.map((m) => m.claimId)).toEqual(
      expect.arrayContaining([
        'escuta-privacidade',
        'sigilo-com-limites',
        'gravidez-adolescente-risco',
        'contracepcao-orientacao',
      ]),
    );

    const base = scoreQuestaoRisk(payload, {
      productionReady: true,
      autoApprovalEnabled: true,
    });
    const mitigated = applyAdolescenteA4MinimoMitigation(base, audit, {
      autoApprovalEnabled: true,
    });
    expect(requiresHumanApproval(mitigated)).toBe(false);
    expect(assertApprovalGate(payload, mitigated)).toHaveLength(0);

    const contract = buildAdolescenteA4MinimoEfficacyContract(mitigated, audit);
    expect(contract?.a4_reviewer).toBe(ADOLESCENTE_A4_MINIMO_AGENT);
    expect(contract?.a4_reviewed).toBe(true);
  });

  it('afirmar HPV 3 doses em 9–14 anos no golden_rule bloqueia', () => {
    const payload = {
      meta: {
        subtopico: 'Saúde do Adolescente',
        family: 'vf',
        content_review: { exam_vs_current: 'none' },
        sources: [{ tier: 'A', covers: ['HPV'] }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [{ label: 'HPV', detail: 'Vacina na adolescência.' }],
        },
        {
          type: 'logic_flow',
          steps: ['a', 'b', 'c', 'Fixação: sigilo com limites legais.'],
        },
        {
          type: 'golden_rule',
          content: 'HPV',
          rows: [
            {
              label: 'Esquema',
              value: 'HPV 9 a 14 anos: 3 doses obrigatórias.',
            },
          ],
        },
        {
          type: 'danger_zone',
          content: 'Pegadinhas',
          items: [
            { label: 'a', detail: 'd', correct: 'Escuta qualificada na consulta.' },
            { label: 'b', detail: 'd', correct: 'Sigilo com limites legais.' },
            { label: 'c', detail: 'd', correct: 'Pré-natal precoce na gravidez.' },
          ],
        },
      ],
    };

    const audit = auditAdolescenteA4Minimo(payload);
    expect(audit.agentA4Eligible).toBe(false);
  });
});
