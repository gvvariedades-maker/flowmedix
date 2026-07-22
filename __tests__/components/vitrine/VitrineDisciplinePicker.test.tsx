import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VitrineDisciplinePicker from '@/components/vitrine/VitrineDisciplinePicker';
import type { VitrineDisciplinaSummary } from '@/lib/vitrine/disciplina';

const summaries: VitrineDisciplinaSummary[] = [
  {
    id: 'enfermagem',
    label: 'Enfermagem',
    totalAssuntos: 40,
    totalQuestoes: 5000,
    trabalhadas: 100,
    progressoPct: 2,
  },
  {
    id: 'portugues',
    label: 'Português',
    totalAssuntos: 12,
    totalQuestoes: 600,
    trabalhadas: 0,
    progressoPct: 0,
  },
];

describe('VitrineDisciplinePicker', () => {
  it('no hub renderiza dois cards e seleciona disciplina', () => {
    const onSelect = jest.fn();
    render(
      <VitrineDisciplinePicker summaries={summaries} selected={null} onSelect={onSelect} />,
    );

    expect(screen.getByTestId('vitrine-discipline-picker')).toBeInTheDocument();
    expect(screen.getByTestId('vitrine-discipline-card-enfermagem')).toBeInTheDocument();
    expect(screen.getByTestId('vitrine-discipline-card-portugues')).toBeInTheDocument();
    expect(screen.queryByTestId('vitrine-discipline-breadcrumb')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('vitrine-discipline-card-portugues'));
    expect(onSelect).toHaveBeenCalledWith('portugues');
  });

  it('no drill-down mostra breadcrumb e volta ao hub', () => {
    const onSelect = jest.fn();
    render(
      <VitrineDisciplinePicker
        summaries={summaries}
        selected="enfermagem"
        onSelect={onSelect}
      />,
    );

    expect(screen.queryByTestId('vitrine-discipline-picker')).not.toBeInTheDocument();
    expect(screen.getByTestId('vitrine-discipline-breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Enfermagem')).toBeInTheDocument();

    const back = screen.getByRole('button', { name: /voltar às disciplinas/i });
    expect(back).toHaveAttribute('aria-label', 'Voltar às disciplinas');
    fireEvent.click(back);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('move foco para o breadcrumb ao entrar no drill-down', async () => {
    const { rerender } = render(
      <VitrineDisciplinePicker summaries={summaries} selected={null} onSelect={jest.fn()} />,
    );

    rerender(
      <VitrineDisciplinePicker
        summaries={summaries}
        selected="portugues"
        onSelect={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /voltar às disciplinas/i })).toHaveFocus();
    });
  });

  it('move foco para o título Disciplinas ao voltar ao hub', async () => {
    const { rerender } = render(
      <VitrineDisciplinePicker
        summaries={summaries}
        selected="enfermagem"
        onSelect={jest.fn()}
      />,
    );

    rerender(
      <VitrineDisciplinePicker summaries={summaries} selected={null} onSelect={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Disciplinas' })).toHaveFocus();
    });
  });

  it('não renderiza com uma só disciplina visível', () => {
    const { container } = render(
      <VitrineDisciplinePicker
        summaries={[{ ...summaries[0] }, { ...summaries[1], totalAssuntos: 0 }]}
        selected={null}
        onSelect={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
