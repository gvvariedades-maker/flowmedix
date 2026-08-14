/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { DesempenhoFiltros } from '@/components/dashboard/desempenho/DesempenhoFiltros';
import type { DesempenhoEstudoFilters, DesempenhoPeriodoResumo } from '@/lib/desempenho/types';

const LIMPO: DesempenhoEstudoFilters = {
  periodo: 'all',
  banca: null,
  areaId: null,
  disciplina: null,
};

const RESUMO_ALL: DesempenhoPeriodoResumo = {
  periodo: 'all',
  startYmd: null,
  endYmdInclusive: '2026-08-11',
  civilDays: null,
};

const RESUMO_7D: DesempenhoPeriodoResumo = {
  periodo: '7d',
  startYmd: '2026-08-05',
  endYmdInclusive: '2026-08-11',
  civilDays: 7,
};

describe('DesempenhoFiltros', () => {
  it('a URL é a fonte de verdade: cada opção é um link com query', () => {
    render(<DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />);

    const periodo = screen.getByRole('group', { name: 'Período' });
    expect(within(periodo).getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'href',
      '/desempenho?periodo=7d',
    );
    expect(within(periodo).getByRole('link', { name: 'Tudo' })).toHaveAttribute(
      'href',
      '/desempenho',
    );
  });

  it('marca a opção aplicada e preserva as outras dimensões no link', () => {
    render(
      <DesempenhoFiltros
        filters={{ ...LIMPO, periodo: '7d', areaId: 'farmacologia' }}
        periodoResumo={RESUMO_7D}
      />,
    );

    const periodo = screen.getByRole('group', { name: 'Período' });
    expect(within(periodo).getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(periodo).getByRole('link', { name: '30 dias' })).toHaveAttribute(
      'href',
      '/desempenho?periodo=30d&area=farmacologia',
    );
  });

  it('mostra o período civil aplicado em horário de Brasília', () => {
    render(<DesempenhoFiltros filters={{ ...LIMPO, periodo: '7d' }} periodoResumo={RESUMO_7D} />);

    expect(screen.getByText('7 dias · 05/08/2026 a 11/08/2026')).toBeInTheDocument();
    expect(screen.getByText(/horário de Brasília/)).toBeInTheDocument();
  });

  it('no mobile o painel abre por disclosure com contador de filtros ativos', () => {
    render(
      <DesempenhoFiltros
        filters={{ ...LIMPO, periodo: '7d', banca: 'CPCON' }}
        periodoResumo={RESUMO_7D}
      />,
    );

    const botao = screen.getByRole('button', { name: /Filtrar/ });
    expect(within(botao).getByText('2')).toBeInTheDocument();
    expect(botao).toHaveAttribute('aria-expanded', 'false');

    const painel = document.getElementById(botao.getAttribute('aria-controls')!);
    expect(painel).not.toBeNull();
    expect(painel?.className).toContain('hidden');

    fireEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(painel?.className).not.toContain('hidden');
  });

  it('só oferece limpar quando há filtro ativo', () => {
    const { unmount } = render(
      <DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />,
    );
    expect(screen.queryByRole('link', { name: 'Limpar filtros' })).not.toBeInTheDocument();
    unmount();

    render(<DesempenhoFiltros filters={{ ...LIMPO, periodo: '30d' }} periodoResumo={RESUMO_7D} />);
    expect(screen.getByRole('link', { name: 'Limpar filtros' })).toHaveAttribute(
      'href',
      '/desempenho',
    );
  });

  it('banca aparece só quando aplicada, com link para remover', () => {
    const { unmount } = render(
      <DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />,
    );
    expect(screen.queryByRole('group', { name: 'Banca' })).not.toBeInTheDocument();
    unmount();

    render(
      <DesempenhoFiltros filters={{ ...LIMPO, banca: 'CPCON' }} periodoResumo={RESUMO_ALL} />,
    );
    const banca = screen.getByRole('group', { name: 'Banca' });
    expect(within(banca).getByRole('link', { name: /Remover filtro de banca/ })).toHaveAttribute(
      'href',
      '/desempenho',
    );
  });

  it('todos os alvos de toque têm altura mínima de 44px', () => {
    render(
      <DesempenhoFiltros filters={{ ...LIMPO, banca: 'CPCON' }} periodoResumo={RESUMO_ALL} />,
    );

    const alvos = [...screen.getAllByRole('link'), ...screen.getAllByRole('button')];
    expect(alvos.length).toBeGreaterThan(5);
    for (const alvo of alvos) {
      expect(alvo.className).toContain('min-h-11');
    }
  });
});
