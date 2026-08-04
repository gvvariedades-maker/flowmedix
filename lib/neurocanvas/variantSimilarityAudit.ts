/**
 * Agrupa arquivos em components/slides/variants/ por assinatura estrutural
 * (props aceitas, wrappers compartilhados, classes utilitárias predominantes).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type VariantFileSignature = {
  file: string;
  exportName: string;
  family: string;
  props: string[];
  wrappers: string[];
  topClasses: string[];
  signature: string;
  lineCount: number;
};

export type VariantSimilarityCluster = {
  cluster_id: string;
  signature: string;
  family: string;
  size: number;
  fusion_candidate: boolean;
  files: string[];
  shared_wrappers: string[];
  shared_props: string[];
  notes: string[];
};

export type VariantSimilarityReport = {
  generated_at: string;
  variants_dir: string;
  files_scanned: number;
  clusters: VariantSimilarityCluster[];
  singleton_count: number;
  fusion_candidate_count: number;
};

const WRAPPER_IMPORT_RE =
  /from\s+['"]\.\/([A-Za-z0-9_-]+)['"]/g;

const PROP_DESTRUCTURE_RE =
  /(?:export\s+function\s+\w+\s*\(\s*\{([^}]+)\})|(?:interface\s+\w+Props\s*\{([^}]+)\})|(?:type\s+\w+Props\s*=\s*\{([^}]+)\})/gs;

const CLASS_TOKEN_RE = /(?:className|class)=\{?[`'"|]([^`'"]+)[`'"]/g;
const TAILWIND_TOKEN_RE =
  /\b(?:flex|grid|gap-\S+|p-\S+|px-\S+|py-\S+|m-\S+|rounded-\S+|border(?:-\S+)?|bg-\S+|text-\S+|from-\S+|to-\S+|via-\S+|ring-\S+|shadow-\S+|w-\S+|h-\S+|min-h-\S+|max-h-\S+|overflow-\S+|backdrop-\S+|items-\S+|justify-\S+|space-\S+)\b/g;

const FAMILY_SUFFIXES = [
  'TrapArena',
  'ReferenceBoard',
  'TapFlow',
  'SoftStack',
  'SoftLensBoard',
  'StepLadder',
  'ConceptMap',
  'Deck',
  'Rail',
  'Orbit',
  'Spectrum',
  'Timeline',
  'Board',
  'Trap',
  'Chips',
  'Matrix',
  'Carousel',
  'MeshReveal',
] as const;

function detectFamily(fileBase: string): string {
  for (const suffix of FAMILY_SUFFIXES) {
    if (fileBase.endsWith(suffix)) return suffix;
  }
  if (fileBase.startsWith('DangerZone')) return 'DangerZone*';
  if (fileBase.startsWith('GoldenRule')) return 'GoldenRule*';
  if (fileBase.startsWith('LogicFlow')) return 'LogicFlow*';
  if (fileBase.endsWith('ConceptMap') || fileBase.includes('ConceptMap')) return 'ConceptMap';
  return 'other';
}

function extractExportName(source: string, fileBase: string): string {
  const m =
    source.match(/export\s+function\s+([A-Za-z0-9_]+)/) ||
    source.match(/export\s+const\s+([A-Za-z0-9_]+)/);
  return m?.[1] ?? fileBase;
}

function extractProps(source: string): string[] {
  const props = new Set<string>();
  for (const match of source.matchAll(PROP_DESTRUCTURE_RE)) {
    const block = match[1] || match[2] || match[3] || '';
    for (const part of block.split(/[,;\n]/)) {
      const cleaned = part
        .replace(/\/\/.*$/, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
      if (!cleaned) continue;
      const name = cleaned
        .replace(/\?.*$/, '')
        .replace(/:.*$/, '')
        .replace(/=.*$/, '')
        .replace(/\.\.\./, '')
        .trim();
      if (name && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && name !== 'props') {
        props.add(name);
      }
    }
  }
  // Fallback: simple function param destructure on one line
  const oneLine = source.match(/export\s+function\s+\w+\s*\(\s*\{([^}]{1,200})\}/);
  if (oneLine?.[1]) {
    for (const part of oneLine[1].split(',')) {
      const name = part.split(':')[0]?.split('=')[0]?.trim();
      if (name && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) props.add(name);
    }
  }
  return [...props].sort();
}

function extractWrappers(source: string): string[] {
  const wrappers = new Set<string>();
  for (const match of source.matchAll(WRAPPER_IMPORT_RE)) {
    const name = match[1];
    if (!name) continue;
    // Só wrappers / shells compartilhados — não o próprio arquivo
    if (
      /SoftLens|StepLadder|SoftStack|Shared|ProtocolCarousel|MeshReveal|Footer|TrapReveal/i.test(
        name,
      )
    ) {
      wrappers.add(name);
    }
  }
  // JSX usage of known shells even without matching import path heuristics
  for (const shell of [
    'GoldenRuleSoftLensBoard',
    'LogicFlowStepLadder',
    'LogicFlowSoftStack',
    'CriancaSharedTrapArena',
    'CriancaSharedConceptMaps',
  ]) {
    if (source.includes(`<${shell}`) || source.includes(`${shell} `)) {
      wrappers.add(shell);
    }
  }
  return [...wrappers].sort();
}

function extractTopClasses(source: string, limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const match of source.matchAll(CLASS_TOKEN_RE)) {
    const chunk = match[1] ?? '';
    for (const token of chunk.match(TAILWIND_TOKEN_RE) ?? []) {
      // Normaliza valores dinâmicos grosseiros
      const norm = token.replace(/\[\d+[^\]]*\]/g, '[n]');
      counts.set(norm, (counts.get(norm) ?? 0) + 1);
    }
  }
  // Also scan template literals loosely
  for (const token of source.match(TAILWIND_TOKEN_RE) ?? []) {
    const norm = token.replace(/\[\d+[^\]]*\]/g, '[n]');
    counts.set(norm, (counts.get(norm) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([k]) => k);
}

function buildSignature(parts: {
  family: string;
  props: string[];
  wrappers: string[];
  topClasses: string[];
}): string {
  const propKey = parts.props.join(',') || '∅';
  const wrapKey = parts.wrappers.join(',') || '∅';
  // Classes: top 6 only in signature to absorb small style drift
  const classKey = parts.topClasses.slice(0, 6).join(',') || '∅';
  return `${parts.family}|props:${propKey}|wrap:${wrapKey}|cls:${classKey}`;
}

export function scanVariantFileSignatures(
  variantsDir = resolve(process.cwd(), 'components/slides/variants'),
): VariantFileSignature[] {
  const files = readdirSync(variantsDir)
    .filter((f) => f.endsWith('.tsx'))
    .sort();

  const out: VariantFileSignature[] = [];
  for (const file of files) {
    const full = join(variantsDir, file);
    const source = readFileSync(full, 'utf8');
    const fileBase = file.replace(/\.tsx$/, '');
    const family = detectFamily(fileBase);
    const props = extractProps(source);
    const wrappers = extractWrappers(source);
    const topClasses = extractTopClasses(source);
    const signature = buildSignature({ family, props, wrappers, topClasses });
    out.push({
      file,
      exportName: extractExportName(source, fileBase),
      family,
      props,
      wrappers,
      topClasses,
      signature,
      lineCount: source.split('\n').length,
    });
  }
  return out;
}

export function buildVariantSimilarityReport(
  variantsDir = resolve(process.cwd(), 'components/slides/variants'),
): VariantSimilarityReport {
  const signatures = scanVariantFileSignatures(variantsDir);
  const bySig = new Map<string, VariantFileSignature[]>();
  for (const sig of signatures) {
    const list = bySig.get(sig.signature) ?? [];
    list.push(sig);
    bySig.set(sig.signature, list);
  }

  const clusters: VariantSimilarityCluster[] = [];
  let singletonCount = 0;
  let fusionCandidateCount = 0;
  let idx = 0;

  for (const [signature, files] of [...bySig.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  )) {
    idx += 1;
    const size = files.length;
    if (size === 1) singletonCount += 1;

    const sharedWrappers = intersectAll(files.map((f) => f.wrappers));
    const sharedProps = intersectAll(files.map((f) => f.props));
    const family = files[0]?.family ?? 'other';
    const notes: string[] = [];

    // Candidato a fusão: ≥2 arquivos, mesma família de sufixo, props parecidas
    const fusionCandidate =
      size >= 2 &&
      family !== 'other' &&
      (sharedWrappers.length > 0 || sharedProps.filter((p) => p !== 'theme').length >= 2);

    if (fusionCandidate) fusionCandidateCount += 1;
    if (size >= 2 && sharedWrappers.length === 0 && family.endsWith('TrapArena')) {
      notes.push('TrapArena sem wrapper compartilhado detectado - revisar manualmente.');
    }
    if (size >= 2 && sharedWrappers.includes('GoldenRuleSoftLensBoard')) {
      notes.push('Thin SoftLens wrappers - fusao tipicamente 1 prop de hintProfile/accent.');
    }
    if (size >= 2 && sharedWrappers.includes('LogicFlowStepLadder')) {
      notes.push('Thin StepLadder wrappers - fusao tipicamente 1 prop de accent.');
    }

    clusters.push({
      cluster_id: `c${String(idx).padStart(3, '0')}`,
      signature,
      family,
      size,
      fusion_candidate: fusionCandidate,
      files: files.map((f) => f.file).sort(),
      shared_wrappers: sharedWrappers,
      shared_props: sharedProps,
      notes,
    });
  }

  return {
    generated_at: new Date().toISOString(),
    variants_dir: variantsDir,
    files_scanned: signatures.length,
    clusters,
    singleton_count: singletonCount,
    fusion_candidate_count: fusionCandidateCount,
  };
}

function intersectAll(lists: string[][]): string[] {
  if (lists.length === 0) return [];
  let acc = new Set(lists[0]);
  for (let i = 1; i < lists.length; i++) {
    const next = new Set(lists[i]);
    acc = new Set([...acc].filter((x) => next.has(x)));
  }
  return [...acc].sort();
}

export function renderVariantSimilarityMarkdown(report: VariantSimilarityReport): string {
  const fusion = report.clusters.filter((c) => c.fusion_candidate);
  const lines: string[] = [
    '# Variant similarity - clusters estruturais',
    '',
    `Gerado em: ${report.generated_at}`,
    `Arquivos: ${report.files_scanned}`,
    `Clusters: ${report.clusters.length}`,
    `Singletons: ${report.singleton_count}`,
    `Candidatos a fusao: ${report.fusion_candidate_count}`,
    '',
    'Assinatura = `family|props|wrappers|top-classes`. Diferencas de rotulo/cor pequenas ainda podem fundir na Onda 3 se o gesto pedagogico for o mesmo.',
    '',
    '## Candidatos a fusao (size >= 2)',
    '',
  ];

  if (fusion.length === 0) {
    lines.push('_Nenhum cluster candidato com os heuristicos atuais._', '');
  } else {
    for (const c of fusion) {
      lines.push(`### ${c.cluster_id} - ${c.family} (n=${c.size})`);
      lines.push('');
      lines.push(`- signature: \`${c.signature}\``);
      if (c.shared_wrappers.length) {
        lines.push(`- wrappers: ${c.shared_wrappers.map((w) => `\`${w}\``).join(', ')}`);
      }
      if (c.shared_props.length) {
        lines.push(`- props: ${c.shared_props.map((p) => `\`${p}\``).join(', ')}`);
      }
      for (const n of c.notes) lines.push(`- nota: ${n}`);
      lines.push('- arquivos:');
      for (const f of c.files) lines.push(`  - \`${f}\``);
      lines.push('');
    }
  }

  lines.push('## Todos os clusters (resumo)', '');
  lines.push('| id | family | size | fusion? | files (sample) |');
  lines.push('|----|--------|-----:|:-------:|----------------|');
  for (const c of report.clusters) {
    const sample = c.files.slice(0, 3).join(', ') + (c.files.length > 3 ? `, +${c.files.length - 3}` : '');
    lines.push(
      `| ${c.cluster_id} | ${c.family} | ${c.size} | ${c.fusion_candidate ? 'yes' : ''} | ${sample} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}
