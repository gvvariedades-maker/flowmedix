import { expect, type Page } from '@playwright/test';

/** H1 da LP v3 — texto fragmentado em vários <span>; usar role heading. */
export async function expectLandingHeroVisible(page: Page, timeout = 30_000) {
  await expect(
    page.getByRole('heading', { level: 1, name: /O AVANT Enf foi feito/i }),
  ).toBeVisible({ timeout });
}
