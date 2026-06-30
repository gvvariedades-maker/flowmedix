/**
 * Resolve playbook handcraft por subtópico — expande `Handcraft: <canônico>` em briefing completo.
 * @see data/catalog-migration/handcraft-playbooks/README.md
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

export type PedagogicalBranchPlaybook = {
  id: string;
  when: string;
  mold?: string;
  anchors?: string[];
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
  modes?: Record<string, unknown>;
  validation?: Record<string, string>;
};

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

function formatBranches(playbook: HandcraftPlaybook): string {
  const branches = playbook.pedagogical_branches;
  if (!branches?.length) {
    return playbook.pedagogical_branches_note ?? 'Ver skill avant-json-template § L2.5+L3.';
  }
  return branches
    .map((b) => {
      const anchors = b.anchors?.length ? `\n    Âncoras: ${b.anchors.join(', ')}` : '';
      return `  - **${b.id}** — ${b.when}${b.mold ? ` · ${b.mold}` : ''}${anchors}`;
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
  } else if (mode === 'subtopico_repair_l3') {
    lines.push(
      `- **Subtópico inteiro** — reparo/atualização L3 em slugs premium`,
      `- Seleção: ${playbook?.slug_selection ?? 'audit FAIL ou branch ausente no Supabase'}`,
    );
  } else {
    lines.push(`- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3`);
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

  if (playbook?.repair_lote_pattern && mode === 'subtopico_repair_l3') {
    lines.push('', `**Lote repair:** \`${playbook.repair_lote_pattern}\` (começar por g01 se não existir).`);
  }

  lines.push('', '## Ramos L3 (pedagogical_branch)', '', formatBranches(playbook ?? {}));

  if (playbook?.clusters?.length) {
    lines.push('', '## Clusters', '', ...playbook.clusters.map((c) => `- ${c}`));
  }

  lines.push(
    '',
    '## Pipeline (executar)',
    '',
    '1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.',
    '2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.',
    '3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.',
    '4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.',
    '',
    '```bash',
  );

  if (options.slug) {
    const lote =
      (playbook?.modes?.single_slug as { lote_dir?: string })?.lote_dir ??
      `data/catalog-migration/${pkg?.pacote_prefix ?? 'pacote'}-repair-l3-g01`;
    lines.push(
      `# Buscar JSON no Supabase: ${options.slug}`,
      `# Salvar: ${lote}/questions/${options.slug}.json`,
      `npm run audit:questao-readiness -- --file=${lote}/questions/${options.slug}.json`,
    );
  } else {
    const prefix = pkg?.pacote_prefix ?? '<pacote>';
    const lote =
      mode === 'subtopico_repair_l3'
        ? (playbook?.repair_lote_pattern ?? `${prefix}-repair-l3-g{NN}`).replace('{NN}', '01')
        : `${pkg?.lote_pattern?.replace('{NN}', '01') ?? `${prefix}-g01`}`;
    lines.push(
      `npm run catalog:export-lote -- --lote=${prefix}-completo --subtopico="${canonical}" --limit=10000`,
      `# Handcraft → data/catalog-migration/${lote}/questions/*.json`,
      `npm run validate:goldens -- --lote=${lote} --strict`,
      `npm run audit:questao-readiness -- --lote=${lote}`,
      `npm run catalog:apply-lote -- --lote=${lote} --dry-run`,
      `# apply + patch branch só se o usuário pedir`,
    );
  }

  lines.push(
    '```',
    '',
    '## Critério de pronto (automático)',
    '',
    '- `audit:questao-readiness` → `[READY]` por slug',
    '- A4 (piloto `/estudar/[slug]`) — usuário',
    '',
  );

  return lines.join('\n');
}
