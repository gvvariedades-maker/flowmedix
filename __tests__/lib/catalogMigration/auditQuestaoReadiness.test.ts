import fs from 'node:fs';
import path from 'node:path';

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';

describe('auditQuestaoReadiness', () => {
  it('golden respiratório EXCETO passa A1–A3 (sem branch declarado → A3 fail)', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = auditQuestaoReadiness(payload, { slug: 'vunesp-exceto' });

    expect(result.tier_pass.A1).toBe(true);
    expect(result.tier_pass.A2).toBe(true);
    expect(result.checks.some((c) => c.code === 'l3_branch_undeclared' && c.severity === 'error')).toBe(
      true,
    );
    expect(result.ready_100).toBe(false);
  });

  it('golden respiratório com pedagogical_branch declarado passa 100%', () => {
    const file = path.join(
      process.cwd(),
      'examples',
      'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json',
    );
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    payload.meta.pedagogical_branch = 'respiratorio_asma_crise';

    const result = auditQuestaoReadiness(payload, { slug: 'vunesp-exceto' });
    expect(result.ready_100).toBe(true);
    expect(result.tier_pass.A3).toBe(true);
  });

  it('payload com stub falha A2', () => {
    const result = auditQuestaoReadiness({
      meta: {
        subtopico: 'Noções de Anatomia',
        banca: 'X',
        topico: 'Enfermagem',
        content_standard: 'golden-v1',
        family: 'conceito',
        content_review: {
          reviewed_at: '2026-01-01',
          guideline_snapshot: 'test',
        },
        sources: [
          {
            id: 's1',
            tier: 'A',
            issuer: 'MS',
            title: 'Doc',
            year: 2020,
          },
        ],
      },
      question_data: {
        instruction: 'Assinale a correta.',
        options: [{ id: 'A', text: 'a', is_correct: true }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [
            { label: 'A', detail: 'conceito central', icon: 'Circle' },
            { label: 'B', detail: 'b', icon: 'Circle' },
            { label: 'C', detail: 'c', icon: 'Circle' },
          ],
        },
        { type: 'golden_rule', content: 'Regra', rows: [{ label: 'X', value: 'Y' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3'] },
        {
          type: 'danger_zone',
          content: 'z',
          items: [{ label: 'A', detail: 'b', correct: 'Gabarito letra A — ok' }],
        },
      ],
    });

    expect(result.tier_pass.A2).toBe(false);
    expect(result.checks.some((c) => c.code === 'l2_stub')).toBe(true);
  });
});
