import { act, fireEvent, render, screen } from '@testing-library/react';
import type { VitrineQuestaoItem } from '@/lib/vitrine/types';
import { VitrineQuestaoList } from '@/components/vitrine/VitrineQuestaoList';

const mockLink = jest.fn();

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    prefetch?: boolean;
  }) {
    mockLink({ href, prefetch, ...props });
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

type RafEntry = { id: number; cb: FrameRequestCallback };

function buildQuestoes(count: number): VitrineQuestaoItem[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `q-${String(i + 1).padStart(3, '0')}`,
    numero: i + 1,
    status: i === 0 ? 'estudada' : 'nao_estudada',
    avant_codigo: 40 + i,
    created_at: '2024-01-01T00:00:00Z',
  }));
}

describe('VitrineQuestaoList', () => {
  let rafQueue: RafEntry[] = [];
  let rafId = 0;

  beforeEach(() => {
    mockLink.mockClear();
    rafQueue = [];
    rafId = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafId += 1;
      const id = rafId;
      rafQueue.push({ id, cb });
      return id;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      rafQueue = rafQueue.filter((entry) => entry.id !== id);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function flushRaf() {
    act(() => {
      const pending = [...rafQueue];
      rafQueue = [];
      for (const entry of pending) {
        entry.cb(0);
      }
    });
  }

  function renderList(
    overrides: Partial<{
      totalQuestoes: number;
      questoes: VitrineQuestaoItem[];
    }> = {},
  ) {
    const questoes = overrides.questoes ?? buildQuestoes(3);
    return render(
      <div data-testid="vitrine-list">
        <VitrineQuestaoList
          tituloAula="Verificação de Sinais Vitais"
          firstSlug={questoes[0]?.slug ?? 'q-001'}
          totalQuestoes={overrides.totalQuestoes ?? questoes.length}
          questoes={questoes}
          estudarQuery=""
        />
      </div>,
    );
  }

  function countEstudarLinks(root: HTMLElement) {
    return root.querySelectorAll('a[href*="/estudar"]').length;
  }

  it('mantém jump e botão com a lista fechada, sem montar itens', () => {
    renderList();

    const list = screen.getByTestId('vitrine-list');
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver 3 questões/i })).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(list).not.toHaveTextContent('Questão 01');
    expect(countEstudarLinks(list)).toBe(0);
  });

  it('com 200 questões fechadas não monta links na subárvore', () => {
    renderList({ questoes: buildQuestoes(200) });

    const list = screen.getByTestId('vitrine-list');
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver 200 questões/i })).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(list).not.toHaveTextContent('Questão 01');
    expect(countEstudarLinks(list)).toBe(0);
  });

  it('no clique Ver questões pinta o botão e o container antes dos itens', () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: /Ver 3 questões/i }));

    expect(screen.getByRole('button', { name: /Ocultar questões/i })).toBeInTheDocument();
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.queryByText('Questão 01')).not.toBeInTheDocument();
  });

  it('monta os itens só depois do paint (rAF/effect)', () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: /Ver 3 questões/i }));
    flushRaf();

    const list = screen.getByTestId('vitrine-list');
    expect(screen.getByTestId('vitrine-questao-items')).toBeInTheDocument();
    expect(list).toHaveTextContent('Questão 01');
    expect(countEstudarLinks(list)).toBe(3);
    expect(mockLink.mock.calls.map(([props]) => props.prefetch)).toEqual([
      false,
      false,
      false,
    ]);
    expect(list.querySelector('a[prefetch]')).toBeNull();
  });

  it('desmonta os itens no mesmo tick ao fechar', () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: /Ver 3 questões/i }));
    flushRaf();
    expect(screen.getByTestId('vitrine-questao-items')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ocultar questões/i }));

    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver 3 questões/i })).toBeInTheDocument();
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.queryByText('Questão 01')).not.toBeInTheDocument();
  });

  it('cancela o rAF pendente se fechar antes do paint', () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: /Ver 3 questões/i }));
    expect(rafQueue).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /Ocultar questões/i }));
    flushRaf();

    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.queryByText('Questão 01')).not.toBeInTheDocument();
  });

  it('callback órfão após Ocultar não remonta os itens', () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: /Ver 3 questões/i }));
    expect(rafQueue).toHaveLength(1);
    const orfao = rafQueue[0]!.cb;

    fireEvent.click(screen.getByRole('button', { name: /Ocultar questões/i }));
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();

    act(() => {
      orfao(0);
    });

    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.queryByText('Questão 01')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver 3 questões/i })).toBeInTheDocument();
  });

  it('traz o rodapé truncado junto dos itens, não no chrome fechado', () => {
    renderList({
      questoes: buildQuestoes(2),
      totalQuestoes: 10,
    });

    expect(screen.getByText(/A lista abaixo mostra as primeiras 2 de 10/)).toBeInTheDocument();
    expect(screen.queryByText(/Próxima pendente/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver 2 de 10 questões/i }));
    flushRaf();

    const items = screen.getByTestId('vitrine-questao-items');
    expect(items).toHaveTextContent('Próxima pendente');
    expect(items).toHaveTextContent('+8 questões neste assunto.');
    expect(mockLink.mock.calls.map(([props]) => props.prefetch)).toEqual([
      false,
      false,
      false,
    ]);
  });
});
