import { redirect } from 'next/navigation';
import { isAdminSessionEmail } from '@/lib/constants';
import { getMatriculatedConcursosCached } from '@/lib/cache';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import NovoCadernoClient, { type NovoCadernoContext } from '@/components/dashboard/cadernos/NovoCadernoClient';
import { getServerSession } from '@/lib/supabase/server-auth';

export default async function NovoCadernoPage({
  searchParams,
}: {
  searchParams: Promise<{ wizard?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const { wizard: wizardParam } = await searchParams;
  const wizard = wizardParam === '1';
  const isAdmin = isAdminSessionEmail(session.user.email ?? null);

  const [matriculatedConcursos, modulos] = await Promise.all([
    getMatriculatedConcursosCached(session.user.id).catch(() => []),
    resolveAccessibleModulosWhenEmpty(session.user.id, isAdmin),
  ]);

  const editalRow = matriculatedConcursos.find((concurso) => concurso.tipo === 'edital');

  const context: NovoCadernoContext = {
    wizard,
    edital: editalRow
      ? {
          nome: editalRow.nome,
          banca: editalRow.banca,
          orgao: editalRow.orgao,
          ano: editalRow.ano,
          slug: editalRow.slug,
        }
      : null,
    modulos: modulos.map((m) => ({
      modulo_slug: m.modulo_slug,
      titulo_aula: m.titulo_aula,
      modulo_nome: m.modulo_nome,
      banca: m.banca,
    })),
  };

  return <NovoCadernoClient context={context} />;
}
