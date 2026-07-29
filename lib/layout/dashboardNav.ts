import {
  BarChart3,
  BookMarked,
  BrainCircuit,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TrendingUp,
  Zap,
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

export type BuildMenuSectionsOptions = {
  /**
   * AVANT Memória ativo (flag + allowlist, resolvido no servidor).
   * Ativo → superfície canônica `/revisoes-hoje`; inativo → menu legado.
   */
  avantMemoriaAtivo?: boolean;
};

/** Item legado de revisão (SM-2) — exibido só com AVANT Memória inativo. */
export const NAV_ITEM_PLANO_DIARIO: DashboardNavItemDef = {
  label: 'Plano diário',
  title: 'Plano de estudo diário',
  href: '/plano-diario',
  icon: CalendarDays,
  accent: 'teal',
};

/** Item canônico do AVANT Memória — substitui o Plano diário quando ativo. */
export const NAV_ITEM_REVISOES_HOJE: DashboardNavItemDef = {
  label: 'Revisões de hoje',
  title: 'Revisões de hoje',
  href: '/revisoes-hoje',
  icon: Zap,
  accent: 'teal',
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
      NAV_ITEM_PLANO_DIARIO,
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
    case '/plano-diario':
    case '/revisoes-hoje':
      return isPathActive(href, true);
    case '/progresso':
      return isPathActive('/progresso') || isPathActive('/analytics');
    default:
      return isPathActive(href);
  }
}

/**
 * Troca o item legado de revisão pela rota canônica quando o AVANT Memória está ativo.
 * Nunca expõe as duas entradas ao mesmo usuário.
 */
function resolveItemDef(
  item: DashboardNavItemDef,
  avantMemoriaAtivo: boolean,
): DashboardNavItemDef {
  if (avantMemoriaAtivo && item.href === NAV_ITEM_PLANO_DIARIO.href) {
    return NAV_ITEM_REVISOES_HOJE;
  }
  return item;
}

export function buildMenuSections(
  isPathActive: IsPathActiveFn,
  options: BuildMenuSectionsOptions = {},
): DashboardNavSection[] {
  const avantMemoriaAtivo = options.avantMemoriaAtivo === true;

  return NAV_SECTION_DEFS.map((section) => ({
    id: section.id,
    label: section.label,
    items: section.items.map((def) => {
      const item = resolveItemDef(def, avantMemoriaAtivo);
      return {
        ...item,
        active: resolveItemActive(item.href, isPathActive),
      };
    }),
  }));
}
