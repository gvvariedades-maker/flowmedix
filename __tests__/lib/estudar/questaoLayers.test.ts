import {
  buildEstudarSlugComQueryFromPlayerProps,
  lessonDataHasSlides,
  mergeSlidesIntoLessonData,
  stripSlidesForCoreLayer,
} from '@/lib/estudar/questaoLayers';
import type { LessonData } from '@/types/lesson';

const lesson: LessonData = {
  meta: { banca: 'FGV', topico: 'Urgências' },
  question_data: {
    instruction: 'Enunciado',
    options: [{ id: 'A', text: 'Opção A' }],
  },
  reverse_study_slides: [{ type: 'golden_rule', content: 'Regra' }],
  study_slides: [{ type: 'concept_map', items: [{ label: 'X' }] }],
};

describe('questaoLayers', () => {
  it('stripSlidesForCoreLayer remove NeuroSlides', () => {
    const core = stripSlidesForCoreLayer(lesson);
    expect(core).not.toHaveProperty('reverse_study_slides');
    expect(core).not.toHaveProperty('study_slides');
    expect(core.meta).toEqual(lesson.meta);
  });

  it('lessonDataHasSlides detecta slides presentes', () => {
    expect(lessonDataHasSlides(lesson)).toBe(true);
    expect(lessonDataHasSlides(stripSlidesForCoreLayer(lesson))).toBe(false);
  });

  it('mergeSlidesIntoLessonData copia slides da fonte', () => {
    const base = stripSlidesForCoreLayer(lesson);
    const merged = mergeSlidesIntoLessonData(base, lesson);
    expect(merged.reverse_study_slides).toHaveLength(1);
    expect(merged.study_slides).toHaveLength(1);
  });

  it('buildEstudarSlugComQueryFromPlayerProps monta contexto vitrine/plano/caderno', () => {
    expect(
      buildEstudarSlugComQueryFromPlayerProps({
        moduloSlug: 'q-1',
        fromPlano: true,
      }),
    ).toBe('q-1?from=plano');
    expect(
      buildEstudarSlugComQueryFromPlayerProps({
        moduloSlug: 'q-2',
        fromCaderno: '550e8400-e29b-41d4-a716-446655440000',
      }),
    ).toBe('q-2?from=caderno&caderno_id=550e8400-e29b-41d4-a716-446655440000');
    expect(
      buildEstudarSlugComQueryFromPlayerProps({
        moduloSlug: 'q-3',
        vitrineQuerySuffix: '?banca=FGV&page=2',
      }),
    ).toBe('q-3?banca=FGV&page=2');
  });
});
