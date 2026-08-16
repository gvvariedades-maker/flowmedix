import { DesempenhoHubShell } from '@/components/dashboard/desempenho/DesempenhoHubShell';
import {
  DESEMPENHO_ESTUDO_HUB_DESCRIPTION,
  DesempenhoEstudoHubAction,
} from '@/components/dashboard/desempenho/DesempenhoEstudoHubChrome';
import { DesempenhoEstudoLoadingSkeleton } from '@/components/dashboard/desempenho/DesempenhoEstudoLoadingSkeleton';

/** Mesmo chrome + skeleton de `desempenho/loading.tsx` — também usado no clique da nav. */
export function DesempenhoEstudoPendingView() {
  return (
    <DesempenhoHubShell
      description={DESEMPENHO_ESTUDO_HUB_DESCRIPTION}
      action={<DesempenhoEstudoHubAction />}
    >
      <DesempenhoEstudoLoadingSkeleton />
    </DesempenhoHubShell>
  );
}
