/**
 * Gera JPGs em `public/images/landing/` para a vitrine da landing.
 * Pré-requisito: `npm run dev` (porta 3000 ou 3001).
 *
 * Uso: npm run capture:landing-neuroslides
 */
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';
const OUT = join(process.cwd(), 'public', 'images', 'landing');
const VIEW = { width: 390, height: 844 } as const;

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEW,
    locale: 'pt-BR',
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const targets: { selector: string; file: string }[] = [
    { selector: '[data-capture="versus"]', file: 'neuroslide-showcase-versus.jpg' },
    { selector: '[data-capture="scanner"]', file: 'neuroslide-showcase-scanner.jpg' },
  ];

  try {
    await page.goto(`${BASE}/neuroslide-showcase-capture`, { waitUntil: 'load', timeout: 90_000 });
    await page.waitForTimeout(2500);

    for (const { selector, file } of targets) {
      const el = page.locator(selector).first();
      await el.waitFor({ state: 'visible', timeout: 30_000 });
      await page.waitForTimeout(400);
      await el.screenshot({ path: join(OUT, file), type: 'jpeg', quality: 88 });
      console.log(`[capture-landing-neuroslides] ${file}`);
    }

    console.log(`[capture-landing-neuroslides] OK — ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
