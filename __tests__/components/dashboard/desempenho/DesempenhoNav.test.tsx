/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DesempenhoNav } from '@/components/dashboard/desempenho/DesempenhoNav';

const mockPathname = jest.fn(() => '/desempenho');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('DesempenhoNav', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/desempenho');
  });

  it('é navegação por links, não tablist', () => {
    render(<DesempenhoNav />);

    expect(screen.getByRole('navigation', { name: 'Seções de desempenho' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('renderiza as três seções com href real', () => {
    render(<DesempenhoNav />);

    expect(screen.getByRole('link', { name: 'Estudo' })).toHaveAttribute('href', '/desempenho');
    expect(screen.getByRole('link', { name: 'Simulados' })).toHaveAttribute(
      'href',
      '/desempenho/simulados',
    );
    expect(screen.getByRole('link', { name: 'Atividade' })).toHaveAttribute(
      'href',
      '/desempenho/atividade',
    );
  });

  it.each([
    ['/desempenho', 'Estudo'],
    ['/desempenho/simulados', 'Simulados'],
    ['/desempenho/atividade', 'Atividade'],
  ])('marca aria-current="page" em %s', (pathname, ativo) => {
    mockPathname.mockReturnValue(pathname);
    render(<DesempenhoNav />);

    expect(screen.getByRole('link', { name: ativo })).toHaveAttribute('aria-current', 'page');

    const outros = ['Estudo', 'Simulados', 'Atividade'].filter((label) => label !== ativo);
    for (const label of outros) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current');
    }
  });

  it('não marca Estudo como ativo em subrota', () => {
    mockPathname.mockReturnValue('/desempenho/simulados');
    render(<DesempenhoNav />);

    expect(screen.getByRole('link', { name: 'Estudo' })).not.toHaveAttribute('aria-current');
  });
});
