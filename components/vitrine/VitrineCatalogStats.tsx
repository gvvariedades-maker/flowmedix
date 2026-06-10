type VitrineCatalogStatsProps = {
  totalQuestions: number;
  totalSlides: number;
};

function formatCatalogCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

export default function VitrineCatalogStats({
  totalQuestions,
  totalSlides,
}: VitrineCatalogStatsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:gap-4"
      aria-label="Totais do catálogo na plataforma"
    >
      {/* Card — Questões */}
      <div
        className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/80 p-3 backdrop-blur-xl transition-all duration-500 sm:rounded-2xl sm:p-5 hover:border-cyan-500/40"
        style={{ boxShadow: '0 0 40px -12px rgba(0,242,255,0.2)' }}
      >
        <div
          className="pointer-events-none absolute -top-8 -right-8 hidden h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/20 sm:block"
        />

        <div className="relative z-10">
          <p
            className="font-mono text-2xl font-bold tabular-nums tracking-tight text-[#00f2ff] sm:text-4xl lg:text-5xl"
            style={{ textShadow: '0 0 20px rgba(0,242,255,0.35)' }}
          >
            {formatCatalogCount(totalQuestions)}
          </p>
          <p className="font-body mt-1 text-[11px] font-medium leading-snug text-slate-400 sm:mt-2 sm:text-sm">
            Questões com estudo reverso
          </p>
          <div className="mt-2 hidden h-px w-12 bg-gradient-to-r from-cyan-500/60 to-transparent sm:block" />
        </div>
      </div>

      {/* Card — NeuroSlides */}
      <div
        className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900/80 p-3 backdrop-blur-xl transition-all duration-500 sm:rounded-2xl sm:p-5 hover:border-emerald-500/40"
        style={{ boxShadow: '0 0 40px -12px rgba(0,255,136,0.2)' }}
      >
        <div
          className="pointer-events-none absolute -top-8 -right-8 hidden h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/20 sm:block"
        />

        <div className="relative z-10">
          <p
            className="font-mono text-2xl font-bold tabular-nums tracking-tight text-[#00ff88] sm:text-4xl lg:text-5xl"
            style={{ textShadow: '0 0 20px rgba(0,255,136,0.35)' }}
          >
            {formatCatalogCount(totalSlides)}
          </p>
          <p className="font-body mt-1 text-[11px] font-medium leading-snug text-slate-400 sm:mt-2 sm:text-sm">
            NeuroSlides disponíveis
          </p>
          <div className="mt-2 hidden h-px w-12 bg-gradient-to-r from-emerald-500/60 to-transparent sm:block" />
        </div>
      </div>
    </div>
  );
}
