import type { EstudarQuestaoPayload } from '@/components/lesson/questao-navigation-context';
import {
  clearAllQuestaoIdb,
  deleteQuestaoFromIdbBySlug,
  getQuestaoFromIdb,
  hydrateQuestaoLruFromIdb,
  setQuestaoInIdb,
} from '@/lib/estudar/questaoIdbCache';

const samplePayload = {
  dados: {
    meta: { banca: 'FGV', topico: 'Urgências' },
    question_data: {
      instruction: 'Enunciado',
      options: [{ id: 'a', text: 'A', is_correct: true }],
    },
  },
  moduloSlug: 'questao-a',
  vitrineQuerySuffix: '',
} as EstudarQuestaoPayload;

function installFakeIndexedDb() {
  const records = new Map<string, unknown>();

  const makeRequest = <T,>(result: T): IDBRequest<T> => {
    const req = { result } as IDBRequest<T> & { _onsuccess?: (ev: Event) => void };
    Object.defineProperty(req, 'onsuccess', {
      configurable: true,
      set(fn: (ev: Event) => void) {
        req._onsuccess = fn;
        queueMicrotask(() => fn?.({ target: req } as unknown as Event));
      },
      get() {
        return req._onsuccess;
      },
    });
    return req;
  };

  const objectStore = {
    get: (key: string) => makeRequest(records.get(key)),
    getAll: () => makeRequest([...records.values()]),
    put: (value: { key: string }) => {
      records.set(value.key, value);
      return makeRequest(undefined);
    },
    delete: (key: string) => {
      records.delete(key);
      return makeRequest(undefined);
    },
    clear: () => {
      records.clear();
      return makeRequest(undefined);
    },
  } as unknown as IDBObjectStore;

  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore: () => objectStore,
    transaction: () => {
      const tx = {
        objectStore: () => objectStore,
      } as unknown as IDBTransaction & { _oncomplete?: (ev: Event) => void };
      Object.defineProperty(tx, 'oncomplete', {
        configurable: true,
        set(fn: (ev: Event) => void) {
          tx._oncomplete = fn;
          queueMicrotask(() => fn?.({} as Event));
        },
        get() {
          return tx._oncomplete;
        },
      });
      return tx;
    },
    close: jest.fn(),
  } as unknown as IDBDatabase;

  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open: () => {
        const req = { result: db } as IDBOpenDBRequest & { _onsuccess?: (ev: Event) => void };
        Object.defineProperty(req, 'onsuccess', {
          configurable: true,
          set(fn: (ev: Event) => void) {
            req._onsuccess = fn;
            queueMicrotask(() => fn?.({ target: req } as unknown as Event));
          },
          get() {
            return req._onsuccess;
          },
        });
        return req;
      },
    },
  });

  return records;
}

describe('questaoIdbCache', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0;
    installFakeIndexedDb();
  });

  afterAll(() => {
    process.env = env;
    delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
  });

  it('persiste e recupera payload por chave', async () => {
    await setQuestaoInIdb('questao-a', samplePayload);
    const loaded = await getQuestaoFromIdb('questao-a');
    expect(loaded?.moduloSlug).toBe('questao-a');
  });

  it('hidrata callback com entradas válidas', async () => {
    await setQuestaoInIdb('questao-a', samplePayload);
    await setQuestaoInIdb('questao-b', { ...samplePayload, moduloSlug: 'questao-b' });

    const map = new Map<string, EstudarQuestaoPayload>();
    const count = await hydrateQuestaoLruFromIdb((key, payload) => {
      map.set(key, payload);
    });

    expect(count).toBe(2);
    expect(map.get('questao-a')?.moduloSlug).toBe('questao-a');
  });

  it('retorna null quando IDB L0 desabilitado', async () => {
    process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0 = '0';
    await setQuestaoInIdb('questao-a', samplePayload);
    const loaded = await getQuestaoFromIdb('questao-a');
    expect(loaded).toBeNull();
  });

  it('deleteQuestaoFromIdbBySlug remove chave exata e variantes com query', async () => {
    await setQuestaoInIdb('questao-a', samplePayload);
    await setQuestaoInIdb('questao-a|page=2', {
      ...samplePayload,
      vitrineQuerySuffix: '?page=2',
    });
    await setQuestaoInIdb('questao-b', { ...samplePayload, moduloSlug: 'questao-b' });

    await deleteQuestaoFromIdbBySlug('questao-a');

    expect(await getQuestaoFromIdb('questao-a')).toBeNull();
    expect(await getQuestaoFromIdb('questao-a|page=2')).toBeNull();
    expect(await getQuestaoFromIdb('questao-b')).not.toBeNull();
  });

  it('não grava nem lê payload cuja chave diverge do vitrineQuerySuffix', async () => {
    await setQuestaoInIdb('questao-a|disciplina=portugues', samplePayload);
    expect(await getQuestaoFromIdb('questao-a|disciplina=portugues')).toBeNull();

    await setQuestaoInIdb('questao-a|disciplina=portugues', {
      ...samplePayload,
      vitrineQuerySuffix: '?disciplina=portugues',
    });
    expect(await getQuestaoFromIdb('questao-a|disciplina=portugues')).not.toBeNull();
  });

  it('hydrate descarta entradas incoerentes (chave vs suffix)', async () => {
    const records = installFakeIndexedDb();
    const now = Date.now();
    records.set('questao-a|disciplina=portugues', {
      key: 'questao-a|disciplina=portugues',
      payload: samplePayload,
      cachedAt: now,
      expiresAt: now + 60_000,
      lastAccessAt: now,
    });

    const map = new Map<string, EstudarQuestaoPayload>();
    const count = await hydrateQuestaoLruFromIdb((key, payload) => {
      map.set(key, payload);
    });

    expect(count).toBe(0);
    expect(map.size).toBe(0);
    expect(records.has('questao-a|disciplina=portugues')).toBe(false);
  });

  it('clearAllQuestaoIdb remove todas as entradas', async () => {
    await setQuestaoInIdb('questao-a', samplePayload);
    await setQuestaoInIdb('questao-b', { ...samplePayload, moduloSlug: 'questao-b' });

    await clearAllQuestaoIdb();

    expect(await getQuestaoFromIdb('questao-a')).toBeNull();
    expect(await getQuestaoFromIdb('questao-b')).toBeNull();
  });
});
