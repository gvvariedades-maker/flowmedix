'use server';

import {
  sendWelcomeEmail as sendWelcomeEmailCore,
  type SendWelcomeEmailResult,
} from '@/lib/email/sendWelcomeEmail';

export type { SendWelcomeEmailResult };

export async function sendWelcomeEmail(userId: string): Promise<SendWelcomeEmailResult> {
  return sendWelcomeEmailCore(userId);
}
