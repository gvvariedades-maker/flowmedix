import { buildMenuSections, NAV_SECTION_DEFS } from '@/lib/layout/dashboardNav';

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
    expect(sections[0]?.items.map((i) => i.label)).toEqual([
      'Vitrine',
      'Tutorial',
      'Método reverso',
    ]);
  });

  it('NAV_SECTION_DEFS expõe title em cada item para tooltip do menu', () => {
    const items = NAV_SECTION_DEFS.flatMap((s) => s.items);
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

  it('marca /progresso ativo em /analytics', () => {
    const sections = buildMenuSections(isPathActive);
    const progresso = sections
      .find((s) => s.id === 'metricas')
      ?.items.find((i) => i.href === '/progresso');
    expect(progresso?.active).toBe(true);
  });

  it('não marca /ajuda ativo em subrota estudo-reverso', () => {
    const isAjudaSub = (path: string, exact = false) => {
      const pathname = '/ajuda/estudo-reverso';
      if (exact) return pathname === path;
      return pathname === path || pathname.startsWith(`${path}/`);
    };
    const sections = buildMenuSections(isAjudaSub);
    const tutorial = sections
      .find((s) => s.id === 'estudar')
      ?.items.find((i) => i.href === '/ajuda');
    const metodo = sections
      .find((s) => s.id === 'estudar')
      ?.items.find((i) => i.href === '/ajuda/estudo-reverso');
    expect(tutorial?.active).toBe(false);
    expect(metodo?.active).toBe(true);
  });
});
