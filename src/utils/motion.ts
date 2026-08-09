import { Variants, Transition } from "motion/react";

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
};

export const cardHover: { scale: number; transition: Transition } = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" as const }
};

export const successAnimation: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    } 
  }
};
