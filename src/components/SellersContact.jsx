import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

export default function SellersContact() {
  const sellers = COMPANY_DATA.sellers || [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#cf8d3c] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Atendimento Personalizado • Consultores Online
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-950 dark:text-white mt-1">
            Fale Diretamente com Nossos Consultores
          </h3>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Atendimento direto e sem intermediários</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sellers.map((seller, index) => {
          const rawPhone = seller.phone.replace(/\D/g, '');
          return (
            <motion.div
              key={seller.id || index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 ov-card-glass flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#cf8d3c]/15 text-[#cf8d3c] border border-[#cf8d3c]/30 flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-gray-950 dark:text-white leading-tight">
                      {seller.name}
                    </h4>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Disponível para atendimento
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-3.5 mb-6 border border-gray-100 dark:border-[#262626]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-0.5">
                    Telefone & WhatsApp
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
                    {seller.phone}
                  </span>
                </div>
              </div>

              {/* Botões de contato espaçosos */}
              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href={`tel:${rawPhone}`}
                  className="btn-shine group p-3.5 rounded-xl border border-gray-300 dark:border-gray-600/80 bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-800 dark:hover:bg-gray-100 dark:hover:text-gray-900 dark:hover:border-white transition-all duration-300 flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:shadow-md"
                  title={`Ligar para ${seller.name}`}
                  aria-label={`Ligar para ${seller.name}`}
                >
                  <Phone className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </a>

                <a
                  href={seller.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Conversar no WhatsApp</span>
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
