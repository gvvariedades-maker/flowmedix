import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';

export const GABARITA_BASE = 'https://gabaritaenfermagem.com.br';
export const GABARITA_AUTH_URL = `${GABARITA_BASE}/auth`;

/** Persistido localmente; não commitar (ver `.gitignore`). */
export const GABARITA_STORAGE_STATE = path.join(
  process.cwd(),
  'e2e/.auth/gabarita-storage.json',
);

export function getGabaritaAuditCredentials(): { email: string; password: string } | null {
  const email = process.env.GABARITA_AUDIT_EMAIL?.trim();
  const password = process.env.GABARITA_AUDIT_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

export function hasGabaritaAuditCredentials(): boolean {
  return getGabaritaAuditCredentials() !== null;
}

export async function isGabaritaLoginScreen(page: Page): Promise<boolean> {
  return page
    .getByRole('heading', { name: 'Entrar' })
    .isVisible()
    .catch(() => false);
}

/** Garante sessão: reutiliza storageState ou faz login e salva. */
export async function ensureGabaritaSession(page: Page): Promise<void> {
  const creds = getGabaritaAuditCredentials();
  if (!creds) {
    throw new Error(
      'Defina GABARITA_AUDIT_EMAIL e GABARITA_AUDIT_PASSWORD em .env.local (não commitar).',
    );
  }

  if (fs.existsSync(GABARITA_STORAGE_STATE)) {
    // Context já deve carregar storageState; valida com uma rota protegida.
    await page.goto(`${GABARITA_BASE}/dashboard`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    if (!(await isGabaritaLoginScreen(page))) return;
  }

  await page.goto(GABARITA_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible({ timeout: 30_000 });

  await page.locator('input[type="email"]').fill(creds.email);
  await page.locator('input[type="password"]').fill(creds.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('heading', { name: 'Entrar' })).not.toBeVisible({
    timeout: 45_000,
  });

  fs.mkdirSync(path.dirname(GABARITA_STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: GABARITA_STORAGE_STATE });
}

export async function gotoGabaritaAuthenticated(page: Page, routePath: string): Promise<boolean> {
  const url = routePath.startsWith('http') ? routePath : `${GABARITA_BASE}${routePath}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1_500);
  return !(await isGabaritaLoginScreen(page));
}
