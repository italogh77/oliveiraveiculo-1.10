import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

export default function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay entry animation
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}
          className="fixed z-40 flex items-center bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6"
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                id="whatsapp-tooltip"
                role="tooltip"
                initial={{ opacity: 0, x: 12, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mr-3 py-2 px-3.5 rounded-xl liquid-glass text-xs font-medium text-zinc-900 dark:text-white shadow-xl pointer-events-none whitespace-nowrap"
              >
                <span>Fale com um consultor em Maricá</span>
                {/* Tooltip arrow */}
                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white/20 dark:border-l-white/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button container with dual-pulse rings */}
          <div className="relative">
            {/* Outer pulse ring 1 */}
            <span className="absolute inset-0 rounded-full bg-whatsapp opacity-25 animate-ping-slower" />
            {/* Outer pulse ring 2 (offset timing) */}
            <span
              className="absolute inset-0 rounded-full bg-whatsapp opacity-20 animate-ping-slow"
              style={{ animationDelay: '0.8s' }}
            />

            {/* Main button */}
            <motion.a
              href={COMPANY_DATA.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com consultor no WhatsApp"
              aria-describedby="whatsapp-tooltip"
              onHoverStart={() => setShowTooltip(true)}
              onHoverEnd={() => setShowTooltip(false)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="relative flex items-center justify-center w-14 h-14 rounded-full bg-whatsapp hover:bg-whatsapp-dark shadow-2xl cursor-pointer"
              style={{
                boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0)',
              }}
            >
              {/* Glow ring */}
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-whatsapp/60"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <MessageSquare className="w-6 h-6 text-white fill-white relative z-10" />

              {/* Online status dot */}
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-black" />
              </span>
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
