/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SimuladosListLoadingSkeleton } from '@/components/simulados/SimuladosListLoadingSkeleton';
import { SimuladosPendingView } from '@/components/simulados/SimuladosPendingView';
import SimuladosLoading from '@/app/(dashboard)/(authenticated)/simulados/loading';

describe('SimuladosListLoadingSkeleton', () => {
  it('expõe status acessível com testid distinto do hub', () => {
    render(<SimuladosListLoadingSkeleton />);
    const status = screen.getByRole('status', { name: 'Carregando simulados' });
    expect(status).toHaveAttribute('data-testid', 'simulados-loading');
    expect(status).toHaveAttribute('data-hub-nav-phase', 'loading');
    expect(status).not.toHaveAttribute('data-simulados-hub');
    expect(screen.queryByTestId('cadernos-loading')).not.toBeInTheDocument();
  });

  it('no slow-loading mantém o status e anuncia ainda carregando', () => {
    render(<SimuladosListLoadingSkeleton phase="slow-loading" />);
    expect(screen.getByRole('status', { name: 'Ainda carregando simulados' })).toBeInTheDocument();
    expect(screen.getByText('Ainda carregando simulados')).toBeInTheDocument();
  });
});

describe('SimuladosPendingView', () => {
  it('reusa o chrome do hub em volta do skeleton', () => {
    render(<SimuladosPendingView />);
    expect(screen.getByRole('heading', { name: 'Simulados' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Novo simulado/i })).toHaveAttribute(
      'href',
      '/simulados/novo',
    );
    expect(screen.getByTestId('simulados-loading')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no slow-loading mantém o status e anuncia ainda carregando', () => {
    render(<SimuladosPendingView phase="slow-loading" />);
    expect(screen.getByRole('status', { name: 'Ainda carregando simulados' })).toBeInTheDocument();
    expect(screen.getByText('Ainda carregando simulados')).toBeInTheDocument();
  });
});

describe('simulados/loading.tsx', () => {
  it('reusa SimuladosPendingView (chrome + skeleton)', () => {
    render(<SimuladosLoading />);
    expect(screen.getByRole('heading', { name: 'Simulados' })).toBeInTheDocument();
    expect(screen.getByTestId('simulados-loading')).toBeInTheDocument();
  });
});
