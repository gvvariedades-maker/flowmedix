import {
  extractOptionLetter,
  isNegativeCommandQuestion,
  resolveDangerZoneItemPolarities,
} from '@/components/slides/core/dangerZonePolarity';

const EXCETO = 'Sobre a verificação da PA, todas as condutas são adequadas, EXCETO:';

const OPTIONS = [
  { id: 'a', text: 'Artéria braquial no membro superior', is_correct: false },
  { id: 'b', text: 'Manguito compatível com o braço', is_correct: false },
  { id: 'c', text: 'Insuflar até 300 mmHg de rotina', is_correct: true },
];

describe('isNegativeCommandQuestion', () => {
  it('detecta EXCETO e INCORRETA', () => {
    expect(isNegativeCommandQuestion(EXCETO)).toBe(true);
    expect(isNegativeCommandQuestion('Assinale a alternativa INCORRETA.')).toBe(true);
  });

  it('não marca comando positivo', () => {
    expect(isNegativeCommandQuestion('Assinale a alternativa correta.')).toBe(false);
    expect(isNegativeCommandQuestion(undefined)).toBe(false);
  });
});

describe('extractOptionLetter', () => {
  it('lê letra citada no rótulo', () => {
    expect(extractOptionLetter('Letra A — artéria braquial')).toBe('A');
    expect(extractOptionLetter('B) manguito estreito')).toBe('B');
    expect(extractOptionLetter('Alternativa c: insuflar 300 mmHg')).toBe('C');
  });

  it('não confunde inicial de palavra com letra de alternativa', () => {
    expect(extractOptionLetter('Aspiração antes da insuflação')).toBeNull();
    expect(extractOptionLetter('Braço apoiado na altura do coração')).toBeNull();
    expect(extractOptionLetter(undefined)).toBeNull();
  });
});

describe('resolveDangerZoneItemPolarities', () => {
  it('mantém tudo como trap em comando positivo', () => {
    const polarities = resolveDangerZoneItemPolarities(
      [{ label: 'Letra A — artéria braquial' }, { label: 'Letra C — 300 mmHg' }],
      { instruction: 'Assinale a alternativa correta.', options: OPTIONS },
    );
    expect(polarities).toEqual(['trap', 'trap']);
  });

  it('em EXCETO, distrator é conduta válida e gabarito é erro', () => {
    const polarities = resolveDangerZoneItemPolarities(
      [
        { label: 'Letra A — artéria braquial no membro superior' },
        { label: 'Letra B — manguito compatível' },
        { label: 'Letra C — insuflar até 300 mmHg' },
      ],
      { instruction: EXCETO, options: OPTIONS },
    );
    expect(polarities).toEqual(['valid_conduct', 'valid_conduct', 'trap']);
  });

  it('usa posição da alternativa quando o id não é letra', () => {
    const polarities = resolveDangerZoneItemPolarities(
      [{ label: 'A) primeira' }, { label: 'B) segunda' }],
      {
        instruction: EXCETO,
        options: [
          { id: '1', text: 'primeira', is_correct: true },
          { id: '2', text: 'segunda', is_correct: false },
        ],
      },
    );
    expect(polarities).toEqual(['trap', 'valid_conduct']);
  });

  it('cai no texto de correct quando não há letra nem gabarito conhecido', () => {
    const polarities = resolveDangerZoneItemPolarities(
      [
        { label: 'Artéria braquial', correct: 'Afirmativa correta: é o sítio clássico.' },
        { label: 'Insuflar 300 mmHg', correct: 'Erra: dor e leitura falsa.' },
      ],
      { instruction: EXCETO },
    );
    expect(polarities).toEqual(['valid_conduct', 'trap']);
  });

  it('sem items retorna lista vazia', () => {
    expect(resolveDangerZoneItemPolarities(undefined, { instruction: EXCETO })).toEqual([]);
  });
});
