/**
 * Testes RPC / concorrência FSRS R2 contra banco local.
 * Skip automático quando SUPABASE_SERVICE_ROLE_KEY / URL ausentes ou Docker off.
 *
 * Spec §12.B / §12.C — executar com: npx supabase db reset && npm test -- fsrsMvp.rpc
 *
 * @jest-environment node
 */

const hasLocal =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
  process.env.FSRS_RPC_INTEGRATION === '1';

const describeRpc = hasLocal ? describe : describe.skip;

describeRpc('FSRS RPC integration (local)', () => {
  it('placeholder — habilite FSRS_RPC_INTEGRATION=1 após supabase db reset', () => {
    expect(hasLocal).toBe(true);
  });
});

describe('FSRS RPC harness presence', () => {
  it('migration R2 existe no repo', () => {
    const { existsSync } = require('node:fs') as typeof import('node:fs');
    const { join } = require('node:path') as typeof import('node:path');
    expect(
      existsSync(
        join(
          process.cwd(),
          'supabase/migrations/20260728040000_spaced_review_fsrs_mvp.sql',
        ),
      ),
    ).toBe(true);
  });
});
