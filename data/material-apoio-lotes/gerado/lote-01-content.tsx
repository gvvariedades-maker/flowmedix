'use client';

import {
  Activity,
  Droplets,
  Hand,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Waves,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 1
 *
 * Títulos na ordem:
 * 1. Sinais vitais: conceitos, frequência e registro
 * 2. PA: técnicas e referências básicas (adulto)
 * 3. Temperatura, FC e FR: referência e cuidado na aferição
 * 4. Sondagem vesical: indicações e cuidados essenciais
 * 5. Sondagem nasogástrica: indicações e passos gerais de segurança
 * 6. Curativos: classificação e princípios de assepsia
 * 7. Higiene e conforto: cuidado corporal e posicionamento
 * 8. Higienização das mãos: cinco momentos (OMS) e fricção alcoólica
 */
export function MaterialSlidesLote1Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Mapa de Conceitos"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Sinais vitais: conceito, frequência e registro"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<HeartPulse size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'PA', sub: 'pressão arterial' },
              { label: 'FC', sub: 'pulso / frequência' },
              { label: 'FR', sub: 'ritmo respiratório' },
              { label: 'Temp.', sub: 'valor + via' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[12px] font-black text-cyan-200">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2.5">
              <p className="text-[10px] font-bold leading-relaxed text-cyan-100">
                Em prova: registrar valor, horário, via/local e alteração observada.
              </p>
            </div>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Ouro"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="PA: técnica e referência básica no adulto"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<Stethoscope size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Antes', valor: 'repouso + braço apoiado' },
              { label: 'Manguito', valor: 'tamanho adequado' },
              { label: 'Posição', valor: 'nível do coração' },
              { label: 'Registro', valor: 'valor + membro + horário' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-medium text-white/60">{label}</span>
                <span className="text-right text-[11px] font-black text-white">{valor}</span>
              </div>
            ))}
            <p className="rounded-xl bg-amber-400/10 p-2 text-[10px] font-bold leading-relaxed text-amber-200">
              Pegadinha: técnica inadequada altera o resultado e induz erro de interpretação.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Scanner de Valores"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Temperatura, FC e FR: referência e cuidado"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Thermometer size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { item: 'Temperatura', foco: 'via de aferição importa' },
              { item: 'FC', foco: 'ritmo e intensidade do pulso' },
              { item: 'FR', foco: 'contar sem induzir padrão' },
              { item: 'Registro', foco: 'valor + sinal associado' },
            ].map(({ item, foco }) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black uppercase tracking-wide text-lime-300">{item}</p>
                <p className="text-[10px] text-white/55">{foco}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Perigo"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="Sondagem vesical: indicações e cuidados essenciais"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<Droplets size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Manter técnica asséptica durante o procedimento.',
              'Fixar sonda para evitar tração e lesão.',
              'Manter coletor abaixo do nível da bexiga.',
              'Observar débito, aspecto da urina e sinais de infecção.',
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
        tipo="Fluxo Lógico"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Sondagem nasogástrica: passos gerais de segurança"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<Waves size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Conferir prescrição e finalidade.',
              'Orientar paciente e posicionar adequadamente.',
              'Medir extensão e lubrificar conforme rotina.',
              'Confirmar posicionamento segundo protocolo institucional.',
              'Registrar intercorrências e resposta do paciente.',
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
        tipo="Arena Versus"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Curativos: classificação e princípios de assepsia"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<ShieldCheck size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-cyan-300">Limpo</p>
              <p className="text-[10px] text-white/60">proteção, absorção e troca conforme indicação.</p>
            </div>
            <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-fuchsia-300">Infectado</p>
              <p className="text-[10px] text-white/60">atenção a odor, exsudato, dor, calor e rubor.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Princípio de prova: reduzir contaminação e preservar tecido de granulação.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa de Cuidados"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="Higiene e conforto: cuidado corporal e posicionamento"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<Activity size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pele', sub: 'limpa, seca e íntegra' },
              { label: 'Leito', sub: 'sem dobras e úmidade' },
              { label: 'Decúbito', sub: 'mudança programada' },
              { label: 'Conforto', sub: 'privacidade e segurança' },
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
        tipo="Regra de Ouro"
        badgeColor="bg-emerald-400/20 text-emerald-300"
        titulo="Higienização das mãos: 5 momentos e fricção alcoólica"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Hand size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Antes de tocar o paciente.',
              'Antes de procedimento limpo/asséptico.',
              'Após risco de exposição a fluidos.',
              'Após tocar o paciente.',
              'Após tocar superfícies próximas.',
            ].map((texto, index) => (
              <div key={texto} className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/25 text-[10px] font-black text-emerald-200">
                  {index + 1}
                </span>
                <p className="text-[11px] font-bold text-white/75">{texto}</p>
              </div>
            ))}
            <p className="pt-1 text-[10px] font-bold text-emerald-200">
              Fricção alcoólica: preferir quando mãos não estiverem visivelmente sujas.
            </p>
          </div>
        }
      />
    </div>
  );
}
