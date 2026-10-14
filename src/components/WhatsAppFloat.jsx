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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="ov-whatsapp-float fixed z-40 flex items-center bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6"
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
                className="mr-3 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-sm pointer-events-none whitespace-nowrap dark:border-white/10 dark:bg-[#17191d] dark:text-white"
              >
                <span>Fale com um consultor em Maricá</span>
                {/* Tooltip arrow */}
                <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white/20 dark:border-l-white/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Atalho de contato direto */}
          <div className="relative">
            <motion.a
              href={COMPANY_DATA.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar com consultor no WhatsApp"
              aria-describedby="whatsapp-tooltip"
              onHoverStart={() => setShowTooltip(true)}
              onHoverEnd={() => setShowTooltip(false)}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
              transition={{ duration: 0.16 }}
              className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-700 bg-[#168a4a] text-white shadow-md transition-colors hover:bg-[#11763e] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-emerald-500/30 cursor-pointer"
            >
              <MessageSquare className="w-6 h-6 text-white fill-white relative z-10" />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
