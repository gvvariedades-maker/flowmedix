import {
  PROTOCOL_TAP_BUDGET,
  applyProtocolTapBudget,
} from '@/lib/slides/protocolTapBudget';

describe('protocolTapBudget (Onda 4)', () => {
  it('exposes budget of 3 for protocol sequential families', () => {
    expect(PROTOCOL_TAP_BUDGET).toBe(3);
  });

  it('keeps steps unchanged when within budget', () => {
    expect(applyProtocolTapBudget(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(applyProtocolTapBudget(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('merges overflow into a synthesis step', () => {
    expect(applyProtocolTapBudget(['a', 'b', 'c', 'd', 'e'])).toEqual([
      'a',
      'b',
      'c · d · e',
    ]);
  });

  it('respects custom budget', () => {
    expect(applyProtocolTapBudget(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b · c · d']);
  });
});
