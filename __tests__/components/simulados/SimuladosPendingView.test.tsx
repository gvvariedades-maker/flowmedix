/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SimuladosPendingView } from '@/components/simulados/SimuladosPendingView';

describe('SimuladosPendingView', () => {
  it('expõe status acessível com testid distinto do hub', () => {
    render(<SimuladosPendingView />);
    const status = screen.getByRole('status', { name: 'Carregando simulados' });
    expect(status).toHaveAttribute('data-testid', 'simulados-loading');
    expect(status).toHaveAttribute('data-hub-nav-phase', 'loading');
    expect(screen.queryByTestId('cadernos-loading')).not.toBeInTheDocument();
  });

  it('no slow-loading mantém o status e anuncia ainda carregando', () => {
    render(<SimuladosPendingView phase="slow-loading" />);
    expect(screen.getByRole('status', { name: 'Ainda carregando simulados' })).toBeInTheDocument();
    expect(screen.getByText('Ainda carregando simulados')).toBeInTheDocument();
  });
});
