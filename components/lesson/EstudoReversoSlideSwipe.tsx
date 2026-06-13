'use client';

import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

function SwipeGhostArrows({
  canSwipePrev,
  canSwipeNext,
}: {
  canSwipePrev: boolean;
  canSwipeNext: boolean;
}) {
  return (
    <>
      {canSwipePrev ? (
        <div
          className="pointer-events-none absolute left-0 top-1/2 z-20 -translate-y-1/2 opacity-20"
          aria-hidden
        >
          <ChevronLeft className="h-8 w-8 text-slate-700" />
        </div>
      ) : null}
      {canSwipeNext ? (
        <div
          className="pointer-events-none absolute right-0 top-1/2 z-20 -translate-y-1/2 opacity-20"
          aria-hidden
        >
          <ChevronRight className="h-8 w-8 text-slate-700" />
        </div>
      ) : null}
    </>
  );
}

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
      <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch">
        <SwipeGhostArrows canSwipePrev={canSwipePrev} canSwipeNext={canSwipeNext} />
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-stretch touch-pan-y"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      dragDirectionLock
      onDragEnd={handleDragEnd}
    >
      <SwipeGhostArrows canSwipePrev={canSwipePrev} canSwipeNext={canSwipeNext} />
      {children}
    </motion.div>
  );
}
