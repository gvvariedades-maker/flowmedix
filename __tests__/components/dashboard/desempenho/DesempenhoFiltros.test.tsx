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
  assunto: null,
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
  function abrirPainel() {
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));
  }

  it('começa fechado em qualquer viewport, com Filtrar visível e aria-expanded', () => {
    render(<DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />);

    const botao = screen.getByRole('button', { name: /Filtrar/ });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(botao.className).not.toContain('sm:hidden');

    const painel = document.getElementById(botao.getAttribute('aria-controls')!);
    expect(painel).not.toBeNull();
    expect(painel).toHaveAttribute('hidden');
    expect(painel?.className).toContain('hidden');
    expect(painel?.className).not.toContain('sm:block');
    expect(screen.queryByRole('group', { name: 'Período' })).not.toBeInTheDocument();
  });

  it('a URL é a fonte de verdade: cada opção é um link com query', () => {
    render(<DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />);
    abrirPainel();

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
    abrirPainel();

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

  it('mostra chips dos filtros ativos com o painel fechado', () => {
    render(
      <DesempenhoFiltros
        filters={{ ...LIMPO, periodo: '7d', areaId: 'farmacologia' }}
        periodoResumo={RESUMO_7D}
      />,
    );

    const chips = screen.getByRole('list', { name: 'Filtros ativos' });
    expect(within(chips).getByRole('link', { name: /Remover filtro de período/ })).toHaveAttribute(
      'href',
      '/desempenho?area=farmacologia',
    );
    expect(within(chips).getByRole('link', { name: /Remover filtro de área/ })).toHaveAttribute(
      'href',
      '/desempenho?periodo=7d',
    );
    expect(screen.getByRole('button', { name: /Filtrar/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('o painel abre por disclosure com contador de filtros ativos', () => {
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
    expect(painel).not.toHaveAttribute('hidden');
    expect(painel?.className).not.toContain('hidden');
  });

  it('só oferece limpar quando há filtro ativo', () => {
    const { unmount } = render(
      <DesempenhoFiltros filters={LIMPO} periodoResumo={RESUMO_ALL} />,
    );
    expect(screen.queryByRole('link', { name: 'Limpar filtros' })).not.toBeInTheDocument();
    unmount();

    render(<DesempenhoFiltros filters={{ ...LIMPO, periodo: '30d' }} periodoResumo={RESUMO_7D} />);
    abrirPainel();
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
    expect(screen.getByRole('link', { name: /Remover filtro de banca/ })).toHaveAttribute(
      'href',
      '/desempenho',
    );
    abrirPainel();
    const banca = screen.getByRole('group', { name: 'Banca' });
    expect(within(banca).getByRole('link', { name: /Remover filtro de banca/ })).toHaveAttribute(
      'href',
      '/desempenho',
    );
  });

  it('assunto fica desabilitado sem área e limpa ao trocar a área', () => {
    const { unmount } = render(
      <DesempenhoFiltros
        filters={LIMPO}
        periodoResumo={RESUMO_ALL}
        assuntoOpcoes={['Vias de Administração', 'Imunização']}
      />,
    );
    abrirPainel();
    expect(screen.getByText('Selecione uma área para filtrar por assunto.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Vias de Administração' })).not.toBeInTheDocument();
    unmount();

    render(
      <DesempenhoFiltros
        filters={{
          ...LIMPO,
          areaId: 'farmacologia',
          assunto: 'Vias de Administração',
        }}
        periodoResumo={RESUMO_ALL}
        assuntoOpcoes={['Vias de Administração', 'Cuidados na Administração de Medicamentos']}
      />,
    );
    expect(screen.getByRole('link', { name: /Remover filtro de assunto/ })).toHaveAttribute(
      'href',
      '/desempenho?area=farmacologia',
    );
    abrirPainel();
    const area = screen.getByRole('group', { name: 'Área' });
    expect(within(area).getByRole('link', { name: 'Saúde Pública e Epidemiologia' })).toHaveAttribute(
      'href',
      '/desempenho?area=saude_publica',
    );
    expect(
      within(screen.getByRole('group', { name: 'Assunto' })).getByRole('link', {
        name: 'Vias de Administração',
      }),
    ).toHaveAttribute(
      'href',
      '/desempenho?area=farmacologia&assunto=Vias+de+Administra%C3%A7%C3%A3o',
    );
  });

  it('todos os alvos de toque têm altura mínima de 44px', () => {
    render(
      <DesempenhoFiltros filters={{ ...LIMPO, banca: 'CPCON' }} periodoResumo={RESUMO_ALL} />,
    );
    abrirPainel();

    const alvos = [...screen.getAllByRole('link'), ...screen.getAllByRole('button')];
    expect(alvos.length).toBeGreaterThan(5);
    for (const alvo of alvos) {
      expect(alvo.className).toContain('min-h-11');
    }
  });
});
