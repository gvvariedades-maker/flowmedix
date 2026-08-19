import type { ReactNode } from 'react';
import { SimuladosHeader } from '@/components/simulados/SimuladosHeader';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

type Props = {
  children: ReactNode;
};

/**
 * Chrome imediato de `/simulados`: título + CTAs. A lista pesada fica em `children`.
 * Não leva `data-simulados-hub` — o pending da nav só some quando a lista (ou o erro) chega.
 */
export function SimuladosHubShell({ children }: Props) {
  return (
    <DashboardMobilePage
      variant="default"
      className={`${DASHBOARD_PAGE_ROOT} bg-background`}
    >
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <SimuladosHeader />
      </div>
      {children}
    </DashboardMobilePage>
  );
}
