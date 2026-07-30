/**
 * Jornada FSRS `/revisoes-hoje` (Playwright).
 * Seed: `lib/e2e/revisoesHojeSeed.ts` + `estudarSeed` sob `E2E_DASHBOARD_BYPASS`.
 */
import { test, expect, type Page, type Request } from '@playwright/test';
import { E2E_ESTUDAR_SLUG_1 } from '../lib/e2e/constants';
import {
  E2E_REVISOES_FSRS_MODE_PARAM,
  E2E_REVISOES_QUEUE_SLUGS,
} from '../lib/e2e/revisoesHojeSeed';
import { expectGabaritoCorreto } from './helpers/playerE2e';

const QUEUE_URL = `/revisoes-hoje?${E2E_REVISOES_FSRS_MODE_PARAM}=queue`;
const OFF_URL = `/revisoes-hoje?${E2E_REVISOES_FSRS_MODE_PARAM}=off`;
const EMPTY_URL = '/revisoes-hoje';
const REVISOES_SLUG_URL = new RegExp(
  `/estudar/${E2E_ESTUDAR_SLUG_1}\\?from=revisoes`,
);

function isUuidV4(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

async function selecionarAlternativaA(page: Page) {
  await page
    .getByRole('radio', { name: /Alternativa A:.*compressões torácicas/i })
    .click();
}

test.describe('Revisões de hoje — FSRS MVP (E2E bypass)', () => {
  // Serial: evita corrida no seed/bypass e no soft-nav do player com 2 workers.
  test.describe.configure({ mode: 'serial' });

  test('fora da allowlist (e2e_fsrs=off) → /plano-diario', async ({ page }) => {
    await page.goto(OFF_URL, { waitUntil: 'commit' });
    // Soft redirect RSC: poll URL (não esperar load/domcontentloaded da navegação).
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 30_000 })
      .toBe('/plano-diario');
    await expect(page.getByRole('heading', { name: /Você está em dia|Plano/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('beta com fila vazia', async ({ page }) => {
    await page.goto(EMPTY_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Nenhuma revisão due' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: /Ir para a Vitrine/i })).toBeVisible();
  });

  test('beta com card → /estudar/<slug>?from=revisoes', async ({ page }) => {
    await page.goto(QUEUE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Fila FSRS \(1\)/ })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(E2E_REVISOES_QUEUE_SLUGS[0])).toBeVisible();

    await Promise.all([
      page.waitForURL(REVISOES_SLUG_URL, { timeout: 15_000 }),
      // Evita strict-mode no mobile: nav lateral também tem link "Estudar".
      page.locator(`a[href*="/estudar/"][href*="from=revisoes"]`).click(),
    ]);

    await expect(page).toHaveURL(REVISOES_SLUG_URL);
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: /Voltar para Revisões de hoje/i }),
    ).toBeVisible();
  });

  test('confirmação envia attempt_id estável + from_revisoes', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?from=revisoes`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await selecionarAlternativaA(page);

    const attemptBodies: Array<Record<string, unknown>> = [];
    const onRequest = (req: Request) => {
      if (!req.url().includes('/api/registrar-tentativa') || req.method() !== 'POST') {
        return;
      }
      try {
        attemptBodies.push(JSON.parse(req.postData() ?? '{}') as Record<string, unknown>);
      } catch {
        // ignore malformed
      }
    };
    page.on('request', onRequest);

    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
    await expectGabaritoCorreto(page);

    page.off('request', onRequest);

    expect(attemptBodies.length).toBeGreaterThanOrEqual(1);
    const body = attemptBodies[0]!;
    expect(body.from_revisoes).toBe(true);
    expect(body.modulo_slug).toBe(E2E_ESTUDAR_SLUG_1);
    expect(isUuidV4(body.attempt_id)).toBe(true);

    if (attemptBodies.length > 1) {
      expect(attemptBodies[1]!.attempt_id).toBe(body.attempt_id);
      expect(attemptBodies[1]!.from_revisoes).toBe(true);
    }
  });

  test('conclusão retorna à fila', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?from=revisoes`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL(/\/revisoes-hoje/, { timeout: 15_000 }),
      page.getByRole('button', { name: 'Concluir revisões' }).click(),
    ]);

    await expect(page).toHaveURL(/\/revisoes-hoje/);
    await expect(
      page.getByRole('heading', { name: /Nenhuma revisão due|Fila FSRS/ }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
