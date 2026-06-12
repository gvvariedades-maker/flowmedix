import { render, screen } from '@testing-library/react';
import VitrineCatalogStatsStrip from '@/components/vitrine/VitrineCatalogStatsStrip';
import { VITRINE_STATS_SEEN_STORAGE_KEY } from '@/lib/vitrine/catalogStatsAnimation';

jest.mock('@/hooks/useCatalogStatsCountUp', () => ({
  useCatalogStatsCountUp: (q: number, s: number) => ({
    totalQuestions: q,
    totalSlides: s,
    ready: true,
    animating: false,
  }),
}));

describe('VitrineCatalogStatsStrip', () => {
  it('renderiza totais do catálogo', () => {
    render(<VitrineCatalogStatsStrip totalQuestions={120} totalSlides={480} />);

    expect(screen.getByTestId('vitrine-catalog-stats')).toHaveAttribute(
      'data-vitrine-stats-ready',
      'true',
    );
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('480')).toBeInTheDocument();
    expect(screen.getByText('questões com estudo reverso')).toBeInTheDocument();
    expect(screen.getByText('NeuroSlides')).toBeInTheDocument();
  });

  it('usa chave localStorage documentada', () => {
    expect(VITRINE_STATS_SEEN_STORAGE_KEY).toBe('avant.vitrine.statsSeen');
  });
});
