export type DeviceFrameVariant = 'phone' | 'tablet' | 'laptop';

/** Área da tela em % do viewBox do SVG (conteúdo React encaixa aqui). */
export type DeviceScreenInset = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
};

export type DeviceSvgLayout = {
  viewBox: { w: number; h: number };
  aspectRatio: number;
  screen: DeviceScreenInset;
  logicalWidth: number;
  logicalHeight: number;
};

export const DEVICE_SVG_LAYOUTS: Record<DeviceFrameVariant, DeviceSvgLayout> = {
  phone: {
    viewBox: { w: 390, h: 780 },
    aspectRatio: 390 / 780,
    screen: {
      top: 1.54,
      left: 3.08,
      width: 93.85,
      height: 96.92,
      borderRadius: '2.75rem',
    },
    logicalWidth: 390,
    logicalHeight: 640,
  },
  /** iPad portrait — estilo Estudei (alto, distinto do phone). */
  tablet: {
    viewBox: { w: 560, h: 720 },
    aspectRatio: 560 / 720,
    screen: {
      top: 2.22,
      left: 2.86,
      width: 94.29,
      height: 95.56,
      borderRadius: '1.25rem',
    },
    logicalWidth: 560,
    logicalHeight: 520,
  },
  laptop: {
    viewBox: { w: 960, h: 580 },
    aspectRatio: 960 / 580,
    screen: {
      top: 8.97,
      left: 2.08,
      width: 95.83,
      height: 62.07,
      borderRadius: '0.375rem',
    },
    logicalWidth: 900,
    logicalHeight: 380,
  },
};
