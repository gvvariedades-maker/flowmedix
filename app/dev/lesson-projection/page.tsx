import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { notFound } from 'next/navigation';

import { findPacoteBySubtopico, loadHandcraftRegistry } from '@/lib/catalogMigration/handcraftRegistry';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildLessonProjection,
  gradeFixationCoverage,
  type LessonProjectionInput,
} from '@/lib/lesson/lessonProjection';
import {
  LESSON_PROJECTION_PILOT_SUBTOPICOS,
  isLessonProjectionEnabled,
} from '@/lib/lesson/lessonProjectionConfig';
import { LessonProjectionScreens } from './LessonProjectionScreens';

type PageProps = {
  searchParams: Promise<{ slug?: string; escolha?: string }>;
};

const PILOT_SUBTOPICO = LESSON_PROJECTION_PILOT_SUBTOPICOS[0];

function pilotQuestionFiles(): { slug: string; path: string }[] {
  const found = findPacoteBySubtopico(loadHandcraftRegistry(), PILOT_SUBTOPICO);
  if (!found) return [];

  const root = resolve(process.cwd(), 'data/catalog-migration');
  const lotes = readdirSync(root)
    .filter((name) => {
      if (!name.startsWith(`${found.pacote.pacote_prefix}-g`)) return false;
      const dir = join(root, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, 'manifest.json'));
    })
    .sort();

  const bySlug = new Map<string, string>();
  for (const lote of lotes) {
    const dir = loteQuestionsDir(lote);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      bySlug.set(file.replace(/\.json$/, ''), join(dir, file));
    }
  }
  return [...bySlug.entries()].sort().map(([slug, path]) => ({ slug, path }));
}

/** Dev-only — experimento das 2 telas (F7) sobre o piloto Farmacodinâmica. */
export default async function LessonProjectionPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production' || !isLessonProjectionEnabled()) {
    notFound();
  }

  const { slug, escolha: escolhaParam } = await searchParams;
  const files = pilotQuestionFiles();
  const selected = slug ? files.find((f) => f.slug === slug) : undefined;

  if (!selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-6" data-testid="lesson-projection-index">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Projeção de 2 telas · piloto
          </p>
          <h1 className="text-xl font-semibold text-slate-900">{PILOT_SUBTOPICO}</h1>
          <p className="text-sm text-slate-600">
            {files.length} slugs · mesma questão em JSON, reagrupada em Aula + Prova
          </p>
        </header>
        <ul className="space-y-1 text-sm">
          {files.map((file) => (
            <li key={file.slug}>
              <a
                className="text-cyan-700 underline-offset-2 hover:underline"
                href={`/dev/lesson-projection?slug=${encodeURIComponent(file.slug)}`}
              >
                {file.slug}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const payload = JSON.parse(readFileSync(selected.path, 'utf8')) as LessonProjectionInput;
  const projection = buildLessonProjection({ ...payload, slug: selected.slug });
  const coverage = gradeFixationCoverage(projection);

  const letras = new Set(projection.prova.prediction_gate.options.map((o) => o.id));
  const escolha = escolhaParam && letras.has(escolhaParam) ? escolhaParam : null;
  const gabarito = escolha
    ? (payload.question_data?.options?.find((o) => o.is_correct)?.id ?? null)
    : null;

  // Antes do compromisso, a resposta não existe nem no que a página renderiza.
  const visivel = escolha
    ? projection
    : {
        ...projection,
        prova: {
          ...projection.prova,
          elimination: [],
          distractor_cards: [],
          fixacao: { transfer: [], explicit_count: 0 },
        },
      };

  return (
    <div className="min-h-screen bg-slate-100 p-6" data-testid="lesson-projection-detail">
      <header className="mb-6">
        <a className="text-xs text-cyan-700 underline-offset-2 hover:underline" href="/dev/lesson-projection">
          ← {PILOT_SUBTOPICO}
        </a>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">{selected.slug}</h1>
        <p className="text-sm text-slate-600">
          fixação: {coverage.grade} · transferência: {coverage.transfer_count} · redundância removida:{' '}
          {projection.dropped_redundant.length}
        </p>
      </header>
      <LessonProjectionScreens
        projection={visivel}
        escolha={escolha}
        gabarito={gabarito}
        hrefForEscolha={(optionId) =>
          `/dev/lesson-projection?slug=${encodeURIComponent(selected.slug)}&escolha=${encodeURIComponent(optionId)}`
        }
      />
    </div>
  );
}
