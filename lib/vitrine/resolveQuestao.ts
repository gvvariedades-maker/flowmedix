import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import type { AccessibleModulosNavSqlFilters } from '@/lib/concursos/entitlements';
import { getModulosEstudoCached } from '@/lib/cache';
import { compareModuloCurriculum } from '@/lib/vitrineOrder';
import { parseQuestaoAlvo, type QuestaoAlvoParsed } from '@/lib/vitrine/parseQuestaoAlvo';
import type { ModuloEstudoRow } from '@/lib/vitrineFilters';
import { SCALE_LIMITS } from '@/lib/scale/constants';
import { logger } from '@/lib/logger';

export type ResolveQuestaoInAssuntoParams = {
  userId: string;
  assunto: string;
  alvo: string;
  bancas?: string[];
  isAdmin?: boolean;
};

export type ResolveQuestaoInAssuntoResult = {
  slug: string;
  numero: number;
  totalQuestoes: number;
  avant_codigo: number | null;
};

export class ResolveQuestaoNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResolveQuestaoNotFoundError';
  }
}

export class ResolveQuestaoInvalidAlvoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResolveQuestaoInvalidAlvoError';
  }
}

function sortModulosInAssunto(modulos: ModuloEstudoRow[]): ModuloEstudoRow[] {
  return [...modulos].sort((a, b) =>
    compareModuloCurriculum(
      {
        created_at: a.created_at,
        avant_codigo: a.avant_codigo,
        modulo_slug: a.modulo_slug,
      },
      {
        created_at: b.created_at,
        avant_codigo: b.avant_codigo,
        modulo_slug: b.modulo_slug,
      },
    ),
  );
}

async function loadModulosForAssuntoResolve(
  userId: string,
  assunto: string,
  bancas: string[] | undefined,
  isAdmin: boolean,
): Promise<ModuloEstudoRow[]> {
  const sqlFilters: AccessibleModulosNavSqlFilters = { titulo_aula: assunto };
  if (bancas?.length === 1) sqlFilters.banca = bancas[0];
  else if (bancas && bancas.length > 1) sqlFilters.bancas = bancas;

  if (isAdmin) {
    const { createServerSupabase } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabase();
    let query = supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo')
      .eq('titulo_aula', assunto)
      .order('created_at', { ascending: true })
      .limit(SCALE_LIMITS.VITRINE_MODULOS);

    if (bancas?.length === 1) query = query.eq('banca', bancas[0]);
    else if (bancas && bancas.length > 1) query = query.in('banca', bancas);

    const { data, error } = await query;
    if (error) {
      logger.error('resolveQuestao: falha admin ao carregar módulos', error, { assunto });
      const all = (await getModulosEstudoCached()) as ModuloEstudoRow[];
      return all.filter((m) => (m.titulo_aula ?? '') === assunto);
    }
    return (data ?? []) as ModuloEstudoRow[];
  }

  return (await fetchAccessibleModulosForNav(userId, sqlFilters)) as ModuloEstudoRow[];
}

function findInSortedList(
  sorted: ModuloEstudoRow[],
  parsed: QuestaoAlvoParsed,
): ModuloEstudoRow | null {
  if (parsed.kind === 'codigo') {
    return sorted.find((m) => m.avant_codigo === parsed.value) ?? null;
  }
  const index = parsed.value - 1;
  if (index < 0 || index >= sorted.length) return null;
  return sorted[index] ?? null;
}

export async function resolveQuestaoInAssunto(
  params: ResolveQuestaoInAssuntoParams,
): Promise<ResolveQuestaoInAssuntoResult> {
  const assunto = params.assunto.trim();
  if (!assunto) {
    throw new ResolveQuestaoInvalidAlvoError('Assunto inválido');
  }

  const parsed = parseQuestaoAlvo(params.alvo);
  if (!parsed) {
    throw new ResolveQuestaoInvalidAlvoError(
      'Informe o número da questão (ex.: 847) ou o código Q-1234',
    );
  }

  const modulos = await loadModulosForAssuntoResolve(
    params.userId,
    assunto,
    params.bancas,
    params.isAdmin ?? false,
  );

  const sorted = sortModulosInAssunto(modulos);
  if (sorted.length === 0) {
    throw new ResolveQuestaoNotFoundError('Nenhuma questão encontrada neste assunto');
  }

  const match = findInSortedList(sorted, parsed);
  if (!match) {
    if (parsed.kind === 'numero') {
      throw new ResolveQuestaoNotFoundError(
        `Questão ${parsed.value} não existe neste assunto (total: ${sorted.length})`,
      );
    }
    throw new ResolveQuestaoNotFoundError(`Código Q-${parsed.value} não encontrado neste assunto`);
  }

  const numero = sorted.findIndex((m) => m.modulo_slug === match.modulo_slug) + 1;

  return {
    slug: match.modulo_slug,
    numero,
    totalQuestoes: sorted.length,
    avant_codigo: match.avant_codigo,
  };
}
