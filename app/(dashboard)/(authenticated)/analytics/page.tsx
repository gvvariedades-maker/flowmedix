import { redirect } from 'next/navigation';

/** Compatibilidade: Analytics unificado no hub Desempenho. */
export default function AnalyticsPageCompatibilityRedirect() {
  redirect('/desempenho');
}
