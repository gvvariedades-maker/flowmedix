import {
  bespokeMoldHasContentAffinity,
  collectSlideTextCorpus,
  shouldApplySubtopicMold,
} from '@/lib/slides/moldAffinity';

describe('moldAffinity', () => {
  describe('Saúde do Adolescente — escore Z (IBAM)', () => {
    const subtopico = 'Saúde do Adolescente';

    const goldenRuleSlide = {
      type: 'golden_rule' as const,
      content: 'CLASSIFICAÇÃO NUTRICIONAL — ESCORE Z DO IMC (5–19 ANOS)',
      rows: [
        { label: 'Sobrepeso', value: '+1 < Z ≤ +2 — letra A' },
        { label: 'Obesidade', value: 'Z > +2' },
      ],
      footer_rule: 'Sobrepeso: +1 a +2 + orientação de alimentação',
    };

    const conceptMapSlide = {
      type: 'concept_map' as const,
      items: [
        { label: 'Escore Z', detail: 'Caderneta do Adolescente + curvas OMS', icon: 'BarChart3' },
        { label: 'Sobrepeso', detail: 'IMC com Z entre +1 e +2', icon: 'Apple' },
        { label: 'Conduta', detail: 'Orientar alimentação', icon: 'HeartPulse' },
      ],
    };

    it('rejeita adolescent-sigilo-spectrum para family calc + rows Z', () => {
      expect(
        bespokeMoldHasContentAffinity('adolescent-sigilo-spectrum', goldenRuleSlide, {
          familyId: 'calc',
          subtopico,
        }),
      ).toBe(false);
    });

    it('rejeita adolescent-privacy-curtain para concept_map nutricional', () => {
      expect(
        bespokeMoldHasContentAffinity('adolescent-privacy-curtain', conceptMapSlide, {
          familyId: 'calc',
          subtopico,
        }),
      ).toBe(false);
    });

    it('aceita adolescent-sigilo-spectrum para conteúdo de sigilo', () => {
      const ethicsSlide = {
        content: 'Sigilo e escuta qualificada na consulta do adolescente',
        rows: [{ label: 'Privacidade', value: 'Protegido por sigilo — I correta' }],
      };
      expect(
        bespokeMoldHasContentAffinity('adolescent-sigilo-spectrum', ethicsSlide, {
          familyId: 'vf',
          subtopico,
        }),
      ).toBe(true);
    });
  });

  describe('subtópico de casa — sondas', () => {
    it('aceita procedure-protocol no subtópico de sondas mesmo com labels genéricos', () => {
      expect(
        shouldApplySubtopicMold(
          'procedure-protocol',
          {
            items: [
              { label: 'A', detail: '1' },
              { label: 'B', detail: '2' },
              { label: 'C', detail: '3' },
            ],
          },
          { subtopico: 'Instalação e Manejo de Sondas' },
        ),
      ).toBe(true);
    });
  });

  describe('collectSlideTextCorpus', () => {
    it('agrega rows, steps e items', () => {
      const corpus = collectSlideTextCorpus({
        content: 'Título',
        rows: [{ label: 'Magreza', value: 'Z < -2' }],
        steps: ['Julgar I → verdadeira'],
        items: [{ label: 'Letra A', correct: 'Sobrepeso +1 a +2' }],
      });
      expect(corpus).toContain('Magreza');
      expect(corpus).toContain('Julgar I');
      expect(corpus).toContain('Letra A');
    });
  });

  describe('variantes genéricas', () => {
    it('sempre aplica bridge / reference_table', () => {
      expect(shouldApplySubtopicMold('bridge', { items: [] }, {})).toBe(true);
      expect(shouldApplySubtopicMold('reference_table', { rows: [] }, {})).toBe(true);
    });
  });
});
