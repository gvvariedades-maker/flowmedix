import {
  getSlideShellCopy,
  isLinguaPortuguesaShell,
} from '@/lib/slides/slideShellCopy';

describe('slideShellCopy', () => {
  it('detecta PT por subtópico e por ramo pt_*', () => {
    expect(isLinguaPortuguesaShell('Classes de palavras')).toBe(true);
    expect(isLinguaPortuguesaShell(undefined, 'pt_classes_conjuncao')).toBe(true);
    expect(isLinguaPortuguesaShell('Vias de Administração')).toBe(false);
  });

  it('retorna copy gramatical para Classes de palavras', () => {
    const copy = getSlideShellCopy('Classes de palavras', 'pt_classes_conjuncao');
    expect(copy.goldenEyebrow).toBe('Decore gramática');
    expect(copy.compareBackFaceDefault).toBe('Resposta certa');
    expect(copy.logicFocusEyebrow).toBe('Estratégia de prova');
  });

  it('mantém copy clínico para TE', () => {
    const copy = getSlideShellCopy('Vias de Administração', 'via_vf_absorcao');
    expect(copy.goldenEyebrow).toBe('Decore clínico');
    expect(copy.compareBackFaceDefault).toBe('Conduta certa na prova');
    expect(copy.logicFocusEyebrow).toBe('Decisão clínica');
  });
});
