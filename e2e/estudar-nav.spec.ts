import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
  E2E_ESTUDAR_TITULO_AULA,
} from '../lib/e2e/constants';

const BANCA_QUERY = encodeURIComponent(E2E_ESTUDAR_BANCA);
const SLUG_1_URL = new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_1}.*banca=${BANCA_QUERY}`);
const SLUG_2_URL = new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_2}.*banca=${BANCA_QUERY}`);

/** Lista interativa (sem skeleton nem refresh bloqueando cliques). */
async function waitVitrineListReady(page: Page) {
  await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached({ timeout: 15_000 });
  await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 15_000 });
}

async function gotoVitrineFiltrada(page: Page) {
  await page.goto(`/estudar?banca=${BANCA_QUERY}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });
  await waitVitrineListReady(page);
}

async function garantirPainelAssuntoAberto(page: Page) {
  const panel = page.locator(`#assunto-panel-${E2E_ESTUDAR_SLUG_1}`);
  const assuntoBtn = page.getByRole('button', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
  const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();

  if ((await panel.isVisible()) && (await entrar.isVisible())) return;

  if ((await assuntoBtn.getAttribute('aria-expanded')) === 'true') {
    await assuntoBtn.click();
  }
  await assuntoBtn.click();
  await expect(panel).toBeVisible({ timeout: 15_000 });
  await expect(entrar).toBeVisible({ timeout: 15_000 });
}

async function abrirPrimeiraQuestaoDaVitrine(page: Page) {
  await garantirPainelAssuntoAberto(page);

  const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();
  await entrar.scrollIntoViewIfNeeded();

  await Promise.all([
    page.waitForURL(SLUG_1_URL, { timeout: 15_000 }),
    entrar.click(),
  ]);
  await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
}

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

  test('vitrine → primeira questão preserva banca na URL', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);
    await expect(page).toHaveURL(SLUG_1_URL);
  });

  test('vitrine → questão → vitrine → abre de novo', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);

    await page.getByRole('button', { name: 'Vitrine' }).click();
    await expect(page).toHaveURL(new RegExp(`/estudar(?:\\?.*banca=${BANCA_QUERY})?`), {
      timeout: 15_000,
    });
    await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });
    await waitVitrineListReady(page);

    await abrirPrimeiraQuestaoDaVitrine(page);

    await expect(page).toHaveURL(SLUG_1_URL);
  });

  test('próxima questão preserva banca na URL', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}`, {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(SLUG_2_URL, { timeout: 15_000 }),
      page.getByRole('button', { name: /Próxima/i }).click(),
    ]);

    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(SLUG_2_URL);
  });
});
