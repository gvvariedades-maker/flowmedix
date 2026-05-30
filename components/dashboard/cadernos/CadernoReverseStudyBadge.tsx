import { Zap } from 'lucide-react';

export default function CadernoReverseStudyBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-500/20 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 backdrop-blur-xl">
      <Zap size={12} className="text-[#00f2ff]" aria-hidden />
      Todas as questões com Estudo Reverso
    </div>
  );
}
