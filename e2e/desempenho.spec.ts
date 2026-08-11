import { expect, test } from '@playwright/test';
import { E2E_DESEMPENHO_TITULO_AULA } from '../lib/e2e/constants';

/**
 * Hub `/desempenho` (aba Estudo): placar, mapa e CTA praticar.
 * Seed in-memory quando E2E_DASHBOARD_BYPASS=true (playwright.config).
 */
test.describe('Hub Desempenho (estudo)', () => {
  test.describe.configure({ mode: 'serial' });

  test('renderiza placar, mapa por assunto e CTA praticar', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Meu desempenho' })).toBeVisible({
      timeout: 60_000,
    });

    await expect(page.getByRole('tablist', { name: 'Seções de desempenho' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Estudo' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    const placar = page.getByLabel('Placar de estudo');
    await expect(placar).toBeVisible();
    await expect(placar.getByText('Respondidas')).toBeVisible();
    await expect(placar.getByText('Acertos')).toBeVisible();
    await expect(placar.getByText('Erros')).toBeVisible();
    await expect(placar.getByText('% acerto')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Mapa por assunto' })).toBeVisible();
    await expect(page.getByText(E2E_DESEMPENHO_TITULO_AULA).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Radar de prova' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Próximos focos' })).toBeVisible();

    const assuntoEncoded = encodeURIComponent(E2E_DESEMPENHO_TITULO_AULA);
    const expectedHref = `/estudar?assunto=${assuntoEncoded}&status=pending`;

    const ctaPraticar = page.getByRole('link', {
      name: `Praticar agora: ${E2E_DESEMPENHO_TITULO_AULA}`,
    });
    await expect(ctaPraticar).toBeVisible();
    await expect(ctaPraticar).toHaveAttribute('href', expectedHref);
    await expect(page.locator(`a[href="${expectedHref}"]`).first()).toBeVisible();
  });

  test('/progresso e /analytics redirecionam para /desempenho', async ({ page }) => {
    await page.goto('/progresso', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/desempenho/, { timeout: 15_000 });

    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/desempenho/, { timeout: 15_000 });
  });

  test('aba Atividade e Simulados navegam pelo hub', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('tab', { name: 'Estudo' })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('tab', { name: 'Atividade' }).click();
    await expect(page).toHaveURL(/\/desempenho\/atividade/, { timeout: 30_000 });

    await page.getByRole('tab', { name: 'Simulados' }).click();
    await expect(page).toHaveURL(/\/desempenho\/simulados/, { timeout: 30_000 });
    await expect(page.getByRole('tab', { name: 'Simulados' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
