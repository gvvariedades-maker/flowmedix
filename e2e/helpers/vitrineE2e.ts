import { expect, type Page } from '@playwright/test';
import { E2E_ESTUDAR_BANCA } from '../../lib/e2e/constants';

export const VITRINE_E2E_STORAGE_KEYS = {
  statsSeen: 'avant.vitrine.statsSeen',
  view: 'avant.vitrine.view',
  welcomeShown: 'avant.estudoReverso.welcomeShown',
} as const;

/** Estado estável da vitrine premium (sem welcome modal nem count-up em andamento). */
export function vitrineStableLocalStorageInitScript() {
  return () => {
    try {
      localStorage.setItem('avant.estudoReverso.welcomeShown', 'true');
      localStorage.setItem('avant.vitrine.statsSeen', '1');
      localStorage.setItem('avant.vitrine.view', 'grid');
    } catch {
      /* storage indisponível */
    }
  };
}

export async function waitVitrineListReady(page: Page) {
  await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 30_000 });
}

export async function waitVitrineCatalogStatsReady(page: Page) {
  await expect(page.getByTestId('vitrine-catalog-stats')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('vitrine-catalog-stats')).toHaveAttribute(
    'data-vitrine-stats-ready',
    'true',
    { timeout: 10_000 },
  );
}

export async function gotoVitrineE2e(page: Page, query?: string) {
  const path =
    query === undefined
      ? `/estudar?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`
      : query
        ? `/estudar?${query}`
        : '/estudar';
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitVitrineListReady(page);
  await waitVitrineCatalogStatsReady(page);
}

export async function dismissWelcomeIfVisible(page: Page) {
  const skip = page.getByRole('button', { name: 'Não mostrar novamente' });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    return;
  }
  const close = page.getByRole('button', { name: 'Fechar introdução' });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  }
}

export function isMobileViewport(page: Page) {
  const viewport = page.viewportSize();
  return viewport ? viewport.width < 768 : false;
}

/** Sheet mobile do assunto (evita strict mode — um dialog por card). */
export function vitrineSubjectSheet(page: Page, tituloAssunto: string) {
  return page.getByRole('dialog', { name: new RegExp(tituloAssunto) });
}

/** Desktop: painel inline. Mobile: subject sheet. */
export async function garantirPainelAssuntoAberto(page: Page, tituloAssunto: string) {
  await waitVitrineListReady(page);

  if (isMobileViewport(page)) {
    const sheet = vitrineSubjectSheet(page, tituloAssunto);
    if (await sheet.isVisible().catch(() => false)) {
      return;
    }
    const assuntoBtn = page.getByRole('button', { name: new RegExp(tituloAssunto) });
    await assuntoBtn.scrollIntoViewIfNeeded();
    if ((await assuntoBtn.getAttribute('aria-expanded')) !== 'true') {
      await assuntoBtn.click();
    }
    await expect(sheet).toBeVisible({ timeout: 15_000 });
    return;
  }

  const assuntoBtn = page.getByRole('button', { name: new RegExp(tituloAssunto) });
  const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();

  try {
    await expect(entrar).toBeVisible({ timeout: 2_000 });
    return;
  } catch {
    /* painel recolhido */
  }

  if ((await assuntoBtn.getAttribute('aria-expanded')) !== 'true') {
    await assuntoBtn.click();
  }

  await expect(entrar).toBeVisible({ timeout: 15_000 });
}

export type SlugUrlMatcher = RegExp | ((url: URL) => boolean);

export type AbrirQuestaoVitrineOpts = {
  tituloAssunto: string;
  slugUrlPattern: SlugUrlMatcher;
  questaoText?: RegExp;
  /** Modal @estudar: no mobile abre sheet e usa "Entrar no assunto" em vez do CTA do card. */
  usarEntrarNoAssunto?: boolean;
};

function linkEntrarNoAssunto(page: Page, tituloAssunto: string) {
  if (isMobileViewport(page)) {
    return vitrineSubjectSheet(page, tituloAssunto).getByRole('link', { name: 'Entrar no assunto' });
  }
  return page.getByRole('link', { name: 'Entrar no assunto' }).first();
}

/** Abre a primeira questão do assunto — CTA mobile ou painel desktop. */
export async function abrirQuestaoViaVitrine(page: Page, opts: AbrirQuestaoVitrineOpts) {
  const waitOpts = { timeout: 15_000 as const };

  if (isMobileViewport(page) && !opts.usarEntrarNoAssunto) {
    const card = page
      .locator('[data-vitrine-list-ready="true"] > div')
      .filter({ hasText: opts.tituloAssunto });
    const cta = card.getByRole('link', { name: /^(Iniciar|Continuar|Revisar)$/ }).first();
    await cta.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(opts.slugUrlPattern, waitOpts), cta.click()]);
  } else {
    await garantirPainelAssuntoAberto(page, opts.tituloAssunto);
    const entrar = linkEntrarNoAssunto(page, opts.tituloAssunto);
    await entrar.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(opts.slugUrlPattern, waitOpts), entrar.click()]);
  }

  if (opts.questaoText) {
    await expect(page.getByText(opts.questaoText)).toBeVisible({ timeout: 15_000 });
  }
}
