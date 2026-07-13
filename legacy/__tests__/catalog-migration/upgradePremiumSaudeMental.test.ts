import agitacaoGolden from '@/examples/questao-premium-fundatec-saude-mental-agitacao-exceto.json';
import capsGolden from '@/examples/questao-premium-ibade-saude-mental-caps-acolhimento.json';
import {
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
} from '@/lib/catalogMigration/slideContract';
import {
  buildSaudeMentalPremiumSlides,
  buildSaudeMentalPremiumSlidesForFamily,
  canBuildSaudeMentalPremiumSlides,
  inferSaudeMentalCriseTopic,
  isSaudeMentalSubtopico,
  SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE,
  SAUDE_MENTAL_CAPS_GOLDEN_FILE,
  saudeMentalGoldenReferenceForInput,
} from '@/legacy/catalog-migration/upgradePremiumSaudeMental';
import { matchDedicatedPremiumBuilder } from '@/legacy/catalog-migration/upgradePremiumDedicatedRouter';
import { QuestaoCompletaSchema } from '@/lib/validations';

const SUBTOPICO = 'Saúde Mental';
const TOPICO = 'Enfermagem';

describe('upgradePremiumSaudeMental', () => {
  it('isSaudeMentalSubtopico reconhece nome canônico', () => {
    expect(isSaudeMentalSubtopico('Saúde Mental')).toBe(true);
    expect(isSaudeMentalSubtopico('Processo de Enfermagem')).toBe(false);
  });

  it('inferSaudeMentalCriseTopic detecta EXCETO agitação', () => {
    const topic = inferSaudeMentalCriseTopic(
      agitacaoGolden.question_data.instruction,
      agitacaoGolden.question_data.options,
    );
    expect(topic).toBe('EXCETO — agitação pré-violência');
  });

  it('inferSaudeMentalCriseTopic detecta CAPS acolhimento', () => {
    const topic = inferSaudeMentalCriseTopic(
      capsGolden.question_data.instruction,
      capsGolden.question_data.options,
    );
    expect(topic).toBe('CAPS / acolhimento em crise');
  });

  it('saudeMentalGoldenReferenceForInput mapeia goldens por tópico', () => {
    expect(
      saudeMentalGoldenReferenceForInput(
        agitacaoGolden.question_data.instruction,
        agitacaoGolden.question_data.options,
      ),
    ).toBe(SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE);
    expect(
      saudeMentalGoldenReferenceForInput(
        capsGolden.question_data.instruction,
        capsGolden.question_data.options,
      ),
    ).toBe(SAUDE_MENTAL_CAPS_GOLDEN_FILE);
  });

  it('buildSaudeMentalPremiumSlides gera 4 slides no padrão fundatec EXCETO', () => {
    const slides = buildSaudeMentalPremiumSlides({
      instruction: agitacaoGolden.question_data.instruction,
      options: agitacaoGolden.question_data.options,
      topico: TOPICO,
      subtopico: SUBTOPICO,
    });

    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const lf = slides[2] as { reveal_mode?: string };
    expect(lf.reveal_mode).toBe('tap');

    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra E'))).toBe(true);
    const corrects = dz.items?.map((i) => i.correct ?? '') ?? [];
    expect(new Set(corrects).size).toBe(corrects.length);

    const dup = detectDuplicateDangerJustifications(slides);
    expect(dup.duplicate).toBe(false);

    const drift = detectSlideTopicDrift(agitacaoGolden.question_data.instruction, slides);
    expect(drift).toBe(false);
  });

  it('buildSaudeMentalPremiumSlides gera slides ibade CAPS com danger único', () => {
    const slides = buildSaudeMentalPremiumSlides({
      instruction: capsGolden.question_data.instruction,
      options: capsGolden.question_data.options,
      topico: TOPICO,
      subtopico: SUBTOPICO,
    });

    const dz = slides[3] as { items?: { correct?: string }[] };
    expect(dz.items?.every((i) => i.correct?.includes('Gabarito letra B'))).toBe(true);
    expect(detectDuplicateDangerJustifications(slides).duplicate).toBe(false);
  });

  it('buildSaudeMentalPremiumSlidesForFamily certo_errado de-escalada', () => {
    const slides = buildSaudeMentalPremiumSlidesForFamily(
      {
        instruction:
          'Situação hipotética: Ao cuidar de um paciente em surto psicótico, o técnico de enfermagem adota abordagem calma e comunicação verbal como primeira estratégia de de-escalada. Assertiva: Essa conduta está alinhada com as boas práticas.',
        options: [
          { id: 'A', text: 'Certo', is_correct: true },
          { id: 'B', text: 'Errado', is_correct: false },
        ],
        topico: TOPICO,
        subtopico: SUBTOPICO,
      },
      'certo_errado',
    );

    expect(slides.map((s) => s.type)).toHaveLength(4);
    expect(canBuildSaudeMentalPremiumSlides(
      'surto psicótico de-escalada',
      [{ id: 'A', text: 'Certo', is_correct: true }],
      'certo_errado',
    )).toBe(true);
  });

  it('matchDedicatedPremiumBuilder roteia Saúde Mental crise', () => {
    const match = matchDedicatedPremiumBuilder({
      instruction: capsGolden.question_data.instruction,
      options: capsGolden.question_data.options,
      topico: TOPICO,
      subtopico: SUBTOPICO,
      family: 'conceito',
    });
    expect(match?.goldenReference).toBe(SAUDE_MENTAL_CAPS_GOLDEN_FILE);
    const slides = match?.buildSlides() ?? [];
    expect(slides).toHaveLength(4);
    const parsed = QuestaoCompletaSchema.safeParse({
      meta: { banca: 'IBADE', topico: TOPICO, subtopico: SUBTOPICO },
      question_data: capsGolden.question_data,
      reverse_study_slides: slides,
    });
    expect(parsed.success).toBe(true);
  });

  it('canBuildSaudeMentalPremiumSlides rejeita depressão fora do ramo SM-4', () => {
    expect(
      canBuildSaudeMentalPremiumSlides(
        'A depressão é uma doença com alterações de neurotransmissores. São sintomas de depressão:',
        [
          { id: 'A', text: 'anedonia', is_correct: false },
          { id: 'B', text: 'náuseas', is_correct: true },
        ],
        'conceito',
      ),
    ).toBe(false);
  });
});
