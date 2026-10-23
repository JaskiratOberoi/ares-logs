/** One timing law for the whole surface. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const T = 0.24;
export const T_FAST = 0.14;

export const bladeIn = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: T, ease: EASE } },
  exit: { x: 24, opacity: 0, transition: { duration: T_FAST, ease: EASE } },
};

export const rise = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: T, ease: EASE } },
};

export const plateReveal = {
  initial: { clipPath: "inset(0 0 100% 0)", opacity: 0.6 },
  animate: { clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: T * 1.5, ease: EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: T_FAST, ease: EASE } },
};
