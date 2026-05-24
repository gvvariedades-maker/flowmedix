import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

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
  const chip = Math.round(px * 0.375);
  const chipRadius = Math.round(chip * 0.224);
  const boltSize = Math.round(chip * 0.55);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #12082A 0%, #1E0E45 100%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: chip,
          height: chip,
          borderRadius: chipRadius,
          background: '#4B1FA8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: boltSize,
            height: boltSize,
            background: '#E8B800',
            clipPath: 'polygon(50% 8%, 78% 48%, 62% 48%, 68% 92%, 22% 52%, 38% 52%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: Math.round(chip * 0.08),
            right: Math.round(chip * 0.08),
            width: Math.round(chip * 0.12),
            height: Math.round(chip * 0.12),
            borderRadius: '50%',
            background: '#00E5C3',
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
