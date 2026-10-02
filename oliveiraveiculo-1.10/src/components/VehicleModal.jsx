import { photoStyle } from '../lib/photoAdjustments';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  Award,
  Calculator,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Camera,
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { formatVideoUrl } from '../lib/driveUtils';
import { photoDimensions, photoThumbUrl, photoUrl } from '../lib/vehicleImages';

// Formata moeda diretamente — sem spring ativo permanente
const formatBRL = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function VehicleModal({ vehicle, onClose }) {
  const [downPayment, setDownPayment] = useState(() => Math.round((vehicle?.preco ?? 0) * 0.2));
  const [installments, setInstallments] = useState(48);

  // ── Gallery & Video State ─────────────────────────────────────
  const rawGallery = vehicle?.fotos && vehicle.fotos.length > 0 ? vehicle.fotos : (vehicle?.foto ? [vehicle.foto] : []);
  const gallery = rawGallery.map((photo) => ({
    src: photoUrl(photo),
    thumbSrc: photoThumbUrl(photo),
    dimensions: photoDimensions(photo),
    thumbDimensions: photoDimensions(photo, true),
  }));
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const videoInfo = vehicle?.video ? formatVideoUrl(vehicle.video) : null;

  const handlePrev = (e) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveMediaIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveMediaIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  if (!vehicle) return null;

  const financedAmount = Math.max(0, vehicle.preco - downPayment);
  const monthlyRate    = 0.0169;
  const estimatedMonthly =
    financedAmount > 0
      ? Math.round(
          (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, installments))) /
            (Math.pow(1 + monthlyRate, installments) - 1)
        )
      : 0;

  const customWhatsappUrl = `https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.modelo} (${vehicle.anoModelo}) anunciado por ${formatBRL(
      vehicle.preco
    )}. Fiz uma simulação com entrada de ${formatBRL(downPayment)} em ${installments}x de ~${formatBRL(
      estimatedMonthly
    )}. Gostaria de mais informações!`
  )}`;



  const specs = [
    { label: 'Ano / Modelo', value: vehicle.anoModelo, icon: Calendar },
    { label: 'Quilometragem', value: `${vehicle.km.toLocaleString('pt-BR')} km`, icon: Gauge },
    { label: 'Câmbio', value: vehicle.cambio, icon: Award },
    { label: 'Combustível', value: vehicle.combustivel, icon: Fuel },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Animated backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto liquid-glass rounded-2xl shadow-2xl z-10 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10"
        >
          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute top-4 right-4 z-30 p-2 rounded-full liquid-glass text-zinc-700 dark:text-zinc-200 hover:text-gold transition-colors cursor-pointer border border-white/20 shadow-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* ── Hero Media Container (Photo Gallery / Video) ── */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black select-none">
            {/* Top Badges & Video Switcher */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
              <span className="liquid-glass-subtle px-3 py-1 rounded-lg text-xs font-mono font-semibold uppercase text-white border border-white/20">
                {vehicle.marca}
              </span>
              {vehicle.tag && (
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-gold text-black shadow-[0_0_16px_rgba(246,178,17,0.5)]">
                  {vehicle.tag}
                </span>
              )}
              {vehicle.video && (
                <button
                  type="button"
                  onClick={() => setIsVideoActive(!isVideoActive)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    isVideoActive
                      ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,0.6)]'
                      : 'liquid-glass text-gold border border-gold/40 hover:bg-gold/20'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isVideoActive ? 'Ver Fotos' : 'Assistir Vídeo'}</span>
                </button>
              )}
            </div>

            {/* Media Content: Video or Active Image */}
            <AnimatePresence mode="wait">
              {isVideoActive && vehicle.video ? (
                <motion.div
                  key="video-player"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center bg-black"
                >
                  {videoInfo?.type === 'youtube' || videoInfo?.type === 'drive' ? (
                    <iframe
                      src={videoInfo.embedUrl}
                      title={`Vídeo do ${vehicle.modelo}`}
                      loading="lazy"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoInfo?.src || vehicle.video}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeMediaIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  <img
                    src={gallery[activeMediaIndex]?.src || photoUrl(vehicle.foto)}
                    alt={`${vehicle.modelo} - Foto ${activeMediaIndex + 1}`}
                    width={gallery[activeMediaIndex]?.dimensions.width || 1600}
                    height={gallery[activeMediaIndex]?.dimensions.height || 1000}
                    loading="lazy"
                    decoding="async"
                    style={photoStyle(vehicle.fotosAjustes?.[activeMediaIndex])}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gallery Navigation Controls (Only when viewing photos and gallery has > 1 image) */}
            {!isVideoActive && gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full liquid-glass text-white hover:text-gold border border-white/20 hover:border-gold/50 transition-all cursor-pointer shadow-lg"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full liquid-glass text-white hover:text-gold border border-white/20 hover:border-gold/50 transition-all cursor-pointer shadow-lg"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter indicator */}
                <div className="absolute bottom-3 right-4 z-20 liquid-glass px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-white/20 flex items-center gap-1.5 pointer-events-none">
                  <Camera className="w-3 h-3 text-gold" />
                  <span>{activeMediaIndex + 1} / {gallery.length}</span>
                </div>
              </>
            )}

            {/* Title on media (only when viewing photos) */}
            {!isVideoActive && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute bottom-3 left-4 right-20 flex items-end justify-between pointer-events-none"
              >
                <div>
                  <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-wider block drop-shadow-md">
                    {vehicle.categoria} • {vehicle.anoModelo}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-display font-bold text-white drop-shadow-md line-clamp-1">
                    {vehicle.modelo}
                  </h3>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Thumbnails Row (if > 1 photo OR has video) ── */}
          {(gallery.length > 1 || vehicle.video) && (
            <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-black/40 border-b border-black/10 dark:border-white/10 scrollbar-thin">
              {gallery.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsVideoActive(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`relative shrink-0 w-16 h-11 sm:w-20 sm:h-13 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    !isVideoActive && activeMediaIndex === idx
                      ? 'border-gold scale-105 shadow-[0_0_10px_rgba(246,178,17,0.5)]'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/40'
                  }`}
                >
                  <img
                    src={photo.thumbSrc}
                    width={photo.thumbDimensions.width}
                    height={photo.thumbDimensions.height}
                    style={photoStyle(vehicle.fotosAjustes?.[idx])}
                    alt={`Miniatura ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}

              {vehicle.video && (
                <button
                  type="button"
                  onClick={() => setIsVideoActive(true)}
                  className={`relative shrink-0 w-16 h-11 sm:w-20 sm:h-13 rounded-lg overflow-hidden border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isVideoActive
                      ? 'border-red-500 bg-red-950/70 scale-105 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'border-white/20 bg-zinc-900/80 opacity-70 hover:opacity-100 hover:border-gold/50'
                  }`}
                >
                  <Play className={`w-4 h-4 ${isVideoActive ? 'fill-red-400 text-red-400' : 'fill-gold text-gold'}`} />
                  <span className="text-[9px] font-mono uppercase font-bold text-white mt-0.5">Vídeo</span>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Header: Title and Price */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  {vehicle.marca} • {vehicle.categoria} • {vehicle.anoModelo}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-zinc-950 dark:text-white">
                  {vehicle.modelo}
                </h3>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                  Valor à vista
                </span>
                <span className="text-2xl sm:text-3xl font-display font-black text-zinc-950 dark:text-white">
                  {formatBRL(vehicle.preco)}
                </span>
              </div>
            </div>

            {/* Specs grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {specs.map(({ label, value, icon: Icon }) => (
                <motion.div
                  key={label}
                  variants={{
                    hidden:  { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="p-3.5 rounded-xl liquid-glass-subtle border border-black/10 dark:border-white/10 hover:border-gold/30 transition-colors duration-300"
                >
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">{label}</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-gold shrink-0" />
                    {value}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Highlights */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Itens e Diferenciais Verificados</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ...vehicle.destaques,
                  'Garantia de 90 dias motor e caixa',
                  'Documentação 100% regularizada',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl liquid-glass-subtle text-xs text-zinc-700 dark:text-zinc-200 border border-black/5 dark:border-white/5 hover:border-emerald-500/20 transition-colors duration-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Financing Simulator */}
            <div className="p-4 sm:p-5 rounded-2xl liquid-glass-subtle border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gold" />
                  <span className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                    Simulador de Financiamento
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Taxas especiais Maricá
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
                    <span>Valor de Entrada:</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">{formatBRL(downPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.round(vehicle.preco * 0.7)}
                    step="1000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-300 dark:bg-[#252938] rounded-lg appearance-none cursor-pointer accent-[#f6b211]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span>Sem entrada</span>
                    <span>Máx ({formatBRL(Math.round(vehicle.preco * 0.7))})</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">Prazo de Parcelamento:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[36, 48, 60].map((p) => (
                      <motion.button
                        key={p}
                        onClick={() => setInstallments(p)}
                        whileTap={{ scale: 0.92 }}
                        className={`py-2 rounded-lg text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                          installments === p
                            ? 'bg-gold text-black font-bold shadow-[0_0_12px_rgba(246,178,17,0.35)]'
                            : 'liquid-glass-subtle text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-gold/30'
                        }`}
                      >
                        {p}x
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 block">Estimativa de Parcela:</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${installments}-${downPayment}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xl sm:text-2xl font-display font-black text-zinc-950 dark:text-white block"
                    >
                      {installments}x de ~{formatBRL(estimatedMonthly)}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <motion.a
                  href={customWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-whatsapp hover:bg-whatsapp-dark transition-all cursor-pointer shadow-md hover:shadow-emerald-500/25"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Aprovar Financiamento</span>
                </motion.a>
              </div>
            </div>

            {/* Bottom CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.a
                href={customWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-gold hover:bg-gold-light transition-all shadow-md hover:shadow-[0_8px_28px_rgba(246,178,17,0.35)] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>Negociar no WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 liquid-glass-subtle hover:text-black dark:hover:text-white border border-black/10 dark:border-white/20 transition-colors cursor-pointer"
              >
                Continuar Vendo Estoque
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
