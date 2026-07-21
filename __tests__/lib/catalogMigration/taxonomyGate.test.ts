import {
  buildManifestTaxonomySummary,
  buildScopedSubtopicoInventoryReport,
  evaluateTaxonomyGate,
  filterRowsForSubtopico,
  isCatchAllBucket,
  loadManifestSlugsForPacote,
} from '@/lib/catalogMigration/taxonomyGate';

const CATCH_ALL = 'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis';
const SV = 'Verificação de Sinais Vitais';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';

function row(slug: string, titulo: string, meta: string) {
  return {
    modulo_slug: slug,
    titulo_aula: titulo,
    conteudo_json: { meta: { subtopico: meta } },
  };
}

describe('taxonomyGate', () => {
  it('filtra rows pelo subtópico exato', () => {
    const rows = [
      row('a', CATCH_ALL, CATCH_ALL),
      row('b', SV, SV),
      row('c', CATCH_ALL, SV),
    ];
    expect(filterRowsForSubtopico(rows, CATCH_ALL)).toHaveLength(2);
  });

  it('bloqueia quando há mismatch no escopo', () => {
    const inventory = buildScopedSubtopicoInventoryReport(
      [row('a', CATCH_ALL, CATCH_ALL), row('b', CATCH_ALL, SV)],
      CATCH_ALL,
    );
    const report = evaluateTaxonomyGate({
      subtopico: CATCH_ALL,
      inventory,
      registryTaxonomy: {
        status: 'catch_all_provisional',
        catch_all_mode: 'B',
      },
      pacotePrefix: 'dtrans-mescladas',
    });
    expect(report.gate).toBe('block');
    expect(report.handcraft_allowed).toBe(false);
  });

  it('warn no catch-all modo B com inventário limpo', () => {
    const inventory = buildScopedSubtopicoInventoryReport(
      [row('a', CATCH_ALL, CATCH_ALL), row('b', CATCH_ALL, CATCH_ALL)],
      CATCH_ALL,
    );
    const report = evaluateTaxonomyGate({
      subtopico: CATCH_ALL,
      inventory,
      registryTaxonomy: {
        status: 'catch_all_provisional',
        catch_all_mode: 'B',
        notes: 'Handcraft provisório',
      },
      pacotePrefix: 'dtrans-mescladas',
    });
    expect(report.gate).toBe('warn');
    expect(report.handcraft_allowed).toBe(true);
    expect(report.promote_requires_infer).toBe(true);
    expect(isCatchAllBucket(CATCH_ALL)).toBe(true);
  });

  it('pass quando bucket vazio e manifest reclassificado (modo A)', () => {
    const rows = [
      row('slug-a', VIRAL, VIRAL),
      row('slug-b', VIRAL, VIRAL),
    ];
    const manifest = buildManifestTaxonomySummary(['slug-a', 'slug-b'], rows, CATCH_ALL);
    const inventory = buildScopedSubtopicoInventoryReport(rows, CATCH_ALL);

    expect(manifest.reclassified).toBe(true);

    const report = evaluateTaxonomyGate({
      subtopico: CATCH_ALL,
      inventory,
      registryTaxonomy: { status: 'closed', catch_all_mode: 'A' },
      pacotePrefix: 'dtrans-mescladas',
      manifest,
    });

    expect(report.gate).toBe('pass');
    expect(report.promote_requires_infer).toBe(false);
    expect(report.vitrine_groups_by_canonical_titulo).toBe(true);
    expect(report.catch_all_mode).toBe('A');
  });

  it('bloqueia catch-all sem declaração no registry', () => {
    const inventory = buildScopedSubtopicoInventoryReport(
      [row('a', CATCH_ALL, CATCH_ALL)],
      CATCH_ALL,
    );
    const report = evaluateTaxonomyGate({
      subtopico: CATCH_ALL,
      inventory,
      registryTaxonomy: { status: 'open' },
      pacotePrefix: 'dtrans-mescladas',
    });
    expect(report.gate).toBe('block');
  });

  it('pass em subtópico não catch-all com taxonomy closed', () => {
    const inventory = buildScopedSubtopicoInventoryReport([row('a', SV, SV)], SV);
    const report = evaluateTaxonomyGate({
      subtopico: SV,
      inventory,
      registryTaxonomy: { status: 'closed', closed_at: '2026-01-01' },
      pacotePrefix: 'sinais-vitais',
    });
    expect(report.gate).toBe('pass');
    expect(report.handcraft_allowed).toBe(true);
  });

  it('warn em subtópico não catch-all com inventário ok mas registry open', () => {
    const inventory = buildScopedSubtopicoInventoryReport([row('a', SV, SV)], SV);
    const report = evaluateTaxonomyGate({
      subtopico: SV,
      inventory,
      registryTaxonomy: { status: 'open' },
      pacotePrefix: 'sinais-vitais',
    });
    expect(report.gate).toBe('warn');
    expect(report.handcraft_allowed).toBe(true);
  });

  it('agrega slugs de g01 e g02 no manifest loader', () => {
    const slugs = loadManifestSlugsForPacote(
      'dtrans-mescladas',
      'data/catalog-migration/dtrans-mescladas-g02/manifest.json',
    );
    expect(slugs).toHaveLength(16);
  });
});
