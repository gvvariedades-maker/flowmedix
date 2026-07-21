import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(
  readFileSync('data/catalog-migration/verbos-tempos-modos-e-vozes-completo/extracted-source.json', 'utf8'),
);
const slugs = src.map((q) => q.slug);
const prefix = 'verbos-tempos-modos-e-vozes';
const sub = 'Verbos — tempos, modos e vozes';
const top = 'Língua Portuguesa';
const branch = 'pt_verbos';
const batchSize = 8;

writeFileSync(
  'data/catalog-migration/verbos-tempos-modos-e-vozes-completo/manifest.json',
  JSON.stringify(
    {
      lote: `${prefix}-completo`,
      subtopico: sub,
      topico: top,
      pedagogical_branch: branch,
      total: slugs.length,
      slugs,
    },
    null,
    2,
  ) + '\n',
);

for (let i = 0; i < slugs.length; i += batchSize) {
  const chunk = slugs.slice(i, i + batchSize);
  const n = String(Math.floor(i / batchSize) + 1).padStart(2, '0');
  const lote = `${prefix}-g${n}`;
  const dir = `data/catalog-migration/${lote}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    `${dir}/manifest.json`,
    JSON.stringify(
      { lote, subtopico: sub, topico: top, pedagogical_branch: branch, total: chunk.length, slugs: chunk },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    `${dir}/catalog.json`,
    JSON.stringify({ lote, subtopico: sub, slugs: chunk }, null, 2) + '\n',
  );
  writeFileSync(
    `${dir}/lote-meta.json`,
    JSON.stringify(
      {
        lote,
        subtopico: sub,
        status: 'planned',
        slugs: chunk,
        note: 'Fase 0 pipeline Verbos — tempos, modos e vozes 2026-07-21',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`${lote}: ${chunk.length} slugs`);
}
