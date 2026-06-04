import {
  lockBodyScroll,
  resetBodyScrollLockForTests,
  unlockBodyScroll,
} from '@/lib/layout/useBodyScrollLock';

describe('useBodyScrollLock refcount', () => {
  beforeEach(() => {
    resetBodyScrollLockForTests();
  });

  it('bloqueia overflow no primeiro lock e restaura após unlocks empilhados', () => {
    document.body.style.overflow = 'scroll';

    lockBodyScroll();
    expect(document.body.style.overflow).toBe('hidden');

    lockBodyScroll();
    expect(document.body.style.overflow).toBe('hidden');

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe('hidden');

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('unlock extra não altera overflow após contador zerar', () => {
    lockBodyScroll();
    unlockBodyScroll();
    document.body.style.overflow = 'auto';
    unlockBodyScroll();
    expect(document.body.style.overflow).toBe('auto');
  });
});
