'use server';

import { createElement } from 'react';
import { z } from 'zod';

import { getAuthUserWelcomeContactCached } from '@/lib/cache';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/emails/welcome';
import { logger } from '@/lib/logger';

const userIdSchema = z.string().uuid('userId inválido');

export type SendWelcomeEmailResult = {
  success: boolean;
  error?: string;
};

export async function sendWelcomeEmail(userId: string): Promise<SendWelcomeEmailResult> {
  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) {
    logger.warn('sendWelcomeEmail: userId inválido', {
      issues: parsed.error.issues,
    });
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'userId inválido',
    };
  }

  try {
    const contact = await getAuthUserWelcomeContactCached(parsed.data);
    if (!contact) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    await sendEmail(
      contact.email,
      'Bem-vindo ao Avant',
      createElement(WelcomeEmail, { firstName: contact.firstName }),
    );

    return { success: true };
  } catch (err) {
    logger.error('sendWelcomeEmail falhou', err, { userId: parsed.data });
    return {
      success: false,
      error:
        err instanceof Error ? err.message : 'Erro ao enviar e-mail de boas-vindas',
    };
  }
}
