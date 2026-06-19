import { MapPin } from 'lucide-react';
import { NeonBadge } from '@/components/ui/neon-badge';

export function DiagnosticoConclusaoHeader() {
  return (
    <section
      aria-labelledby="diagnostico-conclusao-title"
      className="card-elevated-lg space-y-3 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] to-white p-6"
    >
      <NeonBadge
        variant="brand"
        className="inline-flex items-center gap-1.5 border-violet-400/30 bg-violet-400/10 text-[11px] uppercase tracking-wide text-violet-700"
      >
        <MapPin className="h-3 w-3" aria-hidden />
        Diagnóstico inicial
      </NeonBadge>

      <h2
        id="diagnostico-conclusao-title"
        className="text-lg font-bold text-slate-900"
      >
        Baseline registrado
      </h2>

      <p className="text-sm text-slate-600">
        Seu mapa de partida para o plano de estudos. Esta avaliação é única — use o estudo
        reverso para reforçar cada questão.
      </p>
    </section>
  );
}
