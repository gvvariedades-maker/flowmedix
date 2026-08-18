/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CadernosListLoadingSkeleton } from '@/components/dashboard/cadernos/CadernosListLoadingSkeleton';
import { CadernosPendingView } from '@/components/dashboard/cadernos/CadernosPendingView';
import CadernosLoading from '@/app/(dashboard)/(authenticated)/cadernos/loading';

describe('CadernosListLoadingSkeleton', () => {
  it('expõe status acessível com testid distinto do hub', () => {
    render(<CadernosListLoadingSkeleton />);
    const status = screen.getByRole('status', { name: 'Carregando cadernos' });
    expect(status).toHaveAttribute('data-testid', 'cadernos-loading');
    expect(status).toHaveAttribute('data-hub-nav-phase', 'loading');
    expect(status).not.toHaveAttribute('data-cadernos-hub');
    expect(screen.queryByTestId('desempenho-estudo-loading')).not.toBeInTheDocument();
  });

  it('no slow-loading mantém o status e anuncia ainda carregando', () => {
    render(<CadernosListLoadingSkeleton phase="slow-loading" />);
    expect(screen.getByRole('status', { name: 'Ainda carregando cadernos' })).toBeInTheDocument();
    expect(screen.getByText('Ainda carregando cadernos')).toBeInTheDocument();
  });
});

describe('CadernosPendingView', () => {
  it('reusa o chrome do hub em volta do skeleton', () => {
    render(<CadernosPendingView />);
    expect(screen.getByRole('heading', { name: 'Cadernos de Estudo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Novo caderno/i })).toHaveAttribute('href', '/cadernos/novo');
    expect(screen.getByTestId('cadernos-loading')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('cadernos/loading.tsx', () => {
  it('reusa CadernosPendingView (chrome + skeleton)', () => {
    render(<CadernosLoading />);
    expect(screen.getByRole('heading', { name: 'Cadernos de Estudo' })).toBeInTheDocument();
    expect(screen.getByTestId('cadernos-loading')).toBeInTheDocument();
  });
});
