import { z } from 'zod';

export const EmailTemplateContentSchema = z.object({
  headline: z.string().trim().min(1).max(300),
  paragraph1: z.string().trim().min(1).max(2000),
  paragraph2: z.string().trim().max(2000).optional().default(''),
  ctaLabel: z.string().trim().max(80).optional().default(''),
  ctaUrl: z.string().trim().max(500).optional().default(''),
});

export type EmailTemplateContent = z.infer<typeof EmailTemplateContentSchema>;

export const DEFAULT_WELCOME_CONTENT: EmailTemplateContent = {
  headline: 'Olá, {{firstName}}!',
  paragraph1:
    'Bem-vindo ao Avant. Cada questão vira um NeuroSlide — estudo reverso visual que fixa o raciocínio clínico em poucos minutos.',
  paragraph2:
    'Mapas, regras de ouro e fluxos de decisão na ordem certa para a sua banca — sem reler PDF inteiro.',
  ctaLabel: 'Ir para o dashboard',
  ctaUrl: '/dashboard',
};

export const DEFAULT_MARKETING_CONTENT: EmailTemplateContent = {
  headline: 'Olá!',
  paragraph1: 'Temos novidades no AVANT para acelerar sua preparação em Técnico de Enfermagem.',
  paragraph2: 'Abra o app e confira os concursos e o estudo reverso com NeuroSlides.',
  ctaLabel: 'Ver concursos abertos',
  ctaUrl: '/planos',
};

export function resolveEmailCtaUrl(pathOrUrl: string | undefined): string {
  const raw = (pathOrUrl ?? '').trim();
  if (!raw) {
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '');
    return base ? `${base}/planos` : '/planos';
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return base ? `${base}${path}` : path;
}

/** Substitui {{firstName}} no texto (boas-vindas). */
export function applyFirstNamePlaceholders(text: string, firstName: string): string {
  const name = firstName.trim() || 'estudante';
  return text.replace(/\{\{\s*firstName\s*\}\}/gi, name);
}

export function mergeEmailContent(
  stored: unknown,
  fallback: EmailTemplateContent,
): EmailTemplateContent {
  const parsed = EmailTemplateContentSchema.safeParse(stored);
  if (parsed.success) return parsed.data;
  return fallback;
}
