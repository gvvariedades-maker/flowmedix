import { test, expect } from '@playwright/test';

/**
 * Testes E2E para API de Validação
 * 
 * Testa o endpoint /api/validate-question
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

test.describe('API de Validação', () => {
  test('deve validar questão válida', async ({ request }) => {
    const response = await request.post('/api/validate-question', {
      data: validQuestion,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(true);
  });

  test('deve rejeitar questão sem banca', async ({ request }) => {
    const invalidQuestion = { ...validQuestion };
    delete invalidQuestion.meta.banca;

    const response = await request.post('/api/validate-question', {
      data: invalidQuestion,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.valid).toBe(false);
    expect(body.errors).toBeDefined();
  });

  test('deve rejeitar questão sem alternativas', async ({ request }) => {
    const invalidQuestion = {
      ...validQuestion,
      question_data: {
        ...validQuestion.question_data,
        options: [],
      },
    };

    const response = await request.post('/api/validate-question', {
      data: invalidQuestion,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.valid).toBe(false);
  });

  test('deve retornar metadata via GET', async ({ request }) => {
    const response = await request.get('/api/validate-question');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.limits).toBeDefined();
    expect(body.allowedTags).toBeDefined();
    expect(body.slideTypes).toBeDefined();
  });
});
