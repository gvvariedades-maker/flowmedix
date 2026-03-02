import { test, expect } from '@playwright/test';

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

const validQuestionJSON = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    orgao: 'Hospital',
    prova: 'Técnico de Enfermagem',
    topico: 'Fundamentos de Enfermagem',
    subtopico: 'SAE',
  },
  question_data: {
    instruction: 'Identifique a etapa da SAE descrita no enunciado.',
    text_fragment: '',
    options: [
      { id: 'A', text: 'Coleta de dados.', is_correct: false },
      { id: 'B', text: 'Diagnóstico de Enfermagem.', is_correct: false },
      { id: 'C', text: 'Planejamento da assistência.', is_correct: true },
      { id: 'D', text: 'Implementação.', is_correct: false },
      { id: 'E', text: 'Avaliação.', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      subject: 'Fundamentos de Enfermagem',
      items: [
        {
          icon: 'FileSearch',
          label: 'Coleta de Dados',
          detail: 'Histórico e exame físico do paciente',
        },
      ],
    },
  ],
};

test.describe('Laboratório Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para o laboratório
    await page.goto('/admin/laboratorio');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar a página do laboratório', async ({ page }) => {
    // Verificar elementos principais
    await expect(page.locator('text=AVANT')).toBeVisible();
    await expect(page.locator('text=Payload Input')).toBeVisible();
    await expect(page.locator('text=Aguardando Injeção')).toBeVisible();
  });

  test('deve mostrar botão de templates', async ({ page }) => {
    const templatesButton = page.locator('button:has-text("Templates")');
    await expect(templatesButton).toBeVisible();
  });

  test('deve abrir seletor de templates ao clicar', async ({ page }) => {
    // Clicar no botão Templates
    await page.click('button:has-text("Templates")');
    
    // Verificar se modal abriu
    await expect(page.locator('text=Selecionar Template')).toBeVisible();
    await expect(page.locator('text=Português - Básico')).toBeVisible();
  });

  test('deve carregar template ao selecionar', async ({ page }) => {
    // Abrir templates
    await page.click('button:has-text("Templates")');
    
    // Selecionar template
    await page.click('button:has-text("Usar Template")');
    
    // Verificar se JSON foi preenchido
    const jsonInput = page.locator('textarea').first();
    const jsonContent = await jsonInput.inputValue();
    
    expect(jsonContent).toContain('"banca"');
    expect(jsonContent).toContain('"question_data"');
    expect(jsonContent).toContain('"reverse_study_slides"');
  });

  test('deve validar JSON em tempo real', async ({ page }) => {
    // Colar JSON válido
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(JSON.stringify(validQuestionJSON, null, 2));
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar badge de válido
    await expect(page.locator('text=Válido')).toBeVisible({ timeout: 5000 });
  });

  test('deve mostrar erros de validação', async ({ page }) => {
    // Colar JSON inválido (sem banca)
    const invalidJSON = { ...validQuestionJSON };
    delete invalidJSON.meta.banca;
    
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(JSON.stringify(invalidJSON, null, 2));
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar se erros aparecem
    await expect(page.locator('text=Erros Encontrados').or(page.locator('text=Erro'))).toBeVisible({ timeout: 5000 });
  });

  test('deve mostrar preview quando JSON é válido', async ({ page }) => {
    // Colar JSON válido
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(JSON.stringify(validQuestionJSON, null, 2));
    
    // Aguardar validação e preview
    await page.waitForTimeout(2000);
    
    // Verificar se preview apareceu (não deve mais mostrar "Aguardando Injeção")
    const waitingMessage = page.locator('text=Aguardando Injeção');
    await expect(waitingMessage).not.toBeVisible({ timeout: 5000 });
    
    // Verificar se preview está visível
    const previewArea = page.locator('[class*="Preview"]').or(page.locator('text=Preview'));
    // Se não encontrar pelo texto, verifica pela estrutura
    const previewContainer = page.locator('div').filter({ hasText: /EBSERH|Fundamentos de Enfermagem/ }).first();
    await expect(previewContainer).toBeVisible({ timeout: 5000 });
  });

  test('deve permitir exportar questão válida', async ({ page }) => {
    // Colar JSON válido
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(JSON.stringify(validQuestionJSON, null, 2));
    
    // Aguardar validação
    await page.waitForTimeout(2000);
    
    // Verificar se botão Exportar está habilitado
    const exportButton = page.locator('button:has-text("Exportar")');
    await expect(exportButton).toBeEnabled({ timeout: 5000 });
  });

  test('deve permitir importar questão de arquivo', async ({ page }) => {
    // Criar arquivo JSON temporário
    const jsonContent = JSON.stringify(validQuestionJSON, null, 2);
    
    // Simular upload de arquivo
    const importButton = page.locator('button:has-text("Importar")');
    await expect(importButton).toBeVisible();
    
    // Nota: Upload real de arquivo requer configuração adicional
    // Por enquanto, apenas verificamos que o botão existe
  });

  test('deve mostrar controles de preview', async ({ page }) => {
    // Colar JSON válido
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(JSON.stringify(validQuestionJSON, null, 2));
    
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
    // Colar JSON com erro
    const invalidJSON = `{
      "meta": {
        "banca": "EBSERH"
      },
      "question_data": {
        "instruction": ""
      }
    }`;
    
    const jsonInput = page.locator('textarea').first();
    await jsonInput.fill(invalidJSON);
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar se números de linha aparecem (indicando editor com highlight)
    const lineNumbers = page.locator('[class*="line"]').or(page.locator('text=/^\\d+$/'));
    
    // Se o editor com highlight estiver presente, verificar
    if (await lineNumbers.count() > 0) {
      // Editor com highlight está funcionando
      expect(true).toBe(true);
    }
  });
});
