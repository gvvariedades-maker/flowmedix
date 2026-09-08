import { canServeCommercialContent, isModuloCommercialEligible } from '@/lib/catalogMigration/commercialAuthority';
import { P0_DENIED_SLUGS, isSlugInP0Denylist } from '@/lib/catalogMigration/p0Denylist';

describe('Commercial Content Authority', () => {
  const prevGate = process.env.COMMERCIAL_RUNTIME_READINESS_GATE;

  beforeEach(() => {
    process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'false';
  });

  afterEach(() => {
    if (prevGate === undefined) delete process.env.COMMERCIAL_RUNTIME_READINESS_GATE;
    else process.env.COMMERCIAL_RUNTIME_READINESS_GATE = prevGate;
  });

  describe('P0 Denylist', () => {
    it('contem exatamente os 16 P0s confirmados pela auditoria', () => {
      expect(P0_DENIED_SLUGS.size).toBe(16);
    });

    it('identifica todos os 16 slugs como negados', () => {
      for (const slug of P0_DENIED_SLUGS) {
        expect(isSlugInP0Denylist(slug)).toBe(true);
        expect(isModuloCommercialEligible({ slug })).toBe(false);
        expect(canServeCommercialContent({ slug }).eligible).toBe(false);
      }
    });

    it('aceita slugs validos fora da denylist', () => {
      const validSlug = 'slug-valido-homologado-123';
      expect(isSlugInP0Denylist(validSlug)).toBe(false);
      expect(isModuloCommercialEligible({ slug: validSlug })).toBe(true);
    });
  });

  describe('canServeCommercialContent', () => {
    it('bloqueia payload com envelope cru (sem reverse_study_slides na raiz)', () => {
      const envelopePayload = {
        meta: { banca: 'IBFC', topico: 'Enfermagem' },
        payload: {
          question_data: { instruction: 'Texto', options: [{ id: 'A', is_correct: true, text: 'Op' }] },
          reverse_study_slides: [{ type: 'concept_map' }]
        }
      };
      const result = canServeCommercialContent({ slug: 'test-slug', conteudoJson: envelopePayload });
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('MALFORMED_CONTENT');
    });

    it('bloqueia questao sem alternativa correta (zero is_correct)', () => {
      const noCorrectPayload = {
        question_data: {
          instruction: 'Pergunta de prova',
          options: [
            { id: 'A', text: 'Opcao A', is_correct: false },
            { id: 'B', text: 'Opcao B', is_correct: false }
          ]
        },
        reverse_study_slides: []
      };
      const result = canServeCommercialContent({ slug: 'test-slug', conteudoJson: noCorrectPayload });
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('NO_CORRECT_ANSWER');
    });

    it('bloqueia questao com figura obrigatoria ausente', () => {
      const missingFigPayload = {
        question_data: {
          instruction: 'Observe a figura abaixo e responda:',
          options: [{ id: 'A', text: 'Correta', is_correct: true }],
          figures: []
        },
        reverse_study_slides: []
      };
      const result = canServeCommercialContent({ slug: 'test-slug', conteudoJson: missingFigPayload });
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('MISSING_FIGURE');
    });

    it('permite questao valida com gabarito e alternativas homologadas', () => {
      const validPayload = {
        question_data: {
          instruction: 'Em relacao ao Processo de Enfermagem...',
          options: [
            { id: 'A', text: 'Correta', is_correct: true },
            { id: 'B', text: 'Incorreta', is_correct: false }
          ]
        },
        reverse_study_slides: [
          { type: 'concept_map', items: [{ label: 'Item 1' }] },
          { type: 'logic_flow', steps: ['Passo 1'] },
          { type: 'golden_rule', content: 'Regra' },
          { type: 'danger_zone', content: 'Pegadinha' }
        ]
      };
      const result = canServeCommercialContent({ slug: 'slug-valido', conteudoJson: validPayload });
      expect(result.eligible).toBe(true);
    });

    it('permite admin bypass quando explicitamente solicitado', () => {
      const result = canServeCommercialContent({
        isAdmin: true,
        slug: 'inaz-do-para-enfermagem-nocoes-de-anatomia-1775448275334-4'
      });
      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('ADMIN_BYPASS');
    });

    describe('RC-004 runtime gate (gate ligado)', () => {
      beforeEach(() => {
        process.env.COMMERCIAL_RUNTIME_READINESS_GATE = 'true';
      });

      it('bloqueia subtópico fora do registry mesmo com payload estrutural válido', () => {
        const result = canServeCommercialContent({
          slug: 'legacy-out-of-registry',
          tituloAula: 'Subtópico Legado Não Rastreado XYZ',
          conteudoJson: {
            meta: { subtopico: 'Subtópico Legado Não Rastreado XYZ', banca: 'X', topico: 'Y' },
            question_data: {
              instruction: 'Pergunta',
              options: [{ id: 'A', text: 'A', is_correct: true }],
            },
            reverse_study_slides: [
              { type: 'concept_map', items: [{ label: 'A' }, { label: 'B' }] },
              { type: 'logic_flow', steps: ['S'], reveal_mode: 'tap' },
              { type: 'golden_rule', content: 'G' },
              { type: 'danger_zone', content: 'D' },
            ],
          },
        });
        expect(result.eligible).toBe(false);
        expect(result.reason).toBe('SUBTOPIC_NOT_IN_REGISTRY');
      });

      it('bloqueia quando readiness não atinge ready_100 (danger_zone reciclado)', () => {
        const dup =
          'Mesma justificativa copiada para todas as alternativas sem personalizar o distrator.';
        const result = canServeCommercialContent({
          slug: 'imunizacao-dup-runtime',
          tituloAula: 'Imunização',
          conteudoJson: {
            meta: {
              banca: 'TEST',
              topico: 'Enfermagem',
              subtopico: 'Imunização',
              content_standard: 'golden-v1',
              family: 'vf',
              sources: [{ id: 'ms', tier: 'A', title: 'PNI', issuer: 'MS' }],
            },
            question_data: {
              instruction: 'VF',
              options: [
                { id: 'A', text: 'V', is_correct: true },
                { id: 'B', text: 'F', is_correct: false },
              ],
            },
            reverse_study_slides: [
              { type: 'concept_map', items: [{ label: 'T' }, { label: 'C' }] },
              { type: 'logic_flow', steps: ['P'], reveal_mode: 'tap' },
              { type: 'golden_rule', content: 'R' },
              {
                type: 'danger_zone',
                content: 'Pegadinhas',
                items: [
                  { label: 'A', detail: 'x', correct: dup },
                  { label: 'B', detail: 'y', correct: dup },
                ],
              },
            ],
          },
        });
        expect(result.eligible).toBe(false);
        expect(result.reason).toBe('READINESS_NOT_APPROVED');
      });

      it('bloqueia golden ready_100 sem approved_content_fingerprint', () => {
        const golden = JSON.parse(
          require('node:fs').readFileSync(
            require('node:path').resolve(
              process.cwd(),
              'examples/questao-premium-cpcon-imunizacao-intervalos-vf.json',
            ),
            'utf8',
          ),
        );
        const result = canServeCommercialContent({
          slug: 'cpcon-imunizacao-intervalos-vf',
          tituloAula: 'Imunização',
          conteudoJson: golden,
        });
        expect(result.eligible).toBe(false);
        expect(result.reason).toBe('COMMERCIAL_APPROVAL_NOT_BOUND');
      });
    });
  });
});
