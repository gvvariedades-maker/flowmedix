import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import {
  getEmailTemplateBySlug,
  sendTemplatedEmail,
  type EmailTemplateRow,
} from '@/lib/email/templates';
import { mergeEmailContent } from '@/lib/email/templateContent';
import { logger } from '@/lib/logger';
import type { MarketingEmailSendInput } from '@/lib/validations';

const MAX_BULK = 200;

async function emailsFromConcursoMatriculas(
  admin: SupabaseClient,
  concursoId: string,
): Promise<string[]> {
  const { data: rows, error } = await admin
    .from('concurso_matriculas')
    .select('user_id')
    .eq('concurso_id', concursoId)
    .eq('status', 'ativo')
    .limit(MAX_BULK);

  if (error) throw error;

  const emails: string[] = [];
  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];

  for (const uid of userIds) {
    try {
      const { data, error: uErr } = await admin.auth.admin.getUserById(uid);
      if (!uErr && data.user?.email) {
        emails.push(data.user.email.toLowerCase());
      }
    } catch {
      // ignora usuário sem e-mail
    }
  }

  return [...new Set(emails)];
}

export type MarketingSendResult = {
  ok: boolean;
  sent: number;
  failed: number;
  failures: { email: string; error: string }[];
  recipients: string[];
};

export async function sendMarketingCampaign(
  admin: SupabaseClient,
  input: MarketingEmailSendInput,
  adminEmail: string,
): Promise<MarketingSendResult> {
  const slug = input.template_slug || 'marketing';
  const dbTemplate = await getEmailTemplateBySlug(slug, admin);

  if (!dbTemplate) {
    throw new Error(`Template "${slug}" não encontrado`);
  }
  if (dbTemplate.kind !== 'marketing') {
    throw new Error('Só templates de marketing podem ser enviados em campanha');
  }

  const template: EmailTemplateRow = {
    ...dbTemplate,
    subject: input.subject?.trim() || dbTemplate.subject,
    preview_text: input.preview_text?.trim() || dbTemplate.preview_text,
    content: input.content
      ? mergeEmailContent({ ...dbTemplate.content, ...input.content }, dbTemplate.content)
      : dbTemplate.content,
  };

  let recipients: string[] = [];

  if (input.audience === 'test_me') {
    recipients = [adminEmail];
  } else if (input.audience === 'emails') {
    recipients = [...new Set((input.emails ?? []).map((e) => e.toLowerCase()))];
  } else if (input.audience === 'concurso_matriculas') {
    recipients = await emailsFromConcursoMatriculas(admin, input.concurso_id!);
  }

  if (recipients.length === 0) {
    throw new Error('Nenhum destinatário encontrado');
  }
  if (recipients.length > MAX_BULK) {
    throw new Error(`Limite de ${MAX_BULK} destinatários por envio`);
  }

  const failures: { email: string; error: string }[] = [];
  let sent = 0;

  for (const to of recipients) {
    try {
      await sendTemplatedEmail({ to, template });
      sent += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar';
      failures.push({ email: to, error: msg });
      logger.error('marketing send falhou para destinatário', err, { to, slug });
    }
  }

  return {
    ok: failures.length === 0,
    sent,
    failed: failures.length,
    failures: failures.slice(0, 20),
    recipients,
  };
}
