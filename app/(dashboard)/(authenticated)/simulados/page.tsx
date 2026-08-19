import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { SimuladosHubShell } from '@/components/simulados/SimuladosHubShell';
import { SimuladosListClient } from '@/components/simulados/SimuladosListClient';
import { SimuladosListLoadingSkeleton } from '@/components/simulados/SimuladosListLoadingSkeleton';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import {
  E2E_SIMULADOS_OPEN_SESSION,
  E2E_SIMULADOS_P1_DELAY_MS,
  E2E_SIMULADOS_RECENT_SESSION,
} from '@/lib/e2e/simuladosHubSeed';
import {
  loadSimuladosHubCore,
  loadSimuladosHubEnrichment,
  logSimuladosLoadError,
  type SimuladosHubCore,
  type SimuladosHubEnriched,
} from '@/lib/simulado/hubLoad';
import { getServerSession } from '@/lib/supabase/server-auth';

function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function SimuladosHubError() {
  return (
    <div
      className="flex min-h-full items-center justify-center bg-background p-6"
      data-simulados-hub="lista"
      role="alert"
      aria-label="Erro ao carregar simulados"
    >
      <p className="text-sm text-slate-600">Erro ao carregar simulados. Tente novamente.</p>
    </div>
  );
}

async function E2eDelayedSimulados({
  delayMs,
  children,
}: {
  delayMs: number;
  children: ReactNode;
}) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return children;
}

export default function SimuladosPage({
  searchParams,
}: {
  searchParams?: Promise<{ captura?: string | string[] }>;
}) {
  return (
    <SimuladosHubShell>
      <Suspense fallback={<SimuladosListLoadingSkeleton />}>
        <SimuladosListBody searchParams={searchParams} />
      </Suspense>
    </SimuladosHubShell>
  );
}

async function SimuladosListBody({
  searchParams,
}: {
  searchParams?: Promise<{ captura?: string | string[] }>;
}) {
  const captura = searchParams
    ? firstSearchParam((await searchParams).captura)
    : null;

  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    if (captura === 'erro') return <SimuladosHubError />;
    if (captura === 'p0-pending') {
      return (
        <SimuladosListClient
          openSession={E2E_SIMULADOS_OPEN_SESSION}
          recentSessions={[]}
          historyReady={false}
          historyPending
        />
      );
    }
    if (captura === 'vazio-pending') {
      return (
        <SimuladosListClient
          openSession={null}
          recentSessions={[]}
          historyReady={false}
        />
      );
    }
    if (captura === 'p1-erro') {
      return (
        <SimuladosListClient
          openSession={E2E_SIMULADOS_OPEN_SESSION}
          recentSessions={[]}
          historyReady
          historyPending
        />
      );
    }
    if (captura === 'p0-then-p1') {
      return (
        <Suspense
          fallback={
            <SimuladosListClient
              openSession={E2E_SIMULADOS_OPEN_SESSION}
              recentSessions={[]}
              historyReady={false}
              historyPending
            />
          }
        >
          <E2eDelayedSimulados delayMs={E2E_SIMULADOS_P1_DELAY_MS}>
            <SimuladosListClient
              openSession={E2E_SIMULADOS_OPEN_SESSION}
              recentSessions={[E2E_SIMULADOS_RECENT_SESSION]}
              historyReady
            />
          </E2eDelayedSimulados>
        </Suspense>
      );
    }
    if (captura === 'vazio-then-empty') {
      return (
        <Suspense
          fallback={
            <SimuladosListClient openSession={null} recentSessions={[]} historyReady={false} />
          }
        >
          <E2eDelayedSimulados delayMs={E2E_SIMULADOS_P1_DELAY_MS}>
            <SimuladosListClient openSession={null} recentSessions={[]} historyReady />
          </E2eDelayedSimulados>
        </Suspense>
      );
    }
    return <SimuladosListClient openSession={null} recentSessions={[]} historyReady />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  let core: SimuladosHubCore | null = null;
  try {
    core = await loadSimuladosHubCore(session.user.id);
  } catch (error) {
    logSimuladosLoadError(error, session.user.id);
  }

  if (!core) return <SimuladosHubError />;

  return (
    <Suspense
      fallback={
        <SimuladosListClient
          openSession={core.openSession}
          recentSessions={[]}
          historyReady={false}
          historyPending
        />
      }
    >
      <SimuladosEnrichedList core={core} userId={session.user.id} />
    </Suspense>
  );
}

async function SimuladosEnrichedList({
  core,
  userId,
}: {
  core: SimuladosHubCore;
  userId: string;
}) {
  let enriched: SimuladosHubEnriched | null = null;
  try {
    enriched = await loadSimuladosHubEnrichment(userId, core);
  } catch (error) {
    logSimuladosLoadError(error, userId);
  }

  if (!enriched) {
    return (
      <SimuladosListClient
        openSession={core.openSession}
        recentSessions={[]}
        historyReady
        historyPending
      />
    );
  }

  return (
    <SimuladosListClient
      openSession={enriched.openSession}
      recentSessions={enriched.recentSessions}
      historyReady
    />
  );
}
