/**
 * Captura screenshots de referências externas (sem servidor local).
 * Saída: docs/auditoria-visual-v2/screenshots/{plataforma}/
 *
 * Público:
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts --project=chromium --workers=1
 *
 * Gabarita logado (credenciais em .env.local — não commitar):
 *   GABARITA_AUDIT_EMAIL=... GABARITA_AUDIT_PASSWORD=...
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts -g "Gabarita.*logad" --project=chromium --workers=1
 *
 * QConcursos vitrine logada (conta free):
 *   QCONCURSOS_AUDIT_EMAIL=... QCONCURSOS_AUDIT_PASSWORD=...
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts -g "QConcursos" --project=chromium --workers=1
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { loadE2eEnv } from './helpers/loadE2eEnv';
import {
  GABARITA_STORAGE_STATE,
  ensureGabaritaSession,
  gotoGabaritaAuthenticated,
  hasGabaritaAuditCredentials,
} from './helpers/gabaritaAuditAuth';
import {
  discoverInternalPaths,
  extractGabaritaPageInventory,
  inventoryToMarkdown,
  type GabaritaPageInventory,
} from './helpers/gabaritaAuditMap';
import { captureGabaritaPlayerScreenshots } from './helpers/gabaritaAuditPlayer';
import {
  QCONCURSOS_AUTH_URL,
  QCONCURSOS_BASE,
  QCONCURSOS_STORAGE_STATE,
  QCONCURSOS_VITRINE_ENFERMAGEM_URL,
  QCONCURSOS_VITRINE_URL,
  ensureQConcursosSession,
  gotoQConcursosAuthenticated,
  hasQConcursosAuditCredentials,
} from './helpers/qconcursosAuditAuth';
import {
  openFirstQConcursosQuestion,
  openQConcursosMobileFilters,
  waitForQConcursosVitrine,
} from './helpers/qconcursosAuditVitrine';
import {
  QCONCURSOS_LOGGED_SEED_PATHS,
  comparativoToMarkdown,
  discoverQConcursosPaths,
  extractQConcursosPageInventory,
  inventoryToMarkdown as qconcursosInventoryToMarkdown,
  playerInventoryToMarkdown,
  sanitizeInventory,
  sanitizeQConcursosAuditText,
  type QConcursosPageInventory,
} from './helpers/qconcursosAuditMap';
import { captureQConcursosPlayerFlow, openQConcursosUserMenu } from './helpers/qconcursosAuditPlayer';

loadE2eEnv();

const GABARITA_OUT = path.join(
  process.cwd(),
  'docs/auditoria-visual-v2/screenshots/gabarita-enfermagem',
);
const GABARITA_AUTH = 'https://gabaritaenfermagem.com.br/auth';
const ENFRENTE_OUT = path.join(
  process.cwd(),
  'docs/auditoria-visual-v2/screenshots/enfrente-enfermagem',
);
const ENFRENTE_URL = 'https://enfrenteenfermagem.com.br/';
const QCONCURSOS_OUT = path.join(
  process.cwd(),
  'docs/auditoria-visual-v2/screenshots/qconcursos',
);

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

test.describe('Auditoria visual — Gabarita Enfermagem (público)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test('T2 login desktop + mobile', async ({ page }) => {
    ensureDir(GABARITA_OUT);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(GABARITA_AUTH, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: path.join(GABARITA_OUT, 'T2-login-desktop.png') });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(GABARITA_AUTH, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: path.join(GABARITA_OUT, 'T2-login-mobile.png') });
  });
});

/** Rotas protegidas — sem login redirecionam para formulário "Entrar". */
const GABARITA_LOGGED_ROUTES = [
  { file: 'T3-practice', path: '/practice' },
  { file: 'T7-dashboard', path: '/dashboard' },
  { file: 'T6-error-log', path: '/error-log' },
  { file: 'T10-mock-exam', path: '/mock-exam' },
  { file: 'T8-profile', path: '/profile' },
  { file: 'T-performance', path: '/performance' },
  { file: 'T-study-plan', path: '/study-plan' },
] as const;

test.describe('Auditoria visual — Gabarita Enfermagem (logado)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(240_000);

  test.beforeAll(() => {
    test.skip(!hasGabaritaAuditCredentials(), 'GABARITA_AUDIT_EMAIL/PASSWORD não definidos');
  });

  test.use({
    storageState: fs.existsSync(GABARITA_STORAGE_STATE)
      ? GABARITA_STORAGE_STATE
      : undefined,
  });

  test('área logada desktop + mobile', async ({ page }) => {
    ensureDir(GABARITA_OUT);
    await ensureGabaritaSession(page);

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );

      for (const route of GABARITA_LOGGED_ROUTES) {
        const ok = await gotoGabaritaAuthenticated(page, route.path);
        if (!ok) {
          // Rota inexistente ou sem permissão — não falha a suíte inteira.
          continue;
        }
        await page.screenshot({
          path: path.join(GABARITA_OUT, `${route.file}-${viewport}.png`),
          fullPage: viewport === 'desktop',
        });
      }
    }
  });

  test('T4 disciplina + T5 player', async ({ page }) => {
    ensureDir(GABARITA_OUT);
    await ensureGabaritaSession(page);

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );

      const result = await captureGabaritaPlayerScreenshots(page, GABARITA_OUT, viewport);
      expect(
        result.player,
        `Player não encontrado após fluxo /practice (última URL: ${result.path})`,
      ).toBe(true);
    }
  });

  test('mapear funções, filtros e rotas', async ({ page }) => {
    const auditDir = path.join(process.cwd(), 'docs/auditoria-visual-v2/plataformas');
    ensureDir(GABARITA_OUT);
    await ensureGabaritaSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const seedPaths = GABARITA_LOGGED_ROUTES.map((r) => r.path);
    const inventories: GabaritaPageInventory[] = [];

    for (const routePath of seedPaths) {
      const ok = await gotoGabaritaAuthenticated(page, routePath);
      if (!ok) continue;
      inventories.push(await extractGabaritaPageInventory(page, routePath));
    }

    const discovered = discoverInternalPaths(inventories).filter((p) => !seedPaths.includes(p));
    for (const routePath of discovered.slice(0, 15)) {
      const ok = await gotoGabaritaAuthenticated(page, routePath);
      if (!ok) continue;
      if (inventories.some((i) => i.path === routePath)) continue;
      inventories.push(await extractGabaritaPageInventory(page, routePath));
    }

    expect(inventories.length).toBeGreaterThan(0);

    const capturedAt = new Date().toISOString().slice(0, 10);
    const jsonPath = path.join(auditDir, 'B0-gabarita-map.json');
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({ capturedAt, inventories, discovered }, null, 2),
      'utf8',
    );

    const mdPath = path.join(auditDir, 'B0-gabarita-funcional.md');
    fs.writeFileSync(mdPath, inventoryToMarkdown(inventories, capturedAt), 'utf8');

    // Screenshots extras das rotas descobertas (desktop)
    for (const inv of inventories) {
      const slug = inv.path.replace(/^\//, '').replace(/\//g, '-') || 'home';
      const file = path.join(GABARITA_OUT, `map-${slug}-desktop.png`);
      if (fs.existsSync(file)) continue;
      const ok = await gotoGabaritaAuthenticated(page, inv.path);
      if (!ok) continue;
      await page.screenshot({ path: file, fullPage: true });
    }
  });
});

const ESTUDEI_OUT = path.join(
  process.cwd(),
  'docs/auditoria-visual-v2/screenshots/estudei',
);
const ESTUDEI_ASSINE_URL = 'https://estudei.com.br/#assineja';

test.describe('Auditoria visual — Estudei (público)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test('T1 pricing #assineja desktop + mobile', async ({ page }) => {
    ensureDir(ESTUDEI_OUT);

    const scrollToPricing = async () => {
      await page.goto('https://estudei.com.br/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const anchor = page.locator('#assineja');
      if (await anchor.count()) {
        await anchor.scrollIntoViewIfNeeded();
      } else {
        await page.goto(ESTUDEI_ASSINE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      }
      await page.waitForTimeout(800);
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await scrollToPricing();
    await expect(page.getByText(/12x de|12× de|R\$ 197/i).first()).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: path.join(ESTUDEI_OUT, 'T1-assineja-desktop.png') });

    await page.setViewportSize({ width: 375, height: 812 });
    await scrollToPricing();
    await expect(page.getByText(/12x de|12× de|R\$ 197/i).first()).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: path.join(ESTUDEI_OUT, 'T1-assineja-mobile.png') });
  });

  test('T1 app preview "por dentro" desktop + mobile', async ({ page }) => {
    ensureDir(ESTUDEI_OUT);

    const dismissCookieBanner = async () => {
      const reject = page.getByRole('button', { name: /reject|recusar|negar/i });
      if (await reject.isVisible().catch(() => false)) {
        await reject.click({ force: true });
        await page.waitForTimeout(400);
      }
    };

    const scrollToAppPreview = async () => {
      await page.goto('https://estudei.com.br/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await dismissCookieBanner();
      const heading = page.getByText(/Agora veja o Estudei por dentro/i).first();
      await heading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1_200);
    };

    const capturePreview = async (suffix: string) => {
      await scrollToAppPreview();
      await expect(page.getByText(/Agora veja o Estudei por dentro/i).first()).toBeVisible({
        timeout: 30_000,
      });
      await dismissCookieBanner();
      await page.screenshot({ path: path.join(ESTUDEI_OUT, `T1-app-preview-${suffix}.png`) });
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await capturePreview('desktop');

    // Carrossel de mockups (se existir)
    const nextSlide = page
      .locator('[class*="swiper"] button, [aria-label*="next" i], button')
      .filter({ has: page.locator('svg') })
      .last();
    for (let i = 1; i <= 3; i++) {
      if (await nextSlide.isVisible().catch(() => false)) {
        await nextSlide.click({ force: true }).catch(() => {});
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(ESTUDEI_OUT, `T1-app-preview-desktop-slide-${i}.png`),
        });
      }
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await capturePreview('mobile');
  });
});

test.describe('Auditoria visual — QConcursos (público)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test('T2 login desktop + mobile', async ({ page }) => {
    ensureDir(QCONCURSOS_OUT);

    const captureLogin = async (suffix: string) => {
      await page.goto(QCONCURSOS_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(
        page.getByRole('heading', { name: /Participe da maior comunidade/i }),
      ).toBeVisible({ timeout: 30_000 });
      await page.screenshot({ path: path.join(QCONCURSOS_OUT, `T2-login-${suffix}.png`) });
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await captureLogin('desktop');

    await page.setViewportSize({ width: 375, height: 812 });
    await captureLogin('mobile');
  });

  test('T3 vitrine visitante desktop + mobile', async ({ page }) => {
    ensureDir(QCONCURSOS_OUT);

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );
      await page.goto(QCONCURSOS_VITRINE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      if (viewport === 'mobile') await openQConcursosMobileFilters(page);
      await waitForQConcursosVitrine(page);
      await page.screenshot({
        path: path.join(QCONCURSOS_OUT, `T3-vitrine-visitante-${viewport}.png`),
        fullPage: viewport === 'desktop',
      });
    }
  });
});

test.describe('Auditoria visual — QConcursos (logado)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(420_000);

  test.beforeAll(() => {
    test.skip(
      !hasQConcursosAuditCredentials(),
      'QCONCURSOS_AUDIT_EMAIL/PASSWORD não definidos',
    );
  });

  test.use({
    storageState: fs.existsSync(QCONCURSOS_STORAGE_STATE)
      ? QCONCURSOS_STORAGE_STATE
      : undefined,
  });

  test('T3 vitrine logada + enfermagem', async ({ page }) => {
    ensureDir(QCONCURSOS_OUT);
    await ensureQConcursosSession(page);

    const vitrineRoutes = [
      { file: 'T3-vitrine', url: QCONCURSOS_VITRINE_URL },
      { file: 'T3-vitrine-enfermagem', url: QCONCURSOS_VITRINE_ENFERMAGEM_URL },
    ] as const;

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );

      for (const route of vitrineRoutes) {
        const ok = await gotoQConcursosAuthenticated(page, route.url);
        expect(ok, `Redirecionou para login em ${route.url}`).toBe(true);
        if (viewport === 'mobile') await openQConcursosMobileFilters(page);
        await waitForQConcursosVitrine(page);
        await page.screenshot({
          path: path.join(QCONCURSOS_OUT, `${route.file}-${viewport}.png`),
          fullPage: viewport === 'desktop',
        });
      }
    }
  });

  test('T4 card questão (primeira da lista)', async ({ page }) => {
    ensureDir(QCONCURSOS_OUT);
    await ensureQConcursosSession(page);

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );

      const ok = await gotoQConcursosAuthenticated(page, QCONCURSOS_VITRINE_ENFERMAGEM_URL);
      expect(ok).toBe(true);

      const opened = await openFirstQConcursosQuestion(page);
      expect(opened, 'Nenhum link de questão encontrado na vitrine enfermagem').toBe(true);

      await page.screenshot({
        path: path.join(QCONCURSOS_OUT, `T4-question-card-${viewport}.png`),
        fullPage: viewport === 'desktop',
      });
    }
  });

  test('T5 player + T6 feedback', async ({ page }) => {
    ensureDir(QCONCURSOS_OUT);
    await ensureQConcursosSession(page);

    for (const viewport of ['desktop', 'mobile'] as const) {
      await page.setViewportSize(
        viewport === 'desktop' ? { width: 1440, height: 900 } : { width: 375, height: 812 },
      );

      const result = await captureQConcursosPlayerFlow(page, QCONCURSOS_OUT, viewport);
      expect(result.player, `Player não aberto (URL: ${result.url})`).toBe(true);
    }
  });

  test('mapear funções, filtros, rotas e player', async ({ page }) => {
    test.setTimeout(360_000);
    const auditDir = path.join(process.cwd(), 'docs/auditoria-visual-v2/plataformas');
    ensureDir(QCONCURSOS_OUT);
    await ensureQConcursosSession(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const inventories: QConcursosPageInventory[] = [];
    const seedPaths = [...QCONCURSOS_LOGGED_SEED_PATHS];

    // Home logada + menu usuário (descobre rotas extras)
    await gotoQConcursosAuthenticated(page, `${QCONCURSOS_BASE}/usuario/novo-inicio`);
    await openQConcursosUserMenu(page);
    inventories.push(
      await extractQConcursosPageInventory(page, '/usuario/novo-inicio'),
    );

    for (const routePath of seedPaths) {
      if (routePath === '/usuario/novo-inicio') continue;
      const url = routePath.startsWith('http')
        ? routePath
        : `${QCONCURSOS_BASE}${routePath}`;
      const ok = await gotoQConcursosAuthenticated(page, url);
      if (!ok) continue;
      if (inventories.some((i) => i.path === routePath)) continue;
      inventories.push(await extractQConcursosPageInventory(page, routePath));
    }

    const discovered = discoverQConcursosPaths(inventories).filter(
      (p) => !seedPaths.includes(p as (typeof seedPaths)[number]),
    );

    for (const routePath of discovered.slice(0, 20)) {
      const ok = await gotoQConcursosAuthenticated(page, `${QCONCURSOS_BASE}${routePath}`);
      if (!ok) continue;
      if (inventories.some((i) => i.path === routePath)) continue;
      inventories.push(await extractQConcursosPageInventory(page, routePath));
    }

    expect(inventories.length).toBeGreaterThan(0);

    const capturedAt = new Date().toISOString().slice(0, 10);

    // Player detalhado (desktop) — vitrine inline; falha não descarta inventário
    let playerCapture = await captureQConcursosPlayerFlow(page, QCONCURSOS_OUT, 'desktop');
    if (!playerCapture.player) {
      await gotoQConcursosAuthenticated(page, QCONCURSOS_VITRINE_ENFERMAGEM_URL);
      await waitForQConcursosVitrine(page);
      playerCapture = await captureQConcursosPlayerFlow(page, QCONCURSOS_OUT, 'desktop');
    }

    const safeInventories = inventories.map(sanitizeInventory);
    const mapPayload = {
      capturedAt,
      inventories: safeInventories,
      discovered: discovered.map((p) => sanitizeQConcursosAuditText(p)),
      player: {
        url: playerCapture.url,
        before: playerCapture.before,
        after: playerCapture.after,
        answered: playerCapture.answered,
      },
    };

    fs.writeFileSync(
      path.join(auditDir, 'A1-qconcursos-map.json'),
      sanitizeQConcursosAuditText(JSON.stringify(mapPayload, null, 2)),
      'utf8',
    );

    const funcionalMd = [
      qconcursosInventoryToMarkdown(safeInventories, capturedAt),
      '',
      '---',
      '',
      playerInventoryToMarkdown(playerCapture.before, capturedAt),
    ];
    if (playerCapture.after) {
      funcionalMd.push('', '### Após responder', '', playerInventoryToMarkdown(playerCapture.after, capturedAt));
    }
    fs.writeFileSync(
      path.join(auditDir, 'A1-qconcursos-funcional.md'),
      funcionalMd.join('\n'),
      'utf8',
    );

    fs.writeFileSync(
      path.join(auditDir, 'A1-qconcursos-comparativo-funcional.md'),
      comparativoToMarkdown(capturedAt),
      'utf8',
    );

    for (const inv of inventories) {
      const slug = inv.path.replace(/^\//, '').replace(/\//g, '-') || 'home';
      const file = path.join(QCONCURSOS_OUT, `map-${slug}-desktop.png`);
      if (fs.existsSync(file)) continue;
      const ok = await gotoQConcursosAuthenticated(page, `${QCONCURSOS_BASE}${inv.path}`);
      if (!ok) continue;
      await page.screenshot({ path: file, fullPage: true });
    }
  });
});

test.describe('Auditoria visual — ENFrente Enfermagem (público)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test('T1 landing desktop + mobile', async ({ page }) => {
    ensureDir(ENFRENTE_OUT);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ENFRENTE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.getByText(/ENFRENTE ENFERMAGEM CONTINUADA/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({
      path: path.join(ENFRENTE_OUT, 'T1-landing-desktop.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(ENFRENTE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.getByText(/ENFRENTE ENFERMAGEM CONTINUADA/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({
      path: path.join(ENFRENTE_OUT, 'T1-landing-mobile.png'),
      fullPage: true,
    });
  });
});
