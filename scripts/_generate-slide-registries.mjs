/**
 * One-shot generator: builds components/slides/registry/* from current routers.
 * Run: node scripts/_generate-slide-registries.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function parseNamedImports(src, fromPrefix) {
  /** @type {Map<string, { module: string, exportName: string }>} */
  const map = new Map();
  const re =
    /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const mod = m[3];
    if (m[1]) {
      for (const part of m[1].split(',')) {
        const cleaned = part.trim();
        if (!cleaned) continue;
        const [exportName, alias] = cleaned.split(/\s+as\s+/).map((s) => s.trim());
        const name = alias || exportName;
        map.set(name, { module: mod, exportName });
      }
    } else if (m[2]) {
      map.set(m[2], { module: mod, exportName: 'default' });
    }
  }
  return map;
}

function resolveRegistryModule(importPath, routerKind) {
  // Hub: ../variants/X → ../variants/X
  // Routers: ./X → ../variants/X ; ../core/X → ../core/X
  if (importPath.startsWith('../variants/')) return importPath;
  if (importPath.startsWith('./')) return `../variants/${importPath.slice(2)}`;
  if (importPath.startsWith('../core/')) return importPath;
  if (importPath.startsWith('@/')) return importPath;
  throw new Error(`Unexpected import path: ${importPath}`);
}

function extractIfBlocks(src) {
  const results = [];
  const ifRe =
    /if\s*\(\s*(?:layoutVariant|variant|explicitVariant)\s*===\s*['"]([^'"]+)['"](?:\s*\|\|\s*(?:layoutVariant|variant|explicitVariant)\s*===\s*['"]([^'"]+)['"])?[^)]*\)\s*\{/g;
  let m;
  while ((m = ifRe.exec(src))) {
    const ids = [m[1], m[2]].filter(Boolean);
    const start = m.index + m[0].length;
    const window = src.slice(start, start + 1500);
    const ret = window.match(/return\s*\(?\s*<([A-Z][A-Za-z0-9]*)/);
    if (!ret) continue;
    const comp = ret[1];
    const requiresRows = /rows\s*&&\s*rows\.length/.test(m[0] + window.slice(0, 80));
    const requiresItems = /items\s*&&\s*items\.length/.test(m[0] + window.slice(0, 80));
    for (const id of ids) {
      results.push({ id, comp, requiresRows, requiresItems });
    }
  }
  return results;
}

const TAP_REVEAL = new Set([
  'compare',
  'trap-reveal',
  'calendar-mismatch',
  'temperature-mismatch',
  'norm-reveal',
  'scope-trap',
  'route-trap',
  'dose-trap',
  'farmaco-trap',
  'farmaco-clinico-trap',
  'catheter-danger-arena',
  'lab-prep-trap',
  'lab-specimen-arena',
  'dressing-choice-arena',
  'vitals-classify-arena',
  'pni-trap-chips',
  'ist-trap-chips',
  'adolescent-consent-gate',
  'adolescent-z-threshold-trap',
  'burn-trap-arena',
  'trabalho-pep-trap-arena',
  'respiratorio-spo2-trap-arena',
  'mental-raps-trap-arena',
  'mental-crisis-coercion-trap',
  'peri-preop-trap-arena',
  'peri-srpa-trap-arena',
  'peri-protocol-trap-arena',
  'peri-vf-trap-chips',
  'urgencias-rcp-trap-arena',
  'urgencias-trauma-trap-arena',
  'urgencias-stroke-trap-arena',
  'urgencias-shock-trap-arena',
  'urgencias-choking-trap-arena',
  'urgencias-pediatric-trap-arena',
  'urgencias-manchester-trap',
  'itu-catheter-trap',
  'biosseg-trap-chips',
  'iv-label-swap-trap',
  'iv-gauge-mismatch-trap',
  'iv-exceto-intruder-trap',
  'iv-interval-swap-trap',
  'iv-order-invert-trap',
  'iv-bundle-break-trap',
  'pt-crase-trap-arena',
  'pt-clitic-trap-arena',
  'pt-comma-trap-arena',
  'pt-term-trap-arena',
  'pt-subject-trap-arena',
]);

const X_ICON_BULLET = new Set([
  'compare',
  'trap-reveal',
  'calendar-mismatch',
  'temperature-mismatch',
  'norm-reveal',
  'scope-trap',
  'route-trap',
  'dose-trap',
  'farmaco-trap',
  'farmaco-clinico-trap',
  'catheter-danger-arena',
  'lab-prep-trap',
  'lab-specimen-arena',
  'dressing-choice-arena',
  'vitals-classify-arena',
  'pni-trap-chips',
  'ist-trap-chips',
  'adolescent-consent-gate',
  'adolescent-z-threshold-trap',
  'burn-trap-arena',
  'trabalho-pep-trap-arena',
  'respiratorio-spo2-trap-arena',
  'mental-raps-trap-arena',
  'mental-crisis-coercion-trap',
  'urgencias-rcp-trap-arena',
  'urgencias-trauma-trap-arena',
  'urgencias-stroke-trap-arena',
  'urgencias-shock-trap-arena',
  'urgencias-choking-trap-arena',
  'urgencias-pediatric-trap-arena',
  'urgencias-manchester-trap',
  'mulher-prenatal-trap-arena',
  'mulher-parto-trap-arena',
  'mulher-screening-trap-arena',
  'mulher-mama-trap-arena',
  'crianca-feeding-trap-arena',
  'crianca-screening-trap-arena',
  'crianca-pediatric-trap-arena',
  'crianca-dehydration-trap-arena',
  'crianca-puericultura-trap-arena',
  'crianca-neonatal-trap-arena',
  'crianca-dev-trap-arena',
  'cam-certos-trap-arena',
  'cam-high-risk-trap-arena',
  'cam-exceto-trap-arena',
  'cam-documentacao-trap-arena',
  'iv-label-swap-trap',
  'iv-gauge-mismatch-trap',
  'iv-exceto-intruder-trap',
  'iv-interval-swap-trap',
  'iv-order-invert-trap',
  'iv-bundle-break-trap',
  'pt-crase-trap-arena',
  'pt-clitic-trap-arena',
  'pt-comma-trap-arena',
  'pt-term-trap-arena',
  'pt-subject-trap-arena',
]);

const SKIP_IDS = {
  hub: new Set(),
  golden: new Set(['reference_table', 'center', 'compact', 'minimal', 'banner']),
  logic: new Set(['horizontal', 'cards', 'vertical']),
  danger: new Set(['compare', 'list', 'cards', 'compact']),
};

const SKIP_COMPS = new Set(['React', 'ReferenceTableLayout', 'DangerZoneCompare']);

function buildEntries(kind, fileRel, importBase) {
  const src = fs.readFileSync(path.join(ROOT, fileRel), 'utf8');
  const imports = parseNamedImports(src);
  const blocks = extractIfBlocks(src);
  const skip = SKIP_IDS[kind];
  /** @type {Map<string, object>} */
  const entries = new Map();

  for (const b of blocks) {
    if (skip.has(b.id) || SKIP_COMPS.has(b.comp)) continue;
    const imp = imports.get(b.comp);
    if (!imp) {
      console.warn(`[${kind}] No import for ${b.comp} (id=${b.id})`);
      continue;
    }
    const modulePath = resolveRegistryModule(imp.module, kind);
    const capabilities =
      kind === 'danger'
        ? {
            dangerTapReveal: TAP_REVEAL.has(b.id),
            defaultBulletStyle: X_ICON_BULLET.has(b.id) ? 'x_icon' : undefined,
          }
        : undefined;
    entries.set(b.id, {
      id: b.id,
      exportName: imp.exportName,
      modulePath,
      requiresRows: b.requiresRows || undefined,
      requiresItems: b.requiresItems || (kind === 'danger' ? true : undefined),
      capabilities,
    });
  }

  // ensure sae-decision-tap (OR branch with dose-calc-tap)
  if (kind === 'logic' && entries.has('dose-calc-tap') && !entries.has('sae-decision-tap')) {
    entries.set('sae-decision-tap', { ...entries.get('dose-calc-tap'), id: 'sae-decision-tap' });
  }

  // Generic danger compare still needs capabilities for presentation (not a dynamic entry)
  return [...entries.values()];
}

function emitCapabilitiesFile(dangerEntries) {
  const allIds = new Set([...TAP_REVEAL, ...X_ICON_BULLET]);
  const lines = [
    '/**',
    ' * Capabilities de variantes danger_zone — dados puros (sem next/dynamic).',
    ' * Usado por slidePresentation / resolveDangerZoneRevealMode.',
    ' */',
    '',
    "export type DangerZoneBulletStyleCap = 'x_icon' | 'numbered';",
    '',
    'export type DangerZoneVariantCapabilities = {',
    '  /** Default premium: compareRevealMode tap (salvo reveal_mode explícito). */',
    '  dangerTapReveal?: boolean;',
    "  /** Default de bullet_style quando o JSON omite. */",
    '  defaultBulletStyle?: DangerZoneBulletStyleCap;',
    '};',
    '',
    'export const DANGER_ZONE_VARIANT_CAPABILITIES: Record<string, DangerZoneVariantCapabilities> = {',
  ];
  for (const id of [...allIds].sort()) {
    const tap = TAP_REVEAL.has(id);
    const xIcon = X_ICON_BULLET.has(id);
    const parts = [];
    if (tap) parts.push('dangerTapReveal: true');
    if (xIcon) parts.push("defaultBulletStyle: 'x_icon'");
    if (parts.length === 0) continue;
    lines.push(`  '${id}': { ${parts.join(', ')} },`);
  }
  lines.push('};');
  lines.push('');
  lines.push('export function getDangerZoneVariantCapabilities(');
  lines.push('  layoutVariant: string,');
  lines.push('): DangerZoneVariantCapabilities | undefined {');
  lines.push('  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant];');
  lines.push('}');
  lines.push('');
  lines.push('export function dangerZoneVariantUsesTapReveal(layoutVariant: string): boolean {');
  lines.push('  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant]?.dangerTapReveal === true;');
  lines.push('}');
  lines.push('');
  lines.push("export function dangerZoneVariantDefaultBulletStyle(layoutVariant: string): 'x_icon' | undefined {");
  lines.push("  return DANGER_ZONE_VARIANT_CAPABILITIES[layoutVariant]?.defaultBulletStyle === 'x_icon'");
  lines.push("    ? 'x_icon'");
  lines.push('    : undefined;');
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

function emitRegistryFile(kind, entries, exportName) {
  const title =
    kind === 'hub'
      ? 'concept_map'
      : kind === 'golden'
        ? 'golden_rule'
        : kind === 'logic'
          ? 'logic_flow'
          : 'danger_zone';

  const lines = [
    "'use client';",
    '',
    '/**',
    ` * Registry dinâmico — ${title} (bespoke). Genéricos ficam no router estático.`,
    ' * Gerado por scripts/_generate-slide-registries.mjs — editar com cuidado.',
    ' */',
    '',
    "import dynamic from 'next/dynamic';",
    "import type { ComponentType } from 'react';",
    "import { loadNamedVariant } from './loadVariant';",
    '',
    'export type BespokeVariantEntry = {',
    '  Component: ComponentType<any>;',
    '  requiresRows?: boolean;',
    '  requiresItems?: boolean;',
    '};',
    '',
  ];

  const varNames = [];
  for (const e of entries) {
    const safe = e.id.replace(/[^a-zA-Z0-9]+/g, '_');
    const varName = `Dyn_${safe}`;
    varNames.push({ varName, e });
    lines.push(`const ${varName} = dynamic(`);
    lines.push(
      `  () => loadNamedVariant(() => import('${e.modulePath}') as Promise<Record<string, unknown>>, '${e.exportName}'),`,
    );
    lines.push('  { ssr: true, loading: () => null },');
    lines.push(');');
    lines.push('');
  }

  const getterMap = {
    CONCEPT_MAP_REGISTRY: 'getConceptMapBespoke',
    GOLDEN_RULE_REGISTRY: 'getGoldenRuleBespoke',
    LOGIC_FLOW_REGISTRY: 'getLogicFlowBespoke',
    DANGER_ZONE_REGISTRY: 'getDangerZoneBespoke',
  };
  const getter = getterMap[exportName];

  lines.push(`export const ${exportName}: Record<string, BespokeVariantEntry> = {`);
  for (const { varName, e } of varNames) {
    const flags = [];
    if (e.requiresRows) flags.push('requiresRows: true');
    if (e.requiresItems) flags.push('requiresItems: true');
    const flagStr = flags.length ? `, ${flags.join(', ')}` : '';
    lines.push(`  '${e.id}': { Component: ${varName}${flagStr} },`);
  }
  lines.push('};');
  lines.push('');
  lines.push(
    `export function ${getter}(layoutVariant: string): BespokeVariantEntry | undefined {`,
  );
  lines.push(`  return ${exportName}[layoutVariant];`);
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

const outDir = path.join(ROOT, 'components/slides/registry');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'loadVariant.ts'),
  `/** Helper — named export → default para next/dynamic. */
export async function loadNamedVariant<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: string,
): Promise<{ default: T[keyof T] }> {
  const mod = await loader();
  const Comp = mod[exportName as keyof T];
  if (!Comp) {
    throw new Error(\`Variant export "\${exportName}" not found\`);
  }
  return { default: Comp };
}
`,
);

fs.writeFileSync(
  path.join(outDir, 'types.ts'),
  `export type { DangerZoneVariantCapabilities } from './dangerZoneCapabilities';
`,
);

const hubEntries = buildEntries('hub', 'components/slides/core/NeuroSlide.tsx');
const goldenEntries = buildEntries('golden', 'components/slides/variants/GoldenRule.tsx');
const logicEntries = buildEntries('logic', 'components/slides/variants/LogicFlow.tsx');
const dangerEntries = buildEntries('danger', 'components/slides/variants/DangerZone.tsx');

fs.writeFileSync(path.join(outDir, 'dangerZoneCapabilities.ts'), emitCapabilitiesFile(dangerEntries));
fs.writeFileSync(path.join(outDir, 'conceptMap.ts'), emitRegistryFile('hub', hubEntries, 'CONCEPT_MAP_REGISTRY'));
fs.writeFileSync(path.join(outDir, 'goldenRule.ts'), emitRegistryFile('golden', goldenEntries, 'GOLDEN_RULE_REGISTRY'));
fs.writeFileSync(path.join(outDir, 'logicFlow.ts'), emitRegistryFile('logic', logicEntries, 'LOGIC_FLOW_REGISTRY'));
fs.writeFileSync(path.join(outDir, 'dangerZone.ts'), emitRegistryFile('danger', dangerEntries, 'DANGER_ZONE_REGISTRY'));

fs.writeFileSync(
  path.join(outDir, 'index.ts'),
  `export { CONCEPT_MAP_REGISTRY, getConceptMapBespoke } from './conceptMap';
export { GOLDEN_RULE_REGISTRY, getGoldenRuleBespoke } from './goldenRule';
export { LOGIC_FLOW_REGISTRY, getLogicFlowBespoke } from './logicFlow';
export { DANGER_ZONE_REGISTRY, getDangerZoneBespoke } from './dangerZone';
export {
  DANGER_ZONE_VARIANT_CAPABILITIES,
  getDangerZoneVariantCapabilities,
  dangerZoneVariantUsesTapReveal,
  dangerZoneVariantDefaultBulletStyle,
} from './dangerZoneCapabilities';
`,
);

console.log('Generated registry files:');
console.log(`  conceptMap: ${hubEntries.length}`);
console.log(`  goldenRule: ${goldenEntries.length}`);
console.log(`  logicFlow: ${logicEntries.length}`);
console.log(`  dangerZone: ${dangerEntries.length}`);
console.log(`  capabilities: ${TAP_REVEAL.size} tap / ${X_ICON_BULLET.size} x_icon`);
console.log('Next: npx tsx scripts/generate-declared-variants-snapshot.ts');
