import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import VitrineSubjectSheet from '@/components/vitrine/VitrineSubjectSheet';

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

jest.mock('@/lib/hooks/useClientMounted', () => ({
  useClientMounted: () => true,
}));

jest.mock('@/lib/layout/useMobileSheetKeyboardInset', () => ({
  useMobileSheetKeyboardInset: () => 0,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

function buildGrupo(): VitrineGrupoSubtopico {
  return {
    titulo_aula: 'Verificação de Sinais Vitais',
    modulo_nome: 'Procedimentos',
    banca: 'EBSERH',
    questoes: [
      {
        slug: 'q-001',
        numero: 1,
        status: 'nao_estudada',
        avant_codigo: 42,
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    acertos: 0,
    erros: 0,
    totalResolvidas: 0,
    totalQuestoes: 1,
    totalNeuroSlides: 4,
    trabalhadas: 0,
    percentual: 0,
    firstSlug: 'q-001',
  };
}

function countEstudarLinks(root: HTMLElement) {
  return root.querySelectorAll('a[href*="/estudar"]').length;
}

function renderInVitrineList(ui: ReactElement) {
  return render(<div data-testid="vitrine-list">{ui}</div>);
}

describe('VitrineSubjectSheet', () => {
  beforeEach(() => {
    mockLink.mockClear();
  });

  it('fecha com Escape', () => {
    const onClose = jest.fn();

    render(
      <VitrineSubjectSheet
        open
        onClose={onClose}
        grupo={buildGrupo()}
        estudarQuery=""
      />,
    );

    expect(screen.getByTestId('vitrine-subject-sheet')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não monta lista nem itens quando fechado', () => {
    renderInVitrineList(
      <VitrineSubjectSheet
        open={false}
        onClose={jest.fn()}
        grupo={buildGrupo()}
        estudarQuery=""
      />,
    );

    const list = screen.getByTestId('vitrine-list');
    expect(screen.queryByTestId('vitrine-subject-sheet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(screen.queryByText('Ir para questão')).not.toBeInTheDocument();
    expect(list).not.toHaveTextContent('Questão 01');
    expect(countEstudarLinks(list)).toBe(0);
  });

  it('com sheet aberto mostra jump sem montar itens', () => {
    render(
      <VitrineSubjectSheet
        open
        onClose={jest.fn()}
        grupo={buildGrupo()}
        estudarQuery=""
      />,
    );

    const sheet = screen.getByTestId('vitrine-subject-sheet');
    expect(screen.getByText('Ir para questão')).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-questao-items')).not.toBeInTheDocument();
    expect(sheet).not.toHaveTextContent('Questão 01');
    expect(countEstudarLinks(sheet)).toBeLessThanOrEqual(2);
    expect(mockLink.mock.calls.map(([props]) => props.prefetch)).not.toContain(false);
  });

  it('expõe dialog acessível com título do assunto', () => {
    render(
      <VitrineSubjectSheet
        open
        onClose={jest.fn()}
        grupo={buildGrupo()}
        estudarQuery=""
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Verificação de Sinais Vitais' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar no assunto' })).toBeInTheDocument();
  });
});
