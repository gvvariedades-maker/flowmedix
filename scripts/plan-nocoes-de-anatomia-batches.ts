/**
 * Planeja lotes gNN a partir do manifest completo (8 slugs/lote).
 * Uso: npm run plan:anatomia-batches
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

const LOTE_SIZE = 8;
const COMPLETO = 'nocoes-de-anatomia-completo';
const PREFIX = 'nocoes-de-anatomia';
const SUBTOPICO = 'Noções de Anatomia';

function main() {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  const manifest = JSON.parse(
    readFileSync(resolve(root, COMPLETO, 'manifest.json'), 'utf8'),
  ) as { slugs: string[] };
  const slugs = manifest.slugs;
  const batches = Math.ceil(slugs.length / LOTE_SIZE);
  const plan: { lote: string; slugs: string[] }[] = [];

  for (let i = 0; i < batches; i++) {
    const chunk = slugs.slice(i * LOTE_SIZE, (i + 1) * LOTE_SIZE);
    const nn = String(i + 1).padStart(2, '0');
    const lote = `${PREFIX}-g${nn}`;
    plan.push({ lote, slugs: chunk });

    const dir = resolve(root, lote);
    const qDir = resolve(dir, 'questions');
    mkdirSync(qDir, { recursive: true });
    writeFileSync(
      resolve(dir, 'manifest.json'),
      `${JSON.stringify(
        {
          lote,
          exported_at: new Date().toISOString(),
          source: 'from-completo',
          parent: COMPLETO,
          slugs: chunk,
        },
        null,
        2,
      )}\n`,
    );
    writeFileSync(
      resolve(dir, 'lote-meta.json'),
      `${JSON.stringify(
        {
          lote,
          status: 'draft',
          subtopico: SUBTOPICO,
          slug_count: chunk.length,
        },
        null,
        2,
      )}\n`,
    );

    for (const slug of chunk) {
      const src = resolve(root, COMPLETO, 'questions', `${slug}.json`);
      const dest = resolve(qDir, `${slug}.json`);
      if (existsSync(src) && !existsSync(dest)) {
        cpSync(src, dest);
      }
    }
  }

  writeFileSync(
    resolve(process.cwd(), 'artifacts', `${PREFIX}-batch-plan.json`),
    `${JSON.stringify(
      { total: slugs.length, lote_size: LOTE_SIZE, batches: plan.length, plan },
      null,
      2,
    )}\n`,
  );
  console.log(`[plan:anatomia] total=${slugs.length} batches=${plan.length} size=${LOTE_SIZE}`);
  console.log(`[plan:anatomia] first=${plan[0]?.lote} last=${plan[plan.length - 1]?.lote}`);
}

main();
