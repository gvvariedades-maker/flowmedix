/**
 * Capturas do hub `/desempenho` para o relatório da V1 (TEC adaptado).
 *
 * Rodar: `npm run capture:desempenho-hub`
 * Saída: `artifacts/desempenho-v1/<sha>/<aba>-<viewport>.png`
 *
 * O SHA vem de `DESEMPENHO_CAPTURE_SHA` ou do `git rev-parse --short HEAD`,
 * para a captura ser rastreável ao código que a gerou.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;

function resolveSha(): string {
  const fromEnv = process.env.DESEMPENHO_CAPTURE_SHA?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'sem-sha';
  }
}

const OUT_DIR = path.join(process.cwd(), 'artifacts', 'desempenho-v1', resolveSha());

async function snap(page: Page, filename: string) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true });
}

const ABAS = [
  {
    id: 'estudo',
    url: '/desempenho',
    async pronto(page: Page) {
      await expect(page.getByLabel('Placar de estudo')).toBeVisible({ timeout: 60_000 });
    },
  },
  {
    id: 'simulados',
    url: '/desempenho/simulados',
    async pronto(page: Page) {
      await expect(page.getByText('Resumo comparativo')).toBeVisible({ timeout: 60_000 });
    },
  },
  {
    id: 'atividade',
    url: '/desempenho/atividade',
    async pronto(page: Page) {
      await expect(page.getByRole('grid').first()).toBeVisible({ timeout: 60_000 });
    },
  },
] as const;

test.describe('Capturas hub Desempenho V1', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180_000);

  for (const aba of ABAS) {
    for (const [nomeViewport, viewport] of Object.entries(VIEWPORTS)) {
      test(`${aba.id}-${nomeViewport}.png`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(aba.url, { waitUntil: 'domcontentloaded' });
        await aba.pronto(page);
        await snap(page, `${aba.id}-${nomeViewport}.png`);
      });
    }
  }

  test('atividade-dialogo-reset-mobile.png', async ({ page }) => {
    // Evidência do CTA destrutivo autoexplicativo dentro do diálogo.
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/desempenho/atividade', { waitUntil: 'domcontentloaded' });

    const abrir = page
      .locator('footer', { hasText: 'Privacidade e dados' })
      .getByRole('button', { name: 'Zerar desempenho de estudo' });
    await expect(abrir).toBeVisible({ timeout: 60_000 });

    const dialog = page.getByRole('dialog');
    await expect(async () => {
      await abrir.click();
      await expect(dialog).toBeVisible();
    }).toPass({ timeout: 45_000 });

    await snap(page, 'atividade-dialogo-reset-mobile.png');
  });

  test('estudo-amostra-insuficiente-mobile.png', async ({ page }) => {
    // Recorte curto: mostra o estado "amostra insuficiente" sem simular erro.
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/desempenho?periodo=7d', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Placar de estudo')).toBeVisible({ timeout: 60_000 });
    await snap(page, 'estudo-amostra-insuficiente-mobile.png');
  });

  test('estudo-titulo-longo-badges-mobile.png', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('recent-attempt-title').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('recent-attempt-title').first()).toContainText(
      'Infecções Sexualmente Transmissíveis',
    );
    await snap(page, 'estudo-titulo-longo-badges-mobile.png');
  });

  test('estudo-placar-zerado-serie-mobile.png', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/desempenho?captura=placar-zerado', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Placar de estudo')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByLabel('Evolução de tentativas')).toBeVisible();
    await expect(
      page.getByText(/O placar de questões acima está zerado/),
    ).toBeVisible();
    await snap(page, 'estudo-placar-zerado-serie-mobile.png');
  });

  test('estudo-placar-zerado-serie-desktop.png', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/desempenho?captura=placar-zerado', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Evolução de tentativas')).toBeVisible({ timeout: 60_000 });
    await snap(page, 'estudo-placar-zerado-serie-desktop.png');
  });

  test('atividade-titulo-longo-ranking-mobile.png', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/desempenho/atividade', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('ranking-assunto-nome').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('ranking-assunto-nome').first()).toContainText(
      'Infecções Sexualmente Transmissíveis',
    );
    await snap(page, 'atividade-titulo-longo-ranking-mobile.png');
  });
});
