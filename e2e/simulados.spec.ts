import { test, expect } from '@playwright/test';
import {
  E2E_SIMULADO_SESSION_ID,
  E2E_SIMULADO_SLUG,
} from '../lib/e2e/constants';

/**
 * Fluxo aluno: /simulados → runner → resumo.
 * APIs usam seed in-memory no servidor quando E2E_DASHBOARD_BYPASS=true (playwright.config).
 */
test.describe('Modo Simulado (aluno)', () => {
  test.describe.configure({ mode: 'serial' });

  test('configuração → runner → resumo após responder', async ({ page }) => {
    await page.goto('/simulados', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Simulados' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Iniciar simulado' }).click();

    await page.waitForURL(new RegExp(`/simulados/${E2E_SIMULADO_SESSION_ID}$`), {
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Simulado em andamento' })).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.getByText('Paciente em parada cardiorrespiratória. Qual a primeira conduta?'),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: /A\).*compressões torácicas/i }).click();
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();

    await expect(page.getByRole('heading', { name: 'Simulado concluído' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Novo simulado' }).first()).toBeVisible();
  });

  test('retoma sessão concluída pela URL (refresh)', async ({ page, request }) => {
    await request.post('/api/simulado/sessions', { data: { quantidade: 1 } });
    await request.post('/api/simulado/responder', {
      data: {
        session_id: E2E_SIMULADO_SESSION_ID,
        modulo_slug: E2E_SIMULADO_SLUG,
        opcao_id: 'A',
      },
    });

    await page.goto(`/simulados/${E2E_SIMULADO_SESSION_ID}`, {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByRole('heading', { name: 'Simulado concluído' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('Revisão por questão')).toBeVisible();
    await expect(page.getByText('Acertou')).toBeVisible();
  });
});
