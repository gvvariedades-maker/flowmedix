import {
  pickCatalogSampleRows,
  PREMIUM_SLIDE_TYPES,
  runCatalogContentAudit,
} from '@/lib/admin/catalogContentAudit';

const fourSlides = [
  { type: 'concept_map', items: [{ label: 'A', detail: 'd' }] },
  { type: 'golden_rule', content: 'Regra', rows: [{ label: 'L', value: 'V' }] },
  { type: 'logic_flow', steps: ['1'], reveal_mode: 'tap' },
  { type: 'danger_zone', content: 'X', items: [{ label: 'e', detail: 'd', correct: 'ok' }] },
];

function makeModulosQuery(
  rows: { modulo_slug: string; conteudo_json: unknown; titulo_aula?: string; banca?: string }[],
) {
  let offset = 0;
  return {
    order: () => ({
      range: () => {
        const batch = rows.slice(offset, offset + 500);
        offset += batch.length;
        return Promise.resolve({ data: batch, error: null });
      },
    }),
  };
}

describe('catalogContentAudit', () => {
  it('pickCatalogSampleRows retorna sampleSize itens distintos', () => {
    const rows = Array.from({ length: 100 }, (_, i) => ({
      modulo_slug: `slug-${String(i).padStart(3, '0')}`,
    }));
    const sample = pickCatalogSampleRows(rows, 20);
    expect(sample).toHaveLength(20);
    const slugs = new Set(sample.map((r) => r.modulo_slug));
    expect(slugs.size).toBe(20);
  });

  it('detecta questão sem slides e pacote inválido', async () => {
    const supabase = {
      from: (table: string) => {
        if (table !== 'modulos_estudo') throw new Error('unexpected table');
        return {
          select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.head) {
              return Promise.resolve({ count: 3, error: null });
            }
            return makeModulosQuery([
              {
                modulo_slug: 'ok-four',
                titulo_aula: 'A',
                banca: 'B',
                conteudo_json: {
                  meta: { banca: 'X', topico: 'T' },
                  question_data: {
                    instruction: 'Enunciado',
                    options: [{ id: 'a', text: 'A', is_correct: true }],
                  },
                  reverse_study_slides: fourSlides,
                },
              },
              {
                modulo_slug: 'no-slides',
                titulo_aula: 'A',
                banca: 'B',
                conteudo_json: {
                  meta: { banca: 'X', topico: 'T' },
                  question_data: {
                    instruction: 'Enunciado',
                    options: [{ id: 'a', text: 'A', is_correct: true }],
                  },
                },
              },
              {
                modulo_slug: 'two-slides',
                titulo_aula: 'A',
                banca: 'B',
                conteudo_json: {
                  meta: { banca: 'X', topico: 'T' },
                  question_data: {
                    instruction: 'Enunciado',
                    options: [{ id: 'a', text: 'A', is_correct: true }],
                  },
                  reverse_study_slides: fourSlides.slice(0, 2),
                },
              },
            ]);
          },
        };
      },
    } as unknown as import('@supabase/supabase-js').SupabaseClient;

    const report = await runCatalogContentAudit(supabase, {
      sampleSize: 3,
      issueListLimit: 10,
    });

    expect(report.catalog_total).toBe(3);
    expect(report.summary.fully_premium_package).toBe(1);
    expect(report.summary.missing_slides).toBe(1);
    expect(report.summary.slide_count_not_four).toBe(1);
    expect(report.issue_rows.length).toBeGreaterThanOrEqual(2);
    expect(PREMIUM_SLIDE_TYPES).toHaveLength(4);
  });
});
