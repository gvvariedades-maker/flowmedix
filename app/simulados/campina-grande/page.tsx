import Link from 'next/link';
import { loadPublicSimuladoManifest } from '@/lib/public-simulado/loadSimulado';

export default function CampinaGrandeSimuladosHubPage() {
  const cg01 = loadPublicSimuladoManifest('cg-01');

  return (
    <div className="min-h-[100dvh] bg-[#010409] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-lg">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
          Simulados públicos
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Campina Grande 2026</h1>
        <p className="mt-2 text-sm text-slate-400">
          Questões reais IDECAN · estudo reverso em todas as questões · gratuito
        </p>

        <ul className="mt-8 space-y-3">
          <li>
            <Link
              href="/simulados/campina-grande/cg-01"
              className="block rounded-2xl border border-white/10 bg-slate-900/80 p-5 transition-colors hover:border-cyan-400/30"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-400">{cg01.banca}</p>
              <p className="mt-1 text-lg font-black text-white">{cg01.titulo}</p>
              <p className="mt-1 text-sm text-slate-400">{cg01.descricao}</p>
              <p className="mt-3 text-xs font-semibold text-[#F26522]">
                {cg01.quantidade} questões · Prova {cg01.dataProvaFormatada}
              </p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
