import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS,
  MANIFEST_CONFLICT_L1_DECISIONS,
} from '@/scripts/neurocanvas-g04-manifest-conflict-l1-decisions';
import {
  applyManifestConflictL1,
  planManifestConflictL1,
  validateManifestConflictL1Decisions,
} from '@/scripts/neurocanvas-g04-manifest-conflict-l1-apply';
import { serializePayload, semanticHashOf } from '@/scripts/neurocanvas-g04-apply-editorial';

const REAL_CATALOG = resolve(process.cwd(), 'data/catalog-migration');
let tempRoots: string[] = [];

function makeTempCatalog(): string {
  const root = mkdtempSync(join(tmpdir(), 'manifest-l1-test-'));
  tempRoots.push(root);
  return root;
}

afterAll(() => {
  for (const root of tempRoots) {
    if (existsSync(root)) rmSync(root, { recursive: true, force: true });
  }
});

describe('manifestConflictL1 hardened aplicador', () => {
  it('allowlist congela 32 cópias autorizadas', () => {
    expect(MANIFEST_CONFLICT_L1_AUTHORIZED_RELATIVE_PATHS.length).toBe(32);
    expect(MANIFEST_CONFLICT_L1_DECISIONS.length).toBe(6);
  });

  it('valida autoridade real do catálogo (Zod + 4 slides + hash)', () => {
    const errors = validateManifestConflictL1Decisions();
    expect(errors).toEqual([]);
  });

  it('aborta com hash inesperado em catálogo temporário', () => {
    const root = makeTempCatalog();
    const decision = MANIFEST_CONFLICT_L1_DECISIONS[0];
    const question = JSON.parse(
      readFileSync(
        join(
          REAL_CATALOG,
          decision.canonical_lote,
          'questions',
          `${decision.slug}.json`,
        ),
        'utf8',
      ),
    );

    for (const target of decision.align_targets) {
      const dir = join(root, target.lote, 'questions');
      mkdirSync(dir, { recursive: true });
      const tampered = { ...question, meta: { ...question.meta, banca: 'HASH TAMPER' } };
      writeFileSync(join(dir, `${decision.slug}.json`), serializePayload(tampered), 'utf8');
    }

    expect(() => planManifestConflictL1({ catalogRoot: root, decisions: [decision] })).toThrow(
      /hash inesperado/,
    );
  });

  it('dry-run idempotente no catálogo real (todos skip ou alinhados)', () => {
    const plan = planManifestConflictL1();
    expect(plan.length).toBe(32);
    const writes = plan.filter((p) => p.action === 'write');
    const skips = plan.filter((p) => p.action === 'skip_already_current');
    expect(writes.length + skips.length).toBe(32);
    applyManifestConflictL1({ dryRun: true });
  });
});
