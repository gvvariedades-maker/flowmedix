/**
 * @jest-environment node
 */
import { resolveAdminLayoutRedirect } from '@/lib/admin/adminLayoutGuard';
import type { User } from '@supabase/supabase-js';

describe('resolveAdminLayoutRedirect', () => {
  const dummyUser = { id: 'admin-1', email: 'admin@avant.com' } as User;

  it('retorna /login quando não há usuário logado', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: null,
        isAdmin: false,
        assuranceState: 'NO_MFA_FACTOR',
      }),
    ).toBe('/login');
  });

  it('retorna / quando usuário está logado mas não é admin', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: { id: 'aluno-1', email: 'aluno@test.com' } as User,
        isAdmin: false,
        assuranceState: 'NO_MFA_FACTOR',
      }),
    ).toBe('/');
  });

  it('retorna /admin/mfa-setup para admin sem fator quando em outra página', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'NO_MFA_FACTOR',
        currentPath: '/admin',
      }),
    ).toBe('/admin/mfa-setup');

    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'NO_MFA_FACTOR',
        currentPath: '/admin/concursos',
      }),
    ).toBe('/admin/mfa-setup');

    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'NO_MFA_FACTOR',
        currentPath: '/admin/mfa-challenge',
      }),
    ).toBe('/admin/mfa-setup');
  });

  it('retorna null (sem loop) para admin sem fator na página /admin/mfa-setup', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'NO_MFA_FACTOR',
        currentPath: '/admin/mfa-setup',
      }),
    ).toBeNull();
  });

  it('retorna /admin/mfa-challenge para admin com fator pendente de verificação', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'MFA_CHALLENGE_REQUIRED',
        currentPath: '/admin',
      }),
    ).toBe('/admin/mfa-challenge');

    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'MFA_CHALLENGE_REQUIRED',
        currentPath: '/admin/mfa-setup',
      }),
    ).toBe('/admin/mfa-challenge');
  });

  it('retorna null (sem loop) para admin com fator pendente na página /admin/mfa-challenge', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'MFA_CHALLENGE_REQUIRED',
        currentPath: '/admin/mfa-challenge',
      }),
    ).toBeNull();
  });

  it('retorna null para admin com AAL2 verificado nas páginas do painel', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'AAL2_VERIFIED',
        currentPath: '/admin',
      }),
    ).toBeNull();

    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'AAL2_VERIFIED',
        currentPath: '/admin/concursos',
      }),
    ).toBeNull();
  });

  it('redireciona admin já verificado AAL2 para /admin se tentar acessar setup ou challenge', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'AAL2_VERIFIED',
        currentPath: '/admin/mfa-setup',
      }),
    ).toBe('/admin');

    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'AAL2_VERIFIED',
        currentPath: '/admin/mfa-challenge',
      }),
    ).toBe('/admin');
  });

  it('retorna /login para estado FAIL_CLOSED', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: dummyUser,
        isAdmin: true,
        assuranceState: 'FAIL_CLOSED',
        currentPath: '/admin',
      }),
    ).toBe('/login');
  });

  it('retorna null quando bypassEnabled for true', () => {
    expect(
      resolveAdminLayoutRedirect({
        user: null,
        isAdmin: false,
        assuranceState: 'FAIL_CLOSED',
        bypassEnabled: true,
      }),
    ).toBeNull();
  });
});
