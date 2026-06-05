import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_TITULO_AULA,
} from '../lib/e2e/constants';

const BANCA_QUERY = encodeURIComponent(E2E_ESTUDAR_BANCA);
const SLUG_1_URL = new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_1}.*banca=${BANCA_QUERY}`);

async function waitVitrineListReady(page: Page) {
  await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached({ timeout: 15_000 });
  await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 15_000 });
}

async function gotoVitrineFiltrada(page: Page) {
  await page.goto(`/estudar?banca=${BANCA_QUERY}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });
  await waitVitrineListReady(page);
}

function linkEntrarNoAssunto(page: Page) {
  return page.locator(`a[href*="/estudar/${E2E_ESTUDAR_SLUG_1}"]`).filter({ hasText: 'Entrar no assunto' }).first();
}

async function garantirPainelAssuntoAberto(page: Page) {
  await waitVitrineListReady(page);
  const assuntoBtn = page.getByRole('button', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
  await assuntoBtn.scrollIntoViewIfNeeded();

  await expect
    .poll(
      async () => {
        if ((await assuntoBtn.getAttribute('aria-expanded')) === 'true') return 'true';
        await assuntoBtn.click({ force: true });
        return assuntoBtn.getAttribute('aria-expanded');
      },
      { timeout: 15_000 },
    )
    .toBe('true');

  const entrar = linkEntrarNoAssunto(page);
  await expect(entrar).toBeVisible({ timeout: 15_000 });
}

async function abrirPrimeiraQuestaoDaVitrine(page: Page) {
  await garantirPainelAssuntoAberto(page);

  const entrar = linkEntrarNoAssunto(page);
  await entrar.scrollIntoViewIfNeeded();
  await entrar.click({ force: true });

  // Intercept @modal pode compilar na 1ª navegação — aguardar URL ou conteúdo.
  await Promise.race([
    page.waitForURL(SLUG_1_URL, { timeout: 45_000, waitUntil: 'commit' }),
    expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 45_000 }),
  ]);
  await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
}

/**
 * Modal @estudar (fase 11.2) — requer NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1 no servidor.
 * Rodar: npm run test:e2e:modal
 */
test.describe('Estudar — modal intercept (mobile)', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  test.beforeEach(async () => {
    test.skip(
      process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE !== '1',
      'NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1 obrigatório — use npm run test:e2e:modal',
    );
  });

  test('vitrine → questão abre dialog sobre a vitrine', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible();
  });

  test('BottomNav fica aria-hidden com modal aberto', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);

    const bottomNav = page.locator('nav[aria-label="Navegação rápida"]');
    await expect(bottomNav).toHaveAttribute('aria-hidden', 'true', { timeout: 15_000 });
  });

  test('Escape fecha modal e reativa vitrine', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });

    const entendi = page.getByRole('button', { name: 'Entendi' });
    if (await entendi.isVisible().catch(() => false)) {
      await entendi.click();
    }

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(`/estudar(?:\\?.*banca=${BANCA_QUERY})?`), {
      timeout: 15_000,
    });
    await waitVitrineListReady(page);

    const bottomNav = page.locator('nav[aria-label="Navegação rápida"]');
    await expect(bottomNav).not.toHaveAttribute('aria-hidden', 'true');

    const iniciar = page
      .locator(`a[href*="/estudar/${E2E_ESTUDAR_SLUG_1}"]`)
      .filter({ hasText: 'Iniciar' })
      .first();
    await iniciar.click({ force: true });
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
  });

  test('backdrop fecha modal e vitrine permanece clicável', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Próxima/i })).toBeEnabled({ timeout: 30_000 });

    const entendi = page.getByRole('button', { name: 'Entendi' });
    if (await entendi.isVisible().catch(() => false)) {
      await entendi.click();
    }

    // Painel flex-1 cobre o backdrop no mobile — dispara o handler do botão backdrop.
    await page.evaluate(() => {
      const backdrop = document.querySelector(
        '[role="dialog"] > button[aria-label="Fechar questão"]',
      ) as HTMLButtonElement | null;
      backdrop?.click();
    });

    await expect(dialog).not.toBeVisible({ timeout: 15_000 });
    await waitVitrineListReady(page);
    await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached();
  });

  test('botão Vitrine fecha modal preservando banca', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await abrirPrimeiraQuestaoDaVitrine(page);
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Vitrine' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(`/estudar(?:\\?.*banca=${BANCA_QUERY})?`), {
      timeout: 15_000,
    });
    await waitVitrineListReady(page);
  });

  test('não deixa vitrine inerte durante carga — dialog ou skeleton visível', async ({ page }) => {
    await gotoVitrineFiltrada(page);
    await garantirPainelAssuntoAberto(page);

    const entrar = linkEntrarNoAssunto(page);
    await entrar.scrollIntoViewIfNeeded();
    await entrar.click({ force: true });

    const dialogOrSkeleton = page
      .getByRole('dialog')
      .or(page.getByTestId('estudar-questao-skeleton'));
    await expect(dialogOrSkeleton.first()).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 45_000 });
  });
});
