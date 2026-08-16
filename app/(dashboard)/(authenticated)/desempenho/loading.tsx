import { DesempenhoEstudoPendingView } from '@/components/dashboard/desempenho/DesempenhoEstudoPendingView';

/**
 * Instant loading UI só do segmento `/desempenho` (App Router).
 * Não altera loadEstudoDashboard nem agregações — só o fallback enquanto o RSC chega.
 * O clique da nav também monta esta view no shell (Next 16.2 segura a tela atual até o flight).
 */
export default function DesempenhoLoading() {
  return <DesempenhoEstudoPendingView />;
}
