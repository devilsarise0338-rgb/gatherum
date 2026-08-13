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

export const ticketTearAnimation: Variants = {
  initial: { y: 0, rotate: 0 },
  torn: { 
    y: 10, 
    rotate: -1,
    opacity: 0.9,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  waitlisted: { 
    y: 4, 
    rotate: -0.5,
    opacity: 0.95,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};

export const stampAnimation: Variants = {
  initial: { scale: 1.5, opacity: 0, rotate: 15 },
  stamped: {
    scale: 1,
    opacity: 1,
    rotate: -5,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  }
};

