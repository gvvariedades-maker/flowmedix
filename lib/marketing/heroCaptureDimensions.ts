import {
  DEVICE_SVG_LAYOUTS,
  type DeviceFrameVariant,
} from '@/components/marketing/deviceSvgLayouts';

/** DPR usado em `e2e/capture-hero-mockups.spec.ts` — manter em sync com `heroMockupAssets`. */
export const HERO_CAPTURE_DPR = 2;

/** Proporção da área útil da tela no SVG do device (mesma que `object-cover` no hero). */
export function heroCaptureScreenCss(variant: DeviceFrameVariant): {
  width: number;
  height: number;
} {
  const layout = DEVICE_SVG_LAYOUTS[variant];
  const { w, h } = layout.viewBox;
  const s = layout.screen;
  return {
    width: Math.round((w * s.width) / 100),
    height: Math.round((h * s.height) / 100),
  };
}

/** Dimensões intrínsecas do PNG após captura retina (CSS × DPR). */
export function heroCaptureScreenPx(variant: DeviceFrameVariant): {
  width: number;
  height: number;
} {
  const css = heroCaptureScreenCss(variant);
  return {
    width: css.width * HERO_CAPTURE_DPR,
    height: css.height * HERO_CAPTURE_DPR,
  };
}

/** Canvas de render do player desktop (sidebar + conteúdo). */
export const HERO_CAPTURE_LAPTOP_RENDER = { width: 1440, height: 900 } as const;

/** `aside` do `DashboardShell` — `w-[16rem]`. */
export const HERO_CAPTURE_SIDEBAR_OFFSET_PX = 256;

/** Canvas de render do player mobile. */
export const HERO_CAPTURE_PHONE_RENDER = { width: 390, height: 844 } as const;
