import Image from 'next/image';
import { cn } from '@/lib/utils';

type DeviceScreenImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  objectPosition?: string;
  unoptimized?: boolean;
};

/** Screenshot estático preenchendo a área da tela do device (object-cover). */
export function DeviceScreenImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  objectPosition = 'object-top',
  unoptimized,
}: DeviceScreenImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized={unoptimized ?? priority}
      sizes="(max-width: 1024px) 280px, 540px"
      className={cn('h-full w-full object-cover', objectPosition, className)}
      draggable={false}
    />
  );
}
