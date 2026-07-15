import { createElement } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ProAccessLinkEmail } from '@/emails/pro-access-link';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { getAbsoluteUrl } from '@/lib/siteUrl';

/**
 * Gera magic link e envia e-mail de acesso pós-checkout Pro (conta recém-criada).
 */
export async function sendProAccessMagicLinkEmail(
  admin: SupabaseClient,
  email: string,
): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const redirectTo = getAbsoluteUrl('/estudar');

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalized,
    options: { redirectTo },
  });

  if (error) {
    logger.error('Falha ao gerar magic link pós-checkout Pro', error, { email: normalized });
    throw error;
  }

  const actionLink = data.properties?.action_link?.trim();
  if (!actionLink) {
    logger.error('Magic link pós-checkout Pro sem action_link', { email: normalized });
    throw new Error('Link de acesso indisponível');
  }

  await sendEmail(
    normalized,
    'Seu acesso AVANT enf Pro está liberado',
    createElement(ProAccessLinkEmail, { accessLink: actionLink }),
  );

  logger.info('E-mail de acesso Pro enviado', { email: normalized });
}
