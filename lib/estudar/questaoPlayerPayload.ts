import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvantLessonPlayerProps } from '@/types/lesson';
import { logger } from '@/lib/logger';
import {
  getQuestaoBySlugCached,
  getHistoricoQuestoesForSlugsCached,
  estudadosSetFromHistorico,
} from '@/lib/cache';
import { getAccessibleModuloSlugs, userHasModuloAccess } from '@/lib/concursos/entitlements';
import { getTodayReviews } from '@/lib/spaced-repetition';
import { getQuestaoNavList } from '@/lib/estudar/questaoNav';
import { sliceQuestoesNavWindow } from '@/lib/estudar/questaoNavWindow';
import {
  ESTUDAR_QUESTAO_LAYERS_DEFAULT,
  stripSlidesForCoreLayer,
  type EstudarQuestaoLayers,
} from '@/lib/estudar/questaoLayers';
import {
  ensureLessonDataForPlayer,
  lessonDataHasPlayableQuestion,
  serializeLessonPayloadForClient,
  stripQuestionAnswersForClient,
} from '@/lib/estudar/questionPayload';
import type { EstudarSearchParams } from '@/lib/estudar/parseEstudarSearchParams';
import { parseEstudarSearchParams } from '@/lib/estudar/parseEstudarSearchParams';

export type { EstudarSearchParams } from '@/lib/estudar/parseEstudarSearchParams';
export { parseEstudarSearchParams } from '@/lib/estudar/parseEstudarSearchParams';

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

export type BuildEstudarQuestaoPlayerPayloadInput = {
  slug: string;
  userId?: string | null;
  searchParams?: EstudarSearchParams;
  /** `core` omite NeuroSlides (prefetch); `full` inclui slides (RSC / estudo reverso). */
  layers?: EstudarQuestaoLayers;
  /** Gestor/admin: catálogo completo na vitrine sem matrícula em concurso. */
  isAdmin?: boolean;
  /** Cliente com sessão do usuário (API Bearer). Se omitido no RSC, usa cookies via `createSupabaseServerClient`. */
  supabase?: SupabaseClient;
};

async function historicoForSlugsSafe(
  userId: string,
  slugs: readonly string[],
): Promise<Awaited<ReturnType<typeof getHistoricoQuestoesForSlugsCached>>> {
  try {
    return await getHistoricoQuestoesForSlugsCached(userId, slugs);
  } catch (err) {
    logger.warn('Histórico indisponível para navegação do player', {
      userId,
      slugCount: slugs.length,
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

/**
 * Monta props do `AvantLessonPlayer` para `/estudar/[slug]` (RSC e prefetch API).
 * Logado: entitlement + módulo via Supabase autenticado. Anônimo: cache anon.
 */
export async function buildEstudarQuestaoPlayerPayload(
  input: BuildEstudarQuestaoPlayerPayloadInput,
): Promise<EstudarQuestaoBuildResult> {
  try {
    return await buildEstudarQuestaoPlayerPayloadImpl(input);
  } catch (err) {
    logger.error('Erro inesperado ao montar payload da questão', err, {
      slug: input.slug,
      userId: input.userId,
    });
    return { status: 'not_found' };
  }
}

async function buildEstudarQuestaoPlayerPayloadImpl(
  input: BuildEstudarQuestaoPlayerPayloadInput,
): Promise<EstudarQuestaoBuildResult> {
  const {
    slug,
    userId,
    searchParams = {},
    isAdmin = false,
    layers = ESTUDAR_QUESTAO_LAYERS_DEFAULT,
  } = input;
  const {
    fromPlano,
    fromCaderno,
    cadernoId,
    vitrineBancas,
    vitrineAssuntos,
    vitrineQ,
    vitrinePage,
  } = parseEstudarSearchParams(searchParams);

  let atual: ModuloAtualRow | null = null;
  let supabase: SupabaseClient | null = null;

  if (userId) {
    if (!isAdmin) {
      try {
        let hasAccess = await userHasModuloAccess(userId, slug);
        if (!hasAccess) {
          const pacote = await getAccessibleModuloSlugs(userId);
          hasAccess = pacote.has(slug);
        }
        if (!hasAccess) return { status: 'forbidden' };
      } catch (err) {
        logger.error('Falha ao verificar acesso ao módulo', err, { userId, slug });
        return { status: 'not_found' };
      }
    }

    if (isAdmin) {
      atual = (await getQuestaoBySlugCached(slug)) as ModuloAtualRow | null;
    } else {
      const { createServerSupabase } = await import('@/lib/supabase/server');
      supabase = input.supabase ?? (await createServerSupabase());
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select(
          'id, modulo_slug, conteudo_json, banca, modulo_nome, titulo_aula, created_at, avant_codigo',
        )
        .eq('modulo_slug', slug)
        .maybeSingle();

      if (error) {
        logger.error('Falha ao carregar módulo para o player', error, { slug, userId });
        return { status: 'not_found' };
      }
      atual = data as ModuloAtualRow | null;
    }
  } else {
    atual = (await getQuestaoBySlugCached(slug)) as ModuloAtualRow | null;
  }

  if (!atual) return { status: 'not_found' };

  const dadosNormalizados = ensureLessonDataForPlayer(atual.conteudo_json);
  if (!lessonDataHasPlayableQuestion(dadosNormalizados)) {
    logger.warn('Questão sem alternativas jogáveis', { slug, userId });
    return { status: 'not_found' };
  }

  let lista: ModuloListItem[] = [];
  let questoesDoAssunto: { slug: string; estudada: boolean }[] = [];

  const ensureSupabase = async (): Promise<SupabaseClient> => {
    if (supabase) return supabase;
    const { createServerSupabase } = await import('@/lib/supabase/server');
    supabase = input.supabase ?? (await createServerSupabase());
    return supabase;
  };

  if (fromPlano && userId) {
    const revisoes = await getTodayReviews(userId);
    lista = revisoes.map((r) => ({ id: r.modulo_slug, modulo_slug: r.modulo_slug }));

    const historico = await historicoForSlugsSafe(
      userId,
      lista.map((item) => item.modulo_slug),
    );
    const estudadosSet = estudadosSetFromHistorico(historico);

    questoesDoAssunto = lista.map((item) => ({
      slug: item.modulo_slug,
      estudada: estudadosSet.has(item.modulo_slug),
    }));
  } else if (fromCaderno && cadernoId && userId) {
    const db = await ensureSupabase();

    const { data: notebook, error: notebookError } = await db
      .from('study_notebooks')
      .select('id')
      .eq('id', cadernoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (notebookError || !notebook) {
      logger.warn('Caderno inexistente ou sem acesso', {
        userId,
        cadernoId,
        message: notebookError?.message,
      });
      return { status: 'not_found' };
    }

    const { data: cadernoItems, error: itemsError } = await db
      .from('study_notebook_items')
      .select('modulo_slug, titulo_aula')
      .eq('notebook_id', cadernoId)
      .order('position', { ascending: true });

    if (itemsError) {
      logger.error('Falha ao listar itens do caderno', itemsError, { userId, cadernoId });
      return { status: 'not_found' };
    }

    let cadernoRows = cadernoItems || [];
    if (!isAdmin) {
      try {
        const accessibleSlugs = await getAccessibleModuloSlugs(userId);
        cadernoRows = cadernoRows.filter((i) => accessibleSlugs.has(i.modulo_slug));
      } catch (err) {
        logger.error('Falha ao filtrar itens do caderno por pacote', err, { userId, cadernoId });
        return { status: 'not_found' };
      }
    }

    lista = cadernoRows.map((i) => ({
      id: i.modulo_slug,
      modulo_slug: i.modulo_slug,
    }));

    const historico = await historicoForSlugsSafe(
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
      dadosNormalizados.meta?.subtopico ||
      atual.modulo_nome ||
      '';

    const nav = await getQuestaoNavList({
      userId: userId ?? undefined,
      slug,
      tituloAula,
      isAdmin,
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
  const proximaSlug =
    indexAtual >= 0 && indexAtual < lista.length - 1
      ? lista[indexAtual + 1].modulo_slug
      : null;

  const listaContexto =
    lista.length > 0 && indexAtual >= 0
      ? { atual: indexAtual + 1, total: lista.length }
      : undefined;

  const vitrineParams = new URLSearchParams();
  vitrineBancas.forEach((b) => vitrineParams.append('banca', b));
  vitrineAssuntos.forEach((a) => vitrineParams.append('assunto', a));
  if (vitrineQ) vitrineParams.set('q', vitrineQ);
  if (vitrinePage > 1) vitrineParams.set('page', String(vitrinePage));
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

  let dadosCliente = stripQuestionAnswersForClient(dadosNormalizados);
  if (layers === 'core') {
    dadosCliente = stripSlidesForCoreLayer(dadosCliente);
  }

  const payload: AvantLessonPlayerProps = serializeLessonPayloadForClient({
    dados: dadosCliente,
    mode: 'live',
    proximaSlug: proximaSlugFinal,
    anteriorSlug: anteriorSlugFinal,
    moduloSlug: slug,
    questoesDoAssunto: questoesDoAssuntoParaCliente,
    fromPlano,
    fromCaderno: fromCaderno ? cadernoId : undefined,
    listaContexto,
    avantCodigo: avantCodigoAluno,
    vitrineQuerySuffix: suffix,
  });

  return { status: 'ok', payload };
}

export { patchQuestaoEstudadaInPayload } from '@/lib/estudar/patchQuestaoEstudada';
