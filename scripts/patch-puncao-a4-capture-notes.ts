#!/usr/bin/env tsx
/** Atualiza a4_human_notes com path de capture quando PNGs existem. */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const CAPTURED = [
  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-7',
  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-4',
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-8',
  'adm-tec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-7',
  'cev-urca-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-1',
  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-6',
  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-5',
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-7',
];

let updated = 0;

for (let i = 1; i <= 15; i++) {
  const lote = `puncao-venosa-e-cuidados-com-cateteres-g${String(i).padStart(2, '0')}`;
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const path = join(dir, f);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      modulo_slug?: string;
      meta?: { efficacy_contract?: Record<string, unknown> };
    };
    const slug = raw.modulo_slug ?? f.replace(/\.json$/, '');
    const capDir = resolve(process.cwd(), 'artifacts/questao-review', slug);
    const hasPng = existsSync(capDir) && readdirSync(capDir).some((n) => n.endsWith('.png'));
    if (!hasPng && !CAPTURED.includes(slug)) continue;
    const ec = raw.meta?.efficacy_contract;
    if (!ec || ec.a4_reviewer !== 'handcraft-qc') continue;
    const note = String(ec.a4_human_notes ?? '');
    if (note.includes('capture:')) continue;
    ec.a4_human_notes = `${note} · capture: artifacts/questao-review/${slug}`;
    ec.capture_reviewed_at = '2026-07-14';
    raw.meta = { ...raw.meta, efficacy_contract: ec };
    writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    updated++;
  }
}

console.log(`[patch-puncao-a4-capture-notes] updated=${updated}`);
