'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  FlaskConical,
  GitMerge,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface NeuroCardProps {
  tipo: string;
  badgeColor: string;
  titulo: string;
  conteudo: React.ReactNode;
  icone: React.ReactNode;
  gradiente: string;
}

/** Card de pré-visualização de NeuroSlide — mesmo padrão visual do Material de Apoio */
export function NeuroSlidePreview({
  tipo,
  badgeColor,
  titulo,
  conteudo,
  icone,
  gradiente,
}: NeuroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-xl ${gradiente} p-5 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor}`}>
          {tipo}
        </span>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70">{icone}</div>
      </div>

      <div className="text-white">
        <h3 className="text-sm font-black uppercase tracking-tight mb-3 leading-tight">{titulo}</h3>
        {conteudo}
      </div>
    </motion.div>
  );
}

/**
 * Os 6 modelos de NeuroSlide usados no Material de Apoio — reutilizáveis na landing e em outras páginas.
 */
export function NeuroSlidesShowcaseGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      <NeuroSlidePreview
        tipo="Mapa de Conceitos"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Vias de Administração de Medicamentos"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Layers size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '💉', label: 'Intravenosa', sub: 'Ação imediata' },
              { icon: '💊', label: 'Oral', sub: 'Mais comum' },
              { icon: '🩹', label: 'Subcutânea', sub: 'Absorção lenta' },
              { icon: '💪', label: 'Intramuscular', sub: 'Absorção média' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <p className="text-base mb-0.5">{icon}</p>
                <p className="text-[11px] font-black text-white leading-tight">{label}</p>
                <p className="text-[10px] text-white/50">{sub}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Ouro"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="Sinais Vitais: Valores de Referência"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<Sparkles size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'PA (adulto)', valor: '120/80 mmHg', alerta: false },
              { label: 'FC (adulto)', valor: '60–100 bpm', alerta: false },
              { label: 'FR (adulto)', valor: '12–20 irpm', alerta: false },
              { label: 'Temp. axilar', valor: '35,5–37°C', alerta: false },
              { label: 'SpO₂', valor: '≥ 95%', alerta: true },
            ].map(({ label, valor, alerta }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                <span className="text-[11px] text-white/60 font-medium">{label}</span>
                <span className={`text-[11px] font-black ${alerta ? 'text-amber-300' : 'text-white'}`}>{valor}</span>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Perigo"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="Contraindicações: Sulfato de Magnésio"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<AlertTriangle size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Frequência respiratória < 16 irpm',
              'Diurese < 25–30 mL/hora',
              'Ausência de reflexo patelar',
              'Níveis séricos > 9 mEq/L',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-[8px]">✕</span>
                </div>
                <p className="text-[11px] text-white/70 font-medium leading-tight">{item}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Fluxo Lógico"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Protocolo de RCP — Adulto"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<GitMerge size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              { n: '1', texto: 'Reconhecer inconsciência', cor: 'bg-violet-500/30' },
              { n: '2', texto: 'Chamar ajuda + DEA', cor: 'bg-violet-500/30' },
              { n: '3', texto: '30 compressões (5–6 cm)', cor: 'bg-violet-600/30' },
              { n: '4', texto: '2 ventilações (30:2)', cor: 'bg-violet-600/30' },
              { n: '5', texto: 'Continuar até DEA chegar', cor: 'bg-violet-700/30' },
            ].map(({ n, texto, cor }) => (
              <div key={n} className={`flex items-center gap-2.5 p-2 rounded-lg ${cor}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  {n}
                </span>
                <p className="text-[11px] font-bold text-white/80">{texto}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Arena Versus"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Antissepsia vs. Assepsia"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<FlaskConical size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/15 border border-blue-400/20 rounded-xl p-3 space-y-1.5">
              <p className="text-[11px] font-black text-blue-300 uppercase">Assepsia</p>
              <p className="text-[10px] text-white/60">Previne a entrada de microrganismos</p>
              <p className="text-[10px] text-white/60">Ex: campo cirúrgico estéril</p>
            </div>
            <div className="bg-fuchsia-500/15 border border-fuchsia-400/20 rounded-xl p-3 space-y-1.5">
              <p className="text-[11px] font-black text-fuchsia-300 uppercase">Antissepsia</p>
              <p className="text-[10px] text-white/60">Destrói microrganismos na pele</p>
              <p className="text-[10px] text-white/60">Ex: álcool 70% antes da punção</p>
            </div>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Scanner Silábico"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Memorize: Níveis de Prevenção"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Zap size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { nivel: 'Primária', cor: 'text-lime-300', ex: 'Vacinação, educação em saúde' },
              { nivel: 'Secundária', cor: 'text-emerald-300', ex: 'Diagnóstico precoce, rastreamento' },
              { nivel: 'Terciária', cor: 'text-teal-300', ex: 'Reabilitação, limitação do dano' },
            ].map(({ nivel, cor, ex }) => (
              <div key={nivel} className="flex flex-col gap-0.5 py-1.5 border-b border-white/10 last:border-0">
                <span className={`text-[12px] font-black ${cor} uppercase tracking-wide`}>{nivel}</span>
                <span className="text-[10px] text-white/50">{ex}</span>
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
