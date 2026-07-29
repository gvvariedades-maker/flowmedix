/**
 * @jest-environment node
 *
 * Scorecard #6 — contratos anon alinhados a smoke:rls (modulos / histórico / matrículas).
 */
import {
  evaluateAnonProtectedTableCount,
  RLS_ANON_PROTECTED_CHECK_NAMES,
} from '@/lib/security/rlsAnonExpectations';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('evaluateAnonProtectedTableCount (contrato smoke:rls)', () => {
  it('PASS quando acesso é bloqueado (erro RLS)', () => {
    const check = evaluateAnonProtectedTableCount({
      name: 'anon_modulos_estudo_vazio',
      count: null,
      errorMessage: 'permission denied for table modulos_estudo',
    });
    expect(check.ok).toBe(true);
    expect(check.detail).toContain('acesso bloqueado');
  });

  it('PASS com 0 linhas (anon sem matrícula)', () => {
    const check = evaluateAnonProtectedTableCount({
      name: 'anon_historico_vazio',
      count: 0,
      emptyDetail: '0 linhas sem login — OK',
    });
    expect(check).toEqual({
      name: 'anon_historico_vazio',
      ok: true,
      detail: '0 linhas sem login — OK',
    });
  });

  it('FAIL quando anon vê linhas de conteúdo/matrícula', () => {
    const check = evaluateAnonProtectedTableCount({
      name: 'anon_matriculas_vazio',
      count: 3,
    });
    expect(check.ok).toBe(false);
    expect(check.detail).toContain('3 linha(s) expostas a anon');
  });

  it('lista canônica cobre checks de tabela protegida (Stripe + FSRS R2)', () => {
    expect(RLS_ANON_PROTECTED_CHECK_NAMES).toEqual([
      'anon_modulos_estudo_vazio',
      'anon_historico_vazio',
      'anon_matriculas_vazio',
      'anon_stripe_webhook_events_vazio',
      'anon_spaced_review_cards_vazio',
      'anon_spaced_review_logs_vazio',
    ]);
  });
});

describe('smoke:rls script — alinhamento com contratos', () => {
  it('usa evaluateAnonProtectedTableCount e os nomes canônicos', () => {
    const smokePath = join(process.cwd(), 'scripts/rls-performance-smoke.ts');
    const source = readFileSync(smokePath, 'utf8');

    expect(source).toContain("from '../lib/security/rlsAnonExpectations'");
    expect(source).toContain('evaluateAnonProtectedTableCount');

    for (const name of RLS_ANON_PROTECTED_CHECK_NAMES) {
      expect(source).toContain(`'${name}'`);
    }
  });
});
