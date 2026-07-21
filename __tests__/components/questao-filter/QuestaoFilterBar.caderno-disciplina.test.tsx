import { render, screen, fireEvent } from '@testing-library/react';
import { QuestaoFilterBar } from '@/components/questao-filter/QuestaoFilterBar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/questao-filter/useQuestaoFacets', () => ({
  useQuestaoFacets: () => ({
    facets: { bancas: [], assuntos: [] },
    facetsLoading: false,
  }),
  deriveFacetsFromModulos: (
    modulos: { banca?: string | null; titulo_aula?: string | null }[],
  ) => {
    const bancas = new Set<string>();
    const assuntos = new Set<string>();
    for (const m of modulos) {
      if (m.banca) bancas.add(m.banca);
      if (m.titulo_aula) assuntos.add(m.titulo_aula);
    }
    return { bancas: [...bancas], assuntos: [...assuntos] };
  },
}));

jest.mock('@/lib/hooks/useClientMounted', () => ({
  useClientMounted: () => true,
}));

const modulos = [
  {
    banca: 'CESPE',
    titulo_aula: 'Urgências e Emergências',
    modulo_nome: 'Urgências',
  },
  {
    banca: 'FGV',
    titulo_aula: 'Crase',
    modulo_nome: 'Língua Portuguesa',
  },
];

describe('QuestaoFilterBar caderno disciplina', () => {
  it('mostra segmento de disciplina quando há TE e PT no pacote', () => {
    const onDisciplinaChange = jest.fn();
    render(
      <QuestaoFilterBar
        variant="caderno-panel"
        bancasSelected={[]}
        assuntosSelected={[]}
        searchTerm=""
        disciplinaSelected={null}
        onBancasChange={jest.fn()}
        onAssuntosChange={jest.fn()}
        onSearchChange={jest.fn()}
        onDisciplinaChange={onDisciplinaChange}
        modulosForFallback={modulos}
      />,
    );

    expect(screen.getByRole('group', { name: 'Disciplina' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enfermagem' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Português' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Português' }));
    expect(onDisciplinaChange).toHaveBeenCalledWith('portugues');
  });

  it('não mostra disciplina com apenas uma matéria no pacote', () => {
    render(
      <QuestaoFilterBar
        variant="caderno-panel"
        bancasSelected={[]}
        assuntosSelected={[]}
        searchTerm=""
        onBancasChange={jest.fn()}
        onAssuntosChange={jest.fn()}
        onSearchChange={jest.fn()}
        onDisciplinaChange={jest.fn()}
        modulosForFallback={[modulos[0]!]}
      />,
    );

    expect(screen.queryByRole('group', { name: 'Disciplina' })).not.toBeInTheDocument();
  });
});
