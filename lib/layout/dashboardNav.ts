import {
  BarChart3,
  BookMarked,
  BrainCircuit,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { MenuAccentKey } from '@/components/layout/MenuNavIconChip';
import { BRAND_NAME } from '@/lib/brand/brandName';

export type IsPathActiveFn = (path: string, exact?: boolean) => boolean;

export type DashboardNavItemDef = {
  label: string;
  title: string;
  href: string;
  icon: LucideIcon;
  accent: MenuAccentKey;
};

export type DashboardNavItem = DashboardNavItemDef & {
  active: boolean;
};

export type DashboardNavSectionDef = {
  id: string;
  label: string;
  items: DashboardNavItemDef[];
};

export type DashboardNavSection = {
  id: string;
  label: string;
  items: DashboardNavItem[];
};

export const NAV_SECTION_DEFS: DashboardNavSectionDef[] = [
  {
    id: 'estudar',
    label: 'Estudar',
    items: [
      {
        label: 'Vitrine',
        title: 'Vitrine de aulas e assuntos',
        href: '/estudar',
        icon: LayoutDashboard,
        accent: 'brand',
      },
      {
        label: 'Tutorial',
        title: `Como usar o ${BRAND_NAME}`,
        href: '/ajuda',
        icon: HelpCircle,
        accent: 'sky',
      },
      {
        label: 'Método reverso',
        title: 'Estudo reverso — o método',
        href: '/ajuda/estudo-reverso',
        icon: BrainCircuit,
        accent: 'violet',
      },
    ],
  },
  {
    id: 'metricas',
    label: 'Métricas',
    items: [
      {
        label: 'Progresso',
        title: 'Progresso de estudo',
        href: '/progresso',
        icon: BarChart3,
        accent: 'emerald',
      },
      {
        label: 'Desempenho',
        title: 'Desempenho em simulados',
        href: '/desempenho/simulados',
        icon: TrendingUp,
        accent: 'amber',
      },
      {
        label: 'Missão da semana',
        title: 'Avaliação semanal personalizada',
        href: '/missao-semanal',
        icon: Sparkles,
        accent: 'sky',
      },
    ],
  },
  {
    id: 'organizar',
    label: 'Organizar',
    items: [
      {
        label: 'Simulados',
        title: 'Simulados',
        href: '/simulados',
        icon: ListChecks,
        accent: 'rose',
      },
      {
        label: 'Cadernos',
        title: 'Cadernos de estudo',
        href: '/cadernos',
        icon: BookMarked,
        accent: 'indigo',
      },
    ],
  },
];

function resolveItemActive(href: string, isPathActive: IsPathActiveFn): boolean {
  switch (href) {
    case '/ajuda':
    case '/ajuda/estudo-reverso':
      return isPathActive(href, true);
    case '/progresso':
      return isPathActive('/progresso') || isPathActive('/analytics');
    default:
      return isPathActive(href);
  }
}

export function buildMenuSections(isPathActive: IsPathActiveFn): DashboardNavSection[] {
  return NAV_SECTION_DEFS.map((section) => ({
    id: section.id,
    label: section.label,
    items: section.items.map((item) => ({
      ...item,
      active: resolveItemActive(item.href, isPathActive),
    })),
  }));
}
