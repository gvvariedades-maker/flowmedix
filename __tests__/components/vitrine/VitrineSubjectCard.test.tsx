import { act, fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';
import VitrineSubjectCard from '@/components/vitrine/VitrineSubjectCard';

const mockUseDashboardDesktop = useDashboardDesktop as jest.MockedFunction<
  typeof useDashboardDesktop
>;
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

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/layout/useDashboardDesktop', () => ({
  useDashboardDesktop: jest.fn(() => true),
}));

function buildGrupo(overrides: Partial<VitrineGrupoSubtopico> = {}): VitrineGrupoSubtopico {
  return {
    titulo_aula: 'Verificação de Sinais Vitais',
    modulo_nome: 'Procedimentos',
    banca: 'EBSERH',
    questoes: [
      {
        slug: 'q-001',
        numero: 1,
        status: 'estudada',
        avant_codigo: 42,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        slug: 'q-002',
        numero: 2,
        status: 'nao_estudada',
        avant_codigo: 43,
        created_at: '2024-01-02T00:00:00Z',
      },
    ],
    acertos: 1,
    erros: 0,
    totalResolvidas: 1,
    totalQuestoes: 2,
    totalNeuroSlides: 8,
    trabalhadas: 1,
    percentual: 50,
    firstSlug: 'q-001',
    ...overrides,
  };
}

/** Amostra ≥ 5 para liberar % de acerto no hero. */
function buildGrupoComAmostra(
  overrides: Partial<VitrineGrupoSubtopico> = {},
): VitrineGrupoSubtopico {
  const questoes = Array.from({ length: 10 }, (_, i) => ({
    slug: `q-${String(i + 1).padStart(3, '0')}`,
    numero: i + 1,
    status: (i < 8 ? 'estudada' : 'nao_estudada') as 'estudada' | 'nao_estudada',
    avant_codigo: 40 + i,
    created_at: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  }));
  return buildGrupo({
    questoes,
    acertos: 4,
    erros: 4,
    totalResolvidas: 8,
    totalQuestoes: 10,
    trabalhadas: 8,
    percentual: 50,
    totalNeuroSlides: 40,
    firstSlug: 'q-001',
    ...overrides,
  });
}

function countEstudarLinks(root: HTMLElement) {
  return root.querySelectorAll('a[href*="/estudar"]').length;
}

function renderInVitrineList(ui: ReactElement) {
  return render(<div data-testid="vitrine-list">{ui}</div>);
}

describe('VitrineSubjectCard', () => {
  beforeEach(() => {
    mockLink.mockClear();
    mockUseDashboardDesktop.mockReturnValue(true);
  });

  it('renderiza barra de cobertura quando há respondidas', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Cobertura do assunto: 1/2 respondidas',
    );
  });

  it('expõe title no título do assunto', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getByTitle('Verificação de Sinais Vitais')).toBeInTheDocument();
  });

  it('mostra CTA Continuar quando há progresso parcial', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('link', { name: 'Continuar' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Continuar' }).className).toContain(
      'btn-editorial-secondary',
    );
    expect(screen.getByRole('link', { name: 'Continuar' }).className).not.toMatch(/uppercase/);
    expect(mockLink.mock.calls.map(([props]) => props.prefetch)).not.toContain(false);
    expect(screen.getByRole('link', { name: 'Continuar' })).not.toHaveAttribute('prefetch');
  });

  it('mostra CTA Iniciar quando assunto não foi iniciado', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({
          totalResolvidas: 0,
          trabalhadas: 0,
          acertos: 0,
          percentual: 0,
          questoes: [
            {
              slug: 'q-001',
              numero: 1,
              status: 'nao_estudada',
              avant_codigo: 42,
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
        })}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('link', { name: 'Iniciar' })).toHaveLength(1);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByLabelText('Nenhuma questão respondida')).toHaveTextContent(
      'Não iniciado',
    );
  });

  it('mostra CTA Revisar quando estudo reverso está completo', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({
          totalResolvidas: 2,
          trabalhadas: 2,
          acertos: 2,
          percentual: 100,
          questoes: [
            {
              slug: 'q-001',
              numero: 1,
              status: 'estudada',
              avant_codigo: 42,
              created_at: '2024-01-01T00:00:00Z',
            },
            {
              slug: 'q-002',
              numero: 2,
              status: 'estudada',
              avant_codigo: 43,
              created_at: '2024-01-02T00:00:00Z',
            },
          ],
        })}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('link', { name: 'Revisar' })).toHaveLength(1);
    expect(screen.getByLabelText('2 de 2 acertos')).toHaveTextContent('2/2 acertos');
  });

  it('não repete pendência no subtítulo fechado (cobertura + NeuroSlides)', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const titleButton = screen.getByTitle('Verificação de Sinais Vitais').closest('button');
    expect(titleButton).not.toBeNull();
    expect(titleButton).not.toHaveTextContent(/para estudar/i);
    expect(titleButton).toHaveTextContent(/respondidas/i);
    expect(titleButton).toHaveTextContent(/NeuroSlides/i);
    expect(screen.getByLabelText('1 de 1 acertos')).toHaveTextContent('1/1 acertos');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('mostra % de acerto no hero quando amostra ≥ 5', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupoComAmostra()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('50% de acerto')).toHaveTextContent('50%');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Cobertura do assunto: 8/10 respondidas',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
  });

  it('mostra pendência no painel expandido com badge neutro', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getByText(/1 para estudar/i)).toBeInTheDocument();
  });

  it('em modo compact mantém hero de acerto e barra de cobertura', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
        compact
      />,
    );

    expect(screen.getByLabelText('1 de 1 acertos')).toHaveTextContent('1/1 acertos');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('mostra Não iniciado com aria de respondidas e focus-visible no título e chevron', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({ trabalhadas: 0, totalResolvidas: 0, acertos: 0, percentual: 0 })}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const zeroLabel = screen.getByLabelText('Nenhuma questão respondida');
    expect(zeroLabel).toHaveTextContent('Não iniciado');
    expect(zeroLabel.className).toContain('text-slate-500');
    expect(zeroLabel.className).not.toContain('text-slate-300');

    const titleButton = screen.getByTitle('Verificação de Sinais Vitais').closest('button');
    expect(titleButton?.className).toMatch(/focus-visible:ring/);

    const chevron = screen.getByRole('button', { name: 'Expandir assunto' });
    expect(chevron.className).toMatch(/size-11/);
    expect(chevron.className).toMatch(/focus-visible:ring/);
  });

  it('coloca badge Novo na primeira linha sem padding reservado', () => {
    const { container } = render(
      <VitrineSubjectCard
        grupo={buildGrupo({
          totalResolvidas: 0,
          trabalhadas: 0,
          acertos: 0,
          percentual: 0,
          questoes: [
            {
              slug: 'q-001',
              numero: 1,
              status: 'nao_estudada',
              avant_codigo: 42,
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
        })}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Assunto novo')).toBeInTheDocument();
    const headerRow = container.querySelector('.flex.items-center.gap-3');
    expect(headerRow?.className).not.toMatch(/pt-9|pt-10/);
  });

  it('usa chip neutro quando fechado e accent colorido quando expandido', () => {
    const { rerender, container } = render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const closedChip = container.querySelector('[aria-hidden].rounded-xl.border');
    expect(closedChip?.className).toContain('bg-slate-50');
    expect(closedChip?.className).toContain('border-slate-200');

    rerender(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const openChip = container.querySelector('[aria-hidden].rounded-xl.border');
    expect(openChip?.className).not.toContain('bg-slate-50');
  });

  it('usa brand-text no % com amostra e rótulos de taxa de acerto', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupoComAmostra()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const pct = screen.getByLabelText('50% de acerto');
    expect(pct.className).toContain('text-[var(--color-brand-text)]');

    const acertoLabel = screen.getByText('Taxa de acerto');
    expect(acertoLabel.className).toContain('text-[11px]');
    expect(acertoLabel.className).not.toContain('text-[10px]');

    const assuntoLabel = screen.getByText(/questões no assunto/i);
    expect(assuntoLabel.className).toContain('text-[11px]');
    expect(assuntoLabel.className).not.toContain('text-[10px]');
  });

  it('omite aria-controls e não monta o painel quando o assunto está recolhido', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const chevron = screen.getByRole('button', { name: 'Expandir assunto' });
    expect(chevron).not.toHaveAttribute('aria-controls');
    const titleButton = screen.getByTitle('Verificação de Sinais Vitais').closest('button');
    expect(titleButton).not.toHaveAttribute('aria-controls');
    expect(document.getElementById('assunto-panel-q-001')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Entrar no assunto' })).not.toBeInTheDocument();
    expect(screen.queryByText('Ir para questão')).not.toBeInTheDocument();
    expect(screen.queryByText(/Questão 01/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('monta o painel e liga aria-controls quando expandido no desktop', () => {
    renderInVitrineList(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const list = screen.getByTestId('vitrine-list');
    const panel = document.getElementById('assunto-panel-q-001');
    expect(panel).not.toBeNull();
    const chevron = screen.getByRole('button', { name: 'Recolher assunto' });
    expect(chevron).toHaveAttribute('aria-controls', 'assunto-panel-q-001');
    const titleButton = screen.getByTitle('Verificação de Sinais Vitais').closest('button');
    expect(titleButton).toHaveAttribute('aria-controls', 'assunto-panel-q-001');
    expect(screen.getByRole('link', { name: 'Entrar no assunto' })).toBeInTheDocument();
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(list).not.toHaveTextContent('Questão 01');
    expect(countEstudarLinks(list)).toBeLessThanOrEqual(30);
    expect(mockLink.mock.calls.map(([props]) => props.prefetch)).not.toContain(false);
  });

  it('em compacto recolhido no desktop não monta o painel', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
        compact
      />,
    );

    expect(document.getElementById('assunto-panel-q-001')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Entrar no assunto' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Questão 01/)).not.toBeInTheDocument();
  });

  it('em compacto expandido no desktop monta o painel inline', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
        compact
      />,
    );

    expect(document.getElementById('assunto-panel-q-001')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Entrar no assunto' })).toBeInTheDocument();
  });

  it('no mobile não monta o painel desktop mesmo com assunto expandido', () => {
    mockUseDashboardDesktop.mockReturnValue(false);

    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    expect(document.getElementById('assunto-panel-q-001')).toBeNull();
    const titleButton = screen.getByTitle('Verificação de Sinais Vitais').closest('button');
    expect(titleButton).not.toHaveAttribute('aria-controls');
    expect(titleButton).toHaveAttribute('aria-haspopup', 'dialog');
    const chevron = screen.getByRole('button', { name: 'Recolher assunto' });
    expect(chevron).not.toHaveAttribute('aria-controls');
    expect(chevron).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('com 12 cards recolhidos no desktop não monta links de questão na subárvore', () => {
    const grupos = Array.from({ length: 12 }, (_, cardIndex) => {
      const questoes = Array.from({ length: 200 }, (_, i) => ({
        slug: `card-${cardIndex}-q-${String(i + 1).padStart(3, '0')}`,
        numero: i + 1,
        status: 'nao_estudada' as const,
        avant_codigo: 1000 + cardIndex * 1000 + i,
        created_at: '2024-01-01T00:00:00Z',
      }));
      return buildGrupo({
        titulo_aula: `Assunto ${cardIndex + 1}`,
        questoes,
        totalQuestoes: 200,
        totalResolvidas: 0,
        trabalhadas: 0,
        acertos: 0,
        percentual: 0,
        firstSlug: questoes[0].slug,
      });
    });

    mockUseDashboardDesktop.mockReturnValue(true);

    renderInVitrineList(
      <>
        {grupos.map((grupo, index) => (
          <VitrineSubjectCard
            key={grupo.firstSlug}
            grupo={grupo}
            estudarQuery=""
            index={index}
            assuntoExpandido={false}
            onAssuntoExpandedChange={jest.fn()}
          />
        ))}
      </>,
    );

    const list = screen.getByTestId('vitrine-list');
    const nos = list.querySelectorAll('*').length;
    const linksEstudar = countEstudarLinks(list);
    expect({
      seletor: '[data-testid="vitrine-list"]',
      nos,
      linksEstudar,
    }).toEqual({
      seletor: '[data-testid="vitrine-list"]',
      nos: 324,
      linksEstudar: 12,
    });
    expect(list).not.toHaveTextContent('Questão 01');
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.queryByText('Ir para questão')).not.toBeInTheDocument();
  });

  describe('corrida rAF ao recolher o assunto', () => {
    type RafEntry = { id: number; cb: FrameRequestCallback };
    let rafQueue: RafEntry[] = [];
    let rafId = 0;

    beforeEach(() => {
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

    it('recolher o assunto antes do rAF não monta itens', () => {
      const grupo = buildGrupo();
      const { rerender } = renderInVitrineList(
        <VitrineSubjectCard
          grupo={grupo}
          estudarQuery=""
          index={0}
          assuntoExpandido
          onAssuntoExpandedChange={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Ver 2 questões/i }));
      expect(rafQueue).toHaveLength(1);
      expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();

      rerender(
        <div data-testid="vitrine-list">
          <VitrineSubjectCard
            grupo={grupo}
            estudarQuery=""
            index={0}
            assuntoExpandido={false}
            onAssuntoExpandedChange={jest.fn()}
          />
        </div>,
      );

      act(() => {
        const pending = [...rafQueue];
        rafQueue = [];
        for (const entry of pending) {
          entry.cb(0);
        }
      });

      const list = screen.getByTestId('vitrine-list');
      expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
      expect(list).not.toHaveTextContent('Questão 01');
      expect(document.getElementById('assunto-panel-q-001')).toBeNull();
    });

    it('callback órfão após recolher o assunto não remonta os itens', () => {
      const grupo = buildGrupo();
      const { rerender } = renderInVitrineList(
        <VitrineSubjectCard
          grupo={grupo}
          estudarQuery=""
          index={0}
          assuntoExpandido
          onAssuntoExpandedChange={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Ver 2 questões/i }));
      expect(rafQueue).toHaveLength(1);
      const orfao = rafQueue[0]!.cb;

      rerender(
        <div data-testid="vitrine-list">
          <VitrineSubjectCard
            grupo={grupo}
            estudarQuery=""
            index={0}
            assuntoExpandido={false}
            onAssuntoExpandedChange={jest.fn()}
          />
        </div>,
      );

      act(() => {
        orfao(0);
      });

      const list = screen.getByTestId('vitrine-list');
      expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
      expect(list).not.toHaveTextContent('Questão 01');
    });
  });
});
