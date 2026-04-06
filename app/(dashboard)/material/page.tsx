'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Dna,
  GitMerge,
  Heart,
  Lightbulb,
  RefreshCw,
  Scale,
  Shield,
  Sparkles,
  Syringe,
  Target,
  TrendingUp,
} from 'lucide-react';
import { NeuroSlidesShowcaseGrid } from '@/components/shared/NeuroSlidePreviewCard';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EtapaProps {
  numero: number;
  titulo: string;
  descricao: string;
  cor: string;
}

interface TopicoProps {
  icone: React.ReactNode;
  titulo: string;
  tags: string[];
  cor: string;
}

// ─── Dados ────────────────────────────────────────────────────────────────────

const etapas: EtapaProps[] = [
  {
    numero: 1,
    titulo: 'Questão em Primeiro',
    descricao:
      'Você é desafiado com uma questão real de concurso ANTES de estudar o conteúdo. O cérebro entra em "modo de busca" — muito mais receptivo ao aprendizado.',
    cor: 'indigo',
  },
  {
    numero: 2,
    titulo: 'Erro Vira Dado',
    descricao:
      'Cada resposta incorreta não é fracasso — é um mapa. O sistema identifica exatamente qual lacuna de conhecimento precisa ser preenchida.',
    cor: 'amber',
  },
  {
    numero: 3,
    titulo: 'NeuroSlide Gerado',
    descricao:
      'Um slide visual é gerado sob demanda, sintetizando o conceito correto de forma visual, direta e memorável. Sem enrolação.',
    cor: 'violet',
  },
  {
    numero: 4,
    titulo: 'Revisão Inteligente',
    descricao:
      'O sistema agenda revisões no momento certo, antes que o esquecimento aconteça. Você estuda menos e retém muito mais.',
    cor: 'emerald',
  },
];

const topicos: TopicoProps[] = [
  {
    icone: <Heart size={22} />,
    titulo: 'Fundamentos de Enfermagem',
    tags: ['Sinais Vitais', 'Curativos', 'Posicionamento', 'Higienização'],
    cor: 'rose',
  },
  {
    icone: <Dna size={22} />,
    titulo: 'Anatomia e Fisiologia',
    tags: ['Sistema Cardiovascular', 'Respiratório', 'Nervoso', 'Renal'],
    cor: 'sky',
  },
  {
    icone: <Syringe size={22} />,
    titulo: 'Farmacologia',
    tags: ['Vias de Administração', 'Cálculo de Dose', 'Interações', 'Diluições'],
    cor: 'violet',
  },
  {
    icone: <Activity size={22} />,
    titulo: 'Urgência e Emergência',
    tags: ['RCP', 'Triagem Manchester', 'Choque', 'Politrauma'],
    cor: 'red',
  },
  {
    icone: <Shield size={22} />,
    titulo: 'Saúde Pública',
    tags: ['Vigilância Epidemiológica', 'SUS', 'Imunização', 'PSF'],
    cor: 'teal',
  },
  {
    icone: <Scale size={22} />,
    titulo: 'Ética e Legislação',
    tags: ['COFEN', 'Código de Ética', 'Responsabilidade', 'COREN'],
    cor: 'amber',
  },
];

const corMap: Record<string, { bg: string; text: string; border: string; badge: string; num: string }> = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-700',  num: 'bg-indigo-600 text-white' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',    num: 'bg-amber-500 text-white' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700',  num: 'bg-violet-600 text-white' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', num: 'bg-emerald-600 text-white' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-700',      num: 'bg-rose-500 text-white' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     badge: 'bg-sky-100 text-sky-700',        num: 'bg-sky-500 text-white' },
  red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     badge: 'bg-red-100 text-red-700',        num: 'bg-red-500 text-white' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    badge: 'bg-teal-100 text-teal-700',      num: 'bg-teal-600 text-white' },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EtapaCard({ numero, titulo, descricao, cor }: EtapaProps) {
  const c = corMap[cor];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: numero * 0.1 }}
      className={`relative p-6 rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}
    >
      <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl ${c.num} flex items-center justify-center text-sm font-black`}>
        {numero}
      </div>
      <h3 className={`text-base font-black ${c.text} mb-2 pr-10`}>{titulo}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{descricao}</p>
    </motion.div>
  );
}

function TopicoCard({ icone, titulo, tags, cor }: TopicoProps) {
  const c = corMap[cor];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className={`p-5 rounded-2xl border ${c.border} ${c.bg} space-y-3`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.num} flex items-center justify-center`}>
          {icone}
        </div>
        <h3 className={`text-sm font-black ${c.text}`}>{titulo}</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.badge}`}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function MaterialPage() {
  return (
    <div className="min-h-full bg-slate-50 pb-16">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-14 md:py-20">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 12px)',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/30 mb-6"
          >
            <Sparkles size={14} className="text-[#BEF264]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">
              Material de Apoio
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-[1000] italic tracking-tighter text-white mb-4 leading-tight"
          >
            Estudo Reverso para<br />
            <span className="text-[#BEF264]">Técnico de Enfermagem</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base font-medium max-w-xl mx-auto leading-relaxed"
          >
            A metodologia que inverte o processo de aprendizado: você começa pela questão,
            o erro vira dado, e os NeuroSlides sintetizam o conhecimento de forma visual e memorável.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            {[
              { icon: <Brain size={16} />, label: 'Baseado em Neurociência' },
              { icon: <Target size={16} />, label: 'Foco no Edital' },
              { icon: <TrendingUp size={16} />, label: 'Aprendizado Acelerado' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <span className="text-[#BEF264]">{icon}</span>
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-14 pt-12">

        {/* ── O QUE É ESTUDO REVERSO ── */}
        <section>
          <SectionHeader
            badge="O Método"
            titulo="O que é Estudo Reverso?"
            subtitulo="A ciência por trás da metodologia que está transformando a preparação para concursos de saúde."
          />

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {[
              {
                icone: <Lightbulb size={22} />,
                cor: 'indigo',
                titulo: 'Efeito Teste',
                desc: 'Responder questões fixa o conhecimento até 2× mais do que apenas ler. Seu cérebro consolida memórias quando é obrigado a recuperar informação.',
              },
              {
                icone: <GitMerge size={22} />,
                cor: 'violet',
                titulo: 'Desejável Dificuldade',
                desc: 'Aprender pelo erro cria conexões neurais mais fortes. A dificuldade no momento do aprendizado se traduz em retenção superior a longo prazo.',
              },
              {
                icone: <Crosshair size={22} />,
                cor: 'emerald',
                titulo: 'Mapeamento Preciso',
                desc: 'Cada erro é um dado. O sistema sabe exatamente quais assuntos precisam de reforço, eliminando o tempo desperdiçado em conteúdo já dominado.',
              },
            ].map(({ icone, cor, titulo, desc }) => {
              const c = corMap[cor];
              return (
                <motion.div
                  key={titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl border ${c.border} ${c.bg}`}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.num} flex items-center justify-center mb-4`}>
                    {icone}
                  </div>
                  <h3 className={`text-sm font-black ${c.text} mb-2`}>{titulo}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── COMO FUNCIONA NA AVANT ── */}
        <section>
          <SectionHeader
            badge="Passo a Passo"
            titulo="Como funciona na AVANT?"
            subtitulo="Quatro etapas que transformam questões de concurso em conhecimento fixado."
          />
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {etapas.map((etapa) => (
              <EtapaCard key={etapa.numero} {...etapa} />
            ))}
          </div>

          {/* Diagrama de fluxo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-4">Ciclo de Aprendizado</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
              {[
                { label: 'Questão', cor: 'bg-indigo-100 text-indigo-700' },
                { label: 'Resposta', cor: 'bg-slate-100 text-slate-600' },
                { label: 'Análise', cor: 'bg-amber-100 text-amber-700' },
                { label: 'NeuroSlide', cor: 'bg-violet-100 text-violet-700' },
                { label: 'Revisão', cor: 'bg-emerald-100 text-emerald-700' },
                { label: 'Fixação', cor: 'bg-green-100 text-green-700' },
              ].map(({ label, cor }, i, arr) => (
                <React.Fragment key={label}>
                  <span className={`px-3 py-1.5 rounded-full ${cor}`}>{label}</span>
                  {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── NEUROSLIDES: TIPOS ── */}
        <section>
          <SectionHeader
            badge="NeuroSlides"
            titulo="Tipos de Slides Visuais"
            subtitulo="Cada conceito é apresentado no formato mais eficaz para sua memorização."
          />

          <div className="mt-8">
            <NeuroSlidesShowcaseGrid />
          </div>
        </section>

        {/* ── TÓPICOS COBERTOS ── */}
        <section>
          <SectionHeader
            badge="Conteúdo Programático"
            titulo="Áreas Cobertas pelo AVANT"
            subtitulo="Todo o conteúdo mapeado nos principais editais de Técnico de Enfermagem do Brasil."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {topicos.map((topico) => (
              <TopicoCard key={topico.titulo} {...topico} />
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-center shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BEF264]/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <RefreshCw size={28} className="text-[#BEF264]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-[1000] italic tracking-tighter text-white mb-3">
              Prontos para começar?
            </h2>
            <p className="text-indigo-200 font-medium text-sm mb-7 max-w-md mx-auto leading-relaxed">
              Vá para a Vitrine de Aulas, escolha um módulo e inicie seu primeiro ciclo de Estudo Reverso agora mesmo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/estudar"
                className="inline-flex items-center gap-2 bg-[#BEF264] text-slate-900 font-black px-6 py-3 rounded-xl text-sm hover:scale-105 transition-transform shadow-lg"
              >
                Ir para Vitrine de Aulas <ArrowRight size={16} />
              </a>
              <div className="flex items-center gap-2 text-indigo-200 text-sm font-bold">
                <CheckCircle2 size={16} className="text-[#BEF264]" />
                Mais de 1.000 questões mapeadas
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SectionHeader({ badge, titulo, subtitulo }: { badge: string; titulo: string; subtitulo: string }) {
  return (
    <div className="text-center">
      <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100 mb-3">
        {badge}
      </span>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{titulo}</h2>
      <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">{subtitulo}</p>
    </div>
  );
}
