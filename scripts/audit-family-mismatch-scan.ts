#!/usr/bin/env tsx
/**
 * Scan local golden-v1 JSONs and report meta.family vs classifyFamily() mismatches.
 *
 * Uso:
 *   npx tsx scripts/audit-family-mismatch-scan.ts
 *   npx tsx scripts/audit-family-mismatch-scan.ts --out=artifacts/family-mismatch-scan.json
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { inferFamilyMismatch, type FamilyId } from '@/lib/catalogMigration/classifyFamily';

type ScanRow = {
  file: string;
  declared: string;
  inferred: FamilyId;
  subtopico?: string;
};

function parseOutArg(): string | null {
  const arg = process.argv.find((a) => a.startsWith('--out='));
  return arg ? arg.slice('--out='.length) : null;
}

function collectQuestionFiles(root: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return;
  }

  for (const name of entries) {
    const p = join(root, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }

    if (st.isDirectory()) {
      if (name === 'questions') {
        for (const f of readdirSync(p)) {
          if (f.endsWith('.json')) out.push(join(p, f));
        }
        continue;
      }
      if (name === 'node_modules' || name === '.next') continue;
      collectQuestionFiles(p, out);
      continue;
    }

    if (root.replace(/\\/g, '/').endsWith('/examples') && name.startsWith('questao-premium-') && name.endsWith('.json')) {
      out.push(p);
    }
  }
}

function main() {
  const files: string[] = [];
  collectQuestionFiles(join(process.cwd(), 'data', 'catalog-migration'), files);
  collectQuestionFiles(join(process.cwd(), 'examples'), files);

  const mismatches: ScanRow[] = [];
  let goldenV1 = 0;
  let withFamily = 0;
  let aligned = 0;
  const byPair = new Map<string, number>();
  const byDeclared = new Map<string, number>();

  for (const file of files) {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    } catch {
      continue;
    }

    const meta = (payload.meta ?? {}) as {
      content_standard?: string;
      family?: string;
      subtopico?: string;
    };
    if (meta.content_standard !== 'golden-v1') continue;

    goldenV1++;
    const family = meta.family?.trim();
    if (!family) continue;

    withFamily++;
    byDeclared.set(family, (byDeclared.get(family) ?? 0) + 1);

    const qd = (payload.question_data ?? {}) as {
      instruction?: string;
      text_fragment?: string;
      options?: { id?: string; text?: string; is_correct?: boolean }[];
    };
    const options = Array.isArray(qd.options)
      ? qd.options.map((o, i) => ({
          id: String(o.id ?? String.fromCharCode(65 + i)),
          text: String(o.text ?? ''),
          is_correct: Boolean(o.is_correct),
        }))
      : [];

    const inferredMismatch = inferFamilyMismatch(
      family,
      String(qd.instruction ?? ''),
      options,
      String(qd.text_fragment ?? ''),
    );

    if (!inferredMismatch) {
      aligned++;
      continue;
    }

    const key = `${family} -> ${inferredMismatch}`;
    byPair.set(key, (byPair.get(key) ?? 0) + 1);
    if (mismatches.length < 50) {
      mismatches.push({
        file: file.replace(/\\/g, '/'),
        declared: family,
        inferred: inferredMismatch,
        subtopico: meta.subtopico,
      });
    }
  }

  const mismatchCount = withFamily - aligned;
  const pct = withFamily ? ((mismatchCount / withFamily) * 100).toFixed(1) : '0.0';
  const topPairs = [...byPair.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  const report = {
    scanned_at: new Date().toISOString(),
    files_scanned: files.length,
    golden_v1: goldenV1,
    with_meta_family: withFamily,
    aligned,
    mismatch_count: mismatchCount,
    mismatch_pct: Number(pct),
    top_pairs: topPairs.map(([pair, count]) => ({ pair, count })),
    by_declared: Object.fromEntries(byDeclared),
    sample: mismatches,
  };

  console.log('=== SCAN l2_family_mismatch ===');
  console.log('Arquivos escaneados:', files.length);
  console.log('golden-v1:', goldenV1);
  console.log('golden-v1 com meta.family:', withFamily);
  console.log('alinhados:', aligned);
  console.log('mismatch:', mismatchCount, `(${pct}%)`);
  console.log('');
  console.log('--- Top pares declared -> inferred ---');
  for (const [pair, count] of topPairs) {
    console.log(String(count).padStart(5), pair);
  }
  console.log('');
  console.log('--- Amostra (max 50) ---');
  for (const m of mismatches) {
    console.log(`${m.declared} -> ${m.inferred} | ${m.subtopico ?? ''} | ${m.file}`);
  }

  const out = parseOutArg();
  if (out) {
    const abs = join(process.cwd(), out);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, JSON.stringify(report, null, 2), 'utf8');
    console.log('');
    console.log('Relatório salvo em:', out);
  }
}

main();
