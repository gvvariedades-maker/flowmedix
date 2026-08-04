/**
 * F4 — camada L2c: a nota pedagógica passa a decidir `production_ready`.
 *
 * Junta os dois sinais de F2 em um `LayerResult` do ship gate:
 * - F2a `detectUnifiedPedagogy` (determinístico, roda sempre sobre os JSONs do lote);
 * - F2b portão do leitor cego (LLM), lido do artefato `artifacts/blind-reader-gate.json`.
 *
 * A severidade não é decidida aqui: `gradePedagogicalNote` já classifica `fail`/`warn`/`pass`.
 * Esta camada só agrega — `fail` em qualquer slug barra a promoção.
 *
 * O leitor cego bloqueia **por evidência**, não por ausência dela: sem artefato (ou com
 * cobertura parcial) a camada segue pelo detector determinístico e registra a lacuna no
 * `detail`. Exigir cobertura total em todo promote obrigaria uma rodada de LLM por
 * subtópico; quem quer essa barra usa `--require-blind-reader`.
 *
 * Calibração que autoriza o vínculo: `data/catalog-migration/blind-reader-calibration-judgments.json`
 * (20 âncoras, agreement 1.0, zero falso positivo).
 *
 * @see lib/neurocanvas/pedagogicalNote.ts
 * @see lib/neurocanvas/blindReaderGate.ts
 * @see scripts/audit-subtopico-quality.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { LayerResult } from '@/lib/catalogMigration/shipGate';
import type { BlindReaderResult } from '@/lib/neurocanvas/blindReaderGate';
import type { PedagogicalNote } from '@/lib/neurocanvas/pedagogicalNote';

/** Saída de `npm run audit:blind-reader` — insumo opcional desta camada. */
export const BLIND_READER_ARTIFACT = 'artifacts/blind-reader-gate.json';

export type BlindReaderIndex = Map<string, BlindReaderResult>;

/** Índice slug → veredito. Artefato ausente ou ilegível vira índice vazio (sem evidência). */
export function loadBlindReaderIndex(artifactPath = BLIND_READER_ARTIFACT): BlindReaderIndex {
  const path = resolve(process.cwd(), artifactPath);
  if (!existsSync(path)) return new Map();

  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as { results?: BlindReaderResult[] };
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    return new Map(results.filter((r) => typeof r?.slug === 'string').map((r) => [r.slug, r]));
  } catch {
    return new Map();
  }
}

/** Vereditos que não são evidência sobre o slide — não contam como cobertura. */
const NON_EVIDENCE_VERDICTS = new Set(['skip_no_concept_map', 'skip_no_gabarito']);

export function blindReaderCoverage(notes: PedagogicalNote[]): number {
  return notes.filter(
    (n) => n.blind_reader && !NON_EVIDENCE_VERDICTS.has(n.blind_reader.verdict),
  ).length;
}

export type PedagogyLayerOptions = {
  /** Escape hatch operacional, espelho de `--skip-l3`. */
  skip?: boolean;
  /** Exige leitor cego em todos os slugs — barra promote sem rodada de LLM. */
  requireBlindReader?: boolean;
};

const MAX_LISTED_SLUGS = 5;

export function evaluatePedagogyLayer(
  notes: PedagogicalNote[],
  options: PedagogyLayerOptions = {},
): LayerResult {
  if (options.skip) {
    return { pass: true, detail: 'L2c skipped (--skip-pedagogy)' };
  }
  if (notes.length === 0) {
    return { pass: true, detail: 'sem slugs locais — nota pedagógica N/A' };
  }

  const failing = notes.filter((n) => n.grade === 'fail');
  const covered = blindReaderCoverage(notes);

  if (failing.length > 0) {
    const listed = failing.slice(0, MAX_LISTED_SLUGS).map((n) => n.slug);
    const rest = failing.length - listed.length;
    const suffix = rest > 0 ? ` (+${rest})` : '';
    return {
      pass: false,
      detail: `${failing.length} slug(s) com fail pedagógico: ${listed.join(', ')}${suffix}`,
    };
  }

  if (options.requireBlindReader && covered < notes.length) {
    return {
      pass: false,
      detail:
        `leitor cego cobriu ${covered}/${notes.length} slugs — ` +
        'rodar npm run audit:blind-reader -- --catalog',
    };
  }

  const warned = notes.filter((n) => n.grade === 'warn').length;
  const warnSuffix = warned > 0 ? `; ${warned} warn` : '';
  return {
    pass: true,
    detail: `pedagogia OK (${notes.length} slugs; leitor cego ${covered}/${notes.length}${warnSuffix})`,
  };
}
