import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { 
  getQuestaoBySlugCached, 
  getQuestoesByAssuntoCached,
  getHistoricoQuestoesCached,
} from '@/lib/cache';
import { getTodayReviews } from '@/lib/spaced-repetition';

interface ModuloListItem {
  id: string;
  modulo_slug: string;
}

export default async function PaginaQuestaoDinamica({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const from = resolvedSearch?.from as string | undefined;
  const fromPlano = from === 'plano';
  const fromCaderno = from === 'caderno';
  const cadernoId = fromCaderno ? (resolvedSearch?.caderno_id as string | undefined) : undefined;

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

  let lista: ModuloListItem[] = [];
  let questoesDoAssunto: { slug: string; estudada: boolean }[] = [];

  if (fromPlano && userId) {
    // ── Modo Plano Diário ──────────────────────────────────────────────────
    const [revisoes, historico] = await Promise.all([
      getTodayReviews(userId),
      getHistoricoQuestoesCached(userId),
    ]);

    lista = revisoes.map(r => ({ id: r.modulo_slug, modulo_slug: r.modulo_slug }));

    const estudadosSet = new Set<string>(
      (historico as any[])
        .filter(h => h.estudo_reverso_concluido === true)
        .map(h => h.modulo_slug as string)
    );

    questoesDoAssunto = lista.map(item => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));

  } else if (fromCaderno && cadernoId && userId) {
    // ── Modo Caderno ───────────────────────────────────────────────────────
    const [{ data: cadernoItems }, historico] = await Promise.all([
      supabase
        .from('study_notebook_items')
        .select('modulo_slug, titulo_aula')
        .eq('notebook_id', cadernoId)
        .order('position', { ascending: true }),
      getHistoricoQuestoesCached(userId),
    ]);

    lista = (cadernoItems || []).map(i => ({ id: i.modulo_slug, modulo_slug: i.modulo_slug }));

    const estudadosSet = new Set<string>(
      (historico as any[])
        .filter(h => h.estudo_reverso_concluido === true)
        .map(h => h.modulo_slug as string)
    );

    questoesDoAssunto = lista.map(item => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));

  } else {
    // ── Modo Normal: navega pelo assunto (titulo_aula) ─────────────────────
    const tituloAula: string =
      atual.titulo_aula ||
      atual.conteudo_json?.meta?.subtopico ||
      atual.modulo_nome ||
      '';

    const [listaAssunto, historico] = await Promise.all([
      tituloAula ? getQuestoesByAssuntoCached(tituloAula) : Promise.resolve([]),
      userId ? getHistoricoQuestoesCached(userId) : Promise.resolve([]),
    ]);

    lista = listaAssunto as ModuloListItem[];

    const estudadosSet = new Set<string>(
      (historico as any[])
        .filter(h => h.estudo_reverso_concluido === true)
        .map(h => h.modulo_slug as string)
    );

    questoesDoAssunto = lista.map(item => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));
  }

  const indexAtual = lista.findIndex(item => item.modulo_slug === resolvedParams.slug);
  const anteriorSlug = indexAtual > 0 ? lista[indexAtual - 1].modulo_slug : null;
  const proximaSlug = indexAtual < lista.length - 1 ? lista[indexAtual + 1].modulo_slug : null;

  // Propaga o contexto de origem nos slugs de navegação
  const suffix = fromPlano
    ? '?from=plano'
    : fromCaderno && cadernoId
      ? `?from=caderno&caderno_id=${cadernoId}`
      : '';

  const anteriorSlugFinal = anteriorSlug ? `${anteriorSlug}${suffix}` : null;
  const proximaSlugFinal = proximaSlug ? `${proximaSlug}${suffix}` : null;

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-slate-50 px-3 py-3 sm:px-4 md:px-6 md:py-6 pb-safe font-sans">
      <div className="flex flex-1 min-h-0 w-full max-w-6xl mx-auto flex-col">
        <AvantLessonPlayer 
          dados={atual.conteudo_json} 
          mode="live" 
          proximaSlug={proximaSlugFinal}
          anteriorSlug={anteriorSlugFinal}
          moduloSlug={resolvedParams.slug}
          questoesDoAssunto={questoesDoAssunto}
          fromPlano={fromPlano}
          fromCaderno={fromCaderno ? cadernoId : undefined}
        />
      </div>
    </div>
  );
}
