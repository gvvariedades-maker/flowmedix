import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { QuestaoCompleta } from '@/types/lesson';
import { SlideMoldReviewPanels } from './SlideMoldReviewPanels';

type VisualAnchorsFile = {
  anchors: Record<
    string,
    { pedagogical_branch: string; json_path: string; slug: string; lote: string }
  >;
};

function loadQuestaoFromPath(jsonPath: string): QuestaoCompleta {
  const full = resolve(process.cwd(), jsonPath);
  if (!existsSync(full)) {
    throw new Error(`JSON não encontrado: ${full}`);
  }
  return JSON.parse(readFileSync(full, 'utf8')) as QuestaoCompleta;
}

type PageProps = {
  searchParams: Promise<{ branch?: string }>;
};

/** Dev-only — regressão visual por molde L3 (Playwright). */
export default async function SlideMoldReviewPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { branch: branchParam } = await searchParams;
  const anchorsPath = resolve(process.cwd(), 'data/catalog-migration/visual-anchors.json');
  const anchorsFile = JSON.parse(readFileSync(anchorsPath, 'utf8')) as VisualAnchorsFile;

  const branch = branchParam ?? Object.keys(anchorsFile.anchors)[0];
  const anchor = branch ? anchorsFile.anchors[branch] : undefined;
  if (!anchor) {
    notFound();
  }

  const questao = loadQuestaoFromPath(anchor.json_path);

  return <SlideMoldReviewPanels questao={questao} branch={anchor.pedagogical_branch} />;
}
