'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
  Zap,
} from 'lucide-react';

export interface LPConcursoConfig {
  concurso: {
    cidade: string;
    cargo: string;
    banca: string;
    nomeBanca: string;
    vagas: string;
    vagasPCD: string;
    dataProva: string;
    dataProvaFormatada: string;
    statusInscricoes: string;
    remuneracao: string;
    taxaInscricao: string;
    orgao: string;
  };
  copy: {
    headlinePrincipal: string;
    subtitulo: string;
    dores: [string, string, string];
    perigosBanca: [string, string, string];
    listaBeneficios: string[];
    disclaimer: string;
    disclaimerLegal: string;
  };
  walkthrough: {
    imagens: string[];
  };
}

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const GERAL_CONCURSO_SLUG = 'geral';

const WALKTHROUGH_CAPTIONS = [
  'Questão real da banca',
  'Você escolhe sua resposta',
  'Gabarito imediato',
  'Diagnóstico do erro',
  'NeuroSlide: Mapa Mental',
  'NeuroSlide: Regra de Ouro',
  'NeuroSlide: Fluxo Lógico',
  'NeuroSlide: Zona de Perigo',
] as const;

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDaysUntilProva(isoDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = parseLocalDate(isoDate);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((targetDay.getTime() - today.getTime()) / ONE_DAY_IN_MS);
}

function CountdownDays({
  dataProva,
  dataProvaFormatada,
  variant = 'hero',
}: {
  dataProva: string;
  dataProvaFormatada: string;
  variant?: 'hero' | 'cta';
}) {
  const [daysUntil] = useState(() => getDaysUntilProva(dataProva));
  const isPast = daysUntil <= 0;

  if (variant === 'hero') {
    return (
      <p className="text-lg font-black tracking-tight text-cyan-100 sm:text-xl">
        {isPast ? 'Prova realizada' : `Faltam ${daysUntil} dias para a prova`}
      </p>
    );
  }

  return (
    <p className="text-center text-base font-semibold text-slate-300 sm:text-lg">
      {isPast
        ? `A prova era em ${dataProvaFormatada}.`
        : `A prova é em ${dataProvaFormatada}. Faltam ${daysUntil} dias.`}
    </p>
  );
}

function CheckoutButton({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseClassName =
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-6 py-4 text-base font-black text-slate-950 transition-all hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60';

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pagamentos/criar-sessao', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concurso_slug: GERAL_CONCURSO_SLUG }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        redirectUrl?: string;
      };

      if (response.status === 409 && payload.redirectUrl) {
        router.push(payload.redirectUrl);
        return;
      }

      if (response.status === 400 && payload.redirectUrl) {
        router.push(payload.redirectUrl);
        return;
      }

      if (response.status === 401) {
        setError(payload.error || 'Faça login para concluir esta compra ou tente novamente.');
        return;
      }

      if (!response.ok) {
        setError(payload.error || 'Não foi possível iniciar o pagamento.');
        return;
      }

      if (!payload.url) {
        setError('Checkout indisponível no momento.');
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError('Erro de rede ao iniciar o pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseClassName} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Abrindo pagamento...
          </>
        ) : (
          label
        )}
      </button>
      {error ? (
        <p className="text-sm font-medium text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MotionSection({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function HeroBackdrop() {
  return (
    <>
      <div className="absolute top-[-18%] left-1/2 h-[560px] w-[min(140%,1040px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute right-[-14%] bottom-[10%] h-[520px] w-[520px] rounded-full bg-emerald-400/12 blur-[120px]" />
      <div className="absolute top-1/3 left-[-18%] h-[460px] w-[460px] rounded-full bg-indigo-600/18 blur-[120px]" />
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

export function LPConcurso({ config }: { config: LPConcursoConfig }) {
  const { concurso, copy, walkthrough } = config;
  const vagasLabel =
    concurso.vagasPCD && concurso.vagasPCD !== 'A divulgar'
      ? `${concurso.vagas} + ${concurso.vagasPCD} PCD`
      : concurso.vagas;

  const editalCards = [
    { label: 'Cargo', value: concurso.cargo },
    { label: 'Banca', value: concurso.banca },
    { label: 'Vagas', value: vagasLabel },
    { label: 'Data da Prova', value: concurso.dataProvaFormatada },
    { label: 'Remuneração', value: concurso.remuneracao },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/8 bg-[#010409]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2" aria-label="AVANT">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" aria-hidden />
            </div>
            <span className="text-xl font-[1000] italic tracking-tighter text-white">AVANT</span>
          </Link>
          <a
            href="#cta"
            className="shrink-0 rounded-2xl bg-[#BEF264] px-4 py-2.5 text-xs font-black text-slate-950 sm:px-5 sm:text-sm"
          >
            Garantir minha vaga — R$ 9,90/mês
          </a>
        </div>
      </header>

      <main className="relative z-10 pt-[72px]">
        <MotionSection className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <HeroBackdrop />
          </div>
          <div className="relative mx-auto max-w-6xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BEF264]/30 bg-[#BEF264]/15 px-4 py-2 text-xs font-black text-[#BEF264] sm:text-sm">
              <Zap size={14} aria-hidden />
              Prova em {concurso.dataProvaFormatada} · {concurso.statusInscricoes}
            </p>

            <h1 className="max-w-4xl bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-4xl leading-[1.05] font-[1000] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              {copy.headlinePrincipal}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              {copy.subtitulo}
            </p>

            <div className="mt-8 max-w-md">
              <CheckoutButton label="Começar agora — R$ 9,90/mês" />
              <p className="mt-3 text-sm text-slate-500">
                Cancela quando quiser · Acesso imediato · Menos que um lanche
              </p>
            </div>

            <div className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
              {editalCards.map((card) => (
                <div
                  key={card.label}
                  className="min-w-[140px] shrink-0 snap-start rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur sm:min-w-[160px]"
                >
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-1 text-sm font-black text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <CountdownDays
                dataProva={concurso.dataProva}
                dataProvaFormatada={concurso.dataProvaFormatada}
                variant="hero"
              />
            </div>
          </div>
        </MotionSection>

        <MotionSection className="bg-slate-950/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Você estuda, mas não sabe se está estudando o que a {concurso.nomeBanca} cobra?
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.dores.map((dor) => (
                <li
                  key={dor}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                >
                  <XCircle className="mt-0.5 shrink-0 text-rose-400" size={22} aria-hidden />
                  <p className="text-base leading-relaxed text-slate-200">{dor}</p>
                </li>
              ))}
            </ul>
          </div>
        </MotionSection>

        <MotionSection className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Veja o ciclo completo — do erro ao aprendizado
            </h2>
            <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {WALKTHROUGH_CAPTIONS.map((caption, index) => {
                const step = index + 1;
                const imageSrc =
                  walkthrough.imagens.length >= step ? walkthrough.imagens[index] : null;

                return (
                  <article
                    key={caption}
                    className="min-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl md:min-w-0"
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={caption}
                        width={260}
                        height={360}
                        className="aspect-[13/18] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[13/18] w-full items-center justify-center bg-slate-800">
                        <span className="text-4xl font-black text-slate-600">{step}</span>
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <p className="text-[11px] leading-snug text-slate-400">{caption}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mx-auto mt-8 max-w-lg text-center text-sm text-slate-400">
              4 slides. Cada um com uma função diferente. Isso acontece depois de cada questão —
              certa ou errada.
            </p>
          </div>
        </MotionSection>

        <MotionSection className="border-y border-rose-500/15 bg-rose-950/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              O que a {concurso.nomeBanca} cobra e a maioria ignora
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.perigosBanca.map((perigo) => (
                <div
                  key={perigo}
                  className="rounded-2xl border border-rose-500/15 bg-slate-900/60 p-5"
                >
                  <AlertTriangle className="text-rose-400" size={22} aria-hidden />
                  <p className="mt-4 text-base leading-relaxed text-slate-200">{perigo}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Acesso completo por R$ 9,90/mês
            </h2>
            <ul className="mt-8 space-y-4">
              {copy.listaBeneficios.map((beneficio) => (
                <li key={beneficio} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-emerald-400"
                    size={20}
                    aria-hidden
                  />
                  <span className="text-base leading-relaxed text-slate-200">{beneficio}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-500">{copy.disclaimer}</p>
          </div>
        </MotionSection>

        <MotionSection id="cta" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/35 p-6 sm:p-10">
            <h2 className="text-center text-2xl leading-tight font-black tracking-tight text-white sm:text-3xl">
              Prepare-se para a prova da {concurso.nomeBanca} por menos do que custou se
              inscrever
            </h2>
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
              <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200">
                Mais escolhido
              </span>
              <p className="mt-4 text-5xl font-black text-white">R$ 9,90/mês</p>
              <p className="mt-2 text-sm font-semibold text-emerald-200">Cancela quando quiser</p>
              <div className="mt-6">
                <CheckoutButton label="Garantir minha vaga — R$ 9,90/mês" />
              </div>
              <p className="mt-4 text-center text-sm text-slate-400">
                Acesso imediato após o pagamento
              </p>
            </div>
            <div className="mt-8">
              <CountdownDays
                dataProva={concurso.dataProva}
                dataProvaFormatada={concurso.dataProvaFormatada}
                variant="cta"
              />
            </div>
          </div>
        </MotionSection>

        <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
              {copy.disclaimerLegal}
            </p>
            <div className="flex gap-4 text-sm font-semibold text-slate-300">
              <a className="hover:text-cyan-200" href="/politica-de-privacidade">
                Política de Privacidade
              </a>
              <span aria-hidden>·</span>
              <a className="hover:text-cyan-200" href="/termos-de-uso">
                Termos de Uso
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
