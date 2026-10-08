import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowRight, ArrowUpRight, MessageCircle, ShieldCheck, BadgeCheck, CreditCard, MapPin, ChevronLeft, ChevronRight, Sparkles, Navigation } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from '../components/VehicleCard';
import { publicAsset } from '../lib/publicAsset';

export default function HomePage({ onGoToEstoque, onGoToFinanciamento, onGoToSobre, onSelectVehicle }) {
  const { vehicles } = useVehicles();
  const carouselContainerRef = useRef(null);

  // Filtra destaques escolhidos pelo Admin ou completa com os primeiros (até 6 veículos)
  const featuredVehicles = useMemo(() => {
    if (!vehicles.length) return [];
    const custom = vehicles.filter((v) => v.destaqueHome);
    if (custom.length >= 3) return custom;
    const customIds = new Set(custom.map((v) => v.id));
    const rest = vehicles.filter((v) => !customIds.has(v.id));
    const combined = [...custom, ...rest];
    return combined.slice(0, 6);
  }, [vehicles]);

  // Índice atual do carrossel finito (0 a maxIndex)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Touch swipe refs
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Atualiza a largura do container responsivamente via ResizeObserver
  useEffect(() => {
    if (!carouselContainerRef.current) return;
    const update = () => {
      if (carouselContainerRef.current) {
        setContainerWidth(carouselContainerRef.current.offsetWidth);
      }
    };
    update();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(carouselContainerRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [featuredVehicles.length]);

  // Responsividade dos cards para layout Sangrado (Full-Bleed):
  const { cardWidth, gap, centerCount } = useMemo(() => {
    if (containerWidth >= 1600) {
      const targetWidth = Math.min(380, Math.floor(containerWidth * 0.22));
      return { cardWidth: Math.max(350, targetWidth), gap: 24, centerCount: 3 };
    }
    if (containerWidth >= 1280) {
      const targetWidth = Math.min(360, Math.floor(containerWidth * 0.26));
      return { cardWidth: Math.max(330, targetWidth), gap: 20, centerCount: 3 };
    }
    if (containerWidth >= 1024) {
      const targetWidth = Math.min(345, Math.floor(containerWidth * 0.30));
      return { cardWidth: Math.max(315, targetWidth), gap: 16, centerCount: 3 };
    }
    if (containerWidth >= 640) {
      const targetWidth = Math.min(340, Math.floor(containerWidth * 0.44));
      return { cardWidth: targetWidth, gap: 16, centerCount: 2 };
    }
    return {
      cardWidth: Math.min(330, Math.floor(containerWidth * 0.82)),
      gap: 12,
      centerCount: 1,
    };
  }, [containerWidth]);

  // Limites exatos de início e fim
  const maxIndex = Math.max(0, featuredVehicles.length - centerCount);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  // Ajusta currentIndex se a quantidade de veículos mudar
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((dotIdx) => {
    setCurrentIndex(Math.min(dotIdx, maxIndex));
  }, [maxIndex]);

  // Suporte a arrasto no touch respeitando início e fim
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50 && canNext) nextSlide();
    if (diff < -50 && canPrev) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Cálculo da posição de centralização do trio ativo com início e fim
  const trioWidth = centerCount * cardWidth + (centerCount - 1) * gap;
  const step = cardWidth + gap;
  const translateX = containerWidth / 2 - (currentIndex * step + trioWidth / 2);

  const scrollToSection = useCallback((sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const navOffset = window.innerWidth >= 640 ? 96 : 80;
    const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  return (
    <div className="ov-home text-gray-900 dark:text-white bg-[#f7f8fa] dark:bg-[#090a0b] transition-colors duration-300">
      {/* ── Hero Section 2048x911 Proporcional (100% Visível sem Cortes) ── */}
      <section
        id="inicio-hero"
        className="ov-hero relative w-full overflow-hidden bg-white dark:bg-[#090a0b] flex flex-col md:flex-row md:items-end pt-16 md:pt-0 md:aspect-[2048/911]"
      >
        <div className="sr-only">
          <h1>Seu próximo carro está aqui</h1>
          <p>Encontre o carro certo para o seu momento com atendimento próximo e informações claras em cada etapa.</p>
        </div>
        {/* Banner 100% visível e proporcional em qualquer tela (sem cortes no celular) */}
        <div className="ov-hero-banner relative w-full aspect-[2048/911] overflow-hidden md:absolute md:inset-0 md:h-full md:aspect-auto">
          <img
            className="w-full h-full object-contain md:object-cover object-center pointer-events-none select-none"
            src={publicAsset('loja-oliveira-banner-2048.png')}
            alt="Oliveira Veículos - Seu próximo carro está aqui"
            width="2048"
            height="911"
            fetchPriority="high"
            decoding="async"
          />
          {/* Overlay suave apenas em desktop para preservar 100% de nitidez da foto no celular */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#090a0b] via-[#090a0b]/20 to-transparent pointer-events-none" />
        </div>

        {/* CTAs em formato Pílula (Fundo Branco no Claro, adaptável no Dark Mode) */}
        <div className="ov-hero-shell relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-4 md:pt-0 md:pb-6 bg-white dark:bg-[#090a0b] md:bg-transparent md:dark:bg-transparent transition-colors duration-300">
          <div className="ov-hero-content max-w-2xl">
            <div className="ov-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                className="btn-shine group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm sm:text-base min-h-[46px] px-6 py-2.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto"
                onClick={onGoToEstoque}
              >
                <span>Explorar veículos</span>
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </button>

              <a
                href={COMPANY_DATA.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group relative inline-flex min-h-[46px] items-center justify-center gap-2 overflow-hidden rounded-full border border-gray-300/80 bg-gray-50/90 text-gray-900 shadow-sm hover:border-[#dfb15b]/60 hover:bg-white active:scale-95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 md:border-white/20 md:bg-white/10 md:text-white md:backdrop-blur-md px-6 py-2.5 text-sm sm:text-base font-semibold transition-all duration-300 w-full sm:w-auto cursor-pointer"
              >
                <MessageCircle
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0 text-[#25D366] dark:text-[#25D366] md:text-white"
                />
                <span>Falar no WhatsApp</span>
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-70 group-hover:opacity-100 text-gray-600 dark:text-white/80 md:text-white/80"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Roteiro curto: apresenta a jornada antes dos blocos detalhados. */}
      <nav
        aria-label="Etapas para comprar seu veículo"
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 md:-mt-4"
      >
        <ol className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-[#111215] dark:shadow-black/30 overflow-hidden">
          {[
            { number: '01', title: 'Escolha seu carro', text: 'Compare os veículos em destaque.', target: 'estoque-destaque' },
            { number: '02', title: 'Planeje a compra', text: 'Conheça as opções de financiamento.', target: 'planeje-compra' },
            { number: '03', title: 'Converse e visite', text: 'Tire dúvidas e veja o carro de perto.', target: 'visite-loja' },
          ].map((step, index) => (
            <li key={step.number} className={index ? 'border-t sm:border-t-0 sm:border-l border-gray-200/80 dark:border-white/10' : ''}>
              <button
                type="button"
                onClick={() => scrollToSection(step.target)}
                className="group w-full min-h-[88px] px-4 sm:px-5 py-4 text-left flex items-center gap-3 hover:bg-[#dfb15b]/[0.07] focus-visible:bg-[#dfb15b]/[0.07] transition-colors cursor-pointer"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfb15b]/15 text-xs font-black text-[#b7791f] dark:text-[#dfb15b]">
                  {step.number}
                </span>
                <span className="min-w-0">
                  <strong className="flex items-center gap-1.5 text-sm font-extrabold text-gray-950 dark:text-white">
                    {step.title}
                    <ArrowRight size={14} className="text-[#dfb15b] transition-transform group-hover:translate-x-0.5" />
                  </strong>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">{step.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Estoque em Destaque: Carrossel Sangrado (Full-Bleed até o final da tela) ── */}
      <section
        id="estoque-destaque"
        className="ov-section scroll-mt-24 sm:scroll-mt-28 relative w-full pt-6 sm:pt-8 lg:pt-10 pb-5 sm:pb-7 overflow-hidden"
      >
        {/* Cabeçalho alinhado ao grid central da loja */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="ov-section-top flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
                <Sparkles size={13} className="text-[#dfb15b]" />
                <span>ETAPA 1 · ESCOLHA</span>
              </span>
              <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] font-extrabold tracking-tight text-gray-950 dark:text-white leading-tight">
                Encontre seu próximo carro
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
                Escolhas selecionadas para conhecer de perto e chamar de suas.
              </p>
            </div>

            <div className="flex items-center justify-start sm:justify-end shrink-0">
              <button
                onClick={onGoToEstoque}
                className="btn-shine inline-flex items-center gap-2 rounded-full border border-[#dfb15b]/40 bg-[#dfb15b]/10 hover:bg-[#dfb15b] text-[#dfb15b] hover:text-black font-semibold text-xs sm:text-sm px-5 py-2.5 min-h-11 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span>Ver todos ({vehicles.length})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {featuredVehicles.length ? (
          <div id="vitrine-carros" className="relative w-full">
            {/* Vinhetas de fade cinematográficas nas bordas extremas do monitor */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 lg:w-28 bg-gradient-to-r from-[#f7f8fa] dark:from-[#090a0b] via-[#f7f8fa]/70 dark:via-[#090a0b]/70 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 lg:w-28 bg-gradient-to-l from-[#f7f8fa] dark:from-[#090a0b] via-[#f7f8fa]/70 dark:via-[#090a0b]/70 to-transparent z-20" />

            {/* Botões de navegação flutuantes sobre as laterais */}
            <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 lg:px-10">
              <button
                onClick={canPrev ? prevSlide : undefined}
                disabled={!canPrev}
                aria-label="Veículo anterior"
                className={`pointer-events-auto group h-11 w-11 sm:h-12 sm:w-12 rounded-full border transition-all duration-200 flex items-center justify-center backdrop-blur-md ${
                  canPrev
                    ? 'bg-white/95 dark:bg-[#131417]/90 hover:bg-[#dfb15b] border-gray-200 dark:border-white/20 hover:border-[#dfb15b] text-gray-900 dark:text-white hover:text-black shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] active:scale-95 cursor-pointer'
                    : 'bg-gray-200/50 dark:bg-[#131417]/40 border-gray-200/50 dark:border-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed opacity-25 shadow-none'
                }`}
              >
                <ChevronLeft size={22} className={`stroke-[2.5] transition-transform duration-200 ${canPrev ? 'group-hover:-translate-x-0.5' : ''}`} />
              </button>

              <button
                onClick={canNext ? nextSlide : undefined}
                disabled={!canNext}
                aria-label="Próximo veículo"
                className={`pointer-events-auto group h-11 w-11 sm:h-12 sm:w-12 rounded-full border transition-all duration-200 flex items-center justify-center backdrop-blur-md ${
                  canNext
                    ? 'bg-white/95 dark:bg-[#131417]/90 hover:bg-[#dfb15b] border-gray-200 dark:border-white/20 hover:border-[#dfb15b] text-gray-900 dark:text-white hover:text-black shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] active:scale-95 cursor-pointer'
                    : 'bg-gray-200/50 dark:bg-[#131417]/40 border-gray-200/50 dark:border-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed opacity-25 shadow-none'
                }`}
              >
                <ChevronRight size={22} className={`stroke-[2.5] transition-transform duration-200 ${canNext ? 'group-hover:translate-x-0.5' : ''}`} />
              </button>
            </div>

            {/* Container do carrossel full-bleed (sangrado até o final da tela) */}
            <div
              ref={carouselContainerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-full overflow-hidden py-3 sm:py-4 touch-pan-y"
            >
              {/* Trilho de deslizamento com cards RETOS */}
              <div
                className="flex items-stretch"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                  gap: `${gap}px`,
                }}
              >
                {featuredVehicles.map((v, trackIdx) => {
                  const isCenter = trackIdx >= currentIndex && trackIdx < currentIndex + centerCount;
                  const isLeftEdge = trackIdx === currentIndex - 1;
                  const isRightEdge = trackIdx === currentIndex + centerCount;
                  const isEdge = isLeftEdge || isRightEdge;

                  return (
                    <div
                      key={`featured-${v.id}-${trackIdx}`}
                      onClick={isEdge ? (isLeftEdge ? prevSlide : nextSlide) : undefined}
                      style={{
                        width: `${cardWidth}px`,
                        transform: 'none',
                      }}
                      className={`ov-carousel-item relative shrink-0 select-none transition-all duration-300 ease-out ${isCenter
                          ? 'opacity-100 z-10'
                          : isEdge
                            ? 'opacity-50 hover:opacity-85 cursor-pointer z-0 filter brightness-90'
                            : 'opacity-25 pointer-events-none z-0 filter brightness-75'
                        }`}
                    >
                      <div className="h-full w-full">
                        <VehicleCard vehicle={v} onSelectVehicle={onSelectVehicle} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indicadores de Paginação em Dots */}
            {maxIndex > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3.5 sm:mt-5">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Ir para posição ${idx + 1}`}
                      aria-current={isActive ? 'true' : undefined}
                      className="group/dot inline-flex h-11 min-w-11 items-center justify-center rounded-full cursor-pointer shrink-0"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-[7px] rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-7 sm:w-8 bg-[#dfb15b] shadow-[0_0_12px_rgba(223,177,91,0.6)]'
                            : 'w-2 bg-gray-300 group-hover/dot:bg-gray-400 dark:bg-white/20 dark:group-hover/dot:bg-white/40'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center text-sm text-gray-600 dark:text-gray-400">
              O estoque está sendo atualizado. Fale com a equipe para conhecer as opções disponíveis.
            </div>
          </div>
        )}
      </section>

      {/* ── Etapa 2: planejamento e confiança ── */}
      <section id="planeje-compra" className="ov-values scroll-mt-24 border-y border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#0d0e11] py-10 sm:py-14 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ov-values-grid grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
              <CreditCard size={13} />
              <span>ETAPA 2 · PLANEJE</span>
            </span>
            <h2 className="text-[clamp(1.6rem,5vw,2.75rem)] font-black tracking-tight text-gray-950 dark:text-white leading-tight mb-3">
              Encontre uma condição que faça sentido
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
              Depois de escolher o carro, simule o financiamento e conte com nossa equipe para entender cada etapa antes de decidir.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-3">
              <button
                className="btn-shine group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black px-5 py-2.5 min-h-[46px] text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                onClick={onGoToFinanciamento}
              >
                <span>Simular financiamento</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 hover:border-[#dfb15b]/60 px-5 py-2.5 min-h-[46px] text-sm font-bold text-gray-900 transition-all active:scale-95 cursor-pointer dark:border-white/15 dark:bg-white/5 dark:text-white"
                onClick={onGoToSobre}
              >
                <span>Conheça a Oliveira</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-5 flex items-start gap-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Garantia de Motor e Caixa</strong>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Veículos revisados com garantia de motor e caixa de câmbio.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-5 flex items-start gap-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
                <BadgeCheck size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Atendimento de verdade</strong>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Converse com nossa equipe antes de decidir.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Etapa 3: conversa e visita ── */}
      <section id="visite-loja" className="ov-visit scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-14">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-8 lg:p-10 shadow-xl overflow-hidden dark:border-white/10 dark:bg-gradient-to-b dark:from-[#141518] dark:to-[#0c0d0f] dark:shadow-2xl transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Coluna de Informações e Chamada */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
                  <MapPin size={13} />
                  <span>ETAPA 3 · CONVERSE E VISITE</span>
                </span>

                {/* Título com correção textual e clamp anti-estouro */}
                <h2 className="text-[clamp(1.5rem,5.5vw,2.5rem)] font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight break-words mb-3">
                  Veja o carro de perto
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                  Tire suas dúvidas com a equipe e, quando estiver pronto, visite a Oliveira Veículos em {COMPANY_DATA.address}.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-[#dfb15b] shrink-0" />
                    <span>Segunda a Sexta: 08:30 às 18:30 · Sábado: 08:30 às 14:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
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
              <div className="relative aspect-video sm:h-72 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner bg-gray-100 dark:bg-black">
                <iframe
                  title="Mapa Oliveira Veículos Maricá"
                  src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 filter dark:invert-[90%] dark:hue-rotate-180 dark:contrast-[115%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/15 shadow-md flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#dfb15b] animate-ping" />
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white">Oliveira Veículos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
