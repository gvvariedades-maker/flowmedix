/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DesempenhoAtividadeDashboard } from '@/components/dashboard/desempenho/DesempenhoAtividadeDashboard';
import type { DesempenhoData } from '@/components/dashboard/performance/types';

const mockRefresh = jest.fn();
const mockFetchWithAuth = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

function buildDados(overrides: Partial<DesempenhoData> = {}): DesempenhoData {
  return {
    hoje: 3,
    metaDiaria: 10,
    streak: 4,
    totalGeral: 12,
    totalTodosTempos: 40,
    serie30dias: Array.from({ length: 30 }, (_, i) => ({
      data: `2026-07-${String(i + 1).padStart(2, '0')}`,
      count: i === 29 ? 3 : 0,
    })),
    topAssuntos: [{ nome: 'Vias de Administração', count: 5 }],
    ...overrides,
  };
}

describe('DesempenhoAtividadeDashboard', () => {
  beforeEach(() => {
    mockRefresh.mockReset();
    mockFetchWithAuth.mockReset();
  });

  it('mostra streak, heatmap e zerar rebaixados (sem placar hero ScoreCard)', () => {
    render(<DesempenhoAtividadeDashboard dados={buildDados()} />);

    expect(screen.getByText(/4 dias seguidos/i)).toBeInTheDocument();
    expect(screen.getByText(/métricas secundárias/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /aba Estudo/i })).toHaveAttribute('href', '/desempenho');
    expect(screen.getByLabelText(/Heatmap de atividade/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zerar histórico/i })).toBeInTheDocument();

    // Não reintroduz o placar hero do dashboard antigo
    expect(screen.queryByText('Questões (30 dias)')).not.toBeInTheDocument();
    expect(screen.queryByText('Total histórico')).not.toBeInTheDocument();
    expect(screen.queryByText('Dia seguido')).not.toBeInTheDocument();
  });

  it('omite Zerar histórico quando não há dados no histórico', () => {
    render(
      <DesempenhoAtividadeDashboard
        dados={buildDados({ totalTodosTempos: 0, totalGeral: 0, topAssuntos: [] })}
      />,
    );
    expect(screen.queryByRole('button', { name: /Zerar histórico/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhuma atividade ainda/i)).toBeInTheDocument();
  });

  it('chama API ao confirmar zerar histórico', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<DesempenhoAtividadeDashboard dados={buildDados()} />);
    fireEvent.click(screen.getByRole('button', { name: /Zerar histórico/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, zerar' }));

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/api/zerar-desempenho', { method: 'POST' });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });
});
