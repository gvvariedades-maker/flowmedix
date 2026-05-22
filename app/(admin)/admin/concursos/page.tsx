import { redirect } from 'next/navigation';
import { getAdminMatriculasPath } from '@/lib/constants';

/** Lista legada de concursos removida — redireciona para matrículas. */
export default function AdminConcursosRedirectPage() {
  redirect(getAdminMatriculasPath());
}
