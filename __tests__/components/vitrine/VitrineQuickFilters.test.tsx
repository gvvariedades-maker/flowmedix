import { fireEvent, render, screen } from '@testing-library/react';
import VitrineQuickFilters from '@/components/vitrine/VitrineQuickFilters';

describe('VitrineQuickFilters', () => {
  it('dispara mudança de status e vista', () => {
    const onStatusChange = jest.fn();
    const onViewChange = jest.fn();

    render(
      <VitrineQuickFilters
        status="all"
        onStatusChange={onStatusChange}
        view="grid"
        onViewChange={onViewChange}
      />,
    );

    fireEvent.click(screen.getByTestId('vitrine-status-pending'));
    fireEvent.click(screen.getByTestId('vitrine-view-compact'));

    expect(onStatusChange).toHaveBeenCalledWith('pending');
    expect(onViewChange).toHaveBeenCalledWith('compact');
  });

  it('usa texto ≥14px, alvos 44px e ativo inequívoco', () => {
    render(
      <VitrineQuickFilters
        status="pending"
        onStatusChange={jest.fn()}
        view="grid"
        onViewChange={jest.fn()}
      />,
    );

    const pending = screen.getByTestId('vitrine-status-pending');
    expect(pending.className).toMatch(/min-h-11/);
    expect(pending.className).toMatch(/text-sm/);
    expect(pending.className).toMatch(/ring-1/);
    expect(pending).toHaveAttribute('aria-selected', 'true');

    const grid = screen.getByTestId('vitrine-view-grid');
    expect(grid.className).toMatch(/size-11/);
    expect(grid.className).toMatch(/ring-1/);
  });
});
