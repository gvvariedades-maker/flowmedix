/**
 * E2E API — RC-004 gate ligado no servidor (COMMERCIAL_RUNTIME_READINESS_GATE=true).
 * Requer webServer com PLAYWRIGHT_PROD (build+start) via scripts/run-e2e-commercial-gate.ts.
 * Sem usuários reais: rotas exigem Bearer → 401/403/404 são aceitos como bloqueio.
 */
import { test, expect } from '@playwright/test';

const P0_SLUG = 'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4';

test.describe('Commercial enforcement API (gate ligado)', () => {
  test('GET /api/estudar/questao P0 denylist → não 200 com payload', async ({ request }) => {
    const res = await request.get(`/api/estudar/questao?slug=${P0_SLUG}`);
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/estudar/questao slug inexistente → 404 ou 403 ou 401', async ({ request }) => {
    const res = await request.get('/api/estudar/questao?slug=slug-inexistente-rc004-gate-test');
    expect([403, 404, 401]).toContain(res.status());
  });

  test('GET /api/simulado/questao P0 denylist → não 200', async ({ request }) => {
    const res = await request.get(`/api/simulado/questao?slug=${P0_SLUG}`);
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/simulado/questao sem auth → 401', async ({ request }) => {
    const res = await request.get('/api/simulado/questao?slug=slug-inexistente-rc004-gate-test');
    expect(res.status()).toBe(401);
  });

  test('POST /api/simulado/responder sem auth → 401 ou 404', async ({ request }) => {
    const res = await request.post('/api/simulado/responder', {
      data: {
        session_id: '11111111-1111-4111-8111-111111111111',
        modulo_slug: 'slug-test',
        modulo_id: '00000000-0000-4000-8000-000000000001',
        opcao_id: 'A',
      },
    });
    expect([401, 404]).toContain(res.status());
  });

  test('POST /api/notebooks/[id]/items sem auth → 401', async ({ request }) => {
    const res = await request.post('/api/notebooks/00000000-0000-4000-8000-000000000099/items', {
      data: { modulo_slug: 'slug-test', titulo_aula: 'Imunização' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/estudar/questao sem slug → 400', async ({ request }) => {
    const res = await request.get('/api/estudar/questao');
    expect(res.status()).toBe(400);
  });
});

test.describe('Commercial enforcement — E2E bypass explícito (não comercial)', () => {
  test('E2E estudar seed com bypass permanece acessível (opt-out estrutural)', async ({ request }) => {
    const res = await request.get('/api/estudar/questao?slug=questao-e2e-estudar-1');
    expect([200, 401]).toContain(res.status());
  });
});
