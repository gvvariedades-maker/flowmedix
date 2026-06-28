#!/usr/bin/env tsx
/**
 * Corrige slugs que receberam meta Farmacodinâmica + branch farmaco_* por filtro parcial no backfill.
 *
 *   npm run catalog:repair-farmaco-mispatch -- --dry-run
 *   npm run catalog:repair-farmaco-mispatch -- --apply
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import {
  patchPedagogicalMeta,
  type PatchableQuestaoPayload,
} from '@/lib/catalogMigration/patchPedagogicalMeta';
import { hasSubtopicBranchDesign } from '@/lib/slides/pedagogicalBranch';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

/** Slug → subtópico canônico (derivado do modulo_slug / classificação). */
const REPAIRS: { slug: string; subtopico: string; branch?: string }[] = [
  {
    slug: 'cetrede-enfermagem-vias-de-administracao-1778968997293-3',
    subtopico: 'Vias de Administração',
    branch: 'via_generico',
  },
  {
    slug: 'instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0',
    subtopico: 'Vias de Administração',
    branch: 'via_generico',
  },
  {
    slug: 'fundatec-enfermagem-processo-de-enfermagem-1780006976703-0',
    subtopico: 'Processo de Enfermagem',
  },
  {
    slug: 'fundatec-enfermagem-processo-de-enfermagem-1780006976703-2',
    subtopico: 'Processo de Enfermagem',
  },
  {
    slug: 'fundatec-enfermagem-processo-de-enfermagem-1780011956256-8',
    subtopico: 'Processo de Enfermagem',
  },
  {
    slug: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-2',
    subtopico: 'Processo de Enfermagem',
  },
  {
    slug: 'idcap-enfermagem-cuidados-na-administracao-de-medicamentos-1778969633568-4',
    subtopico: 'Cuidados na Administração de Medicamentos',
  },
  {
    slug: 'quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1778969018962-1',
    subtopico: 'Cuidados na Administração de Medicamentos',
  },
  {
    slug: 'quadrix-enfermagem-cuidados-na-administracao-de-medicamentos-1780000237780-3',
    subtopico: 'Cuidados na Administração de Medicamentos',
  },
  {
    slug: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-1',
    subtopico: 'Epidemiologia e Vigilância Epidemiológica',
  },
  {
    slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6',
    subtopico: 'Farmacodinâmica e Farmacocinética',
  },
  {
    slug: 'idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-7',
    subtopico: 'Farmacodinâmica e Farmacocinética',
  },
];

type RepairLine = {
  slug: string;
  subtopico_before?: string;
  subtopico_after: string;
  branch_before?: string;
  branch_after?: string;
  applied: boolean;
};

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const supabase = await createServerSupabase();
  const lines: RepairLine[] = [];

  for (const { slug, subtopico, branch: branchOverride } of REPAIRS) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json, titulo_aula')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error) throw new Error(`${slug}: ${error.message}`);
    if (!data) {
      console.warn(`[repair] SKIP ${slug}: não encontrado`);
      continue;
    }

    const payload = (data.conteudo_json ?? {}) as PatchableQuestaoPayload;
    const branchBefore = payload.meta?.pedagogical_branch;
    const subtopicoBefore = payload.meta?.subtopico;

    payload.meta = { ...payload.meta, subtopico, topico: payload.meta?.topico ?? 'Enfermagem' };

    const slides = payload.reverse_study_slides ?? payload.study_slides;
    if (Array.isArray(slides)) {
      for (const slide of slides as { meta?: { subtopico?: string; topico?: string } }[]) {
        if (slide.meta) {
          slide.meta.subtopico = subtopico;
          slide.meta.topico = slide.meta.topico ?? 'Enfermagem';
        }
      }
    }

    if (hasSubtopicBranchDesign(subtopico)) {
      patchPedagogicalMeta(payload, { slug, forceBranch: true });
      if (branchOverride) {
        payload.meta = { ...payload.meta, pedagogical_branch: branchOverride };
      }
    } else if (payload.meta.pedagogical_branch) {
      delete payload.meta.pedagogical_branch;
    }

    const branchAfter = payload.meta?.pedagogical_branch;
    const line: RepairLine = {
      slug,
      subtopico_before: subtopicoBefore,
      subtopico_after: subtopico,
      branch_before: branchBefore,
      branch_after: branchAfter,
      applied: false,
    };

    console.log(
      `[repair] ${dryRun ? 'DRY' : 'APPLY'} ${slug}\n` +
        `  subtopico: ${subtopicoBefore ?? '—'} → ${subtopico}\n` +
        `  branch: ${branchBefore ?? '—'} → ${branchAfter ?? '(removido)'}`,
    );

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('modulos_estudo')
        .update({
          conteudo_json: payload,
          titulo_aula: subtopico,
        })
        .eq('id', data.id);
      if (updateError) throw new Error(`${slug}: ${updateError.message}`);
      line.applied = true;
    }

    lines.push(line);
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const out = resolve(artifactsDir, 'catalog-repair-farmaco-mispatch.json');
  writeFileSync(
    out,
    `${JSON.stringify({ generated_at: new Date().toISOString(), mode: dryRun ? 'dry-run' : 'apply', lines }, null, 2)}\n`,
    'utf8',
  );
  console.log(`[repair] relatório=${out}`);

  if (!dryRun) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[repair] cache invalidation skipped:',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }
}

main().catch((err) => {
  console.error('[repair]', err);
  process.exitCode = 1;
});
