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
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-[#00f2ff]">
          {formatCatalogCount(totalQuestions)}
        </p>
        <p className="mt-1 text-sm text-slate-400">Questões com estudo reverso</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-[#00f2ff]">
          {formatCatalogCount(totalSlides)}
        </p>
        <p className="mt-1 text-sm text-slate-400">NeuroSlides disponíveis</p>
      </div>
    </div>
  );
}
