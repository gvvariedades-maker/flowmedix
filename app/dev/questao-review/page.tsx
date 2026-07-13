import { notFound } from 'next/navigation';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { getQuestaoBySlugCached } from '@/lib/cache';
import type { QuestaoCompleta } from '@/types/lesson';
import { QuestaoReviewPanels } from './QuestaoReviewPanels';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

type VisualAnchorsFile = {
  anchors: Record<string, { slug?: string; json_path?: string; lote?: string }>;
};

function readQuestaoJson(filePath: string): QuestaoCompleta | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8')) as QuestaoCompleta;
}

/** Slug duplicado em vários lotes — prioriza visual-anchors (handcraft canônico). */
function loadFromVisualAnchors(slug: string): QuestaoCompleta | null {
  const anchorsPath = resolve(process.cwd(), 'data/catalog-migration/visual-anchors.json');
  if (!existsSync(anchorsPath)) return null;

  const registry = JSON.parse(readFileSync(anchorsPath, 'utf8')) as VisualAnchorsFile;
  for (const entry of Object.values(registry.anchors)) {
    if (entry.slug?.trim() !== slug || !entry.json_path?.trim()) continue;
    const fromPath = readQuestaoJson(resolve(process.cwd(), entry.json_path));
    if (fromPath) return fromPath;
  }
  return null;
}

async function loadLocalQuestao(slug: string, lote?: string): Promise<QuestaoCompleta | null> {
  const examplesPath = resolve(process.cwd(), `examples/${slug}.json`);
  const fromExamples = readQuestaoJson(examplesPath);
  if (fromExamples) return fromExamples;

  if (lote?.trim()) {
    const fromLote = readQuestaoJson(resolve(loteQuestionsDir(lote.trim()), `${slug}.json`));
    if (fromLote) return fromLote;
  }

  const fromAnchor = loadFromVisualAnchors(slug);
  if (fromAnchor) return fromAnchor;

  const migrationRoot = resolve(process.cwd(), 'data/catalog-migration');
  if (!existsSync(migrationRoot)) return null;

  for (const dir of readdirSync(migrationRoot)) {
    const fromScan = readQuestaoJson(resolve(loteQuestionsDir(dir), `${slug}.json`));
    if (fromScan) return fromScan;
  }
  return null;
}

async function loadSupabaseQuestao(slug: string): Promise<QuestaoCompleta | null> {
  const row = await getQuestaoBySlugCached(slug);
  if (!row?.conteudo_json) return null;
  return row.conteudo_json as QuestaoCompleta;
}

type PageProps = {
  searchParams: Promise<{ slug?: string; source?: string; lote?: string }>;
};

/** Dev-only — preview player + NeuroSlides para capture L4. */
export default async function QuestaoReviewPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { slug, source = 'local', lote } = await searchParams;
  if (!slug?.trim()) {
    notFound();
  }

  const questao =
    source === 'supabase'
      ? await loadSupabaseQuestao(slug)
      : await loadLocalQuestao(slug, lote);

  if (!questao) {
    notFound();
  }

  return <QuestaoReviewPanels questao={questao} slug={slug} source={source} />;
}
