import { createNotebookWithItemsCompensation } from '@/lib/cadernos/createNotebookWithItems';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('lib/cadernos/createNotebookWithItemsCompensation', () => {
  it('cria caderno sem items quando a seleção está vazia', async () => {
    const calls: { url: string; method?: string }[] = [];
    const fetchAuth = jest.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method });
      return jsonResponse(201, { notebook: { id: 'nb-1' } });
    });

    const result = await createNotebookWithItemsCompensation({
      title: 'Meu caderno',
      description: null,
      items: [],
      fetchAuth,
    });

    expect(result).toEqual({ ok: true, notebookId: 'nb-1', itemCount: 0 });
    expect(calls).toEqual([{ url: '/api/notebooks', method: 'POST' }]);
  });

  it('cria caderno e insere items com deduplicação', async () => {
    const bodies: unknown[] = [];
    const fetchAuth = jest.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/notebooks') {
        return jsonResponse(201, { notebook: { id: 'nb-2' } });
      }
      bodies.push(JSON.parse(String(init?.body)));
      return jsonResponse(201, { items: [{ id: 'i1' }, { id: 'i2' }] });
    });

    const result = await createNotebookWithItemsCompensation({
      title: 'Caderno',
      description: 'desc',
      items: [
        { modulo_slug: 'q-1', titulo_aula: 'A', topico: 'T' },
        { modulo_slug: 'q-1', titulo_aula: 'A', topico: 'T' },
        { modulo_slug: 'q-2', titulo_aula: 'B', topico: 'T' },
      ],
      fetchAuth,
    });

    expect(result).toEqual({ ok: true, notebookId: 'nb-2', itemCount: 2 });
    expect(bodies[0]).toEqual({
      items: [
        { modulo_slug: 'q-1', titulo_aula: 'A', topico: 'T' },
        { modulo_slug: 'q-2', titulo_aula: 'B', topico: 'T' },
      ],
    });
  });

  it('em falha de criação não tenta items nem delete', async () => {
    const fetchAuth = jest.fn(async () => jsonResponse(400, { error: 'Título obrigatório' }));
    const result = await createNotebookWithItemsCompensation({
      title: 'X',
      description: null,
      items: [{ modulo_slug: 'q-1' }],
      fetchAuth,
    });
    expect(result).toEqual({ ok: false, error: 'Título obrigatório' });
    expect(fetchAuth).toHaveBeenCalledTimes(1);
  });

  it('em falha de inserção exclui o caderno pelo ID retornado', async () => {
    const methods: string[] = [];
    const fetchAuth = jest.fn(async (url: string, init?: RequestInit) => {
      methods.push(`${init?.method ?? 'GET'} ${url}`);
      if (url === '/api/notebooks') {
        return jsonResponse(201, { notebook: { id: 'nb-orphan-candidate' } });
      }
      if (url === '/api/notebooks/nb-orphan-candidate/items') {
        return jsonResponse(500, { error: 'Falha no lote' });
      }
      if (url === '/api/notebooks/nb-orphan-candidate') {
        return jsonResponse(200, { success: true });
      }
      throw new Error(`URL inesperada: ${url}`);
    });

    const result = await createNotebookWithItemsCompensation({
      title: 'Caderno',
      description: null,
      items: [{ modulo_slug: 'q-1' }],
      fetchAuth,
    });

    expect(result).toEqual({ ok: false, error: 'Falha no lote' });
    expect(methods).toEqual([
      'POST /api/notebooks',
      'POST /api/notebooks/nb-orphan-candidate/items',
      'DELETE /api/notebooks/nb-orphan-candidate',
    ]);
  });

  it('sinaliza cleanupFailed quando o DELETE compensatório falha', async () => {
    const fetchAuth = jest.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/notebooks' && init?.method === 'POST') {
        return jsonResponse(201, { notebook: { id: 'nb-stuck' } });
      }
      if (url.includes('/items')) {
        return jsonResponse(409, { error: 'Conflito' });
      }
      return jsonResponse(500, { error: 'delete failed' });
    });

    const result = await createNotebookWithItemsCompensation({
      title: 'Caderno',
      description: null,
      items: [{ modulo_slug: 'q-1' }],
      fetchAuth,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.cleanupFailed).toBe(true);
    expect(result.orphanNotebookId).toBe('nb-stuck');
    expect(result.error).toContain('não foi possível remover o caderno parcial');
  });

  it('rejeita título vazio sem chamar a API', async () => {
    const fetchAuth = jest.fn();
    const result = await createNotebookWithItemsCompensation({
      title: '   ',
      description: null,
      items: [],
      fetchAuth,
    });
    expect(result).toEqual({ ok: false, error: 'Digite um nome para o caderno.' });
    expect(fetchAuth).not.toHaveBeenCalled();
  });
});
