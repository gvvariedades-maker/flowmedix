import { CANONICAL_SUBTOPICOS } from '@/lib/catalogMigration/canonicalSubtopicos';
import {
  getGrandeAreaMeta,
  listCanonicalTaxonomiaCoverage,
  resolveCanonicalFromTituloAula,
  resolveTaxonomiaAssunto,
} from '@/lib/desempenho/taxonomiaEnfermagem';

describe('taxonomiaEnfermagem', () => {
  it('cobre os 41 subtópicos canônicos com área e faixa de risco', () => {
    const coverage = listCanonicalTaxonomiaCoverage();
    expect(coverage).toHaveLength(41);
    expect(coverage.every((row) => row.areaId !== 'outros')).toBe(true);
    expect(coverage.every((row) => row.riskBandId !== 'outros')).toBe(true);
    expect(new Set(coverage.map((r) => r.subtopico)).size).toBe(CANONICAL_SUBTOPICOS.length);
  });

  it('mapeia exemplos §9 → área → faixa', () => {
    expect(resolveTaxonomiaAssunto('História da Enfermagem')).toMatchObject({
      areaId: 'fundamentos_bases',
      riskBandId: 'bases',
    });
    expect(resolveTaxonomiaAssunto('Vias de Administração')).toMatchObject({
      areaId: 'farmacologia',
      riskBandId: 'alta_incidencia_protocolo',
    });
    expect(resolveTaxonomiaAssunto('Punção Venosa e Cuidados com Cateteres')).toMatchObject({
      areaId: 'procedimentos',
      riskBandId: 'clinico_critico',
    });
    expect(resolveTaxonomiaAssunto('Imunização')).toMatchObject({
      areaId: 'saude_publica',
      riskBandId: 'alta_incidencia_protocolo',
    });
    expect(resolveTaxonomiaAssunto('Urgências e Emergências')).toMatchObject({
      areaId: 'cirurgicas_criticas',
      riskBandId: 'clinico_critico',
    });
    expect(resolveTaxonomiaAssunto('Saúde do Adolescente')).toMatchObject({
      areaId: 'mental_trabalho_ciclos',
      riskBandId: 'ciclos_de_vida',
    });
  });

  it('resolve legado via resolveCanonicalSubtopico e cai em Outros sem match', () => {
    expect(resolveCanonicalFromTituloAula('Semiologia em Enfermagem')).toBe(
      'Verificação de Sinais Vitais',
    );
    expect(resolveTaxonomiaAssunto('Semiologia em Enfermagem').areaId).toBe('procedimentos');
    expect(resolveTaxonomiaAssunto('Tópico inventado XYZ').areaId).toBe('outros');
    expect(getGrandeAreaMeta('outros').riskBandId).toBe('outros');
  });
});
