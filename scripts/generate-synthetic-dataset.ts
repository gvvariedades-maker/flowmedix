#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { generateSyntheticScaleDataset } from '@/lib/scale/syntheticDataset';

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function parseNumberArg(flag: string, fallback: number): number {
  const raw = parseArg(flag);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function main() {
  const totalModulos = parseNumberArg('--total', 10_000);
  const outPath = parseArg('--out') || 'artifacts/synthetic-catalog-10k.json';
  const absoluteOutPath = resolve(process.cwd(), outPath);

  const dataset = generateSyntheticScaleDataset({ totalModulos });
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, JSON.stringify(dataset), 'utf8');

  console.log(
    JSON.stringify(
      {
        output: absoluteOutPath,
        modulos: dataset.modulos.length,
        historico: dataset.historico.length,
      },
      null,
      2,
    ),
  );
}

main();
