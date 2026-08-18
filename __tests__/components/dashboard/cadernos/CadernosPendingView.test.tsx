/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CadernosPendingView } from '@/components/dashboard/cadernos/CadernosPendingView';

describe('CadernosPendingView', () => {
  it('expõe status acessível com testid distinto do hub', () => {
    render(<CadernosPendingView />);
    const status = screen.getByRole('status', { name: 'Carregando cadernos' });
    expect(status).toHaveAttribute('data-testid', 'cadernos-loading');
    expect(status).toHaveAttribute('data-hub-nav-phase', 'loading');
    expect(screen.queryByTestId('desempenho-estudo-loading')).not.toBeInTheDocument();
  });

  it('no slow-loading mantém o status e anuncia ainda carregando', () => {
    render(<CadernosPendingView phase="slow-loading" />);
    expect(screen.getByRole('status', { name: 'Ainda carregando cadernos' })).toBeInTheDocument();
    expect(screen.getByText('Ainda carregando cadernos')).toBeInTheDocument();
  });
});
