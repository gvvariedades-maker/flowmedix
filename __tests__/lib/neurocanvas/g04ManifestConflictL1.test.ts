import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MANIFEST_CONFLICT_L1_DECISIONS } from '@/scripts/neurocanvas-g04-manifest-conflict-l1-decisions';
import { applyManifestConflictL1 } from '@/scripts/neurocanvas-g04-manifest-conflict-l1-apply';

describe('manifestConflictL1', () => {
  it('congela 6 decisões com autoridade canônica por subtópico', () => {
    expect(MANIFEST_CONFLICT_L1_DECISIONS.length).toBe(6);
    const slugs = MANIFEST_CONFLICT_L1_DECISIONS.map((d) => d.slug);
    expect(slugs).toContain(
      'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9',
    );
    expect(slugs).toContain(
      'vunesp-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1779564125198-1',
    );
    for (const d of MANIFEST_CONFLICT_L1_DECISIONS) {
      expect(d.remove_from_manifests.length).toBe(1);
      expect(d.authority_manifest).toContain(d.canonical_lote);
    }
  });

  it('dry-run não altera manifests', () => {
    const saudeMulherManifest = resolve(
      'data/catalog-migration/saude-da-mulher-completo/manifest.json',
    );
    const before = JSON.parse(readFileSync(saudeMulherManifest, 'utf8')) as { slugs: string[] };
    const lines = applyManifestConflictL1({ dryRun: true });
    expect(lines.length).toBe(6);
    const after = JSON.parse(readFileSync(saudeMulherManifest, 'utf8')) as { slugs: string[] };
    expect(after.slugs).toEqual(before.slugs);
  });
});
