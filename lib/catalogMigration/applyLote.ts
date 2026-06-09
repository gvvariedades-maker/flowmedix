import { generateContentHash } from '@/lib/contentHash';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
  invalidateQuestaoSlugsCache,
} from '@/lib/cache';
import { getDefaultConcursoId, linkModuloToConcurso } from '@/lib/concursos/entitlements';
import type { createServerSupabase } from '@/lib/supabase/server';
import {
  buildConteudoJson,
  correctOptionId,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';

export type ApplyLoteItem = {
  modulo_slug: string;
  payload: ValidatedQuestao;
};

export type ApplyLoteOptions = {
  dryRun: boolean;
  strictGabarito: boolean;
  allowInsert: boolean;
};

export type ApplyLoteRowResult = {
  modulo_slug: string;
  status: 'ok' | 'skipped' | 'failed';
  mode: 'update' | 'insert' | 'skip';
  detail?: string;
};

export async function applyLoteToSupabase(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  items: ApplyLoteItem[],
  options: ApplyLoteOptions,
): Promise<{ results: ApplyLoteRowResult[]; appliedSlugs: string[] }> {
  const results: ApplyLoteRowResult[] = [];
  const appliedSlugs: string[] = [];

  for (const item of items) {
    const { modulo_slug: slug, payload } = item;
    const conteudoJson = buildConteudoJson(payload, slug);
    const instruction = payload.question_data.instruction;
    const contentHash = await generateContentHash(instruction);
    const localCorrect = correctOptionId(payload);

    const { data: row, error: fetchError } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (fetchError) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail: fetchError.message,
      });
      continue;
    }

    if (!row) {
      if (!options.allowInsert) {
        results.push({
          modulo_slug: slug,
          status: 'skipped',
          mode: 'skip',
          detail: 'slug não encontrado (use --allow-insert)',
        });
        continue;
      }

      if (options.dryRun) {
        results.push({
          modulo_slug: slug,
          status: 'ok',
          mode: 'insert',
          detail: 'dry-run: would insert',
        });
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('modulos_estudo')
        .insert([
          {
            modulo_nome: payload.meta.topico,
            titulo_aula: payload.meta.subtopico || payload.meta.topico,
            modulo_slug: slug,
            conteudo_json: conteudoJson,
            banca: payload.meta.banca.toUpperCase(),
            content_hash: contentHash,
          },
        ])
        .select('id')
        .single();

      if (insertError || !inserted) {
        results.push({
          modulo_slug: slug,
          status: 'failed',
          mode: 'insert',
          detail: insertError?.message ?? 'insert falhou',
        });
        continue;
      }

      try {
        const concursoId = await getDefaultConcursoId();
        await linkModuloToConcurso(concursoId, inserted.id, 'publicacao');
      } catch (linkErr) {
        results.push({
          modulo_slug: slug,
          status: 'ok',
          mode: 'insert',
          detail: `inserida; vínculo concurso falhou: ${
            linkErr instanceof Error ? linkErr.message : 'erro'
          }`,
        });
        appliedSlugs.push(slug);
        continue;
      }

      results.push({
        modulo_slug: slug,
        status: 'ok',
        mode: 'insert',
        detail: 'inserida e vinculada ao concurso',
      });
      appliedSlugs.push(slug);
      continue;
    }

    if (options.strictGabarito) {
      const dbCorrect = correctOptionId(row.conteudo_json);
      if (dbCorrect && localCorrect && dbCorrect !== localCorrect) {
        results.push({
          modulo_slug: slug,
          status: 'failed',
          mode: 'update',
          detail: `gabarito diverge: DB=${dbCorrect} local=${localCorrect}`,
        });
        continue;
      }
    }

    if (options.dryRun) {
      results.push({
        modulo_slug: slug,
        status: 'ok',
        mode: 'update',
        detail: 'dry-run: would update conteudo_json',
      });
      continue;
    }

    let { error: updateError } = await supabase
      .from('modulos_estudo')
      .update({
        conteudo_json: conteudoJson,
        content_hash: contentHash,
        banca: payload.meta.banca.toUpperCase(),
        modulo_nome: payload.meta.topico,
        titulo_aula: payload.meta.subtopico || payload.meta.topico,
      })
      .eq('id', row.id);

    if (updateError?.message?.includes('uniq_modulos_estudo_content_hash')) {
      const retry = await supabase
        .from('modulos_estudo')
        .update({
          conteudo_json: conteudoJson,
          banca: payload.meta.banca.toUpperCase(),
          modulo_nome: payload.meta.topico,
          titulo_aula: payload.meta.subtopico || payload.meta.topico,
        })
        .eq('id', row.id);
      updateError = retry.error;
    }

    if (updateError) {
      results.push({
        modulo_slug: slug,
        status: 'failed',
        mode: 'update',
        detail: updateError.message,
      });
      continue;
    }

    results.push({
      modulo_slug: slug,
      status: 'ok',
      mode: 'update',
      detail: 'conteudo_json aplicado',
    });
    appliedSlugs.push(slug);
  }

  if (!options.dryRun && appliedSlugs.length > 0) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
      await invalidateQuestaoSlugsCache(appliedSlugs);
    } catch {
      // CLI fora do Next.js — esperado
    }
  }

  return { results, appliedSlugs };
}
