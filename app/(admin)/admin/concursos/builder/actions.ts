'use server';

import { z } from 'zod';
import { getAdminEmail } from '@/lib/constants';
import { linkModuloToConcurso } from '@/lib/concursos/entitlements';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';
import { getServerSession } from '@/lib/supabase/server-auth';
import type { Concurso, ConcursoModuloOrigem } from '@/types/database';
import {
  ConcursoAdminUpsertSchema,
  ConcursoModuloLinkSchema,
  ConcursoRegraModulosSchema,
  type ConcursoAdminUpsertInput,
} from '@/lib/validations';
import { linkModulosPorRegra } from '@/lib/concursos/entitlements';
import { invalidateAdminConcursosCache, invalidateModulosCache } from '@/lib/cache';

const CONCURSO_ADMIN_SELECT =
  'id, slug, nome, cidade, orgao, banca, ano, cargo, tipo, status, price_cents, data_prova, descricao, destaque, created_at';

const ConcursoIdOnlySchema = z.object({
  concursoId: z.string().uuid('ID do concurso inválido'),
});

const ConcursoAdminUpdateSchema = z
  .object({
    concursoId: z.string().uuid('ID do concurso inválido'),
  })
  .merge(ConcursoAdminUpsertSchema.omit({ slug: true }).partial())
  .superRefine((data, ctx) => {
    const { concursoId: _id, ...rest } = data;
    const hasField = Object.values(rest).some((v) => v !== undefined);
    if (!hasField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe ao menos um campo para atualizar.',
      });
    }
  });

const SearchModulosSchema = z.object({
  q: z.string().trim().min(1, 'Digite um termo de busca').max(200),
});

const UnlinkModuloSchema = z.object({
  concursoId: z.string().uuid('ID do concurso inválido'),
  moduloId: z.string().uuid('ID do módulo inválido'),
});

const LinkModuloSchema = z
  .object({
    concursoId: z.string().uuid('ID do concurso inválido'),
  })
  .merge(ConcursoModuloLinkSchema);

const ApplyModulosRegraSchema = z
  .object({
    concursoId: z.string().uuid('ID do concurso inválido'),
  })
  .merge(ConcursoRegraModulosSchema);

export type CreateConcursoResult =
  | { ok: true; concurso: Concurso }
  | { ok: false; error: string; details?: unknown };

export type UpdateConcursoResult =
  | { ok: true; concurso: Concurso }
  | { ok: false; error: string; details?: unknown };

export type SearchModulosResult =
  | { ok: true; modulos: ModuloEstudoListRow[] }
  | { ok: false; error: string; details?: unknown };

export type LinkModuloResult = { ok: true } | { ok: false; error: string; details?: unknown };

export type UnlinkModuloResult = { ok: true } | { ok: false; error: string; details?: unknown };

export type PublishConcursoResult = { ok: true } | { ok: false; error: string; details?: unknown };

export type ApplyModulosRegraResult =
  | { ok: true; linkedCount: number }
  | { ok: false; error: string; details?: unknown };

export type LoadConcursoComModulosResult =
  | {
      ok: true;
      concurso: Concurso;
      vinculos: Array<{
        origem: ConcursoModuloOrigem;
        modulo: ModuloEstudoListRow;
      }>;
    }
  | { ok: false; error: string; details?: unknown };

async function requireAdmin(): Promise<
  { ok: true; admin: Awaited<ReturnType<typeof createServerSupabase>> } | { ok: false; error: string }
> {
  const session = await getServerSession();
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== getAdminEmail()) {
    return { ok: false, error: 'Acesso negado' };
  }
  try {
    const admin = await createServerSupabase();
    return { ok: true, admin };
  } catch (error) {
    logger.error('Builder admin: createServerSupabase', error);
    return { ok: false, error: 'Serviço indisponível' };
  }
}

function pickEmbeddedModulo(
  row: { modulos_estudo: ModuloEstudoListRow | ModuloEstudoListRow[] | null },
): ModuloEstudoListRow | null {
  const embedded = row.modulos_estudo;
  if (!embedded) return null;
  if (Array.isArray(embedded)) return embedded[0] ?? null;
  return embedded;
}

function toConcursoInsertRow(data: ConcursoAdminUpsertInput) {
  return {
    ...data,
    status: 'rascunho' as const,
  };
}

/** Cria concurso no builder; ignora `status` do payload e grava sempre como rascunho. */
export async function createConcurso(input: unknown): Promise<CreateConcursoResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ConcursoAdminUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const row = toConcursoInsertRow(parsed.data);

  try {
    const { data, error } = await auth.admin.from('concursos').insert(row).select(CONCURSO_ADMIN_SELECT).single();

    if (error) {
      logger.error('createConcurso: falha ao inserir', error, { slug: row.slug });
      return { ok: false, error: error.message };
    }

    await invalidateAdminConcursosCache();
    return { ok: true, concurso: data as Concurso };
  } catch (error) {
    logger.error('createConcurso: exceção', error);
    return { ok: false, error: 'Erro ao criar concurso' };
  }
}

/** Atualiza metadados; `slug` não pode ser alterado por este payload. */
export async function updateConcurso(input: unknown): Promise<UpdateConcursoResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ConcursoAdminUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId, ...fields } = parsed.data;
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) patch[k] = v;
  }

  try {
    const { data, error } = await auth.admin
      .from('concursos')
      .update(patch)
      .eq('id', concursoId)
      .select(CONCURSO_ADMIN_SELECT)
      .single();

    if (error) {
      logger.error('updateConcurso', error, { concursoId });
      return { ok: false, error: error.message };
    }

    await invalidateAdminConcursosCache();
    return { ok: true, concurso: data as Concurso };
  } catch (error) {
    logger.error('updateConcurso: exceção', error);
    return { ok: false, error: 'Erro ao atualizar concurso' };
  }
}

/** Busca módulos de estudo pelo catálogo (título, slug, banca, nome do módulo). */
export async function searchModulos(input: unknown): Promise<SearchModulosResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = SearchModulosSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const raw = parsed.data.q;
  const term = raw.replace(/[%'",]/g, '').trim().slice(0, 120);
  if (!term) {
    return { ok: false, error: 'Termo de busca vazio após sanitização' };
  }

  const pattern = `%${term}%`;

  try {
    const { data, error } = await auth.admin
      .from('modulos_estudo')
      .select('id, modulo_slug, modulo_nome, titulo_aula, banca, created_at, avant_codigo')
      .or(
        `titulo_aula.ilike.${pattern},modulo_nome.ilike.${pattern},banca.ilike.${pattern},modulo_slug.ilike.${pattern}`,
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('searchModulos', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, modulos: (data ?? []) as ModuloEstudoListRow[] };
  } catch (error) {
    logger.error('searchModulos: exceção', error);
    return { ok: false, error: 'Erro na busca de módulos' };
  }
}

export async function linkModulo(input: unknown): Promise<LinkModuloResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = LinkModuloSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId, moduloId, origem } = parsed.data;

  try {
    await linkModuloToConcurso(concursoId, moduloId, origem);
    await invalidateModulosCache();
    await invalidateAdminConcursosCache();
    return { ok: true };
  } catch (error) {
    logger.error('linkModulo', error, { concursoId, moduloId });
    return { ok: false, error: error instanceof Error ? error.message : 'Erro ao vincular módulo' };
  }
}

/** Vincula em lote por banca (e opcionalmente órgão/ano no meta da questão). */
export async function applyModulosRegra(input: unknown): Promise<ApplyModulosRegraResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ApplyModulosRegraSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId, ...filters } = parsed.data;

  try {
    const linkedCount = await linkModulosPorRegra(concursoId, filters);
    await invalidateModulosCache();
    await invalidateAdminConcursosCache();
    return { ok: true, linkedCount };
  } catch (error) {
    logger.error('applyModulosRegra', error, { concursoId, filters });
    return { ok: false, error: error instanceof Error ? error.message : 'Erro ao aplicar regra' };
  }
}

export async function unlinkModulo(input: unknown): Promise<UnlinkModuloResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = UnlinkModuloSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId, moduloId } = parsed.data;

  try {
    const { error } = await auth.admin
      .from('concurso_modulos')
      .delete()
      .eq('concurso_id', concursoId)
      .eq('modulo_id', moduloId);

    if (error) {
      logger.error('unlinkModulo', error, { concursoId, moduloId });
      return { ok: false, error: error.message };
    }

    await invalidateModulosCache();
    await invalidateAdminConcursosCache();
    return { ok: true };
  } catch (error) {
    logger.error('unlinkModulo: exceção', error);
    return { ok: false, error: 'Erro ao desvincular módulo' };
  }
}

export async function publishConcurso(input: unknown): Promise<PublishConcursoResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ConcursoIdOnlySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId } = parsed.data;

  try {
    const { error } = await auth.admin.from('concursos').update({ status: 'ativo' }).eq('id', concursoId);

    if (error) {
      logger.error('publishConcurso', error, { concursoId });
      return { ok: false, error: error.message };
    }

    await invalidateAdminConcursosCache();
    return { ok: true };
  } catch (error) {
    logger.error('publishConcurso: exceção', error);
    return { ok: false, error: 'Erro ao publicar concurso' };
  }
}

export async function unpublishConcurso(input: unknown): Promise<PublishConcursoResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ConcursoIdOnlySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId } = parsed.data;

  try {
    const { error } = await auth.admin.from('concursos').update({ status: 'rascunho' }).eq('id', concursoId);

    if (error) {
      logger.error('unpublishConcurso', error, { concursoId });
      return { ok: false, error: error.message };
    }

    await invalidateAdminConcursosCache();
    return { ok: true };
  } catch (error) {
    logger.error('unpublishConcurso: exceção', error);
    return { ok: false, error: 'Erro ao despublicar concurso' };
  }
}

export async function loadConcursoComModulos(input: unknown): Promise<LoadConcursoComModulosResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = ConcursoIdOnlySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos', details: parsed.error.issues };
  }

  const { concursoId } = parsed.data;

  try {
    const { data, error } = await auth.admin
      .from('concursos')
      .select(
        `
        ${CONCURSO_ADMIN_SELECT},
        concurso_modulos (
          origem,
          modulos_estudo (
            id,
            modulo_slug,
            modulo_nome,
            titulo_aula,
            banca,
            created_at,
            avant_codigo
          )
        )
      `.replace(/\s+/g, ' '),
      )
      .eq('id', concursoId)
      .single();

    if (error) {
      logger.error('loadConcursoComModulos', error, { concursoId });
      return { ok: false, error: error.message };
    }

    const row = data as unknown as Concurso & {
      concurso_modulos: Array<{
        origem: ConcursoModuloOrigem;
        modulos_estudo: ModuloEstudoListRow | ModuloEstudoListRow[] | null;
      }> | null;
    };

    const { concurso_modulos: links, ...concursoRest } = row;
    const vinculos: Array<{ origem: ConcursoModuloOrigem; modulo: ModuloEstudoListRow }> = [];

    for (const link of links ?? []) {
      const modulo = pickEmbeddedModulo(link);
      if (modulo) {
        vinculos.push({ origem: link.origem, modulo });
      }
    }

    return { ok: true, concurso: concursoRest as Concurso, vinculos };
  } catch (error) {
    logger.error('loadConcursoComModulos: exceção', error);
    return { ok: false, error: 'Erro ao carregar concurso' };
  }
}

/** `form action` para publicar a partir de `<input name="concursoId" />`. */
export async function publishConcursoForm(formData: FormData): Promise<void> {
  const id = formData.get('concursoId');
  await publishConcurso({ concursoId: typeof id === 'string' ? id : '' });
}

/** `form action` para despublicar a partir de `<input name="concursoId" />`. */
export async function unpublishConcursoForm(formData: FormData): Promise<void> {
  const id = formData.get('concursoId');
  await unpublishConcurso({ concursoId: typeof id === 'string' ? id : '' });
}
