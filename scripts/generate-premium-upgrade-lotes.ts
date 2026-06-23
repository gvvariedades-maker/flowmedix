#!/usr/bin/env tsx
/**
 * Gera manifests de lote (50 slugs) para questões que falham no premium gate (Supabase).
 *
 * Uso:
 *   npx tsx scripts/generate-premium-upgrade-lotes.ts
 *   npx tsx scripts/generate-premium-upgrade-lotes.ts --subtopico=Vias
 *   npx tsx scripts/generate-premium-upgrade-lotes.ts --batch-size=50
 *
 * Entrada:  artifacts/premium-needs-upgrade-supabase.json
 * Saída:    artifacts/premium-upgrade-lotes/
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';

const BATCH_SIZE_DEFAULT = 50;

/** Prefixos de lote já usados no repo (nome canônico → pasta). */
const SUBTOPICO_LOTE_PREFIX: Record<string, string> = {
  'Atenção Básica / Saúde da Família': 'atencao-basica-saude-da-familia',
  'Assistência Perioperatória (Inclui SRPA)': 'assistencia-perioperatoria-inclui-srpa',
  'Cálculo de Administração de Medicamentos e Infusões':
    'calculo-de-administracao-de-medicamentos-e-infusoes',
  'Coleta de Exames Laboratoriais': 'coleta-de-exames-laboratoriais',
  'Cuidados na Administração de Medicamentos': 'cuidados-na-administracao-de-medicamentos',
  'Curativos e Manejo de Feridas': 'curativos-e-manejo-de-feridas',
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)':
    'doencas-bacterianas-e-fungicas',
  'Doenças Parasitárias e Zoonoses': 'doencas-parasitarias-e-zoonoses',
  'Doenças Respiratórias Crônicas (Asma, DPOC)': 'doencas-respiratorias-cronicas-asma-dpoc',
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)':
    'doencas-virais-interesse-epidemiologico',
  'Enfermagem do Trabalho': 'enfermagem-do-trabalho',
  'Enfermagem em Central de Material e Esterilização (CME)':
    'enfermagem-em-central-de-material-e-esterilizacao-cme',
  'Enfermagem em Centro Cirúrgico': 'enfermagem-em-centro-cirurgico',
  'Epidemiologia e Vigilância Epidemiológica': 'epidemiologia-e-vigilancia-epidemiologica',
  'Farmacodinâmica e Farmacocinética': 'farmacodinamica-e-farmacocinetica',
  'Feridas e Queimaduras': 'feridas-e-queimaduras',
  'História da Enfermagem': 'historia-da-enfermagem',
  'Imunização': 'imunizacao',
  'Infecções no Contexto da Biossegurança': 'infeccoes-no-contexto-da-biosseguranca',
  'Infecções Sexualmente Transmissíveis (ISTs)': 'infeccoes-sexualmente-transmissiveis-ists',
  'Instalação e Manejo de Sondas': 'instalacao-e-manejo-de-sondas',
  'Medidas de Prevenção e Precaução de Contato': 'medidas-de-prevencao-e-precaucao-de-contato',
  'Mobilização e Posicionamento do Paciente': 'mobilizacao-e-posicionamento-do-paciente',
  'Noções de Anatomia': 'nocoes-de-anatomia',
  'Noções de Fisiologia': 'nocoes-de-fisiologia',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis':
    'outras-doencas-e-questoes-mescladas-transmissiveis',
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis':
    'outras-questoes-mescladas-doencas-cronicas-nao-transmissiveis',
  'Oxigenoterapia e Cuidados Respiratórios': 'oxigenoterapia-e-cuidados-respiratorios',
  'Procedimentos Diversos': 'procedimentos-diversos',
  'Processamento de Artigos e Produtos de Saúde': 'processamento-de-artigos-e-produtos-de-saude',
  'Processo de Enfermagem': 'processo-de-enfermagem',
  'Promoção à Saúde e Prevenção de Agravos': 'promocao-a-saude-e-prevencao-de-agravos',
  'Punção Venosa e Cuidados com Cateteres': 'puncao-venosa-e-cuidados-com-cateteres',
  'Saúde da Criança': 'saude-da-crianca',
  'Saúde da Mulher': 'saude-da-mulher',
  'Saúde do Adolescente': 'saude-do-adolescente',
  'Saúde Mental': 'saude-mental',
  'Segurança do Paciente': 'seguranca-do-paciente',
  'Urgências e Emergências': 'urgencias-e-emergencias',
  'Verificação de Sinais Vitais': 'verificacao-de-sinais-vitais',
  'Vias de Administração': 'vias-de-administracao',
};

/** Subtópicos com builder dedicado (upgradePremiumDedicatedRouter). */
const DEDICATED_BUILDER: Record<string, string> = {
  'Verificação de Sinais Vitais': 'upgradePremiumSinais',
  Imunização: 'upgradePremiumImunizacao',
  'Curativos e Manejo de Feridas': 'upgradePremiumCurativos',
  'Punção Venosa e Cuidados com Cateteres': 'upgradePremiumPuncao',
  'Coleta de Exames Laboratoriais': 'upgradePremiumColeta',
  'Vias de Administração': 'upgradePremiumVias',
  'Urgências e Emergências': 'upgradePremiumUrgencias',
  'Oxigenoterapia e Cuidados Respiratórios': 'upgradePremiumOxigenoterapia',
  'Doenças Respiratórias Crônicas (Asma, DPOC)': 'upgradePremiumRespiratorioCronico',
  'Infecções Sexualmente Transmissíveis (ISTs)': 'upgradePremiumIsts',
  'Cálculo de Administração de Medicamentos e Infusões': 'upgradePremiumCalculo',
  'Processo de Enfermagem': 'upgradePremiumSae',
  'Instalação e Manejo de Sondas': 'upgradePremiumSondas',
};

type NeedRow = {
  slug: string;
  subtopico: string;
  issue_codes: string;
};

type LotePlan = {
  lote: string;
  subtopico: string;
  lote_prefix: string;
  batch: number;
  slug_count: number;
  has_dedicated_builder: boolean;
  builder?: string;
  manifest_path: string;
  slugs: string[];
  commands: {
    export: string;
    upgrade: string;
    apply: string;
  };
};

function slugifySubtopico(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function lotePrefixFor(subtopico: string): string {
  return SUBTOPICO_LOTE_PREFIX[subtopico] ?? slugifySubtopico(subtopico);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function main() {
  const filterSub = parseArg('subtopico')?.trim().toLowerCase();
  const batchSizeRaw = parseArg('batch-size');
  const batchSize = batchSizeRaw ? Number(batchSizeRaw) : BATCH_SIZE_DEFAULT;

  const inputPath = resolve(process.cwd(), 'artifacts/premium-needs-upgrade-supabase.json');
  const input = JSON.parse(readFileSync(inputPath, 'utf8')) as {
    rows: NeedRow[];
  };

  let rows = input.rows;
  if (filterSub) {
    rows = rows.filter((r) => r.subtopico.toLowerCase().includes(filterSub));
  }

  const bySubtopico = new Map<string, NeedRow[]>();
  for (const row of rows) {
    const key = row.subtopico || '(sem subtópico)';
    const list = bySubtopico.get(key) ?? [];
    list.push(row);
    bySubtopico.set(key, list);
  }

  const outRoot = resolve(process.cwd(), 'artifacts/premium-upgrade-lotes');
  mkdirSync(outRoot, { recursive: true });

  const plans: LotePlan[] = [];
  const generatedAt = new Date().toISOString();

  for (const [subtopico, items] of [...bySubtopico.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    const prefix = lotePrefixFor(subtopico);
    const builder = DEDICATED_BUILDER[subtopico];
    const slugs = items.map((i) => i.slug).sort();
    const batches = chunk(slugs, batchSize);

    for (let i = 0; i < batches.length; i += 1) {
      const batchSlugs = batches[i]!;
      const batchNum = String(i + 1).padStart(2, '0');
      const lote = `${prefix}-repair-lote-${batchNum}`;
      const manifestRel = `artifacts/premium-upgrade-lotes/${prefix}/repair-lote-${batchNum}-manifest.json`;
      const manifestAbs = resolve(process.cwd(), manifestRel);

      mkdirSync(resolve(outRoot, prefix), { recursive: true });

      const manifest = {
        lote,
        generated_at: generatedAt,
        source: 'premium-needs-upgrade-supabase',
        subtopico,
        lote_prefix: prefix,
        batch: i + 1,
        has_dedicated_builder: Boolean(builder),
        builder: builder ?? null,
        issue_summary: countIssues(items.filter((x) => batchSlugs.includes(x.slug))),
        slugs: batchSlugs,
      };

      writeFileSync(manifestAbs, JSON.stringify(manifest, null, 2), 'utf8');

      const exportCmd = `npm run catalog:export-lote -- --lote=${lote} --from-manifest=${manifestRel.replace(/\\/g, '/')}`;
      const upgradeCmd = `npm run catalog:upgrade-premium -- --lote=${lote} --write --force`;
      const applyCmd = `npm run catalog:apply-lote -- --lote=${lote} --apply`;

      plans.push({
        lote,
        subtopico,
        lote_prefix: prefix,
        batch: i + 1,
        slug_count: batchSlugs.length,
        has_dedicated_builder: Boolean(builder),
        builder,
        manifest_path: manifestRel,
        slugs: batchSlugs,
        commands: { export: exportCmd, upgrade: upgradeCmd, apply: applyCmd },
      });
    }
  }

  const index = {
    generated_at: generatedAt,
    source: 'artifacts/premium-needs-upgrade-supabase.json',
    total_slugs: rows.length,
    total_lotes: plans.length,
    batch_size: batchSize,
    subtopico_filter: filterSub ?? null,
    by_subtopico: [...bySubtopico.entries()]
      .map(([subtopico, items]) => ({
        subtopico,
        slug_count: items.length,
        lotes: plans.filter((p) => p.subtopico === subtopico).length,
        has_dedicated_builder: Boolean(DEDICATED_BUILDER[subtopico]),
        builder: DEDICATED_BUILDER[subtopico] ?? null,
      }))
      .sort((a, b) => b.slug_count - a.slug_count),
    lotes: plans,
  };

  writeFileSync(resolve(outRoot, 'index.json'), JSON.stringify(index, null, 2), 'utf8');

  const mdLines = [
    '# Lotes premium — repair (Supabase)',
    '',
    `Gerado em: ${generatedAt}`,
    '',
    `Total: **${rows.length}** questões → **${plans.length}** lotes (até ${batchSize} slugs/lote)`,
    '',
    '## Fluxo por lote',
    '',
    '```bash',
    'npm run catalog:export-lote -- --lote=<lote> --from-manifest=artifacts/premium-upgrade-lotes/<prefix>/repair-lote-NN-manifest.json',
    'npm run catalog:upgrade-premium -- --lote=<lote> --write --force',
    'npm run catalog:apply-lote -- --lote=<lote> --apply',
    '```',
    '',
    '## Quick wins (builder dedicado)',
    '',
  ];

  for (const p of plans.filter((x) => x.has_dedicated_builder).slice(0, 30)) {
    mdLines.push(
      `### ${p.subtopico} — \`${p.lote}\` (${p.slug_count} slugs)`,
      '',
      '```bash',
      p.commands.export,
      p.commands.upgrade,
      p.commands.apply,
      '```',
      '',
    );
  }

  mdLines.push('## Todos os subtópicos', '', '| Subtópico | Slugs | Lotes | Builder |', '|-----------|------:|------:|---------|');
  for (const row of index.by_subtopico) {
    mdLines.push(
      `| ${row.subtopico} | ${row.slug_count} | ${row.lotes} | ${row.builder ?? '—'} |`,
    );
  }

  writeFileSync(resolve(outRoot, 'COMMANDS.md'), mdLines.join('\n'), 'utf8');

  console.log(`[generate] slugs=${rows.length} lotes=${plans.length} → artifacts/premium-upgrade-lotes/`);
  console.log('[generate] quick wins (builder dedicado):');
  for (const row of index.by_subtopico.filter((r) => r.has_dedicated_builder).slice(0, 10)) {
    console.log(`  ${row.slug_count}\t${row.subtopico}\t(${row.lotes} lotes)`);
  }
}

function countIssues(rows: NeedRow[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const row of rows) {
    for (const code of row.issue_codes.split(';').filter(Boolean)) {
      m[code] = (m[code] ?? 0) + 1;
    }
  }
  return m;
}

main();
