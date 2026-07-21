process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';

import { detectMissingFigure, instructionReferencesFigure } from '@/lib/catalogMigration/figureContract';

describe('figureContract', () => {
  const transcribedOk = {
    question_data: {
      instruction: 'Na sentença abaixo, a palavra «essencial» funciona como um:',
      figure_policy: 'transcribed' as const,
      text_fragment: '<p><strong>O essencial é invisível aos olhos.</strong></p>',
    },
  };

  const missing3839425 = {
    question_data: {
      instruction: 'Na sentença utilizada na figura acima, a palavra «essencial» funciona como um:',
    },
  };

  it('instructionReferencesFigure detecta figura/tirinha/charge', () => {
    expect(instructionReferencesFigure('Na tirinha acima, analise')).toBe(true);
    expect(instructionReferencesFigure('Leia a charge abaixo')).toBe(true);
    expect(instructionReferencesFigure('No cartaz publicitário acima')).toBe(true);
    expect(instructionReferencesFigure('Assinale a alternativa correta.')).toBe(false);
  });

  it('instructionReferencesFigure detecta HQ, quadrinho e sequência visual', () => {
    expect(
      instructionReferencesFigure(
        'Assinale a alternativa que analisa «por isso», presente no quarto quadro do texto.',
      ),
    ).toBe(true);
    expect(instructionReferencesFigure('(HQ em quadrinhos — adaptado)')).toBe(true);
    expect(instructionReferencesFigure('No terceiro quadrinho, a fala indica')).toBe(true);
    expect(
      instructionReferencesFigure(
        'Leia o texto a seguir para responder à questão. Todo mundo sabe que a literatura...',
      ),
    ).toBe(false);
  });

  const missing3840898 = {
    question_data: {
      instruction:
        'Leia o texto a seguir para responder à questão.\n\n(HQ em quadrinhos — adaptado)\n\nAssinale a alternativa que analisa corretamente a expressão «por isso», presente no quarto quadro do texto.',
    },
  };

  it('detectMissingFigure falha em stub HQ sem asset (3840898)', () => {
    expect(detectMissingFigure(missing3840898)).toMatchObject({
      code: 'l2_missing_figure',
    });
  });

  it('detectMissingFigure falha no caso 3839425 sem asset', () => {
    expect(detectMissingFigure(missing3839425)).toMatchObject({
      code: 'l2_missing_figure',
    });
  });

  it('detectMissingFigure passa com transcribed + text_fragment', () => {
    expect(detectMissingFigure(transcribedOk)).toBeNull();
  });

  it('detectMissingFigure passa com figures[] válidas', () => {
    const withFigure = {
      question_data: {
        instruction: 'Na tirinha acima, analise:',
        figures: [
          {
            id: 'f1',
            url: 'https://example.supabase.co/storage/v1/object/public/questao-figures/1/f1.webp',
            alt: 'Tirinha Garfield com diálogo sobre dieta e sorvete',
          },
        ],
      },
    };
    expect(detectMissingFigure(withFigure)).toBeNull();
  });
});
