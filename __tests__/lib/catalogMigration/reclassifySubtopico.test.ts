import {
  isInferenceApplicable,
  parseSubtopicoInference,
  buildInferSubtopicoPrompt,
  inferSubtopicoHeuristic,
} from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';

describe('inferSubtopicoFromEnunciado helpers', () => {
  it('parseSubtopicoInference aceita JSON válido', () => {
    const raw = JSON.stringify({
      suggested_subtopico: 'Verificação de Sinais Vitais',
      confidence: 0.92,
      rationale: 'Enunciado sobre aferição de PA e FC.',
      keep_current: false,
    });
    const parsed = parseSubtopicoInference(raw);
    expect(parsed?.suggested_subtopico).toBe('Verificação de Sinais Vitais');
    expect(isInferenceApplicable(parsed!, 'Procedimentos Diversos', 0.85)).toBe(true);
  });

  it('isInferenceApplicable rejeita keep_current ou baixa confiança', () => {
    const inf = {
      suggested_subtopico: 'Urgências e Emergências',
      confidence: 0.7,
      rationale: 'x',
      keep_current: false,
    };
    expect(isInferenceApplicable(inf, 'Procedimentos Diversos', 0.85)).toBe(false);
    expect(isInferenceApplicable({ ...inf, confidence: 0.9, keep_current: true }, 'Procedimentos Diversos', 0.85)).toBe(
      false,
    );
  });

  it('inferSubtopicoHeuristic detecta sondas', () => {
    const inf = inferSubtopicoHeuristic({
      instruction: 'Sobre instalação de sonda nasogástrica, assinale a alternativa correta.',
      currentSubtopico: 'Procedimentos Diversos',
    });
    expect(inf.suggested_subtopico).toBe('Instalação e Manejo de Sondas');
    expect(isInferenceApplicable(inf, 'Procedimentos Diversos', 0.85)).toBe(true);
  });
});

describe('applySubtopicoLabelToPayload', () => {
  it('move Procedimentos Diversos → Verificação de Sinais Vitais', () => {
    const payload = {
      meta: { banca: 'X', topico: 'Enfermagem', subtopico: 'Procedimentos Diversos' },
      question_data: {
        instruction: 'PA e FC',
        options: [{ id: 'A', text: 'Sim', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', meta: { subtopico: 'Procedimentos Diversos' }, items: [{ label: 'A' }] },
        { type: 'golden_rule', content: 'Regra' },
        { type: 'logic_flow', steps: ['1'] },
        { type: 'danger_zone', content: 'X', items: [{ label: 'E', detail: 'd', correct: 'c' }] },
      ],
    };
    const result = applySubtopicoLabelToPayload(payload, 'Verificação de Sinais Vitais', 'Procedimentos Diversos');
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect((result.payload as { meta: { subtopico: string } }).meta.subtopico).toBe(
      'Verificação de Sinais Vitais',
    );
  });
});
