/**
 * Testes Unitários para Validação Zod
 */

import {
  QuestaoCompletaSchema,
  ConceptMapSlideSchema,
  LogicFlowSlideSchema,
  GoldenRuleSlideSchema,
  DangerZoneSlideSchema,
  SyllableScannerSlideSchema,
  VersusArenaSlideSchema,
  validateSlide,
  validateSlides,
} from '../lib/validations';

describe('Validação de Questões', () => {
  describe('QuestaoCompletaSchema', () => {
    it('deve validar uma questão completa válida', () => {
      const validQuestion = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
          subtopico: 'Sintaxe',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          options: [
            { id: 'A', text: 'Opção A', is_correct: true },
            { id: 'B', text: 'Opção B', is_correct: false },
          ],
        },
      };

      const result = QuestaoCompletaSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar questão sem meta.banca', () => {
      const invalidQuestion = {
        meta: {
          topico: 'Fundamentos de Enfermagem',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          options: [{ id: 'A', text: 'Opção A', is_correct: true }],
        },
      };

      const result = QuestaoCompletaSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((e) => e.path.includes('banca'))).toBe(true);
      }
    });

    it('deve rejeitar questão sem options', () => {
      const invalidQuestion = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          options: [],
        },
      };

      const result = QuestaoCompletaSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('deve validar text_fragment com HTML', () => {
      const validQuestion = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          text_fragment: '<p>Texto com <strong>negrito</strong></p>',
          options: [{ id: 'A', text: 'Opção A', is_correct: true }],
        },
      };

      const result = QuestaoCompletaSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });
  });

  describe('ConceptMapSlideSchema', () => {
    it('deve validar slide concept_map válido', () => {
      const validSlide = {
        type: 'concept_map',
        subject: 'Sintaxe',
        items: [
          { label: 'Item 1', detail: 'Detalhe 1', icon: 'Sparkles' },
          { label: 'Item 2', detail: 'Detalhe 2', icon: 'Bolt' },
        ],
      };

      const result = ConceptMapSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem items', () => {
      const invalidSlide = {
        type: 'concept_map',
        items: [],
      };

      const result = ConceptMapSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve validar ícone Lucide válido', () => {
      const validSlide = {
        type: 'concept_map',
        items: [
          { label: 'Item 1', icon: 'Sparkles' },
        ],
      };

      const result = ConceptMapSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar ícone Lucide inválido', () => {
      const invalidSlide = {
        type: 'concept_map',
        items: [
          { label: 'Item 1', icon: 'IconeInexistente' },
        ],
      };

      const result = ConceptMapSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve validar limites de tamanho', () => {
      const invalidSlide = {
        type: 'concept_map',
        subject: 'A'.repeat(101), // Excede LIMITS.SUBJECT_MAX
        items: [
          { label: 'Item 1' },
        ],
      };

      const result = ConceptMapSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('LogicFlowSlideSchema', () => {
    it('deve validar slide logic_flow válido', () => {
      const validSlide = {
        type: 'logic_flow',
        steps: ['Passo 1', 'Passo 2', 'Passo 3'],
      };

      const result = LogicFlowSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem steps', () => {
      const invalidSlide = {
        type: 'logic_flow',
        steps: [],
      };

      const result = LogicFlowSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar step vazio', () => {
      const invalidSlide = {
        type: 'logic_flow',
        steps: ['Passo válido', ''],
      };

      const result = LogicFlowSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve validar limite máximo de steps', () => {
      const invalidSlide = {
        type: 'logic_flow',
        steps: Array(16).fill('Passo'), // Excede máximo de 15
      };

      const result = LogicFlowSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('GoldenRuleSlideSchema', () => {
    it('deve validar slide golden_rule válido', () => {
      const validSlide = {
        type: 'golden_rule',
        content: 'Regra de ouro importante',
      };

      const result = GoldenRuleSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem content', () => {
      const invalidSlide = {
        type: 'golden_rule',
      };

      const result = GoldenRuleSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve validar limite máximo de content', () => {
      const invalidSlide = {
        type: 'golden_rule',
        content: 'A'.repeat(1001), // Excede LIMITS.CONTENT_MAX
      };

      const result = GoldenRuleSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('DangerZoneSlideSchema', () => {
    it('deve validar slide danger_zone válido', () => {
      const validSlide = {
        type: 'danger_zone',
        content: 'Cuidado com a pegadinha',
        items: [
          { label: 'Erro comum', detail: 'Descrição do erro' },
        ],
      };

      const result = DangerZoneSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem content', () => {
      const invalidSlide = {
        type: 'danger_zone',
        items: [{ label: 'Item' }],
      };

      const result = DangerZoneSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('SyllableScannerSlideSchema', () => {
    it('deve validar slide syllable_scanner válido', () => {
      const validSlide = {
        type: 'syllable_scanner',
        word: 'palavra',
        tonicIndex: 2,
      };

      const result = SyllableScannerSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem word', () => {
      const invalidSlide = {
        type: 'syllable_scanner',
      };

      const result = SyllableScannerSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('VersusArenaSlideSchema', () => {
    it('deve validar slide versus_arena válido', () => {
      const validSlide = {
        type: 'versus_arena',
        concept_a: 'Conceito A',
        concept_b: 'Conceito B',
      };

      const result = VersusArenaSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem concept_a', () => {
      const invalidSlide = {
        type: 'versus_arena',
        concept_b: 'Conceito B',
      };

      const result = VersusArenaSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('validateSlide', () => {
    it('deve validar slide individual', () => {
      const slide = {
        type: 'logic_flow',
        steps: ['Passo 1'],
      };

      const result = validateSlide(slide);
      expect(result.success).toBe(true);
    });
  });

  describe('validateSlides', () => {
    it('deve validar múltiplos slides válidos', () => {
      const slides = [
        { type: 'logic_flow', steps: ['Passo 1'] },
        { type: 'golden_rule', content: 'Regra' },
      ];

      const result = validateSlides(slides);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('deve detectar erros em múltiplos slides', () => {
      const slides = [
        { type: 'logic_flow', steps: ['Passo 1'] },
        { layout_type: 'invalid_layout' }, // layout_type inválido - falha em ambos schemas
      ];

      const result = validateSlides(slides);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
