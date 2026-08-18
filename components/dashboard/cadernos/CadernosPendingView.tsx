import { CadernosHubShell } from '@/components/dashboard/cadernos/CadernosHubShell';
import { CadernosListLoadingSkeleton } from '@/components/dashboard/cadernos/CadernosListLoadingSkeleton';
import type { HubNavPendingPhase } from '@/lib/layout/hubNavPending';

/**
 * Placeholder da lista `/cadernos`.
 * Também usado no clique da nav — Next 16.2 segura a tela atual até o RSC.
 * Chrome real (título + CTA) para CLS baixo; skeleton só no corpo.
 */
export function CadernosPendingView({ phase = 'loading' }: { phase?: HubNavPendingPhase }) {
  return (
    <CadernosHubShell>
      <CadernosListLoadingSkeleton phase={phase} />
    </CadernosHubShell>
  );
}
