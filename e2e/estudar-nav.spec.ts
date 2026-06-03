import { test, expect } from '@playwright/test';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
  E2E_ESTUDAR_TITULO_AULA,
} from '../lib/e2e/constants';

/**
 * Fluxo aluno: vitrine → questão → próxima (query da vitrine preservada).
 * Seed in-memory no servidor quando E2E_DASHBOARD_BYPASS=true (playwright.config).
 */
test.describe('Estudar — navegação vitrine → questão', () => {
  test.describe.configure({ mode: 'serial' });

  test('API retorna payload E2E para slugs fixos', async ({ request }) => {
    const res1 = await request.get(`/api/estudar/questao?slug=${E2E_ESTUDAR_SLUG_1}`);
    expect(res1.ok()).toBeTruthy();
    const body1 = await res1.json();
    expect(body1.dados?.question_data?.instruction).toContain('Questão E2E 1');

    const res2 = await request.get(
      `/api/estudar/questao?slug=${E2E_ESTUDAR_SLUG_2}&banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`,
    );
    expect(res2.ok()).toBeTruthy();
    const body2 = await res2.json();
    expect(body2.proximaSlug).toBeNull();
    expect(body2.anteriorSlug).toContain(E2E_ESTUDAR_SLUG_1);
  });

  test('vitrine → questão → próxima preserva banca na URL', async ({ page }) => {
    await page.goto(`/estudar?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`, {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });

    const assuntoBtn = page.getByRole('button', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
    await assuntoBtn.click();
    await expect(assuntoBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 15_000 });

    const panel = page.locator(`#assunto-panel-${E2E_ESTUDAR_SLUG_1}`);
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await panel.getByRole('link', { name: 'Entrar no assunto' }).click();

    await expect(page).toHaveURL(
      new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_1}.*banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`),
      { timeout: 15_000 },
    );
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Próxima/i }).click();

    await expect(page).toHaveURL(
      new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_2}.*banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`),
      { timeout: 15_000 },
    );
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
  });
});
