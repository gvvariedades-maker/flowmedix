/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import {
  AttemptEvolutionLoadingSkeleton,
  DesempenhoEstudoLoadingSkeleton,
} from '@/components/dashboard/desempenho/DesempenhoEstudoLoadingSkeleton';
import DesempenhoLoading from '@/app/(dashboard)/(authenticated)/desempenho/loading';

jest.mock('next/navigation', () => ({
  usePathname: () => '/desempenho',
}));

describe('DesempenhoEstudoLoadingSkeleton', () => {
  it('expõe status acessível sem dialog nem tablist', () => {
    render(<DesempenhoEstudoLoadingSkeleton />);

    const status = screen.getByRole('status', { name: 'Carregando desempenho' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('data-desempenho-loading', 'estudo');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('espelha o placar: 5 cards no mesmo grid do hub', () => {
    render(<DesempenhoEstudoLoadingSkeleton />);

    const cards = screen.getAllByTestId('desempenho-loading-score');
    expect(cards).toHaveLength(5);
    const grid = cards[0]?.parentElement;
    expect(grid?.className).toContain('grid-cols-2');
    expect(grid?.className).toContain('sm:grid-cols-3');
    expect(grid?.className).toContain('lg:grid-cols-5');
  });
});

describe('AttemptEvolutionLoadingSkeleton', () => {
  it('não reutiliza o testid do skeleton da página (onda 1)', () => {
    render(<AttemptEvolutionLoadingSkeleton />);

    expect(screen.getByRole('status', { name: 'Carregando evolução de tentativas' })).toHaveAttribute(
      'data-testid',
      'desempenho-attempt-series-loading',
    );
    expect(screen.queryByTestId('desempenho-estudo-loading')).not.toBeInTheDocument();
  });
});

describe('desempenho/loading.tsx', () => {
  it('reusa o chrome do hub (título, seções, CTA) em volta do skeleton', () => {
    render(<DesempenhoLoading />);

    expect(screen.getByRole('heading', { name: 'Meu desempenho' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Onde você está errando, o quanto isso é confiável e qual é a próxima questão para testar.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Seções de desempenho' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Praticar na vitrine' })).toHaveAttribute(
      'href',
      '/estudar',
    );
    expect(screen.getByTestId('desempenho-estudo-loading')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
