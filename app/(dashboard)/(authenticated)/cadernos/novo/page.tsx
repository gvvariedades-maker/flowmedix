import { redirect } from 'next/navigation';
import { isAdminSessionEmail } from '@/lib/constants';
import { getMatriculatedConcursosCached } from '@/lib/cache';
import { resolveAccessibleModulosWhenEmpty } from '@/lib/concursos/resolveCatalogWhenEmpty';
import NovoCadernoClient, { type NovoCadernoContext } from '@/components/dashboard/cadernos/NovoCadernoClient';
import { getServerSession } from '@/lib/supabase/server-auth';

export default async function NovoCadernoPage({
  searchParams,
}: {
  searchParams: Promise<{ wizard?: string; origem?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  const { origem: origemParam } = await searchParams;
  const origem = origemParam === 'desempenho' ? 'desempenho' : 'edital';
  const isAdmin = isAdminSessionEmail(session.user.email ?? null);

  const [matriculatedConcursos, modulos] = await Promise.all([
    getMatriculatedConcursosCached(session.user.id).catch(() => []),
    resolveAccessibleModulosWhenEmpty(session.user.id, isAdmin),
  ]);

  const editalRow = matriculatedConcursos.find((concurso) => concurso.tipo === 'edital');

  const context: NovoCadernoContext = {
    wizard: true,
    origem,
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
      avant_codigo: m.avant_codigo ?? null,
    })),
  };

  // Sempre wizard. Edital: 3 etapas. Hub desempenho: lote estrito em 2 etapas. `?wizard=1` permanece compatível.
  return <NovoCadernoClient context={context} />;
}
