#!/usr/bin/env tsx
/**
 * Projeção de 2 telas (F7) em modo report — piloto Farmacodinâmica.
 *
 * Uso:
 *   npm run audit:lesson-projection                                  # subtópico piloto
 *   npm run audit:lesson-projection -- --subtopico="Imunização"      # outro pacote
 *   npm run audit:lesson-projection -- --file=examples/questao-x.json
 *   npm run audit:lesson-projection -- --dump=<slug>                 # projeção completa no stdout
 *
 * Não escreve conteúdo e não liga nada no player: `buildLessonProjection` é pura e a
 * exibição depende de `NEXT_PUBLIC_LESSON_PROJECTION=1`. A saída serve a duas coisas:
 * conferir a projeção slug a slug e ordenar a fila de expansão de fixação/transferência
 * (`grade` em `missing` → `thin` → `strong`).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { findPacoteBySubtopico, loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';
import {
  PRE_ANSWER_SLIDES,
  detectUnifiedPedagogy,
} from '@/lib/catalogMigration/unifiedPedagogyDetector';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildLessonProjection,
  gradeFixationCoverage,
  summarizeFixationCoverage,
  type FixationCoverage,
  type LessonProjection,
  type LessonProjectionInput,
} from '@/lib/lesson/lessonProjection';
import { LESSON_PROJECTION_PILOT_SUBTOPICOS } from '@/lib/lesson/lessonProjectionConfig';

const TAG = '[audit:lesson-projection]';

type Target = { slug: string; path: string };

function listPacoteLotes(pacotePrefix: string): string[] {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  return readdirSync(root)
    .filter((name) => {
      if (!name.startsWith(`${pacotePrefix}-g`)) return false;
      const dir = join(root, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, 'manifest.json'));
    })
    .sort();
}

function subtopicoTargets(subtopico: string): Target[] {
  const found = findPacoteBySubtopico(loadHandcraftRegistry(), subtopico);
  if (!found) throw new Error(`subtópico fora do registry: ${subtopico}`);

  const byslug = new Map<string, string>();
  for (const lote of listPacoteLotes(found.pacote.pacote_prefix)) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      // Lote mais recente vence — mesma precedência do audit de qualidade.
      byslug.set(file.replace(/\.json$/, ''), join(dir, file));
    }
  }
  return [...byslug.entries()].sort().map(([slug, path]) => ({ slug, path }));
}

function resolveTargets(): { corpus: string; targets: Target[] } {
  const file = parseArg('file');
  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/\\/g, '/').split('/').pop()!.replace(/\.json$/, '');
    return { corpus: `file:${file}`, targets: [{ slug, path }] };
  }

  const subtopico = parseArg('subtopico') ?? LESSON_PROJECTION_PILOT_SUBTOPICOS[0];
  return { corpus: subtopico, targets: subtopicoTargets(subtopico) };
}

type Row = {
  slug: string;
  coverage: FixationCoverage;
  projection: LessonProjection;
  /** Spoiler nos slides que viram tela Aula — anula o portão de predição. */
  pre_answer_spoilers: number;
};

/** A tela Aula vem antes do compromisso: spoiler ali entrega a letra de graça. */
function countPreAnswerSpoilers(payload: LessonProjectionInput): number {
  return detectUnifiedPedagogy(payload as never).filter(
    (finding) =>
      PRE_ANSWER_SLIDES.has(finding.slide) &&
      (finding.code === 'pedagogy_letter_spoiler' || finding.code === 'pedagogy_vf_verdict_spoiler'),
  ).length;
}

function renderMarkdown(corpus: string, rows: Row[]): string {
  const summary = summarizeFixationCoverage(rows.map((r) => r.coverage));
  const order = { missing: 0, thin: 1, strong: 2 } as const;
  const sorted = [...rows].sort((a, b) => order[a.coverage.grade] - order[b.coverage.grade]);

  const lines = [
    `# Projeção de 2 telas — ${corpus}`,
    '',
    `Slugs: **${summary.total}** · strong **${summary.strong}** · thin **${summary.thin}** · missing **${summary.missing}** · média de transferência **${summary.avg_transfer}**`,
    '',
    '| slug | fixação | transfer | cards c/ conduta | redundância removida | spoiler na Aula | diagnósticos |',
    '|---|---|---|---|---|---|---|',
  ];

  for (const { slug, coverage, projection, pre_answer_spoilers } of sorted) {
    lines.push(
      `| \`${slug}\` | ${coverage.grade} | ${coverage.transfer_count} | ${coverage.transferable_cards} | ` +
        `${projection.dropped_redundant.length} | ${pre_answer_spoilers} | ${projection.diagnostics.length} |`,
    );
  }

  const spoilered = sorted.filter((r) => r.pre_answer_spoilers > 0);
  if (spoilered.length > 0) {
    lines.push(
      '',
      `> ${spoilered.length} slug(s) com spoiler na tela Aula — o portão de predição só vale depois do repair de F3.`,
    );
  }

  const withDiagnostics = sorted.filter((r) => r.projection.diagnostics.length > 0);
  if (withDiagnostics.length > 0) {
    lines.push('', '## Lacunas por slug', '');
    for (const { slug, projection } of withDiagnostics) {
      lines.push(`- \`${slug}\``);
      for (const diagnostic of projection.diagnostics) lines.push(`  - ${diagnostic}`);
    }
  }

  const queue = sorted.filter((r) => r.coverage.grade !== 'strong');
  if (queue.length > 0) {
    lines.push('', '## Fila de expansão (fixação + transferência)', '');
    for (const { slug, coverage } of queue) {
      lines.push(`- \`${slug}\` (${coverage.grade}): ${coverage.reasons.join(' ')}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const { corpus, targets } = resolveTargets();
  if (targets.length === 0) {
    console.error(`${TAG} nenhum alvo — verifique --subtopico / --file`);
    process.exit(1);
  }

  const dump = parseArg('dump');
  const rows: Row[] = [];

  for (const target of targets) {
    let payload: LessonProjectionInput;
    try {
      payload = JSON.parse(readFileSync(target.path, 'utf8')) as LessonProjectionInput;
    } catch (err) {
      console.warn(`${TAG} JSON ilegível: ${target.path} (${String(err)})`);
      continue;
    }

    const projection = buildLessonProjection({ ...payload, slug: target.slug });
    rows.push({
      slug: target.slug,
      coverage: gradeFixationCoverage(projection),
      projection,
      pre_answer_spoilers: countPreAnswerSpoilers(payload),
    });

    if (dump && dump === target.slug) {
      console.log(JSON.stringify(projection, null, 2));
    }
  }

  const summary = summarizeFixationCoverage(rows.map((r) => r.coverage));
  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });

  const outJson = resolve(artifactsDir, 'lesson-projection.json');
  const outMd = resolve(artifactsDir, 'lesson-projection.md');
  writeFileSync(
    outJson,
    JSON.stringify(
      {
        corpus,
        generated_at: new Date().toISOString(),
        summary,
        rows: rows.map(({ slug, coverage, projection, pre_answer_spoilers }) => ({
          slug,
          coverage,
          pre_answer_spoilers,
          diagnostics: projection.diagnostics,
          dropped_redundant: projection.dropped_redundant,
          prova: {
            prediction_prompt: projection.prova.prediction_gate.prompt,
            elimination_kinds: projection.prova.elimination.map((s) => s.kind),
            distractor_letters: projection.prova.distractor_cards.map((c) => c.letter),
            transfer: projection.prova.fixacao.transfer,
          },
        })),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  writeFileSync(outMd, renderMarkdown(corpus, rows), 'utf8');

  const spoilered = rows.filter((r) => r.pre_answer_spoilers > 0).length;

  console.log(`${TAG} corpus=${corpus} slugs=${summary.total}`);
  console.log(`${TAG} spoiler na tela Aula: ${spoilered} slug(s) — depende do repair de F3`);
  console.log(
    `${TAG} fixação: strong=${summary.strong} thin=${summary.thin} missing=${summary.missing} ` +
      `média=${summary.avg_transfer}`,
  );
  console.log(`${TAG} json=`, outJson);
  console.log(`${TAG} md=`, outMd);

  if (hasFlag('strict') && summary.missing > 0) {
    console.error(`${TAG} --strict: ${summary.missing} slug(s) sem nada que generalize.`);
    process.exit(1);
  }
}

main();
