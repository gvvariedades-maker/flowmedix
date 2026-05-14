import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type {
  Concurso,
  ConcursoMatriculaOrigem,
  ConcursoMatriculaStatus,
  ConcursoModuloOrigem,
  ConcursoStatus,
  ConcursoTipo,
} from '@/types/database';

export const GERAL_CONCURSO_SLUG = 'geral';

/** Pacote pago alinhado à banca IDECAN; vínculos errados não entram no catálogo do aluno. */
export const CAMPINA_GRANDE_2026_SLUG = 'campina-grande-2026';

/** Landing de vendas (checkout via `STRIPE_PRICE_ID_CAMPINA`); não usar `/concursos/.../comprar`. */
export const CAMPINA_GRANDE_LANDING_HREF = '/campina-grande';

/** Preço de venda em centavos (BRL). Deve coincidir com `concursos.price_cents` e com o Price no Stripe. */
export const CAMPINA_GRANDE_2026_PRICE_CENTS = 3700;

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
const ACCESSIBLE_MODULOS_LIMIT = 5000;
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
  return sortModulosByCreatedAtDesc(dedupeModulosById(modulos)).slice(0, ACCESSIBLE_MODULOS_LIMIT);
}

function modulosToSlugSet(modulos: ModuloEstudoListRow[]): Set<string> {
  const slugs = new Set<string>();
  for (const modulo of modulos) {
    const slug = modulo.modulo_slug?.trim();
    if (slug) slugs.add(slug);
  }
  return slugs;
}

export function isActiveMatriculaRow(matricula: {
  status?: string | null;
  expires_at?: string | null;
}): boolean {
  if (matricula.status && matricula.status !== 'ativo') return false;
  if (!matricula.expires_at) return true;
  return new Date(matricula.expires_at).getTime() > Date.now();
}

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
  const activeIds = await getActiveMatriculatedConcursoIds(userId);
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

  const [hasPurchase, alreadyEnrolled] = await Promise.all([
    userHasConfirmedPurchase(userId, concurso.id),
    userHasActiveMatricula(userId, concurso.id),
  ]);

  if (!hasPurchase && !alreadyEnrolled) {
    throw new Error('Este concurso exige compra. Conclua o pagamento antes de se matricular.');
  }
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

async function collectModulosFromMatriculatedConcursos(
  userId: string,
  concursoIds: string[],
): Promise<ModuloEstudoListRow[]> {
  const supabase = await createServerSupabase();
  const collected: ModuloEstudoListRow[] = [];
  let offset = 0;

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
    const { data, error } = await supabase
      .from('concurso_modulos')
      .select(
        'concurso_id, modulo_id, modulos_estudo(id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo)',
      )
      .in('concurso_id', concursoIds)
      .order('modulo_id', { ascending: true })
      .range(offset, offset + CONCURSO_MODULOS_PAGE_SIZE - 1);

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
 * Catálogo para vitrine e navegação no player alinhado à "turma exclusiva":
 * se o aluno tem matrícula em concurso tipo `edital`, mostra só módulos desse pacote
 * (não mistura com o catálogo `geral`). Sem edital ativo → mesmo conjunto que `getAccessibleModulosForUser`.
 */
export async function getAccessibleModulosForMatriculatedEditalPacote(
  userId: string,
): Promise<ModuloEstudoListRow[]> {
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

  if (!edital?.id) {
    return getAccessibleModulosForUser(userId);
  }

  const collected = await collectModulosFromMatriculatedConcursos(userId, [edital.id]);
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
