/**
 * @jest-environment node
 */
import { invalidateHistoricoUserCache, historicoUserTag } from '@/lib/cache/revalidate';

const mockRevalidateTag = jest.fn();

jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

describe('invalidateHistoricoUserCache', () => {
  beforeEach(() => {
    mockRevalidateTag.mockClear();
  });

  it('invalida só a tag do histórico do aluno', async () => {
    await invalidateHistoricoUserCache('user-1');

    expect(historicoUserTag('user-1')).toBe('historico-user-user-1');
    expect(mockRevalidateTag).toHaveBeenCalledTimes(1);
    expect(mockRevalidateTag).toHaveBeenCalledWith('historico-user-user-1', { expire: 0 });
  });
});
