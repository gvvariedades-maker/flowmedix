import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_NUMBER,
  WHATSAPP_URL,
  formatWhatsAppDisplay,
  getWhatsAppNumber,
} from '@/lib/whatsapp';

describe('whatsapp', () => {
  const originalNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  afterEach(() => {
    if (originalNumber === undefined) {
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    } else {
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = originalNumber;
    }
  });

  it('uses default number when env is unset', () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    expect(getWhatsAppNumber()).toBe(DEFAULT_WHATSAPP_NUMBER);
  });

  it('builds wa.me url without pre-filled message', () => {
    expect(buildWhatsAppUrl()).toBe(WHATSAPP_URL);
    expect(buildWhatsAppUrl()).not.toContain('text=');
  });

  it('formats brazilian mobile number for display', () => {
    expect(formatWhatsAppDisplay(DEFAULT_WHATSAPP_NUMBER)).toBe('+55 (84) 99804-9641');
  });
});
