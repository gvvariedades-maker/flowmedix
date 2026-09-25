import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  findNewOrModifiedPngs,
  snapshotPngFiles,
} from '@/lib/harness/captureFreshOutput';

describe('captureFreshOutput', () => {
  it('detects only new or modified PNGs', () => {
    const dir = mkdtempSync(join(tmpdir(), 'avant-capture-fresh-'));
    try {
      writeFileSync(join(dir, 'stale.png'), 'old');
      const before = snapshotPngFiles(dir);
      expect(before.size).toBe(1);

      expect(findNewOrModifiedPngs(dir, before)).toEqual([]);

      writeFileSync(join(dir, 'fresh.png'), 'new');
      const afterAdd = findNewOrModifiedPngs(dir, before);
      expect(afterAdd).toEqual(['fresh.png']);

      writeFileSync(join(dir, 'stale.png'), 'updated');
      const afterModify = findNewOrModifiedPngs(dir, before);
      expect(afterModify.sort()).toEqual(['fresh.png', 'stale.png']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
