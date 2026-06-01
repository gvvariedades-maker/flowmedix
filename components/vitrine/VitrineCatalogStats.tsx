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
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      aria-label="Totais do catálogo na plataforma"
    >
      {/* Card — Questões */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-cyan-500/20
          bg-slate-900/80 p-5 backdrop-blur-xl transition-all duration-500
          hover:border-cyan-500/40"
        style={{ boxShadow: '0 0 40px -12px rgba(0,242,255,0.2)' }}
      >
        {/* Glow de fundo */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32
          rounded-full bg-cyan-500/10 blur-2xl
          transition-all duration-500 group-hover:bg-cyan-500/20"
        />

        <div className="relative z-10">
          <p
            className="font-display text-4xl font-extrabold tabular-nums
              tracking-tight text-[#00f2ff] sm:text-5xl"
            style={{ textShadow: '0 0 30px rgba(0,242,255,0.4)' }}
          >
            {formatCatalogCount(totalQuestions)}
          </p>
          <p className="font-body mt-2 text-sm font-medium text-slate-400">
            Questões com estudo reverso
          </p>
          {/* Linha accent */}
          <div
            className="mt-3 h-px w-12 bg-gradient-to-r
            from-cyan-500/60 to-transparent"
          />
        </div>
      </div>

      {/* Card — NeuroSlides */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-emerald-500/20
          bg-slate-900/80 p-5 backdrop-blur-xl transition-all duration-500
          hover:border-emerald-500/40"
        style={{ boxShadow: '0 0 40px -12px rgba(0,255,136,0.2)' }}
      >
        {/* Glow de fundo */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32
          rounded-full bg-emerald-500/10 blur-2xl
          transition-all duration-500 group-hover:bg-emerald-500/20"
        />

        <div className="relative z-10">
          <p
            className="font-display text-4xl font-extrabold tabular-nums
              tracking-tight text-[#00ff88] sm:text-5xl"
            style={{ textShadow: '0 0 30px rgba(0,255,136,0.4)' }}
          >
            {formatCatalogCount(totalSlides)}
          </p>
          <p className="font-body mt-2 text-sm font-medium text-slate-400">
            NeuroSlides disponíveis
          </p>
          {/* Linha accent */}
          <div
            className="mt-3 h-px w-12 bg-gradient-to-r
            from-emerald-500/60 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
