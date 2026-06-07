import { redirect } from 'next/navigation';
import { getAdminMatriculasPath } from '@/lib/admin/paths';

/** Lista legada de concursos removida — redireciona para matrículas. */
export default function AdminConcursosRedirectPage() {
  redirect(getAdminMatriculasPath());
}
