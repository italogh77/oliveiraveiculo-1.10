import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

// Barrinha dourada no topo que mostra o quanto da página já foi rolado
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[#e5a350] via-[#cf8d3c] to-[#b5761e]"
    />
  );
}
