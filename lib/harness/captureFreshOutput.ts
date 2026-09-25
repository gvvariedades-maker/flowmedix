import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type PngFileSnapshot = Map<string, { mtimeMs: number; size: number }>;

/** Baseline PNG names + mtime/size before a capture run (ignores non-.png). */
export function snapshotPngFiles(dir: string): PngFileSnapshot {
  const map: PngFileSnapshot = new Map();
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return map;
  }
  for (const name of names) {
    if (!name.endsWith('.png')) continue;
    const st = statSync(join(dir, name));
    map.set(name, { mtimeMs: st.mtimeMs, size: st.size });
  }
  return map;
}

/** PNGs created or updated since `before` — stale files unchanged are excluded. */
export function findNewOrModifiedPngs(dir: string, before: PngFileSnapshot): string[] {
  const after = snapshotPngFiles(dir);
  const changed: string[] = [];
  for (const [name, meta] of after) {
    const prev = before.get(name);
    if (!prev || prev.mtimeMs !== meta.mtimeMs || prev.size !== meta.size) {
      changed.push(name);
    }
  }
  return changed;
}
