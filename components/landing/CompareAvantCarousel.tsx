'use client';

import { useEffect, useState } from 'react';
import { DeviceFrame } from '@/components/marketing/DeviceFrame';
import { DeviceScreenImage } from '@/components/marketing/DeviceScreenImage';
import { COMPARE_AVANT_SLIDES } from '@/lib/marketing/compareAvantAssets';
import { cn } from '@/lib/utils';

export function CompareAvantCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % COMPARE_AVANT_SLIDES.length), 2500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative w-full px-6 py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto w-full max-w-[240px]">
        <DeviceFrame
          variant="phone"
          label="NeuroSlides AVANT Enf no celular"
          screenMode="cover"
          showGroundShadow={false}
        >
          <div className="relative h-full w-full">
            {COMPARE_AVANT_SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className={cn(
                  'h-full w-full transition-opacity duration-500',
                  i === active
                    ? 'relative opacity-100'
                    : 'pointer-events-none absolute inset-0 opacity-0',
                )}
                aria-hidden={i !== active}
              >
                <DeviceScreenImage
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  objectPosition={slide.objectPosition}
                  priority={i === 0}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </DeviceFrame>
      </div>

      <div className="flex justify-center gap-2 pt-4" role="tablist" aria-label="Slides AVANT Enf">
        {COMPARE_AVANT_SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === active ? 'h-2 w-6 bg-[#8fe020]' : 'h-2 w-2 bg-slate-300',
            )}
          />
        ))}
      </div>
    </div>
  );
}
