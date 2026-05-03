'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Eye,
  FileQuestion,
  Layers,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  MessageCircleQuestion,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { SlideStylePreviews } from '@/components/landing/SlideStylePreviews';
import { PublicDarkSiteHeader } from '@/components/layout/PublicDarkSiteHeader';

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
  '+1.500 questões de concurso',
  'EBSERH e prefeituras',
  'Só para Técnico em Enfermagem',
  'NeuroSlides após cada questão',
  'Beta gratuito · sem cartão',
];

const painPoints = [
  'Você acerta por chute e não sabe repetir o raciocínio.',
  'Você erra uma questão e só lê o gabarito.',
  'Você revisa tudo de novo, inclusive o que já domina.',
  'Você chega perto da prova sem clareza do que ainda trava sua pontuação.',
];

const methodSteps: Array<IconCard & { n: string }> = [
  {
    n: '01',
    title: 'Resolva uma questão real',
    text: 'Comece pelo tipo de cobrança que aparece em prova, não por uma teoria solta.',
    icon: FileQuestion,
  },
  {
    n: '02',
    title: 'Receba o diagnóstico',
    text: 'Entenda se o erro veio de conceito, interpretação, detalhe de banca ou falta de revisão.',
    icon: ClipboardCheck,
  },
  {
    n: '03',
    title: 'Ative o Estudo Reverso',
    text: 'Transforme a questão em mapa, regra de ouro, fluxo lógico e zona de perigo.',
    icon: Brain,
  },
  {
    n: '04',
    title: 'Volte pelo Plano Diário',
    text: 'Revise no momento certo para não esquecer o que acabou de aprender.',
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
  {
    title: 'Material de apoio',
    text: 'Use resumos e referências quando precisar reforçar base.',
    icon: BookOpen,
  },
];

const faqs = [
  {
    question: 'O AVANT é gratuito agora?',
    answer:
      'Sim. O AVANT está em fase Beta e o acesso é 100% gratuito durante esse período. Não pedimos cartão de crédito. Quando o Beta encerrar, você será avisado com antecedência — e quem entrou no Beta terá condição especial.',
  },
  {
    question: 'Quantas questões tem disponíveis?',
    answer:
      'Hoje o banco conta com mais de 1.500 questões de concursos reais de EBSERH e prefeituras, focadas no cargo de Técnico em Enfermagem. O banco cresce continuamente — a meta é chegar a 10.000 questões.',
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

      <PublicDarkSiteHeader ctaLabel="Entrar no Beta Gratuito" />

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-7 inline-flex flex-wrap items-center gap-2"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
                  <Brain size={14} className="shrink-0" />
                  Estudo Reverso para Técnico em Enfermagem
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BEF264]/25 bg-[#BEF264]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#BEF264] sm:text-xs">
                  <LockKeyhole size={14} className="shrink-0" />
                  Beta Gratuito · Vagas Limitadas
                </span>
              </motion.div>

              <motion.h1
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6 text-4xl font-[1000] leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                A única plataforma de concursos criada só para{' '}
                <span className="text-white">Técnico em Enfermagem</span>
                <span className="text-slate-400"> — </span>
                <span className="bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
                  onde cada erro vira uma aula visual.
                </span>
              </motion.h1>

              <motion.p
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-9 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 sm:text-xl"
              >
                O <strong className="text-slate-100">AVANT</strong> transforma cada questão errada em um ciclo
                completo de aprendizado: diagnóstico do erro, material visual (NeuroSlides) e revisão no momento
                certo. Foco total em concursos de <strong className="text-cyan-200">Técnico em Enfermagem</strong> —
                EBSERH e prefeituras.
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
                  Entrar no Beta Gratuito
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
                Beta 100% gratuito. Sem cartão de crédito. Sem pegadinha.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_0_50px_rgba(0,242,255,0.12)] backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-300">
                      Ciclo Avant
                    </p>
                    <h2 className="mt-1 text-lg font-black text-white">Da questão ao estudo guiado</h2>
                  </div>
                  <div className="rounded-2xl border border-[#BEF264]/30 bg-[#BEF264]/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#BEF264]">
                    Online
                  </div>
                </div>

                <div className="space-y-3">
                  {methodSteps.map((step, idx) => (
                    <div
                      key={step.n}
                      className="group grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
                        <step.icon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                          Etapa {idx + 1}
                        </p>
                        <h3 className="mt-1 text-sm font-black text-white">{step.title}</h3>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
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

        {/* Dor */}
        <section id="problema-real" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#BEF264]">
                O problema real
              </p>
              <h2 className="mb-5 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
                Você não precisa de mais uma pilha de conteúdo. Precisa saber exatamente o que revisar.
              </h2>
              <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
                A maioria dos candidatos alterna entre PDF, vídeo e questões sem saber se está evoluindo.
                O problema não é estudar pouco: é estudar sem diagnóstico.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
        </section>

        {/* Método */}
        <section id="metodo" className="relative border-y border-white/5 bg-slate-950/50 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400 mb-3">
                Método Avant
              </p>
              <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight mb-4">
                O método é simples: a questão vem primeiro.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Em vez de começar por teoria infinita, você parte da cobrança real dos concursos de enfermagem e transforma erro,
                dúvida e acerto por chute em direção de estudo.
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
                Aprovação começa com o método certo. Não com mais conteúdo.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Entre no Beta gratuito do AVANT e comece pelo Estudo Reverso agora. Sem cartão. Sem prazo de cobrança
                surpresa. Vagas do Beta são limitadas.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#BEF264] text-slate-950 font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl hover:bg-[#d4f879] transition-all shadow-lg shadow-lime-400/25"
                >
                  Quero entrar no Beta gratuito
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-bold text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
                >
                  Acessar minha conta
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-10 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#BEF264]" fill="currentColor" />
              <span className="font-[1000] italic tracking-tight text-white">AVANT</span>
              <span className="text-sm text-slate-500">· Estudo reverso para Técnico em Enfermagem</span>
            </div>
            <Link
              href="/blog"
              className="text-sm font-bold text-slate-400 transition-colors hover:text-white"
            >
              Blog
            </Link>
          </div>
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} AVANT. Estudo reverso para apoiar sua preparação.
          </p>
        </div>
      </footer>
    </div>
  );
}
