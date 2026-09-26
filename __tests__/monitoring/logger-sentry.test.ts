import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

describe('Logger Sentry Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encaminha Error para Sentry.captureException com tags, fingerprint e extra higienizados', () => {
    const error = new Error('Falha no processamento de pagamento');
    logger.error('Erro de cobrança', error, {
      tags: { service: 'stripe' },
      fingerprint: ['stripe', 'checkout', 'charge_failed'],
      secretToken: 'sk_test_12345678901234567890',
      userId: 'user_123',
    });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: { origin: 'logger', service: 'stripe' },
        fingerprint: ['stripe', 'checkout', 'charge_failed'],
        extra: expect.objectContaining({
          logMessage: 'Erro de cobrança',
          secretToken: '[REDACTED]',
          userId: 'user_123',
        }),
      }),
    );
  });

  it('previne captura duplicada para a mesma instância de Error', () => {
    const error = new Error('Falha repetida');
    logger.error('Primeira tentativa', error);
    logger.error('Segunda tentativa com mesmo erro', error);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('respeita flag skipSentry e não despacha para o Sentry', () => {
    const error = new Error('Erro já tratado');
    logger.error('Erro local suprimido', error, { skipSentry: true });

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('encaminha mensagens de erro sem objeto Error para Sentry.captureMessage com fingerprint', () => {
    logger.error('Aviso de erro sem objeto Error', undefined, {
      tags: { source: 'custom_check' },
      fingerprint: ['custom_check', 'warning_signal'],
      info: 'detalhe',
    });

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Aviso de erro sem objeto Error',
      expect.objectContaining({
        level: 'error',
        tags: { origin: 'logger', source: 'custom_check' },
        fingerprint: ['custom_check', 'warning_signal'],
        extra: expect.objectContaining({ info: 'detalhe' }),
      }),
    );
  });
});
