import React from 'react';
import { MapPin, Navigation, MessageSquare, Car, ExternalLink } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useTheme } from '../context/ThemeContext';

export default function WhereWeArePage() {
  const { isDark } = useTheme();

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Título e Subtítulo Idênticos ao Screenshot 2 */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Venha conhecer a Oliveira Veículos.
        </h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1 font-normal">
          Estamos em Maricá, RJ. Esperamos por você.
        </p>
      </div>

      {/* Grid Superior: Card de Localização à Esquerda + Mapa à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
        {/* Card de Informações da Localização (~5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0f141d] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            {/* Ícone de Pin + Rótulo NOSSA LOCALIZAÇÃO */}
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#dfb15b]" />
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                NOSSA LOCALIZAÇÃO
              </span>
            </div>

            {/* Nome da Cidade em Destaque */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
              Maricá, RJ
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-8">
              Encontre nossa loja no mapa.
            </p>

            {/* Botões de Ação em Formato Pílula (Regra 1) */}
            <div className="space-y-3">
              <a
                href={COMPANY_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group relative w-full min-h-[46px] py-3.5 px-6 overflow-hidden bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-md text-sm cursor-pointer"
              >
                <Navigation className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                <span>Traçar rota</span>
              </a>

              <a
                href={COMPANY_DATA.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group relative w-full min-h-[46px] py-3.5 px-6 overflow-hidden border border-[#dfb15b] text-[#dfb15b] hover:bg-[#dfb15b]/10 font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 text-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Rodapé do Card: Atendimento Presencial */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 text-[#dfb15b]">
              <Car className="w-5 h-5" />
            </div>
            <span>
              Atendimento presencial com uma equipe pronta para te receber.
            </span>
          </div>
        </div>

        {/* Card do Mapa Interativo (~7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0f141d] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm min-h-[360px] relative">
          <iframe
            title="Mapa Oliveira Veículos Maricá"
            src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            className="w-full h-full min-h-[380px] border-0"
            style={{
              filter: isDark ? 'invert(90%) hue-rotate(180deg) contrast(115%)' : 'none',
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Marcador flutuante customizado sobre o mapa */}
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#262626] shadow-md flex items-center gap-2 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-[#cf8d3c] animate-pulse" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Showroom Oliveira Veículos
            </span>
          </div>
        </div>
      </div>

      {/* Card Banner Inferior: Fachada da Loja com Slogan Idêntico ao Screenshot 2 */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-950 aspect-[21/9] sm:aspect-[24/8] min-h-[220px]">
        {/* Foto de Fundo da Concessionária Moderna */}
        <img
          src="https://images.unsplash.com/photo-1562911791-c7a97b74992a?q=80&w=1600&auto=format&fit=crop"
          alt="Fachada Oliveira Veículos Maricá"
          className="w-full h-full object-cover filter brightness-75 contrast-105"
        />

        {/* Gradiente Escuro Suave para Alta Legibilidade dos Textos */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />

        {/* Conteúdo sobreposto */}
        <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Estamos prontos para receber você.
            </h3>
            {/* Linha de Destaque Dourada Idêntica ao Mockup */}
            <div className="w-16 h-1 bg-[#cf8d3c] rounded-full mt-3" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-300">
                Mais que carros, realizamos histórias.
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {COMPANY_DATA.address}
              </p>
            </div>

            <a
              href={COMPANY_DATA.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine group relative inline-flex items-center gap-2 px-6 py-3 min-h-[44px] overflow-hidden rounded-full bg-white/95 hover:bg-white text-gray-950 font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 shadow-md self-start sm:self-auto cursor-pointer"
            >
              <span>Ver no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
