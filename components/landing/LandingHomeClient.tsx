'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileText,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  Shield,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { WhatsAppSupportLink } from '@/components/support/WhatsAppSupportLink';
import { CompareAvantCarousel } from '@/components/landing/CompareAvantCarousel';
import { COMPARE_AVANT_SLIDES } from '@/lib/marketing/compareAvantAssets';
import {
  BrandCta,
  EditorialFaqItem,
  OutlineCta,
  SectionLabel,
} from '@/components/landing/lp-ui';
import { LandingMetodoSteps } from '@/components/landing/LandingMetodoSteps';
import { LandingPricingSplit } from '@/components/landing/LandingPricingSplit';
import {
  FREEMIUM_PLAN_LIMITS_COMPACT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
} from '@/lib/freemium/constants';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';
import { NeuroSlideCarousel } from '@/components/marketing/NeuroSlideCarousel';

const LandingHeroShowcase = dynamic(
  () =>
    import('@/components/marketing/LandingHeroShowcase').then((m) => ({
      default: m.LandingHeroShowcase,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex h-[420px] w-full max-w-sm items-center justify-center rounded-[2rem] border border-slate-200 bg-white text-sm text-slate-400">
        Carregando preview…
      </div>
    ),
  },
);

const DemoInterativa = dynamic(
  () => import('@/components/landing/DemoInterativa').then((m) => ({ default: m.DemoInterativa })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center bg-[#010409] px-4 py-16">
        <p className="text-sm font-medium text-slate-500" aria-busy="true">
          Carregando demo interativa…
        </p>
      </div>
    ),
  },
);

const PRECO_PRO = '14,90';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const TRUST_CHIPS = [
  'Mais de 5.000 questões',
  'EBSERH e prefeituras',
  'Só Técnico em Enfermagem',
  'NeuroSlides após cada questão',
  `${FREEMIUM_PLAN_LIMITS_COMPACT} · sem cartão`,
] as const;

const DORES = [
  'Você estuda material de nível superior — linguagem de enfermeiro, profundidade além do que a banca cobra.',
  'Você acerta por chute e não consegue repetir o raciocínio na questão seguinte.',
  'Você erra e só lê o gabarito. O conceito não fixa — e a banca cobra de novo.',
] as const;

const COMPARE_APOSTILA = [
  'Linguagem de nível superior — técnico demais para o cargo',
  'Você lê tudo sem saber o que a banca vai cobrar',
  'Sem feedback: não sabe se aprendeu ou só decorou',
  'Revisão manual — depende de planilha ou memória',
] as const;

const COMPARE_AVANT = [
  'Cada questão já vem no formato que a banca cobra',
  'Diagnóstico imediato: erro de conceito, detalhe ou banca',
  'NeuroSlide visual após cada questão — fixa em minutos',
  'Revisão automática no momento certo — sem planilha',
] as const;

const FEATURES = [
  { title: 'Vitrine de questões', text: 'Escolha assuntos e comece pelo formato da banca.', icon: LayoutDashboard },
  { title: 'Estudo Reverso', text: 'Cada questão vira explicação guiada e revisão.', icon: Brain },
  { title: 'Meu desempenho', text: 'Acompanhe evolução e padrões de erro.', icon: Eye },
  { title: 'Plano diário', text: 'Revise no ritmo certo, sem planilha manual.', icon: CalendarDays },
] as const;

const FAQ_ITEMS = [
  {
    q: 'O AVANT tem plano gratuito?',
    a: `Sim. No plano gratuito você treina com ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}, sem cartão. O Pro custa R$ ${PRECO_PRO}/mês e cancela quando quiser.`,
  },
  {
    q: 'O que é o Estudo Reverso?',
    a: 'Você começa pela questão real. Depois do gabarito, os NeuroSlides explicam o conceito com mapa mental, regra de ouro, fluxo lógico e zona de perigo.',
  },
  {
    q: 'Serve para qual concurso?',
    a: 'EBSERH, prefeituras e demais órgãos que cobram Técnico em Enfermagem. Conteúdo filtrado por banca, ano e órgão.',
  },
  {
    q: 'Quantas questões tem disponíveis?',
    a: 'Mais de 5.000 questões reais de concursos, focadas no cargo de Técnico em Enfermagem. O banco cresce continuamente.',
  },
  {
    q: 'O que acontece depois do cadastro?',
    a: 'Você entra direto no app, escolhe uma questão na vitrine e inicia o primeiro ciclo. Uma questão já mostra o método.',
  },
] as const;

export default function LandingHomeClient() {
  useEditorialTheme();

  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f1f5f9] text-slate-900 selection:bg-[#8fe020]/30">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f1f5f9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <AvantLogo href="/" variant="lockup" size="nav" tone="light" animated={false} className="shrink-0" />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação principal">
            <Link href="/planos" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Concursos
            </Link>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Blog
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Entrar
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <OutlineCta href="/register" className="hidden px-4 py-2.5 text-xs sm:inline-flex">
              Começar grátis
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
              <p className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#8fe020]/35 bg-[#8fe020]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#3d6b0f] shadow-sm sm:text-xs">
                <Shield size={12} aria-hidden />
                Feito por técnico aprovado em 10+ concursos dentro das vagas
              </p>

              <h1 className="text-3xl font-[1000] leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                A maioria do material foi feito{' '}
                <span className="text-slate-500">para enfermeiro.</span>
                <br />
                <span className="text-[#3d6b0f]">O AVANT foi feito para você.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Cada questão, slide e revisão pensados exclusivamente para o cargo de Técnico em Enfermagem.
                Estudo reverso com NeuroSlides — comece grátis, sem cartão.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BrandCta href="/register" className="w-full sm:w-auto">
                  Testar grátis agora
                  <ArrowRight size={18} aria-hidden />
                </BrandCta>
                <OutlineCta href="#metodo" className="w-full sm:w-auto">
                  Ver como funciona
                </OutlineCta>
              </div>

              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <LockKeyhole size={14} aria-hidden />
                {FREEMIUM_PLAN_LIMITS_COMPACT} · sem compromisso
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full lg:justify-self-end"
            >
              <LandingHeroShowcase />
            </motion.div>
          </div>
        </section>

        {/* Trust */}
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

        {/* Dores */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>O problema real</SectionLabel>
            <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              Você estuda o material errado sem perceber
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

        {/* Comparação */}
        <section id="comparacao" className="bg-[#fff7ed] px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Método antigo vs AVANT</SectionLabel>
            <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              Você estuda por material de enfermeiro sem perceber.
            </h2>
            <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
              <div className="card-elevated overflow-hidden rounded-[2rem] border-rose-100">
                <div className="border-b border-rose-100 px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-rose-600">
                    <FileText size={18} aria-hidden />
                    Apostila / PDF
                  </span>
                </div>
                <div className="relative h-48 w-full sm:h-56">
                  <Image
                    src="/images/compare-apostila.jpg"
                    alt="Apostila densa de enfermagem"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-80 grayscale-[20%]"
                  />
                </div>
                <ul className="space-y-3 p-6">
                  {COMPARE_APOSTILA.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-600">
                      <X size={15} className="mt-0.5 shrink-0 text-rose-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-elevated-lg overflow-hidden rounded-[2rem] border-[#8fe020]/20">
                <div className="border-b border-slate-100 px-6 py-4">
                  <AvantLogo size="md" tone="light" animated={false} />
                </div>
                <CompareAvantCarousel />
                <ul className="space-y-3 px-6 pb-6">
                  {COMPARE_AVANT.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#3d6b0f]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <LandingMetodoSteps />

        {/* Demo — faixa escura */}
        <section className="bg-[#0f172a]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Demo interativa</p>
                <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-white sm:text-3xl">
                  Experimente uma questão real antes de criar conta
                </h2>
                <p className="mt-4 text-slate-400">
                  O mesmo player do app: responda, veja o gabarito e percorra os NeuroSlides de estudo reverso.
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {['Questão real', 'Gabarito na hora', '4 NeuroSlides'].map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <BrandCta href="/register" className="mt-8">
                  Criar conta grátis
                  <Zap size={18} aria-hidden />
                </BrandCta>
              </div>
              <div className="hidden lg:block">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={COMPARE_AVANT_SLIDES[1].src}
                    alt={COMPARE_AVANT_SLIDES[1].alt}
                    width={COMPARE_AVANT_SLIDES[1].width}
                    height={COMPARE_AVANT_SLIDES[1].height}
                    unoptimized
                    className="mx-auto aspect-[5/7] w-full max-w-[280px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          <DemoInterativa embedded />
        </section>

        {/* NeuroSlides */}
        <section id="neuroslides" className="bg-[#010409] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Estudo reverso</p>
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

        {/* Features */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Recursos que viram resultado</SectionLabel>
            <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
              Tudo para sair do estudo aleatório
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="card-elevated rounded-2xl p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#8fe020]/25 bg-[#8fe020]/10">
                    <f.icon className="text-[#3d6b0f]" size={22} aria-hidden />
                  </div>
                  <h3 className="font-black text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Autoridade */}
        <section className="px-4 py-14 sm:px-6">
          <div className="card-elevated mx-auto flex max-w-4xl flex-col items-start gap-6 rounded-[2rem] p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#8fe020]/30 bg-[#8fe020]/10">
              <Shield size={28} className="text-[#3d6b0f]" aria-hidden />
            </div>
            <div>
              <SectionLabel>Por que o AVANT existe</SectionLabel>
              <p className="text-base font-semibold leading-relaxed text-slate-800 sm:text-lg">
                Desenvolvido por um Técnico em Enfermagem aprovado em{' '}
                <strong className="text-slate-900">mais de 10 concursos dentro das vagas</strong> — um método que
                transforma erro em aprendizado real, não apenas gabarito.
              </p>
            </div>
          </div>
        </section>

        <LandingPricingSplit precoPro={PRECO_PRO} />

        {/* FAQ */}
        <section id="faq" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="card-elevated mt-10 rounded-2xl px-6">
              {FAQ_ITEMS.map((item) => (
                <EditorialFaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-[#8fe020]/15 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
              Só deixamos testar porque{' '}
              <span className="text-[#3d6b0f]">funciona de verdade.</span>
            </h2>
            <p className="mt-4 text-slate-600">
              Uma questão já mostra o método. Sem cartão, sem compromisso. Pro por R$ {PRECO_PRO}/mês — cancelável
              a qualquer momento.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BrandCta href="/register">Testar grátis agora</BrandCta>
              <OutlineCta onClick={scrollToPricing}>Ver planos</OutlineCta>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <AvantLogo size="md" tone="light" animated={false} />
            <span className="text-sm text-slate-500">Estudo reverso para Técnico em Enfermagem</span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
              <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-[#3d6b0f]">
                Blog
              </Link>
              <WhatsAppSupportLink className="text-sm text-slate-600 hover:text-[#25D366]" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AVANT. Plataforma independente de estudo para concursos.
          </p>
        </div>
      </footer>
    </div>
  );
}
