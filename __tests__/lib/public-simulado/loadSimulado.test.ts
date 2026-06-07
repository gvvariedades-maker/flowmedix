import {
  buildPublicSimuladoDiagnostico,
  gradePublicSimuladoAnswer,
  resolveEixoFromLesson,
} from '@/lib/public-simulado/grade';
import { loadPublicSimuladoBundle, loadPublicSimuladoManifest } from '@/lib/public-simulado/loadSimulado';
import type { LessonData } from '@/types/lesson';

const sampleLesson: LessonData = {
  meta: { banca: 'IDECAN', topico: 'Enfermagem', subtopico: 'Teste Eixo' },
  question_data: {
    instruction: 'Pergunta?',
    options: [
      { id: 'A', text: 'Errada', is_correct: false },
      { id: 'B', text: 'Certa', is_correct: true },
    ],
  },
  reverse_study_slides: [],
};

describe('lib/public-simulado/grade', () => {
  it('resolve eixo pelo subtópico', () => {
    expect(resolveEixoFromLesson(sampleLesson)).toBe('Teste Eixo');
  });

  it('calcula acerto', () => {
    expect(gradePublicSimuladoAnswer(sampleLesson, 'B')).toEqual({
      acertou: true,
      opcaoCorretaId: 'B',
    });
    expect(gradePublicSimuladoAnswer(sampleLesson, 'A')?.acertou).toBe(false);
  });

  it('agrupa diagnóstico por eixo', () => {
    const diag = buildPublicSimuladoDiagnostico([
      {
        slug: 'a',
        opcaoId: 'A',
        acertou: false,
        opcaoCorretaId: 'B',
        eixo: 'Cálculo',
        ordem: 1,
      },
      {
        slug: 'b',
        opcaoId: 'B',
        acertou: true,
        opcaoCorretaId: 'B',
        eixo: 'SAE',
        ordem: 2,
      },
    ]);
    expect(diag).toHaveLength(1);
    expect(diag[0]?.eixo).toBe('Cálculo');
  });
});

describe('lib/public-simulado/loadSimulado', () => {
  it('carrega manifest cg-01', () => {
    const manifest = loadPublicSimuladoManifest('cg-01');
    expect(manifest.id).toBe('cg-01');
    expect(manifest.questoes).toHaveLength(10);
  });

  it('carrega bundle cg-01 com slides', () => {
    const bundle = loadPublicSimuladoBundle('cg-01');
    expect(bundle.questoes).toHaveLength(10);
    for (const q of bundle.questoes) {
      expect(q.dados.reverse_study_slides?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(q.dados.question_data.options.length).toBeGreaterThan(0);
    }
  });
});
