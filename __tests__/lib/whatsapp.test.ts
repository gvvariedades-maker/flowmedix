import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_NUMBER,
  formatWhatsAppDisplay,
  getWhatsAppNumber,
} from '@/lib/whatsapp';

describe('whatsapp', () => {
  const originalNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const originalMessage = process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE;

  afterEach(() => {
    if (originalNumber === undefined) {
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    } else {
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = originalNumber;
    }
    if (originalMessage === undefined) {
      delete process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE;
    } else {
      process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE = originalMessage;
    }
  });

  it('uses default number when env is unset', () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    expect(getWhatsAppNumber()).toBe(DEFAULT_WHATSAPP_NUMBER);
  });

  it('builds wa.me url with campaign utm', () => {
    const url = buildWhatsAppUrl({ campaign: 'ajuda' });
    expect(url).toContain(`https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`);
    expect(url).toContain(encodeURIComponent('utm_campaign=ajuda'));
  });

  it('formats brazilian mobile number for display', () => {
    expect(formatWhatsAppDisplay(DEFAULT_WHATSAPP_NUMBER)).toBe('+55 (84) 99804-9641');
  });
});
