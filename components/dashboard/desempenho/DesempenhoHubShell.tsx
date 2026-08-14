import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DesempenhoNav } from '@/components/dashboard/desempenho/DesempenhoNav';

type Props = {
  description: string;
  /** CTA primário do topo (um por viewport). */
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Shell único das três páginas do hub `/desempenho`.
 *
 * Ordem no mobile: breadcrumb → título → navegação → conteúdo (filtros e KPIs).
 * Centraliza o cabeçalho sticky para as rotas não divergirem de aparência.
 */
export function DesempenhoHubShell({ description, action, children }: Props) {
  return (
    <DashboardMobilePage
      variant="default"
      className="dashboard-surface min-h-0 flex-1 bg-background text-foreground"
    >
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 md:px-8">
          <PageHeader
            title="Meu desempenho"
            breadcrumb={[
              { label: 'Área do aluno', href: '/estudar' },
              { label: 'Meu desempenho' },
            ]}
            description={description}
            action={action}
          />
          <DesempenhoNav />
        </div>
      </div>
      {children}
    </DashboardMobilePage>
  );
}
