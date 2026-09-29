import React from 'react';
import { BANCOS_CONFIG, renderBancoIcon } from '../lib/bancosBrasil';

export const BANK_LIST = Object.values(BANCOS_CONFIG);

export default function BankLogos() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {BANK_LIST.map((bank) => (
          <div
            key={bank.id}
            className="rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#dfb15b]/60 transition-colors shadow-sm"
          >
            {renderBancoIcon(bank.id, 28)}
            <div className="min-w-0">
              <span className="block text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
                {bank.nome}
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
                Financiamento
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
