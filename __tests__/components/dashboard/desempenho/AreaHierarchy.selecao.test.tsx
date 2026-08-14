/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { AreaHierarchy } from '@/components/dashboard/desempenho/AreaHierarchy';
import type { AreaPerformance, AssuntoPerformance } from '@/lib/desempenho/types';
import {
  DESEMPENHO_SELECAO_MAX_ASSUNTOS,
  readDesempenhoSelecao,
} from '@/lib/cadernos/desempenhoSelecao';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function buildAssunto(titulo: string): AssuntoPerformance {
  return {
    tituloAula: titulo,
    canonicalSubtopico: titulo,
    areaId: 'farmacologia',
    areaLabel: 'Farmacologia e Medicamentos',
    riskBandId: 'alta_incidencia_protocolo',
    disciplina: 'enfermagem',
    respondidas: 6,
    acertos: 2,
    erros: 4,
    percentual: 33,
    coberturaPct: 40,
    totalDisponivel: 15,
    ultimaPratica: '2026-08-10T12:00:00.000Z',
    amostraSuficiente: true,
    confidenceId: 'evidencia_moderada',
    errosSemReverso: 3,
    bancas: ['CPCON'],
  };
}

function buildAreas(qtdAssuntos: number): AreaPerformance[] {
  return [
    {
      areaId: 'farmacologia',
      areaLabel: 'Farmacologia e Medicamentos',
      riskBandId: 'alta_incidencia_protocolo',
      respondidas: 6,
      acertos: 2,
      erros: 4,
      percentual: 33,
      coberturaPct: 40,
      totalDisponivel: 15,
      amostraSuficiente: true,
      confidenceId: 'evidencia_moderada',
      assuntos: Array.from({ length: qtdAssuntos }, (_, i) => buildAssunto(`Assunto ${i + 1}`)),
    },
  ];
}

function abrirArea() {
  fireEvent.click(screen.getByRole('button', { name: /Farmacologia e Medicamentos/ }));
}

describe('AreaHierarchy — seleção de assuntos para caderno', () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.sessionStorage.clear();
  });

  it('barra contextual só aparece com assunto marcado', () => {
    render(<AreaHierarchy areas={buildAreas(2)} />);
    expect(screen.queryByRole('region', { name: 'Assuntos selecionados' })).not.toBeInTheDocument();

    abrirArea();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Assunto 1' }));

    const barra = screen.getByRole('region', { name: 'Assuntos selecionados' });
    expect(barra).toHaveTextContent('1');
    expect(barra).toHaveTextContent('assunto selecionado');
    expect(barra).toHaveTextContent('O caderno recebe só questões desses assuntos.');
  });

  it('limpar desmarca tudo e esconde a barra', () => {
    render(<AreaHierarchy areas={buildAreas(2)} />);
    abrirArea();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Assunto 1' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Assunto 2' }));
    expect(screen.getByRole('region', { name: 'Assuntos selecionados' })).toHaveTextContent(
      'assuntos selecionados',
    );

    fireEvent.click(screen.getByRole('button', { name: /Limpar/ }));

    expect(screen.queryByRole('region', { name: 'Assuntos selecionados' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Assunto 1' })).not.toBeChecked();
  });

  it('criar caderno grava a seleção e abre o wizard em modo desempenho', () => {
    render(<AreaHierarchy areas={buildAreas(2)} />);
    abrirArea();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Assunto 2' }));
    fireEvent.click(screen.getByRole('button', { name: /Criar caderno/ }));

    expect(readDesempenhoSelecao()).toEqual(['Assunto 2']);
    expect(mockPush).toHaveBeenCalledWith('/cadernos/novo?wizard=1&origem=desempenho');
  });

  it('bloqueia acima do teto em vez de truncar em silêncio', () => {
    render(<AreaHierarchy areas={buildAreas(DESEMPENHO_SELECAO_MAX_ASSUNTOS + 1)} />);
    abrirArea();

    for (let i = 1; i <= DESEMPENHO_SELECAO_MAX_ASSUNTOS; i++) {
      fireEvent.click(screen.getByRole('checkbox', { name: `Assunto ${i}` }));
    }

    const extra = screen.getByRole('checkbox', {
      name: `Assunto ${DESEMPENHO_SELECAO_MAX_ASSUNTOS + 1}`,
    });
    expect(extra).toBeDisabled();
    expect(screen.getByRole('region', { name: 'Assuntos selecionados' })).toHaveTextContent(
      `Máximo de ${DESEMPENHO_SELECAO_MAX_ASSUNTOS} assuntos por caderno.`,
    );

    fireEvent.click(screen.getByRole('button', { name: /Criar caderno/ }));
    expect(readDesempenhoSelecao()).toHaveLength(DESEMPENHO_SELECAO_MAX_ASSUNTOS);
  });
});
