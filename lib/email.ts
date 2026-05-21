import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { z } from 'zod';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const emailToSchema = z
  .string()
  .trim()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Envia e-mail transacional via Resend com template React Email.
 */
export async function sendEmail(
  to: string,
  subject: string,
  react: ReactElement,
): Promise<void> {
  const parsedTo = emailToSchema.safeParse(to);
  if (!parsedTo.success) {
    logger.error('Destinatário de e-mail inválido', parsedTo.error, { to });
    throw new Error(parsedTo.error.issues[0]?.message ?? 'E-mail inválido');
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: parsedTo.data,
      subject,
      react,
    });

    if (error) {
      logger.error('Falha ao enviar e-mail via Resend', error, {
        to: parsedTo.data,
        subject,
      });
      throw new Error(error.message);
    }

    logger.info('E-mail enviado via Resend', {
      id: data?.id,
      to: parsedTo.data,
      subject,
    });
  } catch (err) {
    logger.error('Erro inesperado ao enviar e-mail', err, {
      to: parsedTo.data,
      subject,
    });
    throw err;
  }
}
