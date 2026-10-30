"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } },
};

/**
 * Fades content up as it scrolls into view. Content is rendered on the server and
 * fully readable without JavaScript; MotionConfig reducedMotion="user" removes the
 * movement for people who ask for less motion.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={item}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its direct <RevealItem> children by 45ms. */
export function RevealGroup({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const Comp = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
