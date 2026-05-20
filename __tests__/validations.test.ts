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
  payloadContainsTecconcursosReference,
  TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE,
  ConcursoMatriculaSchema,
  CriarSessaoPagamentoSchema,
  ConcursoCreateSchema,
  ConcursoRegraModulosSchema,
} from '../lib/validations';
import type { CriarSessaoPagamentoInput } from '../lib/validations';

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

    it('deve rejeitar options com id de alternativa duplicado', () => {
      const bad = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
          subtopico: 'Sintaxe',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          options: [
            { id: 'A', text: 'Primeira A', is_correct: false },
            { id: 'A', text: 'Segunda A', is_correct: true },
            { id: 'B', text: 'B', is_correct: false },
          ],
        },
      };
      const result = QuestaoCompletaSchema.safeParse(bad);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) =>
              i.path.join('.') === 'question_data.options' &&
              i.message.includes('duplicados')
          )
        ).toBe(true);
      }
    });

    it('deve rejeitar menção a TecConcursos no conteúdo conhecido pelo schema', () => {
      const bad = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
          subtopico: 'Sintaxe',
        },
        question_data: {
          instruction: 'Fonte: www.tecconcursos.com.br/questoes/1',
          options: [
            { id: 'A', text: 'Opção A', is_correct: true },
            { id: 'B', text: 'Opção B', is_correct: false },
          ],
        },
      };
      expect(payloadContainsTecconcursosReference(bad)).toBe(true);
      const result = QuestaoCompletaSchema.safeParse(bad);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === TECONCURSOS_PAYLOAD_BLOCKED_MESSAGE)).toBe(
          true
        );
      }
    });

    it('deve rejeitar alternativa com marca "Tec Concursos" ou rodapé copiado (espaço no nome)', () => {
      const badOption = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
        },
        question_data: {
          instruction: 'Questão de teste',
          options: [
            { id: 'A', text: 'Alternativa limpa', is_correct: true },
            {
              id: 'B',
              text: 'C3 a C5. 25/03/2026, 18:37 Tec Concursos - Questões para concursos, provas, editais, simulados.',
              is_correct: false,
            },
          ],
        },
      };
      expect(payloadContainsTecconcursosReference(badOption)).toBe(true);
      expect(QuestaoCompletaSchema.safeParse(badOption).success).toBe(false);
    });

    it('payloadContainsTecconcursosReference detecta campo extra que o Zod descarta', () => {
      const withHidden = {
        meta: {
          banca: 'EBSERH',
          topico: 'Fundamentos de Enfermagem',
        },
        question_data: {
          instruction: 'Qual é a resposta?',
          options: [{ id: 'A', text: 'Opção A', is_correct: true }],
        },
        _fonte: 'https://tecconcursos.com.br/x',
      };
      expect(payloadContainsTecconcursosReference(withHidden)).toBe(true);
      const zodOnly = QuestaoCompletaSchema.safeParse(withHidden);
      expect(zodOnly.success).toBe(true);
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

    it('deve aceitar slides com payload aninhado (normaliza antes do parse estrito)', () => {
      const question = {
        meta: {
          banca: 'FUMARC',
          topico: 'Enfermagem',
          subtopico: 'Noções de Fisiologia',
        },
        question_data: {
          instruction: 'Enunciado?',
          options: [{ id: 'A', text: 'Alternativa A', is_correct: true }],
        },
        reverse_study_slides: [
          {
            type: 'concept_map',
            meta: { topico: 'Enfermagem', subtopico: 'Fisiologia' },
            concept_map: {
              items: [{ id: '1', icon: 'Globe2', label: 'Item', detail: 'Detalhe' }],
            },
          },
          {
            type: 'golden_rule',
            golden_rule: { content: 'REGRA DE OURO' },
          },
        ],
      };

      const result = QuestaoCompletaSchema.safeParse(question);
      expect(result.success).toBe(true);
      if (result.success) {
        const slides = result.data.reverse_study_slides!;
        expect(slides[0].type).toBe('concept_map');
        expect('items' in slides[0] && (slides[0] as { items: { label: string }[] }).items[0]?.label).toBe(
          'Item'
        );
        expect(slides[1].type).toBe('golden_rule');
        expect((slides[1] as { content: string }).content).toBe('REGRA DE OURO');
        expect('concept_map' in (slides[0] as object)).toBe(false);
      }
    });
  });

  describe('ReverseStudySlideShellFieldsSchema', () => {
    it('deve validar chip_label e slide_title em qualquer tipo', () => {
      const slide = {
        type: 'logic_flow',
        chip_label: 'FLUXO LÓGICO',
        slide_title: 'Decisão clínica',
        steps: ['Passo 1'],
      };

      const result = LogicFlowSlideSchema.safeParse(slide);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chip_label).toBe('FLUXO LÓGICO');
        expect(result.data.slide_title).toBe('Decisão clínica');
      }
    });

    it('deve rejeitar chip_label vazio', () => {
      const slide = {
        type: 'logic_flow',
        chip_label: '',
        steps: ['Passo 1'],
      };

      const result = LogicFlowSlideSchema.safeParse(slide);
      expect(result.success).toBe(false);
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

    it('deve aceitar slide sem reveal_mode (legado = auto no player)', () => {
      const legacySlide = {
        type: 'logic_flow',
        steps: ['Passo 1', 'Passo 2'],
      };

      const result = LogicFlowSlideSchema.safeParse(legacySlide);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reveal_mode).toBeUndefined();
      }
    });

    it('deve validar reveal_mode tap', () => {
      const tapSlide = {
        type: 'logic_flow',
        reveal_mode: 'tap',
        steps: ['Decisão 1', 'Decisão 2'],
      };

      const result = LogicFlowSlideSchema.safeParse(tapSlide);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reveal_mode).toBe('tap');
      }
    });

    it('deve rejeitar reveal_mode inválido', () => {
      const invalidSlide = {
        type: 'logic_flow',
        reveal_mode: 'instant',
        steps: ['Passo 1'],
      };

      const result = LogicFlowSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });
  });

  describe('GoldenRuleSlideSchema', () => {
    it('deve validar slide golden_rule válido com content', () => {
      const validSlide = {
        type: 'golden_rule',
        content: 'Regra de ouro importante',
      };

      const result = GoldenRuleSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve validar slide golden_rule com rows (sem content)', () => {
      const validSlide = {
        type: 'golden_rule',
        rows: [
          { label: 'PA sistólica', value: '< 90 mmHg' },
          { label: 'FC', value: '> 100 bpm' },
        ],
      };

      const result = GoldenRuleSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve validar slide golden_rule com content e rows', () => {
      const validSlide = {
        type: 'golden_rule',
        content: 'CRITÉRIOS DE CHOQUE',
        rows: [{ label: 'PAS', value: '< 90 mmHg' }],
      };

      const result = GoldenRuleSlideSchema.safeParse(validSlide);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar slide sem content nem rows', () => {
      const invalidSlide = {
        type: 'golden_rule',
      };

      const result = GoldenRuleSlideSchema.safeParse(invalidSlide);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar rows vazias sem content', () => {
      const invalidSlide = {
        type: 'golden_rule',
        rows: [],
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

    it('deve validar danger_zone com items.correct (layout compare)', () => {
      const compareSlide = {
        type: 'danger_zone',
        content: 'Cuidado com erros em RCP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Interromper RCP para pulso',
            detail: 'Parar a cada ciclo para checar pulso.',
            correct: 'Verificar pulso só após 2 minutos de RCP contínua.',
          },
        ],
      };

      const result = DangerZoneSlideSchema.safeParse(compareSlide);
      expect(result.success).toBe(true);
    });

    it('deve validar danger_zone legado sem correct', () => {
      const legacySlide = {
        type: 'danger_zone',
        content: 'Alerta',
        items: [{ label: 'Erro', detail: 'Descrição' }],
      };

      const result = DangerZoneSlideSchema.safeParse(legacySlide);
      expect(result.success).toBe(true);
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

describe('Concursos e matrículas', () => {
  it('aceita payload sem slug no schema (rota exige slug na matrícula)', () => {
    expect(ConcursoMatriculaSchema.safeParse({}).success).toBe(true);
  });

  it('valida slug de concurso na matrícula', () => {
    expect(
      ConcursoMatriculaSchema.safeParse({ concursoSlug: 'campina-grande-2026' }).success,
    ).toBe(true);
    expect(ConcursoMatriculaSchema.safeParse({ concursoSlug: 'Slug Inválido' }).success).toBe(
      false,
    );
  });

  it('valida payload de criação de sessão de pagamento', () => {
    const payload: CriarSessaoPagamentoInput = { concurso_slug: 'campina-grande-2026' };
    expect(CriarSessaoPagamentoSchema.safeParse(payload).success).toBe(true);
    expect(CriarSessaoPagamentoSchema.safeParse({ concurso_slug: 'Slug Inválido' }).success).toBe(
      false,
    );
    expect(CriarSessaoPagamentoSchema.safeParse({}).success).toBe(false);
    expect(CriarSessaoPagamentoSchema.safeParse({ concurso_slug: 'geral' }).success).toBe(true);
  });

  it('valida criação de concurso', () => {
    expect(
      ConcursoCreateSchema.safeParse({
        slug: 'campina-grande-2026',
        nome: 'Campina Grande 2026',
        tipo: 'edital',
        status: 'ativo',
      }).success,
    ).toBe(true);
  });

  it('valida regra de inclusão por banca', () => {
    expect(ConcursoRegraModulosSchema.safeParse({ banca: 'IDECAN' }).success).toBe(true);
    expect(ConcursoRegraModulosSchema.safeParse({ banca: '' }).success).toBe(false);
  });
});
