/**
 * e2e/variant-gallery-regression.spec.ts — baseline desktop + 375px por layoutVariant.
 *
 *   npm run test:e2e:variant-gallery
 *   VARIANT_GALLERY_GENERICS_ONLY=true npm run test:e2e:variant-gallery
 *   VARIANT_GALLERY_LIMIT=20 npm run test:e2e:variant-gallery
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npm run test:e2e:variant-gallery
 */
import path from 'path';
import { test, expect } from '@playwright/test';
import {
  DESKTOP_VIEWPORT,
  gotoVariantGallery,
  loadGalleryVariants,
  MOBILE_NARROW_VIEWPORT,
  screenshotGalleryPanels,
  writeVariantGallerySummary,
} from './helpers/variantGalleryE2e';

const OUT_DIR = path.join(process.cwd(), 'artifacts/variant-gallery-regression');

function resolveVariantList() {
  const genericsOnly = process.env.VARIANT_GALLERY_GENERICS_ONLY === 'true';
  const limitRaw = process.env.VARIANT_GALLERY_LIMIT;
  const limit = limitRaw ? Number(limitRaw) : undefined;
  return loadGalleryVariants({
    genericsOnly,
    limit: Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : undefined,
  });
}

const variants = resolveVariantList();

test.describe('Variant gallery regression', () => {
  test.describe.configure({ mode: 'parallel', timeout: 120_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Variant gallery regression — nightly/manual only (dev route)');
    }
  });

  test.beforeEach(async ({ page, browserName }) => {
    if (
      !process.env.CI &&
      browserName !== 'chromium' &&
      process.env.VARIANT_GALLERY_ALL_BROWSERS !== 'true'
    ) {
      test.skip(true, 'Variant gallery — chromium only locally (set VARIANT_GALLERY_ALL_BROWSERS=true)');
    }
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('avant-estudo-reverso-welcome-seen', 'true');
      } catch {
        // ignore
      }
    });
  });

  test('índice da galeria lista variantes', async ({ page }) => {
    test.skip(variants.length === 0, 'Nenhuma variante declarada');
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/dev/variant-gallery', {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await expect(page.getByTestId('variant-gallery-index')).toBeVisible({ timeout: 60_000 });
  });

  for (const v of variants) {
    test(`desktop — ${v.key}`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoVariantGallery(page, v.slideType, v.id);
      await screenshotGalleryPanels(page, v.key, OUT_DIR, 'desktop');
    });

    test(`mobile-375 — ${v.key}`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoVariantGallery(page, v.slideType, v.id);
      await screenshotGalleryPanels(page, v.key, OUT_DIR, 'mobile-375');
    });
  }

  test('escreve summary.json', async () => {
    writeVariantGallerySummary({
      outDir: OUT_DIR,
      variants,
      detail: `Playwright variant gallery — ${variants.length} variant(s), desktop + 375px, default+stress`,
    });
    expect(variants.length).toBeGreaterThan(0);
  });
});
