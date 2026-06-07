import { test, expect } from '@playwright/test';

/**
 * Testes E2E para API de Validação
 *
 * Endpoint protegido por requireAdminApi — requer sessão admin.
 * Validação Zod completa é coberta em __tests__/api/validate-question.test.ts.
 */

const validQuestion = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    topico: 'Fundamentos de Enfermagem',
    subtopico: 'Sintaxe',
  },
  question_data: {
    instruction: 'Teste de instrução',
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
    ],
  },
};

test.describe('API de Validação — controle de acesso', () => {
  test('POST retorna 401 sem sessão admin', async ({ request }) => {
    const response = await request.post('/api/validate-question', {
      data: validQuestion,
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Não autenticado');
  });

  test('GET retorna 401 sem sessão admin', async ({ request }) => {
    const response = await request.get('/api/validate-question');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Não autenticado');
  });
});
