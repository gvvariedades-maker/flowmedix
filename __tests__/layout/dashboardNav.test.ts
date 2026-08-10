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
