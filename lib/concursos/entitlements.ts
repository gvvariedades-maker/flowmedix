import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { SCALE_LIMITS } from '@/lib/scale/constants';
import {
  CAMPINA_GRANDE_2026_SLUG,
  GERAL_CONCURSO_SLUG,
} from '@/lib/concursos/catalogSlugs';
export { GERAL_CONCURSO_SLUG, CAMPINA_GRANDE_2026_SLUG } from '@/lib/concursos/catalogSlugs';
export { isActiveMatriculaRow } from '@/lib/concursos/matriculaActive';
import type {
  Concurso,
  ConcursoMatriculaOrigem,
  ConcursoMatriculaStatus,
  ConcursoModuloOrigem,
  ConcursoStatus,
  ConcursoTipo,
} from '@/types/database';
import { isActiveMatriculaRow } from '@/lib/concursos/matriculaActive';
import { filterModulosByVitrineQualityGate } from '@/lib/catalogMigration/vitrineQualityGate';

function moduloPermitidoNoVinculoConcurso(
  concursoSlug: string,
  banca: string | null | undefined,
): boolean {
  if (concursoSlug !== CAMPINA_GRANDE_2026_SLUG) return true;
  return (banca ?? '').toLowerCase().includes('idecan');
}

export type {
  Concurso,
  ConcursoMatriculaOrigem,
  ConcursoMatriculaStatus,
  ConcursoModuloOrigem,
  ConcursoStatus,
  ConcursoTipo,
};

export type ConcursoRow = Concurso;

export interface ConcursoMatriculaListRow {
  concurso_id: string;
  status: ConcursoMatriculaStatus | string;
  expires_at: string | null;
}

export interface ModuloEstudoListRow {
  id: string;
  modulo_slug: string;
  modulo_nome: string | null;
  titulo_aula: string | null;
  banca: string;
  created_at: string;
  avant_codigo: number | null;
}

/** Alinhado ao limite da vitrine admin e ao cache global de módulos. */
const ACCESSIBLE_MODULOS_LIMIT = SCALE_LIMITS.ACCESSIBLE_MODULOS;
/** PostgREST: páginas grandes de vínculos evitam resposta monolítica. */
const CONCURSO_MODULOS_PAGE_SIZE = 1000;
/** Fallback: consultas .in() muito grandes podem falhar. */
const MODULO_ID_LOOKUP_CHUNK = 80;
/** PostgREST: lotes de concurso_id em checagens pontuais. */
const CONCURSO_ID_LOOKUP_CHUNK = 80;

type ConcursoModuloWithModuloRow = {
  concurso_id: string;
  modulo_id: string;
  modulos_estudo: ModuloEstudoListRow | ModuloEstudoListRow[] | null;
};

type PendingModuloPorConcurso = { concursoId: string; moduloId: string };

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pickEmbeddedModulo(row: ConcursoModuloWithModuloRow): ModuloEstudoListRow | null {
  const embedded = row.modulos_estudo;
  if (!embedded) return null;
  if (Array.isArray(embedded)) return embedded[0] ?? null;
  return embedded;
}

function dedupeModulosById(modulos: Iterable<ModuloEstudoListRow>): ModuloEstudoListRow[] {
  const byId = new Map<string, ModuloEstudoListRow>();
  const bySlug = new Set<string>();

  for (const modulo of modulos) {
    if (!modulo?.id) continue;
    if (byId.has(modulo.id)) continue;
    if (modulo.modulo_slug && bySlug.has(modulo.modulo_slug)) continue;

    byId.set(modulo.id, modulo);
    if (modulo.modulo_slug) bySlug.add(modulo.modulo_slug);
  }

  return [...byId.values()];
}

function sortModulosByCreatedAtDesc(modulos: ModuloEstudoListRow[]): ModuloEstudoListRow[] {
  return [...modulos].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
}

function finalizeAccessibleModulos(modulos: ModuloEstudoListRow[]): ModuloEstudoListRow[] {
  const sorted = sortModulosByCreatedAtDesc(dedupeModulosById(modulos));
  const gated = filterModulosByVitrineQualityGate(sorted);
  return gated.slice(0, ACCESSIBLE_MODULOS_LIMIT);
}

function modulosToSlugSet(modulos: ModuloEstudoListRow[]): Set<string> {
  const slugs = new Set<string>();
  for (const modulo of modulos) {
    const slug = modulo.modulo_slug?.trim();
    if (slug) slugs.add(slug);
  }
  return slugs;
}

// isActiveMatriculaRow → lib/concursos/matriculaActive.ts

async function listMatriculaRowsForUser(userId: string): Promise<ConcursoMatriculaListRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_matriculas')
    .select('concurso_id, status, expires_at')
    .eq('user_id', userId);

  if (error) {
    logger.error('Falha ao listar matrículas do usuário', error, { userId });
    throw error;
  }

  return (data ?? []) as ConcursoMatriculaListRow[];
}

export async function getMatriculatedConcursoIds(userId: string): Promise<string[]> {
  const rows = await listMatriculaRowsForUser(userId);
  return rows.map((row) => row.concurso_id);
}

export async function getActiveMatriculatedConcursoIds(userId: string): Promise<string[]> {
  const rows = await listMatriculaRowsForUser(userId);
  return rows.filter(isActiveMatriculaRow).map((row) => row.concurso_id);
}

export async function userHasActiveMatricula(
  userId: string,
  concursoId?: string,
): Promise<boolean> {
  let activeIds = await getActiveMatriculatedConcursoIds(userId);

  if (concursoId) {
    if (activeIds.includes(concursoId)) return true;
  } else if (activeIds.length > 0) {
    return true;
  }

  const supabase = await createServerSupabase();
  const { syncLegacyCampinaAcessoToMatricula } = await import('@/lib/campina/fulfillment');
  const synced = await syncLegacyCampinaAcessoToMatricula(supabase, userId);
  if (!synced) return false;

  activeIds = await getActiveMatriculatedConcursoIds(userId);
  if (concursoId) return activeIds.includes(concursoId);
  return activeIds.length > 0;
}

export async function getMatriculatedConcursos(userId: string): Promise<ConcursoRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_matriculas')
    .select(
      'status, expires_at, concurso:concursos(id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, created_at)',
    )
    .eq('user_id', userId);

  if (error) {
    logger.error('Falha ao listar concursos matriculados', error, { userId });
    throw error;
  }

  const rows: ConcursoRow[] = [];
  for (const item of data ?? []) {
    if (!isActiveMatriculaRow(item)) continue;

    const concurso = item.concurso as ConcursoRow | ConcursoRow[] | null;
    if (Array.isArray(concurso)) {
      rows.push(...concurso);
    } else if (concurso) {
      rows.push(concurso);
    }
  }
  return rows;
}

export async function getConcursoBySlug(slug: string): Promise<ConcursoRow | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concursos')
    .select(
      'id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, price_cents, data_prova, created_at',
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar concurso por slug', error, { slug });
    throw error;
  }

  return (data as ConcursoRow | null) ?? null;
}

export async function getDefaultConcursoId(): Promise<string> {
  const geral = await getConcursoBySlug(GERAL_CONCURSO_SLUG);
  if (!geral) {
    throw new Error('Concurso Geral não encontrado. Execute a migração create_concursos.');
  }
  return geral.id;
}

export async function matricularUsuarioEmConcurso(
  userId: string,
  concursoId: string,
  origem: ConcursoMatriculaOrigem,
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('concurso_matriculas').upsert(
    {
      user_id: userId,
      concurso_id: concursoId,
      origem,
    },
    { onConflict: 'user_id,concurso_id', ignoreDuplicates: true },
  );

  if (error) {
    logger.error('Falha ao matricular usuário', error, { userId, concursoId, origem });
    throw error;
  }
}

function isPaidConcurso(concurso: ConcursoRow): boolean {
  // `geral`: price_cents é vitrine do AVANT Pro (Stripe); acesso free usa matrícula `cadastro`.
  if (concurso.slug === GERAL_CONCURSO_SLUG) return false;
  return (concurso.price_cents ?? 0) > 0;
}

async function userHasConfirmedPurchase(userId: string, concursoId: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('concurso_id', concursoId)
    .eq('status', 'paid')
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao verificar compra confirmada do concurso', error, { userId, concursoId });
    throw error;
  }

  return Boolean(data);
}

async function assertCadastroMatriculaAllowed(
  userId: string,
  concurso: ConcursoRow,
): Promise<void> {
  if (!isPaidConcurso(concurso)) return;

  const matriculaRows = await listMatriculaRowsForUser(userId);
  const alreadyEnrolled = matriculaRows.some(
    (row) => row.concurso_id === concurso.id && isActiveMatriculaRow(row),
  );

  const hasPurchase = alreadyEnrolled
    ? true
    : await userHasConfirmedPurchase(userId, concurso.id);

  if (!hasPurchase && !alreadyEnrolled) {
    throw new Error('Este concurso exige compra. Conclua o pagamento antes de se matricular.');
  }
}

/**
 * Reativa freemium em `geral` após expiração de trial por convite ou cadastro.
 * Não altera `stripe_pro` nem matrículas de edital.
 */
export async function reactivateGeralFreeMatricula(userId: string): Promise<boolean> {
  const geral = await getConcursoBySlug(GERAL_CONCURSO_SLUG);
  if (!geral) return false;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('concurso_matriculas')
    .select('origem, status, expires_at')
    .eq('user_id', userId)
    .eq('concurso_id', geral.id)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar matrícula geral para reativação free', error, { userId });
    throw error;
  }

  if (!data) return false;

  const isExpired =
    data.status === 'expirado' ||
    (data.expires_at && new Date(data.expires_at).getTime() <= Date.now());

  if (!isExpired) return false;
  if (data.origem !== 'invite' && data.origem !== 'cadastro') return false;

  const { error: updateError } = await supabase
    .from('concurso_matriculas')
    .update({
      origem: 'cadastro',
      status: 'ativo',
      expires_at: null,
    })
    .eq('user_id', userId)
    .eq('concurso_id', geral.id);

  if (updateError) {
    logger.error('Falha ao reativar matrícula geral free', updateError, { userId });
    throw updateError;
  }

  return true;
}

/**
 * Garante matrícula ativa no catálogo `geral` (tier free: 1 questão/dia).
 * Idempotente — não sobrescreve matrícula Pro (`stripe_pro`) existente.
 */
export async function ensureGeralCadastroMatricula(userId: string): Promise<ConcursoRow | null> {
  const geral = await getConcursoBySlug(GERAL_CONCURSO_SLUG);
  if (!geral || geral.status !== 'ativo') return null;

  const alreadyActive = await userHasActiveMatricula(userId, geral.id);
  if (alreadyActive) return geral;

  const reactivated = await reactivateGeralFreeMatricula(userId);
  if (reactivated) return geral;

  return matricularPorSlug(userId, GERAL_CONCURSO_SLUG, 'cadastro');
}

export async function matricularPorSlug(
  userId: string,
  concursoSlug: string | null | undefined,
  origem: ConcursoMatriculaOrigem = 'cadastro',
): Promise<ConcursoRow> {
  const slug = concursoSlug?.trim();
  if (!slug) {
    throw new Error('Slug do concurso é obrigatório.');
  }
  const concurso = await getConcursoBySlug(slug);
  if (!concurso) {
    throw new Error(`Concurso não encontrado: ${slug}`);
  }
  if (concurso.status !== 'ativo') {
    throw new Error('Concurso indisponível para matrícula.');
  }
  if (origem === 'cadastro') {
    await assertCadastroMatriculaAllowed(userId, concurso);
  }
  await matricularUsuarioEmConcurso(userId, concurso.id, origem);
  return concurso;
}

export async function linkModuloToConcurso(
  concursoId: string,
  moduloId: string,
  origem: ConcursoModuloOrigem = 'publicacao',
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('concurso_modulos').upsert(
    {
      concurso_id: concursoId,
      modulo_id: moduloId,
      origem,
    },
    { onConflict: 'concurso_id,modulo_id', ignoreDuplicates: true },
  );

  if (error) {
    logger.error('Falha ao vincular módulo ao concurso', error, { concursoId, moduloId, origem });
    throw error;
  }
}

async function fetchModulosEstudoByIdsChunked(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  moduloIds: string[],
  userId: string,
): Promise<ModuloEstudoListRow[]> {
  const byId = new Map<string, ModuloEstudoListRow>();

  for (const part of chunkArray(moduloIds, MODULO_ID_LOOKUP_CHUNK)) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo')
      .in('id', part);

    if (error) {
      logger.error('Falha ao carregar catálogo acessível', error, { userId, chunkSize: part.length });
      throw error;
    }

    for (const row of (data ?? []) as ModuloEstudoListRow[]) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

/** Filtros aplicáveis no PostgREST (`modulos_estudo!inner`) para navegação no player. */
export type AccessibleModulosNavSqlFilters = {
  banca?: string;
  titulo_aula?: string;
  bancas?: string[];
  titulo_aulas?: string[];
};

async function collectModulosFromMatriculatedConcursos(
  userId: string,
  concursoIds: string[],
  sqlFilters?: AccessibleModulosNavSqlFilters,
): Promise<ModuloEstudoListRow[]> {
  const supabase = await createServerSupabase();
  const collected: ModuloEstudoListRow[] = [];
  let offset = 0;

  const bancaFilter = sqlFilters?.banca?.trim();
  const bancasFilter = sqlFilters?.bancas?.map((b) => b.trim()).filter(Boolean) ?? [];
  const tituloAulaFilter = sqlFilters?.titulo_aula?.trim();
  const tituloAulasFilter = sqlFilters?.titulo_aulas?.map((t) => t.trim()).filter(Boolean) ?? [];
  const useInnerJoin = Boolean(
    bancaFilter || bancasFilter.length || tituloAulaFilter || tituloAulasFilter.length,
  );
  const modulosEmbed = useInnerJoin
    ? 'modulos_estudo!inner(id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo)'
    : 'modulos_estudo(id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo)';

  const slugByConcursoId = new Map<string, string>();
  if (concursoIds.length) {
    const { data: concursosRows, error: concursosError } = await supabase
      .from('concursos')
      .select('id, slug')
      .in('id', concursoIds);

    if (concursosError) {
      logger.error('Falha ao resolver slugs dos concursos matriculados', concursosError, { userId });
      throw concursosError;
    }

    for (const row of concursosRows ?? []) {
      const r = row as { id: string; slug: string };
      if (r?.id && r?.slug) slugByConcursoId.set(r.id, r.slug);
    }
  }

  while (true) {
    let query = supabase
      .from('concurso_modulos')
      .select(`concurso_id, modulo_id, ${modulosEmbed}`)
      .in('concurso_id', concursoIds)
      .order('modulo_id', { ascending: true })
      .range(offset, offset + CONCURSO_MODULOS_PAGE_SIZE - 1);

    if (bancasFilter.length > 1) query = query.in('modulos_estudo.banca', bancasFilter);
    else if (bancaFilter) query = query.eq('modulos_estudo.banca', bancaFilter);
    else if (bancasFilter.length === 1) query = query.eq('modulos_estudo.banca', bancasFilter[0]!);
    if (tituloAulasFilter.length > 1) {
      query = query.in('modulos_estudo.titulo_aula', tituloAulasFilter);
    } else if (tituloAulaFilter) {
      query = query.eq('modulos_estudo.titulo_aula', tituloAulaFilter);
    } else if (tituloAulasFilter.length === 1) {
      query = query.eq('modulos_estudo.titulo_aula', tituloAulasFilter[0]!);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Falha ao listar módulos por matrícula', error, { userId });
      throw error;
    }

    const links = (data ?? []) as ConcursoModuloWithModuloRow[];
    if (!links.length) break;

    const pending: PendingModuloPorConcurso[] = [];

    for (const link of links) {
      const concursoSlug = slugByConcursoId.get(link.concurso_id) ?? '';
      const modulo = pickEmbeddedModulo(link);
      if (modulo) {
        if (moduloPermitidoNoVinculoConcurso(concursoSlug, modulo.banca)) {
          collected.push(modulo);
        }
      } else if (link.modulo_id) {
        pending.push({ concursoId: link.concurso_id, moduloId: link.modulo_id });
      }
    }

    if (pending.length) {
      const uniqueIds = [...new Set(pending.map((p) => p.moduloId))];
      const fallback = await fetchModulosEstudoByIdsChunked(supabase, uniqueIds, userId);
      const byId = new Map(fallback.map((m) => [m.id, m]));

      for (const { concursoId, moduloId } of pending) {
        const modulo = byId.get(moduloId);
        if (!modulo) continue;
        const concursoSlug = slugByConcursoId.get(concursoId) ?? '';
        if (moduloPermitidoNoVinculoConcurso(concursoSlug, modulo.banca)) {
          collected.push(modulo);
        }
      }
    }

    if (links.length < CONCURSO_MODULOS_PAGE_SIZE) break;
    offset += CONCURSO_MODULOS_PAGE_SIZE;
  }

  return collected;
}

export async function getAccessibleModulosForUser(userId: string): Promise<ModuloEstudoListRow[]> {
  const concursoIds = await getActiveMatriculatedConcursoIds(userId);
  if (!concursoIds.length) return [];

  const collected = await collectModulosFromMatriculatedConcursos(userId, concursoIds);
  return finalizeAccessibleModulos(collected);
}

/**
 * Escopo de concursos para vitrine/navegação: pacote do edital matriculado quando existir;
 * caso contrário, todos os concursos com matrícula ativa.
 */
export async function resolveNavConcursoIds(userId: string): Promise<string[]> {
  const concursoIds = await getActiveMatriculatedConcursoIds(userId);
  if (!concursoIds.length) return [];

  const supabase = await createServerSupabase();
  const { data: concursosRows, error: concursosError } = await supabase
    .from('concursos')
    .select('id, tipo, slug')
    .in('id', concursoIds);

  if (concursosError) {
    logger.error('Falha ao resolver tipos dos concursos matriculados', concursosError, { userId });
    throw concursosError;
  }

  const edital = (concursosRows ?? []).find((c) => String((c as { tipo?: string }).tipo) === 'edital') as
    | { id: string }
    | undefined;

  if (edital?.id) return [edital.id];
  return concursoIds;
}

/**
 * Catálogo para vitrine e navegação no player alinhado à "turma exclusiva":
 * se o aluno tem matrícula em concurso tipo `edital`, mostra só módulos desse pacote
 * (não mistura com o catálogo `geral`). Sem edital ativo → mesmo conjunto que `getAccessibleModulosForUser`.
 */
export async function getAccessibleModulosForMatriculatedEditalPacote(
  userId: string,
): Promise<ModuloEstudoListRow[]> {
  const concursoIds = await resolveNavConcursoIds(userId);
  if (!concursoIds.length) return [];

  const collected = await collectModulosFromMatriculatedConcursos(userId, concursoIds);
  return finalizeAccessibleModulos(collected);
}

/**
 * Módulos acessíveis para navegação no player, com filtros SQL opcionais (banca / titulo_aula).
 * Evita carregar o catálogo inteiro da vitrine quando há filtros na URL.
 */
export async function fetchAccessibleModulosForNav(
  userId: string,
  sqlFilters?: AccessibleModulosNavSqlFilters,
): Promise<ModuloEstudoListRow[]> {
  const concursoIds = await resolveNavConcursoIds(userId);
  if (!concursoIds.length) return [];

  const collected = await collectModulosFromMatriculatedConcursos(userId, concursoIds, sqlFilters);
  return finalizeAccessibleModulos(collected);
}

async function isModuloLinkedToMatriculatedConcursos(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  moduloId: string,
  concursoIds: string[],
  userId: string,
  moduloSlugOrId: string,
): Promise<boolean> {
  for (const part of chunkArray(concursoIds, CONCURSO_ID_LOOKUP_CHUNK)) {
    const { data, error } = await supabase
      .from('concurso_modulos')
      .select('id')
      .eq('modulo_id', moduloId)
      .in('concurso_id', part)
      .limit(1);

    if (error) {
      logger.error('Falha ao checar entitlement do módulo', error, { userId, moduloSlugOrId });
      throw error;
    }

    if (data?.length) return true;
  }

  return false;
}

export async function userHasModuloAccess(
  userId: string,
  moduloSlugOrId: string,
  options?: { skipEntitlement?: boolean },
): Promise<boolean> {
  const supabase = await createServerSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    moduloSlugOrId,
  );

  const moduloQuery = supabase
    .from('modulos_estudo')
    .select('id')
    .limit(1);

  const { data: modulo, error: moduloError } = await (isUuid
    ? moduloQuery.eq('id', moduloSlugOrId)
    : moduloQuery.eq('modulo_slug', moduloSlugOrId)
  ).maybeSingle();

  if (moduloError) {
    logger.error('Falha ao resolver módulo para entitlement', moduloError, { moduloSlugOrId });
    throw moduloError;
  }
  if (!modulo) return false;

  if (options?.skipEntitlement) return true;

  const concursoIds = await getActiveMatriculatedConcursoIds(userId);
  if (!concursoIds.length) return false;

  return isModuloLinkedToMatriculatedConcursos(
    supabase,
    modulo.id,
    concursoIds,
    userId,
    moduloSlugOrId,
  );
}

export async function getAccessibleModuloSlugs(userId: string): Promise<Set<string>> {
  const concursoIds = await getActiveMatriculatedConcursoIds(userId);
  if (!concursoIds.length) return new Set();

  const collected = await collectModulosFromMatriculatedConcursos(userId, concursoIds);
  return modulosToSlugSet(finalizeAccessibleModulos(collected));
}

export interface ConcursoRegraFiltro {
  banca: string;
  orgao?: string;
  ano?: number;
}

function metaMatchesRegra(meta: unknown, filters: ConcursoRegraFiltro): boolean {
  if (!filters.orgao && filters.ano == null) return true;
  if (!meta || typeof meta !== 'object') return false;

  const record = meta as Record<string, unknown>;
  if (filters.orgao) {
    const orgao = String(record.orgao ?? '').trim().toLowerCase();
    if (orgao !== filters.orgao.trim().toLowerCase()) return false;
  }

  if (filters.ano != null) {
    const ano = typeof record.ano === 'number' ? record.ano : Number(record.ano);
    if (Number.isNaN(ano) || ano !== filters.ano) return false;
  }

  return true;
}

export async function linkModulosPorRegra(
  concursoId: string,
  filters: ConcursoRegraFiltro,
): Promise<number> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('id, conteudo_json')
    .ilike('banca', filters.banca.trim());

  if (error) {
    logger.error('Falha ao buscar módulos para regra de concurso', error, { concursoId, filters });
    throw error;
  }

  const moduloIds = (data ?? [])
    .filter((row) =>
      metaMatchesRegra(
        (row as { conteudo_json?: { meta?: unknown } }).conteudo_json?.meta,
        filters,
      ),
    )
    .map((row) => row.id);

  for (const moduloId of moduloIds) {
    await linkModuloToConcurso(concursoId, moduloId, 'regra');
  }

  return moduloIds.length;
}

export async function unlinkModuloFromConcurso(concursoId: string, moduloId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('concurso_modulos')
    .delete()
    .eq('concurso_id', concursoId)
    .eq('modulo_id', moduloId);

  if (error) {
    logger.error('Falha ao desvincular módulo do concurso', error, { concursoId, moduloId });
    throw error;
  }
}
