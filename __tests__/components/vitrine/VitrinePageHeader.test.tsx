import { createRef } from 'react';
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
    expect(screen.getByText('42 assuntos')).toHaveClass('text-slate-500');
  });

  it('usa H1 na escala +20% e Como funciona com alvo 44px', () => {
    render(<VitrinePageHeader title="Vitrine de questões" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toMatch(/text-\[1\.7rem\]/);
    expect(heading.className).toMatch(/sm:text-\[2\.25rem\]/);

    const howItWorks = screen.getByRole('link', { name: 'Como funciona' });
    expect(howItWorks.className).toMatch(/min-h-11/);
  });

  it('renderiza stats sob o H1 quando fornecidos', () => {
    render(
      <VitrinePageHeader
        title="Estudo reverso por assunto"
        stats={<span data-testid="header-stats">480 NeuroSlides</span>}
      />,
    );

    expect(screen.getByTestId('header-stats')).toBeInTheDocument();
    expect(screen.getByTestId('header-stats')).toHaveTextContent('480 NeuroSlides');
  });

  it('associa section ao h1 via aria-labelledby', () => {
    const { container } = render(
      <VitrinePageHeader title="Vitrine de questões" description="10 assuntos" />,
    );

    const section = container.querySelector('section[aria-labelledby="vitrine-page-title"]');
    expect(section).toBeInTheDocument();
  });

  it('h1 é focável via tabIndex=-1 e titleRef', () => {
    const titleRef = createRef<HTMLHeadingElement>();
    render(<VitrinePageHeader title="Assuntos" titleRef={titleRef} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveAttribute('tabIndex', '-1');
    expect(heading).toHaveClass('outline-none');
    expect(titleRef.current).toBe(heading);

    titleRef.current?.focus();
    expect(heading).toHaveFocus();
  });
});
