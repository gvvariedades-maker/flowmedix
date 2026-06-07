/** Número padrão de suporte (DDI + DDD + número, só dígitos). */
export const DEFAULT_WHATSAPP_NUMBER = '5584998049641';

function sanitizeDigits(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 ? digits : undefined;
}

export function getWhatsAppNumber(): string {
  return sanitizeDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(): string {
  return `https://wa.me/${getWhatsAppNumber()}`;
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
