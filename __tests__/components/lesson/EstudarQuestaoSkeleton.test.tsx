import { render, screen } from '@testing-library/react';
import EstudarQuestaoSkeleton from '@/components/lesson/EstudarQuestaoSkeleton';

describe('EstudarQuestaoSkeleton', () => {
  it('expõe status acessível e quatro placeholders de alternativa', () => {
    render(<EstudarQuestaoSkeleton />);

    expect(screen.getByRole('status', { name: 'Carregando questão' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByTestId('estudar-questao-skeleton')).toBeInTheDocument();

    const options = screen
      .getByTestId('estudar-questao-skeleton')
      .querySelectorAll('.rounded-xl.border');
    expect(options).toHaveLength(4);
  });

  it('remove radius no mobile quando mobileFullBleed', () => {
    render(<EstudarQuestaoSkeleton mobileFullBleed />);
    const root = screen.getByTestId('estudar-questao-skeleton');
    expect(root.className).toContain('max-md:rounded-none');
  });
});
