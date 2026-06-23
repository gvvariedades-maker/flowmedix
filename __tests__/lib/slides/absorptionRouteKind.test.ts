import { inferAbsorptionRouteKind } from '@/lib/slides/absorptionRouteKind';

describe('inferAbsorptionRouteKind', () => {
  it('não classifica Afirmativa IV como via intravenosa', () => {
    expect(
      inferAbsorptionRouteKind(
        'Afirmativa IV',
        'FALSA: O volume máximo permitido para essa via é de 3 mL.',
      ),
    ).toBe('sc');
  });

  it('classifica Afirmativas I–III como SC (conteúdo da questão)', () => {
    expect(inferAbsorptionRouteKind('Afirmativa I', 'VERDADEIRA: irritação na camada gordurosa.')).toBe(
      'sc',
    );
    expect(inferAbsorptionRouteKind('Afirmativa II', 'FALSA: absorção rápida.')).toBe('sc');
    expect(inferAbsorptionRouteKind('Afirmativa III', 'VERDADEIRA: adesão facilitada.')).toBe('sc');
  });

  it('classifica Gabarito como SC', () => {
    expect(inferAbsorptionRouteKind('Gabarito', 'Letra B — I e III, apenas.')).toBe('sc');
  });

  it('ainda reconhece via intravenosa explícita', () => {
    expect(inferAbsorptionRouteKind('Via IV', 'Endovenosa — absorção imediata.')).toBe('iv');
    expect(inferAbsorptionRouteKind('Intravenosa', 'Ação imediata na corrente sanguínea.')).toBe('iv');
  });

  it('reconhece IM e SC por palavra-chave', () => {
    expect(inferAbsorptionRouteKind('Via IM', 'Intramuscular — absorção rápida.')).toBe('im');
    expect(inferAbsorptionRouteKind('Via SC', 'Subcutânea — absorção lenta.')).toBe('sc');
  });

  it('Absorção lenta comparativa com IM permanece no bucket SC', () => {
    expect(
      inferAbsorptionRouteKind('Absorção lenta', 'SC absorve mais devagar que IM — efeito gradual.'),
    ).toBe('sc');
  });

  it('Tecido adiposo permanece no bucket SC', () => {
    expect(
      inferAbsorptionRouteKind('Tecido adiposo', 'Volume pequeno, técnica de pinça, ângulo conforme protocolo.'),
    ).toBe('sc');
  });
});
