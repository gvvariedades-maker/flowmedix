#!/usr/bin/env tsx
/**
 * Scan drift + ITU EXCETO no subtópico biosseg (titulo_aula).
 * Uso: npx tsx scripts/biosseg-drift-scan.ts
 */
import { loadEnvConfig } from '@next/env';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';

const ITU_RE =
  /cateteriza.{0,24}vesical|trato urin[aá]rio|n[aã]o condiz com cuidados|assinale a alternativa que n[aã]o condiz/i;
const STUB_RE = /fundatec-meningococica|Conceito \/ defini/i;

async function main() {
  const handcraft = new Set(
    JSON.parse(
      readFileSync(
        resolve('data/catalog-migration/infeccoes-biosseguranca-completo/manifest.json'),
        'utf8',
      ),
    ).slugs as string[],
  );
  const scan = JSON.parse(
    readFileSync(resolve('data/catalog-migration/biosseg-itu-scan/manifest.json'), 'utf8'),
  ).slugs as string[];

  const audit = JSON.parse(
    readFileSync(resolve('artifacts/questao-readiness-audit.json'), 'utf8'),
  );
  const notReady = new Map<string, string[]>(
    (audit.summary?.not_ready ?? []).map((x: { slug: string; codes: string[] }) => [
      x.slug,
      x.codes,
    ]),
  );

  const supabase = await createServerSupabase();
  const rows: Record<string, unknown>[] = [];

  for (const slug of scan) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug,titulo_aula,conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) continue;

    const cj = data.conteudo_json as {
      meta?: { content_standard?: string; pedagogical_branch?: string; banca?: string };
      question_data?: { instruction?: string };
      reverse_study_slides?: unknown;
    };
    const instr = cj?.question_data?.instruction ?? '';
    const slides = JSON.stringify(cj?.reverse_study_slides ?? '');
    const isItu = ITU_RE.test(instr);
    const fundatecStub = STUB_RE.test(slides);
    const drift = !handcraft.has(slug);

    rows.push({
      slug,
      banca: cj?.meta?.banca,
      drift,
      in_handcraft_package: handcraft.has(slug),
      ready_100: !notReady.has(slug),
      is_itu_exceto: isItu,
      content_standard: cj?.meta?.content_standard ?? null,
      pedagogical_branch: cj?.meta?.pedagogical_branch ?? null,
      fundatec_stub: fundatecStub,
      like_idib_case: drift && (isItu || fundatecStub),
      error_codes: notReady.get(slug) ?? [],
      instruction_preview: instr.slice(0, 140).replace(/\s+/g, ' '),
    });
  }

  const itu = rows.filter((r) => r.is_itu_exceto);
  const likeIdib = rows.filter((r) => r.like_idib_case);
  const driftRows = rows.filter((r) => r.drift);

  const out = {
    generated_at: new Date().toISOString(),
    subtopico: 'Infecções no Contexto da Biossegurança',
    totals: {
      vitrine_biosseg: scan.length,
      handcraft_package: handcraft.size,
      drift_slugs: driftRows.length,
      not_ready: notReady.size,
      itu_exceto_cluster: itu.length,
      like_idib_case: likeIdib.length,
    },
    itu_exceto_slugs: itu,
    like_idib_case: likeIdib,
    drift_not_ready: driftRows.filter((r) => !r.ready_100),
    all_drift: driftRows,
  };

  const dir = resolve('artifacts');
  mkdirSync(dir, { recursive: true });
  const outPath = resolve(dir, 'biosseg-drift-audit.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('[biosseg-drift-scan]', JSON.stringify(out.totals));
  console.log('[biosseg-drift-scan] ITU EXCETO:');
  for (const r of itu) {
    console.log(
      `  ${r.slug} stub=${r.fundatec_stub} ready=${r.ready_100} branch=${r.pedagogical_branch}`,
    );
  }
  console.log(`[biosseg-drift-scan] relatório=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
