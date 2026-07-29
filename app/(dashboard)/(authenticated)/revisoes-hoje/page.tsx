import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import {
  isFsrsMvpBetaEmail,
  isFsrsMvpEnabled,
} from '@/lib/env';
import { resolveSubtopicoInventoryFromReviewUnit } from '@/lib/fsrs/inventory';
import {
  asFsrsQueueClient,
  buildFsrsTodayQueue,
  FSRS_DAILY_REVIEW_LIMIT,
} from '@/lib/fsrs/queue';
import { getServerSession } from '@/lib/supabase/server-auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { DASHBOARD_PAGE_ROOT } from '@/lib/layout/mobileBottomNav';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function RevisoesHojePage() {
  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    return <RevisoesEmpty />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  if (!isFsrsMvpEnabled() || !isFsrsMvpBetaEmail(session.user.email)) {
    redirect('/plano-diario');
  }

  const supabase = await createServerSupabase();
  const queue = await buildFsrsTodayQueue({
    client: asFsrsQueueClient(supabase as never),
    userId: session.user.id,
    limit: FSRS_DAILY_REVIEW_LIMIT,
    resolveInventory: resolveSubtopicoInventoryFromReviewUnit,
  });

  if (queue.length === 0) {
    return <RevisoesEmpty />;
  }

  return (
    <DashboardMobilePage variant="default" className={cn(DASHBOARD_PAGE_ROOT, 'bg-background')}>
      <header className="border-b border-slate-200 bg-background shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-10">
          <p className="text-xs font-black uppercase tracking-widest text-[#166534]">
            Revisões de hoje
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#166534]" aria-hidden />
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Fila FSRS ({queue.length})
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Cards due com preferência por outro enunciado da mesma unidade.
          </p>
        </div>
      </header>
      <ul className="mx-auto max-w-3xl space-y-3 px-4 py-6 md:px-10">
        {queue.map((item, index) => (
          <li
            key={`${item.review_unit_id}-${item.modulo_slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #{index + 1}
                  {item.same_stem_fallback ? ' · mesmo enunciado (fallback)' : ''}
                </p>
                <p className="truncate font-semibold text-slate-900">{item.modulo_slug}</p>
              </div>
              <Button asChild className="btn-editorial-primary shrink-0">
                <Link href={`/estudar/${item.modulo_slug}?from=revisoes`}>Estudar</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </DashboardMobilePage>
  );
}

function RevisoesEmpty() {
  return (
    <DashboardMobilePage
      variant="default"
      className={cn('bg-background px-4 pt-6', DASHBOARD_PAGE_ROOT)}
    >
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Nenhuma revisão due</h1>
        <p className="text-sm text-slate-600">
          Quando houver cards FSRS vencidos, eles aparecem aqui. Continue na vitrine.
        </p>
        <Button asChild className="btn-editorial-primary w-full">
          <Link href="/estudar" className="inline-flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden />
            Ir para a Vitrine
          </Link>
        </Button>
      </div>
    </DashboardMobilePage>
  );
}
