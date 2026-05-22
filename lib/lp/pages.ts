import type { LPConcursoConfig } from '@/app/_components/LPConcurso';
import { LpPageConfigSchema, LpPageSeoSchema } from '@/lib/validations';
import { createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { LpPage, LpPageStatus, LpTemplate } from '@/types/database';

export type LpPageSeo = {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
};

export type LpPageWithTemplate = LpPage & {
  lp_templates?: Pick<LpTemplate, 'id' | 'slug' | 'nome' | 'default_config'> | null;
};

function parseConfig(raw: unknown): LPConcursoConfig | null {
  const parsed = LpPageConfigSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseSeo(raw: unknown): LpPageSeo | null {
  const parsed = LpPageSeoSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Merge superficial: defaults do template sobrescritos pelo config da página. */
export function mergeTemplateDefaults(
  templateDefaults: Record<string, unknown> | null | undefined,
  pageConfig: LPConcursoConfig,
): LPConcursoConfig {
  const defaults = (templateDefaults ?? {}) as Partial<LPConcursoConfig>;
  return {
    ...defaults,
    ...pageConfig,
    concurso: { ...defaults.concurso, ...pageConfig.concurso },
    copy: { ...defaults.copy, ...pageConfig.copy },
    walkthrough: pageConfig.walkthrough,
    oferta: pageConfig.oferta ?? defaults.oferta,
  };
}

export function resolveLpConcursoConfig(page: LpPageWithTemplate): LPConcursoConfig | null {
  const config = parseConfig(page.config);
  if (!config) return null;
  const templateDefaults = page.lp_templates?.default_config;
  return mergeTemplateDefaults(templateDefaults, config);
}

export function resolveLpSeo(page: LpPage, publicPath: string): LpPageSeo | null {
  const seo = parseSeo(page.seo);
  if (!seo) return null;
  return {
    ...seo,
    canonical: seo.canonical ?? `/lp/${publicPath}`,
  };
}

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
  return (data as LpPageWithTemplate | null) ?? null;
}

export type LpCatalogItem = {
  path: string;
  internalName: string;
  cidade: string;
  banca: string;
  orgao: string;
  cargo: string;
  dataProvaFormatada: string;
  statusInscricoes: string;
  headline: string;
  publishedAt: string | null;
};

/** Vitrine pública em `/planos` — só LPs ativas. */
export async function listPublishedLpPagesForCatalog(): Promise<LpCatalogItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lp_pages')
    .select('path, internal_name, config, published_at')
    .eq('status', 'ativo')
    .order('published_at', { ascending: false });

  if (error) {
    logger.error('Falha ao listar LPs para vitrine', error);
    return [];
  }

  const items: LpCatalogItem[] = [];
  for (const row of data ?? []) {
    const config = parseConfig(row.config);
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
  return (data as LpPageWithTemplate[]) ?? [];
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
  return (data as LpPageWithTemplate | null) ?? null;
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

export function lpPublicHref(path: string): string {
  return `/lp/${path.trim().toLowerCase()}`;
}

export async function revalidateLpPage(path: string): Promise<void> {
  const { revalidatePath } = await import('next/cache');
  const normalized = path.trim().toLowerCase();
  revalidatePath(`/lp/${normalized}`);
  revalidatePath('/lp/[path]', 'page');
  revalidatePath('/planos');
}
