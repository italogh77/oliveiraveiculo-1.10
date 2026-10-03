import React from 'react';
import { MapPin, Phone, Clock3, Lock, ArrowUpRight } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import InstagramIcon from './InstagramIcon';
import { publicAsset } from '../lib/publicAsset';

export default function Footer({ onSelectTab }) {
  const links = [
    ['inicio', 'Início'],
    ['estoque', 'Comprar carros'],
    ['financiamento', 'Simular financiamento'],
    ['sobre', 'Sobre a loja & Diferenciais'],
    ['onde-estamos', 'Onde estamos / Localização'],
  ];

  const handleNav = (tabId) => {
    onSelectTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="ov-footer bg-[#070809] text-white border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* 1. Marca, Redes e Endereço */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleNav('inicio')}
              aria-label="Oliveira Veículos — Início"
              title="Voltar ao início"
              className="cursor-pointer block active:scale-95 transition-transform group text-left"
            >
              <img
                src={publicAsset('logo-dark.png')}
                alt="Oliveira Veículos"
                className="h-9 sm:h-10 max-w-[170px] object-contain ov-logo-breathing"
              />
            </button>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              Mais que uma revenda. Um caminho para sua próxima conquista com procedência garantida e atendimento transparente em Maricá, RJ.
            </p>

            <div className="pt-1">
              <a
                href={COMPANY_DATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Oliveira Veículos"
                title="Instagram da Oliveira Veículos"
                className="btn-instagram group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
              >
                <InstagramIcon
                  size={16}
                  useGradient
                  className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0 drop-shadow-[0_0_6px_rgba(214,41,118,0.4)]"
                />
                <span className="transition-colors duration-300">{COMPANY_DATA.instagram}</span>
              </a>
            </div>

            <div className="pt-1">
              <a
                href={COMPANY_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-xs text-gray-400 hover:text-[#dfb15b] transition-colors leading-relaxed group"
              >
                <MapPin size={15} className="text-[#dfb15b] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{COMPANY_DATA.address}</span>
              </a>
            </div>
          </div>

          {/* 2. Navegação Rápida (Sem duplicidade) */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#dfb15b] uppercase mb-4">
              NAVEGAÇÃO
            </h3>
            <ul className="space-y-2.5">
              {links.map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => handleNav(id)}
                    className="text-xs sm:text-sm text-gray-300 hover:text-[#dfb15b] transition-colors cursor-pointer text-left flex items-center gap-2 hover:translate-x-1 duration-150 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b]/40 group-hover:bg-[#dfb15b] transition-colors" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Atendimento com os 3 Telefones & Horários */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#dfb15b] uppercase mb-4">
              ATENDIMENTO & VENDAS
            </h3>

            {/* Lista dos 3 Consultores (Ítalo, Moatan, Beto) */}
            <div className="space-y-2 mb-4">
              {COMPANY_DATA.sellers?.map((seller) => (
                <a
                  key={seller.id}
                  href={seller.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-[#dfb15b]/40 transition-all text-gray-300 hover:text-white group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0 group-hover:bg-[#dfb15b] group-hover:text-black transition-colors">
                      <Phone size={12} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate">{seller.shortName}</span>
                      <span className="text-[11px] text-gray-400 group-hover:text-[#dfb15b] transition-colors font-mono">{seller.phone}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#dfb15b] opacity-75 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
                    <span>WhatsApp</span>
                    <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              ))}
            </div>

            {/* Horários de Funcionamento */}
            <div className="flex items-start gap-2.5 text-xs text-gray-400 pt-2 border-t border-white/5">
              <Clock3 size={15} className="text-[#dfb15b] shrink-0 mt-0.5" />
              <div>
                <span className="block text-gray-200 font-medium">Seg a Sex: 08:30 às 18:30</span>
                <span className="block text-gray-400">Sábado: 08:30 às 14:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Inferior com Copyright e Acesso Restrito */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Oliveira Veículos · Todos os direitos reservados · Maricá, RJ</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectTab('admin')}
              aria-label="Acesso administrativo"
              title="Acesso administrativo"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <Lock size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
