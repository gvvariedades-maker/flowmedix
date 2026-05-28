import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladosSetupClient } from '@/components/simulados/SimuladosSetupClient';
import { SimuladoApiError } from '@/lib/simulado/client';

const mockPush = jest.fn();
const mockFetchWithAuth = jest.fn();
const mockCreateSimuladoSession = jest.fn();
const mockGetOpenSimuladoSession = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => mockPush(...args),
  }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

jest.mock('@/lib/simulado/client', () => {
  const original = jest.requireActual('@/lib/simulado/client');
  return {
    ...original,
    createSimuladoSession: (...args: unknown[]) => mockCreateSimuladoSession(...args),
    getOpenSimuladoSession: (...args: unknown[]) => mockGetOpenSimuladoSession(...args),
  };
});

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ value, onValueChange, children }: any) => (
      <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
        {children}
      </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option value="__placeholder__">{placeholder}</option>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  };
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('SimuladosSetupClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOpenSimuladoSession.mockResolvedValue({
      has_open_session: false,
      session: null,
    });
    mockFetchWithAuth.mockResolvedValue(
      jsonResponse({
        bancas: ['FGV'],
        assuntos: ['Urgências'],
      }),
    );
  });

  it('envia formulário com sucesso e navega para sessão criada', async () => {
    mockCreateSimuladoSession.mockResolvedValue({
      success: true,
      session: {
        id: '33333333-3333-3333-3333-333333333333',
        total_questoes: 20,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
      },
      questoes: [{ modulo_slug: 'questao-a', ordem: 1 }],
    });

    render(<SimuladosSetupClient />);

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Quantidade de questões'), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({ quantidade: 15, modo: 'treino' }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith('/simulados/33333333-3333-3333-3333-333333333333');
  });

  it('mostra empty state quando API retorna 404 sem questões', async () => {
    mockCreateSimuladoSession.mockRejectedValue(
      new SimuladoApiError(404, 'Nenhuma questão disponível'),
    );

    render(<SimuladosSetupClient />);
    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));

    expect(
      await screen.findByText('Não há questões acessíveis com os filtros atuais. Amplie a busca ou remova filtros.'),
    ).toBeInTheDocument();
  });

  it('exibe CTA para continuar quando há sessão aberta', async () => {
    mockGetOpenSimuladoSession.mockResolvedValue({
      has_open_session: true,
      session: {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        total_questoes: 20,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
        filtros: { requested: 20 },
      },
    });

    render(<SimuladosSetupClient />);

    expect(await screen.findByText(/Você tem um simulado em andamento/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar simulado' }));

    expect(mockPush).toHaveBeenCalledWith('/simulados/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });

  it('força criação de novo simulado quando usuário clica em "Iniciar novo simulado"', async () => {
    mockGetOpenSimuladoSession.mockResolvedValue({
      has_open_session: true,
      session: {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        total_questoes: 20,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
        filtros: {},
      },
    });
    mockCreateSimuladoSession.mockResolvedValue({
      success: true,
      resumed: false,
      session: {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        total_questoes: 10,
        status: 'aberto',
        modo: 'treino',
        created_at: '2026-05-27T00:00:00.000Z',
      },
      questoes: [],
    });

    render(<SimuladosSetupClient />);
    await screen.findByText(/Você tem um simulado em andamento/);

    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar novo simulado' })[0]);

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({ forcar_novo: true }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith('/simulados/cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  });
});
