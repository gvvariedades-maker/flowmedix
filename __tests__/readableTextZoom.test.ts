import {
  TEXT_SCALE_STEPS,
  computeZoomInnerWidthPx,
} from '@/components/accessibility/ReadableTextZoom';

describe('ReadableTextZoom — zoom mobile', () => {
  it('expõe escala em 5 degraus crescentes', () => {
    expect(TEXT_SCALE_STEPS).toHaveLength(5);
    expect(TEXT_SCALE_STEPS[0]).toBe(1);
    expect(TEXT_SCALE_STEPS[TEXT_SCALE_STEPS.length - 1]).toBeGreaterThan(1);
  });

  it('computeZoomInnerWidthPx retorna null em escala 1', () => {
    expect(computeZoomInnerWidthPx(360, 1)).toBeNull();
    expect(computeZoomInnerWidthPx(0, 1.48)).toBeNull();
  });

  it('computeZoomInnerWidthPx reduz largura lógica para caber após zoom', () => {
    expect(computeZoomInnerWidthPx(360, 1.48)).toBe(243);
    expect(computeZoomInnerWidthPx(320, 1.24)).toBe(258);
  });

  it('computeZoomInnerWidthPx nunca retorna menos que 1px', () => {
    expect(computeZoomInnerWidthPx(1, 2)).toBe(1);
  });
});
