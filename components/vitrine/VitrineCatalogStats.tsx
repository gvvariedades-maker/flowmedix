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
      <div className="card-elevated p-3 transition-colors hover:border-slate-300 sm:rounded-2xl sm:p-5">
        <p className="font-mono text-2xl font-bold tabular-nums tracking-tight text-[#3d6b0f] sm:text-4xl lg:text-5xl">
          {formatCatalogCount(totalQuestions)}
        </p>
        <p className="font-body mt-1 text-[11px] font-medium leading-snug text-slate-500 sm:mt-2 sm:text-sm">
          Questões com estudo reverso
        </p>
      </div>

      <div className="card-elevated p-3 transition-colors hover:border-slate-300 sm:rounded-2xl sm:p-5">
        <p className="font-mono text-2xl font-bold tabular-nums tracking-tight text-emerald-700 sm:text-4xl lg:text-5xl">
          {formatCatalogCount(totalSlides)}
        </p>
        <p className="font-body mt-1 text-[11px] font-medium leading-snug text-slate-500 sm:mt-2 sm:text-sm">
          NeuroSlides disponíveis
        </p>
      </div>
    </div>
  );
}
