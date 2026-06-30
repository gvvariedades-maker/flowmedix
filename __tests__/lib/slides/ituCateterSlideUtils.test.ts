import {
  inferItuBundleSlot,
  inferItuBundleViolation,
  inferItuLetterStatus,
  inferExcetoGabaritoLetter,
  extractLetterFromText,
} from '@/lib/slides/ituCateterSlideUtils';

describe('ituCateterSlideUtils', () => {
  it('inferItuBundleSlot mapeia elos da cadeia fechada', () => {
    expect(inferItuBundleSlot('Higiene do meato', 'conduta correta')).toBe('meato');
    expect(inferItuBundleSlot('Sistema fechado', 'drenagem estéril')).toBe('fechado');
    expect(inferItuBundleSlot('Fluxo desobstruído', 'sem torção')).toBe('fluxo');
    expect(inferItuBundleSlot('Bolsa abaixo', 'nível da bexiga')).toBe('posicao');
    expect(inferItuBundleSlot('EXCETO pinçar', 'antes da remoção')).toBe('exceto');
  });

  it('inferItuLetterStatus distingue bundle ok e EXCETO', () => {
    expect(inferItuLetterStatus('Letra C', 'sistema fechado', 'ok')).toBe('bundle_ok');
    expect(inferItuLetterStatus('Letra D', 'pinçar cateter', 'warn')).toBe('exceto');
  });

  it('inferItuBundleViolation marca fechado violado na pinça', () => {
    const { violated, restored } = inferItuBundleViolation(
      'Letra C — sistema fechado',
      'Confundir fechar sistema com pinçar na remoção',
      'Gabarito letra D — não pinçar; manter sistema fechado',
    );
    expect(violated).toContain('fechado');
    expect(restored).toContain('fechado');
  });

  it('extractLetterFromText e inferExcetoGabaritoLetter', () => {
    expect(extractLetterFromText('Letra D: fechar o cateter')).toBe('D');
    const letter = inferExcetoGabaritoLetter([
      'Letra A: eliminar',
      'Letra D: é o EXCETO',
      'Marcar letra D.',
    ]);
    expect(letter).toBe('D');
  });
});
