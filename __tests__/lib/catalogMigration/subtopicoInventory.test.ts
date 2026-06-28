import {
  buildSubtopicoInventoryReport,
  extractInventoryRow,
} from '@/lib/catalogMigration/subtopicoInventory';

describe('subtopicoInventory', () => {
  it('detecta mismatch titulo_aula vs meta.subtopico', () => {
    const row = extractInventoryRow({
      modulo_slug: 'test-slug',
      titulo_aula: 'Procedimentos Diversos',
      conteudo_json: {
        meta: { subtopico: 'Verificação de Sinais Vitais' },
      },
    });
    expect(row.mismatch).toBe(true);
  });

  it('não marca mismatch quando titulo legado resolve para meta', () => {
    const row = extractInventoryRow({
      modulo_slug: 'test-slug-2',
      titulo_aula: 'Semiologia em Enfermagem',
      conteudo_json: {
        meta: { subtopico: 'Verificação de Sinais Vitais' },
      },
    });
    expect(row.titulo_resolves_to).toBe('Verificação de Sinais Vitais');
    expect(row.mismatch).toBe(false);
  });

  it('agrega contagens no relatório', () => {
    const report = buildSubtopicoInventoryReport([
      {
        modulo_slug: 'a',
        titulo_aula: 'Procedimentos Diversos',
        conteudo_json: { meta: { subtopico: 'Procedimentos Diversos' } },
      },
      {
        modulo_slug: 'b',
        titulo_aula: 'Procedimentos Diversos',
        conteudo_json: { meta: { subtopico: 'Imunização' } },
      },
    ]);
    expect(report.total_scanned).toBe(2);
    expect(report.summary.mismatch_count).toBe(1);
    expect(report.catch_all_buckets[0]?.count).toBe(2);
  });
});
