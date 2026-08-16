import { CadernosPendingView } from '@/components/dashboard/cadernos/CadernosPendingView';

/**
 * Instant loading UI só do segmento `/cadernos`.
 * O clique da nav também monta esta view no shell (Next 16.2 segura a tela atual até o flight).
 */
export default function CadernosLoading() {
  return <CadernosPendingView />;
}
