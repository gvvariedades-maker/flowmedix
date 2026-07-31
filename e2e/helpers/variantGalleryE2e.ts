/**
 * Helpers e2e — galeria de layoutVariant (/dev/variant-gallery).
 */
import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';
import { listDeclaredVariants, type SlideTypeKey } from '../../lib/neurocanvas/declaredVariants';

export const DESKTOP_VIEWPORT = { width: 1280, height: 800 } as const;
export const MOBILE_NARROW_VIEWPORT = { width: 375, height: 812 } as const;

export type GalleryVariantRef = {
  key: string;
  slideType: SlideTypeKey;
  id: string;
  generic: boolean;
};

export function loadGalleryVariants(opts?: {
  genericsOnly?: boolean;
  limit?: number;
  types?: SlideTypeKey[];
}): GalleryVariantRef[] {
  let list = listDeclaredVariants().map((d) => ({
    key: d.key,
    slideType: d.slideType,
    id: d.id,
    generic: d.generic,
  }));
  if (opts?.types?.length) {
    const set = new Set(opts.types);
    list = list.filter((v) => set.has(v.slideType));
  }
  if (opts?.genericsOnly) {
    list = list.filter((v) => v.generic);
  }
  if (opts?.limit != null && opts.limit > 0) {
    list = list.slice(0, opts.limit);
  }
  return list;
}

export async function gotoVariantGallery(
  page: Page,
  slideType: SlideTypeKey,
  variant: string,
): Promise<void> {
  const url = `/dev/variant-gallery?type=${encodeURIComponent(slideType)}&variant=${encodeURIComponent(variant)}&both=1`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await expect(page.getByTestId('variant-gallery-root')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('variant-gallery-panel-default')).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByTestId('variant-gallery-panel-stress')).toBeVisible({
    timeout: 60_000,
  });
}

export async function screenshotGalleryPanels(
  page: Page,
  key: string,
  outDir: string,
  viewportLabel: 'desktop' | 'mobile-375',
): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  for (const fixture of ['default', 'stress'] as const) {
    const panel = page.getByTestId(`variant-gallery-panel-${fixture}`);
    await panel.scrollIntoViewIfNeeded();
    await panel.screenshot({
      path: path.join(outDir, `${key}-${viewportLabel}-${fixture}.png`),
      type: 'png',
    });
  }
}

export function writeVariantGallerySummary(opts: {
  outDir: string;
  variants: GalleryVariantRef[];
  pass?: boolean;
  detail?: string;
}): string {
  fs.mkdirSync(opts.outDir, { recursive: true });
  const outPath = path.join(opts.outDir, 'summary.json');
  const summary = {
    generated_at: new Date().toISOString(),
    pass: opts.pass ?? true,
    detail:
      opts.detail ??
      `Variant gallery regression — ${opts.variants.length} variant(s)`,
    variants: opts.variants.map((v) => v.key),
    count: opts.variants.length,
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  return outPath;
}
