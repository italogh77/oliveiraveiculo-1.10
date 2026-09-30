import React from 'react';
import { Award, MessageSquare, Car, ShieldCheck, CreditCard, Users, MapPin, Navigation } from 'lucide-react';
import TrustBar from '../components/TrustBar';
import SocialProof from '../components/SocialProof';
import Services from '../components/Services';
import SellersContact from '../components/SellersContact';
import { COMPANY_DATA } from '../data/companyData';

export default function AboutPage({ onGoToEstoque }) {
  return (
    <>
      <div className="ov-about-mobile">
        <section className="ov-about-mobile-hero">
          <img src="/loja-oliveira-hero-original.jpg" alt="Fachada da Oliveira Veículos" />
          <div className="ov-about-mobile-hero-shade" />
          <div className="ov-about-mobile-copy">
            <h1>Mais que<br />uma <em>revenda.</em></h1>
            <p>Atendimento próximo para sua próxima conquista.</p>
          </div>
        </section>

        <section className="ov-about-mobile-content">
          <div className="ov-about-mobile-benefit">
            <Car />
            <span><strong>Veículos selecionados</strong><small>Revisados e inspecionados. Sem leilão, sem sinistro.</small></span>
          </div>
          <div className="ov-about-mobile-benefit">
            <CreditCard />
            <span><strong>Financiamento</strong><small>Simulações com os principais bancos parceiros da loja.</small></span>
          </div>
          <div className="ov-about-mobile-benefit">
            <Users />
            <span><strong>Atendimento de verdade</strong><small>Converse com nossa equipe antes de decidir.</small></span>
          </div>

          <div className="ov-about-mobile-map">
            <div className="ov-about-mobile-map-copy">
              <h2>Venha nos visitar</h2>
              <p><MapPin /> <span><strong>Maricá, RJ</strong><small>{COMPANY_DATA.address}</small></span></p>
            </div>
            <iframe
              title="Mapa Oliveira Veículos Maricá"
              src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={COMPANY_DATA.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <span>Como chegar</span><Navigation />
            </a>
          </div>
        </section>
      </div>

      <div className="ov-about ov-about-desktop pt-28 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1540px] mx-auto w-full">
      {/* ── APRESENTAÇÃO DA LOJA (DESTAQUE E LARGURA AMPLA) ─────────── */}
      <section className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dfb15b]/15 text-[#dfb15b] text-xs font-bold uppercase tracking-widest mb-4 border border-[#dfb15b]/30">
          <Award className="w-4 h-4" />
          <span>CONHEÇA A OLIVEIRA VEÍCULOS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-gray-950 dark:text-white tracking-tight leading-[1.14] max-w-4xl mx-auto">
          Tradição, Procedência e as Melhores Taxas de Maricá
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal max-w-3xl mx-auto">
          Na Oliveira Veículos, ajudamos você a conquistar seu próximo carro com transparência, respeito e atendimento próximo. Conheça nossa loja e converse com nossa equipe sobre as opções de veículos e as condições de financiamento disponíveis para você.
        </p>

        {/* Botões aumentados e confortáveis */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {onGoToEstoque && (
            <button
              onClick={onGoToEstoque}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-black bg-[#dfb15b] hover:bg-[#efc676] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Car className="w-5 h-5" />
              <span>Ver Estoque Disponível</span>
            </button>
          )}

          <a
            href={COMPANY_DATA.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-700 hover:border-[#dfb15b] hover:text-[#dfb15b] transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#dfb15b]" />
            <span>Falar com um Consultor</span>
          </a>
        </div>
      </section>

      {/* ── 1. DIFERENCIAIS DA LOJA (GARANTIA E SEGURANÇA) ──────────── */}
      <section className="mb-24">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#dfb15b]" />
            <span>GARANTIA E SEGURANÇA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
            Nossos Diferenciais Exclusivos
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Por que centenas de clientes de Maricá e região confiam na Oliveira Veículos.
          </p>
        </div>

        <TrustBar />
      </section>

      {/* ── 2. EQUIPE DE CONSULTORES ─────────────────────────────────── */}
      <section className="mb-24">
        <SellersContact />
      </section>

      {/* ── 3. EXPERIÊNCIAS, ENTREGAS E GOOGLE REVIEWS ───────────────── */}
      <section className="mb-24">
        <SocialProof onGoToEstoque={onGoToEstoque} />
      </section>

      {/* ── 4. NOSSOS SERVIÇOS ───────────────────────────────────────── */}
      <section className="mb-12">
        <Services onGoToEstoque={onGoToEstoque} />
      </section>
      </div>
    </>
  );
}
