import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';

export function DesempenhoLoadError({ hub }: { hub: 'estudo' | 'mapa' | 'historico' }) {
  return (
    <div className={cn('mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-8', DASHBOARD_PAGE_ROOT)} data-desempenho-hub={hub}>
      <section
        aria-label="Erro ao carregar desempenho"
        role="alert"
        className="metric-card flex flex-col gap-3 p-5"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <AlertTriangle className="h-4 w-4 text-[var(--color-danger-text)]" aria-hidden />
          Não conseguimos carregar seu desempenho
        </p>
        <p className="text-sm text-muted-foreground">
          Os números não foram lidos agora — isto não significa que você tenha zero acertos.
          Tente novamente em instantes.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/desempenho"
            className="btn-editorial-primary inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold"
          >
            Tentar novamente
          </Link>
          <Link
            href="/estudar"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground"
          >
            Ir para a vitrine
          </Link>
        </div>
      </section>
    </div>
  );
}
