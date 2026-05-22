import type { LPConcursoConfig } from '@/app/_components/LPConcurso';
import { LpPageConfigSchema, LpPageSeoSchema } from '@/lib/validations';
import type { LpPage, LpTemplate } from '@/types/database';

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

export function parseLpPageConfig(raw: unknown): LPConcursoConfig | null {
  const parsed = LpPageConfigSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function parseLpPageSeo(raw: unknown): LpPageSeo | null {
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
  const config = parseLpPageConfig(page.config);
  if (!config) return null;
  const templateDefaults = page.lp_templates?.default_config;
  return mergeTemplateDefaults(templateDefaults, config);
}

export function resolveLpSeo(page: LpPage, publicPath: string): LpPageSeo | null {
  const seo = parseLpPageSeo(page.seo);
  if (!seo) return null;
  return {
    ...seo,
    canonical: seo.canonical ?? `/lp/${publicPath}`,
  };
}

export function lpPublicHref(path: string): string {
  return `/lp/${path.trim().toLowerCase()}`;
}
