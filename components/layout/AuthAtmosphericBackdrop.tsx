/** Blobs + grelha (login/register); conteúdo deve usar `relative z-10` sobre o fundo. */
export function AuthAtmosphericBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute bottom-[-12%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#BEF264]/10 blur-[130px]" />
      <div className="absolute top-1/2 left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
