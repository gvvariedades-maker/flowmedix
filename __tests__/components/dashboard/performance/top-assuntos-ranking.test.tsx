/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { TopAssuntosRanking } from '@/components/dashboard/performance/top-assuntos-ranking';

const NOME_LONGO = 'Infecções Sexualmente Transmissíveis';

describe('TopAssuntosRanking', () => {
  it('mostra o nome longo em até 2 linhas e no acessível, sem title como única via', () => {
    render(<TopAssuntosRanking assuntos={[{ nome: NOME_LONGO, count: 7 }]} />);

    const nome = screen.getByTestId('ranking-assunto-nome');
    expect(nome).toHaveTextContent(NOME_LONGO);
    expect(nome.className).toMatch(/line-clamp-2/);
    expect(nome).not.toHaveAttribute('title');

    expect(
      screen.getByLabelText(`${NOME_LONGO}, 7 questões com estudo reverso`),
    ).toBeInTheDocument();
    expect(screen.getByText(/estudo reverso · últimos 30 dias/)).toBeInTheDocument();
  });
});
