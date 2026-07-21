import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = JSON.parse(
  readFileSync(
    'data/catalog-migration/oracoes-coordenadas-e-subordinadas-completo/extracted-source.json',
    'utf8',
  ),
);
const slugs = src.map((q) => q.slug);
const prefix = 'oracoes-coordenadas-e-subordinadas';
const sub = 'Orações coordenadas e subordinadas';
const top = 'Língua Portuguesa';
const branch = 'pt_oracoes_subordinadas';
const batchSize = 8;

writeFileSync(
  'data/catalog-migration/oracoes-coordenadas-e-subordinadas-completo/manifest.json',
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
        note: 'Fase 0 pipeline 2026-07-20',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`${lote}: ${chunk.length} slugs`);
}
