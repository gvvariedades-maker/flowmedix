import {
  getReverseStudyGateRequirements,
  inferCliticQuizAnswer,
  inferCraseQuizAnswer,
  isTransferDangerItem,
} from '@/lib/slides/transferQuiz';

describe('transferQuiz', () => {
  describe('isTransferDangerItem', () => {
    it('reconhece label Transferência', () => {
      expect(isTransferDangerItem('Transferência', 'Classifique: …')).toBe(true);
      expect(isTransferDangerItem('A — Acender-se-ão', 'Parece ênclise')).toBe(false);
    });
  });

  describe('inferCliticQuizAnswer', () => {
    it('extrai ênclise / próclise / mesóclise do correct', () => {
      expect(
        inferCliticQuizAnswer('Ênclise: «me» aparece depois do verbo «entregaram».'),
      ).toBe('enclise');
      expect(
        inferCliticQuizAnswer('O relativo «que» atrai «nos»; portanto, há próclise.'),
      ).toBe('proclise');
      expect(
        inferCliticQuizAnswer('O pronome está dentro da forma futura; portanto, é mesóclise.'),
      ).toBe('mesoclise');
    });

    it('retorna null quando não há classificação', () => {
      expect(inferCliticQuizAnswer('Revise a conduta do plantão.')).toBeNull();
    });
  });

  describe('inferCraseQuizAnswer', () => {
    it('extrai sem à / com à do correct', () => {
      expect(
        inferCraseQuizAnswer(
          'Sem crase: Paris sem artigo — só a. Diferente de à Serra (com artigo).',
        ),
      ).toBe('sem_crase');
      expect(
        inferCraseQuizAnswer('Com à: dirigir-se à Serra — a + a + artigo.'),
      ).toBe('com_crase');
    });

    it('retorna null sem classificação de crase', () => {
      expect(inferCraseQuizAnswer('Revise a conduta do plantão.')).toBeNull();
    });
  });

  describe('getReverseStudyGateRequirements', () => {
    it('exige fluxo + danger + quiz no piloto de colocação', () => {
      const keys = getReverseStudyGateRequirements([
        { type: 'concept_map', items: [] },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          items: [],
        },
        {
          type: 'danger_zone',
          items: [
            {
              label: 'A — Acender-se-ão',
              detail: 'Parece ênclise',
              correct: 'É mesóclise.',
            },
            {
              label: 'Transferência',
              detail: 'Classifique: «Entregaram-me o prontuário.»',
              correct: 'Ênclise: «me» depois do verbo.',
            },
          ],
        },
      ]);
      expect(keys).toEqual(
        expect.arrayContaining([
          'logic_flow_complete',
          'danger_zone_all_revealed',
          'transfer_quiz',
        ]),
      );
      expect(keys).not.toContain('transfer_revealed');
    });

    it('exige quiz de crase quando correct traz Sem crase', () => {
      const keys = getReverseStudyGateRequirements([
        { type: 'logic_flow', reveal_mode: 'tap' },
        {
          type: 'danger_zone',
          items: [
            {
              label: 'Transferência',
              detail: 'Classifique: «Os turistas foram a Paris.»',
              correct: 'Sem crase: Paris sem artigo — só a.',
            },
          ],
        },
      ]);
      expect(keys).toEqual(
        expect.arrayContaining(['logic_flow_complete', 'danger_zone_all_revealed', 'transfer_quiz']),
      );
    });

    it('sem tap nem correct → sem gate', () => {
      expect(
        getReverseStudyGateRequirements([
          { type: 'concept_map' },
          { type: 'golden_rule' },
        ]),
      ).toEqual([]);
    });
  });
});
