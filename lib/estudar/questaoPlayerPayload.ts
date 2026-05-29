import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvantLessonPlayerProps } from '@/types/lesson';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
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

export type EstudarSearchParams = Record<string, string | string[] | undefined>;

export type EstudarQuestaoBuildResult =
  | { status: 'ok'; payload: AvantLessonPlayerProps }
  | { status: 'forbidden' }
  | { status: 'not_found' };

interface ModuloListItem {
  id: string;
  modulo_slug: string;
}

type ModuloAtualRow = {
  conteudo_json: AvantLessonPlayerProps['dados'];
  titulo_aula?: string | null;
  modulo_nome?: string | null;
  avant_codigo?: unknown;
};

export function parseEstudarSearchParams(searchParams: EstudarSearchParams) {
  const from = searchParams.from as string | undefined;
  const fromPlano = from === 'plano';
  const fromCaderno = from === 'caderno';
  const cadernoId = fromCaderno
    ? (typeof searchParams.caderno_id === 'string' ? searchParams.caderno_id : undefined)
    : undefined;
  const vitrineBancas = Array.isArray(searchParams.banca)
    ? searchParams.banca.map((b) => String(b).trim()).filter(Boolean)
    : typeof searchParams.banca === 'string' && searchParams.banca.trim()
      ? [searchParams.banca.trim()]
      : [];
  const vitrineAssuntos = Array.isArray(searchParams.assunto)
    ? searchParams.assunto.map((a) => String(a).trim()).filter(Boolean)
    : typeof searchParams.assunto === 'string' && searchParams.assunto.trim()
      ? [searchParams.assunto.trim()]
      : [];
  const vitrineQ = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';

  return { fromPlano, fromCaderno, cadernoId, vitrineBancas, vitrineAssuntos, vitrineQ };
}

export type BuildEstudarQuestaoPlayerPayloadInput = {
  slug: string;
  userId?: string | null;
  searchParams?: EstudarSearchParams;
  /** Cliente com sessão do usuário (API Bearer). Se omitido no RSC, usa cookies via `createSupabaseServerClient`. */
  supabase?: SupabaseClient;
};

/**
 * Monta props do `AvantLessonPlayer` para `/estudar/[slug]` (RSC e prefetch API).
 * Logado: entitlement + módulo via Supabase autenticado. Anônimo: cache anon.
 */
export async function buildEstudarQuestaoPlayerPayload(
  input: BuildEstudarQuestaoPlayerPayloadInput,
): Promise<EstudarQuestaoBuildResult> {
  const { slug, userId, searchParams = {} } = input;
  const { fromPlano, fromCaderno, cadernoId, vitrineBancas, vitrineAssuntos, vitrineQ } =
    parseEstudarSearchParams(searchParams);

  let atual: ModuloAtualRow | null = null;
  let supabase: SupabaseClient | null = null;

  if (userId) {
    const hasAccess = await userHasModuloAccess(userId, slug);
    if (!hasAccess) return { status: 'forbidden' };

    supabase = input.supabase ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select(
        'id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo',
      )
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw error;
    atual = data as ModuloAtualRow | null;
  } else {
    atual = (await getQuestaoBySlugCached(slug)) as ModuloAtualRow | null;
  }

  if (!atual) return { status: 'not_found' };

  let lista: ModuloListItem[] = [];
  let questoesDoAssunto: { slug: string; estudada: boolean }[] = [];

  if (fromPlano && userId) {
    const revisoes = await getTodayReviews(userId);
    lista = revisoes.map((r) => ({ id: r.modulo_slug, modulo_slug: r.modulo_slug }));

    const historico = await getHistoricoQuestoesForSlugsCached(
      userId,
      lista.map((item) => item.modulo_slug),
    );
    const estudadosSet = estudadosSetFromHistorico(historico);

    questoesDoAssunto = lista.map((item) => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));
  } else if (fromCaderno && cadernoId && userId) {
    if (!supabase) {
      supabase = input.supabase ?? (await createSupabaseServerClient());
    }

    const { data: cadernoItems } = await supabase
      .from('study_notebook_items')
      .select('modulo_slug, titulo_aula')
      .eq('notebook_id', cadernoId)
      .order('position', { ascending: true });

    lista = (cadernoItems || []).map((i) => ({
      id: i.modulo_slug,
      modulo_slug: i.modulo_slug,
    }));

    const historico = await getHistoricoQuestoesForSlugsCached(
      userId,
      lista.map((item) => item.modulo_slug),
    );
    const estudadosSet = estudadosSetFromHistorico(historico);

    questoesDoAssunto = lista.map((item) => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));
  } else {
    const tituloAula: string =
      atual.titulo_aula ||
      (atual.conteudo_json as { meta?: { subtopico?: string } })?.meta?.subtopico ||
      atual.modulo_nome ||
      '';

    const nav = await getQuestaoNavList({
      userId: userId ?? undefined,
      slug,
      tituloAula,
      vitrineFilters: {
        bancas: vitrineBancas.length ? vitrineBancas : undefined,
        assuntos: vitrineAssuntos.length ? vitrineAssuntos : undefined,
        q: vitrineQ || undefined,
      },
    });

    lista = nav.lista;
    questoesDoAssunto = nav.questoesDoAssunto;
  }

  const indexAtual = lista.findIndex((item) => item.modulo_slug === slug);
  const anteriorSlug = indexAtual > 0 ? lista[indexAtual - 1].modulo_slug : null;
  const proximaSlug = indexAtual < lista.length - 1 ? lista[indexAtual + 1].modulo_slug : null;

  const listaContexto =
    lista.length > 0 && indexAtual >= 0
      ? { atual: indexAtual + 1, total: lista.length }
      : undefined;

  const vitrineParams = new URLSearchParams();
  vitrineBancas.forEach((b) => vitrineParams.append('banca', b));
  vitrineAssuntos.forEach((a) => vitrineParams.append('assunto', a));
  if (vitrineQ) vitrineParams.set('q', vitrineQ);
  const vitrineQueryString = vitrineParams.toString();
  const vitrineQuerySuffix = vitrineQueryString ? `?${vitrineQueryString}` : '';

  const suffix = fromPlano
    ? '?from=plano'
    : fromCaderno && cadernoId
      ? `?from=caderno&caderno_id=${encodeURIComponent(cadernoId)}`
      : vitrineQuerySuffix;

  const anteriorSlugFinal = anteriorSlug ? `${anteriorSlug}${suffix}` : null;
  const proximaSlugFinal = proximaSlug ? `${proximaSlug}${suffix}` : null;

  const questoesDoAssuntoParaCliente = sliceQuestoesNavWindow(questoesDoAssunto, indexAtual);

  const rawCodigo = atual.avant_codigo;
  const avantCodigoAluno =
    rawCodigo != null && rawCodigo !== '' && !Number.isNaN(Number(rawCodigo))
      ? Number(rawCodigo)
      : null;

  const payload: AvantLessonPlayerProps = {
    dados: stripQuestionAnswersForClient(atual.conteudo_json),
    mode: 'live',
    proximaSlug: proximaSlugFinal,
    anteriorSlug: anteriorSlugFinal,
    moduloSlug: slug,
    questoesDoAssunto: questoesDoAssuntoParaCliente,
    fromPlano,
    fromCaderno: fromCaderno ? cadernoId : undefined,
    listaContexto,
    avantCodigo: avantCodigoAluno,
    vitrineQuerySuffix: fromPlano || fromCaderno ? '' : vitrineQuerySuffix,
  };

  return { status: 'ok', payload };
}
