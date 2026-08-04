import { redirect } from 'next/navigation';

/**
 * Stub pós-descontinuação (C2): bookmarks e deep links antigos
 * redirecionam para `/estudar`. Não encadear em `/plano-diario`.
 * @see docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md
 */
export default function RevisoesHojePage() {
  redirect('/estudar');
}
