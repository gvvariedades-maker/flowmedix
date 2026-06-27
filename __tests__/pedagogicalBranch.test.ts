import {
  inferPedagogicalBranch,
  getPresentationDesign,
  getLayoutVariantForBranch,
} from '@/lib/slides/pedagogicalBranch';

describe('pedagogicalBranch', () => {
  const subtopico = 'Saúde do Adolescente';

  it('infere adolescente_desenvolvimento para puberdade', () => {
    const instruction =
      'Julgue o item. A adolescência é marcada por metamorfose física. Atraso na puberdade: mamas 12-13 anos, testículos 13-14 anos.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'certo_errado')).toBe(
      'adolescente_desenvolvimento',
    );
  });

  it('infere adolescente_antropometria para escore Z', () => {
    const instruction = 'Classificação nutricional pelo escore Z do IMC na caderneta do adolescente.';
    expect(inferPedagogicalBranch(subtopico, instruction, [], 'calc')).toBe(
      'adolescente_antropometria',
    );
  });

  it('infere adolescente_etica_sigilo para gravidez/sigilo', () => {
    const instruction = 'Sobre sigilo na consulta do adolescente gestante e escuta qualificada.';
    expect(inferPedagogicalBranch(subtopico, instruction, [])).toBe('adolescente_etica_sigilo');
  });

  it('ramo desenvolvimento usa layout genérico no concept_map', () => {
    const design = getPresentationDesign(subtopico, 'adolescente_desenvolvimento');
    expect(design?.conceptMap).toBe('morphological');
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'adolescente_desenvolvimento')).toBe(
      'morphological',
    );
  });

  it('ramo ética usa adolescent-privacy-curtain', () => {
    expect(getLayoutVariantForBranch(subtopico, 'concept_map', 'adolescente_etica_sigilo')).toBe(
      'adolescent-privacy-curtain',
    );
  });
});
