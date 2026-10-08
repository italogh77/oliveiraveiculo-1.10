import React from 'react';
import { motion } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

// Entrada suave quando o elemento aparece na tela (respeita "reduzir movimento" via MotionConfig no App)
export function Reveal({ children, delay = 0, y = 24, className = '', once = true, ...rest }) {
  return (
    <motion.div
      {...rest}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Container que anima os filhos em sequência (use junto com staggerItem)
export function Stagger({ children, className = '', gap = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.08 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};
