import { notFound } from 'next/navigation';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import {
  getQuestaoBySlugCached,
  getQuestoesByAssuntoCached,
  getHistoricoQuestoesCached,
  getModulosEstudoCached,
} from '@/lib/cache';
import {
  buildVitrineFilteredSlugList,
  type HistoricoQuestaoRow,
  type ModuloEstudoRow,
} from '@/lib/vitrineFilters';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';

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

  const vitrineBanca = typeof resolvedSearch.banca === 'string' ? resolvedSearch.banca.trim() : '';
  const vitrineAssunto = typeof resolvedSearch.assunto === 'string' ? resolvedSearch.assunto.trim() : '';
  const vitrineQ = typeof resolvedSearch.q === 'string' ? resolvedSearch.q.trim() : '';

  // `getServerSession()` é deduplicado por request — layout + page + quaisquer
  // outros RSC partilham o mesmo resultado, com apenas um `getSession()` real.
  const [atual, session] = await Promise.all([
    getQuestaoBySlugCached(resolvedParams.slug),
    getServerSession(),
  ]);

  if (!atual) return notFound();

  const userId = session?.user?.id;
  const supabase = await createSupabaseServerClient();

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
    // ── Modo Normal: vitrine com filtro (banca/assunto/q) ou só pelo assunto (titulo_aula) ─
    const tituloAula: string =
      atual.titulo_aula ||
      atual.conteudo_json?.meta?.subtopico ||
      atual.modulo_nome ||
      '';

    const hasVitrineFilters = Boolean(vitrineBanca || vitrineAssunto || vitrineQ);

    const historico = userId ? await getHistoricoQuestoesCached(userId) : [];

    const estudadosSet = new Set<string>(
      (historico as { modulo_slug: string; estudo_reverso_concluido?: boolean }[])
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug as string),
    );

    async function listaPorAssunto(): Promise<ModuloListItem[]> {
      if (!tituloAula) return [];
      try {
        return (await getQuestoesByAssuntoCached(tituloAula)) as ModuloListItem[];
      } catch (e) {
        if (isDataServiceUnavailableError(e)) {
          return [];
        }
        throw e;
      }
    }

    if (hasVitrineFilters) {
      const modulosAll = await getModulosEstudoCached();
      const slugList = buildVitrineFilteredSlugList(
        modulosAll as ModuloEstudoRow[],
        historico as HistoricoQuestaoRow[],
        {
          banca: vitrineBanca || undefined,
          assunto: vitrineAssunto || undefined,
          q: vitrineQ || undefined,
        },
      );

      if (slugList.length > 0 && slugList.includes(resolvedParams.slug)) {
        lista = slugList.map((slug) => ({ id: slug, modulo_slug: slug }));
      } else {
        lista = await listaPorAssunto();
      }
    } else {
      lista = await listaPorAssunto();
    }

    questoesDoAssunto = lista.map((item) => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));
  }

  const indexAtual = lista.findIndex(item => item.modulo_slug === resolvedParams.slug);
  const anteriorSlug = indexAtual > 0 ? lista[indexAtual - 1].modulo_slug : null;
  const proximaSlug = indexAtual < lista.length - 1 ? lista[indexAtual + 1].modulo_slug : null;

  const listaContexto =
    lista.length > 0 && indexAtual >= 0
      ? { atual: indexAtual + 1, total: lista.length }
      : undefined;

  const vitrineParams = new URLSearchParams();
  if (vitrineBanca) vitrineParams.set('banca', vitrineBanca);
  if (vitrineAssunto) vitrineParams.set('assunto', vitrineAssunto);
  if (vitrineQ) vitrineParams.set('q', vitrineQ);
  const vitrineQueryString = vitrineParams.toString();
  const vitrineQuerySuffix = vitrineQueryString ? `?` + vitrineQueryString : '';

  // Propaga o contexto de origem nos slugs de navegação
  const suffix = fromPlano
    ? '?from=plano'
    : fromCaderno && cadernoId
      ? `?from=caderno&caderno_id=${encodeURIComponent(cadernoId)}`
      : vitrineQuerySuffix;

  const anteriorSlugFinal = anteriorSlug ? `${anteriorSlug}${suffix}` : null;
  const proximaSlugFinal = proximaSlug ? `${proximaSlug}${suffix}` : null;

  const rawCodigo = (atual as { avant_codigo?: unknown }).avant_codigo;
  const avantCodigoAluno =
    rawCodigo != null && rawCodigo !== '' && !Number.isNaN(Number(rawCodigo))
      ? Number(rawCodigo)
      : null;

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-[#010409] px-3 py-3 sm:px-4 md:px-6 md:py-6 pb-safe font-sans">
      <div className="flex flex-1 flex-col min-h-0 w-full max-w-6xl mx-auto">
        <AvantLessonPlayer
          dados={atual.conteudo_json}
          mode="live"
          proximaSlug={proximaSlugFinal}
          anteriorSlug={anteriorSlugFinal}
          moduloSlug={resolvedParams.slug}
          questoesDoAssunto={questoesDoAssunto}
          fromPlano={fromPlano}
          fromCaderno={fromCaderno ? cadernoId : undefined}
          listaContexto={listaContexto}
          avantCodigo={avantCodigoAluno}
          vitrineQuerySuffix={fromPlano || fromCaderno ? '' : vitrineQuerySuffix}
        />
      </div>
    </div>
  );
}
