import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import VitrineSubjectSheet from '@/components/vitrine/VitrineSubjectSheet';

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

describe('VitrineSubjectSheet', () => {
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
