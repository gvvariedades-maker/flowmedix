import { render, screen } from '@testing-library/react';
import CadernosListClient from '@/app/(dashboard)/(authenticated)/cadernos/CadernosListClient';
import type { NotebookSummary } from '@/app/(dashboard)/(authenticated)/cadernos/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  return {
    motion: { li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li> },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

describe('CadernosListClient — link setup vazio', () => {
  it('caderno sem questões abre detalhe com ?setup=1', () => {
    const cadernos: NotebookSummary[] = [
      {
        id: 'nb-empty',
        title: 'Caderno vazio',
        description: null,
        updated_at: '2026-01-01T00:00:00.000Z',
        itemCount: 0,
        studiedCount: 0,
        studyEntrySlug: null,
        studyEntryTitle: null,
        studyEntryPosition: null,
        source_pack_id: null,
      },
    ];

    render(<CadernosListClient cadernos={cadernos} />);

    const link = screen.getByRole('link', { name: /Adicionar questões/i });
    expect(link).toHaveAttribute('href', '/cadernos/nb-empty?setup=1');
  });
});
