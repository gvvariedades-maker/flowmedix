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

  it('marca pending no click capture com flushSync, sem pointerdown', () => {
    expect(shell).toContain("document.addEventListener('click', onClickCapture, true)");
    expect(shell).toContain('flushSync');
    expect(shell).toContain('shouldMarkDesempenhoNavPending');
    expect(shell).not.toContain('pointerdown');
    expect(shell).not.toContain('onPointerDown');
    expect(bottomNav).not.toContain('pointerdown');
    expect(bottomNav).not.toContain('onPointerDown');
  });

  it('limpa hub pronto, timeout e abandono (popstate/pagehide)', () => {
    expect(shell).toContain("[data-desempenho-hub=\"estudo\"]");
    expect(shell).toContain('DESEMPENHO_NAV_PENDING_TIMEOUT_MS');
    expect(shell).toContain("addEventListener('popstate'");
    expect(shell).toContain("addEventListener('pagehide'");
    expect(shell).toContain('observer.disconnect()');
    expect(shell).toContain('window.clearTimeout(timeoutId)');
    expect(loadError).toContain('data-desempenho-hub={hub}');
  });
});
