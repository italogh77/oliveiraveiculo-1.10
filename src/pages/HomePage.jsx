import React, { useRef, useMemo } from 'react';
import { ArrowRight, ArrowUpRight, ShieldCheck, BadgeCheck, CreditCard, MapPin, ChevronLeft, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from '../components/VehicleCard';
import BankLogos from '../components/BankLogos';
import { publicAsset } from '../lib/publicAsset';

export default function HomePage({ onGoToEstoque, onGoToOndeEstamos, onGoToSobre, onSelectVehicle }) {
  const { vehicles } = useVehicles();
  const carouselRef = useRef(null);

  // Filtra destaques escolhidos pelo Admin ou completa com os primeiros
  const featuredVehicles = useMemo(() => {
    if (!vehicles.length) return [];
    const custom = vehicles.filter((v) => v.destaqueHome);
    if (custom.length >= 3) return custom;
    const customIds = new Set(custom.map((v) => v.id));
    const rest = vehicles.filter((v) => !customIds.has(v.id));
    return [...custom, ...rest];
  }, [vehicles]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="ov-home text-white bg-[#090a0b]">
      {/* ── Hero Section ── */}
      <section className="ov-hero relative min-h-[82svh] sm:min-h-[86svh] flex items-end overflow-hidden pb-10 pt-20">
        <img
          className="ov-hero-image absolute inset-0 w-full h-full object-cover object-[52%_top]"
          src={publicAsset('loja-oliveira-hero-original.jpg')}
          alt="Fachada e veículos da Oliveira Veículos em Maricá"
          fetchPriority="high"
        />
        <div className="ov-hero-overlay absolute inset-0 bg-gradient-to-t from-[#090a0b] via-[#090a0b]/80 to-[#090a0b]/40" />

        <div className="ov-hero-shell relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="ov-hero-content max-w-2xl">
            {/* Tag em pílula */}
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfb15b]/40 bg-[#090a0b]/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#dfb15b] mb-4">
              <MapPin size={13} className="text-[#dfb15b]" />
              <span>Maricá, RJ · Seminovos selecionados</span>
            </span>

            {/* Headline com clamp para nunca estourar */}
            <h1 className="font-display text-[clamp(2.1rem,8vw,4.25rem)] font-black leading-[1.05] tracking-tight text-white mb-4">
              Seu próximo<br />
              carro está <em className="text-[#dfb15b] not-italic">aqui.</em>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed mb-6 font-medium">
              Encontre o carro certo para o seu momento, com atendimento próximo e informações claras em cada etapa.
            </p>

            {/* CTAs em formato Pílula (Regra 1 do Design System) */}
            <div className="ov-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm sm:text-base min-h-[46px] px-6 py-2.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                onClick={onGoToEstoque}
              >
                <span>Explorar veículos</span>
                <ArrowRight size={18} />
              </button>

              <a
                href={COMPANY_DATA.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative isolate inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-full border border-white/25 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-[color,border-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#d7d9dc] hover:text-[#15171a] hover:shadow-[0_8px_28px_rgba(215,217,220,0.28)] focus-visible:border-[#d7d9dc] focus-visible:text-[#15171a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7d9dc]/70 active:scale-95 cursor-pointer sm:text-base"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 -translate-x-[102%] rounded-full bg-gradient-to-r from-[#b8bcc2] via-[#eef0f2] to-[#c7cbd0] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0"
                />
                <span>Falar no WhatsApp</span>
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[6px] group-focus-visible:translate-x-[6px]"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bancos Parceiros ── */}
      <section className="ov-bank-strip border-y border-white/10 bg-[#0d0e11] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#dfb15b] shrink-0">
              Parceiros para Financiamento
            </span>
            <div className="flex-1 max-w-4xl">
              <BankLogos />
            </div>
          </div>
        </div>
      </section>

      {/* ── Estoque em Destaque: Peek Carousel / Center Mode (Regra 3) ── */}
      <section className="ov-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="ov-section-top flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>ESTOQUE EM DESTAQUE</span>
            </span>
            <h2 className="text-[clamp(1.5rem,5.5vw,2.5rem)] font-extrabold tracking-tight text-white">
              Encontre seu próximo carro
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Escolhas selecionadas para conhecer de perto e chamar de suas.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Setas de navegação */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                aria-label="Rolar para esquerda"
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white hover:border-[#dfb15b] hover:text-[#dfb15b] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Rolar para direita"
                className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white hover:border-[#dfb15b] hover:text-[#dfb15b] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Botão Ver todos em Pílula */}
            <button
              onClick={onGoToEstoque}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfb15b]/40 bg-[#dfb15b]/10 hover:bg-[#dfb15b] text-[#dfb15b] hover:text-black font-semibold text-xs sm:text-sm px-4 py-2 min-h-[42px] transition-all active:scale-95 cursor-pointer"
            >
              <span>Ver todos ({vehicles.length})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* 
          PEEK CAROUSEL / CENTER MODE:
          - No celular, o card do meio fica centralizado e as bordas mostram proporcionalmente uma fatia do anterior e próximo card
          - overflow-x: auto; scroll-snap-type: x mandatory;
        */}
        {featuredVehicles.length ? (
          <div
            ref={carouselRef}
            className="-mx-4 -mt-3 flex gap-4 overflow-x-auto px-6 pb-6 pt-4 scroll-smooth snap-x snap-mandatory sm:mx-0 sm:gap-6 sm:px-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollPaddingInline: '24px',
            }}
          >
            {featuredVehicles.map((v) => (
              <div
                key={v.id}
                className="w-[78vw] max-w-[325px] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-center"
              >
                <VehicleCard vehicle={v} onSelectVehicle={onSelectVehicle} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
            O estoque está sendo atualizado. Fale com a equipe para conhecer as opções disponíveis.
          </div>
        )}
      </section>

      {/* ── Valores da Loja ── */}
      <section className="ov-values border-y border-white/10 bg-[#0d0e11] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ov-values-grid grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
              <span>A OLIVEIRA VEÍCULOS</span>
            </span>
            <h2 className="text-[clamp(1.6rem,5vw,2.75rem)] font-black tracking-tight text-white leading-tight mb-3">
              Mais que uma revenda. Um caminho para sua próxima conquista.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-medium">
              Estamos em Maricá para ajudar você a comparar opções, tirar dúvidas e encontrar uma condição que faça sentido.
            </p>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-[#dfb15b] hover:text-black border border-white/15 px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              onClick={onGoToSobre}
            >
              <span>Conheça nossa loja</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-1">Procedência Garantida</strong>
                <p className="text-xs text-gray-400 leading-relaxed">Veículos revisados e inspecionados. Sem leilão, sem sinistro.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <CreditCard size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-1">Financiamento</strong>
                <p className="text-xs text-gray-400 leading-relaxed">Simulações com os principais bancos parceiros da loja.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <BadgeCheck size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-1">Atendimento de verdade</strong>
                <p className="text-xs text-gray-400 leading-relaxed">Converse com nossa equipe antes de decidir.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white mb-1">Perto de você</strong>
                <p className="text-xs text-gray-400 leading-relaxed">Visite nosso espaço na Rodovia Amaral Peixoto em Maricá, RJ.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SEÇÃO DE LOCALIZAÇÃO: "Venha nos Visitar" (Regra 7) ── */}
      <section className="ov-visit max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141518] to-[#0c0d0f] p-5 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Coluna de Informações e Chamada */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
                  <MapPin size={13} />
                  <span>NOSSA LOCALIZAÇÃO</span>
                </span>

                {/* Título com correção textual e clamp anti-estouro */}
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
                    <span>Estacionamento no local e atendimento com consultores</span>
                  </div>
                </div>
              </div>

              {/* Botão Pílula ocupando largura total no mobile com ícone externo */}
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

            {/* Coluna do Mapa com bordas 2xl e proporção fluida */}
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
                <div className="absolute top-3 left-3 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#dfb15b] animate-ping" />
                  <span className="text-[11px] font-bold text-white">Oliveira Veículos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
