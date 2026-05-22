import { redirect } from 'next/navigation';
import { getAdminMatriculasPath } from '@/lib/constants';

/** Builder de concursos removido — redireciona para matrículas. */
export default function AdminConcursoBuilderRedirectPage() {
  redirect(getAdminMatriculasPath());
}
