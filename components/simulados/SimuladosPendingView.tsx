import { SimuladosHubShell } from '@/components/simulados/SimuladosHubShell';
import { SimuladosListLoadingSkeleton } from '@/components/simulados/SimuladosListLoadingSkeleton';
import type { HubNavPendingPhase } from '@/lib/layout/hubNavPending';

/**
 * Placeholder da lista `/simulados`.
 * Também usado no clique da nav — Next 16.2 segura a tela atual até o RSC.
 * Chrome real (título + CTA) para CLS baixo; skeleton só no corpo.
 */
export function SimuladosPendingView({ phase = 'loading' }: { phase?: HubNavPendingPhase }) {
  return (
    <SimuladosHubShell>
      <SimuladosListLoadingSkeleton phase={phase} />
    </SimuladosHubShell>
  );
}
