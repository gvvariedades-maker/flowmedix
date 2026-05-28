import { shouldShowBackToVitrine } from '@/components/dashboard/BackToVitrineLink';

describe('shouldShowBackToVitrine', () => {
  it('oculta na vitrine e no player', () => {
    expect(shouldShowBackToVitrine('/estudar')).toBe(false);
    expect(shouldShowBackToVitrine('/estudar/questao-slug')).toBe(false);
  });

  it('exibe nas demais rotas do dashboard', () => {
    expect(shouldShowBackToVitrine('/material')).toBe(true);
    expect(shouldShowBackToVitrine('/cadernos/abc')).toBe(true);
    expect(shouldShowBackToVitrine('/simulados')).toBe(true);
    expect(shouldShowBackToVitrine(null)).toBe(false);
  });
});
