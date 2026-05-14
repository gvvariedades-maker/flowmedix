import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Landmark,
} from 'lucide-react';
import { ComprarConcursoCta } from '@/components/concursos/ComprarConcursoCta';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';
import {
  CAMPINA_GRANDE_2026_SLUG,
  CAMPINA_GRANDE_LANDING_HREF,
  GERAL_CONCURSO_SLUG,
  getConcursoBySlug,
  userHasActiveMatricula,
} from '@/lib/concursos/entitlements';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { getAbsoluteUrl } from '@/lib/siteUrl';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type VitrineModuloRow = {
  modulo_nome: string | null;
  modulo_slug: string;
  banca: string;
};

type ConcursoModuloLinkRow = {
  modulos_estudo: VitrineModuloRow | VitrineModuloRow[] | null;
};

function formatPriceBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatProvaDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function pickEmbeddedModulo(row: ConcursoModuloLinkRow): VitrineModuloRow | null {
  const embedded = row.modulos_estudo;
  if (!embedded) return null;
  if (Array.isArray(embedded)) return embedded[0] ?? null;
  return embedded;
}

function listVitrineModulos(rows: ConcursoModuloLinkRow[]): VitrineModuloRow[] {
  const bySlug = new Map<string, VitrineModuloRow>();

  for (const row of rows) {
    const modulo = pickEmbeddedModulo(row);
    if (!modulo?.modulo_slug) continue;
    if (bySlug.has(modulo.modulo_slug)) continue;
    bySlug.set(modulo.modulo_slug, modulo);
  }

  return [...bySlug.values()].sort((a, b) => {
    const nameA = (a.modulo_nome || a.modulo_slug).toLocaleLowerCase('pt-BR');
    const nameB = (b.modulo_nome || b.modulo_slug).toLocaleLowerCase('pt-BR');
    return nameA.localeCompare(nameB, 'pt-BR');
  });
}

async function loadVitrineModulos(concursoId: string): Promise<VitrineModuloRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('concurso_modulos')
    .select('modulos_estudo(modulo_nome, modulo_slug, banca)')
    .eq('concurso_id', concursoId);

  if (error) throw error;

  return listVitrineModulos((data ?? []) as ConcursoModuloLinkRow[]);
}

function readSearchFlag(
  search: Record<string, string | string[] | undefined>,
  key: string,
): boolean {
  const value = search[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '1' || raw === 'sucesso';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === CAMPINA_GRANDE_2026_SLUG) {
    permanentRedirect(CAMPINA_GRANDE_LANDING_HREF);
  }
  if (slug === GERAL_CONCURSO_SLUG) {
    return { title: 'Concurso indisponível | AVANT' };
  }

  const concurso = await getConcursoBySlug(slug).catch(() => null);
  if (!concurso || concurso.status !== 'ativo' || !concurso.price_cents || concurso.price_cents <= 0) {
    return { title: 'Concurso indisponível | AVANT' };
  }

  const description = `Acesso ao edital ${concurso.nome} com questões, Estudo Reverso e plano de estudo no AVANT.`;
  const canonical = `/concursos/${concurso.slug}/comprar`;

  return {
    title: `Comprar acesso — ${concurso.nome} | AVANT`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `Comprar acesso — ${concurso.nome}`,
      description,
      url: getAbsoluteUrl(canonical),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Comprar acesso — ${concurso.nome}`,
      description,
    },
  };
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function ComprarConcursoPage({ params, searchParams }: PageProps) {
  const [{ slug }, resolvedSearch] = await Promise.all([params, searchParams]);

  if (slug === CAMPINA_GRANDE_2026_SLUG) {
    permanentRedirect(CAMPINA_GRANDE_LANDING_HREF);
  }

  if (slug === GERAL_CONCURSO_SLUG) {
    notFound();
  }

  const concurso = await getConcursoBySlug(slug).catch(() => null);
  if (!concurso || concurso.status !== 'ativo') {
    notFound();
  }

  if (!concurso.price_cents || concurso.price_cents <= 0) {
    redirect('/planos');
  }

  const [modulos, session] = await Promise.all([
    loadVitrineModulos(concurso.id),
    getServerSession(),
  ]);

  const userId = session?.user?.id;
  const hasActiveMatricula = userId
    ? await userHasActiveMatricula(userId, concurso.id).catch(() => false)
    : false;

  const paymentSuccess = readSearchFlag(resolvedSearch, 'compra');
  const paymentCancelled = readSearchFlag(resolvedSearch, 'cancelado');

  const provaLabel = formatProvaDate(concurso.data_prova);
  const priceLabel = formatPriceBRL(concurso.price_cents);
  const loginHref = `/login?next=${encodeURIComponent(`/concursos/${concurso.slug}/comprar`)}`;

  const metaItems = [
    concurso.orgao
      ? { icon: Building2, label: 'Órgão', value: concurso.orgao }
      : null,
    concurso.banca
      ? { icon: Landmark, label: 'Banca', value: concurso.banca }
      : null,
    concurso.ano != null
      ? { icon: BookOpen, label: 'Ano', value: String(concurso.ano) }
      : null,
    provaLabel
      ? { icon: CalendarDays, label: 'Data da prova', value: provaLabel }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Building2;
    label: string;
    value: string;
  }>;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <div className="pointer-events-none fixed inset-0">
        <ComprarBackdrop />
      </div>

      <PublicDarkSiteHeader
        ctaLabel="Ver planos"
        ctaLabelShort="Planos"
        ctaHref="/planos"
      />

      <main className="relative z-10">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link href="/planos" className="font-medium transition-colors hover:text-slate-300">
              Planos
            </Link>
            <span className="mx-2 text-slate-600">→</span>
            <span className="line-clamp-2 text-slate-500">{concurso.nome}</span>
          </nav>

          {paymentSuccess ? (
            <div
              className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100"
              role="status"
            >
              Pagamento recebido. Se o acesso ainda não aparecer, aguarde alguns instantes e
              atualize a página.
            </div>
          ) : null}

          {paymentCancelled ? (
            <div
              className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100"
              role="status"
            >
              Pagamento cancelado. Você pode tentar novamente quando quiser.
            </div>
          ) : null}

          <header className="mt-8">
            <p className="text-[10px] font-black tracking-[0.22em] text-cyan-200 uppercase">
              Acesso ao edital
            </p>
            <h1 className="mt-3 text-4xl leading-[1.08] font-[1000] tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                {concurso.nome}
              </span>
            </h1>
            {concurso.cidade ? (
              <p className="mt-4 text-lg font-medium text-slate-400">{concurso.cidade}</p>
            ) : null}
          </header>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div className="space-y-8">
              {metaItems.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {metaItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MetaCard
                        key={item.label}
                        icon={<Icon size={18} className="text-cyan-300" aria-hidden />}
                        label={item.label}
                        value={item.value}
                      />
                    );
                  })}
                </div>
              ) : null}

              <section aria-labelledby="incluso-heading">
                <h2
                  id="incluso-heading"
                  className="text-lg font-black tracking-tight text-white"
                >
                  O que está incluso
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  O acesso libera o catálogo de estudo deste edital no AVANT.
                </p>

                {modulos.length > 0 ? (
                  <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                    {modulos.map((modulo) => (
                      <li
                        key={modulo.modulo_slug}
                        className="flex items-start justify-between gap-4 px-4 py-3.5"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {modulo.modulo_nome || modulo.modulo_slug}
                          </p>
                          <p className="mt-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                            {modulo.banca}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                    As disciplinas deste edital serão publicadas em breve.
                  </p>
                )}
              </section>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm">
              <p className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">
                Investimento
              </p>
              <p className="mt-3 text-4xl font-[1000] tracking-tight text-white">{priceLabel}</p>
              <p className="mt-2 text-sm text-slate-400">
                Pagamento seguro via Stripe. Acesso liberado após a confirmação.
              </p>
              {provaLabel ? (
                <p className="mt-3 text-sm text-slate-400">
                  Prova em {provaLabel}. Acesso até 30 dias após a data da prova.
                </p>
              ) : null}

              <div className="mt-6">
                {hasActiveMatricula ? (
                  <div className="space-y-4">
                    <ActiveAccessPanel />
                  </div>
                ) : (
                  <ComprarConcursoCta
                    concursoSlug={concurso.slug}
                    isAuthenticated={Boolean(userId)}
                    loginHref={loginHref}
                  />
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function ComprarBackdrop() {
  return (
    <>
      <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute right-[-10%] bottom-[-12%] h-[500px] w-[500px] rounded-full bg-[#BEF264]/10 blur-[110px]" />
      <div className="absolute top-1/2 left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </>
  );
}

function ActiveAccessPanel() {
  return (
    <>
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
        <div>
          <p className="font-bold text-emerald-100">Você já tem acesso</p>
          <p className="mt-1 text-sm text-emerald-100/80">
            Sua matrícula neste edital está ativa.
          </p>
        </div>
      </div>
      <Link
        href="/estudar"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-5 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.01] hover:bg-[#d4f879]"
      >
        Ir para estudar
        <ArrowRight size={18} aria-hidden />
      </Link>
    </>
  );
}
