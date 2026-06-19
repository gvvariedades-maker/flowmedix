import { render, screen } from '@testing-library/react';
import { SimuladosListClient } from '@/components/simulados/SimuladosListClient';

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

const openWeekly = {
  id: '11111111-1111-1111-1111-111111111111',
  total_questoes: 10,
  modo: 'prova' as const,
  titulo: 'Simulado da Semana #25',
  created_at: '2026-06-18T10:00:00.000Z',
  session_kind: 'weekly' as const,
};

const recentLivre = {
  id: '22222222-2222-2222-2222-222222222222',
  status: 'concluido',
  modo: 'prova' as const,
  titulo: 'Prova Urgências',
  total_questoes: 20,
  percentual_acerto: 75,
  created_at: '2026-06-17T10:00:00.000Z',
  concluida_em: '2026-06-17T11:00:00.000Z',
  session_kind: 'livre' as const,
};

const recentDiagnostico = {
  id: '33333333-3333-3333-3333-333333333333',
  status: 'concluido',
  modo: 'prova' as const,
  titulo: 'Simulado Diagnóstico Inicial',
  total_questoes: 10,
  percentual_acerto: 60,
  created_at: '2026-06-16T10:00:00.000Z',
  concluida_em: '2026-06-16T11:00:00.000Z',
  session_kind: 'diagnostico' as const,
};

describe('SimuladosListClient — identidade adaptativa', () => {
  it('exibe badge Missão e CTA Continuar missão para sessão weekly em andamento', () => {
    render(<SimuladosListClient openSession={openWeekly} recentSessions={[]} />);

    expect(screen.getByText('Missão')).toBeInTheDocument();
    expect(screen.queryByText('Prova')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar missão' })).toHaveAttribute(
      'href',
      `/simulados/${openWeekly.id}`,
    );
  });

  it('exibe badges Diagnóstico e Prova na lista recente', () => {
    render(
      <SimuladosListClient
        openSession={null}
        recentSessions={[recentDiagnostico, recentLivre]}
      />,
    );

    expect(screen.getByText('Diagnóstico')).toBeInTheDocument();
    expect(screen.getByText('Prova')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Continuar missão' })).not.toBeInTheDocument();
  });
});
