'use client';

import {
  Activity,
  Biohazard,
  Droplets,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  Wind,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 5
 *
 * Títulos na ordem:
 * 33. HAS: definição, metas e sinais de emergência
 * 34. HAS: classes terapêuticas e educação em saúde (básico para prova)
 * 35. Diabetes mellitus tipo 2: sinais, critérios e complicações agudas
 * 36. Cetoacidose e hipoglicemia: pistas e armadilhas de questão
 * 37. Tuberculose: transmissão, sintomas, DOTS e precaução
 * 38. Hanseníase: formas clínicas, multiquimioterapia e cuidado
 * 39. HIV: vias de transmissão, prevenção e noções de PEP/PrEP para prova
 * 40. Infecções respiratórias: gripe, COVID-19 e sinais de gravidade (noções)
 */
export function MaterialSlidesLote5Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Zona de Alerta"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="HAS: definição, metas e sinais de emergência"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<HeartPulse size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'HAS', valor: 'pressão elevada de forma sustentada' },
              { label: 'Meta', valor: 'controle + adesão + acompanhamento' },
              { label: 'Alerta', valor: 'dor torácica, déficit neurológico, dispneia' },
              { label: 'Conduta', valor: 'reavaliar, registrar e comunicar' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-red-300">{label}</span>
                <span className="max-w-[68%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-2 text-[10px] font-bold leading-relaxed text-red-100">
              Em prova: urgência/emergência hipertensiva costuma vir associada a lesão de órgão-alvo.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa Terapêutico"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="HAS: classes terapêuticas e educação em saúde"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Stethoscope size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Diuréticos', sub: 'controle de volume' },
              { label: 'IECA/BRA', sub: 'eixo renina-angiotensina' },
              { label: 'BCC', sub: 'vasodilatação' },
              { label: 'Educação', sub: 'sal, peso, adesão, atividade' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-cyan-200">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Técnico em enfermagem: reforçar orientação, aferir PA corretamente e registrar resposta.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa de Conceitos"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="DM2: sinais, critérios e complicações agudas"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<Droplets size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Sinais', sub: 'poliúria, polidipsia, perda de peso' },
              { label: 'Critério', sub: 'glicemia/HbA1c conforme protocolo' },
              { label: 'Agudas', sub: 'hipo, CAD, estado hiperosmolar' },
              { label: 'Cuidado', sub: 'pé, pele, alimentação, adesão' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-amber-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Arena Versus"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Cetoacidose vs hipoglicemia: pistas de questão"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<TestTube2 size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-red-400/20 bg-red-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-red-300">Cetoacidose</p>
              <p className="text-[10px] text-white/60">hiperglicemia, desidratação, hálito cetônico, respiração profunda.</p>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-amber-300">Hipoglicemia</p>
              <p className="text-[10px] text-white/60">sudorese, tremor, fome, confusão e risco de rebaixamento.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Armadilha: sintomas neurológicos podem aparecer nos dois extremos glicêmicos.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Fluxo de Vigilância"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Tuberculose: transmissão, sintomas, DOTS e precaução"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<Wind size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Transmissão aérea por aerossóis.',
              'Suspeitar em tosse persistente, febre vespertina, sudorese e emagrecimento.',
              'Coletar/encaminhar exame conforme fluxo local.',
              'DOTS: tratamento diretamente observado para adesão.',
              'Orientar etiqueta respiratória e ventilação do ambiente.',
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
        tipo="Scanner Clínico"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Hanseníase: formas, tratamento e cuidado"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Activity size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { item: 'Sinal-chave', foco: 'mancha com alteração de sensibilidade' },
              { item: 'Classificação', foco: 'paucibacilar ou multibacilar' },
              { item: 'Tratamento', foco: 'poliquimioterapia conforme protocolo' },
              { item: 'Cuidado', foco: 'prevenir incapacidades e reduzir estigma' },
            ].map(({ item, foco }) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-lime-300">{item}</p>
                <p className="text-[10px] text-white/55">{foco}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa de Prevenção"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="HIV: transmissão, prevenção e PEP/PrEP"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<ShieldCheck size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Transmissão', sub: 'sexual, sanguínea, vertical' },
              { label: 'Não transmite', sub: 'toque, abraço, talheres' },
              { label: 'PEP', sub: 'pós-exposição, tempo-dependente' },
              { label: 'PrEP', sub: 'pré-exposição para risco aumentado' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-blue-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-blue-400/20 bg-blue-400/10 p-2 text-[10px] font-bold leading-relaxed text-blue-100">
              Em prova: biossegurança e acolhimento sem discriminação são pontos recorrentes.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Gravidade"
        badgeColor="bg-rose-400/20 text-rose-300"
        titulo="Infecções respiratórias: sinais de gravidade"
        gradiente="bg-gradient-to-br from-slate-900 to-rose-950"
        icone={<Biohazard size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Dispneia, tiragem ou saturação baixa são alertas.',
              'Febre persistente, prostração e piora clínica exigem reavaliação.',
              'Etiqueta respiratória, máscara quando indicada e higiene das mãos reduzem transmissão.',
              'Grupos de risco: idosos, gestantes, imunossuprimidos e comorbidades.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/30 text-[8px] font-black text-rose-300">
                  !
                </span>
                <p className="text-[11px] font-medium leading-tight text-white/70">{item}</p>
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
