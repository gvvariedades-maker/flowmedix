import {
  ESTUDAR_IDB_DB_VERSION,
  ESTUDAR_L0_MAX_ENTRIES,
  ESTUDAR_L0_TTL_MS,
  ESTUDAR_SW_CACHE_NAME,
  ESTUDAR_SW_QUESTAO_API_PATH,
  isEstudarIdbL0Enabled,
  isEstudarModalRouteEnabled,
  isEstudarSwL0Enabled,
} from '@/lib/estudar/estudarL0Config';

describe('estudarL0Config', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it('expõe constantes alinhadas ao LRU server-side', () => {
    expect(ESTUDAR_L0_MAX_ENTRIES).toBe(20);
    expect(ESTUDAR_L0_TTL_MS).toBe(120_000);
    expect(ESTUDAR_IDB_DB_VERSION).toBeGreaterThanOrEqual(2);
    expect(ESTUDAR_SW_CACHE_NAME).toContain('avant-estudar-questao-l0-v2');
    expect(ESTUDAR_SW_QUESTAO_API_PATH).toBe('/api/estudar/questao');
  });

  it('IDB L0 habilitado por padrão', () => {
    delete process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0;
    expect(isEstudarIdbL0Enabled()).toBe(true);
    process.env.NEXT_PUBLIC_ESTUDAR_IDB_L0 = '0';
    expect(isEstudarIdbL0Enabled()).toBe(false);
  });

  it('modal route é opt-in', () => {
    delete process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE;
    expect(isEstudarModalRouteEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE = '1';
    expect(isEstudarModalRouteEnabled()).toBe(true);
  });

  it('SW L0 habilitado por padrão', () => {
    delete process.env.NEXT_PUBLIC_ESTUDAR_SW_L0;
    expect(isEstudarSwL0Enabled()).toBe(true);
    process.env.NEXT_PUBLIC_ESTUDAR_SW_L0 = '0';
    expect(isEstudarSwL0Enabled()).toBe(false);
  });
});
