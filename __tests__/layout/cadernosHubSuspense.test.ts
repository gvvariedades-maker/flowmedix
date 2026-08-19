import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('cadernos/page.tsx — shell + Suspense', () => {
  const page = readFileSync(
    join(process.cwd(), 'app', '(dashboard)', '(authenticated)', 'cadernos', 'page.tsx'),
    'utf8',
  );
  const load = readFileSync(join(process.cwd(), 'lib', 'cadernos', 'cadernosPageLoad.ts'), 'utf8');

  it('a página síncrona pinta o chrome sem esperar histórico', () => {
    expect(page).toMatch(/export default function CadernosPage/);
    expect(page).not.toMatch(/export default async function CadernosPage/);
    expect(page).toContain('CadernosHubShell');
    expect(page).toContain('<Suspense fallback={<CadernosListLoadingSkeleton />}>');
    expect(page).toContain('loadCadernosListCore');
    expect(page).toContain('loadCadernosListEnrichment');
    expect(page).toContain('progressPending');
    expect(page).toContain('packsReady={false}');
    expect(page).toContain('p0-then-p1');
    expect(page).toContain('vazio-then-empty');
    expect(page).toContain('p1-erro');
    expect(page).toContain('E2eDelayedCadernos');
  });

  it('P0 não busca histórico; P1 busca histórico em paralelo ao catálogo', () => {
    expect(load).toContain('export async function loadCadernosListCore');
    expect(load).toContain('export async function loadCadernosListEnrichment');
    const coreFn = load.slice(
      load.indexOf('export async function loadCadernosListCore'),
      load.indexOf('export async function loadCadernosListEnrichment'),
    );
    expect(coreFn).not.toContain('getHistoricoQuestoesCached');
    expect(coreFn).not.toContain('resolveAccessibleModulosWhenEmpty');
    expect(load).toContain('getHistoricoQuestoesCached(userId)');
  });
});
