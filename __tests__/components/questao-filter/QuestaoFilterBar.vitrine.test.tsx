import { render, screen } from '@testing-library/react';
import { QuestaoFilterBar } from '@/components/questao-filter/QuestaoFilterBar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/questao-filter/useQuestaoFacets', () => ({
  useQuestaoFacets: () => ({
    facets: { bancas: ['EBSERH'], assuntos: ['Sinais Vitais'] },
    facetsLoading: false,
  }),
  deriveFacetsFromModulos: () => ({ bancas: [], assuntos: [] }),
}));

jest.mock('@/lib/hooks/useClientMounted', () => ({
  useClientMounted: () => true,
}));

describe('QuestaoFilterBar vitrine', () => {
  it('renderiza QuestaoFilterChips no desktop (sem grid MultiCheckboxFilter)', () => {
    const { container } = render(
      <QuestaoFilterBar
        variant="vitrine"
        showSearch={false}
        facets={{ bancas: ['EBSERH'], assuntos: ['Sinais Vitais'] }}
        facetsLoading={false}
        bancasSelected={[]}
        assuntosSelected={[]}
        searchTerm=""
        onBancasChange={jest.fn()}
        onAssuntosChange={jest.fn()}
        onSearchChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Filtros de questões')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Banca' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assunto' })).toBeInTheDocument();
    expect(container.querySelector('.grid-cols-2')).not.toBeInTheDocument();
    expect(screen.queryByText('Filtros', { selector: '.uppercase' })).not.toBeInTheDocument();
  });
});
