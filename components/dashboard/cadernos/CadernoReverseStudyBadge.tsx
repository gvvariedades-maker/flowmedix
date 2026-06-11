import { Zap } from 'lucide-react';

export function CadernoReverseStudyBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.10)] px-3 py-1 text-xs text-[#3d6b0f]">
      <Zap size={12} aria-hidden />
      Estudo reverso em todas as questões
    </div>
  );
}
