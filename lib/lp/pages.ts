import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { LpTemplate } from '@/types/database';
import { AVANT_PRO_LP_PATH } from '@/lib/pro/constants';
import {
  type LpCatalogItem,
  type LpPageWithTemplate,
  parseLpPageConfig,
} from '@/lib/lp/shared';

export type { LpCatalogItem, LpPageSeo, LpPageWithTemplate } from '@/lib/lp/shared';
export {
  mergeTemplateDefaults,
  resolveLpConcursoConfig,
  resolveLpSeo,
  lpPublicHref,
} from '@/lib/lp/shared';

const LP_PAGE_PUBLIC_SELECT =
  'id, path, template_id, status, internal_name, config, seo, utm_campaign, published_at, created_at, updated_at, lp_templates(id, slug, nome, default_config)';

export async function getPublishedLpPageByPath(path: string): Promise<LpPageWithTemplate | null> {
  const normalized = path.trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lp_pages')
    .select(LP_PAGE_PUBLIC_SELECT)
    .eq('path', normalized)
    .eq('status', 'ativo')
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar LP publicada', error, { path: normalized });
    throw error;
  }
  return (data as unknown as LpPageWithTemplate | null) ?? null;
}

/** Vitrine pública em `/planos` — só LPs ativas. */
export async function listPublishedLpPagesForCatalog(): Promise<LpCatalogItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lp_pages')
    .select('path, internal_name, config, published_at')
    .eq('status', 'ativo')
    .neq('path', AVANT_PRO_LP_PATH)
    .order('published_at', { ascending: false });

  if (error) {
    logger.error('Falha ao listar LPs para vitrine', error);
    return [];
  }

  const items: LpCatalogItem[] = [];
  for (const row of data ?? []) {
    const config = parseLpPageConfig(row.config);
    if (!config) continue;
    items.push({
      path: row.path as string,
      internalName: row.internal_name as string,
      cidade: config.concurso.cidade,
      banca: config.concurso.banca,
      orgao: config.concurso.orgao,
      cargo: config.concurso.cargo,
      dataProvaFormatada: config.concurso.dataProvaFormatada,
      statusInscricoes: config.concurso.statusInscricoes,
      headline: config.copy.headlinePrincipal,
      publishedAt: (row.published_at as string | null) ?? null,
    });
  }
  return items;
}

export async function listPublishedLpPaths(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lp_pages')
    .select('path')
    .eq('status', 'ativo');

  if (error) {
    logger.error('Falha ao listar paths de LP', error);
    return [];
  }
  return (data ?? []).map((r) => r.path as string);
}

export async function listLpPagesForAdmin(): Promise<LpPageWithTemplate[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('lp_pages')
    .select(LP_PAGE_PUBLIC_SELECT)
    .order('updated_at', { ascending: false });

  if (error) {
    logger.error('Falha ao listar LPs (admin)', error);
    throw error;
  }
  return (data as unknown as LpPageWithTemplate[]) ?? [];
}

export async function getLpPageByIdForAdmin(id: string): Promise<LpPageWithTemplate | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('lp_pages')
    .select(LP_PAGE_PUBLIC_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar LP (admin)', error, { id });
    throw error;
  }
  return (data as unknown as LpPageWithTemplate | null) ?? null;
}

export async function listLpTemplatesForAdmin(): Promise<LpTemplate[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('lp_templates')
    .select('id, slug, nome, default_config, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Falha ao listar templates LP', error);
    throw error;
  }
  return (data as LpTemplate[]) ?? [];
}

export async function revalidateLpPage(path: string): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  const normalized = path.trim().toLowerCase();
  revalidatePath(`/lp/${normalized}`);
  revalidatePath('/lp/[path]', 'page');
  revalidatePath('/planos');
}
