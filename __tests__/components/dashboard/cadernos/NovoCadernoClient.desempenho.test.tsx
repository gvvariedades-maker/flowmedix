/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NovoCadernoClient, {
  type NovoCadernoContext,
} from '@/components/dashboard/cadernos/NovoCadernoClient';
import { persistDesempenhoSelecao, readDesempenhoSelecao } from '@/lib/cadernos/desempenhoSelecao';
import type { ModuloTemplateRow } from '@/lib/cadernos/templates';

const mockPush = jest.fn();
const mockFetchWithAuth = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  const Strip = ({ children, ...rest }: { children?: React.ReactNode; [k: string]: unknown }) => {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (k === 'className' || k === 'style' || k === 'role' || k.startsWith('aria-') || k === 'id') {
        safe[k] = v;
      }
    }
    return React.createElement('div', safe, children);
  };
  return {
    motion: { div: Strip },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => true,
  };
});

const modulos: ModuloTemplateRow[] = [
  { modulo_slug: 'vias-1', titulo_aula: 'Vias de Administração', modulo_nome: 'Farmaco', banca: 'CPCON' },
  { modulo_slug: 'vias-2', titulo_aula: 'Vias de Administração', modulo_nome: 'Farmaco', banca: 'CPCON' },
  { modulo_slug: 'imun-1', titulo_aula: 'Imunização', modulo_nome: 'Saúde Pública', banca: 'CPCON' },
];

function buildContext(overrides: Partial<NovoCadernoContext> = {}): NovoCadernoContext {
  return {
    wizard: true,
    origem: 'desempenho',
    edital: { nome: 'Edital', banca: 'CPCON', orgao: null, ano: null, slug: 'x' },
    modulos,
    ...overrides,
  };
}

/** AnimatePresence troca de passo em `mode="wait"`: aguardar o passo 2 montar. */
async function irParaPasso2(nome = 'Meus erros') {
  fireEvent.change(screen.getByLabelText(/Nome do caderno/), { target: { value: nome } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  await screen.findByRole('button', { name: /Criar e adicionar questões/ });
}

describe('NovoCadernoClient — origem desempenho (lote estrito)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockFetchWithAuth.mockReset();
    window.sessionStorage.clear();
  });

  it('adiciona só questões dos assuntos marcados no hub', async () => {
    persistDesempenhoSelecao(['Vias de Administração']);
    mockFetchWithAuth
      .mockResolvedValueOnce({ ok: true, json: async () => ({ notebook: { id: 'nb1' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ added: 2 }) });

    render(<NovoCadernoClient context={buildContext()} />);
    await irParaPasso2();

    expect(screen.getByText('Assuntos escolhidos no seu desempenho')).toBeInTheDocument();
    expect(
      screen.getByText(/Vamos adicionar 2 questões — só desses assuntos, sem completar com outros\./),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Criar e adicionar questões/ }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/cadernos/nb1?setup=done'));

    const itemsCall = mockFetchWithAuth.mock.calls[1]!;
    expect(itemsCall[0]).toBe('/api/notebooks/nb1/items');
    const enviados = JSON.parse((itemsCall[1] as { body: string }).body).items as {
      modulo_slug: string;
      titulo_aula: string;
    }[];
    expect(enviados.map((i) => i.modulo_slug).sort()).toEqual(['vias-1', 'vias-2']);
    expect(enviados.every((i) => i.titulo_aula === 'Vias de Administração')).toBe(true);
    // Seleção consumida: outro caderno não herda os assuntos.
    expect(readDesempenhoSelecao()).toEqual([]);
  });

  it('seleção perdida avisa e não deixa criar lote inventado', async () => {
    render(<NovoCadernoClient context={buildContext()} />);
    await irParaPasso2();

    expect(screen.getByRole('alert')).toHaveTextContent(
      /Não encontramos os assuntos selecionados/,
    );
    expect(screen.getByRole('link', { name: 'Voltar ao meu desempenho' })).toHaveAttribute(
      'href',
      '/desempenho',
    );
    const criar = screen.getByRole('button', { name: /Criar e adicionar questões/ });
    expect(criar).toBeDisabled();
    expect(mockFetchWithAuth).not.toHaveBeenCalled();

    // Defesa em profundidade: mesmo forçando o clique, o handler não chama a API.
    criar.removeAttribute('disabled');
    fireEvent.click(criar);
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/Não encontramos os assuntos selecionados/);
  });

  it('assunto sem questão liberada bloqueia mesmo com CTA forçado', async () => {
    persistDesempenhoSelecao(['Saúde do Adolescente']);
    render(<NovoCadernoClient context={buildContext()} />);
    await irParaPasso2();

    expect(
      screen.getByText(/Nenhuma questão liberada nesses assuntos\./),
    ).toBeInTheDocument();
    const criar = screen.getByRole('button', { name: /Criar e adicionar questões/ });
    expect(criar).toBeDisabled();
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    criar.removeAttribute('disabled');
    fireEvent.click(criar);
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  it('origem edital usa wizard de 3 etapas (sem modo estrito)', async () => {
    render(<NovoCadernoClient context={buildContext({ origem: 'edital' })} />);
    fireEvent.change(screen.getByLabelText(/Nome do caderno/), { target: { value: 'Meus erros' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));

    expect(await screen.findByText('2 de 3')).toBeInTheDocument();
    expect(screen.queryByText('Assuntos escolhidos no seu desempenho')).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Revisar/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Criar e adicionar questões/ })).not.toBeInTheDocument();
  });
});
