/**
 * Persistência do wizard: cria caderno e, se houver itens, insere em seguida.
 * Em falha da inserção, exclui somente o caderno do ID retornado nesta tentativa.
 */

export type NotebookItemInput = {
  modulo_slug: string;
  titulo_aula?: string | null;
  topico?: string | null;
};

export type FetchAuthFn = (url: string, init?: RequestInit) => Promise<Response>;

export type CreateNotebookWithItemsOk = {
  ok: true;
  notebookId: string;
  itemCount: number;
};

export type CreateNotebookWithItemsErr = {
  ok: false;
  error: string;
  /** Inserção falhou e o DELETE compensatório também falhou. */
  cleanupFailed?: boolean;
  orphanNotebookId?: string;
};

export type CreateNotebookWithItemsResult = CreateNotebookWithItemsOk | CreateNotebookWithItemsErr;

type NotebookCreateJson = {
  notebook?: { id?: string };
  error?: string;
};

type ItemsCreateJson = {
  items?: unknown[];
  error?: string;
};

function messageFromJson(json: { error?: string }, fallback: string): string {
  return typeof json.error === 'string' && json.error.trim() ? json.error.trim() : fallback;
}

/**
 * Compensação create → items → DELETE(id) em falha.
 * Não usa nome/descrição para cleanup — apenas o ID da tentativa atual.
 */
export async function createNotebookWithItemsCompensation(params: {
  title: string;
  description: string | null;
  items: NotebookItemInput[];
  fetchAuth: FetchAuthFn;
}): Promise<CreateNotebookWithItemsResult> {
  const title = params.title.trim();
  if (!title) {
    return { ok: false, error: 'Digite um nome para o caderno.' };
  }

  const deduped = new Map<string, NotebookItemInput>();
  for (const item of params.items) {
    const slug = item.modulo_slug?.trim();
    if (!slug || deduped.has(slug)) continue;
    deduped.set(slug, {
      modulo_slug: slug,
      titulo_aula: item.titulo_aula ?? null,
      topico: item.topico ?? null,
    });
  }
  const items = [...deduped.values()];

  let createRes: Response;
  try {
    createRes = await params.fetchAuth('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: params.description?.trim() || null,
      }),
    });
  } catch {
    return { ok: false, error: 'Falha de rede ao criar o caderno. Tente de novo.' };
  }

  const createJson = (await createRes.json().catch(() => ({}))) as NotebookCreateJson;
  if (!createRes.ok) {
    return {
      ok: false,
      error: messageFromJson(createJson, 'Não foi possível criar o caderno.'),
    };
  }

  const notebookId = createJson.notebook?.id;
  if (!notebookId || typeof notebookId !== 'string') {
    return { ok: false, error: 'Resposta inválida ao criar o caderno.' };
  }

  if (items.length === 0) {
    return { ok: true, notebookId, itemCount: 0 };
  }

  let itemsRes: Response;
  try {
    itemsRes = await params.fetchAuth(`/api/notebooks/${notebookId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    const cleanup = await tryDeleteNotebook(params.fetchAuth, notebookId);
    if (!cleanup.ok) {
      return {
        ok: false,
        error:
          'Falha de rede ao adicionar questões e não foi possível remover o caderno parcial. Verifique em Meus cadernos.',
        cleanupFailed: true,
        orphanNotebookId: notebookId,
      };
    }
    return { ok: false, error: 'Falha de rede ao adicionar questões. Tente de novo.' };
  }

  if (itemsRes.ok) {
    return { ok: true, notebookId, itemCount: items.length };
  }

  const itemsJson = (await itemsRes.json().catch(() => ({}))) as ItemsCreateJson;
  const itemsError = messageFromJson(itemsJson, 'Não foi possível adicionar as questões ao caderno.');

  const cleanup = await tryDeleteNotebook(params.fetchAuth, notebookId);
  if (!cleanup.ok) {
    return {
      ok: false,
      error: `${itemsError} Também não foi possível remover o caderno parcial. Verifique em Meus cadernos.`,
      cleanupFailed: true,
      orphanNotebookId: notebookId,
    };
  }

  return { ok: false, error: itemsError };
}

async function tryDeleteNotebook(
  fetchAuth: FetchAuthFn,
  notebookId: string,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetchAuth(`/api/notebooks/${notebookId}`, { method: 'DELETE' });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
