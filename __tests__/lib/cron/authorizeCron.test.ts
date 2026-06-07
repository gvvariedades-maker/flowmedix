/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { isAuthorizedCronRequest } from '@/lib/cron/authorizeCron';

function makeCronRequest(secret: string): NextRequest {
  return new NextRequest('https://avant.test/api/admin/manutencao/test', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

describe('isAuthorizedCronRequest', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  it('aceita Bearer com secret correto', () => {
    process.env.CRON_SECRET = 'test-cron-secret-32-chars-minimum!!';
    expect(isAuthorizedCronRequest(makeCronRequest('test-cron-secret-32-chars-minimum!!'))).toBe(
      true,
    );
  });

  it('rejeita secret incorreto (timing-safe)', () => {
    process.env.CRON_SECRET = 'test-cron-secret-32-chars-minimum!!';
    expect(isAuthorizedCronRequest(makeCronRequest('wrong-secret'))).toBe(false);
  });

  it('rejeita quando CRON_SECRET não está configurado', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCronRequest(makeCronRequest('anything'))).toBe(false);
  });

  it('rejeita header ausente', () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    const req = new NextRequest('https://avant.test/cron');
    expect(isAuthorizedCronRequest(req)).toBe(false);
  });

  it('secret com prefixo igual não passa', () => {
    process.env.CRON_SECRET = 'abc';
    expect(isAuthorizedCronRequest(makeCronRequest('abcd'))).toBe(false);
  });
});
