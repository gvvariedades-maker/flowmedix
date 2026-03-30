import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { 
  getQuestaoBySlugCached, 
  getQuestoesByAssuntoCached,
  getHistoricoQuestoesCached,
} from '@/lib/cache';

interface ModuloListItem {
  id: string;
  modulo_slug: string;
}

export default async function PaginaQuestaoDinamica({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;

  // Busca a questão atual e o userId em paralelo
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const [atual, { data: { user } }] = await Promise.all([
    getQuestaoBySlugCached(resolvedParams.slug),
    supabase.auth.getUser(),
  ]);

  if (!atual) return notFound();

  const userId = user?.id;

  // Navegação por assunto (titulo_aula)
  const tituloAula: string =
    atual.titulo_aula ||
    atual.conteudo_json?.meta?.subtopico ||
    atual.modulo_nome ||
    '';

  // Busca lista de questões do assunto e histórico em paralelo
  const [lista, historico] = await Promise.all([
    tituloAula ? getQuestoesByAssuntoCached(tituloAula) : Promise.resolve([]),
    userId ? getHistoricoQuestoesCached(userId) : Promise.resolve([]),
  ]);

  // Set de slugs onde o estudo reverso foi concluído
  const estudadosSet = new Set<string>(
    (historico as any[])
      .filter(h => h.estudo_reverso_concluido === true)
      .map(h => h.modulo_slug as string)
  );

  const indexAtual = lista?.findIndex((item: ModuloListItem) => item.id === atual.id) ?? -1;
  const anteriorSlug = indexAtual > 0 ? lista![indexAtual - 1].modulo_slug : null;
  const proximaSlug = (lista && indexAtual < lista.length - 1) ? lista[indexAtual + 1].modulo_slug : null;

  // Monta a lista com status de cada questão do assunto
  const questoesDoAssunto = (lista as ModuloListItem[]).map(item => ({
    slug: item.modulo_slug,
    estudada: estudadosSet.has(item.modulo_slug),
  }));

  return (
    <div className="h-screen bg-slate-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-6xl max-h-[90vh]">
        <AvantLessonPlayer 
          dados={atual.conteudo_json} 
          mode="live" 
          proximaSlug={proximaSlug}
          anteriorSlug={anteriorSlug}
          moduloSlug={resolvedParams.slug}
          questoesDoAssunto={questoesDoAssunto}
        />
      </div>
    </div>
  );
}
