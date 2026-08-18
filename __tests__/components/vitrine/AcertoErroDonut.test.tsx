import { render, screen } from '@testing-library/react';
import { AcertoErroDonut } from '@/components/vitrine/AcertoErroDonut';

describe('AcertoErroDonut', () => {
  it('expõe aria com absolutos e pinta fatia de acerto e de erro', () => {
    const { container } = render(
      <AcertoErroDonut acertos={1} erros={12} respondidas={13} />,
    );

    expect(
      screen.getByLabelText(
        'Taxa de acerto: 8%. 1 acerto e 12 erros entre 13 respondidas.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('de acerto')).toBeInTheDocument();

    const slices = container.querySelectorAll('circle[stroke="var(--color-success)"], circle[stroke="var(--color-danger)"]');
    expect(slices).toHaveLength(2);
  });

  it('sem respostas fica cinza, sem 0% e sem fatias', () => {
    const { container } = render(
      <AcertoErroDonut acertos={0} erros={0} respondidas={0} />,
    );

    expect(screen.getByLabelText('Ainda sem respostas neste assunto')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Ainda sem respostas')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(container.querySelector('circle[stroke="var(--color-success)"]')).toBeNull();
    expect(container.querySelector('circle[stroke="var(--color-danger)"]')).toBeNull();
  });

  it('0% de acerto mantém o número verde e só a fatia vermelha', () => {
    const { container } = render(
      <AcertoErroDonut acertos={0} erros={13} respondidas={13} />,
    );

    expect(screen.getByText('0%')).toHaveClass('text-[var(--color-success-text)]');
    expect(container.querySelector('circle[stroke="var(--color-danger)"]')).not.toBeNull();
    expect(container.querySelector('circle[stroke="var(--color-success)"]')).toBeNull();
  });
});
