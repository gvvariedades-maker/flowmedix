import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NovoCadernoClient from '@/components/dashboard/cadernos/NovoCadernoClient';

const push = jest.fn();
const createComp = jest.fn();
const persistPreset = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock('@/lib/layout/useDashboardBottomInset', () => ({
  useDashboardBottomInset: () => ({ pageBottomPadding: 'pb-24' }),
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock('@/lib/cadernos/createNotebookWithItems', () => ({
  createNotebookWithItemsCompensation: (...args: unknown[]) => createComp(...args),
}));

jest.mock('@/lib/cadernos/notebookActivationBridge', () => ({
  requestNotebookActivationRefresh: jest.fn(),
}));

jest.mock('@/lib/cadernos/templates', () => {
  const actual = jest.requireActual<typeof import('@/lib/cadernos/templates')>(
    '@/lib/cadernos/templates',
  );
  return {
    ...actual,
    persistWizardPreset: (...args: unknown[]) => persistPreset(...args),
  };
});

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
    motion: { div: Strip },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => true,
  };
});

const modulos = [
  {
    modulo_slug: 'q-urg-1',
    titulo_aula: 'Urgências e Emergências',
    modulo_nome: 'Procedimentos',
    banca: 'CESPE',
    avant_codigo: 101,
  },
  {
    modulo_slug: 'q-farm-1',
    titulo_aula: 'Farmacodinâmica e Farmacocinética',
    modulo_nome: 'Farmacologia',
    banca: 'CESPE',
    avant_codigo: 102,
  },
  {
    modulo_slug: 'q-pt-1',
    titulo_aula: 'Crase',
    modulo_nome: 'Língua Portuguesa',
    banca: 'VUNESP',
    avant_codigo: 201,
  },
];

const edital = { nome: 'Edital', banca: 'CESPE', orgao: null, ano: null, slug: 'e' };

async function goToReview(title: string, description = '') {
  fireEvent.change(screen.getByLabelText(/Nome do caderno/i), { target: { value: title } });
  if (description) {
    fireEvent.change(screen.getByLabelText(/Descrição/i), { target: { value: description } });
  }
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
  await screen.findByText('2 de 3');
  fireEvent.click(screen.getByRole('button', { name: /Revisar/i }));
  return screen.findByRole('button', { name: /^Criar caderno$/i });
}

describe('NovoCadernoClient — wizard 3 etapas', () => {
  beforeEach(() => {
    push.mockReset();
    createComp.mockReset();
    persistPreset.mockReset();
  });

  it('exige nome antes de avançar e não persiste na etapa 1→2', async () => {
    render(
      <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
    );

    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Nome do caderno/i), {
      target: { value: 'Revisão CESPE' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(await screen.findByText('2 de 3')).toBeInTheDocument();
    expect(createComp).not.toHaveBeenCalled();
    expect(persistPreset).not.toHaveBeenCalled();
  });

  it('não persiste na revisão e cria só ao confirmar na etapa 3', async () => {
    createComp.mockResolvedValue({ ok: true, notebookId: 'nb-ok', itemCount: 1 });

    render(
      <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
    );

    fireEvent.change(screen.getByLabelText(/Nome do caderno/i), {
      target: { value: 'Meu caderno' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(await screen.findByText(/questões selecionadas|questão selecionada/i)).toBeInTheDocument();

    const search = screen.getByLabelText(/Assunto, banca, slug ou Q-/i);
    fireEvent.change(search, { target: { value: 'Crase' } });

    fireEvent.click(screen.getByRole('button', { name: /Revisar/i }));
    const createBtn = await screen.findByRole('button', { name: /^Criar caderno$/i });
    expect(createComp).not.toHaveBeenCalled();

    fireEvent.click(createBtn);

    await waitFor(() => expect(createComp).toHaveBeenCalledTimes(1));
    const arg = createComp.mock.calls[0][0] as {
      title: string;
      items: { modulo_slug: string }[];
    };
    expect(arg.title).toBe('Meu caderno');
    expect(arg.items.length).toBeGreaterThan(0);

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(persistPreset).toHaveBeenCalledTimes(1);
  });

  it('redireciona com ?setup=done quando há questões selecionadas', async () => {
    createComp.mockResolvedValue({ ok: true, notebookId: 'nb-with-items', itemCount: 2 });

    render(
      <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
    );

    const createBtn = await goToReview('Com questões');
    fireEvent.click(createBtn);

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/cadernos/nb-with-items?setup=done'),
    );
  });

  it('redireciona com ?setup=1 quando o caderno é criado vazio', async () => {
    createComp.mockResolvedValue({ ok: true, notebookId: 'nb-empty', itemCount: 0 });

    render(
      <NovoCadernoClient context={{ wizard: true, edital: null, modulos: [] }} />,
    );

    const createBtn = await goToReview('Vazio');
    fireEvent.click(createBtn);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/cadernos/nb-empty?setup=1'));
  });

  it('bloqueia dupla submissão enquanto a Promise está pendente', async () => {
    let resolveCreate: (v: unknown) => void = () => {};
    createComp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    render(
      <NovoCadernoClient context={{ wizard: true, edital: null, modulos }} />,
    );

    const createBtn = await goToReview('Duplo');
    fireEvent.click(createBtn);
    fireEvent.click(createBtn);

    expect(createComp).toHaveBeenCalledTimes(1);
    resolveCreate({ ok: true, notebookId: 'nb-d', itemCount: 0 });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });

  it('mantém o lock após sucesso até redirect/unmount — clique extra não cria de novo', async () => {
    createComp.mockResolvedValue({ ok: true, notebookId: 'nb-lock', itemCount: 1 });

    render(
      <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
    );

    const createBtn = await goToReview('Lock pós-sucesso');
    fireEvent.click(createBtn);

    await waitFor(() => expect(createComp).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(push).toHaveBeenCalled());

    expect(createBtn).toBeDisabled();
    fireEvent.click(createBtn);
    expect(createComp).toHaveBeenCalledTimes(1);
  });

  it('libera o lock após falha e permite nova tentativa', async () => {
    createComp
      .mockResolvedValueOnce({ ok: false, error: 'Falha no servidor' })
      .mockResolvedValueOnce({ ok: true, notebookId: 'nb-retry', itemCount: 0 });

    render(
      <NovoCadernoClient context={{ wizard: true, edital: null, modulos: [] }} />,
    );

    const createBtn = await goToReview('Retry');
    fireEvent.click(createBtn);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Falha no servidor'));
    expect(createComp).toHaveBeenCalledTimes(1);
    expect(persistPreset).not.toHaveBeenCalled();

    await waitFor(() => expect(createBtn).not.toBeDisabled());
    fireEvent.click(createBtn);

    await waitFor(() => expect(createComp).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/cadernos/nb-retry?setup=1'));
    expect(persistPreset).toHaveBeenCalledTimes(1);
  });

  describe('persistWizardPreset', () => {
    it('não persiste preset quando create falha', async () => {
      createComp.mockResolvedValue({ ok: false, error: 'Título inválido' });

      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      const createBtn = await goToReview('Falha create');
      fireEvent.click(createBtn);

      await waitFor(() => expect(createComp).toHaveBeenCalledTimes(1));
      expect(persistPreset).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });

    it('não persiste preset quando items falham', async () => {
      createComp.mockResolvedValue({ ok: false, error: 'Falha no lote' });

      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      const createBtn = await goToReview('Falha items');
      fireEvent.click(createBtn);

      await waitFor(() => expect(createComp).toHaveBeenCalledTimes(1));
      expect(persistPreset).not.toHaveBeenCalled();
    });

    it('não persiste preset quando cleanup falha', async () => {
      createComp.mockResolvedValue({
        ok: false,
        error: 'Conflito',
        cleanupFailed: true,
        orphanNotebookId: 'nb-orphan',
      });

      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      const createBtn = await goToReview('Falha cleanup');
      fireEvent.click(createBtn);

      await waitFor(() => expect(createComp).toHaveBeenCalledTimes(1));
      expect(persistPreset).not.toHaveBeenCalled();
    });

    it('persiste exatamente uma vez após sucesso e antes do redirect', async () => {
      const callOrder: string[] = [];
      createComp.mockImplementation(async () => {
        callOrder.push('create');
        return { ok: true, notebookId: 'nb-order', itemCount: 1 };
      });
      persistPreset.mockImplementation(() => {
        callOrder.push('persist');
      });
      push.mockImplementation(() => {
        callOrder.push('push');
      });

      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      const createBtn = await goToReview('Ordem');
      fireEvent.click(createBtn);

      await waitFor(() => expect(push).toHaveBeenCalled());
      expect(persistPreset).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(['create', 'persist', 'push']);
    });

    it('falha secundária de sessionStorage não impede sucesso nem exibe erro falso', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      persistPreset.mockImplementation(
        jest.requireActual<typeof import('@/lib/cadernos/templates')>('@/lib/cadernos/templates')
          .persistWizardPreset,
      );
      createComp.mockResolvedValue({ ok: true, notebookId: 'nb-storage', itemCount: 0 });

      render(
        <NovoCadernoClient context={{ wizard: true, edital: null, modulos: [] }} />,
      );

      const createBtn = await goToReview('Storage fail');
      fireEvent.click(createBtn);

      await waitFor(() =>
        expect(push).toHaveBeenCalledWith('/cadernos/nb-storage?setup=1'),
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(createComp).toHaveBeenCalledTimes(1);

      setItemSpy.mockRestore();
    });
  });

  describe('preservação de estado entre etapas', () => {
    it('mantém nome, descrição e seleção ao voltar pelas etapas', async () => {
      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      fireEvent.change(screen.getByLabelText(/Nome do caderno/i), {
        target: { value: 'Caderno preservado' },
      });
      fireEvent.change(screen.getByLabelText(/Descrição/i), {
        target: { value: 'Descrição de teste' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
      await screen.findByText('2 de 3');

      const search = screen.getByLabelText(/Assunto, banca, slug ou Q-/i);
      fireEvent.change(search, { target: { value: 'Farmacodinâmica' } });
      const farmOption = await screen.findByRole('option', { name: /Farmacodinâmica/i });
      expect(farmOption).toHaveAttribute('aria-selected', 'true');

      const countBefore = screen.getByText(/questões selecionadas|questão selecionada/i).textContent;

      fireEvent.click(screen.getByRole('button', { name: /Revisar/i }));
      await screen.findByText('3 de 3');
      expect(screen.getByText('Caderno preservado')).toBeInTheDocument();
      expect(screen.getByText('Descrição de teste')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Voltar à seleção/i }));
      await screen.findByText('2 de 3');
      expect(screen.getByText(countBefore!)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Farmacodinâmica/i })).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(screen.getByRole('button', { name: /^Voltar$/i }));
      await screen.findByText('1 de 3');
      expect(screen.getByLabelText(/Nome do caderno/i)).toHaveValue('Caderno preservado');
      expect(screen.getByLabelText(/Descrição/i)).toHaveValue('Descrição de teste');

      fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
      await screen.findByText('2 de 3');
      expect(screen.getByText(countBefore!)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Farmacodinâmica/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('mantém a seleção ao alterar e remover filtros', async () => {
      render(
        <NovoCadernoClient context={{ wizard: true, edital, modulos }} />,
      );

      fireEvent.change(screen.getByLabelText(/Nome do caderno/i), {
        target: { value: 'Filtros' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
      await screen.findByText('2 de 3');

      const countWithFilter = screen.getByText(/questões selecionadas|questão selecionada/i).textContent;
      const search = screen.getByLabelText(/Assunto, banca, slug ou Q-/i);

      fireEvent.change(search, { target: { value: 'Urgências' } });
      expect(screen.getByText(countWithFilter!)).toBeInTheDocument();

      fireEvent.change(search, { target: { value: '' } });
      expect(screen.getByText(countWithFilter!)).toBeInTheDocument();

      fireEvent.change(search, { target: { value: 'Farmacodinâmica' } });
      expect(screen.getByText(countWithFilter!)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Farmacodinâmica/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
