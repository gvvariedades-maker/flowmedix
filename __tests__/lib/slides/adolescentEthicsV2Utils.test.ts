import {
  inferAdolescentCarePillar,
  inferSpeakBarrierSide,
  parseAdolescentExcetoStep,
} from '@/lib/slides/adolescentSlideUtils';

describe('adolescente ética v2 utils', () => {
  it('infere pilares de cuidado', () => {
    expect(inferAdolescentCarePillar('Vínculo e escuta sem julgamento')).toBe('vinculo');
    expect(inferAdolescentCarePillar('Rede com escola e grupos')).toBe('rede');
    expect(inferAdolescentCarePillar('Sigilo e consentimento informado')).toBe('sigilo');
    expect(inferAdolescentCarePillar('Linguagem clara sem jargão')).toBe('linguagem');
  });

  it('parseia steps EXCETO', () => {
    expect(parseAdolescentExcetoStep('Comando: afirmativa INCORRETA.', 0).kind).toBe('command');
    expect(
      parseAdolescentExcetoStep('A–C: vínculo e sigilo — condutas certas (descartar).', 1).kind,
    ).toBe('keep');
    expect(
      parseAdolescentExcetoStep(
        'D: linguagem complexa e rebuscada — essa é a exceção.',
        2,
      ).kind,
    ).toBe('exception');
    expect(parseAdolescentExcetoStep('Marcar letra D.', 3)).toMatchObject({
      kind: 'mark',
      letter: 'D',
    });
    expect(parseAdolescentExcetoStep('Em similares: informação ≠ jargão.', 4).kind).toBe(
      'transfer',
    );
  });

  it('classifica barreira de fala', () => {
    expect(inferSpeakBarrierSide('Como NÃO falar', 'Linguagem rebuscada')).toBe('barrier');
    expect(inferSpeakBarrierSide('Como falar', 'Linguagem clara e acessível')).toBe('ok');
    expect(inferSpeakBarrierSide('Direitos', 'Sigilo e consentimento')).toBe('rights');
  });
});
