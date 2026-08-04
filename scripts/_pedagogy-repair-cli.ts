/**
 * Runner compartilhado dos três repairs F3 (`scripts/repair-pedagogy-*.ts`).
 *
 * Ordem obrigatória do plano: **âncoras primeiro** (`examples/`, corpus padrão),
 * re-verificar com o leitor cego (`npm run audit:blind-reader`), só então propagar
 * aos lotes que copiaram as âncoras (`--lote=` / `--lotes=` / `--catalog`).
 *
 * Dry-run é o padrão: nada é escrito sem `--write`.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { hasFlag, parseArg, parseCsvArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  repairPedagogySignature,
  REPAIR_TARGET_SIGNATURES,
  type PedagogyRepairEdit,
  type PedagogyRepairKind,
  type PedagogyRepairSkip,
} from '@/lib/catalogMigration/repairPedagogySignatures';
import {
  detectUnifiedPedagogy,
  emptySignatureCounts,
  tallySignatures,
  type PedagogySignatureCounts,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';
import {
  iterateCanonicalQuestions,
  readQuestionJsonFile,
} from '@/lib/neurocanvas/canonicalCatalog';

type Target = { slug: string; path: string };

type FileReport = {
  slug: string;
  path: string;
  changed: boolean;
  edits: PedagogyRepairEdit[];
  skipped: PedagogyRepairSkip[];
  /** Rodar o repair duas vezes não pode mudar nada na segunda passada. */
  idempotent: boolean;
  findings_before: number;
  findings_after: number;
};

function anchorTargets(): Target[] {
  const dir = resolve(process.cwd(), 'examples');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
    .map((f) => ({ slug: f.replace(/\.json$/, ''), path: join(dir, f) }));
}

function loteTargets(lotes: string[]): Target[] {
  return lotes.flatMap((lote) => {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) {
      throw new Error(`Pasta questions ausente: ${dir} — rode catalog:export-lote antes.`);
    }
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => ({ slug: f.replace(/\.json$/, ''), path: join(dir, f) }));
  });
}

function catalogTargets(): Target[] {
  const out: Target[] = [];
  iterateCanonicalQuestions((slug, path) => out.push({ slug, path }));
  return out;
}

function resolveTargets(): { corpus: string; targets: Target[] } {
  const file = parseArg('file');
  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/\\/g, '/').split('/').pop()!.replace(/\.json$/, '');
    return { corpus: `file:${file}`, targets: [{ slug, path }] };
  }

  const lote = parseArg('lote');
  const lotes = parseCsvArg('lotes');
  const useCatalog = hasFlag('catalog');

  let corpus = 'examples';
  let targets: Target[];
  if (lote) {
    corpus = `lote:${lote}`;
    targets = loteTargets([lote]);
  } else if (lotes?.length) {
    corpus = `lotes:${lotes.join(',')}`;
    targets = loteTargets(lotes);
  } else if (useCatalog) {
    corpus = 'catalog';
    targets = catalogTargets();
  } else {
    targets = anchorTargets();
  }

  const slug = parseArg('slug');
  if (slug) targets = targets.filter((t) => t.slug === slug);

  const limitRaw = parseArg('limit');
  if (limitRaw) {
    const n = Number(limitRaw);
    if (!Number.isFinite(n) || n <= 0) throw new Error('--limit deve ser um número positivo');
    targets = targets.slice(0, Math.floor(n));
  }

  return { corpus, targets };
}

/**
 * Ordem obrigatória: as âncoras propagam por construção, então um lote não pode ser
 * reparado antes delas. Devolve os slugs de `examples/` que ainda mudariam.
 */
function dirtyAnchors(kind: PedagogyRepairKind): string[] {
  return anchorTargets()
    .filter((target) => {
      try {
        return repairPedagogySignature(kind, readQuestionJsonFile(target.path)).changed;
      } catch {
        return false;
      }
    })
    .map((t) => t.slug);
}

function printDiff(report: FileReport, write: boolean): void {
  console.log(`\n${write ? '±' : '~'} ${report.slug}  (${relative(process.cwd(), report.path)})`);
  for (const edit of report.edits) {
    if (edit.action === 'remove') {
      console.log(`  removido ${edit.path}`);
      console.log(`    - ${edit.before}`);
      continue;
    }
    console.log(`  ${edit.path}`);
    console.log(`    - ${edit.before}`);
    console.log(`    + ${edit.after}`);
  }
}

function renderMarkdown(input: {
  kind: PedagogyRepairKind;
  npmName: string;
  corpus: string;
  mode: string;
  reports: FileReport[];
  signaturesBefore: PedagogySignatureCounts;
  signaturesAfter: PedagogySignatureCounts;
}): string {
  const changed = input.reports.filter((r) => r.changed);
  const skips = input.reports.flatMap((r) => r.skipped);
  const lines: string[] = [
    `# F3 — repair \`${input.kind}\``,
    '',
    `- comando: \`npm run ${input.npmName}\``,
    `- corpus: ${input.corpus}`,
    `- modo: **${input.mode}**`,
    `- arquivos varridos: ${input.reports.length}`,
    `- arquivos ${input.mode === 'write' ? 'alterados' : 'que mudariam'}: ${changed.length}`,
    `- edições: ${input.reports.reduce((n, r) => n + r.edits.length, 0)}`,
    `- pulados (fila de handcraft): ${skips.length}`,
    `- idempotência: ${input.reports.every((r) => r.idempotent) ? 'OK' : 'VIOLADA'}`,
    '',
    '## Assinaturas alvo (antes → depois)',
    '',
    '| assinatura | antes | depois |',
    '| --- | --- | --- |',
  ];

  for (const code of REPAIR_TARGET_SIGNATURES[input.kind]) {
    const key = code as keyof PedagogySignatureCounts;
    lines.push(`| \`${code}\` | ${input.signaturesBefore[key]} | ${input.signaturesAfter[key]} |`);
  }

  lines.push('', '## Diff revisável', '');
  for (const report of changed) {
    lines.push(`### ${report.slug}`, '');
    for (const edit of report.edits) {
      lines.push(`- \`${edit.path}\` (${edit.action})`);
      lines.push(`  - antes: ${edit.before}`);
      if (edit.action === 'rewrite') lines.push(`  - depois: ${edit.after}`);
    }
    lines.push('');
  }

  if (skips.length > 0) {
    lines.push('## Pulados — exigem handcraft', '', '| motivo | caminho | texto |', '| --- | --- | --- |');
    for (const skip of skips) {
      lines.push(`| \`${skip.reason}\` | \`${skip.path}\` | ${skip.text.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

export function runPedagogyRepairCli(options: {
  kind: PedagogyRepairKind;
  npmName: string;
  artifact: string;
}): void {
  const { kind, npmName, artifact } = options;
  const write = hasFlag('write') && !hasFlag('dry-run');
  const { corpus, targets } = resolveTargets();
  const tag = `[${npmName}]`;

  if (targets.length === 0) {
    console.error(`${tag} nenhum alvo — verifique --file / --slug / --lote / --catalog`);
    process.exitCode = 1;
    return;
  }

  const propagating = corpus !== 'examples';
  if (write && propagating && !hasFlag('skip-anchor-gate')) {
    const dirty = dirtyAnchors(kind);
    if (dirty.length > 0) {
      console.error(
        `${tag} âncoras primeiro: ${dirty.length} arquivo(s) em examples/ ainda mudariam.\n` +
          `${tag} rode "npm run ${npmName} -- --write" nas âncoras, re-verifique com "npm run audit:blind-reader"` +
          ' e só então propague (ou use --skip-anchor-gate).',
      );
      for (const slug of dirty.slice(0, 5)) console.error(`  âncora pendente: ${slug}`);
      process.exitCode = 1;
      return;
    }
    if (!existsSync(resolve(process.cwd(), 'artifacts/blind-reader-gate.json'))) {
      console.warn(
        `${tag} sem artifacts/blind-reader-gate.json — re-verifique as âncoras com "npm run audit:blind-reader".`,
      );
    }
  }

  const reports: FileReport[] = [];
  const signaturesBefore = emptySignatureCounts();
  const signaturesAfter = emptySignatureCounts();

  for (const target of targets) {
    let payload: Record<string, unknown>;
    try {
      payload = readQuestionJsonFile(target.path);
    } catch (err) {
      console.warn(`${tag} JSON ilegível: ${target.path} (${String(err)})`);
      continue;
    }

    const before = detectUnifiedPedagogy(payload);
    tallySignatures(before, signaturesBefore);

    const result = repairPedagogySignature(kind, payload);

    // Idempotência: a segunda passada sobre o payload já reparado não muda nada.
    const second = repairPedagogySignature(kind, payload);

    const after = detectUnifiedPedagogy(payload);
    tallySignatures(after, signaturesAfter);

    const report: FileReport = {
      slug: target.slug,
      path: target.path,
      changed: result.changed,
      edits: result.edits,
      skipped: result.skipped,
      idempotent: !second.changed,
      findings_before: before.length,
      findings_after: after.length,
    };
    reports.push(report);

    if (result.changed) {
      printDiff(report, write);
      if (write) {
        writeFileSync(target.path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      }
    }
    if (!report.idempotent) {
      console.error(`${tag} idempotência violada em ${target.slug} — segunda passada mudou o payload.`);
    }
  }

  const changedCount = reports.filter((r) => r.changed).length;
  const editCount = reports.reduce((n, r) => n + r.edits.length, 0);
  const skipCount = reports.reduce((n, r) => n + r.skipped.length, 0);
  const violations = reports.filter((r) => !r.idempotent);
  const mode = write ? 'write' : 'dry-run';

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outJson = resolve(artifactsDir, `${artifact}.json`);
  const outMd = resolve(artifactsDir, `${artifact}.md`);

  writeFileSync(
    outJson,
    JSON.stringify(
      {
        kind,
        mode,
        corpus,
        generated_at: new Date().toISOString(),
        target_signatures: REPAIR_TARGET_SIGNATURES[kind],
        scanned: reports.length,
        changed: changedCount,
        edits: editCount,
        skipped: skipCount,
        idempotent: violations.length === 0,
        signatures_before: signaturesBefore,
        signatures_after: signaturesAfter,
        reports,
      },
      null,
      2,
    ),
    'utf8',
  );
  writeFileSync(
    outMd,
    renderMarkdown({ kind, npmName, corpus, mode, reports, signaturesBefore, signaturesAfter }),
    'utf8',
  );

  console.log(
    `\n${tag} corpus=${corpus} mode=${mode} scanned=${reports.length} ` +
      `${write ? 'changed' : 'would_change'}=${changedCount} edits=${editCount} skipped=${skipCount}`,
  );
  for (const code of REPAIR_TARGET_SIGNATURES[kind]) {
    const key = code as keyof PedagogySignatureCounts;
    console.log(`${tag} ${code}: ${signaturesBefore[key]} → ${signaturesAfter[key]}`);
  }
  console.log(`${tag} json=${outJson}`);
  console.log(`${tag} md=${outMd}`);
  if (!write && changedCount > 0) {
    console.log(`${tag} dry-run: revise o diff acima e rode de novo com --write.`);
  }
  if (corpus === 'examples' && write) {
    console.log(`${tag} âncoras reparadas — re-verifique com: npm run audit:blind-reader`);
  }

  if (violations.length > 0) {
    console.error(`${tag} idempotência violada em ${violations.length} arquivo(s).`);
    process.exitCode = 1;
  }
}
