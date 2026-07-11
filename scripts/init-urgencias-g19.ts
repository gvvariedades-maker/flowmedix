#!/usr/bin/env tsx
/**
 * Inicializa urgencias-g19 — 8 slugs choque/hipoperfusão (lote 1 · urgencias_choque · 18/18).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteDir, loteManifestPath, loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'urgencias-g19';
const COMPLETO = 'urgencias-e-emergencias-completo';

const SLUGS = [
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4',
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-4',
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-3',
  'avancasp-enfermagem-processo-de-enfermagem-1780011859940-8',
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563500147-8',
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563517223-4',
  'cpcon-uepb-geral-urgencias-e-emergencias-1777103970505-0',
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-6',
];

function main() {
  const outDir = loteQuestionsDir(LOTE);
  const srcDir = loteQuestionsDir(COMPLETO);
  mkdirSync(outDir, { recursive: true });

  for (const slug of SLUGS) {
    const src = join(srcDir, `${slug}.json`);
    const dest = join(outDir, `${slug}.json`);
    if (!existsSync(src)) {
      console.error(`[init:urgencias-g19] MISSING ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[init:urgencias-g19] copied ${slug}`);
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
          pedagogical_branch: 'urgencias_choque',
          batch: 'g19-choque-lote-1',
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
        branches: { urgencias_choque: SLUGS.length },
        anchors_used: [
          'examples/questao-premium-admtec-urgencias-choque-eletrico.json',
          'examples/questao-premium-fepese-urgencias-choque-hipovolemico.json',
        ],
        notes:
          'g19 choque lote 1 — choque elétrico segurança cena · descerebração TCE · hipovolêmico trauma · sinais hipoperfusão · semiologia choque · elétrico CPCON · APH neuro antes transporte',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`[init:urgencias-g19] manifest + lote-meta OK (${SLUGS.length} slugs)`);
}

main();
