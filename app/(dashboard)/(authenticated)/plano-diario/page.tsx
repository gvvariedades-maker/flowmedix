import { redirect } from 'next/navigation';

/**
 * Stub pós-descontinuação (C2): bookmarks e deep links antigos
 * redirecionam para `/estudar`.
 * @see docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md
 */
export default function PlanoDiarioPage() {
  redirect('/estudar');
}
