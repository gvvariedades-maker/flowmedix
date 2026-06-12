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

    expect(screen.getAllByRole('link', { name: 'Continuar' }).length).toBeGreaterThan(0);
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

    expect(screen.getAllByRole('link', { name: 'Iniciar' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('mostra CTA Revisar quando assunto está completo', () => {
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

    expect(screen.getAllByRole('link', { name: 'Revisar' }).length).toBeGreaterThan(0);
  });
});
