import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { z } from 'zod';

import { getResendServerConfig } from '@/lib/env';
import { logger } from '@/lib/logger';

const emailToSchema = z
  .string()
  .trim()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  const config = getResendServerConfig();
  if (!config) {
    throw new Error(
      'Resend não configurado. Defina RESEND_API_KEY (re_…) e RESEND_FROM_EMAIL na Vercel.',
    );
  }
  if (!resendClient) {
    resendClient = new Resend(config.apiKey);
  }
  return resendClient;
}

/**
 * Envia e-mail transacional via Resend com template React Email.
 */
export type SendEmailResult = {
  id: string | undefined;
  to: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  react: ReactElement,
): Promise<SendEmailResult> {
  const parsedTo = emailToSchema.safeParse(to);
  if (!parsedTo.success) {
    logger.error('Destinatário de e-mail inválido', parsedTo.error, { to });
    throw new Error(parsedTo.error.issues[0]?.message ?? 'E-mail inválido');
  }

  try {
    const config = getResendServerConfig();
    if (!config) {
      throw new Error(
        'Resend não configurado. Defina RESEND_API_KEY (re_…) e RESEND_FROM_EMAIL na Vercel.',
      );
    }
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: config.fromEmail,
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

    return { id: data?.id, to: parsedTo.data };
  } catch (err) {
    logger.error('Erro inesperado ao enviar e-mail', err, {
      to: parsedTo.data,
      subject,
    });
    throw err;
  }
}
