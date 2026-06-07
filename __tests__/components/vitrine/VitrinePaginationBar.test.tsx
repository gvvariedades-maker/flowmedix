import { fireEvent, render, screen } from '@testing-library/react';
import { VitrinePaginationBar } from '@/components/vitrine/VitrinePaginationBar';

describe('VitrinePaginationBar', () => {
  it('renderiza paginação inline no fluxo da lista (mobile e desktop)', () => {
    const { container } = render(
      <VitrinePaginationBar
        pagina={2}
        paginaEfetiva={2}
        totalPaginas={5}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('flex', 'flex-col', 'border-t', 'border-white/10');
    expect(nav).not.toHaveClass('fixed', 'hidden');
    expect(screen.getByTestId('vitrine-pagination-prev')).toBeInTheDocument();
    expect(screen.getByTestId('vitrine-pagination-next')).toBeInTheDocument();
  });

  it('desabilita botões e marca aria-busy quando listBusy', () => {
    render(
      <VitrinePaginationBar
        pagina={2}
        paginaEfetiva={1}
        totalPaginas={5}
        listBusy
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Paginação da vitrine' });
    expect(nav).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Próxima/ })).toBeDisabled();
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument();
  });

  it('exibe paginaEfetiva no rótulo quando não está carregando', () => {
    render(
      <VitrinePaginationBar
        pagina={3}
        paginaEfetiva={2}
        totalPaginas={4}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByText('Página 2 de 4')).toBeInTheDocument();
  });

  it('dispara onPrev e onNext quando habilitados', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();

    render(
      <VitrinePaginationBar
        pagina={2}
        paginaEfetiva={2}
        totalPaginas={5}
        listBusy={false}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    fireEvent.click(screen.getByRole('button', { name: /Próxima/ }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('desabilita Anterior na primeira página e Próxima na última', () => {
    const { rerender } = render(
      <VitrinePaginationBar
        pagina={1}
        paginaEfetiva={1}
        totalPaginas={3}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Próxima/ })).not.toBeDisabled();

    rerender(
      <VitrinePaginationBar
        pagina={3}
        paginaEfetiva={3}
        totalPaginas={3}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Anterior/ })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Próxima/ })).toBeDisabled();
  });
});
