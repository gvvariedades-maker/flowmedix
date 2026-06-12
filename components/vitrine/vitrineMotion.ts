export const vitrineContainerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
};

export const vitrineItemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const } },
};

export const vitrineItemGroupVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.32 },
  },
};
