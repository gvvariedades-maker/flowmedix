/** Número padrão de suporte (DDI + DDD + número, só dígitos). */
export const DEFAULT_WHATSAPP_NUMBER = '5584998049641';

export const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Tenho uma dúvida sobre o AVANT.';

export type WhatsAppLinkOptions = {
  message?: string;
  /** Identificador curto para rastrear origem (ex.: menu, ajuda, landing). */
  campaign?: string;
};

function sanitizeDigits(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 ? digits : undefined;
}

export function getWhatsAppNumber(): string {
  return sanitizeDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(options?: WhatsAppLinkOptions): string {
  const number = getWhatsAppNumber();
  const baseMessage =
    options?.message?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE?.trim() ||
    DEFAULT_WHATSAPP_MESSAGE;

  const utm = options?.campaign
    ? `utm_source=avant&utm_medium=whatsapp&utm_campaign=${options.campaign}`
    : undefined;

  const text = utm ? `${baseMessage}\n\n${utm}` : baseMessage;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Ex.: 5584998049641 → +55 (84) 99804-9641 */
export function formatWhatsAppDisplay(number = getWhatsAppNumber()): string {
  if (number.startsWith('55') && number.length === 13) {
    const ddd = number.slice(2, 4);
    const local = number.slice(4);
    return `+55 (${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
  }
  if (number.startsWith('55') && number.length === 12) {
    const ddd = number.slice(2, 4);
    const local = number.slice(4);
    return `+55 (${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
  }
  return `+${number}`;
}
