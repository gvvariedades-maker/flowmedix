import { isLpPathReserved, validateLpPathSegment } from '@/lib/lp/reservedPaths';

describe('validateLpPathSegment', () => {
  it('rejeita paths reservados', () => {
    expect(validateLpPathSegment('admin')).toMatch(/reservado/i);
    expect(isLpPathReserved('login')).toBe(true);
  });

  it('aceita path de edital válido', () => {
    expect(validateLpPathSegment('joao-pessoa-2026')).toBeNull();
  });
});
