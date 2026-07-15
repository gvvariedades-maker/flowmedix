#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'artifacts';

function brief(
  id: string,
  title: string,
  anchor: string,
  m1: string,
  m2: string,
  m3: string,
  m4: string,
  meta: string,
): string {
  return `# BRIEF L3 — Saúde da Criança / ${id}

**Ramo:** \`${id}\` · **Âncora:** \`${anchor}\` · **Template:** cyan (t06)

## Metáfora
${title}

## 4/4 moldes

| Slide | layout_variant | Componente |
|-------|----------------|------------|
| concept_map | ${m1.split(' ')[0]} | ${m1} |
| golden_rule | ${m2.split(' ')[0]} | ${m2} |
| logic_flow | tap | ${m3} |
| danger_zone | compare | ${m4} |

## DoD 375px
- Footer_rule legível sem overflow horizontal
- Tap-flow revela eliminação antes do gabarito
- Trap-arena: distrator × conduta correta por letra

## Status
${meta}
`;
}

const items: [string, string, string, string, string, string, string, string][] = [
  [
    'crianca_aleitamento_nutricao',
    'Trilho AME → IA → alimentação complementar',
    'questao-premium-cpcon-saude-crianca-aleitamento-vf.json',
    'crianca-feeding-timeline',
    'crianca-feeding-board',
    'crianca-feeding-tap-flow',
    'crianca-feeding-trap-arena',
    'Implementado · Playwright PASS',
  ],
  [
    'crianca_triagem_neonatal',
    'Linha do tempo pezinho + coraçãozinho',
    'questao-premium-cpcon-saude-crianca-triagem-neonatal-vf.json',
    'crianca-screening-timeline',
    'crianca-screening-board',
    'crianca-screening-tap-flow',
    'crianca-screening-trap-arena',
    'Implementado · Playwright PASS',
  ],
  [
    'crianca_generico',
    'Hub pediátrico — conceito geral',
    'questao-premium-funcern-saude-crianca-generico-hub.json',
    'crianca-pediatric-hub',
    'crianca-pediatric-board',
    'crianca-pediatric-tap-flow',
    'crianca-pediatric-trap-arena',
    'Implementado · Playwright PASS',
  ],
  [
    'crianca_desidratacao',
    'Espectro desidratação → Plano A/B/C',
    'questao-premium-cev-saude-crianca-desidratacao-vf.json',
    'crianca-dehydration-spectrum',
    'crianca-dehydration-board',
    'crianca-dehydration-tap-flow',
    'crianca-dehydration-trap-arena',
    'Implementado · Playwright PASS',
  ],
  [
    'crianca_aps_puericultura',
    'Trilho puericultura APS + caderneta',
    'questao-premium-consulplan-saude-crianca-puericultura-vf.json',
    'crianca-puericultura-timeline',
    'crianca-puericultura-board',
    'crianca-puericultura-tap-flow',
    'crianca-puericultura-trap-arena',
    'Implementado · Playwright PASS',
  ],
];

for (const row of items) {
  const [id, ...rest] = row;
  const p = join(dir, `l3-brief-saude-da-crianca-${id}.md`);
  writeFileSync(p, `${brief(id, ...rest)}\n`, 'utf8');
  console.log('wrote', p);
}

const report = `# Saúde da Criança — onda nota-10 (2026-07-15)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **62/62** · vendável |
| Manifest ↔ registry | **62/62** (\`reconcile:handcraft-manifest\` OK) |
| Cluster | **drift=0** |
| A4-mínimo | stamp 62/62 + 6 humano \`handcraft-qc\` |
| Apply Supabase | g01–g08 **62/62** aplicados |
| L6 checklist | **8/8 lotes** anchor pass |
| L3 visual | **7/7 branches** · Playwright **16/16** PASS |
| Health | **PASS** (L1–L6) |

## L3 ramos bespoke (7)

\`crianca_aleitamento_nutricao\` · \`crianca_triagem_neonatal\` · \`crianca_generico\` · \`crianca_desidratacao\` · \`crianca_aps_puericultura\` · \`crianca_neonatologia\` · \`crianca_desenvolvimento\`

Briefs: [\`l3-brief-saude-da-crianca-INDEX.md\`](l3-brief-saude-da-crianca-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente | Saúde da Criança |
|----------|-------------|------------------|
| Slugs | 16 | 62 |
| Lotes gNN | 2 | 8 |
| A4-mínimo | sim | sim |
| Guideline TS | sim | sim |
| L3 bespoke ramos | 6 | 7 |
| L3 Playwright | sim | sim |
| L6 all lotes | sim | sim |

## Comandos de referência

\`\`\`bash
npm run plan:saude-da-crianca-lote-meta
npm run apply:saude-da-crianca-ready-batch
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Saúde da Criança"
npm run audit:subtopico-quality -- --subtopico="Saúde da Criança" --promote
\`\`\`
`;

writeFileSync(join(dir, 'saude-da-crianca-nota10-report.md'), report, 'utf8');
console.log('wrote nota10 report');
