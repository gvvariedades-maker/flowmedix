'use client';

import {
  Baby,
  CalendarDays,
  HeartHandshake,
  Landmark,
  MapPinned,
  Network,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 3
 *
 * Títulos na ordem:
 * 17. Lei 8.080/1990: princípios e diretrizes do SUS
 * 18. Lei 8.080/1990: participação e direito à saúde (visão geral)
 * 19. Lei 8.142/1990: Conferência de Saúde (objetivo e aprovação de diretrizes)
 * 20. Lei 8.142/1990: Conselho de Saúde (papel, composição, mandato)
 * 21. Decreto 7.508/2011: eixo de cuidar e cuidado integrado (noções de prova)
 * 22. Decreto 7.508/2011: Atenção Primária, NAP e território (conceitual)
 * 23. CPNI: calendário infantil (eixos de prova por idade)
 * 24. CPNI: imunizantes de gestante e puérpera, registro e cuidado
 */
export function MaterialSlidesLote3Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Mapa de Conceitos"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Lei 8.080/90: princípios e diretrizes do SUS"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Landmark size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Universalidade', sub: 'acesso para todos' },
              { label: 'Integralidade', sub: 'cuidado completo' },
              { label: 'Igualdade', sub: 'sem preconceitos' },
              { label: 'Descentralização', sub: 'gestão nas esferas' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-cyan-200">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Em prova: a Lei 8.080 organiza as condições para promoção, proteção e recuperação da saúde.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Ouro"
        badgeColor="bg-emerald-400/20 text-emerald-300"
        titulo="Lei 8.080/90: direito à saúde e participação"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<HeartHandshake size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Saúde', valor: 'direito fundamental' },
              { label: 'Estado', valor: 'dever de garantir políticas' },
              { label: 'Determinantes', valor: 'moradia, renda, saneamento, trabalho' },
              { label: 'Participação', valor: 'controle social no SUS' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-medium text-white/60">{label}</span>
                <span className="max-w-[65%] text-right text-[11px] font-black leading-tight text-white">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-[10px] font-bold leading-relaxed text-emerald-100">
              Pegadinha: SUS não é só assistência; inclui vigilância, prevenção e promoção da saúde.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Fluxo Lógico"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Lei 8.142/90: Conferência de Saúde"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<UsersRound size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Reúne representantes de vários segmentos sociais.',
              'Avalia a situação de saúde.',
              'Propõe diretrizes para a política de saúde.',
              'Ocorre a cada 4 anos, ou extraordinariamente.',
              'Tem papel estratégico no controle social.',
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
        tipo="Mapa de Controle Social"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Lei 8.142/90: Conselho de Saúde"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<ShieldCheck size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-fuchsia-300">Natureza</p>
              <p className="text-[10px] text-white/60">órgão colegiado, permanente e deliberativo.</p>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-cyan-300">Papel</p>
              <p className="text-[10px] text-white/60">formula estratégias e controla execução da política.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Ponto clássico: representação dos usuários é paritária em relação ao conjunto dos demais segmentos.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Rede de Cuidado"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="Decreto 7.508/11: cuidado integrado"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<Network size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { item: 'Região de Saúde', foco: 'território com ações e serviços organizados' },
              { item: 'Rede de Atenção', foco: 'integra serviços em níveis de complexidade' },
              { item: 'Integralidade', foco: 'continuidade do cuidado no percurso do usuário' },
              { item: 'COAP', foco: 'contrato organizativo da ação pública em saúde' },
            ].map(({ item, foco }) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-blue-300">{item}</p>
                <p className="text-[10px] text-white/55">{foco}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Porta de Entrada"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Decreto 7.508/11: APS, NAP e território"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<MapPinned size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Território', valor: 'base para organizar demanda e cuidado' },
              { label: 'APS', valor: 'porta preferencial e coordenadora do cuidado' },
              { label: 'Acesso', valor: 'porta aberta conforme rede pactuada' },
              { label: 'Referência', valor: 'encaminha e acompanha na rede' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-lime-300">{label}</span>
                <span className="max-w-[68%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-[10px] font-bold leading-relaxed text-lime-100">
              Leitura de prova: território, acesso e continuidade são chaves para entender a rede.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Calendário Infantil"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="CPNI: calendário infantil por idade"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<Baby size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { idade: 'Ao nascer', foco: 'BCG e hepatite B' },
              { idade: '2-6 meses', foco: 'séries primárias' },
              { idade: '9-12 meses', foco: 'febre amarela e tríplice viral' },
              { idade: '15 meses+', foco: 'reforços e combinadas' },
            ].map(({ idade, foco }) => (
              <div key={idade} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-amber-300">{idade}</p>
                <p className="text-[10px] text-white/55">{foco}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-[10px] font-bold leading-relaxed text-amber-100">
              Em concurso, atenção a idade, reforço, contraindicação e atraso vacinal.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Registro"
        badgeColor="bg-rose-400/20 text-rose-300"
        titulo="CPNI: gestante, puérpera, registro e cuidado"
        gradiente="bg-gradient-to-br from-slate-900 to-rose-950"
        icone={<CalendarDays size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Gestante: checar esquema vacinal e registrar cada dose.',
              'dT/dTpa e hepatite B aparecem com frequência em questões.',
              'Vacinas de vírus vivo são avaliadas com atenção no período gestacional.',
              'Puérpera: revisar cartão e orientar retorno conforme calendário vigente.',
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
