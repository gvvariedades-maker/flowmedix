import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { CadernoProntoCard } from '@/components/dashboard/cadernos/CadernoProntoCard';
import { CADERNO_PACKS } from '@/lib/cadernos/packs';
import type { ResolvedPack } from '@/lib/cadernos/resolvePacks';

jest.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
      <article {...props}>{children}</article>
    ),
  },
}));

jest.mock('@/components/dashboard/cadernos/CadernoProntoCover', () => ({
  CadernoProntoCover: () => <div data-testid="caderno-pronto-cover" />,
}));

function buildPack(overrides: Partial<ResolvedPack> = {}): ResolvedPack {
  const def = CADERNO_PACKS.find((p) => p.id === 'comece-10min')!;
  return {
    def,
    title: def.title,
    slugs: ['q-a', 'q-b', 'q-c'],
    items: [
      { modulo_slug: 'q-a', titulo_aula: 'Imunização', topico: 'Saúde Pública' },
      { modulo_slug: 'q-b', titulo_aula: 'Imunização', topico: 'Saúde Pública' },
      { modulo_slug: 'q-c', titulo_aula: 'Imunização', topico: 'Saúde Pública' },
    ],
    estimatedMinutes: 9,
    clonedNotebookId: null,
    entrySlug: 'q-a',
    studiedCount: 0,
    cta: 'start',
    ...overrides,
  };
}

describe('CadernoProntoCard', () => {
  it('mostra CTA Começar agora quando pack não clonado', () => {
    render(<CadernoProntoCard pack={buildPack()} />);

    expect(screen.getByRole('button', { name: 'Começar agora' })).toBeInTheDocument();
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('mostra CTA Continuar e meta N questões · ~X min', () => {
    render(
      <CadernoProntoCard
        pack={buildPack({
          cta: 'continue',
          clonedNotebookId: 'nb-1',
          entrySlug: 'q-b',
          studiedCount: 1,
        })}
      />,
    );

    expect(screen.getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByText('3 questões · ~9 min')).toBeInTheDocument();
  });

  it('mostra CTA Revisar no estado clonado concluído', () => {
    render(
      <CadernoProntoCard
        pack={buildPack({
          cta: 'review',
          clonedNotebookId: 'nb-2',
          entrySlug: 'q-a',
          studiedCount: 3,
        })}
      />,
    );

    expect(screen.getByRole('link', { name: 'Revisar' })).toBeInTheDocument();
  });

  it('usa href deep-link do caderno quando já clonado', () => {
    render(
      <CadernoProntoCard
        pack={buildPack({
          cta: 'continue',
          clonedNotebookId: 'nb-deep',
          entrySlug: 'q-b',
          studiedCount: 1,
        })}
      />,
    );

    const link = screen.getByRole('link', { name: 'Continuar' });
    expect(link).toHaveAttribute(
      'href',
      '/estudar/q-b?from=caderno&caderno_id=nb-deep',
    );
  });
});
