import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  isWindowsDrivePath,
  scanPortableArtifactText,
  toPortableRepoPath,
} from '@/lib/neurocanvas/portablePath';

describe('neurocanvas portablePath', () => {
  const repoRoot = resolve(__dirname, '../../..');

  it('converte path absoluto em relativo com separador /', () => {
    const abs = join(repoRoot, 'data/catalog-migration/lote/questions/slug.json');
    expect(toPortableRepoPath(abs, repoRoot)).toBe('data/catalog-migration/lote/questions/slug.json');
  });

  it('rejeita path que escapa do repo', () => {
    const outside = resolve(repoRoot, '..', 'outside.json');
    expect(() => toPortableRepoPath(outside, repoRoot)).toThrow(/escapa do repo/);
  });

  it('resolver catalog-full.md usa UTF-8 em pré-fallback', () => {
    const buf = readFileSync(
      join(repoRoot, 'artifacts/neurocanvas-resolver-audit-catalog-full.md'),
    );
    expect(buf.includes(Buffer.from([0x70, 0x72, 0xc3, 0xa9, 0x2d, 0x66]))).toBe(true);
    expect(buf.includes(Buffer.from([0x70, 0x72, 0xe9, 0x2d, 0x66]))).toBe(false);
  });

  it('artifacts neurocanvas rastreados não contêm drive letter nem secrets', () => {
    const artifactDir = join(repoRoot, 'artifacts');
    const tracked = [
      'neurocanvas-blocker-samples-20.json',
      'neurocanvas-audit-report-data.json',
      'neurocanvas-resolver-audit-anchors.json',
    ];

    for (const file of tracked) {
      const full = join(artifactDir, file);
      let text: string;
      try {
        text = readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      expect(isWindowsDrivePath(text)).toBe(false);
      expect(text).not.toMatch(/[A-Za-z]:\\/);
      const issues = scanPortableArtifactText(text);
      expect(issues).toEqual([]);
    }
  });
});
