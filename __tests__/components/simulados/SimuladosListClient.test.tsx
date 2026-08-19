import { render, screen } from '@testing-library/react';
import { SimuladosListClient } from '@/components/simulados/SimuladosListClient';
import { SimuladosHubShell } from '@/components/simulados/SimuladosHubShell';

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

const openTreinoLegado = {
  id: '33333333-3333-3333-3333-333333333333',
  total_questoes: 10,
  modo: 'treino' as const,
  titulo: '',
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

const recentTreinoLegado = {
  id: '44444444-4444-4444-4444-444444444444',
  status: 'concluido',
  modo: 'treino' as const,
  titulo: '',
  total_questoes: 15,
  percentual_acerto: 60,
  created_at: '2026-06-16T10:00:00.000Z',
  concluida_em: '2026-06-16T11:00:00.000Z',
  session_kind: 'livre' as const,
};

describe('SimuladosListClient — simulados livres', () => {
  it('exibe CTA Continuar simulado para sessão livre em andamento sem badge de modo', () => {
    render(<SimuladosListClient openSession={openLivre} recentSessions={[]} />);

    expect(screen.getByText('Prova Urgências')).toBeInTheDocument();
    expect(screen.queryByText('Treino')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar simulado' })).toHaveAttribute(
      'href',
      `/simulados/${openLivre.id}`,
    );
  });

  it('não exibe badge Treino para sessão prova na lista recente', () => {
    render(<SimuladosListClient openSession={null} recentSessions={[recentLivre]} />);

    expect(screen.getByText('Prova Farmacologia')).toBeInTheDocument();
    expect(screen.queryByText('Treino')).not.toBeInTheDocument();
    expect(screen.queryByText('Missão')).not.toBeInTheDocument();
    expect(screen.queryByText('Diagnóstico')).not.toBeInTheDocument();
  });

  it('exibe badge Treino só para sessão livre legada', () => {
    render(
      <SimuladosListClient openSession={openTreinoLegado} recentSessions={[recentTreinoLegado]} />,
    );

    expect(screen.getAllByText('Treino')).toHaveLength(2);
  });

  it('P0 pendente não mostra empty state mesmo sem sessão aberta', () => {
    const { container } = render(
      <SimuladosListClient openSession={null} recentSessions={[]} historyReady={false} />,
    );

    expect(screen.queryByRole('heading', { name: 'Nenhum simulado ainda' })).not.toBeInTheDocument();
    expect(screen.getByTestId('simulados-history-loading')).toBeInTheDocument();
    expect(container.querySelector('[data-simulados-enrichment="pending"]')).toBeInTheDocument();
  });

  it('erro no P1 preserva a sessão aberta e não mostra empty', () => {
    const { container } = render(
      <SimuladosListClient
        openSession={openLivre}
        recentSessions={[]}
        historyReady
        historyPending
      />,
    );

    expect(screen.getByText('Prova Urgências')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar simulado' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nenhum simulado ainda' })).not.toBeInTheDocument();
    expect(screen.getByTestId('simulados-history-loading')).toBeInTheDocument();
    expect(container.querySelector('[data-simulados-enrichment="error"]')).toBeInTheDocument();
  });

  it('empty real só depois do P1', () => {
    render(<SimuladosListClient openSession={null} recentSessions={[]} historyReady />);

    expect(screen.getByRole('heading', { name: 'Nenhum simulado ainda' })).toBeInTheDocument();
    expect(screen.queryByTestId('simulados-history-loading')).not.toBeInTheDocument();
  });
});

describe('SimuladosHubShell', () => {
  it('expõe título e CTA Novo simulado fora da lista', () => {
    render(
      <SimuladosHubShell>
        <div />
      </SimuladosHubShell>,
    );

    expect(screen.getByRole('heading', { name: 'Simulados' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Missão da semana' })).toHaveAttribute(
      'href',
      '/missao-semanal',
    );
    expect(screen.getByRole('link', { name: 'Novo simulado' })).toHaveAttribute(
      'href',
      '/simulados/novo',
    );
  });
});
