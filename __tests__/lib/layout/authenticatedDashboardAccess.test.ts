jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

import { decideAuthenticatedDashboardAccess } from '@/lib/layout/authenticatedDashboardAccess';
import type { AuthenticatedDashboardAccessDeps } from '@/lib/layout/authenticatedDashboardAccess';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function flushMicrotasks() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe('decideAuthenticatedDashboardAccess', () => {
  it('autoriza o caminho feliz com 1 getUser e 1 leitura de matrícula', async () => {
    const userHasActiveMatricula = jest.fn().mockResolvedValue(true);
    const ensureGeralCadastroMatricula = jest.fn();
    const getServerUser = jest.fn().mockResolvedValue({
      id: 'user-pro',
      email: 'pro@example.com',
    });

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser,
      getServerSession: async () => ({ user: { id: 'user-pro' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula,
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'ok' });
    expect(getServerUser).toHaveBeenCalledTimes(1);
    expect(userHasActiveMatricula).toHaveBeenCalledTimes(1);
    expect(userHasActiveMatricula).toHaveBeenCalledWith('user-pro');
    expect(ensureGeralCadastroMatricula).not.toHaveBeenCalled();
  });

  it('dispara a matrícula em paralelo, sem esperar o getUser', async () => {
    const userDeferred = deferred<{ id: string; email: string }>();
    let matriculaStarted = false;
    const userHasActiveMatricula = jest.fn().mockImplementation(async () => {
      matriculaStarted = true;
      return true;
    });

    const decisionPromise = decideAuthenticatedDashboardAccess({
      getServerUser: () => userDeferred.promise,
      getServerSession: async () => ({ user: { id: 'user-1' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula: jest.fn(),
      isAdminSessionEmail: () => false,
    });

    await flushMicrotasks();
    expect(matriculaStarted).toBe(true);
    expect(userHasActiveMatricula).toHaveBeenCalledWith('user-1');

    userDeferred.resolve({ id: 'user-1', email: 'aluno@example.com' });
    await expect(decisionPromise).resolves.toEqual({ type: 'ok' });
  });

  it('sessão revogada com cookie ainda presente redireciona para login', async () => {
    const userHasActiveMatricula = jest.fn().mockResolvedValue(true);
    const ensureGeralCadastroMatricula = jest.fn();

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => null,
      getServerSession: async () => ({ user: { id: 'stale-cookie' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula,
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'redirect', to: '/login' });
    expect(ensureGeralCadastroMatricula).not.toHaveBeenCalled();
  });

  it('aguarda a matrícula paralela mesmo quando o getUser falha', async () => {
    const matriculaDeferred = deferred<boolean>();
    let matriculaConsumed = false;
    const userHasActiveMatricula = jest.fn().mockImplementation(() => {
      void matriculaDeferred.promise.then(() => {
        matriculaConsumed = true;
      });
      return matriculaDeferred.promise;
    });

    let settled = false;
    const decisionPromise = decideAuthenticatedDashboardAccess({
      getServerUser: async () => null,
      getServerSession: async () => ({ user: { id: 'stale-cookie' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula: jest.fn(),
      isAdminSessionEmail: () => false,
    }).then((decision) => {
      settled = true;
      return decision;
    });

    await flushMicrotasks();
    expect(settled).toBe(false);
    expect(matriculaConsumed).toBe(false);

    matriculaDeferred.resolve(true);
    await expect(decisionPromise).resolves.toEqual({ type: 'redirect', to: '/login' });
    expect(settled).toBe(true);
    expect(matriculaConsumed).toBe(true);
  });

  it('sessão expirada (sem user e sem cookie) redireciona para login', async () => {
    const userHasActiveMatricula = jest.fn();

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => null,
      getServerSession: async () => null,
      userHasActiveMatricula,
      ensureGeralCadastroMatricula: jest.fn(),
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'redirect', to: '/login' });
    expect(userHasActiveMatricula).not.toHaveBeenCalled();
  });

  it('sem matrícula: leitura inicial, escrita e releitura fresh', async () => {
    const userHasActiveMatricula = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const ensureGeralCadastroMatricula = jest.fn().mockResolvedValue({ id: 'geral' });

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => ({ id: 'user-free', email: 'free@example.com' }),
      getServerSession: async () => ({ user: { id: 'user-free' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula,
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'ok' });
    expect(ensureGeralCadastroMatricula).toHaveBeenCalledTimes(1);
    expect(ensureGeralCadastroMatricula).toHaveBeenCalledWith('user-free');
    expect(userHasActiveMatricula).toHaveBeenCalledTimes(2);
    expect(userHasActiveMatricula.mock.calls[0]).toEqual(['user-free']);
    expect(userHasActiveMatricula.mock.calls[1]).toEqual([
      'user-free',
      undefined,
      { fresh: true },
    ]);
  });

  it('sem matrícula após ensure redireciona para planos', async () => {
    const userHasActiveMatricula = jest.fn().mockResolvedValue(false);
    const ensureGeralCadastroMatricula = jest
      .fn()
      .mockRejectedValue(new Error('falha cadastro'));

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => ({ id: 'user-none', email: 'none@example.com' }),
      getServerSession: async () => ({ user: { id: 'user-none' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula,
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'redirect', to: '/planos' });
    expect(userHasActiveMatricula.mock.calls[1]?.[2]).toEqual({ fresh: true });
  });

  it('admin entra sem gate de matrícula', async () => {
    const userHasActiveMatricula = jest.fn().mockResolvedValue(false);
    const ensureGeralCadastroMatricula = jest.fn();

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => ({ id: 'admin-1', email: 'admin@example.com' }),
      getServerSession: async () => ({ user: { id: 'admin-1' } }),
      userHasActiveMatricula,
      ensureGeralCadastroMatricula,
      isAdminSessionEmail: (email) => email === 'admin@example.com',
    });

    expect(decision).toEqual({ type: 'ok' });
    expect(ensureGeralCadastroMatricula).not.toHaveBeenCalled();
  });

  it('não autoriza com o snapshot paralelo se o userId do cookie divergir do getUser', async () => {
    const userHasActiveMatricula = jest.fn(async (userId: string) => userId === 'real-user');

    const decision = await decideAuthenticatedDashboardAccess({
      getServerUser: async () => ({ id: 'real-user', email: 'real@example.com' }),
      getServerSession: async () => ({ user: { id: 'other-user' } }),
      userHasActiveMatricula: userHasActiveMatricula as AuthenticatedDashboardAccessDeps['userHasActiveMatricula'],
      ensureGeralCadastroMatricula: jest.fn(),
      isAdminSessionEmail: () => false,
    });

    expect(decision).toEqual({ type: 'ok' });
    expect(userHasActiveMatricula).toHaveBeenCalledWith('other-user');
    expect(userHasActiveMatricula).toHaveBeenCalledWith('real-user');
  });
});
