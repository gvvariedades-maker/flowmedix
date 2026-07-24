import { render, screen, waitFor } from '@testing-library/react';
import CadernoDetailClient from '@/app/(dashboard)/(authenticated)/cadernos/[id]/CadernoDetailClient';
import type { CadernoDetail, ModuloDisponivel, NotebookItem } from '@/app/(dashboard)/(authenticated)/cadernos/[id]/page';

const replace = jest.fn();
const push = jest.fn();
const addToast = jest.fn();

let lastFilterHighlight = false;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, prefetch: jest.fn() }),
}));

jest.mock('@/lib/toast-context', () => ({
  useToast: () => ({ addToast }),
}));

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('@/components/onboarding/useFirstSeen', () => ({
  useFirstSeen: () => ({ visible: false, markSeen: jest.fn() }),
}));

jest.mock('@/lib/cadernos/templates', () => ({
  ...jest.requireActual('@/lib/cadernos/templates'),
  readWizardPreset: () => null,
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('@/components/questao-filter/QuestaoFilterBar', () => ({
  QuestaoFilterBar: (props: { highlightActiveFilters?: boolean }) => {
    lastFilterHighlight = !!props.highlightActiveFilters;
    return <div data-testid="questao-filter-bar" />;
  },
}));

jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  const Strip = ({ children, ...rest }: { children?: React.ReactNode; [k: string]: unknown }) => {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (k === 'className' || k === 'style' || k === 'role' || k.startsWith('aria-') || k === 'id') {
        safe[k] = v;
      }
    }
    return React.createElement('div', safe, children);
  };
  return {
    motion: { div: Strip, span: Strip },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => true,
  };
});

const notebookItem: NotebookItem = {
  id: 'item-1',
  modulo_slug: 'q-pt-1',
  titulo_aula: 'Crase',
  topico: 'Língua Portuguesa',
  position: 0,
  estudada: false,
  avant_codigo: 201,
  acessivel: true,
};

const modulosDisponiveis: ModuloDisponivel[] = [
  {
    id: 'mod-1',
    modulo_slug: 'q-farm-1',
    titulo_aula: 'Farmacodinâmica',
    modulo_nome: 'Farmacologia',
    banca: 'CESPE',
    avant_codigo: 102,
  },
];

function renderDetail(setupMode: 'none' | 'setup' | 'done', items: NotebookItem[] = []) {
  const caderno: CadernoDetail = {
    id: 'nb-test',
    title: 'Caderno teste',
    description: null,
    items,
  };

  return render(
    <CadernoDetailClient
      caderno={caderno}
      modulosDisponiveis={modulosDisponiveis}
      setupMode={setupMode}
    />,
  );
}

describe('CadernoDetailClient — modos ?setup=', () => {
  beforeEach(() => {
    replace.mockReset();
    push.mockReset();
    addToast.mockReset();
    lastFilterHighlight = false;
  });

  it('setup=done: exibe banner, toast e CTA para estudar; replace limpa o parâmetro', async () => {
    renderDetail('done', [notebookItem]);

    expect(screen.getByText('Caderno pronto!')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Estudar com NeuroSlides/i }).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        'Caderno pronto! Comece o estudo reverso quando quiser.',
        'success',
      );
    });
    expect(replace).toHaveBeenCalledWith('/cadernos/nb-test', { scroll: false });
  });

  it('após replace (setupMode none): celebração não reaparece', async () => {
    const { rerender } = renderDetail('done', [notebookItem]);

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Caderno pronto!')).toBeInTheDocument();

    addToast.mockClear();
    rerender(
      <CadernoDetailClient
        caderno={{
          id: 'nb-test',
          title: 'Caderno teste',
          description: null,
          items: [notebookItem],
        }}
        modulosDisponiveis={modulosDisponiveis}
        setupMode="none"
      />,
    );

    expect(screen.queryByText('Caderno pronto!')).not.toBeInTheDocument();
    expect(addToast).not.toHaveBeenCalled();
  });

  it('setup=1: abre busca, destaca filtros e não celebra', async () => {
    renderDetail('setup', []);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Inserir questões' })).toBeInTheDocument();
    });
    expect(lastFilterHighlight).toBe(true);
    expect(screen.queryByText('Caderno pronto!')).not.toBeInTheDocument();
    expect(addToast).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('setup desconhecido (none): sem banner, toast ou painel aberto por padrão', async () => {
    renderDetail('none', [notebookItem]);

    expect(screen.queryByText('Caderno pronto!')).not.toBeInTheDocument();
    expect(addToast).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(lastFilterHighlight).toBe(false);
    expect(screen.queryByRole('dialog', { name: 'Inserir questões' })).not.toBeInTheDocument();
  });
});
