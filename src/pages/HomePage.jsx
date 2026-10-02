import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowRight, ArrowUpRight, MessageCircle, ShieldCheck, BadgeCheck, CreditCard, MapPin, ChevronLeft, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from '../components/VehicleCard';
import { publicAsset } from '../lib/publicAsset';

export default function HomePage({ onGoToEstoque, onGoToOndeEstamos, onGoToSobre, onSelectVehicle }) {
  const { vehicles } = useVehicles();
  const carouselRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Detecta se a tela está em desktop (3 colunas) ou mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtra destaques escolhidos pelo Admin ou completa com os primeiros
  const featuredVehicles = useMemo(() => {
    if (!vehicles.length) return [];
    const custom = vehicles.filter((v) => v.destaqueHome);
    if (custom.length >= 3) return custom;
    const customIds = new Set(custom.map((v) => v.id));
    const rest = vehicles.filter((v) => !customIds.has(v.id));
    return [...custom, ...rest];
  }, [vehicles]);

  // spotlightIndex:
  // - No desktop: se stepIndex === 0 (estado inicial 3x3), nenhum card fica forçado em spotlight (todos no padrão clássico nivelados).
  //   Se stepIndex > 0: o próximo carro no centro (stepIndex + 1) entra em destaque com halo e ampliação,
  //   o da esquerda (idx < spotlightIndex) fica como 'o que já passou' retornando ao padrão, e o da direita como 'o que vai passar'.
  // - No mobile: o card ativo no centro da visualização recebe o destaque.
  const spotlightIndex = useMemo(() => {
    if (isDesktop) {
      if (stepIndex === 0) return -1; // 3x3 inicial nivelado
      return stepIndex + 1; // Card central em destaque
    }
    return stepIndex; // Mobile: card atual
  }, [isDesktop, stepIndex]);

  const getStepWidth = useCallback(() => {
    if (!carouselRef.current) return 360;
    const item = carouselRef.current.querySelector('.ov-carousel-item');
    if (!item) return 360;
    const gap = window.innerWidth >= 640 ? 24 : 16;
    return item.offsetWidth + gap;
  }, []);

  const scrollToStep = useCallback(
    (step) => {
      if (!carouselRef.current) return;
      const container = carouselRef.current;
      const stepWidth = getStepWidth();
      const targetLeft = step * stepWidth;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const clamped = Math.max(0, Math.min(maxScroll, targetLeft));

      container.scrollTo({
        left: clamped,
        behavior: 'smooth',
      });
    },
    [getStepWidth]
  );

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const stepWidth = getStepWidth();
    if (!stepWidth) return;

    const currentStep = Math.round(container.scrollLeft / stepWidth);
    const maxScroll = container.scrollWidth - container.clientWidth;
    const maxSteps = Math.ceil(maxScroll / stepWidth);
    const clampedStep = Math.max(0, Math.min(maxSteps, currentStep));

    setStepIndex(clampedStep);
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(container.scrollLeft < maxScroll - 15);
  }, [getStepWidth]);

  const scrollLeft = useCallback(() => {
    const nextStep = Math.max(0, stepIndex - 1);
    scrollToStep(nextStep);
  }, [stepIndex, scrollToStep]);

  const scrollRight = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const stepWidth = getStepWidth();
    const maxSteps = Math.ceil(maxScroll / stepWidth);
    const nextStep = Math.min(maxSteps, stepIndex + 1);
    scrollToStep(nextStep);
  }, [stepIndex, scrollToStep, getStepWidth]);

  const totalSteps = useMemo(() => {
    if (!featuredVehicles.length) return 0;
    if (isDesktop) {
      return Math.max(1, featuredVehicles.length - 2);
    }
    return Math.max(1, featuredVehicles.length - 1);
  }, [featuredVehicles.length, isDesktop]);

  const currentDisplayNumber = useMemo(() => {
    if (!featuredVehicles.length) return 1;
    if (isDesktop) {
      return stepIndex === 0 ? 1 : Math.min(featuredVehicles.length, stepIndex + 2);
    }
    return Math.min(featuredVehicles.length, stepIndex + 1);
  }, [featuredVehicles.length, isDesktop, stepIndex]);

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
                className="btn-shine group relative inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <MessageCircle
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0"
                />
                <span>Falar no WhatsApp</span>
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-80 group-hover:opacity-100"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Estoque em Destaque: Carrossel 3 colunas com avanço de 1 em 1 ── */}
      <section className="ov-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
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
            {/* Contador elegante no padrão 02 / 06 */}
            {featuredVehicles.length > 0 && (
              <span className="text-xs font-mono font-bold text-[#dfb15b] bg-[#dfb15b]/10 border border-[#dfb15b]/30 px-3 py-1.5 rounded-full shadow-inner">
                {String(activeCenterIndex + 1).padStart(2, '0')} / {String(featuredVehicles.length).padStart(2, '0')}
              </span>
            )}

            {/* Setas de navegação */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={activeCenterIndex === 0}
                aria-label="Veículo anterior"
                className={`btn-shine group h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white transition-all flex items-center justify-center shadow-sm ${
                  activeCenterIndex === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:border-[#dfb15b] hover:text-[#dfb15b] cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={activeCenterIndex === featuredVehicles.length - 1}
                aria-label="Próximo veículo"
                className={`btn-shine group h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white transition-all flex items-center justify-center shadow-sm ${
                  activeCenterIndex === featuredVehicles.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:border-[#dfb15b] hover:text-[#dfb15b] cursor-pointer active:scale-95'
                }`}
              >
                <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Botão Ver todos em Pílula */}
            <button
              onClick={onGoToEstoque}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfb15b]/40 bg-[#dfb15b]/10 hover:bg-[#dfb15b] text-[#dfb15b] hover:text-black font-semibold text-xs sm:text-sm px-4 py-2 min-h-[42px] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Ver todos ({vehicles.length})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {featuredVehicles.length ? (
          <div>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="-mx-4 sm:-mx-6 -my-4 flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 py-8 scroll-smooth snap-x snap-mandatory items-center"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredVehicles.map((v, idx) => {
                const isCenter = idx === activeCenterIndex;

                return (
                  <div
                    key={v.id}
                    className={`ov-carousel-item relative shrink-0 snap-center transition-all duration-500 ease-out w-[84vw] max-w-[340px] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] ${
                      isCenter
                        ? 'scale-[1.03] z-20 opacity-100'
                        : 'scale-100 opacity-90 hover:opacity-100 z-10'
                    }`}
                  >
                    {/* Halo de luz dourada atmosférica ativo exclusivamente quando o carro passa pelo centro */}
                    {isCenter && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-[#dfb15b]/25 blur-xl opacity-90 transition-opacity duration-500"
                      />
                    )}

                    <div
                      className={`h-full w-full rounded-2xl transition-all duration-500 ${
                        isCenter
                          ? 'ring-1 ring-[#dfb15b]/60 shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(223,177,91,0.22)]'
                          : 'shadow-md'
                      }`}
                    >
                      <VehicleCard vehicle={v} onSelectVehicle={onSelectVehicle} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicadores de Paginação em Pílulas */}
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
              {featuredVehicles.map((v, idx) => {
                const isActive = idx === activeCenterIndex;
                return (
                  <button
                    key={`dot-${v.id}-${idx}`}
                    onClick={() => scrollToIdx(idx)}
                    aria-label={`Ir para ${v.modelo || `veículo ${idx + 1}`}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-8 h-2 bg-[#dfb15b] shadow-[0_0_12px_rgba(223,177,91,0.6)]'
                        : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                );
              })}
            </div>
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
              className="btn-shine group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/10 hover:bg-[#dfb15b] hover:text-black border border-white/15 px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-white transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
              onClick={onGoToSobre}
            >
              <span>Conheça nossa loja</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0"
              />
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
                  className="btn-shine group relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm min-h-[46px] px-6 py-3 transition-all duration-300 active:scale-95 shadow-md cursor-pointer"
                >
                  <Navigation
                    size={16}
                    className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0"
                  />
                  <span>Ver no Google Maps</span>
                  <ArrowUpRight
                    size={16}
                    className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-90 group-hover:opacity-100"
                  />
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
