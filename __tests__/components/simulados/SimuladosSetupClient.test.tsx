import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladosSetupClient } from '@/components/simulados/SimuladosSetupClient';
import { SimuladoApiError } from '@/lib/simulado/client';

const mockPush = jest.fn();
const mockFetchWithAuth = jest.fn();
const mockCreateSimuladoSession = jest.fn();
const mockGetOpenSimuladoSession = jest.fn();
const mockGetSimuladoPoolCount = jest.fn();
const mockListSimuladoTemplates = jest.fn();

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
    getSimuladoPoolCount: (...args: unknown[]) => mockGetSimuladoPoolCount(...args),
    listSimuladoTemplates: (...args: unknown[]) => mockListSimuladoTemplates(...args),
  };
});

jest.mock('@/components/freemium/PaywallModal', () => ({
  PaywallModal: () => null,
}));

jest.mock('@/components/simulados/SimuladoMobileActionBar', () => ({
  SimuladoMobileActionBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SIMULADO_RESUMO_MOBILE_ACTION_SPACER: 'h-[12.5rem]',
}));

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
    mockGetSimuladoPoolCount.mockResolvedValue({ estimated_count: 100 });
    mockListSimuladoTemplates.mockResolvedValue({ templates: [] });
    mockFetchWithAuth.mockImplementation((url: string) => {
      if (url.includes('/api/freemium/status')) {
        return Promise.resolve(
          jsonResponse({
            isPro: true,
            resetEm: new Date().toISOString(),
            simulado: {
              questoesHoje: 0,
              limite: 5,
              restantes: 5,
              limiteAtingido: false,
            },
          }),
        );
      }
      return Promise.resolve(
        jsonResponse({
          bancas: ['FGV', 'CESPE'],
          assuntos: ['Urgências', 'Farmacologia'],
        }),
      );
    });
  });

  it('exibe Iniciar simulado para conta gratuita dentro do limite diário', async () => {
    mockFetchWithAuth.mockImplementation((url: string) => {
      if (url.includes('/api/freemium/status')) {
        return Promise.resolve(
          jsonResponse({
            isPro: false,
            resetEm: new Date().toISOString(),
            simulado: {
              questoesHoje: 0,
              limite: 5,
              restantes: 5,
              limiteAtingido: false,
            },
          }),
        );
      }
      return Promise.resolve(
        jsonResponse({
          bancas: ['FGV'],
          assuntos: ['Urgências'],
        }),
      );
    });

    render(<SimuladosSetupClient />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeEnabled();
  });

  it('envia formulário com sucesso e navega para sessão criada', async () => {
    mockCreateSimuladoSession.mockResolvedValue({
      success: true,
      session: {
        id: '33333333-3333-3333-3333-333333333333',
        total_questoes: 20,
        status: 'aberto',
        modo: 'prova',
        titulo: '',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
        created_at: '2026-05-27T00:00:00.000Z',
      },
      questoes: [{ modulo_slug: 'questao-a', ordem: 1 }],
    });

    render(<SimuladosSetupClient />);

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({
          quantidade: 15,
          modo: 'prova',
          ritmo_meta: '3min',
        }),
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
        modo: 'prova',
        titulo: 'Prova em andamento',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
        created_at: '2026-05-27T00:00:00.000Z',
        filtros: { requested: 20 },
      },
    });

    render(<SimuladosSetupClient />);

    expect(await screen.findByText(/Você tem um simulado em andamento/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar simulado' }));

    expect(mockPush).toHaveBeenCalledWith('/simulados/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });

  it('chama facets e pool-count com múltiplas bancas selecionadas', async () => {
    render(<SimuladosSetupClient />);

    await waitFor(() => {
      const enabled = screen
        .getAllByRole('button', { name: /Adicionar banca/i })
        .find((b) => !(b as HTMLButtonElement).disabled);
      expect(enabled).toBeTruthy();
    });

    const openAddBanca = () => {
      const btn = screen
        .getAllByRole('button', { name: /Adicionar banca/i })
        .find((b) => !(b as HTMLButtonElement).disabled);
      fireEvent.click(btn!);
    };

    openAddBanca();
    fireEvent.click(await screen.findByRole('option', { name: 'FGV' }));

    await waitFor(() =>
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining('/api/vitrine/facets?bancas=FGV'),
      ),
    );

    await waitFor(() =>
      expect(mockGetSimuladoPoolCount).toHaveBeenCalledWith(
        expect.objectContaining({ bancas: ['FGV'] }),
      ),
    );

    openAddBanca();
    fireEvent.click(await screen.findByRole('option', { name: 'CESPE' }));

    await waitFor(() =>
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        expect.stringMatching(/bancas=FGV.*bancas=CESPE|bancas=CESPE.*bancas=FGV/),
      ),
    );

    await waitFor(() =>
      expect(mockGetSimuladoPoolCount).toHaveBeenCalledWith(
        expect.objectContaining({ bancas: ['FGV', 'CESPE'] }),
      ),
    );
  });

  it('força criação de novo simulado quando usuário clica em "Iniciar novo simulado"', async () => {
    mockGetOpenSimuladoSession.mockResolvedValue({
      has_open_session: true,
      session: {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        total_questoes: 20,
        status: 'aberto',
        modo: 'prova',
        titulo: 'Prova aberta',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
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
        modo: 'prova',
        titulo: '',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
        created_at: '2026-05-27T00:00:00.000Z',
      },
      questoes: [],
    });

    render(<SimuladosSetupClient />);
    await screen.findByText(/Você tem um simulado em andamento/);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar novo simulado' }));

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({ forcar_novo: true, modo: 'prova' }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith('/simulados/cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  });

  it('sempre envia modo prova com titulo e ritmo_meta ao criar sessão', async () => {
    mockCreateSimuladoSession.mockResolvedValue({
      success: true,
      session: {
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        total_questoes: 20,
        status: 'aberto',
        modo: 'prova',
        titulo: 'Prova CESPE',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
        created_at: '2026-05-27T00:00:00.000Z',
      },
      questoes: [],
    });

    render(<SimuladosSetupClient />);
    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalled());

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Treino/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nome do simulado/i), {
      target: { value: 'Prova CESPE' },
    });
    fireEvent.change(screen.getByLabelText(/Ritmo sugerido/i), {
      target: { value: '2min' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }));

    await waitFor(() =>
      expect(mockCreateSimuladoSession).toHaveBeenCalledWith(
        expect.objectContaining({
          modo: 'prova',
          titulo: 'Prova CESPE',
          ritmo_meta: '2min',
        }),
      ),
    );
  });

  it('exibe aviso quando quantidade excede pool estimado', async () => {
    mockGetSimuladoPoolCount.mockResolvedValue({ estimated_count: 10 });

    render(<SimuladosSetupClient />);

    expect(
      await screen.findByText(
        /Você pediu 20 questões, mas o pool estimado tem ~10\. Reduza a quantidade ou amplie os filtros\./,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir quantidade' }));

    await waitFor(() =>
      expect(
        screen.queryByText(/Você pediu 20 questões, mas o pool estimado/),
      ).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade' }));

    expect(
      await screen.findByText(
        /Você pediu 20 questões, mas o pool estimado tem ~10\. Reduza a quantidade ou amplie os filtros\./,
      ),
    ).toBeInTheDocument();
  });
});
