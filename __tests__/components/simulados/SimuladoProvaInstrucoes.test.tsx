import { fireEvent, render, screen } from '@testing-library/react';
import { SimuladoProvaInstrucoes } from '@/components/simulados/SimuladoProvaInstrucoes';

describe('SimuladoProvaInstrucoes', () => {
  it('bloqueia Iniciar prova até marcar que leu as instruções', () => {
    const onIniciar = jest.fn();

    render(
      <SimuladoProvaInstrucoes
        titulo="Prova Urgências"
        modo="prova"
        totalQuestoes={20}
        ritmoMetaSegundosPorQuestao={180}
        iniciandoProva={false}
        iniciarProvaError={null}
        onIniciar={onIniciar}
      />,
    );

    const iniciarBtn = screen.getByRole('button', { name: 'Iniciar prova' });
    expect(iniciarBtn).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(iniciarBtn).not.toBeDisabled();

    fireEvent.click(iniciarBtn);
    expect(onIniciar).toHaveBeenCalledTimes(1);
  });

  it('exibe meta total formatada para ritmo de 3 min/questão', () => {
    render(
      <SimuladoProvaInstrucoes
        titulo="Prova IBFC"
        modo="prova"
        totalQuestoes={2}
        ritmoMetaSegundosPorQuestao={180}
        iniciandoProva={false}
        iniciarProvaError={null}
        onIniciar={jest.fn()}
      />,
    );

    expect(screen.getByText('00:06:00')).toBeInTheDocument();
    expect(screen.getByText(/Meta de tempo sugerida:/)).toBeInTheDocument();
  });
});
