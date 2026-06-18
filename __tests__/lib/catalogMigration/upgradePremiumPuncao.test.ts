import golden from '@/examples/questao-premium-admtec-puncao-venosa-cateteres.json';
import { PREMIUM_STUB_MARKERS } from '@/lib/catalogMigration/upgradePremiumHybrid';
import {
  buildPuncaoChoiceSlides,
  buildPuncaoPremiumSlides,
  canBuildPuncaoPremiumSlides,
  inferPuncaoTopic,
  isPuncaoSubtopico,
  PUNCAO_GOLDEN_FILE,
} from '@/lib/catalogMigration/upgradePremiumPuncao';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';

const GENERIC_PUNCAO = {
  meta: {
    banca: 'Adm&Tec',
    topico: 'Enfermagem',
    subtopico: 'Punção Venosa e Cuidados com Cateteres',
    ano: '2025',
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

describe('upgradePremiumPuncao', () => {
  it('isPuncaoSubtopico reconhece nome canônico', () => {
    expect(isPuncaoSubtopico('Punção Venosa e Cuidados com Cateteres')).toBe(true);
    expect(isPuncaoSubtopico('Curativos e Manejo de Feridas')).toBe(false);
  });

  it('inferPuncaoTopic detecta IPCS no CVC', () => {
    const topic = inferPuncaoTopic(
      golden.question_data.instruction,
      golden.question_data.options,
    );
    expect(topic).toBe('Prevenção de IPCS no CVC');
  });

  it('buildPuncaoPremiumSlides gera 4 slides no padrão golden Adm&Tec', () => {
    const slides = buildPuncaoPremiumSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });

    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label === 'Contexto')).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Barreira estéril')).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Gabarito')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; badge?: string }[]; content?: string };
    expect(gr.content).toContain('BUNDLE');
    expect(gr.rows?.some((r) => r.label === 'Barreira')).toBe(true);
    expect(gr.rows?.some((r) => r.badge === 'hot')).toBe(true);

    const lf = slides[2] as { reveal_mode?: string; steps?: string[] };
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('letra B'))).toBe(true);

    const dz = slides[3] as { items?: { correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito B'))).toBe(true);
  });

  it('buildPuncaoChoiceSlides gera danger_zone compare por letra errada', () => {
    const slides = buildPuncaoChoiceSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Punção Venosa e Cuidados com Cateteres',
    });
    const dz = slides[3] as { items?: { label: string; correct?: string }[] };
    expect(dz.items?.length).toBe(3);
    expect(dz.items?.some((i) => i.label.includes('Letra A'))).toBe(true);
    const corrects = dz.items?.map((i) => i.correct).filter(Boolean) ?? [];
    expect(new Set(corrects).size).toBeGreaterThan(1);
  });

  it('canBuildPuncaoPremiumSlides aceita múltipla escolha e VF', () => {
    expect(
      canBuildPuncaoPremiumSlides(golden.question_data.instruction, 'conceito'),
    ).toBe(true);
    const vfInstruction =
      'Sobre acesso venoso, julgue:\n' +
      'I- Clorexidina alcoólica antes da inserção.\n' +
      'II- Curativo trocado só quando sujo ou solto.\n' +
      'III- Femoral é preferência de rotina.\n' +
      'É CORRETO o que se afirma apenas em:';
    expect(canBuildPuncaoPremiumSlides(vfInstruction, 'vf')).toBe(true);
  });

  it('upgrade híbrido usa builder Punção para questão genérica IPCS', () => {
    const result = upgradePremiumHybrid(GENERIC_PUNCAO);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.goldenReference).toBe(PUNCAO_GOLDEN_FILE);
    expect(result.changes).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const slides = result.payload.reverse_study_slides as { type: string }[];
    const text = slideText(slides);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }

    const gr = slides.find((s) => s.type === 'golden_rule') as { rows?: unknown[] };
    expect(gr.rows?.length).toBeGreaterThanOrEqual(4);

    const parsed = QuestaoCompletaSchema.safeParse(result.payload);
    expect(parsed.success).toBe(true);
  });

  it('golden Adm&Tec permanece válido após upgrade idempotente', () => {
    const result = upgradePremiumHybrid(golden, { force: true });
    expect(result.zodValid).toBe(true);
    const text = slideText(result.payload.reverse_study_slides as { type: string }[]);
    for (const marker of PREMIUM_STUB_MARKERS) {
      expect(text).not.toContain(marker);
    }
  });
});
