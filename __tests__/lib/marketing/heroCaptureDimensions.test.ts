import {
  HERO_CAPTURE_DPR,
  heroCaptureScreenCss,
  heroCaptureScreenPx,
} from '@/lib/marketing/heroCaptureDimensions';

describe('heroCaptureDimensions', () => {
  it('alinha proporção da captura com a área útil do DeviceFrame', () => {
    const laptop = heroCaptureScreenCss('laptop');
    expect(laptop.width).toBe(920);
    expect(laptop.height).toBe(360);
    expect(laptop.width / laptop.height).toBeCloseTo(920 / 360, 2);

    const tablet = heroCaptureScreenCss('tablet');
    expect(tablet.width).toBe(528);
    expect(tablet.height).toBe(688);

    const phone = heroCaptureScreenCss('phone');
    expect(phone.width).toBe(366);
    expect(phone.height).toBe(756);
  });

  it('multiplica dimensões pelo DPR da captura Playwright', () => {
    expect(heroCaptureScreenPx('laptop')).toEqual({
      width: 920 * HERO_CAPTURE_DPR,
      height: 360 * HERO_CAPTURE_DPR,
    });
  });
});
