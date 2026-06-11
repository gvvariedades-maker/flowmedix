import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';

export const QCONCURSOS_BASE = 'https://www.qconcursos.com';
export const QCONCURSOS_AUTH_URL = `${QCONCURSOS_BASE}/conta/entrar`;
export const QCONCURSOS_VITRINE_URL = `${QCONCURSOS_BASE}/questoes-de-concursos/questoes`;
/** Enfermagem + Técnico de Enfermagem — alinhado ao nicho AVANT. */
export const QCONCURSOS_VITRINE_ENFERMAGEM_URL =
  `${QCONCURSOS_BASE}/questoes-de-concursos/questoes?discipline_ids%5B%5D=172&job_ids%5B%5D=393`;

/** Persistido localmente; não commitar (ver `.gitignore`). */
export const QCONCURSOS_STORAGE_STATE = path.join(
  process.cwd(),
  'e2e/.auth/qconcursos-storage.json',
);

export function getQConcursosAuditCredentials(): { email: string; password: string } | null {
  const email = process.env.QCONCURSOS_AUDIT_EMAIL?.trim();
  const password = process.env.QCONCURSOS_AUDIT_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

export function hasQConcursosAuditCredentials(): boolean {
  return getQConcursosAuditCredentials() !== null;
}

export async function isQConcursosLoginScreen(page: Page): Promise<boolean> {
  const heading = page.getByRole('heading', { name: /Participe da maior comunidade/i });
  if (await heading.isVisible().catch(() => false)) return true;
  const emailField = page.getByPlaceholder(/E-mail ou Usuário/i);
  return emailField.isVisible().catch(() => false);
}

/** Vitrine é pública — usar header (link Entrar) para detectar sessão. */
export async function isQConcursosLoggedIn(page: Page): Promise<boolean> {
  const entrarHeader = page.locator('header, banner').getByRole('link', { name: /^Entrar$/i });
  const visible = await entrarHeader.first().isVisible().catch(() => false);
  return !visible;
}

/** Garante sessão: reutiliza storageState ou faz login e salva. */
export async function ensureQConcursosSession(page: Page): Promise<void> {
  const creds = getQConcursosAuditCredentials();
  if (!creds) {
    throw new Error(
      'Defina QCONCURSOS_AUDIT_EMAIL e QCONCURSOS_AUDIT_PASSWORD em .env.local (não commitar).',
    );
  }

  if (fs.existsSync(QCONCURSOS_STORAGE_STATE)) {
    await page.goto(`${QCONCURSOS_BASE}/usuario/novo-inicio`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    if (await isQConcursosLoggedIn(page)) return;
    fs.unlinkSync(QCONCURSOS_STORAGE_STATE);
  }

  await page.goto(QCONCURSOS_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(
    page.getByRole('heading', { name: /Participe da maior comunidade/i }),
  ).toBeVisible({ timeout: 30_000 });

  const emailInput = page.getByPlaceholder(/E-mail ou Usuário/i);
  const passwordInput = page.getByPlaceholder(/^Senha$/i);
  await emailInput.fill(creds.email);
  await passwordInput.fill(creds.password);

  const submit = page
    .locator('form')
    .getByRole('button', { name: /^Entrar$/i })
    .first();
  if (await submit.isVisible().catch(() => false)) {
    await submit.click();
  } else {
    await page.getByRole('button', { name: /^Entrar$/i }).last().click();
  }

  await expect
    .poll(async () => isQConcursosLoggedIn(page), { timeout: 45_000 })
    .toBe(true);

  fs.mkdirSync(path.dirname(QCONCURSOS_STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: QCONCURSOS_STORAGE_STATE });
}

export async function gotoQConcursosAuthenticated(page: Page, url: string): Promise<boolean> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1_200);
  if (await isQConcursosLoginScreen(page)) return false;
  return isQConcursosLoggedIn(page);
}
