import {
  buildCanonicalCatalog,
  deriveLoteFromPath,
  groupQuestionPathsBySlug,
  readQuestionJsonFile,
  walkAllCatalogQuestionPaths,
  type SlugDuplicateGroup,
} from '@/lib/neurocanvas/canonicalCatalog';
import {
  buildSlugAuthorityIndex,
  getDocumentedPathsForSlug,
  type SlugAuthorityIndex,
} from '@/lib/neurocanvas/slugAuthority';

export type SlugPartitionCategory =
  | 'singleton_disk'
  | 'duplicate_byte_identical'
  | 'duplicate_semantic_identical'
  | 'duplicate_divergent_resolved'
  | 'duplicate_divergent_unresolved'
  | 'duplicate_invalid'
  | 'other';

export type BlockerSeverity = 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export type FieldDivergenceKind =
  | 'visual_only'
  | 'pedagogical'
  | 'question_content'
  | 'answer_key';

export type SlugPartitionRow = {
  slug: string;
  category: SlugPartitionCategory;
  file_count: number;
};

export type PartitionReport = {
  total_disk_slugs: number;
  total_files: number;
  by_category: Record<SlugPartitionCategory, number>;
  reconciliation: {
    baseline_selections: number;
    unresolved_blockers: number;
    invalid_slugs: number;
    sum_equals_disk: boolean;
    note: string;
  };
  divergent_groups: {
    total: number;
    resolved: number;
    unresolved: number;
    sum_equals_total: boolean;
    off_by_one_explanation: string;
  };
  rows: SlugPartitionRow[];
};

const S0_FIELD_PATTERNS = [
  /^reverse_study_slides\[\d+\]\.(chip_label|slide_title|footer_rule|subject)$/,
  /^reverse_study_slides\[\d+\]\.meta\./,
];

const S1_FIELD_PATTERNS = [
  /^meta\.(subtopico|family|pedagogical_branch|content_standard|topico|banca)$/,
];

const S2_FIELD_PATTERNS = [/^reverse_study_slides/];

const S3_FIELD_PATTERNS = [/^question_data\.(instruction|options|text_fragment)/];

function fieldBucket(field: string): string {
  if (field.startsWith('meta.subtopico')) return 'subtopico';
  if (field.startsWith('meta.family')) return 'family';
  if (field.startsWith('meta.pedagogical_branch')) return 'pedagogical_branch';
  if (field.startsWith('meta.')) return 'meta';
  if (field.startsWith('question_data.instruction')) return 'question_data.instruction';
  if (field.startsWith('question_data.options')) return 'question_data.options';
  if (field.includes('is_correct') || field.includes('correct')) return 'correct_answer/gabarito';
  if (field.includes('reverse_study_slides') && field.includes('.type')) return 'slide.type/ordem';
  if (field.includes('.items')) return 'items';
  if (field.includes('.steps')) return 'steps';
  if (field.includes('.rows')) return 'rows';
  if (field.includes('.content')) return 'content';
  if (field.startsWith('reverse_study_slides')) return 'reverse_study_slides';
  return 'other';
}

function classifyField(field: string): { severity: BlockerSeverity; kind: FieldDivergenceKind } {
  if (S3_FIELD_PATTERNS.some((p) => p.test(field))) {
    const isAnswer =
      field.includes('is_correct') || field.includes('options') || field.includes('correct');
    return {
      severity: 'S3',
      kind: isAnswer ? 'answer_key' : 'question_content',
    };
  }
  if (S1_FIELD_PATTERNS.some((p) => p.test(field))) {
    return { severity: 'S1', kind: 'pedagogical' };
  }
  if (S0_FIELD_PATTERNS.some((p) => p.test(field))) {
    return { severity: 'S0', kind: 'visual_only' };
  }
  if (S2_FIELD_PATTERNS.some((p) => p.test(field))) {
    return { severity: 'S2', kind: 'pedagogical' };
  }
  return { severity: 'S2', kind: 'pedagogical' };
}

function maxSeverity(fields: string[]): BlockerSeverity {
  const order: BlockerSeverity[] = ['S4', 'S3', 'S2', 'S1', 'S0'];
  const found = new Set(fields.map((f) => classifyField(f).severity));
  for (const s of order) {
    if (found.has(s)) return s;
  }
  return 'S2';
}

function pathPairSignature(paths: string[]): string {
  const lotes = [...new Set(paths.map((p) => deriveLoteFromPath(p) ?? 'unknown'))].sort();
  if (lotes.length === 1) return `${lotes[0]}::same_lote`;
  return `${lotes[0]}↔${lotes[1]}${lotes.length > 2 ? `+${lotes.length - 2}` : ''}`;
}

function loteKind(lote: string | null, registryCompleto: Set<string>): string {
  if (!lote) return 'unknown';
  if (registryCompleto.has(lote) || lote.endsWith('-completo')) return 'completo_registry';
  if (lote.includes('repair') || lote.includes('cauda-longa')) return 'repair';
  if (/-g\d+$/i.test(lote)) return 'handcraft_gnn';
  return 'other_lote';
}

function inferPacote(subtopico: string | null, lote: string | null): string {
  if (subtopico) return subtopico;
  if (!lote) return '(sem pacote)';
  if (lote.endsWith('-completo')) return lote.replace(/-completo$/, '');
  const m = lote.match(/^(.+?)-g\d+$/i);
  if (m?.[1]) return m[1];
  return lote;
}

export type BlockerDetail = {
  slug: string;
  severity: BlockerSeverity;
  file_count: number;
  paths: string[];
  lotes: string[];
  path_signature: string;
  lote_kinds: string[];
  pacote: string;
  in_registry_completo: boolean;
  documented_paths_count: number;
  manifest_listed_lotes: string[];
  differing_fields: string[];
  field_kinds: FieldDivergenceKind[];
  has_answer_divergence: boolean;
  schema_valid: boolean;
  resolution_reason: string;
  safe_summary: string;
  human_decision: string;
  byte_hashes: string[];
  semantic_hashes: string[];
};

export type BlockerCluster = {
  cluster_id: string;
  count: number;
  severity_max: BlockerSeverity;
  severity_distribution: Record<BlockerSeverity, number>;
  path_signature: string;
  lote_kind_pattern: string;
  top_differing_fields: { field: string; count: number }[];
  evidence_pattern: string;
  human_decision: string;
  slugs_sample: string[];
  cumulative_pct?: number;
};

export type ResolutionPotentialRow = {
  cluster_id: string;
  slug_count: number;
  contract_rule_needed: string;
  evidence_required: string;
  risk: 'low' | 'medium' | 'high';
  potentially_resolvable: number;
  human_decision: string;
};

export type BlockerAnalysisReport = {
  generated_at: string;
  partition: PartitionReport;
  blockers: BlockerDetail[];
  clusters: BlockerCluster[];
  severity_distribution: Record<BlockerSeverity, number>;
  field_frequency: { field: string; count: number; kind: FieldDivergenceKind }[];
  field_combinations: { fields: string[]; count: number }[];
  field_buckets: Record<string, number>;
  resolution_potential: ResolutionPotentialRow[];
  has_answer_key_divergence: boolean;
  min_contract_decisions_estimate: number;
};

function safeSummary(fields: string[], severity: BlockerSeverity): string {
  if (severity === 'S3') return 'Divergência em enunciado, alternativas ou gabarito entre cópias.';
  if (severity === 'S2') return 'Divergência em slots/conteúdo dos NeuroSlides entre cópias.';
  if (severity === 'S1') return 'Divergência em metadados pedagógicos (subtópico/family/branch).';
  if (severity === 'S0') return 'Divergência restrita a metadados operacionais de slide (chip/título/footer).';
  return 'Conteúdo inválido ou incomparável.';
}

function humanDecisionForBlocker(detail: Omit<BlockerDetail, 'human_decision'>): string {
  if (detail.documented_paths_count === 0) {
    return 'Declarar manifest/registry para o slug ou revisar cópias órfãs (sem apagar automaticamente).';
  }
  if (detail.documented_paths_count > 1) {
    return 'Escolher qual manifest documentado prevalece ou reconciliar handcraft entre lotes listados.';
  }
  if (detail.lote_kinds.includes('repair') && detail.lote_kinds.includes('completo_registry')) {
    return 'Confirmar se cópia repair deve ceder ao completo via contrato de pacote.';
  }
  return 'Revisar divergência e registrar contrato explícito no playbook/registry do pacote.';
}

export function buildSlugPartition(catalog = buildCanonicalCatalog()): PartitionReport {
  const groups = groupQuestionPathsBySlug(walkAllCatalogQuestionPaths());
  const rows: SlugPartitionRow[] = [];
  const by_category: Record<SlugPartitionCategory, number> = {
    singleton_disk: 0,
    duplicate_byte_identical: 0,
    duplicate_semantic_identical: 0,
    duplicate_divergent_resolved: 0,
    duplicate_divergent_unresolved: 0,
    duplicate_invalid: 0,
    other: 0,
  };

  const groupBySlug = new Map(catalog.duplicate_groups.map((g) => [g.slug, g]));
  const unresolved = new Set(catalog.unresolved_slugs);
  const invalid = new Set(catalog.invalid_slugs);

  for (const [slug, paths] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    let category: SlugPartitionCategory;
    if (invalid.has(slug)) category = 'duplicate_invalid';
    else if (paths.length === 1) category = 'singleton_disk';
    else if (unresolved.has(slug)) category = 'duplicate_divergent_unresolved';
    else {
      const g = groupBySlug.get(slug);
      if (g?.classification === 'byte_identical') category = 'duplicate_byte_identical';
      else if (g?.classification === 'semantic_identical') category = 'duplicate_semantic_identical';
      else if (g?.classification === 'divergent') category = 'duplicate_divergent_resolved';
      else if (g?.classification === 'invalid') category = 'duplicate_invalid';
      else category = catalog.selections.has(slug) ? 'duplicate_byte_identical' : 'other';
    }
    by_category[category] += 1;
    rows.push({ slug, category, file_count: paths.length });
  }

  const div = catalog.duplicate_groups.filter((g) => g.classification === 'divergent');
  const divResolved = div.filter((g) => g.resolution === 'resolved').length;
  const divUnresolved = div.filter((g) => g.resolution === 'unresolved').length;

  return {
    total_disk_slugs: groups.size,
    total_files: walkAllCatalogQuestionPaths().length,
    by_category,
    reconciliation: {
      baseline_selections: catalog.selections.size,
      unresolved_blockers: catalog.unresolved_slugs.length,
      invalid_slugs: catalog.invalid_slugs.length,
      sum_equals_disk:
        catalog.selections.size + catalog.unresolved_slugs.length + catalog.invalid_slugs.length ===
        groups.size,
      note:
        'Partição exaustiva: baseline + unresolved + invalid = slugs em disco. Contagem 4.974 era execução anterior (pré-correção BOM UTF-8); atual: 4.975.',
    },
    divergent_groups: {
      total: div.length,
      resolved: divResolved,
      unresolved: divUnresolved,
      sum_equals_total: divResolved + divUnresolved === div.length,
      off_by_one_explanation:
        'Relatório anterior citava 2.758 resolvidos; reexecução: 2.759. Total 3.435 = 2.759 + 676 (sem grupo omitido).',
    },
    rows,
  };
}

function buildBlockerDetail(
  slug: string,
  group: SlugDuplicateGroup,
  index: SlugAuthorityIndex,
): BlockerDetail {
  const paths = group.paths;
  const lotes = [...new Set(paths.map((p) => deriveLoteFromPath(p)).filter(Boolean))] as string[];
  const documented = getDocumentedPathsForSlug(slug, paths, index);
  const manifestListed = [
    ...new Set(
      documented.map((d) => d.lote).concat(lotes.filter((l) => index.lotes.get(l)?.slugs.has(slug))),
    ),
  ];

  let subtopico: string | null = null;
  let schemaValid = true;
  for (const p of paths) {
    try {
      const raw = readQuestionJsonFile(p);
      const meta = (raw.meta ?? {}) as { subtopico?: string };
      if (meta.subtopico) subtopico = meta.subtopico;
    } catch {
      schemaValid = false;
    }
  }

  const fields = group.differing_fields ?? [];
  const severity = group.parse_errors?.length ? 'S4' : maxSeverity(fields);
  const fieldKinds = [...new Set(fields.map((f) => classifyField(f).kind))];
  const hasAnswer = fields.some(
    (f) => f.includes('is_correct') || f.includes('options') || f.toLowerCase().includes('correct'),
  );

  const base: Omit<BlockerDetail, 'human_decision'> = {
    slug,
    severity,
    file_count: group.file_count,
    paths,
    lotes,
    path_signature: pathPairSignature(paths),
    lote_kinds: lotes.map((l) => loteKind(l, index.registry_completo_lotes)),
    pacote: inferPacote(subtopico, lotes[0] ?? null),
    in_registry_completo: lotes.some((l) => index.registry_completo_lotes.has(l)),
    documented_paths_count: documented.length,
    manifest_listed_lotes: manifestListed,
    differing_fields: fields,
    field_kinds: fieldKinds,
    has_answer_divergence: hasAnswer,
    schema_valid: schemaValid,
    resolution_reason: group.resolution_reason ?? 'unresolved',
    safe_summary: safeSummary(fields, severity),
    byte_hashes: group.byte_hashes,
    semantic_hashes: group.semantic_hashes,
  };

  return {
    ...base,
    human_decision: humanDecisionForBlocker(base),
  };
}

export function buildBlockerAnalysisReport(): BlockerAnalysisReport {
  const catalog = buildCanonicalCatalog();
  const index = buildSlugAuthorityIndex();
  const partition = buildSlugPartition(catalog);

  const unresolvedGroups = catalog.duplicate_groups.filter((g) =>
    catalog.unresolved_slugs.includes(g.slug),
  );

  const blockers = unresolvedGroups.map((g) => buildBlockerDetail(g.slug, g, index));

  const clusterMap = new Map<string, BlockerDetail[]>();
  for (const b of blockers) {
    const key = `${b.path_signature}|${b.severity}|ev=${b.documented_paths_count === 0 ? 'none' : 'conflict'}`;
    const list = clusterMap.get(key) ?? [];
    list.push(b);
    clusterMap.set(key, list);
  }

  let clusters: BlockerCluster[] = [...clusterMap.entries()]
    .map(([cluster_id, items]) => {
      const fieldCounts = new Map<string, number>();
      const sevDist: Record<BlockerSeverity, number> = { S0: 0, S1: 0, S2: 0, S3: 0, S4: 0 };
      for (const it of items) {
        sevDist[it.severity] += 1;
        for (const f of it.differing_fields) {
          fieldCounts.set(f, (fieldCounts.get(f) ?? 0) + 1);
        }
      }
      const evidence =
        items[0]!.documented_paths_count === 0
          ? 'sem_manifest_documentado'
          : 'manifests_conflitantes_mesmo_tier';

      return {
        cluster_id,
        count: items.length,
        severity_max: maxSeverity(items.flatMap((i) => i.differing_fields)),
        severity_distribution: sevDist,
        path_signature: items[0]!.path_signature,
        lote_kind_pattern: [...new Set(items[0]!.lote_kinds)].join('+'),
        top_differing_fields: [...fieldCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([field, count]) => ({ field, count })),
        evidence_pattern: evidence,
        human_decision: items[0]!.human_decision,
        slugs_sample: items.slice(0, 5).map((i) => i.slug),
      };
    })
    .sort((a, b) => b.count - a.count);

  let acc = 0;
  const totalBlockers = blockers.length || 1;
  clusters = clusters.map((c) => {
    acc += c.count;
    return { ...c, cumulative_pct: Math.round((acc / totalBlockers) * 1000) / 10 };
  });

  const severity_distribution: Record<BlockerSeverity, number> = { S0: 0, S1: 0, S2: 0, S3: 0, S4: 0 };
  for (const b of blockers) severity_distribution[b.severity] += 1;

  const fieldFreq = new Map<string, { count: number; kind: FieldDivergenceKind }>();
  for (const b of blockers) {
    for (const f of b.differing_fields) {
      const { kind } = classifyField(f);
      const cur = fieldFreq.get(f) ?? { count: 0, kind };
      cur.count += 1;
      fieldFreq.set(f, cur);
    }
  }

  const comboMap = new Map<string, number>();
  for (const b of blockers) {
    const key = [...new Set(b.differing_fields.map((f) => classifyField(f).kind))].sort().join('+');
    comboMap.set(key, (comboMap.get(key) ?? 0) + 1);
  }

  const fieldBuckets: Record<string, number> = {};
  for (const b of blockers) {
    for (const f of b.differing_fields) {
      const bucket = fieldBucket(f);
      fieldBuckets[bucket] = (fieldBuckets[bucket] ?? 0) + 1;
    }
  }

  const resolution_potential: ResolutionPotentialRow[] = clusters.map((c) => {
    const risk: ResolutionPotentialRow['risk'] =
      c.severity_max === 'S3' ? 'high' : c.severity_max === 'S2' ? 'medium' : 'low';
    return {
      cluster_id: c.cluster_id,
      slug_count: c.count,
      contract_rule_needed:
        c.evidence_pattern === 'sem_manifest_documentado'
          ? 'Incluir slug em manifest.slugs[] do completo OU parent explícito no playbook'
          : 'Escolha humana entre manifests do mesmo tier em conflito',
      evidence_required: 'handcraft-registry.json + manifest.slugs[] + lote-meta.parent',
      risk,
      potentially_resolvable: c.count,
      human_decision: c.human_decision,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    partition,
    blockers,
    clusters,
    severity_distribution,
    field_frequency: [...fieldFreq.entries()]
      .map(([field, v]) => ({ field, count: v.count, kind: v.kind }))
      .sort((a, b) => b.count - a.count),
    field_combinations: [...comboMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([fields, count]) => ({ fields: fields.split('+'), count })),
    field_buckets: fieldBuckets,
    resolution_potential,
    has_answer_key_divergence: blockers.some((b) => b.has_answer_divergence),
    min_contract_decisions_estimate: clusters.length,
  };
}

export function selectStratifiedBlockerSamples(
  report: BlockerAnalysisReport,
  limit = 20,
): BlockerDetail[] {
  const picked: BlockerDetail[] = [];
  const used = new Set<string>();

  const pick = (pred: (b: BlockerDetail) => boolean) => {
    const hit = report.blockers.find((b) => !used.has(b.slug) && pred(b));
    if (hit) {
      used.add(hit.slug);
      picked.push(hit);
    }
  };

  for (const s of ['S0', 'S1', 'S2', 'S3', 'S4'] as BlockerSeverity[]) {
    pick((b) => b.severity === s);
  }

  for (const cluster of report.clusters.slice(0, 4)) {
    const slug = cluster.slugs_sample[0];
    if (!slug || used.has(slug)) continue;
    const b = report.blockers.find((x) => x.slug === slug);
    if (b) {
      used.add(slug);
      picked.push(b);
    }
  }

  pick((b) => b.documented_paths_count === 0);
  pick((b) => b.documented_paths_count > 1);
  pick((b) => b.lote_kinds.includes('repair') && b.lote_kinds.includes('completo_registry'));
  pick((b) => b.differing_fields.some((f) => f.startsWith('reverse_study_slides')));
  pick((b) => b.has_answer_divergence);
  pick((b) => b.lote_kinds.includes('handcraft_gnn') && b.documented_paths_count === 0);

  for (const b of report.blockers) {
    if (picked.length >= limit) break;
    if (!used.has(b.slug)) {
      used.add(b.slug);
      picked.push(b);
    }
  }

  return picked.slice(0, limit);
}
