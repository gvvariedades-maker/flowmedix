'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Gift,
  Layers,
  LayoutDashboard,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { SlideStylePreviews } from '@/components/landing/SlideStylePreviews';
import { TextSizeControl } from '@/components/accessibility/TextSizeControl';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const benefits = [
  'Cadastro e uso da plataforma gratuitos',
  'Foco em Técnico de Enfermagem e concursos reais',
  'Estudo reverso: você aprende o “porquê” antes de decorar',
  'Acompanhe desempenho, plano diário e cadernos no mesmo lugar',
];

const steps = [
  {
    n: '01',
    title: 'Escolha o assunto na vitrine',
    text: 'Navegue por banca e tema. Cada card é um ciclo de estudo organizado para você.',
    icon: LayoutDashboard,
  },
  {
    n: '02',
    title: 'Viva o estudo reverso',
    text: 'Slides e fluxos que constroem o raciocínio — não só a resposta da questão.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Consolide e evolua',
    text: 'Registre tentativas, veja analytics, use o plano diário e seus cadernos.',
    icon: Target,
  },
];

const features = [
  {
    title: 'Vitrine inteligente',
    desc: 'Todos os assuntos em um painel tático, com progresso visível.',
    icon: Layers,
  },
  {
    title: 'Meu desempenho',
    desc: 'Métricas que mostram onde investir tempo antes da prova.',
    icon: BarChart3,
  },
  {
    title: 'Plano diário',
    desc: 'Rotina de estudo com lembretes do que revisar no dia.',
    icon: CalendarDays,
  },
  {
    title: 'Cadernos de estudo',
    desc: 'Monte listas personalizadas e estude no seu ritmo.',
    icon: BookMarked,
  },
  {
    title: 'Material de apoio',
    desc: 'Conteúdo complementar alinhado à sua preparação.',
    icon: BookOpen,
  },
  {
    title: 'Metodologia ativa',
    desc: 'Estudo reverso + questões: entender para acertar de verdade.',
    icon: Sparkles,
  },
];

export function LandingHome() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Fundo atmosférico */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[min(140%,900px)] h-[500px] bg-indigo-600/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#BEF264]/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-[-15%] w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" />
            </div>
            <span className="text-xl font-[1000] italic tracking-tighter text-white">AVANT</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <TextSizeControl variant="dark" compact />
            <Link
              href="/login"
              className="text-sm font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-black uppercase tracking-wider text-slate-950 bg-[#BEF264] hover:bg-[#d4f879] px-4 py-2.5 rounded-xl shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] inline-flex items-center gap-2"
            >
              Criar conta grátis
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center gap-2 mb-8"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#BEF264] bg-[#BEF264]/10 border border-[#BEF264]/25 px-4 py-2 rounded-full">
                <Gift size={14} className="shrink-0" />
                Plataforma gratuita
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-indigo-300 bg-indigo-500/15 border border-indigo-400/30 px-4 py-2 rounded-full">
                <Brain size={14} className="shrink-0" />
                Estudo reverso
              </span>
            </motion.div>

            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl font-[1000] leading-[1.05] tracking-tight text-white mb-6"
            >
              O concurso não espera.{' '}
              <span className="bg-gradient-to-r from-white via-indigo-200 to-[#BEF264] bg-clip-text text-transparent">
                Sua preparação também não pode esperar.
              </span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              A <strong className="text-slate-200">AVANT</strong> é a plataforma de{' '}
              <strong className="text-indigo-300">estudo reverso</strong> para{' '}
              <strong className="text-slate-200">Técnico em Enfermagem</strong>: você constrói o raciocínio
              clínico e teórico com método, questões e acompanhamento —{' '}
              <span className="text-[#BEF264] font-bold">sem pagar assinatura</span>.
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40"
              >
                Começar agora — é grátis
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all"
              >
                Já tenho conta
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-14 grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto"
            >
              {benefits.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-sm text-slate-400 font-medium"
                >
                  <CheckCircle2 className="text-[#BEF264] shrink-0 mt-0.5" size={18} />
                  {line}
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* O que é estudo reverso */}
        <section className="relative border-y border-white/5 bg-slate-950/50 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400 mb-3">
                Por que funciona
              </p>
              <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight mb-4">
                Estudo reverso: aprender de trás para frente, com propósito
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Em vez de só memorizar gabarito, você <strong className="text-slate-200">reconstrói o caminho</strong>
                : conceitos em slides, conexões e revisão guiada — para na hora da prova a resposta fazer sentido.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((s, idx) => (
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

        <SlideStylePreviews />

        {/* Features bento */}
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BEF264] mb-3">
                Tudo em um só lugar
              </p>
              <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight">
                Ferramentas que acompanham sua jornada até a posse
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
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
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
            className="max-w-4xl mx-auto rounded-[2.5rem] border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950 p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-[1000] text-white tracking-tight mb-4">
                Sua vaga começa com um clique — e não custa nada.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Crie sua conta em menos de um minuto e entre na vitrine de estudos reverso da AVANT.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#BEF264] text-slate-950 font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl hover:bg-[#d4f879] transition-all shadow-lg shadow-lime-400/25"
                >
                  Quero me cadastrar grátis
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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#BEF264]" fill="currentColor" />
            <span className="font-[1000] italic text-white tracking-tight">AVANT</span>
            <span className="text-slate-500 text-sm">· Estudo reverso para Técnico em Enfermagem</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} AVANT. Plataforma gratuita para apoiar sua preparação.
          </p>
        </div>
      </footer>
    </div>
  );
}
