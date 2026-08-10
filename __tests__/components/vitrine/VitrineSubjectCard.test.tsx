import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import VitrineSubjectCard from '@/components/vitrine/VitrineSubjectCard';

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

describe('VitrineSubjectCard', () => {
  it('renderiza barra de progresso quando trabalhadas > 0', () => {
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
  });

  it('mostra CTA Iniciar quando assunto não foi iniciado', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({
          totalResolvidas: 0,
          trabalhadas: 0,
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
    expect(screen.getByLabelText('0% concluído')).toHaveTextContent('Não iniciado');
  });

  it('mostra CTA Revisar e label Concluído quando assunto está completo', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({
          totalResolvidas: 2,
          trabalhadas: 2,
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
    const concluido = screen.getByLabelText('100% concluído');
    expect(concluido).toHaveTextContent('Concluído');
    expect(concluido.className).toContain('text-[var(--color-success-text)]');
  });

  it('não repete pendência no subtítulo fechado (só % + barra)', () => {
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
    expect(titleButton).toHaveTextContent(/NeuroSlides/i);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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

  it('em modo compact mantém % e barra de progresso', () => {
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

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('mostra Não iniciado com aria-label 0% e focus-visible no título e chevron', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo({ trabalhadas: 0, totalResolvidas: 0 })}
        estudarQuery=""
        index={0}
        assuntoExpandido={false}
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const zeroLabel = screen.getByLabelText('0% concluído');
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

  it('usa brand-text no % com progresso e piso 11px nos rótulos uppercase do card', () => {
    render(
      <VitrineSubjectCard
        grupo={buildGrupo()}
        estudarQuery=""
        index={0}
        assuntoExpandido
        onAssuntoExpandedChange={jest.fn()}
      />,
    );

    const pct = screen.getByText('50%');
    expect(pct.className).toContain('text-[var(--color-brand-text)]');

    const trabalhadasLabel = screen.getByText('Questões trabalhadas');
    expect(trabalhadasLabel.className).toContain('text-[11px]');
    expect(trabalhadasLabel.className).not.toContain('text-[10px]');

    const assuntoLabel = screen.getByText(/questões no assunto/i);
    expect(assuntoLabel.className).toContain('text-[11px]');
    expect(assuntoLabel.className).not.toContain('text-[10px]');
  });
});
