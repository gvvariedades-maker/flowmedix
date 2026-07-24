import {
  SELECT_VISIBLE_MAX,
  countByDisciplinaLabel,
  dedupeSlugs,
  selectDisplayedSlugs,
  toggleSlugInSet,
} from '@/lib/cadernos/wizardSelection';

describe('lib/cadernos/wizardSelection', () => {
  it('selectDisplayedSlugs seleciona só as exibidas e respeita o máximo', () => {
    const displayed = Array.from({ length: 60 }, (_, i) => `q-${i}`);
    const { next, added, capped, attempted } = selectDisplayedSlugs(
      displayed,
      new Set(['q-extra']),
      SELECT_VISIBLE_MAX,
    );
    expect(capped).toBe(true);
    expect(attempted).toBe(50);
    expect(added).toBe(50);
    expect(next.has('q-extra')).toBe(true);
    expect(next.has('q-0')).toBe(true);
    expect(next.has('q-49')).toBe(true);
    expect(next.has('q-50')).toBe(false);
    expect(next.size).toBe(51);
  });

  it('selectDisplayedSlugs não confunde total do filtro com exibidas', () => {
    const displayed = ['a', 'b', 'c'];
    const { next, added, capped } = selectDisplayedSlugs(displayed, new Set(), 50);
    expect(capped).toBe(false);
    expect(added).toBe(3);
    expect(next.size).toBe(3);
  });

  it('selectDisplayedSlugs preserva seleção prévia e deduplica', () => {
    const current = new Set(['a', 'b']);
    const { next, added } = selectDisplayedSlugs(['b', 'c', 'd'], current, 50);
    expect(added).toBe(2);
    expect([...next].sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('toggleSlugInSet adiciona e remove', () => {
    const once = toggleSlugInSet(new Set(['a']), 'b');
    expect([...once].sort()).toEqual(['a', 'b']);
    const twice = toggleSlugInSet(once, 'a');
    expect([...twice]).toEqual(['b']);
  });

  it('dedupeSlugs remove vazios e duplicados', () => {
    expect(dedupeSlugs(['a', '', 'a', 'b', 'b'])).toEqual(['a', 'b']);
  });

  it('countByDisciplinaLabel agrupa por rótulo', () => {
    const dist = countByDisciplinaLabel(
      [{ modulo_nome: 'Língua Portuguesa' }, { modulo_nome: 'Farmacologia' }, { modulo_nome: 'Língua Portuguesa' }],
      (nome) => (nome?.toLowerCase().includes('portuguesa') ? 'Português' : 'Enfermagem'),
    );
    expect(dist).toEqual([
      { label: 'Português', count: 2 },
      { label: 'Enfermagem', count: 1 },
    ]);
  });
});
