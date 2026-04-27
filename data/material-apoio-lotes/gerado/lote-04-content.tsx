'use client';

import {
  BadgeCheck,
  ClipboardList,
  FileText,
  Gavel,
  LockKeyhole,
  Scale,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 4
 *
 * Títulos na ordem:
 * 25. Código de ética: deveres fundamentais
 * 26. Código de ética: confidencialidade, dignidade e consentimento
 * 27. Código de ética: recusa, objeção de consciência e relação de confiança (básico)
 * 28. Lei 7.498/1986: SAE, competência e vedações gerais
 * 29. Lei 7.498/1986: SAE, responsabilidade e exercício profissional (noções)
 * 30. Ato infracional e fiscalização: COREN (visão banca)
 * 31. Documentação de enfermagem: requisitos básicos e importância legal
 * 32. Sigilo, imagem, redes e privacidade: limites e conduta (visão banca)
 */
export function MaterialSlidesLote4Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Mapa de Deveres"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Código de ética: deveres fundamentais"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<Scale size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Respeito', sub: 'dignidade e direitos' },
              { label: 'Segurança', sub: 'assistência sem dano evitável' },
              { label: 'Competência', sub: 'atuar dentro da habilidade' },
              { label: 'Comunicação', sub: 'informar e registrar' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-cyan-200">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Em prova: dever ético costuma aparecer ligado a segurança, responsabilidade e respeito ao paciente.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Regra de Ouro"
        badgeColor="bg-emerald-400/20 text-emerald-300"
        titulo="Confidencialidade, dignidade e consentimento"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<LockKeyhole size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Sigilo', valor: 'proteger dados e informações' },
              { label: 'Dignidade', valor: 'sem exposição desnecessária' },
              { label: 'Consentimento', valor: 'informação clara e respeito à decisão' },
              { label: 'Exceção', valor: 'risco legal/sanitário conforme norma' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-emerald-300">{label}</span>
                <span className="max-w-[68%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-[10px] font-bold leading-relaxed text-emerald-100">
              Pegadinha: comentário em corredor, foto e print também podem violar sigilo.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Decisão"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="Recusa, objeção de consciência e confiança"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<ShieldAlert size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Recusa do paciente exige orientação clara e registro.',
              'Objeção de consciência não pode abandonar paciente em risco.',
              'Confiança nasce de respeito, escuta e limite profissional.',
              'Conduta ética protege paciente, equipe e profissional.',
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
        tipo="Mapa Legal"
        badgeColor="bg-violet-400/20 text-violet-300"
        titulo="Lei 7.498/86: SAE, competência e vedações"
        gradiente="bg-gradient-to-br from-slate-900 to-violet-950"
        icone={<Gavel size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-violet-300">Competência</p>
              <p className="text-[10px] text-white/60">executar cuidados dentro da formação e supervisão legal.</p>
            </div>
            <div className="rounded-xl border border-red-400/20 bg-red-500/15 p-3">
              <p className="mb-1.5 text-[11px] font-black uppercase text-red-300">Vedação</p>
              <p className="text-[10px] text-white/60">assumir ato privativo sem respaldo ou supervisão.</p>
            </div>
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Para o técnico: atenção à execução de cuidados prescritos e orientação/supervisão do enfermeiro.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Fluxo de Responsabilidade"
        badgeColor="bg-blue-400/20 text-blue-300"
        titulo="Lei 7.498/86: responsabilidade e exercício"
        gradiente="bg-gradient-to-br from-slate-900 to-blue-950"
        icone={<UserCheck size={14} />}
        conteudo={
          <div className="space-y-1.5">
            {[
              'Conhecer atribuições do cargo e da equipe.',
              'Executar técnica conforme protocolo e prescrição.',
              'Comunicar intercorrência ao enfermeiro/responsável.',
              'Registrar cuidado de forma clara e cronológica.',
              'Responder por omissão, imprudência, negligência ou imperícia.',
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
        tipo="Fiscalização"
        badgeColor="bg-rose-400/20 text-rose-300"
        titulo="Ato infracional e fiscalização: COREN"
        gradiente="bg-gradient-to-br from-slate-900 to-rose-950"
        icone={<BadgeCheck size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { item: 'COREN', foco: 'fiscaliza exercício profissional' },
              { item: 'Inscrição', foco: 'regularidade habilita atuação' },
              { item: 'Infração', foco: 'conduta contrária à norma ética/legal' },
              { item: 'Processo', foco: 'apura responsabilidade com direito de defesa' },
            ].map(({ item, foco }) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-rose-300">{item}</p>
                <p className="text-[10px] text-white/55">{foco}</p>
              </div>
            ))}
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Checklist Legal"
        badgeColor="bg-lime-400/20 text-lime-300"
        titulo="Documentação de enfermagem: requisitos e valor legal"
        gradiente="bg-gradient-to-br from-slate-900 to-emerald-950"
        icone={<ClipboardList size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              'data/hora',
              'identificação',
              'clareza',
              'objetividade',
              'sem rasura',
              'assinatura/COREN',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-lime-400/20 bg-lime-500/10 p-2.5">
                <p className="text-[11px] font-black uppercase tracking-wide text-lime-300">{item}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-bold leading-relaxed text-white/65">
              Registro bom é técnico: descreve fato observado e cuidado realizado, sem julgamento pessoal.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Perigo"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="Sigilo, imagem, redes e privacidade"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<FileText size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Não publicar foto, vídeo, prontuário ou caso identificável.',
              'Evitar comentário sobre paciente em ambiente público ou rede social.',
              'Proteger tela, ficha, pulseira e informações sensíveis.',
              'Compartilhar dados apenas com quem participa do cuidado e tem necessidade legal.',
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
    </div>
  );
}
