'use client';

import {
  Activity,
  AlertTriangle,
  Baby,
  Brain,
  HeartPulse,
  ShieldAlert,
  Timer,
  Zap,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 6
 *
 * Títulos na ordem:
 * 41. PCR: cadeia de sobrevivência (noções gerais)
 * 42. RCP do adulto: posição, compressão e descompressão
 * 43. RCP: ventilação, barreira e razão compressões-ventilações
 * 44. Desfibrilador e DEA: indicação e segurança
 * 45. RCP pediátrica: diferenças essenciais (noções banca)
 * 46. IAM: sinais clássicos e encaminhamento (visão básica)
 * 47. AVE: sinais, janela de tempo e acionamento (noções de prova)
 * 48. Escala de Glasgow: itens, interpretação e conduta básica
 */
export function MaterialSlidesLote6Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Fluxo Lógico"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="PCR: cadeia de sobrevivência"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<HeartPulse size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Reconhecer inconsciência e ausência de respiração normal.',
              'Acionar ajuda e serviço de emergência.',
              'Iniciar RCP de alta qualidade.',
              'Usar DEA assim que disponível.',
              'Manter cuidado pós-ressuscitação pela equipe habilitada.',
            ].map((texto, index) => (
              <div key={texto} className="flex items-center gap-2.5 rounded-lg bg-red-500/20 p-2">
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
        tipo="Regra de Ouro"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="RCP adulto: posição, compressão e descompressão"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Activity size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Local', valor: 'centro do tórax' },
              { label: 'Ritmo', valor: '100 a 120/min' },
              { label: 'Profundidade', valor: '5 a 6 cm no adulto' },
              { label: 'Retorno', valor: 'deixar o tórax expandir' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-cyan-300">{label}</span>
                <span className="max-w-[68%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Pegadinha: compressão rasa, pausa longa e não permitir retorno do tórax reduzem eficácia.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Mapa Técnico"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="RCP: ventilação, barreira e razão 30:2"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<Timer size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Razão', sub: '30 compressões : 2 ventilações' },
              { label: 'Barreira', sub: 'proteção para ventilação' },
              { label: 'Pausa', sub: 'interromper o mínimo possível' },
              { label: 'Qualidade', sub: 'ritmo, profundidade e retorno' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-violet-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-violet-400/20 bg-violet-400/10 p-2 text-[10px] font-bold leading-relaxed text-violet-100">
              Para leigos sem barreira ou treinamento: prioriza-se compressão torácica contínua até ajuda chegar.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Segurança"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="Desfibrilador e DEA: indicação e segurança"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<Zap size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Ligar o DEA e seguir comandos de voz/visual.',
              'Expor e secar tórax se necessário antes dos eletrodos.',
              'Ninguém toca no paciente durante análise ou choque.',
              'Após choque, retomar RCP imediatamente conforme orientação.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-[8px] font-black text-amber-300">
                  !
                </span>
                <p className="text-[11px] font-medium leading-tight text-white/70">{item}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Comparativo"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="RCP pediátrica: diferenças essenciais"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<Baby size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-lime-400/20 bg-lime-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-lime-300">Criança</p>
              <p className="text-[10px] text-white/60">compressão cerca de 1/3 do diâmetro AP do tórax.</p>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-cyan-300">2 socorristas</p>
              <p className="text-[10px] text-white/60">razão pode mudar conforme protocolo de SBV pediátrico.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Prova cobra a diferença central: tamanho, profundidade proporcional e foco em ventilação.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Perigo"
        badgeColor="bg-rose-400/20 text-rose-300"
        titulo="IAM: sinais clássicos e encaminhamento"
        gradiente="bg-gradient-to-br from-slate-900 to-rose-950"
        icone={<ShieldAlert size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Dor/opressão torácica pode irradiar para braço, mandíbula ou dorso.',
              'Pode haver sudorese, náuseas, palidez, dispneia e ansiedade.',
              'Mulheres, idosos e diabéticos podem ter apresentação atípica.',
              'Acionar atendimento, manter repouso e seguir protocolo institucional.',
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

      <NeuroSlidePreview
        tipo="Tempo é Cérebro"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="AVE: sinais, janela de tempo e acionamento"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<Brain size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Face caída ou assimetria facial.',
              'Fraqueza ou perda de força em braço/perna.',
              'Fala enrolada, confusão ou dificuldade de compreensão.',
              'Registrar horário do início dos sintomas.',
              'Encaminhamento rápido: tempo define possibilidade terapêutica.',
            ].map((texto, index) => (
              <div key={texto} className="flex items-center gap-2.5 rounded-lg bg-blue-500/20 p-2">
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
        tipo="Scanner Neurológico"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Escala de Glasgow: itens e interpretação"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<AlertTriangle size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Olhos', sub: '1 a 4 pontos' },
              { label: 'Verbal', sub: '1 a 5 pontos' },
              { label: 'Motora', sub: '1 a 6 pontos' },
              { label: 'Total', sub: '3 a 15 pontos' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-fuchsia-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-2 text-[10px] font-bold leading-relaxed text-fuchsia-100">
              Quanto menor a pontuação, maior o comprometimento neurológico e a necessidade de reavaliação.
            </p>
          </div>
        }
      />
    </div>
  );
}
