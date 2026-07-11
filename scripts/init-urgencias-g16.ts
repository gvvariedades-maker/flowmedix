#!/usr/bin/env tsx

/**

 * Inicializa urgencias-g16 — 6 slugs AVC/IAM (lote final urgencias_avc_iam · 23/23).

 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';

import { join } from 'node:path';



import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';



const LOTE = 'urgencias-g16';

const COMPLETO = 'urgencias-e-emergencias-completo';



/** Saldo reconciliado cluster report − g14 − g15 − âncora AMAUC */

const SLUGS = [

  'fgv-enfermagem-semiologia-em-enfermagem-1779563491765-8',

  'iaupe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-8',

  'idib-enfermagem-urgencias-e-emergencias-1778934926888-3',

  'instituto-seletiva-enfermagem-urgencias-e-emergencias-1777103976379-6',

  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-0',

  'quadrix-enfermagem-urgencias-e-emergencias-1777103988389-8',

];



function main() {

  const outDir = loteQuestionsDir(LOTE);

  const srcDir = loteQuestionsDir(COMPLETO);

  mkdirSync(outDir, { recursive: true });



  for (const slug of SLUGS) {

    const src = join(srcDir, `${slug}.json`);

    const dest = join(outDir, `${slug}.json`);

    if (!existsSync(src)) {

      console.error(`[init:urgencias-g16] MISSING ${src}`);

      process.exit(1);

    }

    copyFileSync(src, dest);

    console.log(`[init:urgencias-g16] copied ${slug}`);

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

          batch: 'g16-avc-iam-lote-final',

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

          'g16 AVC/IAM final — choque UPA sinais · trauma epidemiologia VF · IAM O2 SAMU 94% · choque hipovolêmico hemorragia · colecistite vs IAM · IAM angina sudorese',

      },

      null,

      2,

    )}\n`,

    'utf8',

  );



  console.log(`[init:urgencias-g16] manifest + lote-meta OK (${SLUGS.length} slugs)`);

}



main();


