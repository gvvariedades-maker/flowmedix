import {
  easeOutCubic,
  formatCatalogCount,
  interpolateCatalogCount,
  VITRINE_STATS_SEEN_STORAGE_KEY,
} from '@/lib/vitrine/catalogStatsAnimation';

describe('catalogStatsAnimation', () => {
  it('formata contagem pt-BR', () => {
    expect(formatCatalogCount(5180)).toMatch(/5\.?180/);
  });

  it('interpola com ease-out até o alvo', () => {
    expect(interpolateCatalogCount(100, 0)).toBe(0);
    expect(interpolateCatalogCount(100, 1)).toBe(100);
    expect(interpolateCatalogCount(100, 0.5)).toBe(Math.round(100 * easeOutCubic(0.5)));
  });
});

describe('VITRINE_STATS_SEEN_STORAGE_KEY', () => {
  it('usa chave estável documentada no plano', () => {
    expect(VITRINE_STATS_SEEN_STORAGE_KEY).toBe('avant.vitrine.statsSeen');
  });
});
