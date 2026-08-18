/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RecentAttemptsList } from '@/components/dashboard/desempenho/RecentAttemptsList';
import type { RecentAttempt } from '@/lib/desempenho/types';

const TITULO_LONGO =
  'Infecções Sexualmente Transmissíveis (ISTs) — protocolo de triagem na atenção básica';

function attempt(overrides: Partial<RecentAttempt> = {}): RecentAttempt {
  return {
    id: 'h1',
    moduloSlug: 'ists-triagem',
    tituloAula: TITULO_LONGO,
    acertou: false,
    estudoReversoConcluido: false,
    createdAt: '2026-08-10T12:00:00.000Z',
    ...overrides,
  };
}

describe('RecentAttemptsList', () => {
  it('título longo e etiqueta Erro coexistem sem truncate no título', () => {
    render(<RecentAttemptsList attempts={[attempt()]} />);

    const titulo = screen.getByTestId('recent-attempt-title');
    expect(titulo).toHaveTextContent(TITULO_LONGO);
    expect(titulo.className).not.toMatch(/\btruncate\b/);
    expect(screen.getByTestId('recent-attempt-badges')).toHaveTextContent('Erro');
  });

  it('mostra Reverso e Erro juntos, abaixo do título no markup', () => {
    render(
      <RecentAttemptsList
        attempts={[attempt({ estudoReversoConcluido: true, acertou: false })]}
      />,
    );

    const badges = screen.getByTestId('recent-attempt-badges');
    expect(badges).toHaveTextContent('Reverso');
    expect(badges).toHaveTextContent('Erro');
    expect(screen.getByTestId('recent-attempt-title').compareDocumentPosition(badges)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('limita a home a 5 tentativas e aponta Ver histórico para a rota dedicada', () => {
    const attempts = Array.from({ length: 6 }, (_, i) =>
      attempt({
        id: `h${i + 1}`,
        moduloSlug: `slug-${i + 1}`,
        tituloAula: `Tentativa ${i + 1}`,
      }),
    );
    render(<RecentAttemptsList attempts={attempts} historicoHref="/desempenho/historico" />);

    expect(screen.getByText('Tentativa 1')).toBeInTheDocument();
    expect(screen.getByText('Tentativa 5')).toBeInTheDocument();
    expect(screen.queryByText('Tentativa 6')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver histórico' })).toHaveAttribute(
      'href',
      '/desempenho/historico',
    );
  });
});
