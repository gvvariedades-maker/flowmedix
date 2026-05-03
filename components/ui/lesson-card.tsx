import { cn } from '@/lib/utils';
import { CheckCircle2, Network, Star, GitBranch, AlertTriangle } from 'lucide-react';

type CardStatus = 'novo' | 'em_progresso' | 'concluido';

interface LessonCardProps {
  titulo: string;
  topico: string;
  banca?: string;
  totalQuestoes: number;
  questoesFeitas: number;
  percentualAcerto?: number;
  status: CardStatus;
  slideType?: 'concept_map' | 'golden_rule' | 'logic_flow' | 'danger_zone';
  onClick?: () => void;
}

const slideIcons = {
  concept_map: Network,
  golden_rule: Star,
  logic_flow: GitBranch,
  danger_zone: AlertTriangle,
};

const statusConfig = {
  novo: {
    borderClass: 'border-white/10',
    badgeClass: 'bg-[rgba(0,242,255,0.08)] border-[rgba(0,242,255,0.25)] text-[#67e8f9]',
    label: 'NOVO',
  },
  em_progresso: {
    borderClass: 'border-[rgba(255,184,0,0.30)]',
    badgeClass: 'bg-[rgba(255,184,0,0.10)] border-[rgba(255,184,0,0.35)] text-[#fbbf24]',
    label: 'EM PROGRESSO',
  },
  concluido: {
    borderClass: 'border-[rgba(0,255,136,0.25)]',
    badgeClass: 'bg-[rgba(0,255,136,0.10)] border-[rgba(0,255,136,0.30)] text-[#6ee7b7]',
    label: 'CONCLUÍDO',
  },
};

export function LessonCard({
  titulo,
  topico,
  banca,
  totalQuestoes,
  questoesFeitas,
  percentualAcerto,
  status,
  slideType,
  onClick,
}: LessonCardProps) {
  const cfg = statusConfig[status];
  const IconDecor = slideType ? slideIcons[slideType] : Network;
  const progress = totalQuestoes > 0 ? (questoesFeitas / totalQuestoes) * 100 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 cursor-pointer select-none',
        'bg-[#0d1117] border transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.40)]',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        cfg.borderClass
      )}
    >
      {/* ícone decorativo watermark */}
      <IconDecor
        size={64}
        aria-hidden
        className="absolute bottom-3 right-3 text-white opacity-[0.06] pointer-events-none"
      />

      {/* badge de status */}
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] font-semibold',
          'uppercase tracking-wider border mb-3',
          cfg.badgeClass
        )}
      >
        {status === 'concluido' && <CheckCircle2 size={10} className="mr-1" />}
        {cfg.label}
      </span>

      {/* título */}
      <h3 className="text-[#e6edf3] text-[0.9375rem] font-semibold leading-snug mb-1 line-clamp-2">
        {titulo}
      </h3>

      {/* tópico + banca */}
      <p className="text-[#8b949e] text-xs mb-4 truncate">
        {topico}{banca && ` · ${banca}`}
      </p>

      {/* barra de progresso */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            status === 'concluido'
              ? 'bg-[#00ff88]'
              : status === 'em_progresso'
              ? 'bg-[#ffb800]'
              : 'bg-white/20'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* rodapé */}
      <div className="flex items-center justify-between text-xs text-[#8b949e]">
        <span>
          {questoesFeitas}/{totalQuestoes} questões
        </span>
        {percentualAcerto !== undefined && (
          <span
            className={cn(
              percentualAcerto >= 70
                ? 'text-[#6ee7b7]'
                : percentualAcerto >= 50
                ? 'text-[#fbbf24]'
                : 'text-[#fda4af]'
            )}
          >
            {percentualAcerto}% acertos
          </span>
        )}
      </div>
    </div>
  );
}
