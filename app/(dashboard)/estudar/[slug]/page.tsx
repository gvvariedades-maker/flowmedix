import { notFound } from 'next/navigation';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import {
  getQuestaoBySlugCached,
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
} from '@/lib/cache';
import { userHasModuloAccess } from '@/lib/concursos/entitlements';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { getQuestaoNavList } from '@/lib/estudar/questaoNav';
import { sliceQuestoesNavWindow } from '@/lib/estudar/questaoNavWindow';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';

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

  const session = await getServerSession();
  const userId = session?.user?.id;
  const slug = resolvedParams.slug;

  let atual: Awaited<ReturnType<typeof getQuestaoBySlugCached>> = null;

  if (userId) {
    const hasAccess = await userHasModuloAccess(userId, slug);
    if (!hasAccess) return notFound();

    const supabaseAuth = await createSupabaseServerClient();
    const { data, error } = await supabaseAuth
      .from('modulos_estudo')
      .select('id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw error;
    atual = data;
  } else {
    atual = await getQuestaoBySlugCached(slug);
  }

  if (!atual) return notFound();

  const supabase = await createSupabaseServerClient();

  let lista: ModuloListItem[] = [];
  let questoesDoAssunto: { slug: string; estudada: boolean }[] = [];

  if (fromPlano && userId) {
    // ── Modo Plano Diário ──────────────────────────────────────────────────
    const revisoes = await getTodayReviews(userId);

    lista = revisoes.map(r => ({ id: r.modulo_slug, modulo_slug: r.modulo_slug }));

    const historico = await getHistoricoQuestoesForSlugsCached(
      userId,
      lista.map((item) => item.modulo_slug),
    );
    const estudadosSet = estudadosSetFromHistorico(historico);

    questoesDoAssunto = lista.map(item => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));

  } else if (fromCaderno && cadernoId && userId) {
    // ── Modo Caderno ───────────────────────────────────────────────────────
    const { data: cadernoItems } = await supabase
      .from('study_notebook_items')
      .select('modulo_slug, titulo_aula')
      .eq('notebook_id', cadernoId)
      .order('position', { ascending: true });

    lista = (cadernoItems || []).map(i => ({ id: i.modulo_slug, modulo_slug: i.modulo_slug }));

    const historico = await getHistoricoQuestoesForSlugsCached(
      userId,
      lista.map((item) => item.modulo_slug),
    );
    const estudadosSet = estudadosSetFromHistorico(historico);

    questoesDoAssunto = lista.map(item => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));

  } else {
    const tituloAula: string =
      atual.titulo_aula ||
      atual.conteudo_json?.meta?.subtopico ||
      atual.modulo_nome ||
      '';

    const nav = await getQuestaoNavList({
      userId,
      slug: resolvedParams.slug,
      tituloAula,
      vitrineFilters: {
        banca: vitrineBanca || undefined,
        assunto: vitrineAssunto || undefined,
        q: vitrineQ || undefined,
      },
    });

    lista = nav.lista;
    questoesDoAssunto = nav.questoesDoAssunto;
  }

  const indexAtual = lista.findIndex((item) => item.modulo_slug === resolvedParams.slug);
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

  const questoesDoAssuntoParaCliente = sliceQuestoesNavWindow(
    questoesDoAssunto,
    indexAtual,
  );

  const rawCodigo = (atual as { avant_codigo?: unknown }).avant_codigo;
  const avantCodigoAluno =
    rawCodigo != null && rawCodigo !== '' && !Number.isNaN(Number(rawCodigo))
      ? Number(rawCodigo)
      : null;

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-[#010409] px-3 py-3 sm:px-4 md:px-6 md:py-6 pb-safe font-sans">
      <div className="flex flex-1 flex-col min-h-0 w-full max-w-6xl mx-auto">
        <QuestaoNavigationProvider>
          <EstudarQuestaoHydrator
            dados={stripQuestionAnswersForClient(atual.conteudo_json)}
            mode="live"
            proximaSlug={proximaSlugFinal}
            anteriorSlug={anteriorSlugFinal}
            moduloSlug={resolvedParams.slug}
            questoesDoAssunto={questoesDoAssuntoParaCliente}
            fromPlano={fromPlano}
            fromCaderno={fromCaderno ? cadernoId : undefined}
            listaContexto={listaContexto}
            avantCodigo={avantCodigoAluno}
            vitrineQuerySuffix={fromPlano || fromCaderno ? '' : vitrineQuerySuffix}
          />
        </QuestaoNavigationProvider>
      </div>
    </div>
  );
}
