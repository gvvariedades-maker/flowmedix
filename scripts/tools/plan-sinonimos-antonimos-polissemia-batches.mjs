import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(
  readFileSync(
    'data/catalog-migration/sinonimos-antonimos-e-polissemia-completo/extracted-source.json',
    'utf8',
  ),
);
const slugs = src.map((q) => q.slug);
const prefix = 'sinonimos-antonimos-e-polissemia';
const sub = 'Sinônimos, antônimos e polissemia';
const top = 'Língua Portuguesa';
const branch = 'pt_sinonimos_polissemia';
const batchSize = 8;

writeFileSync(
  'data/catalog-migration/sinonimos-antonimos-e-polissemia-completo/manifest.json',
  JSON.stringify(
    {
      lote: `${prefix}-completo`,
      subtopico: sub,
      topico: top,
      pedagogical_branch: branch,
      total: slugs.length,
      slugs,
      updated_at: new Date().toISOString().slice(0, 10),
      source: 'cluster:lingua-portuguesa + extract_pt_sinonimos_polissemia_completo.py',
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
        note: 'Fase 0 bootstrap — Sinônimos, antônimos e polissemia 2026-07-23',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`${lote}: ${chunk.length} slugs`);
}

console.log(`manifest: ${slugs.length} slugs total`);
