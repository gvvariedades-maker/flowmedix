#!/usr/bin/env tsx
/**
 * Repair ITU EXCETO — 2 slugs IDIB drift com âncora golden-v1.
 * Uso: npx tsx scripts/handcraft-biosseg-itu-idib-repair.ts
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

loadEnvConfig(process.cwd());

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { createServerSupabase } from '@/lib/supabase/server';

const LOTE = 'infeccoes-biosseguranca-repair-itu-idib';
const SLUGS = [
  'idib-geral-instalacao-e-manejo-de-sondas-1776056668359-0',
  'idib-enfermagem-instalacao-e-manejo-de-sondas-1778934890864-0',
] as const;

type Questao = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  reverse_study_slides: unknown[];
};

function adaptSlidesForOptions(
  slides: Questao['reverse_study_slides'],
  optionIds: string[],
): Questao['reverse_study_slides'] {
  const hasE = optionIds.includes('E');
  const cloned = JSON.parse(JSON.stringify(slides)) as Questao['reverse_study_slides'];

  if (hasE) return cloned;

  return cloned.map((slide) => {
    const s = slide as Record<string, unknown>;
    if (s.type === 'concept_map' && Array.isArray(s.items)) {
      s.items = (s.items as { label: string }[]).filter((i) => !/bolsa abaixo|Letra E/i.test(i.label));
    }
    if (s.type === 'golden_rule' && Array.isArray(s.rows)) {
      s.rows = (s.rows as { label: string }[]).filter((r) => r.label !== 'Letra E');
      const gabarito = (s.rows as { label: string; value: string }[]).find((r) => r.label === 'Gabarito');
      if (gabarito) gabarito.value = 'Letra D';
    }
    if (s.type === 'logic_flow' && Array.isArray(s.steps)) {
      s.steps = (s.steps as string[]).filter((step) => !/Letra E:|letra E/i.test(step));
      const footer = s.footer_rule as string | undefined;
      if (footer) {
        s.footer_rule = footer.replace(/A, B, C e E/g, 'A, B e C');
      }
    }
    if (s.type === 'danger_zone' && Array.isArray(s.items)) {
      s.items = (s.items as { label: string }[]).filter((i) => !/Letra E/i.test(i.label));
    }
    return s;
  });
}

async function main() {
  const anchor = JSON.parse(
    readFileSync('examples/questao-premium-idib-umirim-itu-cateter-exceto.json', 'utf8'),
  ) as Questao;

  const supabase = await createServerSupabase();
  const outDir = loteQuestionsDir(LOTE);
  mkdirSync(outDir, { recursive: true });

  const manifest = {
    lote: LOTE,
    exported_at: new Date().toISOString(),
    source: 'repair-anchor',
    note: 'ITU EXCETO IDIB — drift biosseg com stub fundatec; âncora umirim',
    slugs: [...SLUGS],
  };

  for (const slug of SLUGS) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data?.conteudo_json) throw new Error(`Slug não encontrado: ${slug}`);

    const live = data.conteudo_json as Questao;
    const optionIds = live.question_data.options.map((o) => o.id.toUpperCase());
    const slides = adaptSlidesForOptions(anchor.reverse_study_slides, optionIds);

    const payload: Questao = {
      meta: {
        ...live.meta,
        ...anchor.meta,
        subtopico: 'Infecções no Contexto da Biossegurança',
        banca: live.meta.banca ?? anchor.meta.banca,
        orgao: live.meta.orgao ?? anchor.meta.orgao,
        ano: live.meta.ano ?? anchor.meta.ano,
        prova: live.meta.prova ?? anchor.meta.prova,
        topico: live.meta.topico ?? anchor.meta.topico,
      },
      question_data: live.question_data,
      reverse_study_slides: slides,
    };

    writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[repair] wrote ${slug} options=${optionIds.join('')}`);
  }

  const loteRoot = join('data/catalog-migration', LOTE);
  writeFileSync(join(loteRoot, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  writeFileSync(
    join(loteRoot, 'lote-meta.json'),
    JSON.stringify(
      {
        lote: LOTE,
        subtopico: 'Infecções no Contexto da Biossegurança',
        branch: 'biosseg_iras_itu_cateter',
        slugs: [...SLUGS],
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`[repair] lote=${LOTE} slugs=${SLUGS.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
