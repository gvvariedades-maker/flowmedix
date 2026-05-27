import { ImageResponse } from 'next/og';
import {
  AVANT_LOGO_BOLT,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_GRADIENTS,
} from '@/lib/brand/avantLogoConstants';

export const contentType = 'image/png';

/** clip-path do raio (viewBox 38×42) em porcentagens para Satori. */
const AVANT_BOLT_CLIP_PATH =
  'polygon(57.9% 0%, 21.1% 47.6%, 39.5% 47.6%, 26.3% 100%, 78.9% 38.1%, 47.4% 38.1%)';

export function generateImageMetadata() {
  return [
    {
      id: '192',
      size: { width: 192, height: 192 },
      contentType: 'image/png' as const,
    },
    {
      id: '512',
      size: { width: 512, height: 512 },
      contentType: 'image/png' as const,
    },
  ];
}

type IconProps = {
  id: Promise<string>;
};

function AvantIconMark({ px }: { px: number }) {
  const chip = Math.round(px * 0.42);
  const chipRadius = Math.round(chip * 0.25);
  const boltSize = Math.round(chip * 0.5);
  const sheenHeight = Math.round(chip * 0.42);

  return (
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
          boxShadow: `0 0 ${Math.max(8, Math.round(px * 0.04))}px rgba(143, 224, 32, 0.35), 0 4px 16px rgba(48, 24, 200, 0.35)`,
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
            width: boltSize,
            height: Math.round(boltSize * (AVANT_LOGO_BOLT.height / AVANT_LOGO_BOLT.width)),
            background: AVANT_LOGO_GRADIENTS.bolt,
            clipPath: AVANT_BOLT_CLIP_PATH,
          }}
        />
      </div>
    </div>
  );
}

export default async function Icon({ id }: IconProps) {
  const iconId = await id;
  const px = iconId === '512' ? 512 : 192;

  return new ImageResponse(<AvantIconMark px={px} />, {
    width: px,
    height: px,
  });
}
