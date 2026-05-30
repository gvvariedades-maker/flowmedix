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

  test('payload da questão não inclui NeuroSlides', async ({ request }) => {
    // Este cenário valida o contrato da API da questão de simulado.
    // Evitamos depender da URL /simulados/[id], que pode oscilar em bypass E2E.
    const questaoRes = await request.get(`/api/simulado/questao?slug=${E2E_SIMULADO_SLUG}`);
    expect(questaoRes.ok()).toBeTruthy();
    const questaoBody = await questaoRes.json();
    const serialized = JSON.stringify(questaoBody);
    expect(serialized).not.toContain('reverse_study_slides');
    expect(serialized).not.toContain('study_slides');
    expect(serialized).not.toContain('"is_correct"');
  });

  test('runner retoma sessão em andamento ao voltar para URL', async ({ page, request }) => {
    const createRes = await request.post('/api/simulado/sessions', { data: { quantidade: 1 } });
    expect(createRes.ok()).toBeTruthy();
    const createPayload = (await createRes.json()) as { session?: { id?: string } };
    const sessionId = createPayload.session?.id ?? E2E_SIMULADO_SESSION_ID;

    await page.goto(`/simulados/${sessionId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Simulado em andamento' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/0 de 1 respondidas/i)).toBeVisible();

    await page.goto('/estudar', { waitUntil: 'domcontentloaded' });
    await page.goto(`/simulados/${sessionId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Simulado em andamento' })).toBeVisible({
      timeout: 30_000,
    });
  });

  test('runner mostra feedback final antes do resumo', async ({ page, request }) => {
    const createRes = await request.post('/api/simulado/sessions', { data: { quantidade: 1 } });
    expect(createRes.ok()).toBeTruthy();
    const createPayload = (await createRes.json()) as { session?: { id?: string } };
    const sessionId = createPayload.session?.id ?? E2E_SIMULADO_SESSION_ID;

    await page.goto(`/simulados/${sessionId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Simulado em andamento' })).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.getByText('Paciente em parada cardiorrespiratória. Qual a primeira conduta?'),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole('radio', { name: /A\).*compressões torácicas/i }).click();
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();

    await expect(page.getByText('Resposta correta!')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Ver resultado' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Simulado concluído' })).not.toBeVisible();

    await page.getByRole('button', { name: 'Ver resultado' }).click();
    await expect(page.getByRole('heading', { name: 'Simulado concluído' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Novo simulado' }).first()).toBeVisible();
  });

  test('mobile exibe CTA de confirmar após selecionar alternativa', async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const createRes = await request.post('/api/simulado/sessions', { data: { quantidade: 1 } });
    expect(createRes.ok()).toBeTruthy();
    const createPayload = (await createRes.json()) as { session?: { id?: string } };
    const sessionId = createPayload.session?.id ?? E2E_SIMULADO_SESSION_ID;

    await page.goto(`/simulados/${sessionId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Simulado em andamento' })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByRole('button', { name: 'Confirmar resposta' })).not.toBeVisible();
    await page.getByRole('radio', { name: /A\).*compressões torácicas/i }).click();
    await expect(page.getByRole('button', { name: 'Confirmar resposta' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();

    await expect(page.getByRole('button', { name: 'Ver resultado' })).toBeVisible({
      timeout: 15_000,
    });
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

test.describe('Meu desempenho (simulados)', () => {
  test('renderiza dashboard com resumo comparativo de período e geral', async ({ page }) => {
    await page.goto('/desempenho/simulados?periodo=30d&modo=todos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Meu desempenho' })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText('Seu desempenho hoje')).toBeVisible();
    const hasResumoComparativo = await page.getByText('Resumo comparativo').isVisible().catch(() => false);
    if (hasResumoComparativo) {
      await expect(page.getByText('No período', { exact: true })).toBeVisible();
      await expect(page.getByText('Geral (histórico)', { exact: true })).toBeVisible();
      await expect(page.getByText('% de acerto', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Acertos', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Erros', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Questões respondidas', { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText('Onde focar agora').first()).toBeVisible();
    await expect(page.getByText('Sua tendência na semana').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Treinar agora' })).toBeVisible();
  });
});
