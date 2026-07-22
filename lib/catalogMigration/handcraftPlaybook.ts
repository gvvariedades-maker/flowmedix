/**
 * Resolve playbook handcraft por subtópico — expande `Handcraft: <canônico>` em briefing completo.
 *
 * Campos operacionais do JSON (`proibido`, `modes.*.first_lote`, `modes.*.after_handcraft`)
 * são renderizados no Markdown por `buildHandcraftBrief()`.
 *
 * @see data/catalog-migration/handcraft-playbooks/README.md#schema-operacional-renderizado-no-briefing
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type HandcraftRegistryPackage = {
  pacote_prefix?: string;
  manifest?: string;
  handcraft_meta?: string;
  handcraft_playbook?: string;
  readme?: string | null;
  cluster_command?: string | null;
  cluster_report?: string | null;
  lote_pattern?: string;
  lote_size?: number;
  status?: string;
  total_slugs?: number;
  handcraft_applied?: number;
  anchor_glob?: string;
  guideline?: string | null;
  production_status?: string;
};

/** Galeria visual leve por ramo — capturas do player AVANT (não posters externos). */
export type BranchVisualGallery = {
  /** pending → pilot (JSON+capture genérico) → ready (bespoke wired + re-capture) */
  status: 'pending' | 'pilot' | 'ready';
  /** Slug no player / capture:questao-review */
  anchor_slug?: string | null;
  /** layout_variant 4/4 alvo (mesmo genérico no piloto) */
  layouts?: string[];
  /** Pasta PNG: artifacts/questao-review/<anchor_slug>/ */
  captures_dir?: string | null;
  note?: string;
};

export type PedagogicalBranchPlaybook = {
  id: string;
  when: string;
  mold?: string;
  anchors?: string[];
  l3_decision?: string;
  bespoke_target?: string;
  /** Path do brief Fase 3b, se existir */
  brief?: string;
  /** Âncoras por estilo (ex.: vf, lacunas) — playbook PT e pacotes com múltiplos goldens */
  anchor_styles?: Record<
    string,
    {
      golden_reference?: string;
      anchor_slug?: string;
      catalog_slug?: string;
    }
  >;
  visual_gallery?: BranchVisualGallery;
};

export type HandcraftModeConfig = {
  label?: string;
  first_lote?: string;
  batch_size?: number;
  pilot_slugs?: string[];
  lote_dir?: string;
  steps?: string[];
  after_handcraft?: string[];
};

export type HandcraftPlaybook = {
  version?: number;
  subtopico?: string;
  pacote_prefix?: string;
  scope_default?: string;
  anchor_glob?: string;
  guideline?: string;
  handcraft_meta?: string;
  repair_lote_pattern?: string;
  slug_selection?: string;
  clusters?: string[];
  pedagogical_branches?: PedagogicalBranchPlaybook[];
  pedagogical_branches_note?: string;
  proibido?: string[];
  modes?: Record<string, HandcraftModeConfig>;
  validation?: Record<string, string>;
  golden_v1_grammar?: Record<string, string>;
  roi_priorities?: { priority: string; action: string; why: string }[];
  clinical_depth_v3_registry?: string;
  golden_anchors_registry?: string;
};

export type PlaybookCommandContext = {
  lote: string;
  slug?: string;
  canonical: string;
  prefix: string;
};

const DEFAULT_PROIBIDO = ['ai:generate', 'catalog:upgrade-premium'];

export type HandcraftBriefOptions = {
  /** Se informado, modo single_slug em vez do scope_default do playbook. */
  slug?: string;
  /** Override do modo: subtopico_handcraft | subtopico_repair_l3 | single_slug */
  mode?: string;
};

const PLAYBOOKS_DIR = join(process.cwd(), 'data/catalog-migration/handcraft-playbooks');
const REGISTRY_PATH = join(process.cwd(), 'data/catalog-migration/handcraft-registry.json');

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Extrai subtópico canônico de `Handcraft: Nome` ou mensagem com `Slug:` na linha seguinte. */
export function parseHandcraftTrigger(message: string): {
  subtopico: string;
  slug?: string;
} | null {
  const trimmed = message.trim();
  const match = trimmed.match(/^Handcraft:\s*(.+?)(?:\n|$)/i);
  if (!match) return null;

  let subtopico = match[1].trim();
  if (subtopico.includes('\n')) {
    subtopico = subtopico.split('\n')[0].trim();
  }

  const slugMatch = trimmed.match(/^\s*Slug:\s*(\S+)/im);
  const slug = slugMatch?.[1]?.trim();

  return { subtopico, slug };
}

export function loadHandcraftRegistry(): {
  pacotes: Record<string, HandcraftRegistryPackage>;
  subtopicos_canonicos: string[];
  legacy_builder_subtopicos?: string[];
  fallback_novo_pacote?: unknown;
} {
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
    pacotes?: Record<string, HandcraftRegistryPackage>;
    subtopicos_canonicos?: string[];
    legacy_builder_subtopicos?: string[];
    fallback_novo_pacote?: unknown;
  };
  return {
    pacotes: raw.pacotes ?? {},
    subtopicos_canonicos: raw.subtopicos_canonicos ?? [],
    legacy_builder_subtopicos: raw.legacy_builder_subtopicos ?? [],
    fallback_novo_pacote: raw.fallback_novo_pacote,
  };
}

export function resolveRegistryPackage(subtopico: string): {
  canonicalName: string;
  pkg: HandcraftRegistryPackage;
} | null {
  const { pacotes, subtopicos_canonicos } = loadHandcraftRegistry();
  const key = normalizeKey(subtopico);

  const exactKey = Object.keys(pacotes).find((k) => normalizeKey(k) === key);
  if (exactKey) {
    return { canonicalName: exactKey, pkg: pacotes[exactKey] };
  }

  const canonical = subtopicos_canonicos.find((s) => normalizeKey(s) === key);
  if (canonical) {
    return null;
  }

  const fuzzy = Object.keys(pacotes).find(
    (k) => normalizeKey(k).includes(key) || key.includes(normalizeKey(k)),
  );
  if (fuzzy) {
    return { canonicalName: fuzzy, pkg: pacotes[fuzzy] };
  }

  return null;
}

function playbookPathForPrefix(pacotePrefix: string): string {
  return join(PLAYBOOKS_DIR, `${pacotePrefix}.json`);
}

export function loadHandcraftPlaybook(
  subtopico: string,
  registryPkg?: HandcraftRegistryPackage | null,
): HandcraftPlaybook | null {
  const resolved = registryPkg ?? resolveRegistryPackage(subtopico)?.pkg;
  if (!resolved) {
    const defaultPath = join(PLAYBOOKS_DIR, '_default.json');
    if (existsSync(defaultPath)) {
      return JSON.parse(readFileSync(defaultPath, 'utf8')) as HandcraftPlaybook;
    }
    return null;
  }

  const explicit = resolved.handcraft_playbook?.trim();
  if (explicit && existsSync(resolve(process.cwd(), explicit))) {
    return JSON.parse(readFileSync(resolve(process.cwd(), explicit), 'utf8')) as HandcraftPlaybook;
  }

  const prefix = resolved.pacote_prefix;
  if (prefix) {
    const byPrefix = playbookPathForPrefix(prefix);
    if (existsSync(byPrefix)) {
      return JSON.parse(readFileSync(byPrefix, 'utf8')) as HandcraftPlaybook;
    }
  }

  const defaultPath = join(PLAYBOOKS_DIR, '_default.json');
  if (existsSync(defaultPath)) {
    return JSON.parse(readFileSync(defaultPath, 'utf8')) as HandcraftPlaybook;
  }

  return null;
}

export function resolveModeConfig(
  playbook: HandcraftPlaybook | null | undefined,
  mode: string,
): HandcraftModeConfig | undefined {
  return playbook?.modes?.[mode];
}

/** Nome do lote inicial — prioriza `modes[mode].first_lote` do playbook. */
export function resolveFirstLote(
  playbook: HandcraftPlaybook | null | undefined,
  pkg: HandcraftRegistryPackage | null | undefined,
  mode: string,
): string {
  const modeConfig = resolveModeConfig(playbook, mode);
  if (modeConfig?.first_lote) return modeConfig.first_lote;

  const prefix = pkg?.pacote_prefix ?? playbook?.pacote_prefix ?? 'pacote';
  if (mode.includes('repair') && playbook?.repair_lote_pattern) {
    return playbook.repair_lote_pattern.replace('{NN}', '01');
  }
  return pkg?.lote_pattern?.replace('{NN}', '01') ?? `${prefix}-g01`;
}

export function substitutePlaybookPlaceholders(
  command: string,
  ctx: PlaybookCommandContext,
): string {
  return command
    .replace(/<lote>/g, ctx.lote)
    .replace(/<slug>/g, ctx.slug ?? '<slug>')
    .replace(/<canônico>/g, ctx.canonical)
    .replace(/<canonico>/g, ctx.canonical)
    .replace(/<pacote>/g, ctx.prefix);
}

export function formatProibidoList(playbook: HandcraftPlaybook | null | undefined): string {
  const items = playbook?.proibido?.length ? playbook.proibido : DEFAULT_PROIBIDO;
  return items.map((c) => `\`${c}\``).join(', ');
}

function usesStrictV2Pedagogy(playbook: HandcraftPlaybook | null | undefined): boolean {
  const validation = playbook?.validation ?? {};
  return Object.values(validation).some((cmd) => cmd.includes('strict-v2-pedagogy'));
}

function defaultAfterHandcraft(
  mode: string,
  ctx: PlaybookCommandContext,
  strictV2: boolean,
): string[] {
  const strict = strictV2 ? ' --strict-v2-pedagogy' : '';
  if (mode === 'single_slug' && ctx.slug) {
    return [
      `npm run audit:questao-readiness -- --file=data/catalog-migration/${ctx.lote}/questions/${ctx.slug}.json${strict}`,
    ];
  }
  return [
    `npm run validate:goldens -- --lote=${ctx.lote} --strict`,
    `npm run audit:questao-readiness -- --lote=${ctx.lote}${strict}`,
    `npm run catalog:apply-lote -- --lote=${ctx.lote} --dry-run`,
    '# apply + patch branch só se o usuário pedir',
  ];
}

function resolveAfterHandcraftCommands(
  playbook: HandcraftPlaybook | null | undefined,
  mode: string,
  ctx: PlaybookCommandContext,
): string[] {
  const modeConfig = resolveModeConfig(playbook, mode);
  const strictV2 =
    usesStrictV2Pedagogy(playbook) ||
    modeConfig?.after_handcraft?.some((c) => c.includes('strict-v2-pedagogy')) ||
    false;

  if (modeConfig?.after_handcraft?.length) {
    return modeConfig.after_handcraft.map((cmd) => substitutePlaybookPlaceholders(cmd, ctx));
  }
  return defaultAfterHandcraft(mode, ctx, strictV2);
}

function buildPipelineCommands(
  playbook: HandcraftPlaybook | null | undefined,
  pkg: HandcraftRegistryPackage | null | undefined,
  mode: string,
  options: HandcraftBriefOptions,
  canonical: string,
): string[] {
  const prefix = pkg?.pacote_prefix ?? playbook?.pacote_prefix ?? 'pacote';
  const modeConfig = resolveModeConfig(playbook, mode);

  if (options.slug) {
    const lote = resolveFirstLote(playbook, pkg, mode);
    const loteDir =
      modeConfig?.lote_dir ?? `data/catalog-migration/${lote}/questions`;
    const slug = options.slug;
    const ctx: PlaybookCommandContext = { lote, slug, canonical, prefix };

    return [
      `# Buscar JSON no Supabase: ${slug}`,
      `# Salvar: ${loteDir}/${slug}.json`,
      ...resolveAfterHandcraftCommands(playbook, mode, ctx),
    ];
  }

  const lote = resolveFirstLote(playbook, pkg, mode);
  const ctx: PlaybookCommandContext = { lote, canonical, prefix };

  return [
    `npm run catalog:export-lote -- --lote=${prefix}-completo --subtopico="${canonical}" --limit=10000`,
    `# Handcraft → data/catalog-migration/${lote}/questions/*.json`,
    ...resolveAfterHandcraftCommands(playbook, mode, ctx),
  ];
}

function formatBranches(playbook: HandcraftPlaybook): string {
  const branches = playbook.pedagogical_branches;
  if (!branches?.length) {
    return playbook.pedagogical_branches_note ?? 'Ver skill avant-json-template § L2.5+L3.';
  }
  return branches
    .map((b) => {
      const anchors = b.anchors?.length ? `\n    Âncoras: ${b.anchors.join(', ')}` : '';
      const vg = b.visual_gallery;
      const gallery = vg
        ? `\n    Galeria visual: \`${vg.status}\`${vg.captures_dir ? ` · \`${vg.captures_dir}\`` : ''}${b.brief ? ` · brief \`${b.brief}\`` : ''}`
        : '';
      return `  - **${b.id}** — ${b.when}${b.mold ? ` · ${b.mold}` : ''}${anchors}${gallery}`;
    })
    .join('\n');
}

/**
 * Briefing Markdown equivalente ao prompt longo — o agente executa isto ao ver `Handcraft: <subtópico>`.
 */
export function buildHandcraftBrief(
  subtopico: string,
  options: HandcraftBriefOptions = {},
): string {
  const resolved = resolveRegistryPackage(subtopico);
  const canonical = resolved?.canonicalName ?? subtopico;
  const pkg = resolved?.pkg;
  const playbook = loadHandcraftPlaybook(canonical, pkg);

  const mode =
    options.slug != null
      ? 'single_slug'
      : options.mode ?? playbook?.scope_default ?? 'subtopico_handcraft';

  const modeConfig = resolveModeConfig(playbook, mode);
  const firstLote = resolveFirstLote(playbook, pkg, mode);
  const isRepairMode = mode.startsWith('subtopico_repair');

  const lines: string[] = [
    `# Handcraft briefing — ${canonical}`,
    '',
    '**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.',
    '',
    '## Escopo',
    '',
  ];

  if (options.slug) {
    lines.push(
      `- **Uma questão:** \`${options.slug}\``,
      `- Reparo/atualização golden-v1 **A1+A2+A3**`,
    );
  } else if (isRepairMode) {
    const repairLabel =
      modeConfig?.label ??
      (mode === 'subtopico_repair_l3'
        ? 'reparo/atualização L3 em slugs premium'
        : 'reparo/atualização em slugs premium');
    lines.push(
      `- **Subtópico inteiro** — ${repairLabel}`,
      `- Seleção: ${playbook?.slug_selection ?? 'audit FAIL ou branch ausente no Supabase'}`,
      `- **Primeiro lote:** \`${firstLote}\``,
    );
  } else {
    lines.push(
      `- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3`,
      `- **Primeiro lote:** \`${firstLote}\``,
    );
  }

  lines.push('', '## Pacote (registry)', '');

  if (pkg) {
    lines.push(
      `| Campo | Valor |`,
      `|-------|-------|`,
      `| pacote_prefix | \`${pkg.pacote_prefix ?? '—'}\` |`,
      `| status | ${pkg.status ?? '—'} (${pkg.handcraft_applied ?? '?'}/${pkg.total_slugs ?? '?'} slugs) |`,
      `| manifest | \`${pkg.manifest ?? '—'}\` |`,
      `| lote_pattern | \`${pkg.lote_pattern ?? '—'}\` |`,
      `| lote_size | ${pkg.lote_size ?? 8} |`,
      `| anchor_glob | \`${pkg.anchor_glob ?? playbook?.anchor_glob ?? '—'}\` |`,
      `| guideline | \`${pkg.guideline ?? playbook?.guideline ?? '—'}\` |`,
    );
    if (pkg.handcraft_meta) {
      lines.push(`| handcraft_meta | \`${pkg.handcraft_meta}\` |`);
    }
  } else {
    lines.push(
      `_Subtópico não está em handcraft-registry.json → seguir fallback_novo_pacote no registry._`,
    );
  }

  if (playbook?.repair_lote_pattern && isRepairMode) {
    lines.push(
      '',
      `**Padrão de lotes repair:** \`${playbook.repair_lote_pattern}\` · 1º lote: \`${firstLote}\``,
    );
  }

  const proibidoList = formatProibidoList(playbook);
  if (playbook?.proibido?.length) {
    lines.push('', '## Proibido (playbook)', '', ...playbook.proibido.map((c) => `- \`${c}\``));
  }

  lines.push('', '## Ramos L3 (pedagogical_branch)', '', formatBranches(playbook ?? {}));

  if (playbook?.clusters?.length) {
    lines.push('', '## Clusters', '', ...playbook.clusters.map((c) => `- ${c}`));
  }

  if (playbook?.golden_v1_grammar) {
    lines.push('', '## Gramática golden-v1 (4 slides)', '');
    for (const [slot, desc] of Object.entries(playbook.golden_v1_grammar)) {
      lines.push(`- **${slot}:** ${desc}`);
    }
    const pedagogyMap = playbook.validation?.pedagogy_grammar;
    if (pedagogyMap) {
      lines.push(`- Mapa de erros ROI: \`${pedagogyMap}\``);
    }
  }

  if (playbook?.roi_priorities?.length) {
    lines.push('', '## Priorização ROI', '', '| P | Ação | Por quê |', '|---|------|---------|');
    for (const row of playbook.roi_priorities) {
      lines.push(`| ${row.priority} | ${row.action} | ${row.why} |`);
    }
  }

  const v3Registry = playbook?.clinical_depth_v3_registry;
  if (v3Registry) {
    lines.push('', '## Clinical-depth v3', '', `- Registry: \`${v3Registry}\``, '- EXCETO pós-op: `examples/questao-premium-fundatec-perioperatoria-anestesia-regional-exceto.json`');
  }

  const goldenAnchors = playbook?.golden_anchors_registry;
  if (goldenAnchors) {
    const branchAnchors = (playbook?.pedagogical_branches ?? [])
      .flatMap((b) => (b.anchors ?? []).map((a) => `- **${b.id}:** \`${a}\``))
      .filter((line, i, arr) => arr.indexOf(line) === i);
    lines.push(
      '',
      '## Golden anchors',
      '',
      `- Registry: \`${goldenAnchors}\``,
      ...(branchAnchors.length > 0 ? branchAnchors : ['- Ver registry e `examples/` do pacote']),
    );
  }

  const strictHint = usesStrictV2Pedagogy(playbook) ? ' (strict-v2-pedagogy obrigatório)' : '';

  lines.push(
    '',
    '## Pipeline (executar)',
    '',
    '1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.',
    '2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.',
    '3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.',
    `4. **Proibido:** ${proibidoList}.`,
    '',
    '```bash',
    ...buildPipelineCommands(playbook, pkg, mode, options, canonical),
    '```',
    '',
    '## Critério de pronto (automático)',
    '',
    '- `audit:questao-readiness` → `[READY]` por slug' + strictHint,
    '- A4 (piloto `/estudar/[slug]`) — usuário',
    '',
  );

  return lines.join('\n');
}
