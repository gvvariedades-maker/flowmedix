import { redirect } from 'next/navigation';
import { getAdminMatriculasPath } from '@/lib/admin/paths';

/** Builder de concursos removido — redireciona para matrículas. */
export default function AdminConcursoBuilderRedirectPage() {
  redirect(getAdminMatriculasPath());
}
