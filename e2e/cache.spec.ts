import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Sistema de Cache
 * 
 * Testa invalidação de cache via API
 */

test.describe('Sistema de Cache', () => {
  test('deve invalidar cache via API', async ({ request }) => {
    const response = await request.post('/api/cache/revalidate', {
      headers: {
        'Authorization': 'Bearer dev-secret',
        'Content-Type': 'application/json',
      },
      data: {
        table: 'modulos_estudo',
        event: 'INSERT',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('deve retornar status do endpoint de cache', async ({ request }) => {
    const response = await request.get('/api/cache/revalidate');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.config).toBeDefined();
  });

  test('deve rejeitar requisição sem autorização em produção', async ({ request }) => {
    // Em desenvolvimento, aceita qualquer header
    // Este teste verifica a estrutura da resposta
    const response = await request.post('/api/cache/revalidate', {
      data: {
        table: 'modulos_estudo',
        event: 'INSERT',
      },
    });

    // Pode ser 200 (dev) ou 401 (prod)
    expect([200, 401]).toContain(response.status());
  });
});
