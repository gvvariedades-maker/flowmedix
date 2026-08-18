import { SimuladosPendingView } from '@/components/simulados/SimuladosPendingView';

/**
 * Instant loading UI só do segmento `/simulados`.
 * O clique da nav também monta esta view no shell (Next 16.2 segura a tela atual até o flight).
 */
export default function SimuladosLoading() {
  return <SimuladosPendingView />;
}
