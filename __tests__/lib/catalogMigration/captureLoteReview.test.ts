import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  resolveAnchorKeyReviewSlug,
  resolveLoteReviewSlug,
} from '@/lib/catalogMigration/captureLoteReview';

describe('captureLoteReview', () => {
  it('resolveLoteReviewSlug usa anchor_slug do lote-meta', () => {
    const target = resolveLoteReviewSlug('imunizacao-exceto-piloto-g01');
    expect(target.slug).toBe('agirh-enfermagem-imunizacao-1779564113760-0');
    expect(target.reason).toBe('lote-meta.anchor_slug');
  });

  it('resolveLoteReviewSlug usa catalog.json quando questions/ está ausente (gitignore CI)', () => {
    const target = resolveLoteReviewSlug('imunizacao-g07');
    expect(target.slug).toBe('amauc-enfermagem-processo-de-enfermagem-1780004982901-4');
    expect(['primeiro JSON do lote', 'primeiro slug do catalog.json']).toContain(target.reason);
  });

  it('resolveAnchorKeyReviewSlug lê golden-anchors registry', () => {
    const registry = 'data/catalog-migration/imunizacao-golden-anchors.json';
    if (!existsSync(resolve(process.cwd(), registry))) return;
    const target = resolveAnchorKeyReviewSlug(registry, 'calendario_infantil');
    expect(target.slug).toBe('fundatec-enfermagem-imunizacao-1777103182944-8');
  });
});
