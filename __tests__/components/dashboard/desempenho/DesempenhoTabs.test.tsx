/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DesempenhoTabs } from '@/components/dashboard/desempenho/DesempenhoTabs';

const mockPathname = jest.fn(() => '/desempenho');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('DesempenhoTabs', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/desempenho');
  });

  it('renderiza as três abas por link', () => {
    render(<DesempenhoTabs />);
    expect(screen.getByRole('tab', { name: 'Estudo' })).toHaveAttribute('href', '/desempenho');
    expect(screen.getByRole('tab', { name: 'Simulados' })).toHaveAttribute(
      'href',
      '/desempenho/simulados',
    );
    expect(screen.getByRole('tab', { name: 'Atividade' })).toHaveAttribute(
      'href',
      '/desempenho/atividade',
    );
  });

  it('marca Estudo como ativo em /desempenho', () => {
    mockPathname.mockReturnValue('/desempenho');
    render(<DesempenhoTabs />);
    expect(screen.getByRole('tab', { name: 'Estudo' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Simulados' })).toHaveAttribute('aria-selected', 'false');
  });

  it('marca Simulados como ativo em /desempenho/simulados', () => {
    mockPathname.mockReturnValue('/desempenho/simulados');
    render(<DesempenhoTabs />);
    expect(screen.getByRole('tab', { name: 'Simulados' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Estudo' })).toHaveAttribute('aria-selected', 'false');
  });

  it('marca Atividade como ativo em /desempenho/atividade', () => {
    mockPathname.mockReturnValue('/desempenho/atividade');
    render(<DesempenhoTabs />);
    expect(screen.getByRole('tab', { name: 'Atividade' })).toHaveAttribute('aria-selected', 'true');
  });
});
