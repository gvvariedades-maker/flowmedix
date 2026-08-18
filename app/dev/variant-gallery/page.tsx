import { notFound } from 'next/navigation';
import {
  listDeclaredVariants,
  type SlideTypeKey,
} from '@/lib/neurocanvas/declaredVariants';
import { VariantGalleryClient } from './VariantGalleryClient';

type PageProps = {
  searchParams: Promise<{
    type?: string;
    variant?: string;
    fixture?: string;
    both?: string;
  }>;
};

const SLIDE_TYPES: SlideTypeKey[] = [
  'concept_map',
  'golden_rule',
  'logic_flow',
  'danger_zone',
];

function isSlideType(v: string | undefined): v is SlideTypeKey {
  return !!v && (SLIDE_TYPES as string[]).includes(v);
}

/** Dev-only — galeria de layoutVariant (fixture padrão + estresse) para snapshots. */
export default async function VariantGalleryPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const params = await searchParams;
  const declared = listDeclaredVariants();

  // Índice: lista todas as variantes com links
  if (!params.variant || !isSlideType(params.type)) {
    const grouped = SLIDE_TYPES.map((type) => ({
      type,
      entries: declared.filter((d) => d.slideType === type),
    }));

    return (
      <div className="min-h-screen bg-slate-100 p-6" data-testid="variant-gallery-index">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            NeuroSlides · variant gallery
          </p>
          <h1 className="text-xl font-semibold text-slate-900">Índice de layoutVariant</h1>
          <p className="text-sm text-slate-600">
            {declared.length} entradas · use ?type=&amp;variant=&amp;fixture=default|stress ou both=1
          </p>
        </header>
        <div className="grid gap-8 lg:grid-cols-2">
          {grouped.map(({ type, entries }) => (
            <section key={type} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                {type} ({entries.length})
              </h2>
              <ul className="max-h-[480px] space-y-1 overflow-y-auto text-sm">
                {entries.map((e) => (
                  <li key={e.key}>
                    <a
                      className="text-cyan-700 underline-offset-2 hover:underline"
                      href={`/dev/variant-gallery?type=${encodeURIComponent(type)}&variant=${encodeURIComponent(e.id)}&both=1`}
                    >
                      {e.id}
                      {e.generic ? ' · generic' : ''}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  const slideType = params.type;
  const variant = params.variant.trim();
  if (!variant) notFound();

  const fixture =
    params.fixture === 'stress' ? 'stress' : ('default' as const);
  const bothFixtures = params.both === '1' || params.both === 'true';

  return (
    <VariantGalleryClient
      slideType={slideType}
      variant={variant}
      fixture={fixture}
      bothFixtures={bothFixtures}
    />
  );
}
