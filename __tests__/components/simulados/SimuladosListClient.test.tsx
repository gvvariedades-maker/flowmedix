import { render, screen } from '@testing-library/react';
import { SimuladosListClient } from '@/components/simulados/SimuladosListClient';

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

const openLivre = {
  id: '11111111-1111-1111-1111-111111111111',
  total_questoes: 10,
  modo: 'prova' as const,
  titulo: 'Prova Urgências',
  created_at: '2026-06-18T10:00:00.000Z',
  session_kind: 'livre' as const,
};

const recentLivre = {
  id: '22222222-2222-2222-2222-222222222222',
  status: 'concluido',
  modo: 'prova' as const,
  titulo: 'Prova Farmacologia',
  total_questoes: 20,
  percentual_acerto: 75,
  created_at: '2026-06-17T10:00:00.000Z',
  concluida_em: '2026-06-17T11:00:00.000Z',
  session_kind: 'livre' as const,
};

describe('SimuladosListClient — simulados livres', () => {
  it('exibe CTA Continuar simulado para sessão livre em andamento', () => {
    render(<SimuladosListClient openSession={openLivre} recentSessions={[]} />);

    expect(screen.getByText('Prova')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar simulado' })).toHaveAttribute(
      'href',
      `/simulados/${openLivre.id}`,
    );
  });

  it('exibe badge Prova na lista recente', () => {
    render(<SimuladosListClient openSession={null} recentSessions={[recentLivre]} />);

    expect(screen.getByText('Prova')).toBeInTheDocument();
    expect(screen.queryByText('Missão')).not.toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico')).not.toBeInTheDocument();
  });

  it('link para missão da semana no header', () => {
    render(<SimuladosListClient openSession={null} recentSessions={[]} />);

    expect(screen.getByRole('link', { name: 'Missão da semana' })).toHaveAttribute(
      'href',
      '/missao-semanal',
    );
  });
});
