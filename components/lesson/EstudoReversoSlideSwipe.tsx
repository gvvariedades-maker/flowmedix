'use client';

import { motion, useReducedMotion, type PanInfo } from 'framer-motion';

const SWIPE_OFFSET_PX = 80;
const SWIPE_VELOCITY = 400;

type EstudoReversoSlideSwipeProps = {
  children: React.ReactNode;
  onSwipePrev?: () => void;
  onSwipeNext?: () => void;
  canSwipePrev?: boolean;
  canSwipeNext?: boolean;
  enabled?: boolean;
};

/**
 * Navegação horizontal por gesto no estudo reverso (complementa botões do footer).
 * Respeita prefers-reduced-motion e não bloqueia scroll vertical (touch-pan-y).
 */
export function EstudoReversoSlideSwipe({
  children,
  onSwipePrev,
  onSwipeNext,
  canSwipePrev = true,
  canSwipeNext = true,
  enabled = true,
}: EstudoReversoSlideSwipeProps) {
  const prefersReducedMotion = useReducedMotion();
  const swipeActive = enabled && !prefersReducedMotion;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeActive) return;

    const { offset, velocity } = info;
    if ((offset.x < -SWIPE_OFFSET_PX || velocity.x < -SWIPE_VELOCITY) && canSwipeNext) {
      onSwipeNext?.();
      return;
    }
    if ((offset.x > SWIPE_OFFSET_PX || velocity.x > SWIPE_VELOCITY) && canSwipePrev) {
      onSwipePrev?.();
    }
  };

  if (!swipeActive) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch touch-pan-y"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      dragDirectionLock
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}
