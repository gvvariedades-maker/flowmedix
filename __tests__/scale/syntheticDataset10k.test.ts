import { attachHistoricoStats, filterModulosLikeVitrine } from '@/lib/vitrineFilters';
import { buildVitrineGroups } from '@/lib/vitrine/buildGroups';
import { VITRINE_ASSUNTOS_POR_PAGINA } from '@/lib/vitrine/constants';
import { generateSyntheticScaleDataset } from '@/lib/scale/syntheticDataset';

describe('dataset sintético 10k', () => {
  it('gera 10k módulos com slugs únicos', () => {
    const { modulos } = generateSyntheticScaleDataset({ totalModulos: 10_000 });
    const unique = new Set(modulos.map((m) => m.modulo_slug));

    expect(modulos).toHaveLength(10_000);
    expect(unique.size).toBe(10_000);
  });

  it('mantém paginação sem buracos após grouping/filtro', () => {
    const { modulos, historico } = generateSyntheticScaleDataset({
      totalModulos: 10_000,
      totalAssuntos: 140,
    });

    const withStats = attachHistoricoStats(modulos, historico);
    const filtered = filterModulosLikeVitrine(withStats, { q: 'q-synth' });
    const groups = buildVitrineGroups(filtered);

    const flattenedSlugs = groups.flatMap((group) => group.questoes.map((q) => q.slug));
    const expectedPages = Math.ceil(groups.length / VITRINE_ASSUNTOS_POR_PAGINA);

    expect(filtered).toHaveLength(10_000);
    expect(flattenedSlugs).toHaveLength(10_000);
    expect(new Set(flattenedSlugs).size).toBe(10_000);
    expect(expectedPages).toBeGreaterThan(1);
  });
});
