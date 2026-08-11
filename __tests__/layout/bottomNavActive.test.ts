import {
  BOTTOM_NAV_HREFS,
  isBottomNavItemActive,
  isBottomNavMaisActive,
} from '@/lib/layout/bottomNavActive';

describe('isBottomNavItemActive', () => {
  describe('Estudar', () => {
    it('ativa na vitrine e no player', () => {
      expect(isBottomNavItemActive('/estudar', BOTTOM_NAV_HREFS.estudar)).toBe(true);
      expect(isBottomNavItemActive('/estudar/questao-slug', BOTTOM_NAV_HREFS.estudar)).toBe(true);
    });

    it('não confunde prefixos parecidos', () => {
      expect(isBottomNavItemActive('/estudar-extra', BOTTOM_NAV_HREFS.estudar)).toBe(false);
    });
  });

  describe('Simulados', () => {
    it('ativa em /simulados e subrotas', () => {
      expect(isBottomNavItemActive('/simulados', BOTTOM_NAV_HREFS.simulados)).toBe(true);
      expect(isBottomNavItemActive('/simulados/prova/abc', BOTTOM_NAV_HREFS.simulados)).toBe(true);
    });

    it('não ativa rotas de desempenho (hub separado)', () => {
      expect(isBottomNavItemActive('/desempenho', BOTTOM_NAV_HREFS.simulados)).toBe(false);
      expect(isBottomNavItemActive('/desempenho/simulados', BOTTOM_NAV_HREFS.simulados)).toBe(false);
    });
  });

  describe('Desempenho', () => {
    it('ativa em /desempenho e subrotas do hub', () => {
      expect(isBottomNavItemActive('/desempenho', BOTTOM_NAV_HREFS.desempenho)).toBe(true);
      expect(isBottomNavItemActive('/desempenho/simulados', BOTTOM_NAV_HREFS.desempenho)).toBe(true);
      expect(isBottomNavItemActive('/desempenho/atividade', BOTTOM_NAV_HREFS.desempenho)).toBe(true);
    });

    it('ativa redirects legados /progresso e /analytics (exact)', () => {
      expect(isBottomNavItemActive('/progresso', BOTTOM_NAV_HREFS.desempenho)).toBe(true);
      expect(isBottomNavItemActive('/analytics', BOTTOM_NAV_HREFS.desempenho)).toBe(true);
    });

    it('não ativa subrotas de analytics', () => {
      expect(isBottomNavItemActive('/analytics/detalhe', BOTTOM_NAV_HREFS.desempenho)).toBe(false);
    });
  });

  describe('Cadernos', () => {
    it('ativa em /cadernos e subrotas', () => {
      expect(isBottomNavItemActive('/cadernos', BOTTOM_NAV_HREFS.cadernos)).toBe(true);
      expect(isBottomNavItemActive('/cadernos/meu-caderno', BOTTOM_NAV_HREFS.cadernos)).toBe(true);
    });
  });

  it('retorna false para pathname vazio ou href desconhecido', () => {
    expect(isBottomNavItemActive('', BOTTOM_NAV_HREFS.estudar)).toBe(false);
    expect(isBottomNavItemActive('/estudar', '/outro')).toBe(false);
  });
});

describe('isBottomNavMaisActive', () => {
  it('ativa rotas exclusivas do drawer', () => {
    expect(isBottomNavMaisActive('/ajuda')).toBe(true);
    expect(isBottomNavMaisActive('/ajuda/estudo-reverso')).toBe(true);
    expect(isBottomNavMaisActive('/material')).toBe(true);
    expect(isBottomNavMaisActive('/material/neuroslides')).toBe(true);
    expect(isBottomNavMaisActive('/conta/assinatura')).toBe(true);
  });

  it('não ativa rotas das quatro abas principais', () => {
    expect(isBottomNavMaisActive('/estudar')).toBe(false);
    expect(isBottomNavMaisActive('/simulados')).toBe(false);
    expect(isBottomNavMaisActive('/desempenho')).toBe(false);
    expect(isBottomNavMaisActive('/desempenho/simulados')).toBe(false);
    expect(isBottomNavMaisActive('/desempenho/atividade')).toBe(false);
    expect(isBottomNavMaisActive('/progresso')).toBe(false);
    expect(isBottomNavMaisActive('/analytics')).toBe(false);
    expect(isBottomNavMaisActive('/cadernos')).toBe(false);
  });

  it('retorna false para pathname vazio ou rota desconhecida', () => {
    expect(isBottomNavMaisActive('')).toBe(false);
    expect(isBottomNavMaisActive('/login')).toBe(false);
  });
});
