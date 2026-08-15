import { expect, test, type Page } from '@playwright/test';
import { E2E_DESEMPENHO_TITULO_AULA } from '../lib/e2e/constants';

/**
 * Hub `/desempenho` (aba Estudo): navegação semântica, ordem decisão-antes-de-detalhe,
 * hierarquia progressiva, filtros pela URL e zero rolagem horizontal em 320–412 px.
 * Seed in-memory quando E2E_DASHBOARD_BYPASS=true (playwright.config).
 */

const ASSUNTO_ENCODED = encodeURIComponent(E2E_DESEMPENHO_TITULO_AULA);
const DEEP_LINK_PRATICA = `/estudar?assunto=${ASSUNTO_ENCODED}&status=pending`;

/**
 * Clica até o estado esperado aparecer.
 *
 * Em `next dev` o primeiro clique pode chegar antes da hidratação (no-op).
 * Reclicar é seguro porque, sem hidratação, nada alterna.
 */
async function clicarAte(page: Page, seletor: string, verificar: () => Promise<void>) {
  await expect(async () => {
    await page.locator(seletor).first().click();
    await verificar();
  }).toPass({ timeout: 45_000 });
}

/**
 * Mede rolagem horizontal de um hub (`data-desempenho-hub`).
 *
 * Culpados = elementos que passam da borda direita da viewport. Texto clipado
 * por `truncate` não conta: fica escondido, não rolável.
 */
async function medirOverflow(page: Page, hubId: 'estudo' | 'simulados' | 'atividade') {
  return page.evaluate((id) => {
    const doc = document.documentElement;
    const hub = document.querySelector<HTMLElement>(`[data-desempenho-hub="${id}"]`);
    const culpados = [...(hub?.querySelectorAll<HTMLElement>('*') ?? [])]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 120));
    return {
      hubEncontrado: !!hub,
      hubScrollWidth: hub?.scrollWidth ?? 0,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      culpados,
    };
  }, hubId);
}

/**
 * Gatilho do reset no rodapé de privacidade.
 *
 * O CTA de confirmação dentro do diálogo repete o mesmo rótulo (ação destrutiva
 * autoexplicativa), então o gatilho precisa ser escopado ao rodapé.
 */
function gatilhoZerar(page: Page) {
  return page
    .locator('footer', { hasText: 'Privacidade e dados' })
    .getByRole('button', { name: 'Zerar desempenho de estudo' });
}

/** Abre o painel de filtros quando a viewport é mobile (disclosure `Filtrar`). */
async function abrirFiltros(page: Page) {
  const botao = page.getByRole('button', { name: /Filtrar/ });
  if (!(await botao.isVisible())) return;
  await expect(async () => {
    await botao.click();
    await expect(botao).toHaveAttribute('aria-expanded', 'true');
  }).toPass({ timeout: 45_000 });
}

test.describe('Hub Desempenho (estudo)', () => {
  test.describe.configure({ mode: 'serial' });

  test('navegação é por links com aria-current, não tablist', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Meu desempenho' })).toBeVisible({
      timeout: 60_000,
    });

    const nav = page.getByRole('navigation', { name: 'Seções de desempenho' });
    await expect(nav).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Estudo' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: 'Simulados' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('decisão antes do detalhe: placar, próxima ação e panoramas em ordem', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    const placar = page.getByLabel('Placar de estudo');
    await expect(placar).toBeVisible({ timeout: 60_000 });
    await expect(placar.getByText('Questões analisadas')).toBeVisible();
    await expect(placar.getByText('% acerto')).toBeVisible();
    await expect(placar.getByText('Praticadas hoje')).toBeVisible();

    const titulos = await page.locator('main h2, h2').allTextContents();
    const relevantes = titulos.map((t) => t.trim());
    expect(relevantes.indexOf('Próximos focos')).toBeGreaterThanOrEqual(0);
    expect(relevantes.indexOf('Próximos focos')).toBeLessThan(
      relevantes.indexOf('Panorama por áreas'),
    );
    expect(relevantes.indexOf('Panorama por áreas')).toBeLessThan(
      relevantes.indexOf('Questões praticadas recentemente'),
    );

    // Jargão interno não pode aparecer para o aluno.
    await expect(page.getByText(/Evidence Engine|ledger|upsert/i)).toHaveCount(0);
  });

  test('CTA curto leva à vitrine filtrada pelo assunto', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    const cta = page.getByRole('link', {
      name: `Testar em outra questão de ${E2E_DESEMPENHO_TITULO_AULA}`,
    });
    await expect(cta).toBeVisible({ timeout: 60_000 });
    await expect(cta).toHaveText('Testar em outra questão');
    await expect(cta).toHaveAttribute('href', DEEP_LINK_PRATICA);

    // Nome longo do assunto fica no conteúdo, não no rótulo do botão.
    await expect(page.getByRole('link', { name: /Praticar agora/ })).toHaveCount(0);
  });

  test('hierarquia abre os assuntos da área em um toque', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Panorama por áreas' })).toBeVisible({
      timeout: 60_000,
    });

    const toggle = page.locator('button[aria-controls^="area-assuntos-"]').first();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await clicarAte(page, 'button[aria-controls^="area-assuntos-"]', async () => {
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
    await expect(page.getByText(E2E_DESEMPENHO_TITULO_AULA).first()).toBeVisible();

    await clicarAte(page, 'button:has-text("Ver mapa completo")', async () => {
      await expect(page.getByRole('button', { name: 'Recolher mapa' })).toBeVisible();
    });
  });

  test('marcar assunto abre a barra de caderno acima da bottom nav', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Panorama por áreas' })).toBeVisible({
      timeout: 60_000,
    });
    const barra = page.getByRole('region', { name: 'Assuntos selecionados' });
    await expect(barra).toHaveCount(0);

    await clicarAte(page, 'button[aria-controls^="area-assuntos-"]', async () => {
      await expect(
        page.getByRole('checkbox', { name: E2E_DESEMPENHO_TITULO_AULA }),
      ).toBeVisible();
    });
    await page.getByRole('checkbox', { name: E2E_DESEMPENHO_TITULO_AULA }).check();

    await expect(barra).toBeVisible();
    await expect(barra).toContainText('1 assunto selecionado');
    await expect(barra).toContainText('O caderno recebe só questões desses assuntos.');

    // Alvos de toque e barra dentro da viewport (não cobre a bottom nav).
    for (const nome of [/Limpar/, /Criar caderno/]) {
      const box = await barra.getByRole('button', { name: nome }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const caixaBarra = await barra.boundingBox();
    expect((caixaBarra?.x ?? -1)).toBeGreaterThanOrEqual(0);
    expect((caixaBarra?.x ?? 0) + (caixaBarra?.width ?? 0)).toBeLessThanOrEqual(390);

    await barra.getByRole('button', { name: /Limpar/ }).click();
    await expect(barra).toHaveCount(0);
  });

  test('filtro de período é deep link compartilhável', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Filtros de desempenho')).toBeVisible({ timeout: 60_000 });

    await abrirFiltros(page);
    await page.getByRole('link', { name: '7 dias' }).click();
    await expect(page).toHaveURL(/periodo=7d/, { timeout: 30_000 });

    // Recarregar pela URL mantém o filtro aplicado (RSC lê searchParams).
    await page.goto('/desempenho?periodo=7d', { waitUntil: 'domcontentloaded' });
    await abrirFiltros(page);
    await expect(page.getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(page.getByText(/7 dias · \d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  });

  const VIEWPORTS = [
    { width: 320, height: 800 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 412, height: 800 },
  ] as const;

  for (const { width, height } of VIEWPORTS) {
    test(`sem rolagem horizontal em ${width}×${height}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height });
      await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });
      await expect(page.getByLabel('Placar de estudo')).toBeVisible({ timeout: 60_000 });

      // Expandir tudo: overflow costuma aparecer só com o conteúdo profundo visível.
      await clicarAte(page, 'button:has-text("Ver mapa completo")', async () => {
        await expect(page.getByRole('button', { name: 'Recolher mapa' })).toBeVisible();
      });
      await abrirFiltros(page);

      const overflow = await medirOverflow(page, 'estudo');

      expect(overflow.hubEncontrado).toBe(true);
      expect(overflow.culpados).toEqual([]);
      expect(overflow.hubScrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
      expect(overflow.scrollWidth).toBe(overflow.clientWidth);
    });
  }

  test('título da tentativa recente não invade a etiqueta em 390×844', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Placar de estudo')).toBeVisible({ timeout: 60_000 });

    const titulo = page.getByTestId('recent-attempt-title').first();
    const badges = page.getByTestId('recent-attempt-badges').first();
    await expect(titulo).toBeVisible();
    await expect(badges).toBeVisible();

    const tituloBox = await titulo.boundingBox();
    const badgesBox = await badges.boundingBox();
    expect(tituloBox).toBeTruthy();
    expect(badgesBox).toBeTruthy();

    const a = tituloBox!;
    const b = badgesBox!;
    const intersectam = !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
    expect(intersectam).toBe(false);
  });

  test('/progresso e /analytics redirecionam para /desempenho', async ({ page }) => {
    await page.goto('/progresso', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/desempenho/, { timeout: 15_000 });

    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/desempenho/, { timeout: 15_000 });
  });

  test('Atividade e Simulados navegam pelo hub', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho', { waitUntil: 'domcontentloaded' });

    const nav = page.getByRole('navigation', { name: 'Seções de desempenho' });
    await expect(nav.getByRole('link', { name: 'Estudo' })).toBeVisible({ timeout: 30_000 });

    await nav.getByRole('link', { name: 'Atividade' }).click();
    await expect(page).toHaveURL(/\/desempenho\/atividade/, { timeout: 30_000 });
    await expect(nav.getByRole('link', { name: 'Atividade' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await nav.getByRole('link', { name: 'Simulados' }).click();
    await expect(page).toHaveURL(/\/desempenho\/simulados/, { timeout: 30_000 });
    await expect(nav.getByRole('link', { name: 'Simulados' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

test.describe('Hub Desempenho (simulados)', () => {
  test.describe.configure({ mode: 'serial' });

  test('período é deep link e preserva a dimensão vinda do resultado', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho/simulados?periodo=30d&modo=todos&banca=CPCON', {
      waitUntil: 'domcontentloaded',
    });

    const aplicados = page.getByRole('group', { name: 'Filtros aplicados' });
    await expect(aplicados).toBeVisible({ timeout: 60_000 });
    await expect(aplicados.getByText('Banca: CPCON')).toBeVisible();

    // Trocar período mantém a banca; remover a banca mantém o período.
    await expect(page.getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'href',
      '/desempenho/simulados?periodo=7d&modo=todos&banca=CPCON',
    );
    await expect(aplicados.getByRole('link', { name: /Remover filtro de Banca/ })).toHaveAttribute(
      'href',
      '/desempenho/simulados?periodo=30d&modo=todos',
    );

    await page.getByRole('link', { name: '7 dias' }).click();
    await expect(page).toHaveURL(/periodo=7d.*banca=CPCON/, { timeout: 30_000 });
    await expect(page.getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('compara com "Últimos 12 meses" e não mostra jargão de histórico', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho/simulados', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Resumo comparativo')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('Últimos 12 meses', { exact: true })).toBeVisible();
    await expect(page.getByText('Geral (histórico)')).toHaveCount(0);
  });

  test('sem rolagem horizontal em 320px', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/desempenho/simulados', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Resumo comparativo')).toBeVisible({ timeout: 60_000 });

    const overflow = await medirOverflow(page, 'simulados');
    expect(overflow.hubEncontrado).toBe(true);
    expect(overflow.culpados).toEqual([]);
    expect(overflow.scrollWidth).toBe(overflow.clientWidth);
  });
});

test.describe('Hub Desempenho (atividade)', () => {
  test.describe.configure({ mode: 'serial' });

  test('heatmap é informativo e o reset promete só Estudo', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho/atividade', { waitUntil: 'domcontentloaded' });

    const grade = page.getByRole('grid').first();
    await expect(grade).toBeVisible({ timeout: 60_000 });
    // Células informativas: nada de botão dentro da grade.
    await expect(grade.getByRole('button')).toHaveCount(0);

    await expect(gatilhoZerar(page)).toBeVisible();
  });

  test('diálogo de reset é modal acessível e diz que simulados permanecem', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/desempenho/atividade', { waitUntil: 'domcontentloaded' });

    const abrir = gatilhoZerar(page);
    await expect(abrir).toBeVisible({ timeout: 60_000 });

    const dialog = page.getByRole('dialog');
    await expect(async () => {
      await abrir.click();
      await expect(dialog).toBeVisible();
    }).toPass({ timeout: 45_000 });

    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog.getByText(/simulados/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('sem rolagem horizontal em 320–412 e 390×844', async ({ page }) => {
    test.setTimeout(180_000);
    for (const { width, height } of [
      { width: 320, height: 800 },
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 412, height: 800 },
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/desempenho/atividade', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('grid').first()).toBeVisible({ timeout: 60_000 });

      const overflow = await medirOverflow(page, 'atividade');
      expect(overflow.hubEncontrado).toBe(true);
      expect(overflow.culpados).toEqual([]);
      expect(overflow.scrollWidth).toBe(overflow.clientWidth);
    }
  });
});
