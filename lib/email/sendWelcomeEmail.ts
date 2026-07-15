import { z } from 'zod';

import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';
import {
  DEFAULT_WELCOME_CONTENT,
  mergeEmailContent,
} from '@/lib/email/templateContent';
import { resolveWelcomeSalutation } from '@/lib/email/welcomeSalutation';
import {
  getEmailTemplateBySlug,
  sendTemplatedEmail,
} from '@/lib/email/templates';

const userIdSchema = z.string().uuid('userId inválido');

export type SendWelcomeEmailResult = {
  success: boolean;
  error?: string;
  email?: string;
  resendId?: string;
};

function firstNameFromDisplayName(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;
  return name.trim().split(/\s+/)[0] ?? null;
}

function firstNameFromAuthMetadata(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;
  const full = metadata.full_name;
  if (typeof full === 'string' && full.trim()) {
    return firstNameFromDisplayName(full);
  }
  const name = metadata.name;
  if (typeof name === 'string' && name.trim()) {
    return firstNameFromDisplayName(name);
  }
  return null;
}

/** Envio transacional (template `welcome` no banco). */
export async function sendWelcomeEmail(userId: string): Promise<SendWelcomeEmailResult> {
  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'userId inválido',
    };
  }

  try {
    const supabase = await createServerSupabase();
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(parsed.data);

    if (authError || !authData.user?.email) {
      logger.error('sendWelcomeEmail: usuário Auth não encontrado', authError, {
        userId: parsed.data,
      });
      return { success: false, error: 'Usuário não encontrado' };
    }

    const firstName = resolveWelcomeSalutation(
      firstNameFromAuthMetadata(
        authData.user.user_metadata as Record<string, unknown> | undefined,
      ),
    );

    const dbTemplate = await getEmailTemplateBySlug('welcome', supabase);
    const template = dbTemplate ?? {
      slug: 'welcome',
      kind: 'transactional' as const,
      name: 'Boas-vindas',
      subject: 'Bem-vindo ao AVANT enf — Técnico de Enfermagem',
      preview_text: 'Estudo reverso com NeuroSlides — comece pela sua primeira questão',
      content: DEFAULT_WELCOME_CONTENT,
      updated_at: new Date().toISOString(),
    };

    const sent = await sendTemplatedEmail({
      to: authData.user.email,
      template,
      firstName,
    });

    return { success: true, email: sent.to, resendId: sent.id };
  } catch (err) {
    logger.error('sendWelcomeEmail falhou', err, { userId: parsed.data });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao enviar e-mail de boas-vindas',
    };
  }
}
