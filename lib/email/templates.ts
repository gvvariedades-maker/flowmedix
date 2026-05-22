import 'server-only';

import { createElement } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import { EditableMessageEmail } from '@/emails/editable-message';
import {
  applyFirstNamePlaceholders,
  DEFAULT_MARKETING_CONTENT,
  DEFAULT_WELCOME_CONTENT,
  EmailTemplateContentSchema,
  mergeEmailContent,
  type EmailTemplateContent,
} from '@/lib/email/templateContent';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';

export type EmailTemplateKind = 'transactional' | 'marketing';

export type EmailTemplateRow = {
  slug: string;
  kind: EmailTemplateKind;
  name: string;
  subject: string;
  preview_text: string;
  content: EmailTemplateContent;
  updated_at: string;
};

function defaultContentForSlug(slug: string): EmailTemplateContent {
  if (slug === 'welcome') return DEFAULT_WELCOME_CONTENT;
  return DEFAULT_MARKETING_CONTENT;
}

function rowToTemplate(row: Record<string, unknown>): EmailTemplateRow {
  const slug = row.slug as string;
  return {
    slug,
    kind: row.kind as EmailTemplateKind,
    name: row.name as string,
    subject: row.subject as string,
    preview_text: (row.preview_text as string) ?? '',
    content: mergeEmailContent(row.content, defaultContentForSlug(slug)),
    updated_at: row.updated_at as string,
  };
}

export async function listEmailTemplates(
  supabase?: SupabaseClient,
): Promise<EmailTemplateRow[]> {
  const client = supabase ?? (await createServerSupabase());
  const { data, error } = await client
    .from('email_templates')
    .select('slug, kind, name, subject, preview_text, content, updated_at')
    .order('kind', { ascending: true })
    .order('slug', { ascending: true });

  if (error) {
    logger.error('listEmailTemplates', error);
    throw error;
  }
  return (data ?? []).map((r) => rowToTemplate(r as Record<string, unknown>));
}

export async function getEmailTemplateBySlug(
  slug: string,
  supabase?: SupabaseClient,
): Promise<EmailTemplateRow | null> {
  const client = supabase ?? (await createServerSupabase());
  const { data, error } = await client
    .from('email_templates')
    .select('slug, kind, name, subject, preview_text, content, updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    logger.error('getEmailTemplateBySlug', error, { slug });
    throw error;
  }
  if (!data) return null;
  return rowToTemplate(data as Record<string, unknown>);
}

export async function updateEmailTemplate(
  slug: string,
  patch: {
    subject?: string;
    preview_text?: string;
    content?: EmailTemplateContent;
  },
  supabase?: SupabaseClient,
): Promise<EmailTemplateRow> {
  const client = supabase ?? (await createServerSupabase());
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.subject !== undefined) update.subject = patch.subject;
  if (patch.preview_text !== undefined) update.preview_text = patch.preview_text;
  if (patch.content !== undefined) {
    const parsed = EmailTemplateContentSchema.parse(patch.content);
    update.content = parsed;
  }

  const { data, error } = await client
    .from('email_templates')
    .update(update)
    .eq('slug', slug)
    .select('slug, kind, name, subject, preview_text, content, updated_at')
    .single();

  if (error) {
    logger.error('updateEmailTemplate', error, { slug });
    throw error;
  }
  return rowToTemplate(data as Record<string, unknown>);
}

export function contentWithFirstName(
  content: EmailTemplateContent,
  firstName: string,
): EmailTemplateContent {
  return {
    ...content,
    headline: applyFirstNamePlaceholders(content.headline, firstName),
    paragraph1: applyFirstNamePlaceholders(content.paragraph1, firstName),
    paragraph2: content.paragraph2
      ? applyFirstNamePlaceholders(content.paragraph2, firstName)
      : content.paragraph2,
  };
}

export async function sendTemplatedEmail(options: {
  to: string;
  template: EmailTemplateRow;
  contentOverride?: Partial<EmailTemplateContent>;
  subjectOverride?: string;
  firstName?: string | null;
}): Promise<{ id: string | undefined; to: string }> {
  let content = options.contentOverride
    ? mergeEmailContent(
        { ...options.template.content, ...options.contentOverride },
        options.template.content,
      )
    : options.template.content;

  if (options.firstName != null) {
    content = contentWithFirstName(content, options.firstName);
  }

  const subject = options.subjectOverride?.trim() || options.template.subject;
  const preview = options.template.preview_text || subject;

  const sent = await sendEmail(
    options.to,
    subject,
    createElement(EditableMessageEmail, { preview, content }),
  );
  return sent;
}
