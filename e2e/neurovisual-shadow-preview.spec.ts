import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

type Manifest = {
  cohort_id: string;
  members: Array<{ question_slug: string; source_path: string }>;
};

const CAPTURE_ROOT = path.join(
  process.cwd(),
  "artifacts/neurovisual/saude-da-mulher-anchors-v1",
  "shadow-v1b-parto-generalization",
  "captures",
);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(
      process.cwd(),
      "data/neurovisual/cohorts/saude-da-mulher-anchors-v1/manifest.json",
    ),
    "utf8",
  ),
) as Manifest;
const SAMPLE_SLUGS = new Set(["admtec-saude-mulher-parto-humanizado-vf"]);
const sampleMembers = manifest.members.filter((member) =>
  SAMPLE_SLUGS.has(member.question_slug),
);

async function gotoAnchor(page: Page, slug: string): Promise<void> {
  await page.goto(
    `/dev/neurovisual-shadow?anchor=${encodeURIComponent(slug)}`,
    {
      waitUntil: "domcontentloaded",
      timeout: 180_000,
    },
  );
  const root = page.getByTestId("neurovisual-shadow-root");
  try {
    await expect(root).toBeVisible({ timeout: 20_000 });
  } catch {
    // Recupera uma única perda de chunk do `next dev`; falha persistente continua vermelha.
    await page.reload({ waitUntil: "domcontentloaded", timeout: 180_000 });
    await expect(root).toBeVisible({ timeout: 120_000 });
  }
  await expect(page.getByTestId("legacy-loading")).toHaveCount(0, {
    timeout: 120_000,
  });
  await expect(page.locator('[data-testid^="slide-pair-"]')).toHaveCount(4);
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const documentOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 2,
  );
  expect(documentOverflow).toBe(false);
  const overflowingPanels = await page
    .locator("[data-overflow-check]")
    .evaluateAll((elements) =>
      elements
        .filter((element) => element.scrollWidth > element.clientWidth + 2)
        .map((element) => ({
          testid: element.getAttribute("data-testid"),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        })),
    );
  expect(overflowingPanels).toEqual([]);
}

async function assertWcagAA(page: Page): Promise<void> {
  const failures = await page
    .locator("[data-aa-contrast]")
    .evaluateAll((elements) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const rgb = (value: string): [number, number, number] => {
        if (!context) return [0, 0, 0];
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "#000000";
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const channels = context.getImageData(0, 0, 1, 1).data;
        return [channels[0], channels[1], channels[2]];
      };
      const luminance = ([red, green, blue]: [number, number, number]) => {
        const linear = [red, green, blue].map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const ratio = (foreground: string, background: string) => {
        const foregroundLuminance = luminance(rgb(foreground));
        const backgroundLuminance = luminance(rgb(background));
        const lighter = Math.max(foregroundLuminance, backgroundLuminance);
        const darker = Math.min(foregroundLuminance, backgroundLuminance);
        return (lighter + 0.05) / (darker + 0.05);
      };

      return elements.flatMap((element) => {
        const style = window.getComputedStyle(element);
        const contrast = ratio(style.color, style.backgroundColor);
        return contrast < 4.5
          ? [
              {
                text: element.textContent?.trim().slice(0, 80),
                contrast,
                color: style.color,
                background: style.backgroundColor,
              },
            ]
          : [];
      });
    });
  expect(failures).toEqual([]);
}

async function assertNoOverlap(
  page: Page,
  firstTestId: string,
  secondTestId: string,
): Promise<void> {
  const first = await page.getByTestId(firstTestId).boundingBox();
  const second = await page.getByTestId(secondTestId).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  if (!first || !second) return;
  const overlaps = !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
  expect(overlaps).toBe(false);
}

async function capturePairs(
  page: Page,
  slug: string,
  viewport: string,
): Promise<void> {
  // Exclui somente a UI do servidor Next dev das evidências; não mascara a aplicação.
  await page.addStyleTag({
    content:
      "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }",
  });
  for (let index = 1; index <= 4; index += 1) {
    const pair = page.getByTestId(`slide-pair-${index}`);
    await pair.scrollIntoViewIfNeeded();
    await pair.screenshot({
      path: path.join(CAPTURE_ROOT, `${slug}-${viewport}-slide${index}.png`),
      type: "png",
      animations: "disabled",
    });
    await page.getByTestId(`v1-slide-${index}`).screenshot({
      path: path.join(CAPTURE_ROOT, `${slug}-${viewport}-slide${index}-v1.png`),
      type: "png",
      animations: "disabled",
    });
  }
}

test.describe("NeuroVisual Lote 1B — fundação editorial isolada", () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== "chromium");
    fs.mkdirSync(CAPTURE_ROOT, { recursive: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("coorte fechada, metadados externos e fallback integral", async ({
    page,
  }) => {
    expect(manifest.cohort_id).toBe("saude-da-mulher-anchors-v1");
    expect(manifest.members).toHaveLength(6);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoAnchor(page, manifest.members[0].question_slug);
    await expect(
      page.getByTestId("anchor-select").locator("option"),
    ).toHaveCount(6);
    await expect(page.getByText("rollout off", { exact: true })).toBeVisible();
    await expect(page.getByText("plan_id", { exact: true })).toBeVisible();
    await expect(page.getByText("content_hash", { exact: true })).toBeVisible();
    await expect(page.getByText("profile_hash", { exact: true })).toBeVisible();
    await expect(page.getByTestId("nv-codes")).toContainText("NV_ROLLOUT_OFF");

    await page.getByTestId("force-fallback").click();
    await expect(
      page.locator('[data-testid^="v1-slide-"][data-renderer="legacy"]'),
    ).toHaveCount(4);
    await expect(
      page.locator('[data-testid^="v1-slide-"][data-renderer="plan-v1"]'),
    ).toHaveCount(0);
    await expect(page.getByTestId("nv-codes")).toContainText(
      "NV_BINDING_INVALID",
    );
  });

  for (const member of sampleMembers) {
    test(`${member.question_slug} — 4/4 desktop, static complete e captures`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await gotoAnchor(page, member.question_slug);
      await expect(page.locator('[data-testid^="legacy-slide-"]')).toHaveCount(
        4,
      );
      await expect(
        page.locator('[data-testid^="v1-slide-"][data-renderer="plan-v1"]'),
      ).toHaveCount(4);

      const plan = JSON.parse(
        fs.readFileSync(
          path.join(
            process.cwd(),
            "data/neurovisual/runtime-plans/saude-da-mulher-anchors-v1",
            `${member.question_slug}.runtime-plan.json`,
          ),
          "utf8",
        ),
      ) as {
        slides: Array<{
          editorial_synthesis?: {
            headline: { text: string };
            mnemonic?: { text: string };
          };
        }>;
      };
      for (let index = 0; index < 4; index += 1) {
        const synthesis = plan.slides[index].editorial_synthesis;
        expect(synthesis).toBeDefined();
        if (synthesis) {
          await expect(page.getByTestId(`v1-slide-${index + 1}`)).toContainText(
            synthesis.headline.text,
          );
          if (synthesis.mnemonic) {
            await expect(
              page.getByTestId(`v1-slide-${index + 1}`),
            ).toContainText(synthesis.mnemonic.text);
          }
        }
      }
      await expect(
        page.locator('[data-interaction-policy="static_complete"]'),
      ).toHaveCount(4);
      await expect(
        page.locator('[data-internal-action-count="0"]'),
      ).toHaveCount(4);
      await expect(
        page.locator('[data-initial-state="fully_revealed"]'),
      ).toHaveCount(4);
      await expect(page.locator('[data-hidden-content="false"]')).toHaveCount(
        4,
      );
      await expect(
        page.locator('[data-player-navigation-only="true"]'),
      ).toHaveCount(4);
      await expect(
        page.locator('[data-visual-sample="editorial-foundation-v1"]'),
      ).toHaveCount(4);
      await expect(page.locator("[data-editorial-canvas]")).toHaveCount(4);
      await expect(page.getByTestId("parto-assertion-i")).toContainText("CTG contínuo para todas");
      await expect(page.getByTestId("parto-assertion-i")).toContainText("Indicação seletiva");
      await expect(page.getByTestId("parto-assertion-ii")).toContainText("VERDADEIRA");
      await expect(page.getByTestId("parto-assertion-iii")).toContainText("Supina única");
      await expect(page.getByTestId("parto-assertion-iii")).toContainText("Vertical/lateral permitidas");
      await expect(page.getByTestId("parto-assertion-iv")).toContainText("um a três minutos");
      await expect(page.getByTestId("parto-answer-destination")).toContainText("B");
      await expect(page.getByTestId("parto-answer-destination")).toContainText("II e IV, apenas");
      await expect(page.getByTestId("parto-practice-clamping-practice")).toContainText("1–3");
      await expect(page.getByTestId("parto-practice-monitoring-practice")).toContainText("não rotina contínua universal");
      for (let index = 1; index <= 4; index += 1) {
        const v1 = page.getByTestId(`v1-slide-${index}`);
        await expect(
          v1.locator('button, [role="button"], details, summary'),
        ).toHaveCount(0);
        await expect(v1.locator("[data-editorial-canvas]")).not.toContainText(
          "plan_id",
        );
        const canvasOverflow = await v1
          .locator("[data-editorial-canvas]")
          .evaluate((canvas) => ({
            horizontal: canvas.scrollWidth > canvas.clientWidth + 1,
            vertical: canvas.scrollHeight > canvas.clientHeight + 1,
          }));
        expect(canvasOverflow, `slide ${index} canvas overflow`).toEqual({
          horizontal: false,
          vertical: false,
        });
        const clippedText = await v1
          .locator("[data-editorial-canvas]")
          .evaluate((canvas) => {
            const canvasRect = canvas.getBoundingClientRect();
            const walker = document.createTreeWalker(
              canvas,
              NodeFilter.SHOW_TEXT,
            );
            const clipped: string[] = [];
            let node = walker.nextNode();
            while (node) {
              const text = node.textContent?.trim();
              if (text) {
                const range = document.createRange();
                range.selectNodeContents(node);
                const rect = range.getBoundingClientRect();
                if (
                  rect.width > 0 &&
                  rect.height > 0 &&
                  (rect.left < canvasRect.left - 2 ||
                    rect.right > canvasRect.right + 2 ||
                    rect.top < canvasRect.top - 2 ||
                    rect.bottom > canvasRect.bottom + 2)
                ) {
                  clipped.push(text);
                }
              }
              node = walker.nextNode();
            }
            return clipped;
          });
        expect(clippedText).toEqual([]);
        const internalScrollers = await v1.locator("*").evaluateAll(
          (elements) =>
            elements.filter((element) => {
              const style = window.getComputedStyle(element);
              return (
                (style.overflowY === "auto" || style.overflowY === "scroll") &&
                element.scrollHeight > element.clientHeight + 1
              );
            }).length,
        );
        expect(internalScrollers).toBe(0);
      }
      await assertWcagAA(page);
      await assertNoHorizontalOverflow(page);
      await capturePairs(page, member.question_slug, "desktop");
    });

    for (const width of [375, 419]) {
      test(`${member.question_slug} — ${width}px sem corte ou overlap`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoAnchor(page, member.question_slug);
        await page.getByTestId("viewport-mobile").click();
        await assertNoHorizontalOverflow(page);
        await assertWcagAA(page);
        await expect(page.getByTestId("parto-answer-destination")).toContainText("II e IV, apenas");

        for (let index = 1; index <= 4; index += 1) {
          const legacy = page.getByTestId(`legacy-slide-${index}`);
          const v1 = page.getByTestId(`v1-slide-${index}`);
          const legacyBox = await legacy.boundingBox();
          const v1Box = await v1.boundingBox();
          expect(legacyBox).not.toBeNull();
          expect(v1Box).not.toBeNull();
          if (legacyBox && v1Box) {
            expect(legacyBox.x).toBeGreaterThanOrEqual(0);
            expect(v1Box.x).toBeGreaterThanOrEqual(0);
            expect(legacyBox.x + legacyBox.width).toBeLessThanOrEqual(
              width + 1,
            );
            expect(v1Box.x + v1Box.width).toBeLessThanOrEqual(width + 1);
            expect(v1Box.y).toBeGreaterThanOrEqual(
              legacyBox.y + legacyBox.height - 1,
            );
          }
        }

        await capturePairs(page, member.question_slug, `mobile-${width}`);
      });
    }
  }
});
