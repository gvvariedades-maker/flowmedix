#!/usr/bin/env tsx
/**
 * Repair 4 CEBRASPE certo/errado slugs — danger_zone min 3 items for A4-mínimo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SLUGS: Record<string, { label: string; detail: string; correct: string }> = {
  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-2': {
    label: 'Confundir meio úmido com maceração',
    detail: 'Úmido no leito ≠ pele perilesional encharcada — pegadinha de contexto.',
    correct: 'Meio úmido no leito granulando; controle de exsudato evita maceração perilesional.',
  },
  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-3': {
    label: 'Trocar alginato só por odor',
    detail: 'Odor isolado não define troca — avaliar saturação e vazamento.',
    correct: 'Alginato troca quando saturação visual ou conforme protocolo de exsudato.',
  },
  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-4': {
    label: 'Usar filme em exsudato abundante',
    detail: 'Oclusão sem absorção em exsudato alto macera e estende a lesão.',
    correct: 'Exsudato abundante pede alginato ou espuma absorvente — não filme oclusivo.',
  },
  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-5': {
    label: 'Desbridar escara estável sem avaliar',
    detail: 'Escara negra em calcanhar pode ser protegida — desbridamento não é automático.',
    correct: 'Princípio: individualizar — escara estável pode ser protegida sem desbridamento agressivo.',
  },
};

const dir = 'data/catalog-migration/curativos-e-manejo-de-feridas-g01/questions';

for (const [slug, item] of Object.entries(SLUGS)) {
  const path = join(dir, `${slug}.json`);
  const q = JSON.parse(readFileSync(path, 'utf8')) as {
    reverse_study_slides: Array<{ type: string; items?: unknown[] }>;
  };
  const dz = q.reverse_study_slides.find((s) => s.type === 'danger_zone');
  if (!dz?.items || dz.items.length >= 3) {
    console.log(`skip ${slug} items=${dz?.items?.length ?? 0}`);
    continue;
  }
  dz.items.push(item);
  writeFileSync(path, `${JSON.stringify(q, null, 2)}\n`, 'utf8');
  console.log(`patched ${slug} → ${dz.items.length} danger items`);
}
