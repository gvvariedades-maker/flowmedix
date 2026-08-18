/**
 * C2 — superfícies descontinuadas redirecionam para `/estudar`.
 * @see docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md
 */
import { expect, test } from '@playwright/test';

test.describe('revisão espaçada descontinuada — redirects C2', () => {
  test('/revisoes-hoje → /estudar', async ({ page }) => {
    await page.goto('/revisoes-hoje', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/estudar/);
  });

  test('/plano-diario → /estudar', async ({ page }) => {
    await page.goto('/plano-diario', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/estudar/);
  });
});
