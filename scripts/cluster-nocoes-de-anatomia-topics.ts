#!/usr/bin/env tsx
/**
 * Clusteriza questões de Noções de Anatomia por tema pedagógico.
 * Pré-requisito: export em data/catalog-migration/<lote>/questions/
 *
 * Uso:
 *   npm run cluster:nocoes-de-anatomia
 *   npm run cluster:nocoes-de-anatomia -- --lote=nocoes-de-anatomia-completo
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const SUBTOPICO = 'Noções de Anatomia';

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'Terminologia / posição anatômica': 'anatomia_terminologia',
  'Planos e eixos': 'anatomia_planos',
  'Cavidades e órgãos': 'anatomia_cavidades_orgaos',
  'Sistemas e organização': 'anatomia_sistemas',
  'Certo/errado / EXCETO': 'anatomia_generico',
  'Default — sem âncora temática': 'anatomia_generico',
};

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferCluster(instruction: string, options: QuestionOption[], family: FamilyId): string {
  const blob = corpus(instruction, options);

  if (
    /anterior|posterior|ventral|dorsal|cranial|caudal|medial|lateral|proximal|distal|superior|inferior|posi[cç][aã]o anat/.test(
      blob,
    )
  ) {
    return 'Terminologia / posição anatômica';
  }
  if (/plano|sagital|frontal|coronal|transverso|horizontal|axial|eixo/.test(blob)) {
    return 'Planos e eixos';
  }
  if (
    /cavidade|quadrante|mediastino|hipoc[oô]ndrio|f[ií]gado|ba[cç]o|est[oô]mago|ap[eê]ndice|localiza[cç][aã]o/.test(
      blob,
    )
  ) {
    return 'Cavidades e órgãos';
  }
  if (
    /sistema|cardiovascular|respirat|digest|urin[aá]rio|nervoso|end[oó]crino|musculoesquel|c[eé]lula|tecido|n[ií]veis de organiza/.test(
      blob,
    )
  ) {
    return 'Sistemas e organização';
  }
  if (family === 'certo_errado' || /exceto|incorreta|errada/.test(blob)) {
    return 'Certo/errado / EXCETO';
  }
  return 'Default — sem âncora temática';
}

type Accum = { count: number; slugs: string[]; families: Record<string, number> };

async function main() {
  const lote = parseArg('lote') ?? 'nocoes-de-anatomia-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);

  if (!existsSync(questionsDir)) {
    console.error(
      `[cluster:nocoes-de-anatomia] Pasta ausente: ${questionsDir}\n` +
        `Exporte antes:\n` +
        `  npm run catalog:export-lote -- --lote=${lote} --from-manifest=data/catalog-migration/nocoes-de-anatomia-completo/manifest.json`,
    );
    process.exit(1);
  }

  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
  const clusterMap = new Map<string, Accum>();
  const rows: Array<Record<string, unknown>> = [];

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string };
    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, String(meta.subtopico ?? SUBTOPICO), options, '');
    const cluster = inferCluster(instruction, options, family);
    const branch = CLUSTER_TO_BRANCH[cluster] ?? 'anatomia_generico';

    rows.push({
      modulo_slug: slug,
      banca: meta.banca ?? null,
      family,
      pedagogical_cluster: cluster,
      pedagogical_branch_proposed: branch,
      instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? { count: 0, slugs: [], families: {} };
    acc.count += 1;
    acc.slugs.push(slug);
    acc.families[family] = (acc.families[family] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));
  const summary = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = total ? Math.round((stats.count / total) * 1000) / 10 : 0;
      const branch = CLUSTER_TO_BRANCH[cluster] ?? 'anatomia_generico';
      const strong = stats.count >= strongThreshold;
      return {
        cluster,
        count: stats.count,
        pct,
        pedagogical_branch_proposed: branch,
        strong_branch: strong,
        decision_suggested: strong
          ? branch === 'anatomia_generico'
            ? 'ok_generico'
            : 'molde_redesign'
          : 'ok_generico',
        sample_slugs: stats.slugs.slice(0, 5),
        families: stats.families,
      };
    })
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    summary,
    rows,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'nocoes-de-anatomia-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:nocoes-de-anatomia] total=${total} clusters=${summary.length}`);
  for (const s of summary) {
    console.log(
      `  ${s.count.toString().padStart(3)} (${String(s.pct).padStart(4)}%)  ${s.cluster} → ${s.pedagogical_branch_proposed} [${s.decision_suggested}]`,
    );
  }
  console.log(`[cluster:nocoes-de-anatomia] wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
