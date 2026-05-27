import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladosSetupClient } from '@/components/simulados/SimuladosSetupClient';
import { SimuladoApiError } from '@/lib/simulado/client';

const mockPush = jest.fn();
const mockFetchWithAuth = jest.fn();
const mockCreateSimuladoSession = jest.fn();

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
        expect.objectContaining({ quantidade: 15 }),
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
});
