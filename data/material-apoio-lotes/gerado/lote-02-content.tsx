'use client';

import {
  AlertTriangle,
  Calculator,
  Clock3,
  Droplet,
  Pill,
  ShieldCheck,
  Syringe,
  TriangleAlert,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 2
 *
 * Títulos na ordem:
 * 9. Cálculo de dose: regra de três e concentrações
 * 10. Gotas e infusão: noções básicas (gts/min, ml/h)
 * 11. Penicilinas: alergia, reação e cuidados
 * 12. Insulina: tipos, armazenamento e aplicação
 * 13. Hipoglicemia e hiperglicemia: sinais e conduta básica de enfermagem
 * 14. Vias: oral, sublingual, tópica, retal
 * 15. Parenteral: IM, SC e EV — ângulo e cuidado
 * 16. Seis certos (rights) e prevenção de erro de medicação
 */
export function MaterialSlidesLote2Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Regra de Ouro"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Cálculo de dose: regra de três e concentrações"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Calculator size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: '1. Prescrito', valor: 'o que o paciente deve receber' },
              { label: '2. Disponível', valor: 'concentração da apresentação' },
              { label: '3. Unidade', valor: 'mg, mL, UI ou g sem misturar' },
              { label: '4. Resultado', valor: 'dose + via + horário' },
            ].map(({ label, valor }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-cyan-200">{label}</p>
                <p className="text-[10px] text-white/55">{valor}</p>
              </div>
            ))}
            <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Pegadinha de prova: antes de calcular, converta unidades e confira se a resposta faz sentido.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Fluxo Lógico"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Gotas e infusão: gts/min e mL/h"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<Clock3 size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Identifique volume total e tempo prescrito.',
              'Converta horas para minutos quando a fórmula pedir.',
              'Confira o equipo: macro ou microgotas.',
              'Calcule e arredonde conforme rotina institucional.',
              'Monitore permeabilidade, dor, edema e velocidade.',
            ].map((texto, index) => (
              <div key={texto} className="flex items-center gap-2.5 rounded-lg bg-violet-500/20 p-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black text-white">
                  {index + 1}
                </span>
                <p className="text-[11px] font-bold text-white/80">{texto}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Perigo"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="Penicilinas: alergia, reação e cuidados"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<AlertTriangle size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Perguntar e registrar histórico de alergia medicamentosa.',
              'Observar rash, prurido, edema, broncoespasmo e queda de pressão.',
              'Não ignorar relato prévio de anafilaxia ou reação grave.',
              'Comunicar reação e seguir protocolo institucional imediatamente.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500/30 text-[8px] font-black text-red-300">
                  !
                </span>
                <p className="text-[11px] font-medium leading-tight text-white/70">{item}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa de Conceitos"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Insulina: tipos, armazenamento e aplicação"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Droplet size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tipos', sub: 'rápida, regular, NPH, análogos' },
              { label: 'Conservação', sub: 'atenção à temperatura' },
              { label: 'Aplicação', sub: 'rodízio de locais' },
              { label: 'Risco', sub: 'hipoglicemia' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-lime-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-[10px] font-bold leading-relaxed text-lime-100">
              Em prova: confira dose em UI, via subcutânea e orientação sobre rodízio.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Arena Versus"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="Hipoglicemia vs hiperglicemia: sinais e cuidado"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<TriangleAlert size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-amber-300">Hipo</p>
              <p className="text-[10px] text-white/60">sudorese, tremor, fome, confusão, palidez.</p>
            </div>
            <div className="rounded-xl border border-red-400/20 bg-red-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-red-300">Hiper</p>
              <p className="text-[10px] text-white/60">poliúria, polidipsia, fadiga, hálito cetônico em alerta.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Conduta básica: reconhecer sinais, checar glicemia conforme rotina e comunicar alteração.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa de Vias"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="Vias: oral, sublingual, tópica e retal"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<Pill size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Oral', sub: 'deglutição e absorção GI' },
              { label: 'Sublingual', sub: 'não mastigar ou engolir rápido' },
              { label: 'Tópica', sub: 'pele/mucosa, efeito local' },
              { label: 'Retal', sub: 'privacidade e posicionamento' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-blue-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Scanner Técnico"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Parenteral: IM, SC e EV — ângulo e cuidado"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<Syringe size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { via: 'IM', foco: 'músculo, volume/local conforme rotina' },
              { via: 'SC', foco: 'tecido subcutâneo, pinça se indicado' },
              { via: 'EV', foco: 'acesso, diluição e permeabilidade' },
              { via: 'Sempre', foco: 'assepsia, identificação e registro' },
            ].map(({ via, foco }) => (
              <div key={via} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-fuchsia-300">{via}</span>
                <span className="max-w-[70%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {foco}
                </span>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Segurança"
        badgeColor="bg-emerald-400/20 text-emerald-300"
        titulo="Seis certos e prevenção de erro de medicação"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<ShieldCheck size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              'paciente',
              'medicamento',
              'dose',
              'via',
              'horário',
              'registro',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2.5">
                <p className="text-[11px] font-black uppercase tracking-wide text-emerald-300">{item}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Se houver dúvida, pare, confira prescrição e comunique antes de administrar.
            </p>
          </div>
        }
      />
    </div>
  );
}
