import golden from '@/examples/questao-premium-fepese-sv-interpretacao-valores.json';
import goldenCe from '@/examples/questao-premium-idecan-fc-radial-ce.json';
import { PREMIUM_STUB_MARKERS } from '@/lib/catalogMigration/upgradePremiumHybrid';
import {
  buildSinaisChoiceSlides,
  buildSinaisPremiumSlides,
  buildSinaisPremiumSlidesForFamily,
  canBuildSinaisPremiumSlides,
  extractVitalsFromInstruction,
  inferSinaisTopic,
  isSinaisSubtopico,
  SINAIS_GOLDEN_CE_FILE,
  SINAIS_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumSinais';
import { lintVitalsGoldenContent } from '@/lib/slides/vitalsGoldenLint';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';

const GENERIC_SINAIS = {
  meta: {
    banca: 'FEPESE',
    topico: 'Enfermagem',
    subtopico: 'Verificação de Sinais Vitais',
    ano: '2024',
  },
  question_data: golden.question_data,
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

function slideText(slides: { type: string }[]): string {
  return JSON.stringify(slides).toLowerCase();
}

const FEPESE_BULLET_INSTRUCTION =
  'Ao verificar os sinais vitais do paciente, você identificou os seguintes valores:\n' +
  '" PA 110×75 mmHg\n' +
  '" Temperatura axilar 36,5°C\n' +
  '" FC 110 bpm\n' +
  '" FR 30 mpm\n' +
  'Considerando os resultados acima, você diria que o paciente está:';

describe('upgradePremiumSinais', () => {
  it('isSinaisSubtopico reconhece nome canônico', () => {
    expect(isSinaisSubtopico('Verificação de Sinais Vitais')).toBe(true);
    expect(isSinaisSubtopico('Punção Venosa e Cuidados com Cateteres')).toBe(false);
  });

  it('extractVitalsFromInstruction parseia PA, T, FC e FR do golden FEPESE', () => {
    const vitals = extractVitalsFromInstruction(golden.question_data.instruction);
    expect(vitals.map((v) => v.kind)).toEqual(['pa', 'temp', 'fc', 'fr']);
    expect(vitals.find((v) => v.kind === 'fc')?.clinicalTerm).toBe('Taquicárdico');
    expect(vitals.find((v) => v.kind === 'fr')?.clinicalTerm).toBe('Taquipneico');
  });

  it('extractVitalsFromInstruction separa temperatura e FC com aspas tipo bullet', () => {
    const vitals = extractVitalsFromInstruction(FEPESE_BULLET_INSTRUCTION);
    expect(vitals.map((v) => v.kind)).toEqual(['pa', 'temp', 'fc', 'fr']);

    const temp = vitals.find((v) => v.kind === 'temp');
    expect(temp?.label).toBe('Temperatura axilar 36,5°C');
    expect(temp?.label).not.toContain('FC');
    expect(temp?.value).toBe('36,5°C');

    expect(vitals.find((v) => v.kind === 'fc')?.label).toBe('FC 110 bpm');
  });

  it('buildSinaisChoiceSlides não funde temperatura com FC em concept_map e golden_rule', () => {
    const slides = buildSinaisChoiceSlides({
      instruction: FEPESE_BULLET_INSTRUCTION,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Verificação de Sinais Vitais',
    });

    const cm = slides[0] as { items?: { label: string }[] };
    const tempItem = cm.items?.find((i) => i.label.includes('°C'));
    expect(tempItem?.label).toBe('36,5°C axilar');
    expect(tempItem?.label).not.toContain('FC');

    const gr = slides[1] as { rows?: { label: string }[] };
    const tempRow = gr.rows?.find((r) => r.label.includes('Temperatura'));
    expect(tempRow?.label).toBe('Temperatura axilar 36,5°C');
    expect(tempRow?.label).not.toContain('FC');

    const lf = slides[2] as { steps?: string[] };
    expect(lf.steps?.some((s) => s.includes('36,5°C = afebril'))).toBe(true);
    expect(lf.steps?.every((s) => !s.includes('FC 110 bpm') || s.includes('frequência cardíaca'))).toBe(true);
  });

  it('inferSinaisTopic detecta interpretação de valores', () => {
    const topic = inferSinaisTopic(golden.question_data.instruction, golden.question_data.options);
    expect(topic).toBe('Interpretação de valores');
  });

  it('buildSinaisPremiumSlides gera 4 slides no padrão golden FEPESE', () => {
    const slides = buildSinaisPremiumSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Verificação de Sinais Vitais',
    });

    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const cm = slides[0] as { items?: { label: string; correct?: string }[] };
    expect(cm.items?.some((i) => i.label.includes('110×75'))).toBe(true);
    expect(cm.items?.some((i) => i.correct === 'Taquicárdico')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; value: string }[]; content?: string };
    expect(gr.rows?.some((r) => r.label === 'Conclusão' && r.value === 'Alternativa A')).toBe(true);

    const lf = slides[2] as { reveal_mode?: string; steps?: string[] };
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('Interpretar a frequência cardíaca'))).toBe(true);

    const dz = slides[3] as { items?: { correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.every((i) => typeof i.correct === 'string' && i.correct.length > 0)).toBe(true);
  });

  it('buildSinaisChoiceSlides gera danger_zone compare por letra errada', () => {
    const slides = buildSinaisChoiceSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Verificação de Sinais Vitais',
    });
    const dz = slides[3] as { items?: { label: string }[] };
    expect(dz.items?.length).toBeGreaterThanOrEqual(4);
    expect(dz.items?.some((i) => i.label.includes('Letra D'))).toBe(true);
  });

  it('buildSinaisPremiumSlidesForFamily gera certo/errado no padrão IDECAN FC', () => {
    const slides = buildSinaisPremiumSlidesForFamily(
      {
        instruction: goldenCe.question_data.instruction,
        options: goldenCe.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Verificação de Sinais Vitais',
      },
      'certo_errado',
    );

    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label === 'Pulso radial')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; sv_kind?: string }[] };
    expect(gr.rows?.some((r) => r.label === 'Gabarito')).toBe(true);
    expect(gr.rows?.some((r) => r.sv_kind === 'meta')).toBe(true);
    expect(gr.rows?.some((r) => /taquicardia/i.test(r.value ?? ''))).toBe(false);
  });

  it('builder C/E IDECAN passa lintVitalsGoldenContent', () => {
    const slides = buildSinaisPremiumSlidesForFamily(
      {
        instruction: goldenCe.question_data.instruction,
        options: goldenCe.question_data.options,
        topico: 'Enfermagem',
        subtopico: 'Verificação de Sinais Vitais',
      },
      'certo_errado',
    );
    const payload = {
      ...goldenCe,
      reverse_study_slides: slides,
    };
    expect(lintVitalsGoldenContent(payload)).toEqual([]);
  });

  it('canBuildSinaisPremiumSlides aceita múltipla escolha, VF e certo/errado', () => {
    expect(canBuildSinaisPremiumSlides(golden.question_data.instruction, 'text_fragment')).toBe(true);
    const vfInstruction =
      'Sobre sinais vitais, julgue:\n' +
      'I- FC normal no adulto é 60 a 100 bpm.\n' +
      'II- Taquipneia ocorre acima de 20 irpm.\n' +
      'III- 36,5°C axilar é febril.\n' +
      'É CORRETO o que se afirma apenas em:';
    expect(canBuildSinaisPremiumSlides(vfInstruction, 'vf')).toBe(true);
    expect(canBuildSinaisPremiumSlides(goldenCe.question_data.instruction, 'certo_errado')).toBe(true);
  });

  it('upgrade híbrido usa builder Sinais para questão genérica FEPESE', () => {
    const result = upgradePremiumHybrid(GENERIC_SINAIS);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(SINAIS_GOLDEN_FILE);
    expect(result.changes).toEqual(['concept_map', 'golden_rule', 'logic_flow', 'danger_zone']);

    const slides = result.payload.reverse_study_slides as { type: string }[];
    const text = slideText(slides);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }

    const lf = slides.find((s) => s.type === 'logic_flow') as { steps?: string[] };
    expect(lf.steps?.some((s) => s.startsWith('Interpretar '))).toBe(true);

    const parsed = QuestaoCompletaSchema.safeParse(result.payload);
    expect(parsed.success).toBe(true);
  });

  it('upgrade híbrido certo/errado referencia golden IDECAN', () => {
    const result = upgradePremiumHybrid(
      {
        ...GENERIC_SINAIS,
        question_data: goldenCe.question_data,
      },
      { force: true },
    );
    expect(result.goldenReference).toBe(SINAIS_GOLDEN_CE_FILE);
    expect(result.zodValid).toBe(true);
  });

  it('golden FEPESE permanece válido após upgrade idempotente', () => {
    const result = upgradePremiumHybrid(golden, { force: true });
    expect(result.zodValid).toBe(true);
    const text = slideText(result.payload.reverse_study_slides as { type: string }[]);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }
  });
});
