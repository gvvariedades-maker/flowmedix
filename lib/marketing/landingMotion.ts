/** Framer Motion variants compartilhados na LP. */
export const landingFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const landingBlobPulse = {
  animate: { scale: [1, 1.05, 1] },
  transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const },
};
