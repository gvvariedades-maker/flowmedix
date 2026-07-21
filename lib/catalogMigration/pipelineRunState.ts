/**
 * Estado persistente do pipeline multi-conversa / Cursor SDK.
 * @see docs/PIPELINE_ORCHESTRATOR.md
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

import {
  findPacoteBySubtopico,
  listLotesForPacote,
  loadHandcraftRegistry,
  type RegistryPacote,
} from '@/lib/catalogMigration/handcraftRegistry';
import {
  loadHandcraftPlaybook,
  resolveRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

export const PipelineUnitTypeSchema = z.enum([
  'bootstrap',
  'l3_map',
  'mold_branch',
  'handcraft_lote',
  'ship',
  'done',
  'blocked',
]);

export type PipelineUnitType = z.infer<typeof PipelineUnitTypeSchema>;

export const PipelineUnitSchema = z.object({
  type: PipelineUnitTypeSchema,
  id: z.string().min(1),
  detail: z.string().optional(),
  lote: z.string().optional(),
  branch_id: z.string().optional(),
});

export type PipelineUnit = z.infer<typeof PipelineUnitSchema>;

export const PipelineRunStateSchema = z.object({
  version: z.literal(1),
  subtopico: z.string().min(1),
  pacote_prefix: z.string().min(1),
  mode: z.enum(['handcraft', 'l3_bespoke', 'ship', 'full']).default('full'),
  total_slugs: z.number().int().nonnegative(),
  handcraft_applied: z.number().int().nonnegative(),
  production_status: z.string().nullable().optional(),
  next_unit: PipelineUnitSchema.nullable(),
  completed_units: z.array(z.string()).default([]),
  blockers: z.array(z.string()).default([]),
  last_agent_id: z.string().nullable().optional(),
  last_run_id: z.string().nullable().optional(),
  last_exit: z.number().int().nullable().optional(),
  last_error: z.string().nullable().optional(),
  updated_at: z.string(),
  notes: z.string().nullable().optional(),
});

export type PipelineRunState = z.infer<typeof PipelineRunStateSchema>;

export type LoteDiskStatus = {
  lote: string;
  nn: number;
  status: string | null;
  slugCount: number;
};

const ARTIFACTS_DIR = () => resolve(process.cwd(), 'artifacts');

export function runStateJsonPath(pacotePrefix: string): string {
  return resolve(ARTIFACTS_DIR(), `pipeline-run-state-${pacotePrefix}.json`);
}

export function runStateMdPath(pacotePrefix: string): string {
  return resolve(ARTIFACTS_DIR(), `pipeline-run-state-${pacotePrefix}.md`);
}

export function parseLoteNn(loteName: string, pacotePrefix: string): number | null {
  const re = new RegExp(`^${escapeRegExp(pacotePrefix)}-g(\\d+)$`);
  const m = loteName.match(re);
  if (!m) return null;
  return Number.parseInt(m[1]!, 10);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function readLoteMetaStatus(lote: string): { status: string | null; slugCount: number } {
  const metaPath = resolve(process.cwd(), 'data/catalog-migration', lote, 'lote-meta.json');
  if (!existsSync(metaPath)) return { status: null, slugCount: 0 };
  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
      status?: string;
      slugs?: string[];
      total?: number;
    };
    const slugCount =
      Array.isArray(meta.slugs) && meta.slugs.length > 0
        ? meta.slugs.length
        : typeof meta.total === 'number'
          ? meta.total
          : 0;
    return { status: meta.status ?? null, slugCount };
  } catch {
    return { status: null, slugCount: 0 };
  }
}

export function listLoteDiskStatuses(pacotePrefix: string): LoteDiskStatus[] {
  return listLotesForPacote(pacotePrefix)
    .map((lote) => {
      const nn = parseLoteNn(lote, pacotePrefix);
      if (nn == null) return null;
      const { status, slugCount } = readLoteMetaStatus(lote);
      return { lote, nn, status, slugCount };
    })
    .filter((x): x is LoteDiskStatus => x != null)
    .sort((a, b) => a.nn - b.nn);
}

export function hasL3BriefIndex(pacotePrefix: string): boolean {
  const candidates = [
    resolve(ARTIFACTS_DIR(), `l3-brief-${pacotePrefix}-INDEX.md`),
    resolve(ARTIFACTS_DIR(), `l3-brief-${pacotePrefix}-index.md`),
  ];
  return candidates.some((p) => existsSync(p));
}

export function pendingMoldBranchesFromGap(pacotePrefix: string): string[] {
  const gapPath = resolve(ARTIFACTS_DIR(), `l3-mold-gap-audit-${pacotePrefix}.json`);
  if (!existsSync(gapPath)) return [];
  try {
    const raw = JSON.parse(readFileSync(gapPath, 'utf8')) as {
      rows?: Array<{ branch_id?: string; id?: string; decision?: string }>;
      branches?: Array<{ branch_id?: string; id?: string; decision?: string }>;
    };
    const rows = raw.rows ?? raw.branches ?? [];
    const pending: string[] = [];
    for (const row of rows) {
      const id = row.branch_id ?? row.id;
      const decision = row.decision ?? '';
      if (!id) continue;
      if (/molde_(redesign|inedito)/i.test(decision)) pending.push(id);
    }
    return [...new Set(pending)];
  } catch {
    return [];
  }
}

export type ComputeNextUnitOptions = {
  mode?: PipelineRunState['mode'];
  /** Força unidade (ex. --unit=handcraft_lote:g03). */
  forceUnit?: PipelineUnit | null;
};

export function computeNextUnit(
  subtopico: string,
  pacote: RegistryPacote | null,
  options: ComputeNextUnitOptions = {},
): { unit: PipelineUnit; snapshot: Pick<PipelineRunState, 'total_slugs' | 'handcraft_applied' | 'production_status' | 'pacote_prefix'> } {
  if (options.forceUnit) {
    return {
      unit: options.forceUnit,
      snapshot: {
        pacote_prefix: pacote?.pacote_prefix ?? 'unknown',
        total_slugs: pacote?.total_slugs ?? 0,
        handcraft_applied: pacote?.handcraft_applied ?? 0,
        production_status: pacote?.production_status ?? null,
      },
    };
  }

  const resolved = resolveRegistryPackage(subtopico);
  const prefix =
    pacote?.pacote_prefix ??
    resolved?.pkg.pacote_prefix ??
    'unknown';

  const total = pacote?.total_slugs ?? resolved?.pkg.total_slugs ?? 0;
  const applied = pacote?.handcraft_applied ?? resolved?.pkg.handcraft_applied ?? 0;
  const production = pacote?.production_status ?? resolved?.pkg.production_status ?? null;
  const mode = options.mode ?? 'full';

  const snapshot = {
    pacote_prefix: prefix,
    total_slugs: total,
    handcraft_applied: applied,
    production_status: production ?? null,
  };

  if (!pacote && !resolved) {
    return {
      unit: {
        type: 'bootstrap',
        id: 'registry',
        detail: 'Pacote ausente no handcraft-registry — Classify + export + fallback_novo_pacote',
      },
      snapshot: { ...snapshot, pacote_prefix: 'unknown' },
    };
  }

  if (production === 'production_ready' && mode !== 'handcraft') {
    return {
      unit: {
        type: 'done',
        id: 'production_ready',
        detail: 'Pacote já production_ready — use audit:subtopico-health se pós-venda',
      },
      snapshot,
    };
  }

  const needL3 =
    mode === 'full' || mode === 'l3_bespoke' || mode === 'ship';
  if (needL3 && mode !== 'handcraft' && mode !== 'ship' && !hasL3BriefIndex(prefix)) {
    return {
      unit: {
        type: 'l3_map',
        id: 'briefs',
        detail: `Falta artifacts/l3-brief-${prefix}-INDEX.md — Mapeamento L3 Fase 3b`,
      },
      snapshot,
    };
  }

  if (mode === 'l3_bespoke' || mode === 'full') {
    const pendingMolds = pendingMoldBranchesFromGap(prefix);
    if (pendingMolds.length > 0) {
      const branch = pendingMolds[0]!;
      return {
        unit: {
          type: 'mold_branch',
          id: branch,
          branch_id: branch,
          detail: `Implementar molde React 4/4 — ramo ${branch}`,
        },
        snapshot,
      };
    }
  }

  if (mode !== 'ship' && applied < total) {
    const lotes = listLoteDiskStatuses(prefix);
    const open = lotes.find((l) => l.status !== 'applied');
    if (open) {
      return {
        unit: {
          type: 'handcraft_lote',
          id: open.lote,
          lote: open.lote,
          detail: `Continuar lote ${open.lote} (status=${open.status ?? 'sem meta'})`,
        },
        snapshot,
      };
    }

    const lastNn = lotes.length > 0 ? lotes[lotes.length - 1]!.nn : 0;
    const nextNn = lastNn + 1;
    const nextId = `${prefix}-g${String(nextNn).padStart(2, '0')}`;
    return {
      unit: {
        type: 'handcraft_lote',
        id: nextId,
        lote: nextId,
        detail:
          lotes.length === 0
            ? `Criar e handcraftar primeiro lote ${nextId}`
            : `Planejar/handcraft próximo lote ${nextId} (${applied}/${total} applied)`,
      },
      snapshot,
    };
  }

  if (applied >= total && production !== 'production_ready') {
    return {
      unit: {
        type: 'ship',
        id: 'promote',
        detail: 'Fase 2 — reconcile, L1–L6, visual-mold-regression, --promote',
      },
      snapshot,
    };
  }

  return {
    unit: {
      type: 'done',
      id: 'complete',
      detail: 'Nenhuma unidade pendente',
    },
    snapshot,
  };
}

export function loadRunState(pacotePrefix: string): PipelineRunState | null {
  const path = runStateJsonPath(pacotePrefix);
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const parsed = PipelineRunStateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`run-state inválido em ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function buildRunStateMarkdown(state: PipelineRunState): string {
  const unit = state.next_unit;
  const trigger =
    unit == null || unit.type === 'done'
      ? '(nenhum — pacote concluído ou só health)'
      : unit.type === 'handcraft_lote'
        ? `Continuar pipeline: ${state.subtopico}\nUnidade: handcraft lote ${unit.lote ?? unit.id}`
        : unit.type === 'mold_branch'
          ? `L3 bespoke: ${state.subtopico}\nUnidade: molde ramo ${unit.branch_id ?? unit.id}`
          : unit.type === 'l3_map'
            ? `Mapeamento L3: ${state.subtopico}`
            : unit.type === 'ship'
              ? `Qualidade vendável: ${state.subtopico}`
              : unit.type === 'bootstrap'
                ? `Classify: ${state.subtopico}`
                : `Continuar pipeline: ${state.subtopico}`;

  return [
    `# Pipeline run-state — ${state.subtopico}`,
    '',
    `| Campo | Valor |`,
    `|-------|-------|`,
    `| pacote_prefix | \`${state.pacote_prefix}\` |`,
    `| mode | ${state.mode} |`,
    `| applied | ${state.handcraft_applied}/${state.total_slugs} |`,
    `| production_status | ${state.production_status ?? '—'} |`,
    `| next_unit | \`${unit?.type ?? '—'}:${unit?.id ?? '—'}\` |`,
    `| blockers | ${state.blockers.length ? state.blockers.join('; ') : '—'} |`,
    `| updated_at | ${state.updated_at} |`,
    '',
    '## Próxima conversa / SDK (copiar)',
    '',
    '```text',
    trigger,
    `Ler: @artifacts/pipeline-run-state-${state.pacote_prefix}.json`,
    '```',
    '',
    unit?.detail ? `**Detalhe:** ${unit.detail}` : '',
    '',
    '## Completed',
    '',
    state.completed_units.length
      ? state.completed_units.map((u) => `- ${u}`).join('\n')
      : '_nenhuma_',
    '',
    '⛔ Após concluir a unidade: atualizar este run-state e **não** iniciar a próxima no mesmo contexto.',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function saveRunState(state: PipelineRunState): { jsonPath: string; mdPath: string } {
  const parsed = PipelineRunStateSchema.parse(state);
  mkdirSync(ARTIFACTS_DIR(), { recursive: true });
  const jsonPath = runStateJsonPath(parsed.pacote_prefix);
  const mdPath = runStateMdPath(parsed.pacote_prefix);
  writeFileSync(jsonPath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
  writeFileSync(mdPath, buildRunStateMarkdown(parsed), 'utf8');
  return { jsonPath, mdPath };
}

export function refreshRunState(options: {
  subtopico: string;
  mode?: PipelineRunState['mode'];
  forceUnit?: PipelineUnit | null;
  previous?: PipelineRunState | null;
  blockers?: string[];
  lastExit?: number | null;
  lastError?: string | null;
  lastAgentId?: string | null;
  lastRunId?: string | null;
  markCompleted?: string | null;
}): PipelineRunState {
  const registry = loadHandcraftRegistry();
  const found = findPacoteBySubtopico(registry, options.subtopico);
  const { unit, snapshot } = computeNextUnit(options.subtopico, found?.pacote ?? null, {
    mode: options.mode ?? options.previous?.mode ?? 'full',
    forceUnit: options.forceUnit,
  });

  const completed = [...(options.previous?.completed_units ?? [])];
  if (options.markCompleted && !completed.includes(options.markCompleted)) {
    completed.push(options.markCompleted);
  }

  const playbook = loadHandcraftPlaybook(options.subtopico);
  const prefix =
    snapshot.pacote_prefix !== 'unknown'
      ? snapshot.pacote_prefix
      : playbook?.pacote_prefix ?? options.previous?.pacote_prefix ?? 'unknown';

  const state: PipelineRunState = {
    version: 1,
    subtopico: options.subtopico,
    pacote_prefix: prefix,
    mode: options.mode ?? options.previous?.mode ?? 'full',
    total_slugs: snapshot.total_slugs,
    handcraft_applied: snapshot.handcraft_applied,
    production_status: snapshot.production_status,
    next_unit: unit.type === 'blocked' ? unit : unit,
    completed_units: completed,
    blockers: options.blockers ?? options.previous?.blockers ?? [],
    last_agent_id: options.lastAgentId ?? options.previous?.last_agent_id ?? null,
    last_run_id: options.lastRunId ?? options.previous?.last_run_id ?? null,
    last_exit: options.lastExit ?? options.previous?.last_exit ?? null,
    last_error: options.lastError ?? options.previous?.last_error ?? null,
    updated_at: new Date().toISOString(),
    notes: options.previous?.notes ?? null,
  };

  if (state.blockers.length > 0 && unit.type !== 'done') {
    state.next_unit = {
      type: 'blocked',
      id: 'blockers',
      detail: state.blockers.join('; '),
    };
  }

  return PipelineRunStateSchema.parse(state);
}

export function parseForceUnit(raw: string | undefined): PipelineUnit | null {
  if (!raw?.trim()) return null;
  const [typeRaw, ...rest] = raw.trim().split(':');
  const id = rest.join(':') || typeRaw!;
  const type = PipelineUnitTypeSchema.safeParse(typeRaw);
  if (!type.success) {
    throw new Error(
      `--unit inválido: ${raw}. Use type:id (ex. handcraft_lote:vias-de-administracao-g03)`,
    );
  }
  const unit: PipelineUnit = { type: type.data, id };
  if (type.data === 'handcraft_lote') unit.lote = id.includes('-g') ? id : undefined;
  if (type.data === 'mold_branch') unit.branch_id = id;
  return unit;
}

/** Budget anti-estouro — quantas unidades o orquestrador pode rodar por invocação. */
export function defaultMaxUnitsForSlugCount(totalSlugs: number): number {
  if (totalSlugs <= 20) return 4;
  if (totalSlugs <= 80) return 2;
  return 1;
}
