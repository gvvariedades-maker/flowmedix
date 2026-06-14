'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  FileQuestion,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { NeuroSlideCarousel } from '@/components/marketing/NeuroSlideCarousel';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import { getDaysUntilProva } from '@/app/_components/LPConcurso.client';
import { cn } from '@/lib/utils';

const DATA_PROVA = '2026-08-30';
const DATA_PROVA_FMT = '30/08/2026';
const PRECO_PRO = '14,90';
const TAXA_INSCRICAO = 'R$ 110,00';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const TRUST_CHIPS = [
  '50 vagas imediatas',
  'Banca IDECAN',
  '40 questões na prova',
  '10 questões grátis agora',
] as const;

const EDITAL_STATS = [
  { label: 'Vagas', value: '50 + 5 PCD' },
  { label: 'Banca', value: 'IDECAN' },
  { label: 'Prova', value: DATA_PROVA_FMT },
  { label: 'Questões', value: '40 (20×2 pts)' },
  { label: 'Taxa', value: TAXA_INSCRICAO },
  { label: 'Pontuação máx.', value: '60 pontos' },
] as const;

const DORES = [
  'Você estuda apostila genérica e na hora da prova a IDECAN cobra detalhe técnico — sequência, dose, biossegurança.',
  'Você acerta por intuição e não consegue repetir o raciocínio na questão seguinte.',
  'Você erra e só lê o gabarito. O conceito não fixa — e a banca cobra de novo no mesmo edital.',
] as const;

const METODO = [
  {
    n: '01',
    title: 'Questão real IDECAN',
    text: 'Formato exato da banca para Técnico em Enfermagem — não teoria de enfermeiro.',
    icon: FileQuestion,
    image: '/images/campina-grande/walk-01.jpg',
  },
  {
    n: '02',
    title: 'Gabarito + diagnóstico',
    text: 'Saiba se errou por conceito, interpretação ou pegadinha — antes de seguir.',
    icon: ClipboardCheck,
    image: '/images/campina-grande/walk-03.jpg',
  },
  {
    n: '03',
    title: 'NeuroSlides',
    text: 'Mapa mental, regra de ouro, fluxo lógico e zona de perigo — visual e direto.',
    icon: Brain,
    image: '/images/campina-grande/walk-05.jpg',
  },
  {
    n: '04',
    title: 'Revisão no momento certo',
    text: 'Plano diário e revisão espaçada — sem planilha, sem adivinhar o que revisar.',
    icon: CalendarDays,
    image: '/images/campina-grande/walk-07.jpg',
  },
] as const;

const PERIGOS_BANCA = [
  'Sequência de procedimentos — a IDECAN não cobra só conceito isolado; cobra ordem e detalhe.',
  'Duas alternativas quase certas — biossegurança, farmacologia e SUS decidem a nota.',
  'Conhecimentos específicos valem o dobro — errar 1 questão técnica pesa como 2 de português.',
] as const;

const BENEFICIOS_PRO = [
  'Questões reais IDECAN e outras bancas para Técnico em Enfermagem',
  'NeuroSlides após cada questão — estudo reverso guiado',
  'Diagnóstico do erro na hora — conceito, detalhe ou pegadinha',
  'Revisão espaçada automática e plano diário adaptado',
  'Acesso completo — Campina Grande e todos os editais em destaque',
  'Cancela quando quiser — sem contrato de fidelidade',
] as const;

const FAQ_ITEMS = [
  {
    q: 'O AVANT Pro serve só para Campina Grande?',
    a: 'Não. Você prepara para Campina com foco IDECAN e ainda acessa questões de EBSERH, prefeituras e demais bancas — tudo no mesmo plano.',
  },
  {
    q: 'Já tenho apostila. Preciso do AVANT?',
    a: 'Apostila dá base; a prova cobra raciocínio sob pressão. O AVANT treina com questões reais e fixa o erro na hora com NeuroSlides — o que apostila sozinha não faz.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. A assinatura é mensal. Cancele a qualquer momento — sem multa e sem burocracia.',
  },
  {
    q: 'As questões são da IDECAN?',
    a: 'Sim. O pacote inclui questões reais de concursos organizados pela IDECAN, além de outras bancas relevantes para técnico de enfermagem.',
  },
  {
    q: 'Como funciona o acesso após o pagamento?',
    a: 'Pagamento confirmado → acesso imediato à plataforma. Crie sua conta ou use o e-mail do checkout para entrar em /estudar.',
  },
] as const;

function BrandCta({
  children,
  className,
  onClick,
  disabled,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#8fe020] px-6 py-3.5 text-sm font-black tracking-wide text-[#1a2e05] shadow-[0_8px_24px_rgba(143,224,32,0.35)] transition-all hover:bg-[#9ef028] hover:shadow-[0_12px_32px_rgba(143,224,32,0.4)] disabled:cursor-not-allowed disabled:opacity-60';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, className)}>
      {children}
    </button>
  );
}

function OutlineCta({
  children,
  className,
  href,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, className)}>
      {children}
    </button>
  );
}

function ProCheckoutCta({ label, className }: { label: string; className?: string }) {
  const { handleCheckout, loading, error } = useProCheckout();

  return (
    <div className={className}>
      <BrandCta onClick={() => void handleCheckout()} disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            Abrindo pagamento…
          </>
        ) : (
          label
        )}
      </BrandCta>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CountdownPill({ dias, className }: { dias: number; className?: string }) {
  if (dias <= 0) {
    return (
      <p className={cn('text-sm font-bold text-slate-600', className)}>Prova realizada em {DATA_PROVA_FMT}</p>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl border-2 border-[#8fe020]/40 bg-[#8fe020]/10 px-4 py-3',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-3xl font-[1000] leading-none text-[#3d6b0f]">{dias}</span>
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-wider text-slate-900">dias para a prova</p>
        <p className="text-xs font-semibold text-slate-600">{DATA_PROVA_FMT} · IDECAN</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-bold text-slate-900">{q}</span>
        <ChevronDown
          size={20}
          className={cn('mt-0.5 shrink-0 text-slate-500 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? (
        <p className="pb-5 text-sm leading-relaxed text-slate-600">{a}</p>
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8fe020]/30 bg-[#8fe020]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#3d6b0f]">
      <Sparkles size={12} aria-hidden />
      {children}
    </p>
  );
}

export function LPCampinaV2() {
  useEditorialTheme();
  const diasRestantes = getDaysUntilProva(DATA_PROVA);

  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f1f5f9] text-slate-900 selection:bg-[#8fe020]/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f1f5f9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <AvantLogo href="/" variant="lockup" size="nav" animated={false} className="shrink-0" />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação">
            <Link href="/planos" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Concursos
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Entrar
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <OutlineCta href="/register" className="hidden px-4 py-2.5 text-xs sm:inline-flex">
              Comece grátis
            </OutlineCta>
            <BrandCta onClick={scrollToPricing} className="px-4 py-2.5 text-xs sm:text-sm">
              Assinar Pro
            </BrandCta>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#8fe020]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-slate-300/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <p className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm sm:text-xs">
                <MapPin size={12} className="text-[#3d6b0f]" aria-hidden />
                IDECAN · Campina Grande PB · Técnico de Enfermagem
              </p>

              <h1 className="text-3xl font-[1000] leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                Você sabe o que a{' '}
                <span className="text-[#3d6b0f]">IDECAN cobra</span> — ou acha que sabe?
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                50 vagas. Prova em {DATA_PROVA_FMT}. Conhecimentos específicos valem o dobro. Treine com
                questões reais e estudo reverso — antes que a inscrição vire arrependimento.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BrandCta href="/simulados/campina-grande/cg-01" className="w-full sm:w-auto">
                  Testar agora — grátis
                  <ArrowRight size={18} aria-hidden />
                </BrandCta>
                <OutlineCta onClick={scrollToPricing} className="w-full sm:w-auto">
                  Assinar AVANT Pro — R$ {PRECO_PRO}/mês
                </OutlineCta>
              </div>

              <div className="mt-8">
                <CountdownPill dias={diasRestantes} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-sm lg:max-w-none lg:justify-self-end"
            >
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-950">
                  <Image
                    src="/images/campina-grande/walk-01.jpg"
                    alt="Questão real IDECAN no player AVANT"
                    width={390}
                    height={540}
                    className="aspect-[13/18] w-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">NeuroSlides</p>
                  <p className="text-sm font-black text-slate-900">4 telas por questão</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-slate-200 bg-white px-4 py-6 sm:px-6">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 sm:gap-4">
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-slate-200 bg-[#f8fafc] px-4 py-2 text-xs font-bold text-slate-700 sm:text-sm"
              >
                {chip}
              </li>
            ))}
          </ul>
        </section>

        {/* Simulado gratuito */}
        <section className="bg-[#0f172a] px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <SectionLabel>Diagnóstico gratuito</SectionLabel>
                <h2 className="text-2xl font-[1000] tracking-tight text-white sm:text-4xl">
                  Antes de comprar qualquer coisa — resolva 10 questões reais IDECAN
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  Resultado na hora, análise por eixo e estudo reverso em todas as questões. Você vê onde
                  trava — e entende por que o AVANT Pro faz diferença.
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {['10 questões reais', 'Resultado na hora', 'Análise por eixo'].map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <BrandCta href="/simulados/campina-grande/cg-01" className="mt-8">
                  Fazer diagnóstico grátis
                  <Zap size={18} aria-hidden />
                </BrandCta>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['/images/campina-grande/walk-02.jpg', '/images/campina-grande/walk-04.jpg', '/images/campina-grande/walk-06.jpg', '/images/campina-grande/walk-08.jpg'].map(
                  (src, i) => (
                    <div
                      key={src}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"
                    >
                      <Image
                        src={src}
                        alt={`Passo ${i + 1} do ciclo de estudo AVANT`}
                        width={200}
                        height={280}
                        className="aspect-[5/7] w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Edital em números */}
        <section className="px-4 py-16 sm:px-6 sm:py-20" aria-label="Números do edital">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Edital Campina Grande 2026</SectionLabel>
            <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
              Os números que definem sua estratégia
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Conhecimentos específicos de Enfermagem valem <strong className="text-slate-900">2 pontos</strong>{' '}
              cada — o dobro das questões de português e legislação.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EDITAL_STATS.map((stat) => (
                <div key={stat.label} className="card-elevated rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dores */}
        <section className="bg-[#fff7ed] px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              A maioria estuda errado para a IDECAN
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {DORES.map((dor) => (
                <li key={dor} className="card-elevated rounded-2xl border-rose-100 p-5">
                  <CircleAlert className="mb-4 text-rose-500" size={22} aria-hidden />
                  <p className="text-base leading-relaxed text-slate-700">{dor}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Método */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Método AVANT</SectionLabel>
            <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              Do erro ao aprendizado — em 4 passos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {METODO.map((step) => (
                <article
                  key={step.n}
                  className="card-elevated-lg overflow-hidden rounded-3xl"
                >
                  <div className="grid sm:grid-cols-[1fr_140px]">
                    <div className="p-6">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8fe020] text-sm font-black text-[#3d6b0f]">
                        {step.n}
                      </span>
                      <h3 className="mt-4 text-lg font-black text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                      <step.icon className="mt-4 text-[#3d6b0f]" size={20} aria-hidden />
                    </div>
                    <div className="relative hidden min-h-[140px] bg-slate-100 sm:block">
                      <Image src={step.image} alt="" fill className="object-cover" sizes="140px" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* NeuroSlides — faixa escura */}
        <section className="bg-[#010409] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                  Estudo reverso
                </p>
                <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-white sm:text-4xl">
                  4 NeuroSlides depois de cada questão
                </h2>
                <ul className="mt-8 space-y-4">
                  {[
                    { icon: Layers, label: 'Mapa mental', text: 'Conecta o que a banca misturou' },
                    { icon: Lightbulb, label: 'Regra de ouro', text: 'O que lembrar na prova' },
                    { icon: Target, label: 'Fluxo lógico', text: 'Sequência de decisão' },
                    { icon: CircleAlert, label: 'Zona de perigo', text: 'Pegadinhas que derrubam' },
                  ].map((item) => (
                    <li key={item.label} className="flex gap-3">
                      <item.icon className="mt-0.5 shrink-0 text-cyan-400" size={20} aria-hidden />
                      <div>
                        <p className="font-bold text-white">{item.label}</p>
                        <p className="text-sm text-slate-400">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <NeuroSlideCarousel className="mx-auto w-full max-w-[340px]" />
            </div>
          </div>
        </section>

        {/* Perigos banca */}
        <section className="border-y border-rose-200/60 bg-rose-50/50 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              O que a IDECAN cobra e a maioria ignora
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {PERIGOS_BANCA.map((perigo) => (
                <div key={perigo} className="card-elevated rounded-2xl border-rose-100 p-5">
                  <Shield className="text-rose-500" size={22} aria-hidden />
                  <p className="mt-4 text-base leading-relaxed text-slate-700">{perigo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-4 py-16 sm:px-6 sm:py-24" aria-label="Assinar AVANT Pro">
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-[2rem] bg-[#0f172a] p-6 shadow-2xl sm:p-10">
              <div className="text-center">
                <span className="inline-flex rounded-full bg-[#8fe020]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#8fe020]">
                  AVANT Pro
                </span>
                <h2 className="mt-4 text-2xl font-[1000] tracking-tight text-white sm:text-3xl">
                  Prepare-se para Campina Grande com acesso completo
                </h2>
                <p className="mt-3 text-slate-400">
                  A inscrição custou {TAXA_INSCRICAO}. O AVANT Pro custa R$ {PRECO_PRO}/mês — menos que um
                  lanche por semana de estudo direcionado.
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-center text-5xl font-[1000] text-white">
                  R$ {PRECO_PRO}
                  <span className="text-2xl font-bold text-slate-400">/mês</span>
                </p>
                <p className="mt-2 text-center text-sm font-semibold text-[#8fe020]">Cancela quando quiser</p>

                <ul className="mt-6 space-y-3">
                  {BENEFICIOS_PRO.map((b) => (
                    <li key={b} className="flex gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#8fe020]" size={18} aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>

                <ProCheckoutCta
                  label={`Assinar AVANT Pro — R$ ${PRECO_PRO}/mês`}
                  className="mt-8 [&_button]:w-full"
                />

                <p className="mt-4 text-center text-xs text-slate-500">Acesso imediato após o pagamento</p>
              </div>

              <div className="mt-8 flex justify-center">
                <CountdownPill dias={diasRestantes} className="border-white/15 bg-white/5 [&_p]:text-white [&_span]:text-[#8fe020]" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="card-elevated mt-10 rounded-2xl px-6">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-[#8fe020]/15 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              {diasRestantes > 0 ? (
                <>
                  Faltam <span className="text-[#3d6b0f]">{diasRestantes} dias</span>. Cada dia conta.
                </>
              ) : (
                'A prova está chegando. Estude com método.'
              )}
            </h2>
            <p className="mt-4 text-slate-600">
              Comece pelo simulado grátis ou assine o Pro e estude sem limite até o dia da prova.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BrandCta href="/simulados/campina-grande/cg-01">Simulado grátis</BrandCta>
              <OutlineCta onClick={scrollToPricing}>Ver planos</OutlineCta>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
            O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem
            afiliados a órgãos ou empresas de concurso. Conteúdo focado em Conhecimentos Específicos de
            Enfermagem para Técnico via assinatura AVANT Pro.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-600">
            <Link className="hover:text-[#3d6b0f]" href="/politica-de-privacidade">
              Privacidade
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:text-[#3d6b0f]" href="/termos-de-uso">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
