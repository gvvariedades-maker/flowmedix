import { expect, type Page } from '@playwright/test';

export async function expectGabaritoCorreto(page: Page, timeout = 15_000) {
  await expect(page.getByText('Você acertou!')).toBeVisible({ timeout });
}

export async function expectGabaritoIncorreto(page: Page, timeout = 15_000) {
  await expect(page.getByText('Você errou')).toBeVisible({ timeout });
}

/** Zoom mobile: botões A+/A− ficam dentro do popover Aa. */
export async function openQuestionTextZoomPopover(page: Page) {
  await page.getByRole('button', { name: 'Tamanho do texto da questão' }).click();
}
