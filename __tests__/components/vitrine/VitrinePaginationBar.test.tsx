import { fireEvent, render, screen } from '@testing-library/react';
import { VitrinePaginationBar } from '@/components/vitrine/VitrinePaginationBar';
import { MOBILE_STICKY_ABOVE_NAV_BOTTOM } from '@/lib/layout/mobileBottomNav';

describe('VitrinePaginationBar', () => {
  it('variante inline usa layout desktop (hidden em mobile)', () => {
    const { container } = render(
      <VitrinePaginationBar
        pagina={2}
        paginaEfetiva={2}
        totalPaginas={5}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
        variant="inline"
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('hidden', 'md:flex');
    expect(nav).not.toHaveClass('fixed');
  });

  it('variante sticky fica fixa acima do BottomNav só no mobile', () => {
    const { container } = render(
      <VitrinePaginationBar
        pagina={2}
        paginaEfetiva={2}
        totalPaginas={5}
        listBusy={false}
        onPrev={jest.fn()}
        onNext={jest.fn()}
        variant="sticky"
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed', 'inset-x-0', 'z-30', 'md:hidden');
    expect(nav?.className).toContain(MOBILE_STICKY_ABOVE_NAV_BOTTOM);
    expect(nav).toHaveClass('pb-safe', 'backdrop-blur-xl');
    expect(screen.getByTestId('vitrine-pagination-prev-sticky')).toBeInTheDocument();
    expect(screen.getByTestId('vitrine-pagination-next-sticky')).toBeInTheDocument();
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
