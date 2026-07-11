#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g14 — 8 slugs AVC/IAM (1º lote urgencias_avc_iam).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g14';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'instituto-seletiva-enfermagem-semiologia-em-enfermagem-1779563521756-0',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-9',
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-4',
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-5',
  'atame-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-2',
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563486900-3',
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-9',
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-5',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g14] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g14] copied ${slug}`);
  }

  writeFileSync(
    loteManifestPath(LOTE),
    `${JSON.stringify(
      {
        lote: LOTE,
        exported_at: new Date().toISOString(),
        source: `data/catalog-migration/${COMPLETO}/manifest.json`,
        filters: {
          subtopico: 'Urgências e Emergências',
          pedagogical_branch: 'urgencias_avc_iam',
          batch: 'g14-avc-iam-lote-1',
        },
        slugs: SLUGS,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  writeFileSync(
    join(loteDir(LOTE), 'lote-meta.json'),
    `${JSON.stringify(
      {
        lote: LOTE,
        subtopico: 'Urgências e Emergências',
        status: 'handcraft_pending',
        handcraft_at: null,
        handcraft_by: null,
        slug_count: SLUGS.length,
        branches: { urgencias_avc_iam: SLUGS.length },
        anchors_used: ['examples/questao-premium-amauc-urgencias-cincinnati-avc.json'],
        notes:
          'g14 AVC/IAM — Cincinnati critérios · Cincinnati caso UPA · sinais AVC espúrio · AVE achados típicos · conduta respiratória AVC · Sinal Levine IAM · caso IAM UPA · aspirina APH IAM',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g14] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
