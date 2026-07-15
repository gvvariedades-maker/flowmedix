#!/usr/bin/env tsx
/**
 * Bootstrap manifest completo + handcraft-meta para Punção Venosa.
 *
 *   npm run bootstrap:puncao-venosa-e-cuidados-com-cateteres
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const PACOTE_PREFIX = 'puncao-venosa-e-cuidados-com-cateteres';
const COMPLETO_LOTE = `${PACOTE_PREFIX}-completo`;
const CLUSTER_REPORT = 'artifacts/puncao-topic-cluster-report.json';

function main(): void {
  const reportPath = resolve(process.cwd(), CLUSTER_REPORT);
  if (!existsSync(reportPath)) {
    throw new Error(`Cluster report ausente: ${CLUSTER_REPORT}`);
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
    total: number;
    rows: { modulo_slug: string }[];
  };

  const slugs = report.rows.map((r) => r.modulo_slug).sort();
  if (slugs.length !== report.total) {
    throw new Error(`rows=${slugs.length} ≠ total=${report.total}`);
  }

  const completoDir = resolve(process.cwd(), 'data/catalog-migration', COMPLETO_LOTE);
  mkdirSync(completoDir, { recursive: true });

  const manifest = {
    lote: COMPLETO_LOTE,
    exported_at: new Date().toISOString(),
    source: 'cluster-report',
    filters: { subtopico: SUBTOPICO, drift_excluded: 0 },
    slugs,
  };
  writeFileSync(resolve(completoDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const handcraftMeta = {
    subtopico: SUBTOPICO,
    pacote_prefix: PACOTE_PREFIX,
    status: 'in_progress',
    handcraft_applied: 0,
    total_slugs: slugs.length,
    updated_at: new Date().toISOString().slice(0, 10),
    cluster_report: CLUSTER_REPORT,
    anchor_glob:
      'examples/questao-premium-*-puncao-*.json,examples/questao-premium-admtec-puncao-venosa-cateteres.json',
    golden_anchors_registry: `data/catalog-migration/${PACOTE_PREFIX}-golden-anchors.json`,
    handcraft_playbook: `data/catalog-migration/handcraft-playbooks/${PACOTE_PREFIX}.json`,
    next_lote: {
      id: `${PACOTE_PREFIX}-g01`,
      status: 'planned',
      pedagogical_branch_target: 'puncao_flebite',
      cluster: 'Flebite e complicações',
      slug_count: 8,
    },
    anchors_by_branch: {
      puncao_flebite: 'examples/questao-premium-avancasp-puncao-infiltracao-flebite.json',
      puncao_dispositivo: 'examples/questao-premium-gama-puncao-scalp-jelco-calibre.json',
      puncao_exceto: 'examples/questao-premium-cev-urca-puncao-exceto-med-endovenosa.json',
      puncao_tempo: 'examples/questao-premium-cpcon-puncao-troca-equipos-intervalos.json',
      puncao_periferica_antissepsia: 'examples/questao-premium-funpar-puncao-tecnica-periferica.json',
      puncao_ipcs_cvc: 'examples/questao-premium-admtec-puncao-venosa-cateteres.json',
      puncao_generico: 'examples/questao-premium-gama-puncao-scalp-jelco-calibre.json',
    },
    l3_molds: {
      puncao_flebite: {
        status: 'implemented',
        package: 'iv-complication-tissue-layers · iv-differential-board · iv-complication-tap-flow · iv-label-swap-trap',
      },
      puncao_dispositivo: {
        status: 'implemented',
        package: 'iv-gauge-matrix · iv-device-reference-board · iv-device-tap-flow · iv-gauge-mismatch-trap',
      },
      puncao_exceto: {
        status: 'implemented',
        package: 'iv-exceto-spectrum · iv-exceto-command-board · iv-exceto-tap-flow · iv-exceto-intruder-trap',
      },
      puncao_tempo: {
        status: 'implemented',
        package: 'iv-interval-timeline · iv-interval-board · iv-interval-tap-flow · iv-interval-swap-trap',
      },
      puncao_periferica_antissepsia: {
        status: 'implemented',
        package: 'iv-puncture-rail · iv-antisepsis-board · iv-puncture-tap-flow · iv-order-invert-trap',
      },
      puncao_ipcs_cvc: {
        status: 'implemented',
        package: 'iv-bundle-orbit · iv-bundle-mesh-reveal · iv-bundle-tap-flow · iv-bundle-break-trap',
      },
      puncao_generico: {
        status: 'implemented',
        package: 'bridge · reference_table · cards · compare',
      },
    },
  };
  writeFileSync(resolve(completoDir, 'handcraft-meta.json'), JSON.stringify(handcraftMeta, null, 2), 'utf8');

  console.log(`[bootstrap:puncao] manifest=${slugs.length} slugs → ${completoDir}/manifest.json`);
}

main();
