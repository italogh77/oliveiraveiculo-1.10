import React from 'react';
import { Phone, MapPin, Lock } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import InstagramIcon from './InstagramIcon';
import { publicAsset } from '../lib/publicAsset';

export default function Footer({ onSelectTab }) {
  const links = [
    ['inicio', 'Início'],
    ['estoque', 'Comprar carros'],
    ['financiamento', 'Financiamento'],
    ['sobre', 'Sobre nós'],
    ['contato', 'Contato'],
  ];

  const handleNav = (tabId) => {
    onSelectTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const phoneList = [
    '(21) 99308-6461',
    '(21) 99801-6913',
    '(21) 99796-9694',
  ];

  return (
    <footer className="ov-footer bg-[#070809] text-white border-t border-white/10 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
        {/* Logo da Loja */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => handleNav('inicio')}
            aria-label="Oliveira Veículos — Início"
            title="Voltar ao início"
            className="cursor-pointer inline-flex min-h-11 min-w-11 items-center justify-center active:scale-95 transition-transform"
          >
            <img
              src={publicAsset('logo-dark.png')}
              alt="Oliveira Veículos"
              className="h-8 sm:h-9 max-w-[160px] object-contain ov-logo-breathing mx-auto"
            />
          </button>
        </div>

        {/* Navegação Rápida e Direta */}
        <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 text-xs sm:text-sm text-gray-400">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="inline-flex min-h-11 items-center px-2.5 hover:text-[#dfb15b] transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Telefones: Apenas o símbolo de telefone e os números tudo seguido */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm text-gray-300 pt-1">
          <Phone size={14} className="text-[#dfb15b] shrink-0" />
          {phoneList.map((tel, idx) => (
            <React.Fragment key={tel}>
              <a
                href={`tel:${tel.replace(/\D/g, '')}`}
                className="inline-flex min-h-11 items-center font-mono text-gray-300 hover:text-[#dfb15b] transition-colors tracking-wide"
                title={`Ligar para ${tel}`}
              >
                {tel}
              </a>
              {idx < phoneList.length - 1 && (
                <span className="text-gray-600 select-none">·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Endereço e Instagram discretos */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 pt-1">
          <a
            href={COMPANY_DATA.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 hover:text-[#dfb15b] transition-colors"
          >
            <MapPin size={13} className="text-[#dfb15b] shrink-0" />
            <span>{COMPANY_DATA.address}</span>
          </a>

          <span className="text-gray-700 hidden sm:inline">|</span>

          <a
            href={COMPANY_DATA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 hover:text-[#dfb15b] transition-colors"
          >
            <InstagramIcon size={13} useGradient className="shrink-0" />
            <span>{COMPANY_DATA.instagram}</span>
          </a>
        </div>

        {/* Linha Inferior com Copyright e Acesso Restrito */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[11px] text-gray-500 max-w-xl mx-auto">
          <span>© {new Date().getFullYear()} Oliveira Veículos · Maricá, RJ</span>
          <button
            onClick={() => onSelectTab('admin')}
            aria-label="Acesso administrativo"
            title="Acesso administrativo"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <Lock size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
