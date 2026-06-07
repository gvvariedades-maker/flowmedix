/**
 * @jest-environment node
 *
 * Testes de Integração para API de Validação
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuestaoCompletaSchema, validateSlides, sanitizeHTML } from '@/lib/validations';
import { GET, POST } from '@/app/api/validate-question/route';

const mockRequireAdminApi = jest.fn();

jest.mock('@/lib/admin/requireAdmin', () => ({
  requireAdminApi: (...args: unknown[]) => mockRequireAdminApi(...args),
}));

jest.mock('@/lib/rate-limit', () => ({
  distributedRateLimit: jest.fn(async () => true),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const validQuestion = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    topico: 'Fundamentos de Enfermagem',
    subtopico: 'SAE',
  },
  question_data: {
    instruction: 'Teste de instrução',
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
    ],
  },
};

function mockAdminAuth() {
  mockRequireAdminApi.mockResolvedValue({
    admin: { from: jest.fn() },
    user: { id: 'admin-id', email: 'admin@avant.com' },
    email: 'admin@avant.com',
  });
}

describe('API /api/validate-question — route handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST retorna 401 sem autenticação admin', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const request = new NextRequest('https://avant.test/api/validate-question', {
      method: 'POST',
      body: JSON.stringify(validQuestion),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autenticado' });
  });

  it('POST retorna 403 para usuário autenticado sem permissão admin', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
    });

    const request = new NextRequest('https://avant.test/api/validate-question', {
      method: 'POST',
      body: JSON.stringify(validQuestion),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Acesso negado' });
  });

  it('POST valida questão válida quando admin autenticado', async () => {
    mockAdminAuth();

    const request = new NextRequest('https://avant.test/api/validate-question', {
      method: 'POST',
      body: JSON.stringify(validQuestion),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.data.meta.banca).toBe('EBSERH');
  });

  it('POST rejeita questão inválida quando admin autenticado', async () => {
    mockAdminAuth();

    const invalidQuestion = {
      ...validQuestion,
      question_data: {
        ...validQuestion.question_data,
        options: [],
      },
    };

    const request = new NextRequest('https://avant.test/api/validate-question', {
      method: 'POST',
      body: JSON.stringify(invalidQuestion),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.valid).toBe(false);
    expect(body.errors).toBeDefined();
  });

  it('GET retorna 401 sem autenticação admin', async () => {
    mockRequireAdminApi.mockResolvedValue({
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Não autenticado' });
  });

  it('GET retorna metadata quando admin autenticado', async () => {
    mockAdminAuth();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.limits).toBeDefined();
    expect(body.allowedTags).toBeDefined();
    expect(body.slideTypes).toBeDefined();
  });
});

describe('API /api/validate-question', () => {
  describe('QuestaoCompletaSchema', () => {
    it('deve validar questão válida', () => {
      const result = QuestaoCompletaSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar questão sem banca', () => {
      const invalidQuestion = {
        ...validQuestion,
        meta: { ...validQuestion.meta, banca: undefined },
      };
      delete invalidQuestion.meta.banca;

      const result = QuestaoCompletaSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((e) => e.path.includes('banca'))).toBe(true);
      }
    });

    it('deve rejeitar questão sem alternativas', () => {
      const invalidQuestion = {
        ...validQuestion,
        question_data: {
          ...validQuestion.question_data,
          options: [],
        },
      };

      const result = QuestaoCompletaSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('deve validar payload legado de estudo reverso (4 slides sem campos premium)', () => {
      const legacy = {
        ...validQuestion,
        reverse_study_slides: [
          {
            type: 'concept_map',
            items: [{ label: 'Item', detail: 'Detalhe', icon: 'Sparkles' }],
          },
          { type: 'golden_rule', content: 'Regra' },
          { type: 'logic_flow', steps: ['P1', 'P2'] },
          {
            type: 'danger_zone',
            content: 'Alerta',
            items: [{ label: 'Erro', detail: 'Desc' }],
          },
        ],
      };

      const result = QuestaoCompletaSchema.safeParse(legacy);
      expect(result.success).toBe(true);
      if (result.success) {
        const lf = result.data.reverse_study_slides!.find((s) => s.type === 'logic_flow') as
          | { reveal_mode?: string }
          | undefined;
        expect(lf?.reveal_mode).toBeUndefined();
      }
    });

    it('deve validar payload premium de estudo reverso', () => {
      const premium = {
        ...validQuestion,
        reverse_study_slides: [
          {
            type: 'logic_flow',
            reveal_mode: 'tap',
            steps: ['Decisão 1', 'Decisão 2'],
          },
          {
            type: 'danger_zone',
            content: 'Pegadinhas',
            items: [
              {
                label: 'Erro',
                detail: 'Trap',
                correct: 'Conduta correta',
              },
            ],
          },
          {
            type: 'golden_rule',
            rows: [{ label: 'PAS', value: '< 90' }],
          },
        ],
      };

      const result = QuestaoCompletaSchema.safeParse(premium);
      expect(result.success).toBe(true);
    });

    it('deve sanitizar HTML em text_fragment', () => {
      // Testa sanitizeHTML diretamente (remove script, mantém tags seguras)
      const rawHtml = '<script>alert("xss")</script><p>Texto válido</p>';
      const sanitized = sanitizeHTML(rawHtml);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>');

      // Testa que o schema aceita e transforma HTML (usa HTML simples para evitar flakiness)
      const questionWithHTML = {
        ...validQuestion,
        question_data: {
          ...validQuestion.question_data,
          text_fragment: '<p>Texto válido com <strong>negrito</strong></p>',
        },
      };

      const result = QuestaoCompletaSchema.safeParse(questionWithHTML);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.question_data.text_fragment).toContain('<p>');
        expect(result.data.question_data.text_fragment).toContain('<strong>');
      }
    });
  });

  describe('validateSlides', () => {
    it('deve validar slides válidos', () => {
      const slides = [
        {
          type: 'concept_map',
          items: [
            { icon: 'Sparkles', label: 'Item 1', detail: 'Detalhe' },
          ],
        },
      ];

      const result = validateSlides(slides);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('deve detectar slides inválidos', () => {
      const slides = [
        {
          layout_type: 'invalid_layout',
          // layout_type inválido - falha em ambos os schemas (novo e legacy)
        },
      ];

      const result = validateSlides(slides);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
