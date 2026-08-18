/**
 * Scorecard CSV — todas as variantes NeuroSlides (gesto + custo de clique + ramos).
 * Uso: npx tsx scripts/audit-variant-click-scorecard.ts
 * Saída: artifacts/neuroslides-variant-click-scorecard.csv
 *         artifacts/neuroslides-variant-click-scorecard.md (resumo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { BRANCH_DESIGN_MAP } from '../lib/slides/pedagogicalBranch';
import { DANGER_ZONE_VARIANT_CAPABILITIES } from '../components/slides/registry/dangerZoneCapabilities';

/** Extrai chaves do registry sem importar next/dynamic (CLI-safe). */
function parseRegistryKeys(filePath: string, constName: string): string[] {
  const src = fs.readFileSync(filePath, 'utf8');
  const start = src.indexOf(`export const ${constName}`);
  if (start < 0) throw new Error(`const ${constName} not found in ${filePath}`);
  const brace = src.indexOf('{', start);
  let depth = 0;
  let end = brace;
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = src.slice(brace, end + 1);
  const keys = [...body.matchAll(/^\s*'([^']+)'\s*:/gm)].map((m) => m[1]);
  return [...new Set(keys)];
}

type SlideType = 'concept_map' | 'logic_flow' | 'golden_rule' | 'danger_zone';
type Gesture =
  | 'funnel'
  | 'rail'
  | 'timeline'
  | 'arena_trap'
  | 'matrix_board'
  | 'deck'
  | 'spectrum'
  | 'curtain_gate'
  | 'weave_juggle'
  | 'orbit_hub'
  | 'compare'
  | 'list_cards'
  | 'reference_table'
  | 'generic'
  | 'other';
type ClickCost = 'low' | 'medium' | 'high';

type Row = {
  slide_type: SlideType;
  layout_variant: string;
  source: 'bespoke' | 'generic';
  gesture: Gesture;
  click_cost: ClickCost;
  click_score: number;
  tap_reveal_default: 'yes' | 'no' | 'n/a';
  branches: string;
  branch_count: number;
  notes: string;
};

const GENERIC: Record<SlideType, string[]> = {
  concept_map: ['grid', 'morphological', 'molecular', 'bridge', 'stack'],
  logic_flow: ['vertical', 'horizontal', 'cards'],
  golden_rule: ['center', 'compact', 'minimal', 'banner', 'reference_table'],
  danger_zone: ['list', 'compare', 'cards', 'compact'],
};

function inferGesture(id: string, type: SlideType): Gesture {
  const s = id.toLowerCase();
  if (/curtain|consent-gate/.test(s)) return 'curtain_gate';
  if (/weave|juggle/.test(s)) return 'weave_juggle';
  if (/funnel/.test(s)) return 'funnel';
  if (/spectrum/.test(s)) return 'spectrum';
  // Tap-flows de eliminação/decisão = gesto de funil/trilho (ordem de testes)
  if (
    /tap-flow|elimination-tap|decision-tap|classify-tap|calc-tap|translate-tap|soft-stack|exceto-tap|vf-tap|cold-chain-tap|prenatal-tap|labor-tap|mama-tap|puerperio-tap|planejamento-tap|screening-tap|feeding-tap|pediatric-tap|dehydration-tap|puericultura-tap|neonatal-tap|dev-tap|protocol-tap/.test(
      s,
    )
  ) {
    return 'funnel';
  }
  if (/timeline|calendar/.test(s)) return 'timeline';
  if (
    /rail|trilho|ladder|journey|chain|xabcde|z-rail|z-band|z-classify|z-threshold|adme|absorption|puncture-rail|fall-risk|network-rail|milestones|temperature-rail/.test(
      s,
    )
  ) {
    return 'rail';
  }
  if (
    /matrix|board|reference|nine-rights|interval-matrix|match-matrix|term-matrix|gauge-matrix|responsibility-matrix|mesh-reveal|norm-reveal|soft-lens/.test(
      s,
    )
  ) {
    return 'matrix_board';
  }
  if (/arena|trap|mismatch|intruder|swap|break-trap|coercion|chips/.test(s)) return 'arena_trap';
  if (
    /deck|carousel|panel|layers|tissue|station|signal-deck|phase-deck|rules-deck|survival|emergency-hub|vitals-panel|procedure-protocol|documentation|duel|pillars/.test(
      s,
    )
  ) {
    return 'deck';
  }
  if (/orbit|hub/.test(s)) return 'orbit_hub';
  if (type === 'danger_zone' && (s === 'compare' || /compare/.test(s))) return 'compare';
  if (type === 'golden_rule' && (s === 'reference_table' || /reference_table/.test(s))) {
    return 'reference_table';
  }
  if (
    /list|cards|vertical|horizontal|stack|bridge|grid|morphological|molecular|center|compact|minimal|banner/.test(
      s,
    )
  ) {
    return 'list_cards';
  }
  if (GENERIC[type].includes(id)) return 'generic';
  return 'other';
}

function inferClickCost(
  id: string,
  type: SlideType,
  gesture: Gesture,
): { cost: ClickCost; score: number; notes: string } {
  const s = id.toLowerCase();
  const notes: string[] = [];

  // Explicit high-ceremony
  if (/curtain|consent-gate|weave|juggle|spectrum/.test(s)) {
    notes.push('cerimônia multi-tap');
    return { cost: 'high', score: 3, notes: notes.join('; ') };
  }
  if (gesture === 'curtain_gate' || gesture === 'weave_juggle' || gesture === 'spectrum') {
    notes.push('gesto high-click');
    return { cost: 'high', score: 3, notes: notes.join('; ') };
  }

  // logic_flow tap families
  if (type === 'logic_flow') {
    if (/tap-flow|elimination-tap|decision-tap|classify-tap|calc-tap|translate-tap|soft-stack/.test(s)) {
      notes.push('tap sequential (N steps)');
      return { cost: 'medium', score: 2, notes: notes.join('; ') };
    }
    if (s === 'vertical' || s === 'horizontal' || s === 'cards') {
      notes.push('genérico; custo = N steps do JSON');
      return { cost: 'medium', score: 2, notes: notes.join('; ') };
    }
  }

  // danger with tap reveal
  const dzCap = DANGER_ZONE_VARIANT_CAPABILITIES[id];
  if (type === 'danger_zone') {
    if (/gate|arena|trap|mismatch|chips|reveal/.test(s) || dzCap?.dangerTapReveal) {
      if (/consent-gate|portas|gate/.test(s)) {
        notes.push('1 tap por item/porta');
        return { cost: 'high', score: 3, notes: notes.join('; ') };
      }
      notes.push(dzCap?.dangerTapReveal ? 'dangerTapReveal' : 'arena/trap');
      return { cost: 'medium', score: 2, notes: notes.join('; ') };
    }
    if (s === 'list' || s === 'cards' || s === 'compact') {
      return { cost: 'low', score: 1, notes: 'scan sem reveal obrigatório' };
    }
    if (s === 'compare') {
      notes.push('tap reveal default no compare');
      return { cost: 'medium', score: 2, notes: notes.join('; ') };
    }
  }

  // concept_map
  if (type === 'concept_map') {
    if (/curtain|spectrum|hub|orbit|layers|duel/.test(s)) {
      return { cost: 'high', score: 3, notes: 'interação multi-camada' };
    }
    if (/rail|timeline|deck|matrix|funnel/.test(s)) {
      return { cost: 'medium', score: 2, notes: 'scan + possível micro-tap' };
    }
    return { cost: 'low', score: 1, notes: 'leitura/scan' };
  }

  // golden_rule boards — usually scan
  if (type === 'golden_rule') {
    if (/spectrum|carousel|mesh-reveal|lens/.test(s)) {
      return { cost: 'high', score: 3, notes: 'reveal/carousel' };
    }
    if (/board|matrix|rail|table/.test(s) || s === 'reference_table') {
      return { cost: 'low', score: 1, notes: 'tabela/board scanável' };
    }
    return { cost: 'low', score: 1, notes: 'leitura' };
  }

  return { cost: 'medium', score: 2, notes: 'default' };
}

function buildBranchIndex(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const add = (variant: string | undefined, branch: string) => {
    if (!variant) return;
    if (!map.has(variant)) map.set(variant, new Set());
    map.get(variant)!.add(branch);
  };

  for (const [_subKey, branches] of Object.entries(BRANCH_DESIGN_MAP)) {
    for (const [branchId, design] of Object.entries(branches ?? {})) {
      if (!design) continue;
      add(design.conceptMap, branchId);
      add(design.goldenRule, branchId);
      add(design.logicFlow, branchId);
      add(design.dangerZone, branchId);
    }
  }
  return map;
}

function csvEscape(v: string | number): string {
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function collectVariants(): { type: SlideType; id: string; source: 'bespoke' | 'generic' }[] {
  const root = process.cwd();
  const bespoke: { type: SlideType; file: string; constName: string }[] = [
    {
      type: 'concept_map',
      file: 'components/slides/registry/conceptMap.ts',
      constName: 'CONCEPT_MAP_REGISTRY',
    },
    {
      type: 'logic_flow',
      file: 'components/slides/registry/logicFlow.ts',
      constName: 'LOGIC_FLOW_REGISTRY',
    },
    {
      type: 'golden_rule',
      file: 'components/slides/registry/goldenRule.ts',
      constName: 'GOLDEN_RULE_REGISTRY',
    },
    {
      type: 'danger_zone',
      file: 'components/slides/registry/dangerZone.ts',
      constName: 'DANGER_ZONE_REGISTRY',
    },
  ];

  const out: { type: SlideType; id: string; source: 'bespoke' | 'generic' }[] = [];
  const seen = new Set<string>();

  for (const entry of bespoke) {
    const keys = parseRegistryKeys(path.join(root, entry.file), entry.constName);
    for (const id of keys) {
      const k = `${entry.type}::${id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ type: entry.type, id, source: 'bespoke' });
    }
  }

  for (const type of Object.keys(GENERIC) as SlideType[]) {
    for (const id of GENERIC[type]) {
      const k = `${type}::${id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ type, id, source: 'generic' });
    }
  }

  return out;
}

function main() {
  const branchIndex = buildBranchIndex();
  const variants = collectVariants();
  const rows: Row[] = [];

  for (const { type, id, source } of variants) {
    const gesture = inferGesture(id, type);
    const { cost, score, notes } = inferClickCost(id, type, gesture);
    const branches = [...(branchIndex.get(id) ?? [])].sort();
    const tapDefault =
      type === 'danger_zone'
        ? DANGER_ZONE_VARIANT_CAPABILITIES[id]?.dangerTapReveal
          ? 'yes'
          : 'no'
        : type === 'logic_flow'
          ? /tap|juggle|weave|flow|stack/.test(id)
            ? 'yes'
            : 'n/a'
          : 'n/a';

    rows.push({
      slide_type: type,
      layout_variant: id,
      source,
      gesture,
      click_cost: cost,
      click_score: score,
      tap_reveal_default: tapDefault,
      branches: branches.join('|') || '(não mapeado em BRANCH_DESIGN_MAP)',
      branch_count: branches.length,
      notes,
    });
  }

  rows.sort((a, b) => {
    if (a.click_score !== b.click_score) return b.click_score - a.click_score;
    if (a.slide_type !== b.slide_type) return a.slide_type.localeCompare(b.slide_type);
    return a.layout_variant.localeCompare(b.layout_variant);
  });

  const header = [
    'slide_type',
    'layout_variant',
    'source',
    'gesture',
    'click_cost',
    'click_score',
    'tap_reveal_default',
    'branch_count',
    'branches',
    'notes',
  ];

  const csvLines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.slide_type,
        r.layout_variant,
        r.source,
        r.gesture,
        r.click_cost,
        r.click_score,
        r.tap_reveal_default,
        r.branch_count,
        r.branches,
        r.notes,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ];

  const outCsv = path.join('artifacts', 'neuroslides-variant-click-scorecard.csv');
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync(outCsv, '\uFEFF' + csvLines.join('\n') + '\n', 'utf8');

  // Summary markdown
  const byType = (t: SlideType) => rows.filter((r) => r.slide_type === t);
  const byCost = (c: ClickCost) => rows.filter((r) => r.click_cost === c);
  const byGesture = () => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.gesture, (m.get(r.gesture) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const highUnmapped = rows.filter(
    (r) => r.click_cost === 'high' && r.branch_count === 0,
  ).length;

  const md = `# NeuroSlides — scorecard de variantes (gesto × clique × ramo)

Gerado por \`scripts/audit-variant-click-scorecard.ts\`.

**CSV:** [\`neuroslides-variant-click-scorecard.csv\`](./neuroslides-variant-click-scorecard.csv)

## Totais

| Métrica | Valor |
|---------|------:|
| Variantes (bespoke + genéricos) | ${rows.length} |
| concept_map | ${byType('concept_map').length} |
| logic_flow | ${byType('logic_flow').length} |
| golden_rule | ${byType('golden_rule').length} |
| danger_zone | ${byType('danger_zone').length} |
| click **high** (score 3) | ${byCost('high').length} |
| click **medium** (score 2) | ${byCost('medium').length} |
| click **low** (score 1) | ${byCost('low').length} |
| high sem ramo no BRANCH_DESIGN_MAP | ${highUnmapped} |

## Por gesto

| Gesto | Qtde |
|-------|-----:|
${byGesture()
  .map(([g, n]) => `| ${g} | ${n} |`)
  .join('\n')}

## Top high-click (mapeados a ramo)

| Tipo | Variante | Ramos |
|------|----------|-------|
${rows
  .filter((r) => r.click_cost === 'high' && r.branch_count > 0)
  .slice(0, 25)
  .map((r) => `| ${r.slide_type} | \`${r.layout_variant}\` | ${r.branches.replace(/\|/g, ', ')} |`)
  .join('\n')}

## Legenda click_cost

| Nível | Score | Significado |
|-------|------:|------------|
| low | 1 | Scan / tabela / cards sem reveal obrigatório |
| medium | 2 | Tap sequential (N steps) ou arena 1-tap/item |
| high | 3 | Cortina, weave/juggle, espectro, consent-gate / multi-camada |

**Nota:** custo real do \`logic_flow\` também depende do nº de \`steps\` no JSON (handcraft).
`;

  const outMd = path.join('artifacts', 'neuroslides-variant-click-scorecard.md');
  fs.writeFileSync(outMd, '\uFEFF' + md, 'utf8');

  console.log(`rows=${rows.length}`);
  console.log(`high=${byCost('high').length} medium=${byCost('medium').length} low=${byCost('low').length}`);
  console.log(`wrote ${outCsv}`);
  console.log(`wrote ${outMd}`);
}

main();
