import React from 'react';
import { MapPin, Phone, Clock3, Lock } from 'lucide-react';
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

  return (
    <footer className="ov-footer bg-[#070809] text-white border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* 1. Marca e Descrição */}
          <div>
            <img
              src={publicAsset('logo-dark.png')}
              alt="Oliveira Veículos"
              className="h-9 sm:h-10 max-w-[170px] object-contain mb-4"
            />
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs mb-4">
              Veículos selecionados com laudo cautelar aprovado e atendimento próximo para sua próxima conquista em Maricá - RJ.
            </p>
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
              <span className="transition-colors duration-300">@oliveiraveiculosmarica</span>
            </a>
          </div>

          {/* 2. Navegação Rápida */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#dfb15b] uppercase mb-4">
              NAVEGAÇÃO
            </h3>
            <ul className="space-y-2.5">
              {links.map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => onSelectTab(id)}
                    className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 hover:translate-x-1 duration-150"
                  >
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Explore */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#dfb15b] uppercase mb-4">
              EXPLORE
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <li>
                <button
                  onClick={() => onSelectTab('estoque')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Nosso estoque de seminovos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('sobre')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  História e diferenciais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('financiamento')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Simulador de financiamento
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('onde-estamos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Como chegar na loja
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Contato e Horários */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-[#dfb15b] uppercase mb-4">
              ATENDIMENTO
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <a
                href={COMPANY_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-[#dfb15b] transition-colors"
              >
                <MapPin size={16} className="text-[#dfb15b] shrink-0 mt-0.5" />
                <span>{COMPANY_DATA.address}</span>
              </a>

              <a
                href={`tel:+${COMPANY_DATA.whatsappNumber}`}
                className="flex items-center gap-2.5 hover:text-[#dfb15b] transition-colors"
              >
                <Phone size={16} className="text-[#dfb15b] shrink-0" />
                <span>{COMPANY_DATA.phone}</span>
              </a>

              <div className="flex items-start gap-2.5 text-gray-400">
                <Clock3 size={16} className="text-[#dfb15b] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-gray-200">Seg a Sex: 08:30 às 18:30</span>
                  <span className="block text-gray-400">Sábado: 08:30 às 14:00</span>
                </div>
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
