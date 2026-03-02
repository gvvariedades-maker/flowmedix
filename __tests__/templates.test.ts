/**
 * Testes de Integração para Sistema de Templates
 */

import {
  templates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByBanca,
  createQuestionFromTemplate,
  cleanTemplate,
} from '@/lib/templates';
import { QuestaoCompletaSchema } from '@/lib/validations';

describe('Sistema de Templates', () => {
  describe('getTemplateById', () => {
    it('deve retornar template existente', () => {
      const template = getTemplateById('enfermagem-basico');
      expect(template).toBeDefined();
      expect(template?.id).toBe('enfermagem-basico');
    });

    it('deve retornar undefined para template inexistente', () => {
      const template = getTemplateById('inexistente');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('deve retornar templates de enfermagem', () => {
      const enfermagemTemplates = getTemplatesByCategory('enfermagem');
      expect(enfermagemTemplates.length).toBeGreaterThan(0);
      expect(enfermagemTemplates.every((t) => t.category === 'enfermagem')).toBe(true);
    });
  });

  describe('getTemplatesByBanca', () => {
    it('deve retornar templates da banca', () => {
      const ebserhTemplates = getTemplatesByBanca('EBSERH');
      expect(ebserhTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('createQuestionFromTemplate', () => {
    it('deve criar questão válida a partir de template', () => {
      const question = createQuestionFromTemplate('enfermagem-basico');
      
      // Validar com Zod
      const result = QuestaoCompletaSchema.safeParse(question);
      expect(result.success).toBe(true);
    });

    it('deve aplicar overrides corretamente', () => {
      const question = createQuestionFromTemplate('enfermagem-basico', {
        meta: {
          banca: 'FGV',
          ano: '2025',
          topico: 'Matemática',
          subtopico: 'Álgebra',
        },
      });

      expect(question.meta.banca).toBe('FGV');
      expect(question.meta.ano).toBe('2025');
      expect(question.meta.topico).toBe('Matemática');
    });

    it('deve lançar erro para template inexistente', () => {
      expect(() => {
        createQuestionFromTemplate('inexistente');
      }).toThrow();
    });
  });

  describe('cleanTemplate', () => {
    it('deve limpar template parcial', () => {
      const partial = {
        meta: {
          banca: 'EBSERH',
        },
      };

      const cleaned = cleanTemplate(partial);
      expect(cleaned.meta.banca).toBe('EBSERH');
      expect(cleaned.meta.ano).toBeDefined();
      expect(cleaned.question_data).toBeDefined();
      expect(cleaned.reverse_study_slides).toBeDefined();
    });

    it('deve usar valores padrão para campos faltantes', () => {
      const cleaned = cleanTemplate({});
      expect(cleaned.meta.banca).toBe('EBSERH');
      expect(cleaned.meta.ano).toBeDefined();
    });
  });

  describe('Validação de Templates', () => {
    it('todos os templates devem ser válidos', () => {
      templates.forEach((template) => {
        const result = QuestaoCompletaSchema.safeParse(template.template);
        expect(result.success).toBe(true);
      });
    });
  });
});
