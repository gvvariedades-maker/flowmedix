import { Zap } from 'lucide-react';

export function CadernoReverseStudyBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(34, 197, 94,0.35)] bg-[rgba(34, 197, 94,0.10)] px-3 py-1 text-xs text-[#166534]">
      <Zap size={12} aria-hidden />
      Estudo reverso em todas as questões
    </div>
  );
}
