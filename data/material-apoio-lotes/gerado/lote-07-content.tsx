'use client';

import {
  Baby,
  Biohazard,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { NeuroSlidePreview } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Processando LOTE 7
 *
 * Títulos na ordem:
 * 49. IRAS: precaução padrão, gotículas, contato e aerossóis (HIC)
 * 50. Higienização, esterilização e desinfecção: diferenças e quando usar
 * 51. EPI, descarte, resíduos e risco biológico (LBI, noções banca)
 * 52. Pré-natal, puericultura, teste do pezinho e saúde do adolescente (eixos de prova)
 */
export function MaterialSlidesLote7Content() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NeuroSlidePreview
        tipo="Mapa de Precauções"
        badgeColor="bg-red-400/20 text-red-300"
        titulo="IRAS: padrão, gotículas, contato e aerossóis"
        gradiente="bg-gradient-to-br from-slate-900 to-red-950"
        icone={<Biohazard size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Padrão', sub: 'todos os pacientes' },
              { label: 'Contato', sub: 'luvas/avental conforme risco' },
              { label: 'Gotículas', sub: 'máscara e distância' },
              { label: 'Aerossóis', sub: 'respirador e ambiente adequado' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-red-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-red-400/20 bg-red-400/10 p-2 text-[10px] font-bold leading-relaxed text-red-100">
              HIC: higiene das mãos, isolamento indicado e cuidado com superfícies reduzem IRAS.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Arena Versus"
        badgeColor="bg-cyan-400/20 text-cyan-300"
        titulo="Limpeza, desinfecção e esterilização"
        gradiente="bg-gradient-to-br from-slate-900 to-cyan-950"
        icone={<FlaskConical size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              { label: 'Limpeza', valor: 'remove sujidade e matéria orgânica' },
              { label: 'Desinfecção', valor: 'reduz microrganismos em artigos/superfícies' },
              { label: 'Esterilização', valor: 'elimina todas as formas de vida microbiana' },
              { label: 'Ordem', valor: 'limpar antes de desinfectar ou esterilizar' },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0">
                <span className="text-[11px] font-black text-cyan-300">{label}</span>
                <span className="max-w-[68%] text-right text-[10px] font-bold leading-tight text-white/70">
                  {valor}
                </span>
              </div>
            ))}
            <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-[10px] font-bold leading-relaxed text-cyan-100">
              Pegadinha: esterilização não substitui limpeza prévia do material.
            </p>
          </div>
        }
      />

      <NeuroSlidePreview
        tipo="Zona de Segurança"
        badgeColor="bg-amber-400/20 text-amber-300"
        titulo="EPI, descarte, resíduos e risco biológico"
        gradiente="bg-gradient-to-br from-slate-900 to-amber-950"
        icone={<ShieldCheck size={14} />}
        conteudo={
          <div className="space-y-2">
            {[
              'Escolher EPI conforme risco: luva, máscara, óculos, avental.',
              'Descartar perfurocortante em coletor rígido, sem reencapar agulha.',
              'Segregar resíduos conforme grupo e rotina institucional.',
              'Acidente com material biológico: lavar local, comunicar e seguir fluxo.',
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
        tipo="Mapa Materno-Infantil"
        badgeColor="bg-fuchsia-400/20 text-fuchsia-300"
        titulo="Pré-natal, puericultura, pezinho e adolescente"
        gradiente="bg-gradient-to-br from-slate-900 to-fuchsia-950"
        icone={<Baby size={14} />}
        conteudo={
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pré-natal', sub: 'consultas, exames e vacinação' },
              { label: 'Puericultura', sub: 'crescimento, desenvolvimento e orientação' },
              { label: 'Pezinho', sub: 'triagem neonatal no período indicado' },
              { label: 'Adolescente', sub: 'vacinas, sexualidade, saúde mental e vínculo' },
            ].map(({ label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[11px] font-black text-fuchsia-300">{label}</p>
                <p className="text-[10px] text-white/55">{sub}</p>
              </div>
            ))}
            <p className="col-span-2 rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-2 text-[10px] font-bold leading-relaxed text-fuchsia-100">
              Em prova: atenção a prevenção, busca ativa, registro e continuidade do cuidado.
            </p>
          </div>
        }
      />
    </div>
  );
}
