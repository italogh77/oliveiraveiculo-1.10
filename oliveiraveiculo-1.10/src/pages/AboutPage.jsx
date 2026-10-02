import React from 'react';
import { Award, MessageSquare, Car, ShieldCheck, Navigation, ArrowUpRight, Sparkles } from 'lucide-react';
import TrustBar from '../components/TrustBar';
import SocialProof from '../components/SocialProof';
import Services from '../components/Services';
import SellersContact from '../components/SellersContact';
import { COMPANY_DATA } from '../data/companyData';
import { Reveal } from '../components/Reveal';

export default function AboutPage({ onGoToEstoque }) {
  return (
    <div className="ov-about pt-20 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1540px] mx-auto w-full text-white">
      {/* ── 1. APRESENTAÇÃO DA LOJA (COM ANIMAÇÃO DE ENTRADA SUAVE) ── */}
      <Reveal className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dfb15b]/15 text-[#dfb15b] text-xs font-bold uppercase tracking-widest mb-4 border border-[#dfb15b]/30">
          <Award className="w-4 h-4" />
          <span>CONHEÇA A OLIVEIRA VEÍCULOS</span>
        </div>

        <h1 className="text-[clamp(1.85rem,6vw,3.25rem)] font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Tradição, Procedência e as Melhores Taxas de Maricá
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-300 leading-relaxed font-normal max-w-3xl mx-auto">
          Na Oliveira Veículos, ajudamos você a conquistar seu próximo carro com transparência, respeito e atendimento próximo. Conheça nossa loja e converse com nossa equipe sobre as opções de veículos e as condições de financiamento disponíveis para você.
        </p>

        {/* Botões em Formato Pílula (Regra 1) */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
          {onGoToEstoque && (
            <button
              onClick={onGoToEstoque}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[46px] rounded-full text-sm sm:text-base font-bold text-black bg-[#dfb15b] hover:bg-[#efc676] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Car className="w-5 h-5" />
              <span>Ver Estoque Disponível</span>
            </button>
          )}

          <a
            href={COMPANY_DATA.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[46px] rounded-full text-sm sm:text-base font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <MessageSquare className="w-5 h-5 text-[#dfb15b]" />
            <span>Falar com um Consultor</span>
          </a>
        </div>
      </Reveal>

      {/* ── 2. DIFERENCIAIS DA LOJA (GARANTIA E SEGURANÇA) ──────────── */}
      <Reveal className="mb-20 sm:mb-24">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#dfb15b] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#dfb15b]" />
            <span>GARANTIA E SEGURANÇA</span>
          </div>
          <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold text-white tracking-tight">
            Nossos Diferenciais Exclusivos
          </h2>
          <p className="mt-2 text-xs sm:text-base text-gray-400 max-w-xl mx-auto">
            Por que centenas de clientes de Maricá e região confiam na Oliveira Veículos.
          </p>
        </div>

        <TrustBar />
      </Reveal>

      {/* ── 3. EQUIPE DE CONSULTORES ─────────────────────────────────── */}
      <Reveal className="mb-20 sm:mb-24">
        <SellersContact />
      </Reveal>

      {/* ── 4. EXPERIÊNCIAS, ENTREGAS E GOOGLE REVIEWS (Regra 6) ──────── */}
      <Reveal className="mb-20 sm:mb-24">
        <SocialProof onGoToEstoque={onGoToEstoque} />
      </Reveal>

      {/* ── 5. NOSSOS SERVIÇOS ───────────────────────────────────────── */}
      <Reveal className="mb-20 sm:mb-24">
        <Services onGoToEstoque={onGoToEstoque} />
      </Reveal>

      {/* ── 6. SEÇÃO DE LOCALIZAÇÃO FIXADA ANTES DO RODAPÉ (Regra 7) ──── */}
      <Reveal className="mb-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141518] to-[#0c0d0f] p-5 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Informações da loja */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
                  <Sparkles size={13} />
                  <span>NOSSA LOJA EM MARICÁ</span>
                </span>

                <h2 className="text-[clamp(1.5rem,5.5vw,2.5rem)] font-extrabold text-white tracking-tight leading-tight break-words mb-3">
                  Estamos prontos para receber você
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 font-medium">
                  {COMPANY_DATA.address}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-[#dfb15b] shrink-0" />
                    <span>Segunda a Sexta: 08:30 às 18:30 · Sábado: 08:30 às 14:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Espaço climatizado, café e atendimento personalizado</span>
                  </div>
                </div>
              </div>

              {/* Botão em Pílula ocupando largura total no mobile */}
              <div className="pt-2">
                <a
                  href={COMPANY_DATA.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm min-h-[46px] px-6 py-3 transition-transform duration-150 active:scale-95 shadow-md cursor-pointer"
                >
                  <Navigation size={16} />
                  <span>Ver no Google Maps</span>
                  <ArrowUpRight size={16} className="stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* iFrame com proporção fluida e cantos arredondados */}
            <div className="lg:col-span-6">
              <div className="relative aspect-video sm:h-72 w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black">
                <iframe
                  title="Mapa Oliveira Veículos Maricá"
                  src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-[115%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
