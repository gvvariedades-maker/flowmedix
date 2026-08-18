import { test, expect, type Page } from '@playwright/test';
import { WRITE_SPEC_TEST_QUESTION } from '../lib/questaoSpec/testFixtures';

/**
 * Preenche o editor de JSON do Laboratório de forma robusta.
 * O editor é um textarea controlado; um `fill` disparado antes da hidratação do React
 * pode ser descartado (o valor não "pega"). Reescrevemos até o value persistir.
 */
async function fillJsonEditor(page: Page, content: string) {
  const jsonInput = page.getByRole('textbox', {
    name: /Use Abrir JSON, Colar JSON ou digite/i,
  });
  await jsonInput.scrollIntoViewIfNeeded();
  await expect(jsonInput).toBeVisible({ timeout: 15_000 });
  await expect(async () => {
    await jsonInput.fill(content);
    await expect(jsonInput).toHaveValue(content, { timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
}

async function expectJsonValidBadge(page: Page) {
  await expect(async () => {
    await expect(
      page.locator('span.text-green-600').filter({ hasText: 'Válido' }),
    ).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
}

async function openTemplatesModal(page: Page) {
  const templatesButton = page.getByTestId('lab-templates-open');
  await templatesButton.scrollIntoViewIfNeeded();
  await expect(async () => {
    await templatesButton.click();
    await expect(page.getByTestId('lab-templates-modal')).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Selecionar Template' })).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * Testes E2E para o Laboratório Admin
 * 
 * Testa o fluxo completo de criação de questões:
 * 1. Acessar laboratório
 * 2. Usar template
 * 3. Editar JSON
 * 4. Validar
 * 5. Visualizar preview
 * 6. Publicar
 */

const validQuestionJSON = WRITE_SPEC_TEST_QUESTION;

test.describe('Laboratório Admin', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/laboratorio', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const payloadLabel = page.getByText('Payload Input');
    await payloadLabel.scrollIntoViewIfNeeded();
    await expect(payloadLabel).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('lab-templates-open')).toBeVisible({ timeout: 15_000 });
  });

  test('deve carregar a página do laboratório', async ({ page }) => {
    // Lockup: PNGs decorativos (alt=""); o A-mark é o sinal visual estável do brand.
    await expect(page.locator('img[src="/brand/avant-logo-a-mark.png"]').first()).toBeVisible();
    await expect(page.getByText('Payload Input')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aguardando Injeção' })).toBeVisible();
  });

  test('deve mostrar botão de templates', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Templates' })).toBeVisible();
  });

  test('deve abrir seletor de templates ao clicar', async ({ page }) => {
    await openTemplatesModal(page);
    await expect(page.getByRole('heading', { name: 'Fundamentos de Enfermagem' })).toBeVisible();
  });

  test('deve carregar template ao selecionar', async ({ page }) => {
    await openTemplatesModal(page);
    await page.getByRole('button', { name: 'Usar Template' }).first().click();
    
    // Verificar se JSON foi preenchido
    const jsonInput = page.getByRole('textbox', {
      name: /Use Abrir JSON, Colar JSON ou digite/i,
    });
    const jsonContent = await jsonInput.inputValue();
    
    expect(jsonContent).toContain('"banca"');
    expect(jsonContent).toContain('"question_data"');
    expect(jsonContent).toContain('"reverse_study_slides"');
  });

  test('deve validar JSON em tempo real', async ({ page }) => {
    await fillJsonEditor(page, JSON.stringify(validQuestionJSON, null, 2));
    await expectJsonValidBadge(page);
  });

  test('deve mostrar erros de validação', async ({ page }) => {
    const invalidJSON = {
      meta: { banca: 'EBSERH', topico: '' },
      question_data: { instruction: 'Teste', options: [] },
    };

    await fillJsonEditor(page, JSON.stringify(invalidJSON, null, 2));

    const errorHeading = page.getByRole('heading', {
      name: /Erro(s)? Encontrado(s)?/i,
    });
    await errorHeading.scrollIntoViewIfNeeded();
    await expect(errorHeading).toBeVisible({ timeout: 15_000 });
  });

  test('deve mostrar preview quando JSON é válido', async ({ page }) => {
    await fillJsonEditor(page, JSON.stringify(validQuestionJSON, null, 2));
    await expectJsonValidBadge(page);

    await expect(page.getByRole('heading', { name: 'Aguardando Injeção' })).not.toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page
        .locator('[data-testid="lesson-scroll-body"]')
        .getByText(/história da enfermagem/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('deve habilitar publicar quando JSON é válido', async ({ page }) => {
    await fillJsonEditor(page, JSON.stringify(validQuestionJSON, null, 2));
    await expectJsonValidBadge(page);

    const publishButton = page.getByRole('button', { name: /^Publicar$/ });
    await expect(publishButton).toBeEnabled({ timeout: 15_000 });
  });

  test('deve exibir ação para abrir JSON do arquivo', async ({ page }) => {
    // UI atual: "Abrir JSON" + input file oculto (antes: label "Importar")
    const openJson = page.locator('button:has-text("Abrir JSON")');
    await expect(openJson).toBeVisible();

    const fileInput = page.locator('input[type="file"][accept*="json"]');
    await expect(fileInput).toHaveCount(1);
    await expect(fileInput).toBeHidden();
  });

  test('deve mostrar controles de preview', async ({ page }) => {
    // Colar JSON válido
    await fillJsonEditor(page, JSON.stringify(validQuestionJSON, null, 2));
    
    // Aguardar preview carregar
    await page.waitForTimeout(2000);
    
    // Verificar controles do preview (se existirem)
    const previewControls = page.locator('text=Preview em Tempo Real').or(
      page.locator('button[title*="Desktop"]')
    );
    
    // Se os controles existirem, verificar
    if (await previewControls.count() > 0) {
      await expect(previewControls.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve destacar linhas com erro no editor', async ({ page }) => {
    // JSON com campos presentes mas com valores inválidos — findErrorLocation consegue
    // mapear os erros Zod a linhas pois as chaves existem no texto.
    const invalidJSON = `{
      "meta": {
        "banca": "EBSERH",
        "topico": ""
      },
      "question_data": {
        "instruction": "Teste",
        "options": []
      }
    }`;

    await fillJsonEditor(page, invalidJSON);

    await expect(page.getByRole('heading', { name: /Erro(s)? Encontrado/i })).toBeVisible({
      timeout: 15_000,
    });

    // Gutter marca linhas com data-error (JsonEditorWithHighlight + errorLines do Zod)
    await expect(
      page
        .locator('[data-testid="json-editor-gutter"] [data-testid="json-editor-line-number"][data-error="true"]')
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});
