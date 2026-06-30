import { notFound } from 'next/navigation';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServerSupabase } from '@/lib/supabase/server';
import type { QuestaoCompleta } from '@/types/lesson';
import { QuestaoReviewPanels } from './QuestaoReviewPanels';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

async function loadLocalQuestao(slug: string): Promise<QuestaoCompleta | null> {
  const examplesPath = resolve(process.cwd(), `examples/${slug}.json`);
  if (existsSync(examplesPath)) {
    return JSON.parse(readFileSync(examplesPath, 'utf8')) as QuestaoCompleta;
  }

  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  if (!existsSync(migrationRoot)) return null;

  for (const lote of readdirSync(migrationRoot)) {
    const file = resolve(loteQuestionsDir(lote), `${slug}.json`);
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf8')) as QuestaoCompleta;
    }
  }
  return null;
}

async function loadSupabaseQuestao(slug: string): Promise<QuestaoCompleta | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('modulos_estudo')
    .select('conteudo_json')
    .eq('modulo_slug', slug)
    .maybeSingle();
  if (error || !data?.conteudo_json) return null;
  return data.conteudo_json as QuestaoCompleta;
}

type PageProps = {
  searchParams: Promise<{ slug?: string; source?: string }>;
};

/** Dev-only — preview player + NeuroSlides para capture L4. */
export default async function QuestaoReviewPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { slug, source = 'local' } = await searchParams;
  if (!slug?.trim()) {
    notFound();
  }

  const questao =
    source === 'supabase'
      ? await loadSupabaseQuestao(slug)
      : await loadLocalQuestao(slug);

  if (!questao) {
    notFound();
  }

  return <QuestaoReviewPanels questao={questao} slug={slug} source={source} />;
}
