/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ContributionHeatmap } from '@/components/dashboard/performance/contribution-heatmap';
import type { DiaEstudo } from '@/components/dashboard/performance/types';

const mockToFreemiumTimezoneYmd = jest.fn(() => '2026-08-11');

jest.mock('@/lib/freemium/constants', () => ({
  toFreemiumTimezoneYmd: () => mockToFreemiumTimezoneYmd(),
}));

function serieDe(datas: Array<[string, number]>): DiaEstudo[] {
  return datas.map(([data, count]) => ({ data, count }));
}

const SERIE = serieDe([
  ['2026-08-05', 0],
  ['2026-08-06', 2],
  ['2026-08-07', 5],
  ['2026-08-08', 9],
  ['2026-08-09', 14],
  ['2026-08-10', 1],
  ['2026-08-11', 3],
]);

function renderHeatmap(props: Partial<Parameters<typeof ContributionHeatmap>[0]> = {}) {
  return render(
    <ContributionHeatmap
      serie={SERIE}
      periodo={7}
      onPeriodoChange={jest.fn()}
      totalPeriodo={34}
      semDados={false}
      {...props}
    />,
  );
}

describe('ContributionHeatmap', () => {
  beforeEach(() => {
    mockToFreemiumTimezoneYmd.mockReturnValue('2026-08-11');
  });

  it('marca "hoje" pelo dia civil de Brasília, não pela data UTC', () => {
    renderHeatmap();

    expect(screen.getByRole('gridcell', { name: /11 de ago.*\(hoje\)/ })).toBeInTheDocument();
    expect(mockToFreemiumTimezoneYmd).toHaveBeenCalled();
  });

  it('não marca hoje em nenhuma célula quando o dia de Brasília está fora da série', () => {
    mockToFreemiumTimezoneYmd.mockReturnValue('2026-08-12');
    renderHeatmap();

    expect(screen.queryByRole('gridcell', { name: /\(hoje\)/ })).not.toBeInTheDocument();
  });

  it('células são informativas: nenhuma é botão ou foco de teclado', () => {
    renderHeatmap();

    const celulas = screen.getAllByRole('gridcell');
    expect(celulas).toHaveLength(7);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    for (const celula of celulas) {
      expect(celula).not.toHaveAttribute('tabindex');
      expect(celula.className).not.toMatch(/cursor-pointer|hover:/);
    }
  });

  it('a contagem aparece em texto — cor não é o único canal', () => {
    renderHeatmap();

    const celula = screen.getByRole('gridcell', { name: /09 de ago/ });
    expect(celula).toHaveTextContent('14');
    expect(celula.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('estado vazio não desenha grade', () => {
    renderHeatmap({ semDados: true, totalPeriodo: 0 });

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getAllByText('Nenhuma questão estudada ainda.').length).toBeGreaterThan(0);
    expect(screen.queryByText('Legenda de intensidade')).not.toBeInTheDocument();
  });
});
