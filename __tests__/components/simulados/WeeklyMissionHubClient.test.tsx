import { render, screen } from '@testing-library/react';
import { WeeklyMissionHubClient } from '@/components/simulados/WeeklyMissionHubClient';

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('@/components/vitrine/WeeklySimuladoMissionCard', () => ({
  WeeklySimuladoMissionCard: () => <div data-testid="weekly-mission-card">Mission card</div>,
}));

const baseData = {
  mission: {
    iso_year: 2026,
    iso_week: 25,
    week_ends_at: '2026-06-22T23:59:59.999Z',
    foco_principal: 'Farmacologia',
    status: 'pendente' as const,
    titulo: 'Simulado da Semana #25 - Farmacologia',
    session_id: null,
    total_questoes: 10,
    respondidas: 0,
    percentual_acerto: null,
  },
  history: [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      iso_year: 2026,
      iso_week: 24,
      titulo: 'Simulado da Semana #24 - Epidemiologia',
      foco_principal: 'Epidemiologia',
      weekly_ordinal: 1,
      status: 'concluido' as const,
      total_questoes: 10,
      percentual_acerto: 50,
      concluida_em: '2026-06-12T12:00:00.000Z',
      created_at: '2026-06-12T10:00:00.000Z',
    },
  ],
  semanas_consecutivas: 2,
  weekly_evolution: null,
};

describe('WeeklyMissionHubClient', () => {
  it('renderiza título, card da missão e histórico', () => {
    render(<WeeklyMissionHubClient initialData={baseData} />);

    expect(screen.getByRole('heading', { name: 'Missão da semana' })).toBeInTheDocument();
    expect(screen.getByTestId('weekly-mission-card')).toBeInTheDocument();
    expect(screen.getByText('Histórico de missões')).toBeInTheDocument();
    expect(screen.getByText('1º simulado semanal')).toBeInTheDocument();
    expect(screen.getByText('Streak de missões')).toBeInTheDocument();
    expect(screen.getByText('semanas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Simulados livres' })).toHaveAttribute(
      'href',
      '/simulados',
    );
  });
});
