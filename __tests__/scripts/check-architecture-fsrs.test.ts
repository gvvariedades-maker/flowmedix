/**
 * @jest-environment node
 *
 * Gate arquitetural FSRS R2 — fixtures (script pula __tests__/).
 */
import { join } from 'node:path';

import { checkNoDirectFsrsTableWrites } from '../../scripts/check-architecture-patterns';

describe('checkNoDirectFsrsTableWrites', () => {
  const fakeFile = join(process.cwd(), 'lib/_fixture_fsrs_write_gate.ts');

  it('viola com .from(spaced_review_cards).insert', () => {
    const src = `
      await client.from('spaced_review_cards').insert({ user_id: id });
    `;
    const violations = checkNoDirectFsrsTableWrites([fakeFile], () => src);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]?.rule).toBe('no-direct-fsrs-table-writes');
  });

  it('viola com .from(spaced_review_logs).update', () => {
    const src = `
      await client.from('spaced_review_logs').update({ rating: 'good' }).eq('id', id);
    `;
    const violations = checkNoDirectFsrsTableWrites([fakeFile], () => src);
    expect(violations.some((v) => v.rule === 'no-direct-fsrs-table-writes')).toBe(
      true,
    );
  });

  it('não viola .from(...).select', () => {
    const src = `
      await client.from('spaced_review_cards').select('*').eq('user_id', id);
    `;
    const violations = checkNoDirectFsrsTableWrites([fakeFile], () => src);
    expect(violations).toEqual([]);
  });

  it('não viola rpc fsrs_persist_review', () => {
    const src = `
      await client.rpc('fsrs_persist_review', { p_user_id: id });
    `;
    const violations = checkNoDirectFsrsTableWrites([fakeFile], () => src);
    expect(violations).toEqual([]);
  });
});
