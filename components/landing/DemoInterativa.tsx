'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, Layers, Lightbulb, ShieldAlert, Target } from 'lucide-react';

type Fase = 'questao' | 'diagnostico' | 'slides';

type CorNeuroSlide = 'cyan' | 'amber' | 'indigo' | 'rose';

const questao = {
  fonte: 'ITAME · Pref. Goianésia/GO · Técnico em Enfermagem · 2022',
  tema: 'Cálculo de Administração de Medicamentos e Infusões',
  enunciado:
    'Uma ampola de Gluconato de Cálcio 8%/10mL foi diluída em 50mL de soro glicosado 5%. Se dessa solução o paciente receber apenas 42mL, a quantidade de Gluconato de Cálcio infundida será de:',
  alternativas: [
    { letra: 'A', texto: '480 mg.' },
    { letra: 'B', texto: '520 mg.' },
    { letra: 'C', texto: '560 mg.' },
    { letra: 'D', texto: '580 mg.' },
  ],
  gabarito: 'C',
  explicacao:
    'Volume total = 10mL (ampola) + 50mL (diluente) = 60mL. Concentração: 8% = 80mg/mL × 10mL = 800mg em 60mL. Regra de três: 800mg → 60mL / x → 42mL. Resultado: x = 560mg.',
  neuroslides: [
    { tipo: 'MAPA DE CONCEITOS', cor: 'cyan' as const, descricao: 'Panorama do tema' },
    { tipo: 'REGRA DE OURO', cor: 'amber' as const, descricao: 'Regra que a banca cobra' },
    { tipo: 'FLUXO LÓGICO', cor: 'indigo' as const, descricao: 'Raciocínio passo a passo' },
    { tipo: 'ZONA DE PERIGO', cor: 'rose' as const, descricao: 'Evite as pegadinhas' },
  ],
};

function getCorClasses(cor: CorNeuroSlide) {
  const map = {
    cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    amber: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    indigo: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-200',
    rose: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
  } as const;
  return map[cor];
}

function getSlideIcon(cor: CorNeuroSlide) {
  if (cor === 'cyan') return Layers;
  if (cor === 'amber') return Lightbulb;
  if (cor === 'indigo') return Target;
  return ShieldAlert;
}

export function DemoInterativa() {
  const [fase, setFase] = useState<Fase>('questao');
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const acertou = useMemo(() => selecionada === questao.gabarito, [selecionada]);

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Demo interativa</p>
          <h2 className="mb-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
            Experimente uma questão real antes de criar conta.
          </h2>
          <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
            Responda, veja o diagnóstico e visualize como o Avant transforma seu erro em direção de estudo.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-6 sm:p-8">
          {fase === 'questao' && (
            <div>
              <div className="mb-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{questao.fonte}</p>
                <p className="text-sm font-bold text-cyan-200">{questao.tema}</p>
                <p className="text-base font-semibold leading-relaxed text-slate-200 sm:text-lg">{questao.enunciado}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {questao.alternativas.map((alt) => {
                  const ativa = selecionada === alt.letra;
                  return (
                    <button
                      key={alt.letra}
                      type="button"
                      onClick={() => setSelecionada(alt.letra)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        ativa
                          ? 'border-cyan-400/40 bg-cyan-400/10'
                          : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
                      }`}
                    >
                      <p className="mb-1 text-sm font-black uppercase tracking-wide text-white">{alt.letra}</p>
                      <p className="text-sm font-medium leading-relaxed text-slate-300">{alt.texto}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setFase('diagnostico')}
                  disabled={!selecionada}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-7 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  Ver diagnóstico
                  <ArrowRight size={17} />
                </button>
                <p className="text-sm font-medium text-slate-500">Selecione uma alternativa para avançar.</p>
              </div>
            </div>
          )}

          {fase === 'diagnostico' && (
            <div>
              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 ${
                  acertou ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-rose-400/25 bg-rose-400/10'
                }`}
              >
                {acertou ? (
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={20} />
                ) : (
                  <CircleAlert className="mt-0.5 shrink-0 text-rose-300" size={20} />
                )}
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-white">
                    {acertou ? 'Resposta correta!' : 'Resposta incorreta'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-300">
                    Você marcou <strong>{selecionada}</strong>. Gabarito: <strong>{questao.gabarito}</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-indigo-300">Diagnóstico</p>
                <p className="text-sm font-medium leading-relaxed text-slate-300">{questao.explicacao}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setFase('slides')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-7 py-3 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]"
                >
                  Ver preview dos NeuroSlides
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setFase('questao')}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {fase === 'slides' && (
            <div>
              <div className="mb-6">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Preview dos NeuroSlides</p>
                <h3 className="text-2xl font-[1000] tracking-tight text-white">Da resposta para a revisão inteligente</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {questao.neuroslides.map((slide) => {
                  const Icon = getSlideIcon(slide.cor);
                  return (
                    <div key={slide.tipo} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                      <div
                        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${getCorClasses(slide.cor)}`}
                      >
                        <Icon size={20} />
                      </div>
                      <h4 className="mb-1 text-sm font-black tracking-tight text-white">{slide.tipo}</h4>
                      <p className="text-sm font-medium leading-relaxed text-slate-400">{slide.descricao}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]"
                >
                  Testar grátis agora
                  <ArrowRight size={18} />
                </Link>
                <button
                  type="button"
                  onClick={() => setFase('questao')}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  Refazer demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
