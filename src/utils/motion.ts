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

export const cinematicEase = [0.22, 1, 0.36, 1] as const; 
export const cinematicTransition = { duration: 0.7, ease: cinematicEase };
export const functionalTransition = { duration: 0.2, ease: "easeOut" as const };

export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0, transition: cinematicTransition },
  viewport: { once: true, margin: "-100px" }
};

