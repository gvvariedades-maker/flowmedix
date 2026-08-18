import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardShell — gatilho pending do hub Estudo', () => {
  const shell = readFileSync(
    join(process.cwd(), 'app', '(dashboard)', 'DashboardShell.tsx'),
    'utf8',
  );
  const bottomNav = readFileSync(
    join(process.cwd(), 'components', 'layout', 'BottomNav.tsx'),
    'utf8',
  );
  const loadError = readFileSync(
    join(process.cwd(), 'components', 'dashboard', 'desempenho', 'DesempenhoLoadError.tsx'),
    'utf8',
  );

  const registry = readFileSync(
    join(process.cwd(), 'lib', 'layout', 'hubNavPending.ts'),
    'utf8',
  );

  it('marca pending no click capture com flushSync, sem pointerdown', () => {
    expect(shell).toContain("document.addEventListener('click', onClickCapture, true)");
    expect(shell).toContain('flushSync');
    expect(shell).toContain('resolveHubNavPendingFromClick');
    expect(shell).not.toContain('shouldMarkDesempenhoNavPending');
    expect(shell).not.toContain('shouldMarkCadernosNavPending');
    expect(shell).not.toContain('shouldMarkSimuladosNavPending');
    expect(shell).not.toContain('pointerdown');
    expect(shell).not.toContain('onPointerDown');
    expect(bottomNav).not.toContain('pointerdown');
    expect(bottomNav).not.toContain('onPointerDown');
  });

  it('transiciona para slow-loading no limiar; só ready/error/abandono limpam', () => {
    expect(registry).toContain("[data-desempenho-hub=\"estudo\"]");
    expect(registry).toContain("[data-cadernos-hub=\"lista\"]");
    expect(registry).toContain("[data-simulados-hub=\"lista\"]");
    expect(shell).toContain('HUB_NAV_REGISTRY[hubNavPending].readySelector');
    expect(shell).toContain('HUB_NAV_SLOW_LOADING_MS');
    expect(shell).toContain("setHubNavPendingPhase('slow-loading')");
    expect(shell).toContain("applyHubNavPendingDom(pendingHub, 'slow-loading')");
    expect(shell).not.toContain('HUB_PENDING_TIMEOUT_MS');
    expect(shell).toContain("addEventListener('popstate'");
    expect(shell).toContain("addEventListener('pagehide'");
    expect(shell).toContain('observer.disconnect()');
    expect(shell).toContain('SimuladosPendingView');
    expect(bottomNav).toContain('isHubNavPrefetchDisabled');
    expect(loadError).toContain('data-desempenho-hub={hub}');
  });
});
