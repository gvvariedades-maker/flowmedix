'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Eye,
  FileQuestion,
  FileText,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  MessageCircleQuestion,
  Shield,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { WhatsAppSupportLink } from '@/components/support/WhatsAppSupportLink';
import { FREEMIUM_PLAN_LIMITS_COMPACT, FREEMIUM_PLAN_LIMITS_DESCRIPTION } from '@/lib/freemium/constants';
import { DemoInterativa } from '@/components/landing/DemoInterativa';
import { SlideStylePreviews } from '@/components/landing/SlideStylePreviews';
import { NeuroSlideCarousel } from '@/components/marketing/NeuroSlideCarousel';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';
import { ProSubscribeCtaLink } from '@/components/pro/ProSubscribeCtaLink';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type IconCard = {
  title: string;
  text: string;
  icon: LucideIcon;
};

const trustSignals = [
  'Mais de 5.000 questões de concurso',
  'EBSERH e prefeituras',
  'Só para Técnico em Enfermagem',
  'NeuroSlides após cada questão',
  `${FREEMIUM_PLAN_LIMITS_COMPACT} · sem cartão`,
];

const painPoints = [
  'Você estuda material de nível superior — linguagem de enfermeiro, profundidade além do que a banca cobra para o seu cargo.',
  'Você acerta por chute e não sabe repetir o raciocínio.',
  'Você erra uma questão e só lê o gabarito.',
  'Você revisa tudo de novo, inclusive o que já domina.',
  'Você chega perto da prova sem clareza do que ainda trava sua pontuação.',
];

const methodSteps: Array<IconCard & { n: string }> = [
  {
    n: '01',
    title: 'Resolva uma questão real de concurso',
    text: 'Começa pelo formato exato que a banca cobra para Técnico em Enfermagem — não por teoria de enfermeiro.',
    icon: FileQuestion,
  },
  {
    n: '02',
    title: 'Receba o diagnóstico do erro',
    text: 'Entenda se errou por conceito, interpretação, pegadinha de banca ou falta de revisão. Sem chute.',
    icon: ClipboardCheck,
  },
  {
    n: '03',
    title: 'Ative os NeuroSlides',
    text: 'A questão vira mapa mental, regra de ouro, fluxo lógico e zona de perigo — visual, direto, fixado.',
    icon: Brain,
  },
  {
    n: '04',
    title: 'Revise no momento certo',
    text: 'O plano diário te lembra o que estudar e quando — sem planilha, sem depender de memória.',
    icon: CalendarDays,
  },
];

const slideCards: IconCard[] = [
  {
    title: 'Mapa mental',
    text: 'Conecta os conceitos que a banca tentou misturar.',
    icon: Layers,
  },
  {
    title: 'Regra de ouro',
    text: 'Resume o ponto que você precisa lembrar na hora da prova.',
    icon: Lightbulb,
  },
  {
    title: 'Fluxo lógico',
    text: 'Mostra a sequência de decisão para resolver casos parecidos.',
    icon: Target,
  },
  {
    title: 'Zona de perigo',
    text: 'Aponta as pegadinhas que fazem candidato preparado errar.',
    icon: CircleAlert,
  },
];

const profileBenefits: IconCard[] = [
  {
    title: 'Para quem está começando',
    text: 'Comece por questões reais e descubra quais assuntos merecem prioridade.',
    icon: Sparkles,
  },
  {
    title: 'Para quem já estuda há meses',
    text: 'Pare de repetir o que já sabe e foque no que ainda derruba sua nota.',
    icon: Eye,
  },
  {
    title: 'Para quem erra por detalhe',
    text: 'Use diagnóstico, zona de perigo e revisão para transformar erro em alerta de prova.',
    icon: CircleAlert,
  },
];

const features: IconCard[] = [
  {
    title: 'Vitrine de questões',
    text: 'Escolha assuntos e comece por questões no formato que a banca cobra.',
    icon: LayoutDashboard,
  },
  {
    title: 'Estudo Reverso',
    text: 'Transforme cada questão em explicação guiada, fixação e revisão.',
    icon: Brain,
  },
  {
    title: 'Meu desempenho',
    text: 'Acompanhe evolução e identifique padrões de erro.',
    icon: BarChart3,
  },
  {
    title: 'Plano diário',
    text: 'Revise no ritmo certo, sem depender de memória ou planilha manual.',
    icon: CalendarDays,
  },
  {
    title: 'Cadernos',
    text: 'Organize questões e retome pontos críticos.',
    icon: BookMarked,
  },
];

const faqs = [
  {
    question: 'O AVANT tem plano gratuito?',
    answer:
      `Sim. No plano gratuito você treina com ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}, sem cartão de crédito. Para estudar sem limite, o AVANT Pro custa R$ 14,90/mês e pode ser cancelado a qualquer momento.`,
  },
  {
    question: 'Quantas questões tem disponíveis?',
    answer:
      'Hoje o banco conta com mais de 5.000 questões de concursos reais de EBSERH e prefeituras, focadas no cargo de Técnico em Enfermagem. O banco cresce continuamente com novas provas e bancas.',
  },
  {
    question: 'Preciso já estar avançado nos estudos?',
    answer:
      'Não. O método do AVANT funciona para quem está começando do zero e para quem já estuda há meses. Você começa por uma questão real e o sistema mostra exatamente onde focar.',
  },
  {
    question: 'O que é o Estudo Reverso?',
    answer:
      'É o método central do AVANT: em vez de estudar teoria e depois resolver questões, você começa pela questão. Depois do gabarito, a plataforma ativa os NeuroSlides — materiais visuais que explicam o conceito daquela questão com mapa mental, regra de ouro, fluxo lógico e zona de perigo (pegadinhas).',
  },
  {
    question: 'Serve para qual concurso?',
    answer:
      'O foco são concursos para o cargo de Técnico em Enfermagem: EBSERH, prefeituras e demais órgãos que cobram o cargo com questões de banca. O conteúdo é filtrado por banca, ano e órgão.',
  },
  {
    question: 'O que acontece depois do cadastro?',
    answer:
      'Você entra direto no app, escolhe uma questão na vitrine e inicia o primeiro ciclo de Estudo Reverso. Sem tutorial longo. Sem configuração. Uma questão já é suficiente para entender o método.',
  },
];

const AVANT_SLIDE_ASPECT = { width: 750, height: 1334 } as const;

const COMPARE_APOSTILA_PROBLEMS = [
  'Linguagem de nível superior — técnico demais para o cargo',
  'Você lê tudo sem saber o que a banca vai cobrar',
  'Sem feedback: não sabe se aprendeu ou só decorou',
  'Revisão manual — depende de planilha ou memória',
  'Conteúdo igual para todo mundo, sem diagnóstico',
] as const;

const COMPARE_AVANT_BENEFITS = [
  'Cada questão já vem no formato que a banca cobra',
  'Diagnóstico imediato: erro de conceito, detalhe ou banca',
  'NeuroSlide visual após cada questão — fixa em minutos',
  'Revisão automática no momento certo — sem planilha',
  'Foco no que você especificamente ainda erra',
] as const;

const COMPARE_AVANT_SLIDES = [
  {
    src: '/images/compare-avant-1.jpg',
    alt: 'NeuroSlide AVANT — pipeline cognitivo laranja: avaliar compatibilidade da solução, escolher veia, punção asséptica e infusão controlada',
  },
  {
    src: '/images/compare-avant-2.jpg',
    alt: 'NeuroSlide AVANT — pipeline cognitivo roxo: verificação de sinais vitais, checklist cirúrgico, monitoramento transoperatório e avaliação na SRPA',
  },
  {
    src: '/images/compare-avant-3.jpg',
    alt: 'NeuroSlide AVANT — zona de perigo vermelha: contraindicações e riscos da via de administração',
  },
] as const;

function CompareAvantCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % COMPARE_AVANT_SLIDES.length), 2500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative w-full px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full">
        {COMPARE_AVANT_SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={
              i === active
                ? 'relative'
                : 'pointer-events-none absolute inset-x-0 top-0 opacity-0'
            }
            aria-hidden={i !== active}
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={AVANT_SLIDE_ASPECT.width}
              height={AVANT_SLIDE_ASPECT.height}
              priority={i === 0}
              className={`w-full h-auto rounded-2xl border border-[#BEF264]/20 shadow-xl shadow-lime-950/40 transition-opacity duration-500 ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 py-4" role="tablist" aria-label="Slides AVANT">
        {COMPARE_AVANT_SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'h-2 w-6 bg-[#BEF264]' : 'h-2 w-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingHome() {
  return (
    <div className="min-h-screen bg-[#010409] text-slate-100 overflow-x-hidden selection:bg-cyan-400/25 selection:text-white">
      {/* Fundo atmosférico */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
        <div className="absolute bottom-[-12%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#BEF264]/10 blur-[110px]" />
        <div className="absolute top-1/2 left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <PublicDarkSiteHeader
        ctaLabel="Começar grátis"
        ctaLabelShort="Grátis"
        ctaLabelTight="Começar grátis →"
        showProSubscribe
        showAvantProLink={false}
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-7 inline-flex flex-wrap items-center gap-2"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
                  <Brain size={14} className="shrink-0" />
                  100% focado em Técnico em Enfermagem
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BEF264]/25 bg-[#BEF264]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#BEF264] sm:text-xs">
                  <LockKeyhole size={14} className="shrink-0" />
                  Teste grátis · sem cartão · sem compromisso
                </span>
              </motion.div>

              <motion.h1
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6 text-4xl font-[1000] leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                A maioria do material que você encontra no mercado foi feito{' '}
                <span className="text-slate-400">para enfermeiro.</span>
                <br />
                <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                  O AVANT foi feito para você.
                </span>
              </motion.h1>

              <motion.p
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-9 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 sm:text-xl"
              >
                A maioria dos materiais de enfermagem no mercado foi desenvolvida para nível superior —
                linguagem técnica demais, profundidade além do que a banca cobra para Técnico. O AVANT é
                diferente: cada questão, cada slide e cada revisão foi pensado exclusivamente para o cargo de
                Técnico em Enfermagem. Nada além do que você precisa para ser aprovado.
              </motion.p>

              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]"
                >
                  Testar grátis agora
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="#metodo"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  Ver como funciona
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mt-4 text-sm font-medium text-slate-500"
              >
                Só deixamos testar porque funciona. Sem cartão. Sem compromisso.
              </motion.p>
            </div>

            <div className="flex w-full min-w-0 justify-center">
              <NeuroSlideCarousel />
            </div>
          </div>
        </section>

        {/* Barra de confiança */}
        <section className="border-y border-white/5 bg-slate-950/45 px-4 py-5 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-slate-300"
              >
                <CheckCircle2 size={17} className="shrink-0 text-[#BEF264]" />
                {signal}
              </div>
            ))}
          </div>
        </section>

        {/* Origem e autoridade */}
        <section className="px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-start gap-6 rounded-[2rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-8 sm:flex-row sm:items-center sm:p-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-600/30">
                <Shield size={28} className="text-indigo-200" aria-hidden />
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-indigo-300">
                  Por que o AVANT existe
                </p>
                <p className="text-base font-semibold leading-relaxed text-slate-200 sm:text-lg">
                  O AVANT foi desenvolvido por um Técnico em Enfermagem aprovado em{' '}
                  <strong className="text-white">mais de 10 concursos públicos dentro das vagas</strong> — que sentiu na pele
                  o que faltava nas outras plataformas: um método que transforma erro em aprendizado real, não apenas em
                  gabarito.
                </p>
                <p className="mt-3 text-sm font-medium text-slate-400">
                  Cada funcionalidade foi pensada para a rotina de quem trabalha em plantão e estuda nos intervalos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparação Avant vs Apostila */}
        <section id="comparacao" className="px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            className="mx-auto max-w-6xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-rose-400">
              Método antigo vs AVANT
            </p>
            <h2 className="mb-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
              Você estuda por material de enfermeiro sem perceber.
            </h2>
            <p className="mb-14 max-w-3xl text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
              A maioria dos conteúdos de concurso para enfermagem foi feita para nível superior. Linguagem mais densa,
              profundidade desnecessária para o cargo de Técnico. O resultado: você leva o dobro do tempo para aprender a
              metade do que precisa.
            </p>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
                className="overflow-hidden rounded-[2rem] border border-rose-400/20 bg-rose-950/10"
              >
                <div className="border-b border-rose-400/15 px-6 pb-4 pt-6">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="shrink-0 text-rose-400" aria-hidden />
                    <div>
                      <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-300">
                        Apostila / PDF
                      </span>
                      <p className="mt-1 text-xs font-medium text-slate-500">Feito para enfermeiro</p>
                    </div>
                  </div>
                </div>
                <div className="relative h-[320px] w-full">
                  <Image
                    src="/images/compare-apostila.jpg"
                    alt="Página de apostila densa com tabelas de medicamentos"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full object-cover opacity-70 grayscale-[30%]"
                  />
                </div>
                <ul className="space-y-3 px-6 py-5">
                  {COMPARE_APOSTILA_PROBLEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X size={15} className="mt-0.5 shrink-0 text-rose-400" aria-hidden />
                      <span className="text-sm font-medium text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-6 pb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-400">
                    Resultado: estudo longo, progresso incerto
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="overflow-visible rounded-[2rem] border border-[#BEF264]/25 bg-gradient-to-b from-[#BEF264]/5 to-transparent shadow-[0_0_40px_rgba(190,242,100,0.08)]"
              >
                <div className="border-b border-[#BEF264]/15 px-6 pb-4 pt-6">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <AvantLogo size="md" animated={false} className="origin-left scale-[0.85] sm:scale-100" />
                    <p className="text-xs font-medium text-slate-400">Feito para Técnico em Enfermagem</p>
                  </div>
                </div>
                <CompareAvantCarousel />
                <ul className="space-y-3 px-6 py-5">
                  {COMPARE_AVANT_BENEFITS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#BEF264]" aria-hidden />
                      <span className="text-sm font-medium text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-6 pb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#BEF264]/25 bg-[#BEF264]/10 px-4 py-2 text-xs font-bold text-[#BEF264]">
                    Resultado: estudo com direção, aprovação mais próxima
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="mt-10 text-center">
              <p className="mb-3 text-sm font-medium text-slate-400">Quer ver como funciona na prática?</p>
              <a
                href="#metodo"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
              >
                Ver o método completo
                <ArrowRight size={16} aria-hidden />
              </a>
            </div>
          </motion.div>
        </section>

        {/* Dor */}
        <section id="problema-real" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#BEF264]">
                Por que você ainda não passou
              </p>
              <h2 className="mb-5 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
                Você estuda com material de enfermeiro{' '}
                <span className="text-rose-400">e é cobrado como técnico.</span>
              </h2>
              <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
                A maioria dos materiais do mercado foi desenvolvida para enfermeiros — linguagem mais densa, profundidade além
                do que a banca de Técnico cobra. Você leva o dobro do tempo para aprender a metade do que precisa. E ainda
                estuda sem saber o que está evoluindo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {painPoints.map((point, idx) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="rounded-3xl border border-rose-400/15 bg-rose-950/15 p-5"
                >
                  <CircleAlert className="mb-4 text-rose-300" size={22} />
                  <p className="text-sm font-semibold leading-relaxed text-slate-300">{point}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-8 text-sm font-semibold text-slate-500 text-center max-w-xl mx-auto">
              O AVANT foi construído para resolver exatamente isso — começando pela questão que a banca cobra, não pela teoria
              que o enfermeiro precisa.
            </p>
          </div>
        </section>

        {/* Método */}
        <section id="metodo" className="relative border-y border-white/5 bg-slate-950/50 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400 mb-3">
                Como o AVANT funciona
              </p>
              <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight mb-4">
                Pare de estudar no escuro.{' '}
                <span className="bg-gradient-to-r from-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                  Comece pela questão.
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Enquanto outros materiais começam por teoria de nível superior, o AVANT inverte: você parte da questão real que
                a banca cobra para Técnico em Enfermagem e transforma cada tentativa — erro, dúvida ou acerto por chute — em
                direção de estudo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {methodSteps.map((s, idx) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: idx * 0.1, duration: 0.45 }}
                  className="relative rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-8 hover:border-indigo-500/30 transition-colors"
                >
                  <span className="text-5xl font-[1000] text-white/[0.06] absolute top-4 right-6 select-none">
                    {s.n}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center mb-5">
                    <s.icon className="text-indigo-200" size={24} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <DemoInterativa />

        {/* Showcase do produto */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
                Produto real
              </p>
              <h2 className="mb-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
                Uma questão vira uma aula visual.
              </h2>
              <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
                Depois da tentativa, você não recebe apenas “certo” ou “errado”. O Avant organiza a questão comentada
                e o raciocínio em slides de estudo para fixar o conceito e evitar o mesmo erro na próxima prova.
              </p>
            </div>

            <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {slideCards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
                    <card.icon size={21} />
                  </div>
                  <h3 className="mb-2 font-black tracking-tight text-white">{card.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-400">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SlideStylePreviews />

        {/* Benefícios por perfil */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#BEF264]">
                Estudo com direção
              </p>
              <h2 className="text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
                Feito para quem quer parar de estudar no aleatório.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {profileBenefits.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-7"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#BEF264]/25 bg-[#BEF264]/10 text-[#BEF264]">
                    <item.icon size={23} />
                  </div>
                  <h3 className="mb-3 text-lg font-black tracking-tight text-white">{item.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-400">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section className="border-y border-white/5 bg-slate-950/50 py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BEF264] mb-3">
                Recursos que viram resultado
              </p>
              <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight">
                Tudo que você precisa para sair do estudo aleatório.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {features.map((f, idx) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.05, duration: 0.4 }}
                  className="group rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-sm p-6 sm:p-7 hover:border-[#BEF264]/25 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#BEF264]/10 group-hover:border-[#BEF264]/30 transition-colors">
                    <f.icon className="text-[#BEF264]" size={22} />
                  </div>
                  <h3 className="font-black text-white mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
                Antes de começar
              </p>
              <h2 className="mb-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
                Dúvidas comuns antes do cadastro.
              </h2>
              <p className="text-base font-medium leading-relaxed text-slate-400">
                A ideia é reduzir atrito: você entende o método, cria a conta e já começa por uma questão real.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <MessageCircleQuestion className="shrink-0 text-cyan-300" size={21} />
                    <h3 className="font-black text-white">{faq.question}</h3>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="pb-24 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto rounded-[2.5rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-[1000] text-white tracking-tight mb-4">
                Só deixamos testar porque{' '}
                <span className="bg-gradient-to-r from-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                  funciona de verdade.
                </span>
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Uma questão já é suficiente para entender a diferença. Sem cartão, sem compromisso, sem limite de tempo no teste. Quando fizer sentido para você, o Pro está disponível por R$ 14,90/mês — cancelável a qualquer momento.
              </p>
              <div className="flex flex-col items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#BEF264] text-slate-950 font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl hover:bg-[#d4f879] transition-all shadow-lg shadow-lime-400/25"
                >
                  Testar grátis agora
                  <ArrowRight size={18} />
                </Link>
                <ProSubscribeCtaLink />
                <Link
                  href="/login"
                  className="text-sm font-bold text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
                >
                  Já tenho conta → Entrar
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {[
                  'Sem cartão de crédito',
                  'Cancela quando quiser',
                  'Uma questão já mostra o método',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400"
                  >
                    <CheckCircle2 size={15} className="text-[#BEF264]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-10 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
              <AvantLogo size="md" animated={false} />
              <span className="text-sm text-slate-500">· Estudo reverso para Técnico em Enfermagem</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
              <Link
                href="/blog"
                className="text-sm font-bold text-slate-400 transition-colors hover:text-white"
              >
                Blog
              </Link>
              <WhatsAppSupportLink
                campaign="landing"
                className="text-sm text-slate-400 hover:text-[#25D366]"
              />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} AVANT. Estudo reverso para apoiar sua preparação.
          </p>
        </div>
      </footer>
    </div>
  );
}
