/**
 * Expande `Pipeline completo: <subtópico>` em briefing operacional (agente professor).
 * @see docs/PIPELINE_COMPLETO_CONVERSA.md · docs/PROGRAMA_CATALOGO_41.md
 */
import {
  loadHandcraftPlaybook,
  loadHandcraftRegistry,
  resolveRegistryPackage,
  type HandcraftRegistryPackage,
} from '@/lib/catalogMigration/handcraftPlaybook';

export type PipelinePhase = 'fase0' | 'fase1' | 'fase2' | 'fase3';

export type PipelineBriefOptions = {
  slug?: string;
  /** Força fase inicial (override do registry). */
  phase?: PipelinePhase;
  /** Pular promote (equivale trigger "Só handcraft"). */
  handcraftOnly?: boolean;
  /** Pular handcraft (equivale trigger "Só qualidade"). */
  qualityOnly?: boolean;
};

export type ParsedPipelineTrigger = {
  subtopico: string;
  slug?: string;
  handcraftOnly?: boolean;
  qualityOnly?: boolean;
};

const PERSONA_BLOCK = `## Persona — professor de concursos (Téc. Enfermagem)

Você é o melhor professor de concursos para **Técnicos de Enfermagem**:
- Fontes **tier A** (MS/PNI, COFEN, Anvisa, leis) e **tier B** (sociedades) só quando a prova cobra
- **Nunca** inventar número normativo sem \`meta.sources[]\` com \`covers\`
- Cada questão ensina **ESTA prova** (export real) — texto não reciclável entre slugs
- **4 camadas v2 distintas** — zero repetição entre slides da mesma questão
- Alta absorção: \`logic_flow\` com \`reveal_mode: "tap"\`; gabarito só no fluxo; decore no \`golden_rule\``;

const V2_CONTRACT = `## Contrato v2 por slug (ordem no JSON)

| # | type | Pergunta | Evitar |
|---|------|----------|--------|
| 1 | \`concept_map\` | O que preciso saber? | Letra/gabarito |
| 2 | \`logic_flow\` | Como chego na letra? | Copiar \`golden_rule\` / options |
| 3 | \`golden_rule\` | O que decoro? | Row "Gabarito letra X" |
| 4 | \`danger_zone\` | Onde caio nesta prova? | Repetir passos do fluxo |

**Readiness:** \`npm run audit:questao-readiness -- --file=... --strict-v2-pedagogy\` → \`[READY]\` **sem errors** (inclui pedagogy v2).`;

/** Extrai subtópico de `Pipeline completo: Nome` + modificadores. */
export function parsePipelineCompletoTrigger(message: string): ParsedPipelineTrigger | null {
  const trimmed = message.trim();
  const match = trimmed.match(/^Pipeline completo:\s*(.+?)(?:\n|$)/i);
  if (!match) return null;

  let subtopico = match[1].trim();
  if (subtopico.includes('\n')) {
    subtopico = subtopico.split('\n')[0].trim();
  }

  const slugMatch = trimmed.match(/^\s*Slug:\s*(\S+)/im);
  const slug = slugMatch?.[1]?.trim();

  const lower = trimmed.toLowerCase();
  const handcraftOnly = /\bsó handcraft\b|\bso handcraft\b/i.test(lower);
  const qualityOnly = /\bsó qualidade\b|\bso qualidade\b/i.test(lower);

  return { subtopico, slug, handcraftOnly, qualityOnly };
}

export function resolvePipelinePhase(
  pkg: HandcraftRegistryPackage | null | undefined,
  options: PipelineBriefOptions = {},
): PipelinePhase {
  if (options.phase) return options.phase;
  if (options.handcraftOnly) return 'fase1';
  if (options.qualityOnly) return 'fase2';

  const applied =
    typeof pkg?.handcraft_applied === 'number' &&
    typeof pkg?.total_slugs === 'number' &&
    pkg.handcraft_applied === pkg.total_slugs &&
    pkg.status === 'applied';

  if (pkg?.production_status === 'production_ready') return 'fase3';
  if (applied && pkg?.production_status !== 'production_ready') return 'fase2';
  if (!pkg) return 'fase0';
  return 'fase1';
}

function needsPreflight(subtopico: string, registry: ReturnType<typeof loadHandcraftRegistry>): boolean {
  const { legacy_builder_subtopicos, pacotes } = registry;
  const isLegacy = (legacy_builder_subtopicos ?? []).some(
    (s) => s.toLowerCase() === subtopico.toLowerCase(),
  );
  const hasPackage = Boolean(pacotes[subtopico]);
  return !hasPackage || isLegacy;
}

function formatPhaseSection(phase: PipelinePhase, canonical: string, pkg: HandcraftRegistryPackage | null): string {
  const prefix = pkg?.pacote_prefix ?? '<pacote>';
  const lote = pkg?.lote_pattern?.replace('{NN}', '01') ?? `${prefix}-g01`;

  switch (phase) {
    case 'fase0':
      return [
        '### Fase 0 — Pré-voo (executar antes do 1º lote)',
        '',
        '```bash',
        `npm run audit:subtopico-inventory -- --subtopico="${canonical}"`,
        `# Se drift: conversa Classify: ${canonical}`,
        `# Subtópico novo: conversa Mapeamento L3: ${canonical}`,
        `npm run catalog:export-lote -- --lote=${prefix}-completo --subtopico="${canonical}" --limit=10000`,
        `# Criar entrada em handcraft-registry.json se ausente`,
        pkg?.cluster_command ? `${pkg.cluster_command}` : `# npm run cluster:<pacote> (se existir)`,
        '```',
        '',
        'Depois: retomar com Fase 1 handcraft.',
      ].join('\n');

    case 'fase1':
      return [
        '### Fase 1 — Handcraft golden-v1',
        '',
        'Por slug: export → family + branch + 4 slides v2 → readiness strict-v2 → lote.',
        '',
        '```bash',
        optionsSlugBlock(lote, prefix, canonical),
        `npm run validate:goldens -- --lote=${lote} --strict`,
        `npm run audit:questao-readiness -- --lote=${lote} --strict-v2-pedagogy`,
        `npm run catalog:apply-lote -- --lote=${lote} --dry-run`,
        '# apply SOMENTE se usuário escrever: pode aplicar',
        `npm run catalog:apply-lote -- --lote=${lote} --apply`,
        '```',
        '',
        '**Gate:** `handcraft_applied === total_slugs`, `status: applied`.',
      ].join('\n');

    case 'fase2':
      return [
        '### Fase 2 — Qualidade vendável + promote',
        '',
        '```bash',
        `npm run reconcile:handcraft-manifest -- --subtopico="${canonical}"`,
        `# catalog:preflight --strict-v2-pedagogy em cada g*`,
        `npm run audit:handcraft-dod -- --subtopico="${canonical}"`,
        `npm run audit:slug-alignment -- --subtopico="${canonical}" --strict`,
        `npm run audit:numeric-factcheck -- --subtopico="${canonical}"`,
        `# audit:anchor-review + revisor B (L6) por lote g*`,
        'npx playwright test e2e/visual-mold-regression.spec.ts',
        `npm run audit:subtopico-quality -- --subtopico="${canonical}" --promote`,
        '```',
        '',
        '**Gate:** `production_status: production_ready` = VENDÁVEL.',
      ].join('\n');

    case 'fase3':
      return [
        '### Fase 3 — Pós-venda / relatório',
        '',
        'Pacote já vendável. Repair pontual: linha `Slug: …` no trigger.',
        '',
        '```bash',
        `npm run audit:subtopico-health -- --subtopico="${canonical}"`,
        'npm run catalog:program-status',
        '```',
      ].join('\n');
  }
}

function optionsSlugBlock(lote: string, prefix: string, canonical: string): string {
  return [
    `# Export (se ainda não feito):`,
    `npm run catalog:export-lote -- --lote=${prefix}-completo --subtopico="${canonical}" --limit=10000`,
    `# Handcraft → data/catalog-migration/${lote}/questions/<slug>.json`,
    `npm run audit:questao-readiness -- --file=data/catalog-migration/${lote}/questions/<slug>.json --strict-v2-pedagogy`,
  ].join('\n');
}

/**
 * Briefing Markdown para conversa `Pipeline completo:` — agente executa sem pedir modo.
 */
export function buildPipelineBrief(
  subtopico: string,
  options: PipelineBriefOptions = {},
): string {
  const resolved = resolveRegistryPackage(subtopico);
  const canonical = resolved?.canonicalName ?? subtopico;
  const pkg = resolved?.pkg ?? null;
  const registry = loadHandcraftRegistry();
  const playbook = loadHandcraftPlaybook(canonical, pkg);
  const phase = resolvePipelinePhase(pkg, options);
  const preflight = needsPreflight(canonical, registry);
  const prefix = pkg?.pacote_prefix ?? '<pacote>';
  const lote =
    pkg?.lote_pattern?.replace('{NN}', '01') ?? `${prefix}-g01`;

  const lines: string[] = [
    `# Pipeline completo — ${canonical}`,
    '',
    '**Modo automático** (trigger `Pipeline completo:`). Executar sem pedir confirmação de modo.',
    '',
    PERSONA_BLOCK,
    '',
    V2_CONTRACT,
    '',
    '## Escopo',
    '',
    `- **1 subtópico** = 1 pacote (todos lotes \`g*\`). Não misturar 41 subtópicos nesta conversa.`,
  ];

  if (options.slug) {
    lines.push(`- **Reparo pontual:** slug \`${options.slug}\``);
    lines.push(
      '',
      '```bash',
      `npm run audit:questao-readiness -- --file=data/catalog-migration/${lote}/questions/${options.slug}.json --strict-v2-pedagogy`,
      '```',
    );
  }

  lines.push('', '## Pacote (registry)', '');

  if (pkg) {
    lines.push(
      '| Campo | Valor |',
      '|-------|-------|',
      `| pacote_prefix | \`${pkg.pacote_prefix ?? '—'}\` |`,
      `| status | ${pkg.status ?? '—'} (${pkg.handcraft_applied ?? '?'}/${pkg.total_slugs ?? '?'} slugs) |`,
      `| production_status | ${pkg.production_status ?? 'none'} |`,
      `| lote_pattern | \`${pkg.lote_pattern ?? '—'}\` |`,
      `| anchor_glob | \`${pkg.anchor_glob ?? playbook?.anchor_glob ?? '—'}\` |`,
    );
  } else {
    lines.push('_Sem pacote no registry → Fase 0 (export + criar entrada)._');
  }

  lines.push(
    '',
    `## Fase atual detectada: **${phase}**`,
    '',
    formatPhaseSection(phase, canonical, pkg),
  );

  if (preflight && phase !== 'fase3') {
    lines.push(
      '',
      '## Pré-voo recomendado',
      '',
      '| Passo | Trigger / comando |',
      '|-------|-------------------|',
      `| Taxonomia | \`Classify: ${canonical}\` (se inventário com drift) |`,
      `| L3 | \`Mapeamento L3: ${canonical}\` (subtópico novo ou sem cluster) |`,
      `| Brief handcraft | \`npm run handcraft:brief -- --subtopico="${canonical}"\` |`,
      `| Status programa | \`npm run catalog:program-status\` |`,
    );
    const legacy = (registry.legacy_builder_subtopicos ?? []).some(
      (s) => s.toLowerCase() === canonical.toLowerCase(),
    );
    if (legacy) {
      lines.push('', '> **Legado builder:** re-handcraft obrigatório — conteúdo anterior não é golden-v1.');
    }
  }

  lines.push(
    '',
    '## Leitura obrigatória',
    '',
    '- `docs/PIPELINE_COMPLETO_CONVERSA.md`',
    '- `docs/GOLDEN_CONTENT_STANDARD.md` · `docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md` §2',
    '- Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3',
    '- `examples/_TEMPLATE-golden-v1.json`',
    '',
    '## Proibido',
    '',
    '- `npm run ai:generate` · `catalog:upgrade-premium`',
    '- `catalog:apply-lote --apply` sem usuário escrever **pode aplicar**',
    '- Declarar vendável sem `audit:subtopico-quality --promote` PASS',
    '',
    '## Encerramento (reportar)',
    '',
    '```text',
    '| applied | production_ready (VENDÁVEL) | blockers | próximo lote |',
    '```',
    '',
  );

  return lines.join('\n');
}
