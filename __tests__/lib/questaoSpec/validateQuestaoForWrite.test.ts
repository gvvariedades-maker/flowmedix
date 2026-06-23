import fs from 'node:fs';
import path from 'node:path';

import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import {
  QUESTAO_WRITE_SPEC_VERSION,
  validateQuestaoForWrite,
} from '@/lib/questaoSpec';
import { WRITE_SPEC_TEST_QUESTION } from '@/lib/questaoSpec/testFixtures';

const viasGolden = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'examples', 'questao-premium-cpcon-vias-im-vf.json'),
    'utf8',
  ),
);

describe('validateQuestaoForWrite — golden-v2 write spec', () => {
  it('exporta versão golden-v2', () => {
    expect(QUESTAO_WRITE_SPEC_VERSION).toBe('golden-v2');
  });

  it('aceita questão válida com slides não-stub (subtópico genérico)', () => {
    const result = validateQuestaoForWrite(WRITE_SPEC_TEST_QUESTION);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.specVersion).toBe('golden-v2');
      expect(result.data.meta.banca).toBe('EBSERH');
    }
  });

  it('bloqueia slides vazios (stub) via premium gate', () => {
    const result = validateQuestaoForWrite({
      ...WRITE_SPEC_TEST_QUESTION,
      reverse_study_slides: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === 'stub_markers')).toBe(true);
      expect(result.errors.every((e) => e.severity === 'error')).toBe(true);
    }
  });

  it('pode desligar premium gate (export/migração)', () => {
    const result = validateQuestaoForWrite(
      { ...WRITE_SPEC_TEST_QUESTION, reverse_study_slides: [] },
      { premiumGate: false },
    );
    expect(result.ok).toBe(true);
  });

  it('golden v1 de Vias passa write spec com gate', () => {
    const result = validateQuestaoForWrite(viasGolden);
    expect(result.ok).toBe(true);
    expect(premiumGateErrors(viasGolden)).toHaveLength(0);
  });

  it('molde Vias sem rows falha write spec', () => {
    const broken = JSON.parse(JSON.stringify(viasGolden)) as typeof viasGolden;
    broken.reverse_study_slides[1] = { type: 'golden_rule', content: 'só título' };
    const result = validateQuestaoForWrite(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.code === 'molde_golden_rule_sem_rows')).toBe(true);
    }
  });
});
