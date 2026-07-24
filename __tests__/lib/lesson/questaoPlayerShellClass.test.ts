import {
  questaoPlayerMobileFullBleed,
  questaoPlayerShellRootClass,
} from '@/lib/lesson/questaoPlayerShellClass';

describe('questaoPlayerShellClass', () => {
  it('detecta full-bleed no mobile para imersivo ou modal', () => {
    expect(questaoPlayerMobileFullBleed({ immersive: true })).toBe(true);
    expect(questaoPlayerMobileFullBleed({ modalActive: true })).toBe(true);
    expect(questaoPlayerMobileFullBleed({})).toBe(false);
  });

  it('remove radius no mobile para player live imersivo', () => {
    const cls = questaoPlayerShellRootClass('player-live', { immersive: true });
    expect(cls).toContain('max-md:rounded-none');
    expect(cls).toContain('max-md:min-h-[100dvh]');
  });

  it('remove radius no mobile para skeleton em sheet modal', () => {
    const cls = questaoPlayerShellRootClass('skeleton', { modalActive: true });
    expect(cls).toContain('max-md:rounded-none');
    expect(cls).toContain('md:rounded-[2.5rem]');
  });

  it('mantém card arredondado no desktop para preview', () => {
    const cls = questaoPlayerShellRootClass('player-card', {});
    expect(cls).toContain('md:rounded-[2.5rem]');
    expect(cls).not.toContain('max-md:rounded-none');
  });
});
