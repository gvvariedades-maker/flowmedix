/**
 * Piloto premium: Imunização, Processo de Enfermagem, Promoção à Saúde.
 * Valida goldens + resolvers B1 (rows→table) e compare com mapa piloto.
 */
import fs from 'fs';
import path from 'path';
import { QuestaoCompletaSchema } from '@/lib/validations';
import { calculateLayoutVariant } from '@/components/slides/core/themeGenerator';
import { resolveGoldenRuleLayoutVariant } from '@/components/slides/core/goldenRuleLayout';
import { resolveDangerZoneLayoutVariant } from '@/components/slides/core/dangerZoneLayout';

const PILOT_EXAMPLES = [
  {
    file: 'questao-premium-fundatec-meningococica-3meses.json',
    subtopico: 'Imunização',
  },
  {
    file: 'questao-premium-fepese-anotacao-enfermagem-sae.json',
    subtopico: 'Processo de Enfermagem',
  },
  {
    file: 'questao-premium-sus-lei-8080-cesgranrio.json',
    subtopico: 'Promoção à Saúde e Prevenção de Agravos',
  },
] as const;

function loadExample(filename: string) {
  const filePath = path.join(process.cwd(), 'examples', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('piloto premium — 3 subtópicos', () => {
  it.each(PILOT_EXAMPLES)('$subtopico valida com QuestaoCompletaSchema', ({ file }) => {
    const parsed = QuestaoCompletaSchema.safeParse(loadExample(file));
    expect(parsed.success).toBe(true);
  });

  it.each(PILOT_EXAMPLES)(
    '$subtopico: mapa piloto usa cards no logic_flow',
    ({ subtopico }) => {
      const slide = {
        type: 'logic_flow',
        meta: { subtopico },
        steps: ['Passo 1'],
      };
      expect(calculateLayoutVariant(slide)).toBe('cards');
    },
  );

  it.each(PILOT_EXAMPLES)(
    '$subtopico: golden_rule com rows vira reference_table sem layout_variant no JSON',
    ({ file }) => {
      const questao = loadExample(file);
      const golden = questao.reverse_study_slides.find(
        (s: { type: string }) => s.type === 'golden_rule',
      );
      expect(golden?.rows?.length).toBeGreaterThan(0);

      const mapVariant = calculateLayoutVariant(golden);
      expect(
        resolveGoldenRuleLayoutVariant(golden, golden.layout_variant, mapVariant),
      ).toBe('reference_table');
    },
  );

  it.each(PILOT_EXAMPLES)(
    '$subtopico: danger_zone com correct vira compare',
    ({ file }) => {
      const questao = loadExample(file);
      const danger = questao.reverse_study_slides.find(
        (s: { type: string }) => s.type === 'danger_zone',
      );
      expect(danger?.items?.some((i: { correct?: string }) => i.correct?.trim())).toBe(true);

      const mapVariant = calculateLayoutVariant(danger);
      expect(
        resolveDangerZoneLayoutVariant(danger, danger.layout_variant, mapVariant),
      ).toBe('compare');
    },
  );

  it.each(PILOT_EXAMPLES)(
    '$subtopico: slides premium têm tap e x_icon declarados nos goldens',
    ({ file }) => {
      const questao = loadExample(file);
      const logic = questao.reverse_study_slides.find(
        (s: { type: string }) => s.type === 'logic_flow',
      );
      const danger = questao.reverse_study_slides.find(
        (s: { type: string }) => s.type === 'danger_zone',
      );
      expect(logic?.reveal_mode).toBe('tap');
      expect(danger?.bullet_style).toBe('x_icon');
    },
  );
});
