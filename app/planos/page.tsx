import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Landmark,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';
import { listPublishedLpPagesForCatalog } from '@/lib/lp/pages';
import { lpPublicHref, type LpCatalogItem } from '@/lib/lp/shared';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Concursos abertos | AVANT',
  description:
    'Editais de Técnico em Enfermagem em destaque no AVANT. Estudo Reverso com questões reais e NeuroSlides — assinatura AVANT Pro.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Concursos abertos | AVANT',
    description:
      'Veja os concursos em destaque e prepare-se com o padrão de cada banca no AVANT Pro.',
    url: getAbsoluteUrl('/planos'),
    type: 'website',
    locale: 'pt_BR',
  },
};

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
    <div className="flex gap-2 text-sm text-slate-300">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
      <div>
        <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</dt>
        <dd className="font-medium text-slate-200">{value}</dd>
      </div>
    </div>
  );
}

function LpCatalogCard({ item }: { item: LpCatalogItem }) {
  const href = lpPublicHref(item.path);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all hover:border-cyan-400/25 hover:bg-white/[0.04]"
    >
      <div className="flex-1">
        <p className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">
          Concurso em destaque
        </p>
        <h2 className="mt-3 text-xl font-black tracking-tight text-white transition-colors group-hover:text-cyan-100">
          {item.cidade}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{item.headline}</p>

        <dl className="mt-5 space-y-3">
          <MetaRow icon={Landmark} label="Banca" value={item.banca} />
          <MetaRow icon={Building2} label="Órgão" value={item.orgao} />
          <MetaRow icon={MapPin} label="Cargo" value={item.cargo} />
          <MetaRow icon={CalendarDays} label="Data da prova" value={item.dataProvaFormatada} />
        </dl>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.22em] text-slate-500 uppercase">
            Inscrições
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-200">{item.statusInscricoes}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-[#BEF264]">
          Ver página
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default async function PlanosPage() {
  const catalog = await listPublishedLpPagesForCatalog();

  return (
    <div className="min-h-screen bg-[#010409] text-slate-100">
      <PublicDarkSiteHeader
        ctaLabel="Comece grátis"
        ctaLabelShort="Grátis"
        ctaLabelTight="Grátis →"
        ctaHref="/register"
        showProSubscribe
        showPlanosLink={false}
      />

      <main className="relative overflow-hidden px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[480px] w-[min(120%,900px)] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-cyan-200 uppercase">
              <Sparkles size={12} aria-hidden />
              Concursos abertos
            </p>
            <h1 className="mt-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
              Editais em destaque para Técnico em Enfermagem
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Escolha o concurso que você está acompanhando. Cada página traz o contexto do edital e
              o caminho para assinar o{' '}
              <span className="font-semibold text-white">AVANT Pro</span> — estudo com questões
              reais e NeuroSlides.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Já tem conta?{' '}
              <Link href="/login" className="font-bold text-cyan-300 hover:text-cyan-200">
                Entrar
              </Link>
            </p>
          </div>

          {catalog.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-300">
                Nenhum concurso em destaque no momento.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Volte em breve ou assine o AVANT Pro para estudar com acesso completo à plataforma.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/assinar-pro"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#BEF264] px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950"
                >
                  Assinar AVANT Pro
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-200"
                >
                  Ver blog
                </Link>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {catalog.map((item) => (
                <li key={item.path}>
                  <LpCatalogCard item={item} />
                </li>
              ))}
            </ul>
          )}

          {catalog.length > 0 ? (
            <section className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-center sm:p-8">
              <p className="text-sm text-slate-400">
                Quer acesso completo a todos os editais e questões ilimitadas?
              </p>
              <Link
                href="/assinar-pro"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#BEF264] px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-transform hover:scale-[1.02]"
              >
                Assinar AVANT Pro
                <ArrowRight size={16} aria-hidden />
              </Link>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
