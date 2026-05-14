import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CalendarDays, Landmark, MapPin, Sparkles } from 'lucide-react';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';
import {
  CAMPINA_GRANDE_2026_SLUG,
  CAMPINA_GRANDE_LANDING_HREF,
  GERAL_CONCURSO_SLUG,
  getActiveMatriculatedConcursoIds,
} from '@/lib/concursos/entitlements';
import { createSupabaseServerClient, getServerSession } from '@/lib/supabase/server-auth';
import { getAbsoluteUrl } from '@/lib/siteUrl';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SellableConcursoCard = {
  id: string;
  slug: string;
  nome: string;
  orgao: string | null;
  banca: string | null;
  cidade: string | null;
  data_prova: string | null;
  price_cents: number;
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

async function loadSellableConcursos(): Promise<SellableConcursoCard[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('concursos')
    .select('id, slug, nome, orgao, banca, cidade, data_prova, price_cents, status, created_at')
    .eq('status', 'ativo')
    .gt('price_cents', 0)
    .neq('slug', GERAL_CONCURSO_SLUG)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as SellableConcursoCard[];
}

export const metadata: Metadata = {
  title: 'Planos e editais | AVANT',
  description:
    'Escolha o edital de Técnico em Enfermagem com acesso a questões, Estudo Reverso e plano de estudo no AVANT.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e editais | AVANT',
    description:
      'Catálogo de editais com acesso completo ao estudo: questões reais, NeuroSlides e revisão guiada.',
    url: getAbsoluteUrl('/planos'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planos e editais | AVANT',
    description: 'Escolha o edital e libere o catálogo de estudo no AVANT.',
  },
};

export default async function PlanosPage({ searchParams }: PageProps) {
  const [session, resolvedSearch, concursos] = await Promise.all([
    getServerSession(),
    searchParams,
    loadSellableConcursos().catch(() => [] as SellableConcursoCard[]),
  ]);

  const userId = session?.user?.id;
  const activeConcursoIds = userId
    ? new Set(await getActiveMatriculatedConcursoIds(userId).catch(() => [] as string[]))
    : new Set<string>();

  const statusParam = resolvedSearch.status;
  const checkoutStatus = Array.isArray(statusParam) ? statusParam[0] : statusParam;
  const checkoutCancelled = checkoutStatus === 'cancelled';
  const loginHref = `/login?next=${encodeURIComponent('/planos')}`;
  const isAuthenticated = Boolean(userId);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <div className="pointer-events-none fixed inset-0">
        <PlanosBackdrop />
      </div>

      <PublicDarkSiteHeader ctaLabel="Criar conta grátis" ctaLabelShort="Criar conta" />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-[10px] font-black tracking-[0.22em] text-cyan-200 uppercase sm:text-xs">
              <Sparkles size={14} className="shrink-0" aria-hidden />
              Acesso por edital
            </p>

            <h1 className="text-4xl leading-[1.08] font-[1000] tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                Escolha o edital para estudar
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed font-medium text-slate-400">
              {isAuthenticated
                ? 'Selecione o concurso que você quer preparar. O acesso libera questões, Estudo Reverso e o plano de estudo do edital.'
                : 'Veja os editais disponíveis e entre na sua conta para concluir a compra com pagamento seguro.'}
            </p>

            {!isAuthenticated ? (
              <p className="mt-6 text-sm text-slate-500">
                Já tem conta?{' '}
                <Link
                  href={loginHref}
                  className="font-semibold text-cyan-200 transition-colors hover:text-white"
                >
                  Entrar
                </Link>
              </p>
            ) : null}
          </div>

          {checkoutCancelled ? (
            <div
              className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100"
              role="status"
            >
              Pagamento cancelado. Você pode escolher outro edital ou tentar novamente quando quiser.
            </div>
          ) : null}

          {concursos.length > 0 ? (
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {concursos.map((concurso) => (
                <li key={concurso.id}>
                  <PlanoCard
                    concurso={concurso}
                    hasAccess={activeConcursoIds.has(concurso.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCatalog />
          )}
        </section>
      </main>
    </div>
  );
}

function PlanosBackdrop() {
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

function PlanoCard({
  concurso,
  hasAccess,
}: {
  concurso: SellableConcursoCard;
  hasAccess: boolean;
}) {
  const href =
    concurso.slug === CAMPINA_GRANDE_2026_SLUG
      ? CAMPINA_GRANDE_LANDING_HREF
      : `/concursos/${concurso.slug}/comprar`;
  const priceLabel = formatPriceBRL(concurso.price_cents);
  const provaLabel = formatProvaDate(concurso.data_prova);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all hover:border-cyan-400/25 hover:bg-white/[0.04]"
    >
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">Edital</p>
          {hasAccess ? (
            <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black tracking-[0.14em] text-emerald-200 uppercase">
              Você já tem acesso
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-xl font-black tracking-tight text-white transition-colors group-hover:text-cyan-100">
          {concurso.nome}
        </h2>

        <dl className="mt-5 space-y-3 text-sm">
          {concurso.orgao ? (
            <MetaRow icon={Building2} label="Órgão" value={concurso.orgao} />
          ) : null}
          {concurso.banca ? (
            <MetaRow icon={Landmark} label="Banca" value={concurso.banca} />
          ) : null}
          {concurso.cidade ? (
            <MetaRow icon={MapPin} label="Cidade" value={concurso.cidade} />
          ) : null}
          {provaLabel ? (
            <MetaRow icon={CalendarDays} label="Data da prova" value={provaLabel} />
          ) : null}
        </dl>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">A partir de</p>
          <p className="mt-1 text-2xl font-[1000] tracking-tight text-white">{priceLabel}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#BEF264]">
          Ver pacote
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden />
      <div>
        <dt className="text-[10px] font-black tracking-[0.18em] text-slate-500 uppercase">{label}</dt>
        <dd className="mt-1 font-semibold text-slate-200">{value}</dd>
      </div>
    </div>
  );
}

function EmptyCatalog() {
  return (
    <p className="mx-auto mt-12 max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center text-sm text-slate-400">
      Nenhum edital comercial está disponível no momento. Volte em breve ou acompanhe as novidades no blog.
    </p>
  );
}
