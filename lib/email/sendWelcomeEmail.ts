import { createElement } from 'react';
import { z } from 'zod';

import { WelcomeEmail } from '@/emails/welcome';
import { logger } from '@/lib/logger';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

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

/** Envio transacional (sem cache) — usado por API routes e server actions. */
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

    let firstName = firstNameFromAuthMetadata(
      authData.user.user_metadata as Record<string, unknown> | undefined,
    );

    if (!firstName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', parsed.data)
        .maybeSingle();
      firstName = firstNameFromDisplayName(profile?.full_name ?? null);
    }

    const sent = await sendEmail(
      authData.user.email,
      'Bem-vindo ao Avant',
      createElement(WelcomeEmail, { firstName: firstName ?? 'estudante' }),
    );

    return { success: true, email: sent.to, resendId: sent.id };
  } catch (err) {
    logger.error('sendWelcomeEmail falhou', err, { userId: parsed.data });
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao enviar e-mail de boas-vindas',
    };
  }
}
