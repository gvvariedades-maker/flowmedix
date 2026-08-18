import {
  buildEstudarSlugComQueryFromPlayerProps,
  fetchLessonSlidesLayer,
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

  describe('fetchLessonSlidesLayer', () => {
    const apiUrl = '/api/estudar/questao?q-1&layers=full';

    it('retorna success quando payload tem slides', async () => {
      const fetchFn = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ dados: lesson }),
      });
      const result = await fetchLessonSlidesLayer(apiUrl, fetchFn);
      expect(result).toEqual({ status: 'success', dados: lesson });
      expect(fetchFn).toHaveBeenCalledWith(apiUrl);
    });

    it('retorna http_error quando resposta não é ok', async () => {
      const result = await fetchLessonSlidesLayer(
        apiUrl,
        jest.fn().mockResolvedValue({ ok: false, status: 503 }),
      );
      expect(result).toEqual({ status: 'http_error', httpStatus: 503 });
    });

    it('retorna empty quando payload não tem slides', async () => {
      const core = stripSlidesForCoreLayer(lesson);
      const result = await fetchLessonSlidesLayer(
        apiUrl,
        jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ dados: core }),
        }),
      );
      expect(result).toEqual({ status: 'empty' });
    });

    it('retorna network_error quando fetch rejeita', async () => {
      const result = await fetchLessonSlidesLayer(
        apiUrl,
        jest.fn().mockRejectedValue(new Error('offline')),
      );
      expect(result).toEqual({ status: 'network_error' });
    });
  });

  it('buildEstudarSlugComQueryFromPlayerProps monta contexto caderno/vitrine', () => {
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
