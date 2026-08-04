/**
 * Auditoria pedagógica + risco visual nos pacotes flagship (lote local).
 *
 *   npx tsx scripts/audit-pedagogy-visual-flagships.ts
 *
 * Saída: artifacts/pedagogy-visual-flagship-audit.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  enrichPresentationContext,
  resolveSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';
import {
  gradePedagogicalNote,
} from '@/lib/neurocanvas/pedagogicalNote';
import { isBespokeLayoutVariant } from '@/lib/slides/moldAffinity';
import { detectMoldL3Mismatch } from '@/lib/slides/detectMoldL3Mismatch';
import { PROTOCOL_TAP_BUDGET } from '@/lib/slides/protocolTapBudget';

const FLAGSHIPS: { name: string; dirs: string[] }[] = [
  {
    name: 'Saúde do Adolescente',
    dirs: [
      'data/catalog-migration/saude-adolescente-completo/questions',
      'data/catalog-migration/saude-adolescente-g01/questions',
    ],
  },
  {
    name: 'Farmacodinâmica e Farmacocinética',
    dirs: [
      'data/catalog-migration/farmacodinamica-e-farmacocinetica-completo/questions',
      'data/catalog-migration/farmacodinamica-e-farmacocinetica-g01/questions',
    ],
  },
  {
    name: 'Imunização',
    dirs: [
      'data/catalog-migration/imunizacao-completo/questions',
      'data/catalog-migration/imunizacao-g01/questions',
    ],
  },
  {
    name: 'Vias de Administração',
    dirs: [
      'data/catalog-migration/vias-de-administracao-completo/questions',
      'data/catalog-migration/vias-de-administracao-g01/questions',
    ],
  },
];

type SlugRow = {
  package: string;
  slug: string;
  branch?: string;
  family?: string;
  pedagogy: 'pass' | 'warn' | 'fail';
  pedagogy_codes: string[];
  mold_zero: number;
  mold_issues: string[];
  bespoke_slides: number;
  high_tap_risk: boolean;
  logic_steps: number;
  variants: string[];
};

function loadDir(dir: string) {
  const abs = resolve(dir);
  if (!existsSync(abs)) return [] as { slug: string; q: Record<string, unknown> }[];
  return readdirSync(abs)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      slug: f.replace(/\.json$/, ''),
      q: JSON.parse(readFileSync(join(abs, f), 'utf8')) as Record<string, unknown>,
    }));
}

function summarize(pkg: string, rows: SlugRow[]) {
  const r = rows.filter((x) => x.package === pkg);
  const byPed = { pass: 0, warn: 0, fail: 0 };
  for (const x of r) byPed[x.pedagogy] += 1;
  const moldBad = r.filter((x) => x.mold_zero > 0);
  const highTap = r.filter((x) => x.high_tap_risk);
  const codeCounts: Record<string, number> = {};
  for (const x of r) {
    for (const c of x.pedagogy_codes) codeCounts[c] = (codeCounts[c] ?? 0) + 1;
  }
  return {
    package: pkg,
    slugs: r.length,
    pedagogy: byPed,
    mold_zero_slugs: moldBad.length,
    high_tap_risk_slugs: highTap.length,
    top_codes: Object.entries(codeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    worst: r
      .filter((x) => x.pedagogy === 'fail' || x.mold_zero > 0)
      .slice(0, 20)
      .map((x) => ({
        slug: x.slug,
        pedagogy: x.pedagogy,
        codes: x.pedagogy_codes,
        mold_zero: x.mold_zero,
        mold_issues: x.mold_issues,
        branch: x.branch,
        steps: x.logic_steps,
        variants: x.variants,
      })),
    high_tap_sample: highTap.slice(0, 12).map((x) => ({
      slug: x.slug,
      steps: x.logic_steps,
      branch: x.branch,
      variants: x.variants,
    })),
  };
}

function main() {
  const rows: SlugRow[] = [];
  const seen = new Set<string>();

  for (const pack of FLAGSHIPS) {
    let files: { slug: string; q: Record<string, unknown> }[] = [];
    for (const d of pack.dirs) {
      const loaded = loadDir(d);
      if (loaded.length) {
        files = loaded;
        break;
      }
    }

    for (const { slug, q } of files) {
      const key = `${pack.name}::${slug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const meta = (q.meta ?? {}) as {
        pedagogical_branch?: string;
        family?: string;
        subtopico?: string;
      };
      const findings = detectUnifiedPedagogy(q as never);
      const note = gradePedagogicalNote({ slug, findings });
      const mold = detectMoldL3Mismatch(q as never);
      const zero = mold.filter((m) => m.code === 'mold_l3_zero_slots');
      const slides = ((q.reverse_study_slides ?? q.study_slides ?? []) as Record<
        string,
        unknown
      >[]);
      const instruction = String(
        (q.question_data as { instruction?: string } | undefined)?.instruction ?? '',
      );

      let bespoke = 0;
      let highTap = false;
      let logicSteps = 0;
      const variants: string[] = [];

      slides.forEach((slide, slideIndex) => {
        const ctx = enrichPresentationContext(
          {
            questionSlug: slug,
            slideIndex,
            familyId: meta.family as never,
          },
          slide.meta as { subtopico?: string } | undefined,
          instruction,
          slides as never,
          meta,
        );
        const resolved = resolveSlidePresentation(slide as never, ctx);
        variants.push(`${slide.type}:${resolved.layoutVariant}`);
        if (isBespokeLayoutVariant(resolved.layoutVariant)) {
          bespoke += 1;
          if (
            /juggle|weave|curtain|spectrum|hub|orbit|mesh-reveal/i.test(
              resolved.layoutVariant,
            )
          ) {
            highTap = true;
          }
          if (
            /tap-flow|juggle|weave|elimination-tap|isolate-tap|classify-tap/i.test(
              resolved.layoutVariant,
            ) &&
            Array.isArray(slide.steps) &&
            slide.steps.length > PROTOCOL_TAP_BUDGET
          ) {
            highTap = true;
          }
        }
        if (slide.type === 'logic_flow' && Array.isArray(slide.steps)) {
          logicSteps = Math.max(logicSteps, slide.steps.length);
          // vertical genérico com muitos steps também custa atenção
          if (
            (!isBespokeLayoutVariant(resolved.layoutVariant) ||
              /vertical|cards|horizontal/i.test(resolved.layoutVariant)) &&
            slide.steps.length > PROTOCOL_TAP_BUDGET + 3
          ) {
            highTap = true;
          }
        }
      });

      rows.push({
        package: pack.name,
        slug,
        branch: meta.pedagogical_branch,
        family: meta.family,
        pedagogy: note.grade,
        pedagogy_codes: [...new Set(findings.map((f) => f.code))],
        mold_zero: zero.length,
        mold_issues: [...new Set(mold.map((m) => m.code))],
        bespoke_slides: bespoke,
        high_tap_risk: highTap || logicSteps > 6,
        logic_steps: logicSteps,
        variants,
      });
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    scope: 'flagships_local_lote',
    packages: FLAGSHIPS.map((p) => summarize(p.name, rows)),
    totals: {
      slugs: rows.length,
      pedagogy_fail: rows.filter((r) => r.pedagogy === 'fail').length,
      pedagogy_warn: rows.filter((r) => r.pedagogy === 'warn').length,
      pedagogy_pass: rows.filter((r) => r.pedagogy === 'pass').length,
      mold_zero: rows.filter((r) => r.mold_zero > 0).length,
      high_tap: rows.filter((r) => r.high_tap_risk).length,
    },
    rows,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/pedagogy-visual-flagship-audit.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        out,
        totals: report.totals,
        packages: report.packages.map((p) => ({
          package: p.package,
          slugs: p.slugs,
          pedagogy: p.pedagogy,
          mold_zero_slugs: p.mold_zero_slugs,
          high_tap: p.high_tap_risk_slugs,
          top_codes: p.top_codes,
          worst_n: p.worst.length,
        })),
      },
      null,
      2,
    ),
  );
}

main();
