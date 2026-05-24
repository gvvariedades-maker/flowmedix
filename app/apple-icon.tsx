import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const chip = 68;
  const chipRadius = 15;
  const boltSize = 37;

  return new ImageResponse(
    (
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
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00E5C3',
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
