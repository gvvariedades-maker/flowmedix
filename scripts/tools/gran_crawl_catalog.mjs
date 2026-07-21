/**
 * Crawl Gran Essencial Temas Quentes — catalog + degravação paths.
 * Requires logged-in Chromium profile or GRAN_COOKIE env.
 * Run: npx playwright test is wrong — node scripts/tools/gran_crawl_catalog.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(
  BASE,
  'data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/essencial-catalog.json'
);

const COURSE_VIDEO =
  'https://www.grancursosonline.com.br/aluno/curso/video/codigo/Hytl66TYM%2Fc%3D/v/U4BP7JLk748%3D';

async function main() {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Open Gran and log in if needed, then press Enter in terminal...');
  await page.goto(COURSE_VIDEO);
  await new Promise((r) => process.stdin.once('data', r));

  const catalog = [];
  const seen = new Set();

  async function record(topic) {
    await page.waitForTimeout(900);
    const title = (await page.locator('h2').first().textContent())?.trim();
    const deg = await page
      .locator('a:has-text("Degravação")')
      .first()
      .getAttribute('href')
      .catch(() => null);
    const videoPath = new URL(page.url()).pathname + new URL(page.url()).search;
    if (!title || seen.has(videoPath)) return false;
    seen.add(videoPath);
    catalog.push({ topic, title, video_path: videoPath, degravacao_path: deg });
    console.log(' +', title);
    return true;
  }

  async function walkFrom(url, topic, max = 100) {
    await page.goto(url.startsWith('http') ? url : `https://www.grancursosonline.com.br${url}`);
    for (let i = 0; i < max; i++) {
      await record(topic);
      const before = page.url();
      const btn = page.locator('button:has-text("Próxima")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(1800);
      if (page.url() === before) break;
    }
  }

  async function selectTopic(topicName) {
    await page.goto(COURSE_VIDEO);
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /tópico -/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('listitem', { name: new RegExp(topicName, 'i') }).click();
    await page.waitForTimeout(1200);
    const first = page.locator('list[aria-label="Lista de aulas"] a[href*="/v/"]').first();
    if (await first.count()) {
      const href = await first.getAttribute('href');
      if (href) await walkFrom(href, topicName, 80);
    }
  }

  await walkFrom(
    '/aluno/curso/video/codigo/Hytl66TYM%2Fc%3D/v/hTFsBNbYPpc%3D',
    'Gramática',
    80
  );
  for (const t of [
    'Crase',
    'Colocação Pronominal',
    'Simulados Gramaticais',
    'Interpretação de Texto',
  ]) {
    await selectTopic(t);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ count: catalog.length, lessons: catalog }, null, 2));
  console.log('Wrote', OUT, catalog.length, 'lessons');
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
