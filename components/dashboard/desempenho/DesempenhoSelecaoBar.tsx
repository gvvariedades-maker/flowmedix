'use client';

import { useRouter } from 'next/navigation';
import { BookMarked, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DESEMPENHO_SELECAO_MAX_ASSUNTOS,
  persistDesempenhoSelecao,
} from '@/lib/cadernos/desempenhoSelecao';
import { MOBILE_STICKY_ABOVE_NAV_BOTTOM } from '@/lib/layout/mobileBottomNav';

type Props = {
  assuntos: readonly string[];
  onLimpar: () => void;
  limiteAtingido?: boolean;
};

/**
 * Barra contextual da seleção de assuntos no hub `/desempenho`.
 *
 * Fica acima do BottomNav no mobile (sem cobrir "Estudar") e só aparece com
 * pelo menos um assunto marcado. Guarda a seleção em `sessionStorage` e leva ao
 * wizard de caderno em **modo estrito** — só questões dos assuntos escolhidos.
 */
export function DesempenhoSelecaoBar({ assuntos, onLimpar, limiteAtingido = false }: Props) {
  const router = useRouter();
  const total = assuntos.length;

  if (total === 0) return null;

  const criarCaderno = () => {
    persistDesempenhoSelecao(assuntos);
    router.push('/cadernos/novo?wizard=1&origem=desempenho');
  };

  return (
    <div
      role="region"
      aria-label="Assuntos selecionados"
      className={cn(
        'fixed inset-x-0 z-40 mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4',
        MOBILE_STICKY_ABOVE_NAV_BOTTOM,
        'md:bottom-6',
      )}
    >
      <div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
        <p className="min-w-0 flex-1 text-sm text-foreground">
          <span className="font-semibold tabular-nums">{total}</span>{' '}
          {total === 1 ? 'assunto selecionado' : 'assuntos selecionados'}
          <span className="block text-xs text-muted-foreground">
            {limiteAtingido
              ? `Máximo de ${DESEMPENHO_SELECAO_MAX_ASSUNTOS} assuntos por caderno.`
              : 'O caderno recebe só questões desses assuntos.'}
          </span>
        </p>
        <button
          type="button"
          onClick={onLimpar}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
          Limpar
        </button>
        <button
          type="button"
          onClick={criarCaderno}
          className="btn-editorial-primary inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
        >
          <BookMarked className="h-4 w-4" aria-hidden />
          Criar caderno
        </button>
      </div>
    </div>
  );
}
