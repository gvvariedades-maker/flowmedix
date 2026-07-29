/**
 * R6.1 — matriz comportamental coorte × rota (AVANT Memória).
 *
 * Complementa `avantMemoriaRotaCanonica.test.ts` (que assere o código-fonte):
 * aqui o control flow real das páginas RSC é executado com dependências
 * mockadas, provando que a coorte decide no servidor e que **nenhum** resultado
 * de fila devolve a coorte ativa ao Plano diário (prova de ausência de loop).
 */

import type { FsrsReviewQueueItem } from '@/lib/fsrs/queue';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const BETA_EMAIL = 'beta@avant.test';

/** Espelha o throw do `redirect()` do Next — interrompe o render como em produção. */
class RedirectSignal extends Error {
  constructor(public readonly path: string) {
    super(`NEXT_REDIRECT:${path}`);
  }
}

type ReviewsTodayLike =
  | { source: 'sm2'; reviews: unknown[] }
  | {
      source: 'fsrs';
      reviews: FsrsReviewQueueItem[];
      telemetry: { same_stem_fallback: number; inventory_missing: number };
    };

const redirectMock = jest.fn((path: string): never => {
  throw new RedirectSignal(path);
});
const shouldUseFsrsTodayQueueMock = jest.fn((_email?: string | null) => false);
const getReviewsTodayMock = jest.fn(
  async (_input?: unknown): Promise<ReviewsTodayLike> => ({ source: 'sm2', reviews: [] }),
);
const getTodayReviewsMock = jest.fn(async (_userId: string) => [] as unknown[]);
const getServerSessionMock = jest.fn(async (): Promise<unknown> => ({
  user: { id: USER_ID, email: BETA_EMAIL },
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

jest.mock('@/lib/e2e/bypass', () => ({
  isE2eBypassEnabled: () => false,
}));

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerSession: () => getServerSessionMock(),
}));

jest.mock('@/lib/fsrs/reviewsToday', () => ({
  shouldUseFsrsTodayQueue: (email?: string | null) => shouldUseFsrsTodayQueueMock(email),
  getReviewsToday: (input: unknown) => getReviewsTodayMock(input),
}));

jest.mock('@/lib/spaced-repetition', () => ({
  getTodayReviews: (userId: string) => getTodayReviewsMock(userId),
}));

jest.mock('@/app/(dashboard)/(authenticated)/plano-diario/PlanoDiarioClient', () => ({
  __esModule: true,
  default: function PlanoDiarioClientMock() {
    return null;
  },
}));

import PlanoDiarioPage from '@/app/(dashboard)/(authenticated)/plano-diario/page';
import RevisoesHojePage from '@/app/(dashboard)/(authenticated)/revisoes-hoje/page';

type PageOutcome =
  | { kind: 'redirect'; path: string }
  | { kind: 'render'; component: string };

async function run(page: () => Promise<unknown>): Promise<PageOutcome> {
  try {
    const element = (await page()) as { type?: unknown } | null;
    const type = element?.type;
    return {
      kind: 'render',
      component: typeof type === 'function' ? (type as { name: string }).name : String(type),
    };
  } catch (err) {
    if (err instanceof RedirectSignal) return { kind: 'redirect', path: err.path };
    throw err;
  }
}

const openPlanoDiario = () => run(() => PlanoDiarioPage());
const openRevisoesHoje = () =>
  run(() => RevisoesHojePage({ searchParams: Promise.resolve({}) }));

function fsrsQueue(slugs: string[]): ReviewsTodayLike {
  return {
    source: 'fsrs',
    reviews: slugs.map((slug) => ({
      modulo_slug: slug,
      review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=Imuniza%C3%A7%C3%A3o',
      same_stem_fallback: false,
      inventory_missing: false,
    })),
    telemetry: { same_stem_fallback: 0, inventory_missing: 0 },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  shouldUseFsrsTodayQueueMock.mockReturnValue(false);
  getReviewsTodayMock.mockResolvedValue({ source: 'sm2', reviews: [] });
  getTodayReviewsMock.mockResolvedValue([]);
  getServerSessionMock.mockResolvedValue({ user: { id: USER_ID, email: BETA_EMAIL } });
});

describe('AVANT Memória — coorte inativa (flag off ou fora da allowlist)', () => {
  it('/plano-diario renderiza o legado SM-2 sem redirecionar', async () => {
    const outcome = await openPlanoDiario();
    expect(outcome).toEqual({ kind: 'render', component: 'PlanoDiarioClientMock' });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(getTodayReviewsMock).toHaveBeenCalledWith(USER_ID);
  });

  it('/revisoes-hoje devolve ao Plano diário antes de montar a fila', async () => {
    const outcome = await openRevisoesHoje();
    expect(outcome).toEqual({ kind: 'redirect', path: '/plano-diario' });
    expect(getReviewsTodayMock).not.toHaveBeenCalled();
  });
});

describe('AVANT Memória — coorte ativa', () => {
  beforeEach(() => {
    shouldUseFsrsTodayQueueMock.mockReturnValue(true);
  });

  it('/plano-diario redireciona para a rota canônica sem tocar o SM-2', async () => {
    const outcome = await openPlanoDiario();
    expect(outcome).toEqual({ kind: 'redirect', path: '/revisoes-hoje' });
    expect(getTodayReviewsMock).not.toHaveBeenCalled();
  });

  it('fila FSRS com cards renderiza a fila', async () => {
    getReviewsTodayMock.mockResolvedValue(fsrsQueue(['slug-a']));
    await expect(openRevisoesHoje()).resolves.toEqual({
      kind: 'render',
      component: 'RevisoesQueue',
    });
  });

  it('fila FSRS vazia renderiza empty state (não indisponibilidade)', async () => {
    getReviewsTodayMock.mockResolvedValue(fsrsQueue([]));
    await expect(openRevisoesHoje()).resolves.toEqual({
      kind: 'render',
      component: 'RevisoesEmpty',
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('fallback SM-2 (falha FSRS) renderiza estado degradado e NÃO redireciona', async () => {
    getReviewsTodayMock.mockResolvedValue({ source: 'sm2', reviews: [{ modulo_slug: 'x' }] });
    await expect(openRevisoesHoje()).resolves.toEqual({
      kind: 'render',
      component: 'RevisoesIndisponivel',
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('decide a coorte no servidor com o e-mail da sessão', async () => {
    getReviewsTodayMock.mockResolvedValue(fsrsQueue(['slug-a']));
    await openRevisoesHoje();
    expect(shouldUseFsrsTodayQueueMock).toHaveBeenCalledWith(BETA_EMAIL);
    expect(getReviewsTodayMock).toHaveBeenCalledWith({
      userId: USER_ID,
      email: BETA_EMAIL,
    });
  });
});

describe('AVANT Memória — ausência de loop de redirect', () => {
  it('coorte ativa: /plano-diario → /revisoes-hoje e a canônica nunca volta ao legado', async () => {
    shouldUseFsrsTodayQueueMock.mockReturnValue(true);

    const primeiro = await openPlanoDiario();
    expect(primeiro).toEqual({ kind: 'redirect', path: '/revisoes-hoje' });

    // Pior caso do destino: FSRS indisponível → fallback SM-2.
    getReviewsTodayMock.mockResolvedValue({ source: 'sm2', reviews: [] });
    const segundo = await openRevisoesHoje();

    expect(segundo.kind).toBe('render');
    expect(
      redirectMock.mock.calls.filter(([path]) => path === '/plano-diario'),
    ).toHaveLength(0);
  });

  it('coorte inativa: /revisoes-hoje → /plano-diario e o legado nunca volta à canônica', async () => {
    shouldUseFsrsTodayQueueMock.mockReturnValue(false);

    const primeiro = await openRevisoesHoje();
    expect(primeiro).toEqual({ kind: 'redirect', path: '/plano-diario' });

    const segundo = await openPlanoDiario();
    expect(segundo.kind).toBe('render');
    expect(
      redirectMock.mock.calls.filter(([path]) => path === '/revisoes-hoje'),
    ).toHaveLength(0);
  });

  it('as duas condições de coorte são mutuamente exclusivas nas duas rotas', async () => {
    for (const ativo of [true, false]) {
      jest.clearAllMocks();
      shouldUseFsrsTodayQueueMock.mockReturnValue(ativo);
      getReviewsTodayMock.mockResolvedValue(
        ativo ? fsrsQueue(['slug-a']) : { source: 'sm2', reviews: [] },
      );

      const plano = await openPlanoDiario();
      const revisoes = await openRevisoesHoje();
      const redirects = redirectMock.mock.calls.map(([path]) => path);

      // Exatamente uma das rotas redireciona; a outra renderiza.
      expect([plano.kind, revisoes.kind].sort()).toEqual(['redirect', 'render']);
      expect(redirects).toHaveLength(1);
    }
  });
});

describe('AVANT Memória — sessão ausente', () => {
  it('as duas rotas exigem login antes de qualquer decisão de coorte', async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(openPlanoDiario()).resolves.toEqual({
      kind: 'redirect',
      path: '/login',
    });
    await expect(openRevisoesHoje()).resolves.toEqual({
      kind: 'redirect',
      path: '/login',
    });
    expect(shouldUseFsrsTodayQueueMock).not.toHaveBeenCalled();
  });
});
