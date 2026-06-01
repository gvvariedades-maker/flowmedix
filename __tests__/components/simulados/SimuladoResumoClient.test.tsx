import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladoResumoClient } from '@/components/simulados/SimuladoResumoClient';

const mockPush = jest.fn();
const mockCreateSimuladoSession = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/simulado/client', () => ({
  createSimuladoSession: (...args: unknown[]) => mockCreateSimuladoSession(...args),
  SimuladoApiError: class SimuladoApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

const baseSession = {
  id: '44444444-4444-4444-4444-444444444444',
  status: 'concluido' as const,
  modo: 'prova' as const,
  titulo: 'Prova Urgências',
  ritmo_meta_segundos_por_questao: 180,
  prova_iniciada_em: '2026-06-01T10:00:00.000Z',
  total_questoes: 2,
  filtros: { modo: 'prova' },
  created_at: '2026-06-01T09:00:00.000Z',
  concluida_em: '2026-06-01T10:30:00.000Z',
};

const baseResumo = {
  respondidas: 2,
  pendentes: 0,
  acertos: 1,
  erros: 1,
  percentual_acerto: 50,
  tempo_total_ms: 10 * 60_000,
  tempo_medio_ms: 5 * 60_000,
};

const questoesComErro = [
  {
    ordem: 1,
    modulo_slug: 'q1',
    respondida: true as const,
    meta: { banca: 'IDECAN', topico: 'Saúde Pública', subtopico: 'Epidemiologia' },
    acertou: false,
    opcao_id: 'A',
    opcao_correta_id: 'B',
    respondida_em: '2026-06-01T10:00:00.000Z',
    tempo_ms: 60_000,
  },
  {
    ordem: 2,
    modulo_slug: 'q2',
    respondida: true as const,
    meta: { banca: 'IDECAN', topico: 'Ética', subtopico: 'Ética Profissional' },
    acertou: true,
    opcao_id: 'C',
    opcao_correta_id: 'C',
    respondida_em: '2026-06-01T10:05:00.000Z',
    tempo_ms: 45_000,
  },
];

describe('SimuladoResumoClient — modo prova', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSimuladoSession.mockResolvedValue({
      session: { id: '55555555-5555-5555-5555-555555555555' },
    });
  });

  it('exibe comparação de tempo vs meta e CTA com título de nova tentativa', async () => {
    render(
      <SimuladoResumoClient
        session={baseSession}
        resumo={baseResumo}
        questoes={[]}
      />,
    );

    expect(screen.getByText('Tempo')).toBeInTheDocument();
    expect(screen.getByText('Desempenho')).toBeInTheDocument();
    expect(screen.getByText('Acima da meta em 4 min')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Novo simulado com mesmos filtros' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Prova Urgências — tentativa 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Novo simulado com mesmos filtros' }));

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Prova Urgências — tentativa 2',
          ritmo_meta: '3min',
          modo: 'prova',
          from_session_id: baseSession.id,
        }),
      ),
    );
  });

  it('exibe diagnóstico por eixo quando há erros', () => {
    render(
      <SimuladoResumoClient
        session={{ ...baseSession, filtros: { modo: 'prova', bancas: ['IDECAN'] } }}
        resumo={baseResumo}
        questoes={questoesComErro}
      />,
    );

    expect(screen.getByText('Seus pontos fracos')).toBeInTheDocument();
    expect(screen.getByText('Epidemiologia')).toBeInTheDocument();
    expect(
      screen.getByText('Esses são os eixos com mais erros — priorize o que a IDECAN mais cobra.'),
    ).toBeInTheDocument();
  });

  it('oculta diagnóstico por eixo quando acertou tudo', () => {
    render(
      <SimuladoResumoClient
        session={baseSession}
        resumo={{ ...baseResumo, erros: 0, acertos: 2, percentual_acerto: 100 }}
        questoes={questoesComErro.map((item) => ({ ...item, acertou: true }))}
      />,
    );

    expect(screen.queryByText('Seus pontos fracos')).not.toBeInTheDocument();
  });
});
