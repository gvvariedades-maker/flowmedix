/**
 * Matriz de progresso — programa catálogo 41 subtópicos.
 * @see docs/PROGRAMA_CATALOGO_41.md
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftPlaybook';

export type ProgramOnda = 'A' | 'B' | 'C' | 'done';

export type SubtopicoProgramRow = {
  subtopico: string;
  onda: ProgramOnda;
  legacy_builder: boolean;
  in_registry: boolean;
  pacote_prefix?: string;
  total_slugs?: number;
  handcraft_applied?: number;
  status?: string;
  production_status?: string;
  pct_handcraft?: number;
  next_trigger: string;
};

export type CatalogProgramReport = {
  generated_at: string;
  total_canonicos: number;
  counts: {
    production_ready: number;
    applied_not_vendavel: number;
    in_progress: number;
    no_package: number;
    legacy_builder: number;
  };
  rows: SubtopicoProgramRow[];
};

const REGISTRY_PATH = join(process.cwd(), 'data/catalog-migration/handcraft-registry.json');

/** Subtópicos grandes — onda C (múltiplos lotes). */
const ONDA_C_HINTS = [
  'imunização',
  'sinais vitais',
  'atenção básica',
  'procedimentos diversos',
  'doenças virais',
  'doenças bacterianas',
  'centro cirúrgico',
  'urgências',
];

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveOnda(
  subtopico: string,
  legacy: boolean,
  productionReady: boolean,
): ProgramOnda {
  if (productionReady) return 'done';
  if (legacy) return 'A';
  const key = normalizeKey(subtopico);
  if (ONDA_C_HINTS.some((h) => key.includes(h))) return 'C';
  return 'B';
}

function nextTrigger(row: SubtopicoProgramRow): string {
  if (row.production_status === 'production_ready') {
    return 'audit:subtopico-health (ou repair com Slug:)';
  }
  if (!row.in_registry) {
    return `Fase 0 → Pipeline completo: ${row.subtopico}`;
  }
  const applied =
    typeof row.handcraft_applied === 'number' &&
    typeof row.total_slugs === 'number' &&
    row.handcraft_applied === row.total_slugs &&
    row.status === 'applied';
  if (!applied) {
    return `Pipeline completo: ${row.subtopico}`;
  }
  if (row.production_status !== 'production_ready') {
    return `Pipeline completo: ${row.subtopico} + Só qualidade`;
  }
  return '—';
}

export function buildCatalogProgramReport(): CatalogProgramReport {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry não encontrado: ${REGISTRY_PATH}`);
  }

  const registry = loadHandcraftRegistry();
  const legacyList = registry.legacy_builder_subtopicos ?? [];
  const legacySet = new Set(legacyList.map(normalizeKey));
  const pacotes = registry.pacotes ?? {};
  const canonicos = registry.subtopicos_canonicos ?? [];

  const rows: SubtopicoProgramRow[] = [];

  for (const subtopico of canonicos) {
    const pkgKey = Object.keys(pacotes).find((k) => normalizeKey(k) === normalizeKey(subtopico));
    const pkg = pkgKey ? pacotes[pkgKey] : undefined;
    const legacy = legacySet.has(normalizeKey(subtopico));
    const productionReady = pkg?.production_status === 'production_ready';

    const total = pkg?.total_slugs;
    const applied = pkg?.handcraft_applied;
    const pct =
      typeof total === 'number' && total > 0 && typeof applied === 'number'
        ? Math.round((applied / total) * 1000) / 10
        : undefined;

    const row: SubtopicoProgramRow = {
      subtopico,
      onda: resolveOnda(subtopico, legacy, Boolean(productionReady)),
      legacy_builder: legacy,
      in_registry: Boolean(pkg),
      pacote_prefix: pkg?.pacote_prefix,
      total_slugs: total,
      handcraft_applied: applied,
      status: pkg?.status,
      production_status: pkg?.production_status ?? (pkg ? 'none' : undefined),
      pct_handcraft: pct,
      next_trigger: '',
    };
    row.next_trigger = nextTrigger(row);
    rows.push(row);
  }

  const production_ready = rows.filter((r) => r.production_status === 'production_ready').length;
  const applied_not_vendavel = rows.filter(
    (r) =>
      r.status === 'applied' &&
      r.handcraft_applied === r.total_slugs &&
      r.production_status !== 'production_ready',
  ).length;
  const in_progress = rows.filter(
    (r) => r.in_registry && r.status !== 'applied' && r.production_status !== 'production_ready',
  ).length;
  const no_package = rows.filter((r) => !r.in_registry).length;

  return {
    generated_at: new Date().toISOString(),
    total_canonicos: canonicos.length,
    counts: {
      production_ready,
      applied_not_vendavel,
      in_progress,
      no_package,
      legacy_builder: rows.filter((r) => r.legacy_builder && r.production_status !== 'production_ready')
        .length,
    },
    rows,
  };
}

export function formatCatalogProgramSummary(report: CatalogProgramReport): string {
  const { counts, total_canonicos } = report;
  const lines = [
    `[catalog:program-status] subtópicos=${total_canonicos}`,
    `  production_ready=${counts.production_ready}`,
    `  applied_não_vendável=${counts.applied_not_vendavel}`,
    `  em_progresso=${counts.in_progress}`,
    `  sem_pacote=${counts.no_package}`,
    `  legacy_pendente=${counts.legacy_builder}`,
    '',
    'Próximos (onda A legado ou sem pacote):',
  ];

  const pending = report.rows
    .filter((r) => r.production_status !== 'production_ready')
    .sort((a, b) => {
      const order = { A: 0, B: 1, C: 2, done: 3 };
      return order[a.onda] - order[b.onda];
    })
    .slice(0, 12);

  for (const r of pending) {
    lines.push(
      `  [${r.onda}] ${r.subtopico.slice(0, 50)}${r.subtopico.length > 50 ? '…' : ''} → ${r.next_trigger}`,
    );
  }

  return lines.join('\n');
}
