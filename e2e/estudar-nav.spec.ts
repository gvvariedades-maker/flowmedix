import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
  E2E_ESTUDAR_SLUG_2,
  E2E_ESTUDAR_TITULO_AULA,
  E2E_ESTUDAR_TITULO_AULA_PAGE2,
} from '../lib/e2e/constants';

const BANCA_QUERY = encodeURIComponent(E2E_ESTUDAR_BANCA);
const SLUG_1_URL = new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_1}.*banca=${BANCA_QUERY}`);
const SLUG_2_URL = new RegExp(`/estudar/${E2E_ESTUDAR_SLUG_2}.*banca=${BANCA_QUERY}`);

function parseEstudarUrl(url: string) {
  return new URL(url);
}

function isVitrineUrl(url: string, opts: { page?: string } = {}) {
  const parsed = parseEstudarUrl(url);
  if (parsed.pathname !== '/estudar') return false;
  if (parsed.searchParams.get('banca') !== E2E_ESTUDAR_BANCA) return false;
  if (opts.page != null && parsed.searchParams.get('page') !== opts.page) return false;
  return true;
}

function isQuestaoUrl(
  url: string,
  slug: string,
  opts: { page?: string } = {},
) {
  const parsed = parseEstudarUrl(url);
  if (parsed.pathname !== `/estudar/${slug}`) return false;
  if (parsed.searchParams.get('banca') !== E2E_ESTUDAR_BANCA) return false;
  if (opts.page != null && parsed.searchParams.get('page') !== opts.page) return false;
  return true;
}

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

async function gotoVitrinePage2(page: Page) {
  await page.goto(`/estudar?banca=${BANCA_QUERY}&page=2`, { waitUntil: 'domcontentloaded' });
  await waitVitrineListReady(page);
  await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA_PAGE2)).toBeVisible({ timeout: 15_000 });
}

async function garantirPainelAssuntoAberto(
  page: Page,
  tituloAssunto: string = E2E_ESTUDAR_TITULO_AULA,
) {
  const assuntoBtn = page.getByRole('button', { name: new RegExp(tituloAssunto) });
  const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();

  try {
    await expect(entrar).toBeVisible({ timeout: 2_000 });
    return;
  } catch {
    // painel recolhido ou vitrine ainda hidratando
  }

  if ((await assuntoBtn.getAttribute('aria-expanded')) !== 'true') {
    await assuntoBtn.click();
  }

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
    expect(body1.dados?.reverse_study_slides).toHaveLength(4);

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

async function abrirQuestao1Direto(page: Page) {
  await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
}

async function selecionarAlternativaA(page: Page) {
  await page
    .getByRole('radio', { name: /Alternativa A:.*compressões torácicas/i })
    .click();
}

async function selecionarAlternativaB(page: Page) {
  await page
    .getByRole('radio', { name: /Alternativa B:.*atropina/i })
    .click();
}

async function confirmarRespostaEGabarito(page: Page) {
  await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
  await expect(page.getByText('Resposta Correta')).toBeVisible({ timeout: 15_000 });
}

async function confirmarRespostaIncorreta(page: Page) {
  await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
  await expect(page.getByText('Resposta Incorreta')).toBeVisible({ timeout: 15_000 });
}

async function expectNavButtonsReady(page: Page, opts: { requireProxima?: boolean } = {}) {
  const { requireProxima = true } = opts;
  const anterior = page.getByRole('button', { name: /Anterior/i }).first();
  const proxima = page.getByRole('button', { name: /Próxima/i }).first();

  if (requireProxima) {
    await expect(proxima).toBeEnabled({ timeout: 15_000 });
    await expect(proxima).not.toHaveText(/Carregando|Sincronizando/i);
  }

  if (await anterior.isVisible()) {
    await expect(anterior).not.toHaveText(/Carregando|Sincronizando/i);
  }
}

async function clicarProximaQuestao(page: Page) {
  const proxima = page.getByRole('button', { name: /Próxima/i }).first();
  await expect(proxima).toBeEnabled({ timeout: 15_000 });
  await proxima.click();
}

/**
 * Ciclo aluno: responder, pular estudo, estudo completo e regressão de navegação.
 * APIs de tentativa/conclusão usam seed E2E quando E2E_DASHBOARD_BYPASS=true.
 */
test.describe('Estudar — ciclo aluno (resposta, pular, estudo)', () => {
  test.describe.configure({ mode: 'serial' });

  test('abrir questão, responder e exibir toast de gabarito', async ({ page }) => {
    await abrirQuestao1Direto(page);
    await selecionarAlternativaA(page);
    await confirmarRespostaEGabarito(page);
    await expect(page.getByRole('button', { name: /Ativar Estudo Reverso/i })).toBeVisible();
  });

  test('pular estudo reverso: próxima questão sem ativar estudo', async ({ page }) => {
    await abrirQuestao1Direto(page);
    await selecionarAlternativaA(page);
    await confirmarRespostaEGabarito(page);

    await Promise.all([
      page.waitForURL(SLUG_2_URL, { timeout: 15_000 }),
      clicarProximaQuestao(page),
    ]);

    await expect(page).toHaveURL(SLUG_2_URL);
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('radiogroup', { name: 'Alternativas da questão' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /Ativar Estudo Reverso/i })).not.toBeVisible();
  });

  test('estudo reverso: slides, marcar estudado e dot verde', async ({ page }) => {
    await abrirQuestao1Direto(page);
    await selecionarAlternativaA(page);
    await confirmarRespostaEGabarito(page);

    await page.getByRole('button', { name: /Ativar Estudo Reverso/i }).click();
    await expect(page.getByText(/Avant Neuro-Learning/i)).toBeVisible({ timeout: 15_000 });

    const avancarSlide = page.getByRole('button', { name: /^Próximo$/i });
    for (let i = 0; i < 3; i += 1) {
      await expect(avancarSlide).toBeEnabled({ timeout: 15_000 });
      await avancarSlide.click();
    }

    await page.getByRole('button', { name: /Marcar (como )?[Ee]studado/i }).click();
    await expect(page.getByText('Estudo concluído')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Fechar estudo reverso/i }).click();
    await expect(page.getByRole('button', { name: /Questão 1.*estudo reverso concluído/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('regressão de navegação após pular: anterior e próxima sem reload', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_2}?banca=${BANCA_QUERY}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });

    for (let round = 0; round < 2; round += 1) {
      await Promise.all([
        page.waitForURL(SLUG_1_URL, { timeout: 15_000 }),
        page.getByRole('button', { name: /Anterior/i }).click(),
      ]);
      await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

      await Promise.all([
        page.waitForURL(SLUG_2_URL, { timeout: 15_000 }),
        clicarProximaQuestao(page),
      ]);
      await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    }
  });
});

/**
 * Fase 3.2: page=2, dots, resposta errada, history e cold load.
 */
test.describe('Estudar — page, dots, history (Fase 3.2)', () => {
  test.describe.configure({ mode: 'serial' });

  test('API preserva page=2 no payload de navegação', async ({ request }) => {
    const res = await request.get(
      `/api/estudar/questao?slug=${E2E_ESTUDAR_SLUG_1}&banca=${BANCA_QUERY}&page=2`,
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.vitrineQuerySuffix).toContain('page=2');
    expect(body.proximaSlug).toContain('page=2');
    expect(body.proximaSlug).toContain(E2E_ESTUDAR_SLUG_2);
  });

  test('vitrine page=2 → questão → próxima mantém page e botões habilitados', async ({ page }) => {
    await gotoVitrinePage2(page);
    expect(isVitrineUrl(page.url(), { page: '2' })).toBe(true);

    await garantirPainelAssuntoAberto(page, E2E_ESTUDAR_TITULO_AULA_PAGE2);
    const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();
    await entrar.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_1, { page: '2' }), {
        timeout: 15_000,
      }),
      entrar.click(),
    ]);
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
    await expectNavButtonsReady(page);

    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_2, { page: '2' }), {
        timeout: 15_000,
      }),
      clicarProximaQuestao(page),
    ]);
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    expect(isQuestaoUrl(page.url(), E2E_ESTUDAR_SLUG_2, { page: '2' })).toBe(true);
    await expectNavButtonsReady(page, { requireProxima: false });
  });

  test('navegação por dot (questão 2) preserva page=2', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}&page=2`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    const dotQuestao2 = page.getByRole('button', { name: 'Questão 2', exact: true });
    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_2, { page: '2' }), {
        timeout: 15_000,
      }),
      dotQuestao2.click(),
    ]);

    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    expect(isQuestaoUrl(page.url(), E2E_ESTUDAR_SLUG_2, { page: '2' })).toBe(true);
    await expectNavButtonsReady(page, { requireProxima: false });
  });

  test('resposta incorreta exibe gabarito', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}&page=2`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await selecionarAlternativaB(page);
    await confirmarRespostaIncorreta(page);

    await expect(page.getByRole('button', { name: /Ativar Estudo Reverso/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('radio', { name: /Alternativa B:.*atropina/i }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('browser back/forward após soft-nav preserva vitrine page=2 e questão', async ({ page }) => {
    await gotoVitrinePage2(page);
    await garantirPainelAssuntoAberto(page, E2E_ESTUDAR_TITULO_AULA_PAGE2);

    const entrar = page.getByRole('link', { name: 'Entrar no assunto' }).first();
    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_1, { page: '2' }), {
        timeout: 15_000,
      }),
      entrar.click(),
    ]);
    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_2, { page: '2' }), {
        timeout: 15_000,
      }),
      clicarProximaQuestao(page),
    ]);
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });

    // Soft-nav usa replaceState: voltar retorna à vitrine (entrada anterior no histórico).
    await page.goBack();
    await page.waitForURL((url) => isVitrineUrl(url, { page: '2' }), { timeout: 15_000 });
    await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA_PAGE2)).toBeVisible({ timeout: 15_000 });

    await page.goForward();
    await page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_2, { page: '2' }), {
      timeout: 15_000,
    });
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    await expectNavButtonsReady(page, { requireProxima: false });
  });

  test('cold load direto em /estudar/[slug]?page=2 carrega e navega', async ({ page }) => {
    await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}&page=2`, {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 15_000 });
    expect(isQuestaoUrl(page.url(), E2E_ESTUDAR_SLUG_1, { page: '2' })).toBe(true);
    await expectNavButtonsReady(page);

    await Promise.all([
      page.waitForURL((url) => isQuestaoUrl(url, E2E_ESTUDAR_SLUG_2, { page: '2' }), {
        timeout: 15_000,
      }),
      clicarProximaQuestao(page),
    ]);
    await expect(page.getByText(/Questão E2E 2:/)).toBeVisible({ timeout: 15_000 });
    expect(isQuestaoUrl(page.url(), E2E_ESTUDAR_SLUG_2, { page: '2' })).toBe(true);
    await expectNavButtonsReady(page, { requireProxima: false });

    await page.getByRole('button', { name: 'Vitrine' }).click();
    await page.waitForURL((url) => isVitrineUrl(url, { page: '2' }), { timeout: 15_000 });
  });
});
