#!/usr/bin/env tsx
/**
 * Gera lote-meta.json (anchor_slug + golden_reference) para g01–g08.
 *
 *   npm run plan:saude-da-crianca-lote-meta
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loteManifestPath } from '@/lib/catalogMigration/paths';

const PREFIX = 'saude-da-crianca';
const SUBTOPICO = 'Saúde da Criança';

const GOLDEN_BY_BRANCH: Record<string, string> = {
  crianca_aleitamento_nutricao: 'examples/questao-premium-cpcon-saude-crianca-aleitamento-vf.json',
  crianca_triagem_neonatal: 'examples/questao-premium-cpcon-saude-crianca-triagem-neonatal-vf.json',
  crianca_generico: 'examples/questao-premium-funcern-saude-crianca-generico-hub.json',
  crianca_desidratacao: 'examples/questao-premium-cev-saude-crianca-desidratacao-vf.json',
  crianca_aps_puericultura: 'examples/questao-premium-consulplan-saude-crianca-puericultura-vf.json',
  crianca_neonatologia: 'examples/questao-premium-idecan-saude-crianca-neonatologia-vf.json',
  crianca_desenvolvimento: 'examples/questao-premium-cpcon-saude-crianca-desenvolvimento-vf.json',
};

const CLUSTER_LABEL: Record<string, string> = {
  crianca_aleitamento_nutricao: 'Aleitamento / nutrição infantil',
  crianca_triagem_neonatal: 'Triagem neonatal pezinho/coraçãozinho',
  crianca_generico: 'Saúde da criança — conceito geral',
  crianca_desidratacao: 'Desidratação / diarreia aguda',
  crianca_aps_puericultura: 'APS / puericultura',
  crianca_neonatologia: 'Neonatologia clínica',
  crianca_desenvolvimento: 'Desenvolvimento infantil',
  crianca_dor: 'Dor pediátrica',
  crianca_apgar_reanimacao: 'APGAR / reanimação neonatal',
  crianca_sinais_vitais: 'Sinais vitais pediátricos',
  crianca_crescimento_curvas: 'Curvas de crescimento',
  crianca_vacinacao: 'Vacinação infantil',
  crianca_saude_bucal: 'Saúde bucal infantil',
  crianca_violencia_protecao: 'Violência / proteção infantil',
};

function dominantBranch(
  slugs: string[],
  bySlug: Map<string, string>,
): string {
  const counts = new Map<string, number>();
  for (const slug of slugs) {
    const branch = bySlug.get(slug) ?? 'crianca_generico';
    counts.set(branch, (counts.get(branch) ?? 0) + 1);
  }
  let best = 'crianca_generico';
  let max = 0;
  for (const [branch, n] of counts) {
    if (n > max) {
      max = n;
      best = branch;
    }
  }
  return best;
}

function pickAnchor(slugs: string[], branch: string, bySlug: Map<string, string>): string {
  return slugs.find((s) => bySlug.get(s) === branch) ?? slugs[0]!;
}

function main(): void {
  const reportPath = resolve('artifacts/saude-da-crianca-topic-cluster-report.json');
  if (!existsSync(reportPath)) {
    throw new Error('Rode npm run cluster:saude-da-crianca antes.');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
    rows: { slug: string; pedagogical_branch_proposed: string }[];
  };
  const bySlug = new Map(report.rows.map((r) => [r.slug, r.pedagogical_branch_proposed]));

  for (let i = 1; i <= 8; i += 1) {
    const nn = String(i).padStart(2, '0');
    const lote = `${PREFIX}-g${nn}`;
    const manifestPath = loteManifestPath(lote);
    if (!existsSync(manifestPath)) continue;

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs: string[] };
    const branch = dominantBranch(manifest.slugs, bySlug);
    const anchorSlug = pickAnchor(manifest.slugs, branch, bySlug);
    const golden =
      GOLDEN_BY_BRANCH[branch] ?? 'examples/questao-premium-funcern-saude-crianca-generico-hub.json';

    const loteMeta = {
      lote,
      mode: 'handcraft-golden-v1',
      gemini: false,
      created_at: new Date().toISOString().slice(0, 10),
      subtopico: SUBTOPICO,
      cluster: CLUSTER_LABEL[branch] ?? branch,
      pedagogical_branch_target: branch,
      total: manifest.slugs.length,
      status: 'applied',
      anchor_slug: anchorSlug,
      golden_reference: golden,
      guideline: 'lib/guidelines/saudeCrianca.ts (SAUDE_CRIANCA_MS)',
      slugs: manifest.slugs,
      validate_command: `npm run validate:goldens -- --lote=${lote} --strict`,
      workflow: [
        `1. Handcraft golden-v1 em data/catalog-migration/${lote}/questions/`,
        `2. Âncora L6: ${anchorSlug}`,
        `3. npm run audit:anchor-review -- --lote=${lote} --record-pass --reviewer=agent --skip-capture`,
        `4. npm run catalog:apply-lote -- --lote=${lote} --apply (só quando pedido)`,
      ],
    };

    const out = resolve(`data/catalog-migration/${lote}/lote-meta.json`);
    writeFileSync(out, `${JSON.stringify(loteMeta, null, 2)}\n`, 'utf8');
    console.log(`[plan:sc-lote-meta] ${lote} branch=${branch} anchor=${anchorSlug.slice(0, 48)}…`);
  }
}

main();
