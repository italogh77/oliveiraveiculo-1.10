import React from 'react';
import { motion } from 'framer-motion';
import { Percent, Clock, MapPin } from 'lucide-react';
import BankLogos from './BankLogos';

const differentials = [
  {
    icon: Percent,
    title: 'Taxas a partir de 0,89% a.m.*',
    desc: 'Condições diferenciadas negociadas com os 8 maiores bancos parceiros da loja.',
    disclaimer: '*Taxa a partir de 0,89% a.m. sujeita à análise de crédito, score e condições da instituição bancária.',
    stat: '0,89%',
    statLabel: 'a partir de / a.m.*',
    badge: 'Condições Especiais',
  },
  {
    icon: Clock,
    title: 'Aprovação Ágil em Minutos',
    desc: 'Processo desburocratizado diretamente pelo WhatsApp com resposta rápida.',
    disclaimer: 'Simulação preliminar sem compromisso e orientação personalizada de parcelas.',
    stat: '15 min',
    statLabel: 'análise inicial',
    badge: 'Atendimento Rápido',
  },
  {
    icon: MapPin,
    title: 'Loja Própria em Maricá - RJ',
    desc: 'Pátio espaçoso e estrutura completa na Rodovia Amaral Peixoto com test-drive na hora.',
    disclaimer: 'Atendimento presencial com consultores dedicados a tirar todas as suas dúvidas.',
    stat: 'Maricá',
    statLabel: 'atendimento presencial',
    badge: 'Pátio Completo',
  },
];

export default function TrustBar() {
  return (
    <div className="w-full">
      {/* 3 Cards de Diferenciais Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-14">
        {differentials.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] flex flex-col justify-between transition-all hover:border-gold/50 hover:shadow-md"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0 mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {item.stat}
                  </span>
                  <span className="text-[11px] uppercase text-gray-500 dark:text-gray-400 font-medium">
                    {item.statLabel}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-gray-900 dark:text-white leading-snug mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                {item.disclaimer}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bancos Parceiros */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
        <BankLogos />
      </div>
    </div>
  );
}
