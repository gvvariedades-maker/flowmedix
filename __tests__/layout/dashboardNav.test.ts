import {
  buildHelpNavItems,
  buildMenuSections,
  HELP_NAV_ITEM_DEFS,
  NAV_SECTION_DEFS,
} from '@/lib/layout/dashboardNav';
import { Library, RefreshCw, Target } from 'lucide-react';

describe('buildMenuSections', () => {
  const isPathActive = (path: string, exact = false) => {
    const pathname = '/analytics';
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  it('retorna 3 seções com labels curtos', () => {
    const sections = buildMenuSections(isPathActive);
    expect(sections).toHaveLength(3);
    expect(sections.map((s) => s.label)).toEqual(['Estudar', 'Métricas', 'Organizar']);
    expect(sections[0]?.items.map((i) => i.label)).toEqual(['Vitrine']);
  });

  it('NAV_SECTION_DEFS expõe title em cada item para tooltip do menu', () => {
    const items = [
      ...NAV_SECTION_DEFS.flatMap((s) => s.items),
      ...HELP_NAV_ITEM_DEFS,
    ];
    expect(items).toHaveLength(8);
    for (const item of items) {
      expect(item.title.trim().length).toBeGreaterThan(0);
    }
    expect(items.find((i) => i.href === '/estudar')?.title).toBe('Vitrine de aulas e assuntos');
    expect(items.find((i) => i.href === '/ajuda')?.title).toBe('Como usar o AVANT enf');
    expect(items.find((i) => i.href === '/simulados')?.title).toBe('Simulados');
  });

  it('seção Organizar contém Simulados e Cadernos', () => {
    const organizar = NAV_SECTION_DEFS.find((s) => s.id === 'organizar');
    expect(organizar?.items.map((i) => i.label)).toEqual(['Simulados', 'Cadernos']);
  });

  it('ajuda (Tutorial / Método reverso) fica em HELP_NAV_ITEM_DEFS', () => {
    expect(HELP_NAV_ITEM_DEFS.map((i) => i.label)).toEqual(['Tutorial', 'Método reverso']);
    const help = buildHelpNavItems(isPathActive);
    expect(help).toHaveLength(2);
    expect(help.every((i) => i.active === false)).toBe(true);
  });

  it('seção Estudar tem só Vitrine (heading oculto no shell quando 1 item)', () => {
    const estudar = NAV_SECTION_DEFS.find((s) => s.id === 'estudar');
    expect(estudar?.items).toHaveLength(1);
    expect(estudar?.items[0]?.label).toBe('Vitrine');
  });

  it('marca /desempenho ativo em /analytics (redirect legado)', () => {
    const sections = buildMenuSections(isPathActive);
    const desempenho = sections
      .find((s) => s.id === 'metricas')
      ?.items.find((i) => i.href === '/desempenho');
    expect(desempenho?.active).toBe(true);
  });

  it('marca /desempenho/simulados ativo só no analytics de simulados', () => {
    const isSimuladosDesempenho = (path: string, exact = false) => {
      const pathname = '/desempenho/simulados';
      if (exact) return pathname === path;
      return pathname === path || pathname.startsWith(`${path}/`);
    };
    const sections = buildMenuSections(isSimuladosDesempenho);
    const metricas = sections.find((s) => s.id === 'metricas')?.items;
    expect(metricas?.find((i) => i.href === '/desempenho')?.active).toBe(false);
    expect(metricas?.find((i) => i.href === '/desempenho/simulados')?.active).toBe(true);
  });

  it('seção Métricas tem Desempenho, Simulados e Missão', () => {
    const metricas = NAV_SECTION_DEFS.find((s) => s.id === 'metricas');
    expect(metricas?.items.map((i) => i.label)).toEqual([
      'Desempenho',
      'Simulados',
      'Missão da semana',
    ]);
    expect(metricas?.items.map((i) => i.href)).toEqual([
      '/desempenho',
      '/desempenho/simulados',
      '/missao-semanal',
    ]);
  });

  it('não marca /ajuda ativo em subrota estudo-reverso', () => {
    const isAjudaSub = (path: string, exact = false) => {
      const pathname = '/ajuda/estudo-reverso';
      if (exact) return pathname === path;
      return pathname === path || pathname.startsWith(`${path}/`);
    };
    const help = buildHelpNavItems(isAjudaSub);
    const tutorial = help.find((i) => i.href === '/ajuda');
    const metodo = help.find((i) => i.href === '/ajuda/estudo-reverso');
    expect(tutorial?.active).toBe(false);
    expect(metodo?.active).toBe(true);
  });

  it('metáforas de ícone: Vitrine Library, Missão Target, Método RefreshCw', () => {
    const estudar = NAV_SECTION_DEFS.find((s) => s.id === 'estudar')?.items[0];
    const missao = NAV_SECTION_DEFS.find((s) => s.id === 'metricas')?.items.find(
      (i) => i.href === '/missao-semanal',
    );
    const metodo = HELP_NAV_ITEM_DEFS.find((i) => i.href === '/ajuda/estudo-reverso');
    expect(estudar?.icon).toBe(Library);
    expect(missao?.icon).toBe(Target);
    expect(metodo?.icon).toBe(RefreshCw);
  });
});
