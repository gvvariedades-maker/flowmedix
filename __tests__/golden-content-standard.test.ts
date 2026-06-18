import fs from 'node:fs';
import path from 'node:path';

import {
  GOLDEN_BANNED_PHRASES,
  GOLDEN_CONTENT_STANDARD_VERSION,
  hasQuestionSpecificity,
  isGoldenContentCompliant,
  lintGoldenContent,
} from '@/lib/goldenContentStandard';
import { FAMILY_GOLDEN_FILE } from '@/lib/catalogMigration/classifyFamily';
import { GUIDELINE_TABLES } from '@/lib/guidelines';
import { QuestaoCompletaSchema } from '@/lib/validations';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

function loadPremiumExamples(): { file: string; data: unknown }[] {
  return fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.startsWith('questao-premium-') && f.endsWith('.json'))
    .sort()
    .map((file) => ({
      file,
      data: JSON.parse(fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf8')),
    }));
}

describe('golden-content-standard v1', () => {
  const premiums = loadPremiumExamples();

  it('template e constantes definidos', () => {
    expect(GOLDEN_CONTENT_STANDARD_VERSION).toBe('golden-v1');
    expect(GOLDEN_BANNED_PHRASES.length).toBeGreaterThan(5);
    expect(Object.keys(GUIDELINE_TABLES).length).toBeGreaterThanOrEqual(2);
  });

  it('piloto Imunização CPCON declara golden-v1', () => {
    const pilot = premiums.find((p) => p.file.includes('cpcon-imunizacao-intervalos-vf'));
    expect(pilot).toBeDefined();
    const meta = (pilot!.data as { meta?: { content_standard?: string } }).meta;
    expect(meta?.content_standard).toBe('golden-v1');
  });

  it.each(premiums.map((p) => [p.file, p.data] as const))(
    '%s valida QuestaoCompletaSchema',
    (_file, data) => {
      const parsed = QuestaoCompletaSchema.safeParse(data);
      expect(parsed.success).toBe(true);
    },
  );

  it.each(
    premiums
      .filter((p) => {
        const meta = (p.data as { meta?: { content_standard?: string } }).meta;
        return meta?.content_standard === GOLDEN_CONTENT_STANDARD_VERSION;
      })
      .map((p) => [p.file, p.data] as const),
  )('%s passa lintGoldenContent (golden-v1)', (file, data) => {
    const issues = lintGoldenContent(data);
    if (issues.length > 0) {
      const detail = issues.map((i) => `${i.code}: ${i.message}`).join('\n');
      throw new Error(`${file}\n${detail}`);
    }
    expect(isGoldenContentCompliant(data)).toBe(true);
  });

  it.each(Object.entries(FAMILY_GOLDEN_FILE))(
    'golden de referência %s declara golden-v1 e passa lint',
    (_family, filename) => {
      const filePath = path.join(EXAMPLES_DIR, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const meta = (data as { meta?: { content_standard?: string } }).meta;
      expect(meta?.content_standard).toBe(GOLDEN_CONTENT_STANDARD_VERSION);
      const issues = lintGoldenContent(data);
      if (issues.length > 0) {
        const detail = issues.map((i) => `${i.code}: ${i.message}`).join('\n');
        throw new Error(`${filename}\n${detail}`);
      }
    },
  );

  it('hasQuestionSpecificity detecta letra e romano', () => {
    const q = {
      question_data: {
        instruction: 'Vacina pneumocócica VPC13 intervalo oito semanas',
        options: [
          { id: 'A', text: 'x', is_correct: false },
          { id: 'C', text: 'y', is_correct: true },
        ],
      },
    };
    expect(hasQuestionSpecificity('Localizar alternativa C após julgar I', q)).toBe(true);
  });

  it('lintGoldenContent ignora questões sem content_standard', () => {
    const generic = premiums.find((p) => !((p.data as { meta?: { content_standard?: string } }).meta?.content_standard));
    expect(generic).toBeDefined();
    expect(lintGoldenContent(generic!.data)).toEqual([]);
  });

  it('rejeita golden-v1 sem sources', () => {
    const pilot = premiums.find((p) => p.file.includes('cpcon-imunizacao-intervalos-vf'))!.data as {
      meta: Record<string, unknown>;
    };
    const broken = {
      ...pilot,
      meta: { ...pilot.meta, sources: [] },
    };
    const codes = lintGoldenContent(broken).map((i) => i.code);
    expect(codes).toContain('meta_sources');
  });
});
