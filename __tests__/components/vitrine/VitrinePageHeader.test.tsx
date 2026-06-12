import { render, screen } from '@testing-library/react';
import VitrinePageHeader from '@/components/vitrine/VitrinePageHeader';

describe('VitrinePageHeader', () => {
  it('renderiza um único h1 com título editorial', () => {
    render(<VitrinePageHeader title="Vitrine de questões" />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Vitrine de questões');
    expect(headings[0]).toHaveAttribute('id', 'vitrine-page-title');
    expect(headings[0]).toHaveClass('text-editorial-title');
  });

  it('exibe contador inline quando description é fornecida', () => {
    render(
      <VitrinePageHeader title="Vitrine de questões" description="42 assuntos" />,
    );

    expect(screen.getByText('42 assuntos')).toBeInTheDocument();
    expect(screen.getByText('42 assuntos')).toHaveClass('tabular-nums');
  });

  it('associa section ao h1 via aria-labelledby', () => {
    const { container } = render(
      <VitrinePageHeader title="Vitrine de questões" description="10 assuntos" />,
    );

    const section = container.querySelector('section[aria-labelledby="vitrine-page-title"]');
    expect(section).toBeInTheDocument();
  });
});
