/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { EstudoReversoHost } from '@/components/lesson/EstudoReversoFullscreenPortal';

describe('EstudoReversoHost', () => {
  it('renderiza children no 1º paint em live (sem retornar null antes do portal)', () => {
    render(
      <EstudoReversoHost preview={false}>
        <div data-testid="er-overlay">Estudo reverso</div>
      </EstudoReversoHost>,
    );
    expect(screen.getByTestId('er-overlay')).toBeInTheDocument();
  });

  it('em preview mantém children na árvore', () => {
    render(
      <EstudoReversoHost preview>
        <span data-testid="er-preview">Preview</span>
      </EstudoReversoHost>,
    );
    expect(screen.getByTestId('er-preview')).toBeInTheDocument();
  });
});
