import { fireEvent, render, screen } from '@testing-library/react';
import {
  SIMULADO_MAP_VIRTUAL_THRESHOLD,
  SimuladoQuestionMap,
} from '@/components/simulados/SimuladoQuestionMap';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

function buildQuestoes(count: number): SimuladoQuestaoItem[] {
  return Array.from({ length: count }, (_, index) => ({
    ordem: index + 1,
    modulo_slug: `slug-${index + 1}`,
    respondida: index % 3 === 0,
    meta: { banca: 'FGV', topico: 'T', subtopico: 'S' },
    ...(index % 3 === 0
      ? {
          acertou: true,
          opcao_id: 'A',
          opcao_correta_id: 'A',
          respondida_em: '2026-05-28T00:00:00.000Z',
          tempo_ms: 1000,
        }
      : {}),
  })) as SimuladoQuestaoItem[];
}

describe('SimuladoQuestionMap', () => {
  it('usa mapa flex para até 40 questões', () => {
    render(
      <SimuladoQuestionMap
        questoes={buildQuestoes(SIMULADO_MAP_VIRTUAL_THRESHOLD)}
        activeSlug="slug-1"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('simulado-question-map-flex')).toBeInTheDocument();
    expect(screen.queryByTestId('simulado-question-map-virtual')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Questão/ })).toHaveLength(
      SIMULADO_MAP_VIRTUAL_THRESHOLD,
    );
  });

  it('usa virtualização acima de 40 questões', () => {
    render(
      <SimuladoQuestionMap
        questoes={buildQuestoes(SIMULADO_MAP_VIRTUAL_THRESHOLD + 1)}
        activeSlug="slug-1"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('simulado-question-map-virtual')).toBeInTheDocument();
    expect(screen.queryByTestId('simulado-question-map-flex')).not.toBeInTheDocument();
  });

  it('em modo prova usa estilo neutro para questões respondidas', () => {
    const questoes = buildQuestoes(3);
    render(
      <SimuladoQuestionMap
        questoes={questoes}
        activeSlug="slug-2"
        variant="prova"
        onSelect={jest.fn()}
      />,
    );

    const answered = screen.getByRole('button', { name: 'Questão 1, respondida' });
    expect(answered.className).toContain('border-slate-300');
    expect(answered.className).not.toContain('emerald');
  });

  it('em modo treino mantém verde para questões respondidas corretas', () => {
    render(
      <SimuladoQuestionMap
        questoes={buildQuestoes(3)}
        activeSlug="slug-2"
        variant="treino"
        onSelect={jest.fn()}
      />,
    );

    const answered = screen.getByRole('button', { name: 'Questão 1, respondida' });
    expect(answered.className).toContain('emerald');
  });

  it('dispara onSelect ao clicar na célula', () => {
    const onSelect = jest.fn();
    render(
      <SimuladoQuestionMap
        questoes={buildQuestoes(3)}
        activeSlug={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Questão 2, pendente' }));
    expect(onSelect).toHaveBeenCalledWith('slug-2');
  });
});
