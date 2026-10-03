import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { MOMENTS_DATA } from '../data/momentsData';

// Avaliações reais do perfil da loja no Google
const GOOGLE_REVIEWS = [
  {
    id: 1,
    author: 'Italo Augusto',
    quote: 'Atendimento excepcional, e facilitaram a compra do meu veículo. Gostei muito e recomendo.',
    rating: 5,
    tag: 'Compra realizada',
  },
  {
    id: 2,
    author: 'Alan Ribeiro Papo de futuro',
    quote: 'Atendimento com respeito e qualidade, veículos revisados e com garantia e super transparente nas informações. Eu indico.',
    rating: 5,
    tag: 'Cliente satisfeito',
  },
  {
    id: 3,
    author: 'Maria Eduarda Bruno',
    quote: 'Funcionários muito atenciosos e dedicados! Tive uma ótima experiência!!',
    rating: 5,
    tag: 'Recomendação',
  },
];

export default function SocialProof({ onGoToEstoque }) {
  // Lightbox modal para ampliar foto/print sem cortes
  const [activeMedia, setActiveMedia] = useState(null);

  // Carrossel de Momentos 9:16
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const cardWidth = 320;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  // Avaliações do Google: paginação de 3 em 3
  const [reviewPage, setReviewPage] = useState(0);
  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(GOOGLE_REVIEWS.length / reviewsPerPage);
  const visibleReviews = GOOGLE_REVIEWS.slice(
    reviewPage * reviewsPerPage,
    (reviewPage + 1) * reviewsPerPage
  );

  // Controle de 'Ler mais' para relatos longos
  const [expandedReviews, setExpandedReviews] = useState({});
  const toggleExpand = (id) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const finalCtaWhatsapp = `https://wa.me/5521998016913?text=${encodeURIComponent(
    'Olá! Vi as experiências dos clientes no site e quero encontrar meu próximo carro. Podem me ajudar?'
  )}`;

  return (
    <section id="momentos" className="relative py-12">
      {/* ── 1. EXPERIÊNCIAS E ENTREGAS (9:16) ────────────────────────── */}
      <div className="mb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-[#cf8d3c] bg-[#cf8d3c]/10 mb-2">
              <span>HISTÓRIAS REAIS DE QUEM ESCOLHEU A OLIVEIRA</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-gray-950 dark:text-white tracking-tight">
              Experiências dos Nossos Clientes
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl">
              Registros reais de entregas e conquistas. Clique em qualquer card para visualizar os detalhes em tela cheia.
            </p>
          </div>

          {/* Controles do carrossel */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => scrollCarousel('left')}
              aria-label="Momento anterior"
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#cf8d3c] hover:text-[#cf8d3c] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              aria-label="Próximo momento"
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#cf8d3c] hover:text-[#cf8d3c] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carrossel Horizontal com Snap / Peek no Mobile e Scroll Suave no Desktop */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth px-6 sm:px-0 -mx-4 sm:mx-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollPaddingInline: '24px' }}
        >
          {MOMENTS_DATA.map((moment) => (
            <div
              key={moment.id}
              onClick={() => setActiveMedia(moment)}
              className="group shrink-0 w-[76vw] max-w-[280px] sm:w-[300px] snap-center rounded-2xl overflow-hidden bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] hover:border-[#cf8d3c]/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Área de mídia com proporção 9:16 (Stories do Instagram) */}
              <div className="relative aspect-[9/16] overflow-hidden bg-black">
                <img
                  src={moment.photo}
                  alt={`Entrega para ${moment.client}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Botão de ampliação visual */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </div>

                {/* Localização da entrega */}
                {moment.neighborhood && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm flex items-center gap-1 border border-white/20">
                    <MapPin size={11} className="text-[#cf8d3c]" />
                    <span>{moment.neighborhood}</span>
                  </div>
                )}

                {/* Informações sobrepostas na base do Story */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="text-xs font-mono font-semibold text-[#cf8d3c] block mb-0.5">
                    {moment.car}
                  </span>
                  <h4 className="font-display font-bold text-base leading-snug">
                    {moment.client}
                  </h4>
                  <p className="mt-2 text-xs text-gray-200 line-clamp-3 leading-relaxed italic">
                    “{moment.quote}”
                  </p>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="p-3.5 bg-gray-50 dark:bg-[#181818] flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-[#262626]">
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Entrega realizada</span>
                </span>
                <span className="text-[#cf8d3c] font-semibold group-hover:underline">
                  Ver detalhes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. AVALIAÇÕES DO GOOGLE ─────────────────────────────────── */}
      <div className="mb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#cf8d3c]" />
              <span>AVALIAÇÕES REAIS DE CLIENTES</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-950 dark:text-white">
              Mais avaliações no Google
            </h3>
          </div>

          <a
            href="https://www.google.com/maps/place/Oliveira+Ve%C3%ADculos+Maric%C3%A1/@-22.9033231,-42.7993074,17z/data=!3m1!4b1!4m6!3m5!1s0x99ed9b8c5bf7ab:0x9229d06d2cf0423d!8m2!3d-22.9033231!4d-42.7993074!16s%2Fg%2F11t0rpf0sy"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#cf8d3c]/40 px-4 py-2 text-xs sm:text-sm font-bold text-[#cf8d3c] hover:bg-[#cf8d3c] hover:text-black transition-all active:scale-95 cursor-pointer"
          >
            <span>Ver todas no Google</span>
            <ArrowRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleReviews.map((review) => {
            const isLong = review.quote.length > 90;
            const isExpanded = !!expandedReviews[review.id];
            return (
              <div
                key={review.id}
                className="rounded-2xl p-6 ov-card-glass flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={15} className="fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">Google 5.0</span>
                  </div>

                  <Quote className="w-5 h-5 text-[#cf8d3c]/40 mb-2" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    “{isExpanded || !isLong ? review.quote : `${review.quote.slice(0, 90)}...`}”
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(review.id)}
                      className="mt-2 text-xs font-bold text-[#cf8d3c] hover:underline cursor-pointer"
                    >
                      {isExpanded ? 'Ler menos' : 'Ler mais'}
                    </button>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {review.author}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Avaliação verificada no Google
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão em Pílula no Mobile: "Ver mais avaliações" (Regra 6) */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://www.google.com/maps/place/Oliveira+Ve%C3%ADculos+Maric%C3%A1/@-22.9033231,-42.7993074,17z/data=!3m1!4b1!4m6!3m5!1s0x99ed9b8c5bf7ab:0x9229d06d2cf0423d!8m2!3d-22.9033231!4d-42.7993074!16s%2Fg%2F11t0rpf0sy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-[#dfb15b] hover:text-black dark:hover:text-black text-gray-800 dark:text-white px-6 py-3 min-h-[44px] text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Ver mais avaliações no Google</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>

      {/* ── 3. CHAMADA FINAL PARA CONTATO (DESIGN MARCANTE) ─────────── */}
      <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0a0a0a] text-white border border-[#cf8d3c]/30 shadow-2xl relative overflow-hidden">
        {/* Glow dourado de fundo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#cf8d3c]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e8b577] font-bold block mb-3">
            SEU PRÓXIMO PASSO
          </span>

          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-tight">
            Sua próxima conquista começa com uma conversa.
          </h3>

          <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
            Conte qual carro você procura e quanto pretende dar de entrada. Nossa equipe ajuda você a encontrar opções e consultar as condições de financiamento para o seu perfil.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <a
              href={finalCtaWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm sm:text-base font-bold text-gray-950 bg-gradient-to-r from-[#e5a350] to-[#cf8d3c] hover:brightness-110 transition-all shadow-lg hover:shadow-[#cf8d3c]/25 cursor-pointer"
            >
              <span>Quero encontrar meu próximo carro</span>
              <MessageSquare className="w-5 h-5 fill-current" />
            </a>

            {onGoToEstoque && (
              <button
                type="button"
                onClick={onGoToEstoque}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-white border border-white/30 hover:border-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Explorar veículos</span>
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL LIGHTBOX PARA AMPLIAR PRINTS/FOTOS ────────────────── */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMedia(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl cursor-default"
            >
              <button
                onClick={() => setActiveMedia(null)}
                aria-label="Fechar visualização"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="relative aspect-[9/16] max-h-[75vh] w-full bg-black">
                <img
                  src={activeMedia.photo}
                  alt={activeMedia.client}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-5">
                <span className="text-xs font-mono font-bold text-[#cf8d3c]">
                  {activeMedia.car} • {activeMedia.neighborhood}
                </span>
                <h4 className="font-display font-bold text-lg text-gray-950 dark:text-white mt-1">
                  {activeMedia.client}
                </h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  “{activeMedia.quote}”
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
