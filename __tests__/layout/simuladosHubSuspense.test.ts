import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('simulados/page.tsx — shell + Suspense', () => {
  const page = readFileSync(
    join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'simulados', 'page.tsx'),
    'utf8',
  );
  const load = readFileSync(join(process.cwd(), 'lib', 'simulado', 'hubLoad.ts'), 'utf8');

  it('a página síncrona pinta o chrome sem esperar histórico', () => {
    expect(page).toMatch(/export default function SimuladosPage/);
    expect(page).not.toMatch(/export default async function SimuladosPage/);
    expect(page).toContain('SimuladosHubShell');
    expect(page).toContain('<Suspense fallback={<SimuladosListLoadingSkeleton />}>');
    expect(page).toContain('loadSimuladosHubCore');
    expect(page).toContain('loadSimuladosHubEnrichment');
    expect(page).toContain('historyPending');
    expect(page).toContain('historyReady={false}');
    expect(page).toContain('p0-then-p1');
    expect(page).toContain('vazio-then-empty');
    expect(page).toContain('p1-erro');
    expect(page).toContain('E2eDelayedSimulados');
  });

  it('P0 não busca histórico; P1 busca loadSimuladoHistory', () => {
    expect(load).toContain('export async function loadSimuladosHubCore');
    expect(load).toContain('export async function loadSimuladosHubEnrichment');
    const coreFn = load.slice(
      load.indexOf('export async function loadSimuladosHubCore'),
      load.indexOf('export async function loadSimuladosHubEnrichment'),
    );
    expect(coreFn).not.toContain('loadSimuladoHistory');
    expect(load).toContain('loadSimuladoHistory(supabase, userId');
  });
});
