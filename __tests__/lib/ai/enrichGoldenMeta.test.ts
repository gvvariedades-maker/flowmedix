import { enrichQuestaoGoldenMeta } from '@/lib/ai/enrichGoldenMeta';

describe('enrichQuestaoGoldenMeta', () => {
  it('injeta content_standard, family, sources e content_review', () => {
    const payload = {
      meta: { banca: 'CPCON', topico: 'Enfermagem', subtopico: 'Imunização' },
      question_data: { instruction: 'test', options: [] },
    };

    const out = enrichQuestaoGoldenMeta(payload, {
      subtopico: 'Imunização',
      family: 'vf',
      guideline: null,
    });

    const meta = out.meta as Record<string, unknown>;
    expect(meta.content_standard).toBe('golden-v1');
    expect(meta.family).toBe('vf');
    expect(Array.isArray(meta.sources)).toBe(true);
    expect((meta.sources as unknown[]).length).toBeGreaterThan(0);
    expect(meta.content_review).toMatchObject({
      reviewer: 'avant-agent',
      exam_vs_current: 'none',
    });
  });

  it('não sobrescreve sources nem content_review existentes', () => {
    const payload = {
      meta: {
        banca: 'X',
        topico: 'Enfermagem',
        subtopico: 'Imunização',
        sources: [{ id: 'manual', tier: 'A', issuer: 'MS', title: 'T', year: 2024 }],
        content_review: {
          reviewed_at: '2026-01-01',
          reviewer: 'humano',
          guideline_snapshot: 'PNI 2025',
          exam_vs_current: 'none',
        },
      },
    };

    const out = enrichQuestaoGoldenMeta(payload, {
      subtopico: 'Imunização',
      family: 'vf',
    });

    const meta = out.meta as Record<string, unknown>;
    expect(meta.sources).toEqual(payload.meta.sources);
    expect(meta.content_review).toEqual(payload.meta.content_review);
  });
});
