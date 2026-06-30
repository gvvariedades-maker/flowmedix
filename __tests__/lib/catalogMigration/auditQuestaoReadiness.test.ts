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

  it('strictV2Pedagogy promove golden_rule_gabarito_spoiler a error', () => {
    const base = {
      meta: {
        subtopico: 'Imunização',
        banca: 'X',
        topico: 'Enfermagem',
        content_standard: 'golden-v1',
        family: 'vf' as const,
        content_review: { reviewed_at: '2026-01-01', guideline_snapshot: 'PNI' },
        sources: [{ id: 's1', tier: 'A' as const, issuer: 'MS', title: 'PNI', year: 2025 }],
      },
      question_data: {
        instruction: 'I - Vacina X II - Intervalo Y III - Esquema Z\nÉ CORRETO o que se afirma em:',
        options: [
          { id: 'A', text: 'I', is_correct: false },
          { id: 'B', text: 'II e III', is_correct: true },
          { id: 'C', text: 'I e II', is_correct: false },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [
            { label: 'I', detail: 'Vacina X no esquema PNI', icon: 'Syringe' },
            { label: 'II', detail: 'Intervalo mínimo entre doses', icon: 'Clock' },
            { label: 'III', detail: 'Esquema completo primovacinação', icon: 'ListChecks' },
          ],
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          steps: ['Julgar I', 'Julgar II', 'Julgar III', 'Marcar B'],
        },
        {
          type: 'golden_rule',
          content: 'PNI',
          rows: [{ label: 'Gabarito', value: 'Letra B — II e III' }],
        },
        {
          type: 'danger_zone',
          content: 'z',
          items: [{ label: 'A', detail: 'b', correct: 'Gabarito letra B — II e III corretos' }],
        },
      ],
    };

    const warnOnly = auditQuestaoReadiness(base as never, { strictV2Pedagogy: false });
    const strictV2 = auditQuestaoReadiness(base as never, { strictV2Pedagogy: true });

    const spoilerWarn = warnOnly.checks.find((c) => c.code === 'golden_rule_gabarito_spoiler');
    expect(spoilerWarn?.severity).toBe('warn');

    const spoilerErr = strictV2.checks.find((c) => c.code === 'golden_rule_gabarito_spoiler');
    expect(spoilerErr?.severity).toBe('error');
    expect(strictV2.ready_100).toBe(false);
  });
});
