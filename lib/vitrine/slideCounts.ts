import { countNeuroSlidesInConteudoJson } from '@/lib/neuroslideCount';
import { createServerSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const SLIDE_COUNT_CHUNK = 500;

/** Mapa `modulo_id` → quantidade de NeuroSlides no JSON da questão. */
export async function fetchSlideCountsByModuloIds(ids: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return map;

  const supabase = await createServerSupabase();

  for (let offset = 0; offset < uniqueIds.length; offset += SLIDE_COUNT_CHUNK) {
    const chunk = uniqueIds.slice(offset, offset + SLIDE_COUNT_CHUNK);
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, conteudo_json')
      .in('id', chunk);

    if (error) {
      logger.warn('fetchSlideCountsByModuloIds falhou', {
        chunkSize: chunk.length,
        code: error.code,
        message: error.message,
      });
      continue;
    }

    for (const row of data ?? []) {
      map.set(row.id, countNeuroSlidesInConteudoJson(row.conteudo_json));
    }
  }

  return map;
}
