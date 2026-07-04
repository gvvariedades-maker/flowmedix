import {
  buildAbsorptionExamTip,
  inferOptionAbsorptionRoute,
  resolveCorrectAnswerLetter,
  resolveScGabaritoBadge,
} from '@/lib/slides/absorptionSpeedRailExamTips';

const INSULINA_AMAUC = [
  { id: 'A', text: 'Intradérmica – ID', is_correct: false },
  { id: 'B', text: 'Intramuscular – IM', is_correct: false },
  { id: 'C', text: 'Endovenosa – EV', is_correct: false },
  { id: 'D', text: 'Via oral – VO', is_correct: false },
  { id: 'E', text: 'Subcutânea – SC', is_correct: true },
];

const VUNESP_SC_B = [
  { id: 'A', text: 'Intravenosa – absorção rápida', is_correct: false },
  { id: 'B', text: 'Subcutânea – absorção lenta e contínua', is_correct: true },
  { id: 'C', text: 'Intramuscular', is_correct: false },
  { id: 'D', text: 'Via oral', is_correct: false },
];

describe('absorptionSpeedRailExamTips', () => {
  it('infere rota por texto da alternativa', () => {
    expect(inferOptionAbsorptionRoute('Endovenosa – EV')).toBe('iv');
    expect(inferOptionAbsorptionRoute('Subcutânea – SC')).toBe('sc');
    expect(inferOptionAbsorptionRoute('Intradérmica – ID')).toBeNull();
  });

  it('badge SC usa letra E na insulina AMAUC', () => {
    expect(resolveScGabaritoBadge(INSULINA_AMAUC)).toBe('Gabarito E');
    expect(resolveCorrectAnswerLetter(INSULINA_AMAUC)).toBe('E');
  });

  it('badge SC usa letra B na âncora VUNESP', () => {
    expect(resolveScGabaritoBadge(VUNESP_SC_B)).toBe('Gabarito B');
  });

  it('dicas citam letras corretas da questão insulina', () => {
    expect(buildAbsorptionExamTip('sc', INSULINA_AMAUC)).toContain('Gabarito E');
    expect(buildAbsorptionExamTip('iv', INSULINA_AMAUC)).toContain('Letra C');
    expect(buildAbsorptionExamTip('im', INSULINA_AMAUC)).toContain('Letra B');
    expect(buildAbsorptionExamTip('vo', INSULINA_AMAUC)).toContain('Letra D');
    expect(buildAbsorptionExamTip('iv', INSULINA_AMAUC)).not.toContain('Letra A');
  });

  it('sem options usa dicas genéricas sem letra fixa', () => {
    expect(buildAbsorptionExamTip('sc')).not.toMatch(/Gabarito [A-E]/);
    expect(buildAbsorptionExamTip('iv')).not.toMatch(/Letra [A-E]/);
  });
});
