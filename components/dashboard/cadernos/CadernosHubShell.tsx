import type { ReactNode } from 'react';
import { CadernosHeader } from '@/components/dashboard/cadernos/CadernosHeader';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

type Props = {
  children: ReactNode;
};

/**
 * Chrome imediato de `/cadernos`: título + CTA. A lista pesada fica em `children`.
 * Não leva `data-cadernos-hub` — o pending da nav só some quando a lista (ou o erro) chega.
 */
export function CadernosHubShell({ children }: Props) {
  return (
    <DashboardMobilePage
      variant="default"
      className={`${DASHBOARD_PAGE_ROOT} bg-background`}
    >
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <CadernosHeader />
      </div>
      {children}
    </DashboardMobilePage>
  );
}
