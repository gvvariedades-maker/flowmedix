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
});
