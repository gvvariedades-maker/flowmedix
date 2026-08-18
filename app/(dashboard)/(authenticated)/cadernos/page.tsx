import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { CadernosHubShell } from '@/components/dashboard/cadernos/CadernosHubShell';
import { CadernosListLoadingSkeleton } from '@/components/dashboard/cadernos/CadernosListLoadingSkeleton';
import {
  loadCadernosListCore,
  loadCadernosListEnrichment,
  logCadernosLoadError,
  type CadernosListCore,
  type CadernosListEnriched,
} from '@/lib/cadernos/cadernosPageLoad';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import {
  E2E_CADERNOS_P0_NOTEBOOK,
  E2E_CADERNOS_P1_DELAY_MS,
  E2E_CADERNOS_P1_NOTEBOOK,
  getE2eCadernosP1Pack,
} from '@/lib/e2e/cadernosSeed';
import { getServerSession } from '@/lib/supabase/server-auth';
import CadernosListClient from './CadernosListClient';

export type { NotebookSummary } from '@/lib/cadernos/notebookSummary';

function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function CadernosHubError() {
  return (
    <div
      className="flex min-h-full items-center justify-center bg-background p-6"
      data-cadernos-hub="lista"
      role="alert"
      aria-label="Erro ao carregar cadernos"
    >
      <p className="text-sm text-slate-500">Erro ao carregar cadernos. Tente novamente.</p>
    </div>
  );
}

async function E2eDelayedCadernos({
  delayMs,
  children,
}: {
  delayMs: number;
  children: ReactNode;
}) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return children;
}

export default function CadernosPage({
  searchParams,
}: {
  searchParams?: Promise<{ captura?: string | string[] }>;
}) {
  return (
    <CadernosHubShell>
      <Suspense fallback={<CadernosListLoadingSkeleton />}>
        <CadernosListBody searchParams={searchParams} />
      </Suspense>
    </CadernosHubShell>
  );
}

async function CadernosListBody({
  searchParams,
}: {
  searchParams?: Promise<{ captura?: string | string[] }>;
}) {
  const captura = searchParams
    ? firstSearchParam((await searchParams).captura)
    : null;

  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    if (captura === 'erro') return <CadernosHubError />;
    if (captura === 'p0-pending') {
      return (
        <CadernosListClient
          cadernos={[E2E_CADERNOS_P0_NOTEBOOK]}
          editalBanca={null}
          packs={[]}
          packsReady={false}
          progressPending
        />
      );
    }
    if (captura === 'vazio-pending') {
      return <CadernosListClient cadernos={[]} editalBanca={null} packs={[]} packsReady={false} />;
    }
    if (captura === 'p1-erro') {
      return (
        <CadernosListClient
          cadernos={[E2E_CADERNOS_P0_NOTEBOOK]}
          editalBanca={null}
          packs={[]}
          packsReady
          progressPending
        />
      );
    }
    if (captura === 'p0-then-p1') {
      return (
        <Suspense
          fallback={
            <CadernosListClient
              cadernos={[E2E_CADERNOS_P0_NOTEBOOK]}
              editalBanca={null}
              packs={[]}
              packsReady={false}
              progressPending
            />
          }
        >
          <E2eDelayedCadernos delayMs={E2E_CADERNOS_P1_DELAY_MS}>
            <CadernosListClient
              cadernos={[E2E_CADERNOS_P1_NOTEBOOK]}
              editalBanca={null}
              packs={[getE2eCadernosP1Pack()]}
              packsReady
            />
          </E2eDelayedCadernos>
        </Suspense>
      );
    }
    if (captura === 'vazio-then-empty') {
      return (
        <Suspense
          fallback={
            <CadernosListClient cadernos={[]} editalBanca={null} packs={[]} packsReady={false} />
          }
        >
          <E2eDelayedCadernos delayMs={E2E_CADERNOS_P1_DELAY_MS}>
            <CadernosListClient cadernos={[]} editalBanca={null} packs={[]} packsReady />
          </E2eDelayedCadernos>
        </Suspense>
      );
    }
    return <CadernosListClient cadernos={[]} editalBanca={null} packs={[]} packsReady />;
  }

  const session = await getServerSession();
  if (!session?.user) redirect('/login');

  let core: CadernosListCore | null = null;
  try {
    core = await loadCadernosListCore(session.user.id);
  } catch (error) {
    logCadernosLoadError(error, session.user.id);
  }

  if (!core) return <CadernosHubError />;

  const isAdmin = isAdminSessionEmail(session.user.email ?? null);

  return (
    <Suspense
      fallback={
        <CadernosListClient
          cadernos={core.summaries}
          editalBanca={core.editalBanca}
          packs={[]}
          packsReady={false}
          progressPending
        />
      }
    >
      <CadernosEnrichedList core={core} userId={session.user.id} isAdmin={isAdmin} />
    </Suspense>
  );
}

async function CadernosEnrichedList({
  core,
  userId,
  isAdmin,
}: {
  core: CadernosListCore;
  userId: string;
  isAdmin: boolean;
}) {
  let enriched: CadernosListEnriched | null = null;
  try {
    enriched = await loadCadernosListEnrichment(userId, core, isAdmin);
  } catch (error) {
    logCadernosLoadError(error, userId);
  }

  if (!enriched) {
    return (
      <CadernosListClient
        cadernos={core.summaries}
        editalBanca={core.editalBanca}
        packs={[]}
        packsReady
        progressPending
      />
    );
  }

  return (
    <CadernosListClient
      cadernos={enriched.summaries}
      editalBanca={enriched.editalBanca}
      packs={enriched.packs}
      packsReady
    />
  );
}
