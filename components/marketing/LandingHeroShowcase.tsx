import { DeviceFrame } from '@/components/marketing/DeviceFrame';
import { DeviceScreenImage } from '@/components/marketing/DeviceScreenImage';
import { LandingHeroFloatingCards } from '@/components/marketing/LandingHeroFloatingCards';
import { HERO_MOCKUP_ASSETS } from '@/lib/marketing/heroMockupAssets';
import { cn } from '@/lib/utils';

type LandingHeroShowcaseProps = {
  className?: string;
};

/**
 * Composição Estudei-style: laptop (maior, atrás) + tablet portrait (meio) + phone (frente).
 * Telas com screenshots reais do app (editorial v2) — carregamento instantâneo, sem hidratação.
 */
export function LandingHeroShowcase({ className }: LandingHeroShowcaseProps) {
  const { laptop, tablet, phone } = HERO_MOCKUP_ASSETS;

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[280px] lg:h-[520px] lg:max-w-[700px]',
        className,
      )}
    >
      {/* Laptop — maior, atrás, direita */}
      <div
        className="absolute right-0 -top-[1%] z-0 hidden w-[85%] max-w-[540px] lg:block"
        style={{ perspective: '700px' }}
      >
        <div
          className="relative transform-gpu"
          style={{ transform: 'rotateX(6deg) rotateY(-14deg)', transformStyle: 'preserve-3d' }}
        >
          <DeviceFrame
            variant="laptop"
            label="Player AVANT Enf no desktop"
            minimalChrome
            screenMode="cover"
          >
            <DeviceScreenImage
              src={laptop.src}
              alt={laptop.alt}
              width={laptop.width}
              height={laptop.height}
              objectPosition={laptop.objectPosition}
              priority
            />
          </DeviceFrame>
        </div>
      </div>

      {/* Tablet portrait — menor que laptop, sobrepõe canto inferior esquerdo */}
      <div
        className="absolute left-[5%] top-[30%] z-10 hidden w-[38%] max-w-[260px] lg:block"
        style={{ perspective: '650px' }}
      >
        <div
          className="relative transform-gpu"
          style={{ transform: 'rotateY(16deg) rotateX(-4deg)', transformStyle: 'preserve-3d' }}
        >
          <DeviceFrame variant="tablet" label="NeuroSlide de estudo reverso" screenMode="cover">
            <DeviceScreenImage
              src={tablet.src}
              alt={tablet.alt}
              width={tablet.width}
              height={tablet.height}
              objectPosition={tablet.objectPosition}
              priority
            />
          </DeviceFrame>
        </div>
      </div>

      {/* Phone — frente, sobrepõe tablet */}
      <div
        className={cn(
          'relative z-20 mx-auto w-full max-w-[280px]',
          'lg:absolute lg:bottom-[5%] lg:right-[7%] lg:mx-0 lg:w-[30%] lg:max-w-[220px]',
        )}
        style={{ perspective: '600px' }}
      >
        <div
          className="relative transform-gpu lg:[transform:rotateY(-12deg)_rotateX(4deg)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <DeviceFrame variant="phone" label="Questão no player AVANT Enf" screenMode="cover">
            <DeviceScreenImage
              src={phone.src}
              alt={phone.alt}
              width={phone.width}
              height={phone.height}
              objectPosition={phone.objectPosition}
              priority
            />
          </DeviceFrame>
        </div>
      </div>

      <LandingHeroFloatingCards />

      <div className="relative z-30 mx-auto mt-3 w-fit rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-lg lg:hidden">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Estudo reverso</p>
        <p className="text-xs font-black text-slate-900">4 NeuroSlides por questão</p>
      </div>
    </div>
  );
}
