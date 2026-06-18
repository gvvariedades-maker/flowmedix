import goldenVf from '@/examples/questao-premium-cpcon-imunizacao-intervalos-vf.json';
import goldenCal from '@/examples/questao-premium-fundatec-meningococica-3meses.json';
import {
  buildImunizacaoChoiceSlides,
  buildImunizacaoPremiumSlides,
  extractImunizacaoAssertives,
  resolveImunizacaoAssertives,
} from '@/lib/catalogMigration/upgradePremiumImunizacao';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';
import { PREMIUM_STUB_MARKERS } from '@/lib/catalogMigration/upgradePremiumHybrid';

const GENERIC_IMUNIZACAO = {
  meta: {
    banca: 'CPCON',
    topico: 'Enfermagem',
    subtopico: 'Imunização',
    ano: '2025',
  },
  question_data: goldenVf.question_data,
  reverse_study_slides: [
    { type: 'concept_map', items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }] },
    { type: 'golden_rule', content: 'Regra essencial genérica' },
    { type: 'logic_flow', steps: ['Passo genérico'] },
    {
      type: 'danger_zone',
      content: 'Erros comuns',
      items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
    },
  ],
};

describe('upgradePremiumImunizacao', () => {
  it('extractImunizacaoAssertives lê I–IV do enunciado', () => {
    expect(extractImunizacaoAssertives(goldenVf.question_data.instruction)).toHaveLength(4);
  });

  it('resolveImunizacaoAssertives marca II, III, IV verdadeiras para letra C', () => {
    const assertives = resolveImunizacaoAssertives(
      goldenVf.question_data.instruction,
      goldenVf.question_data.options.find((o) => o.is_correct),
    );
    expect(assertives.find((a) => a.roman === 'I')?.isTrue).toBe(false);
    expect(assertives.find((a) => a.roman === 'II')?.isTrue).toBe(true);
    expect(assertives.find((a) => a.roman === 'III')?.isTrue).toBe(true);
    expect(assertives.find((a) => a.roman === 'IV')?.isTrue).toBe(true);
  });

  it('buildImunizacaoPremiumSlides gera 4 slides pedagógicos VF', () => {
    const slides = buildImunizacaoPremiumSlides({
      instruction: goldenVf.question_data.instruction,
      options: goldenVf.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Imunização',
    });
    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label.includes('grace period'))).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Combinação correta')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; emphasis?: string }[] };
    expect(gr.rows?.some((r) => r.label.includes('I —') && r.emphasis === 'alert')).toBe(true);
    expect(gr.rows?.some((r) => r.label.includes('Combinação'))).toBe(true);

    const lf = slides[2] as { reveal_mode?: string; steps?: string[] };
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('Julgar I'))).toBe(true);
    expect(lf.steps?.some((s) => s.includes('Montar conjunto'))).toBe(true);

    const dz = slides[3] as { items?: { label: string; correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.some((i) => i.label.includes('Letra A'))).toBe(true);
    expect(dz.items?.some((i) => i.correct?.toLowerCase().includes('grace'))).toBe(true);
  });

  it('buildImunizacaoChoiceSlides gera calendário com marco etário', () => {
    const slides = buildImunizacaoChoiceSlides({
      instruction: goldenCal.question_data.instruction,
      options: goldenCal.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Imunização',
    });
    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label.includes('Marco'))).toBe(true);
    const gr = slides[1] as { rows?: { label: string }[] };
    expect(gr.rows?.some((r) => r.label.includes('3 meses'))).toBe(true);
    const dz = slides[3] as { items?: { label: string }[] };
    expect(dz.items?.some((i) => i.label.includes('Letra A'))).toBe(true);
  });

  it('upgrade híbrido usa builder Imunização para VF genérico', () => {
    const result = upgradePremiumHybrid(GENERIC_IMUNIZACAO);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.family).toBe('vf');
    expect(result.goldenReference).toBe('questao-premium-cpcon-imunizacao-intervalos-vf.json');
    expect(result.changes).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const slides = result.payload.reverse_study_slides as { type: string }[];
    const cm = slides.find((s) => s.type === 'concept_map') as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label.includes('Afirmativa I'))).toBe(true);

    const stubText = JSON.stringify(result.payload).toLowerCase();
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(stubText).not.toContain(marker);
    }
  });
});
