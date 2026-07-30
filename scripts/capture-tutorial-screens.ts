/**
 * Gera PNGs em `public/tutorial/` para a página /ajuda.
 *
 * Pré-requisito: app rodando em http://localhost:3000 (ex.: `npm run dev`).
 *
 * Opcional — telas que exigem login (Meu desempenho, Plano, Cadernos, Material):
 *   set PLAYWRIGHT_TUTORIAL_EMAIL=...
 *   set PLAYWRIGHT_TUTORIAL_PASSWORD=...
 *
 * Se a vitrine estiver vazia mas existir um slug conhecido no banco:
 *   set PLAYWRIGHT_TUTORIAL_SLUG=meu-modulo-slug
 *
 * Uso: npm run capture:tutorial
 */
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { chromium } from 'playwright';

const BASE = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';
const OUT = join(process.cwd(), 'public', 'tutorial');
const VIEW = { width: 1280, height: 800 } as const;

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEW,
    locale: 'pt-BR',
  });
  const page = await context.newPage();

  const shot = async (name: string, fullPage = false) => {
    await page.screenshot({ path: join(OUT, name), fullPage });
  };

  try {
    // 1 — Landing (deslogado)
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 90_000 });
    await shot('01-landing.png', true);

    // 2 — Login
    await page.goto(`${BASE}/login`, { waitUntil: 'load', timeout: 90_000 });
    await shot('02-login.png', true);

    // 3 — Vitrine (não exige login)
    await page.goto(`${BASE}/estudar`, { waitUntil: 'load', timeout: 90_000 });
    await page.waitForTimeout(800);
    await shot('03-vitrine.png', true);

    // 4 — Primeira aula (pergunta)
    const lessonLinks = page.locator('main a[href^="/estudar/"]');
    if ((await lessonLinks.count()) > 0) {
      const href = await lessonLinks.first().getAttribute('href');
      if (href && /^\/estudar\/.+/.test(href)) {
        await page.goto(`${BASE}${href}`, { waitUntil: 'load', timeout: 90_000 });
        await page.waitForTimeout(1200);
        await shot('04-questao.png', true);
      }
    } else {
      const slug = process.env.PLAYWRIGHT_TUTORIAL_SLUG?.trim();
      if (slug) {
        await page.goto(`${BASE}/estudar/${encodeURIComponent(slug)}`, { waitUntil: 'load', timeout: 90_000 });
        await page.waitForTimeout(1200);
        await shot('04-questao.png', true);
      } else {
        console.warn(
          '[capture-tutorial] Nenhum link na vitrine e sem PLAYWRIGHT_TUTORIAL_SLUG — pulei 04-questao.png',
        );
      }
    }

    // 5 — Login com destino (explica áreas que pedem conta)
    await page.goto(`${BASE}/login?next=${encodeURIComponent('/progresso')}`, {
      waitUntil: 'load',
      timeout: 90_000,
    });
    await shot('05-login-areas-logadas.png', true);

    const email = process.env.PLAYWRIGHT_TUTORIAL_EMAIL?.trim();
    const password = process.env.PLAYWRIGHT_TUTORIAL_PASSWORD;
    if (email && password) {
      await page.goto(`${BASE}/login`, { waitUntil: 'load', timeout: 90_000 });
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').first().fill(password);
      await page.getByRole('button', { name: /Acessar Plataforma/i }).click();
      await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45_000 });

      const logged = [
        ['06-meu-desempenho.png', '/progresso'],
        ['08-cadernos.png', '/cadernos'],
        ['09-material.png', '/material'],
      ] as const;
      for (const [file, path] of logged) {
        await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 90_000 });
        await page.waitForTimeout(600);
        await shot(file, true);
      }
    } else {
      console.warn(
        '[capture-tutorial] Sem PLAYWRIGHT_TUTORIAL_EMAIL/PASSWORD — pulando prints 06–09 (áreas logadas).',
      );
    }

    console.log(`[capture-tutorial] OK — arquivos em ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
