import { ImageResponse } from 'next/og';
import {
  AVANT_LOGO_BOLT,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_GRADIENTS,
} from '@/lib/brand/avantLogoConstants';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const AVANT_BOLT_CLIP_PATH =
  'polygon(57.9% 0%, 21.1% 47.6%, 39.5% 47.6%, 26.3% 100%, 78.9% 38.1%, 47.4% 38.1%)';

export default function AppleIcon() {
  const chip = 76;
  const chipRadius = 19;
  const boltW = 38;
  const boltH = Math.round(boltW * (AVANT_LOGO_BOLT.height / AVANT_LOGO_BOLT.width));
  const sheenHeight = 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#010409',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: chip,
            height: chip,
            borderRadius: chipRadius,
            background: AVANT_LOGO_GRADIENTS.icon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 0 14px rgba(143, 224, 32, 0.35), 0 4px 16px rgba(48, 24, 200, 0.35)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: sheenHeight,
              borderRadius: `${chipRadius}px ${chipRadius}px 0 0`,
              background: AVANT_LOGO_COLORS.iconSheen,
            }}
          />
          <div
            style={{
              width: boltW,
              height: boltH,
              background: AVANT_LOGO_GRADIENTS.bolt,
              clipPath: AVANT_BOLT_CLIP_PATH,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
