import { photoStyle, normalizePhotoAdjustment } from '../lib/photoAdjustments';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Palette,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  Camera,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Car,
  Calculator,
  Award,
  FileCheck,
  Wrench,
  Phone,
  MapPin,
  Building2,
  Clock,
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { formatVideoUrl } from '../lib/driveUtils';
import { Reveal } from './Reveal';
import { photoDimensions, photoThumbUrl, photoUrl } from '../lib/vehicleImages';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from './VehicleCard';

const formatPrice = (value) =>
  (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const formatKm = (km) => (Number(km) || 0).toLocaleString('pt-BR') + ' km';

// ── Player de vídeo: YouTube, Google Drive, arquivo direto ou link externo ──
function VideoPlayer({ info, title }) {
  if (info.type === 'youtube' || info.type === 'drive') {
    return (
      <iframe
        src={info.embedUrl}
        title={`Vídeo do ${title}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full bg-black"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  if (info.type === 'direct') {
    return (
      <video
        src={info.src}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    );
  }

  // Link que não dá para incorporar (Instagram, Facebook, etc.)
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] p-6 text-center">
      <Play className="h-10 w-10 text-[#dfb15b]" />
      <p className="max-w-xs text-sm text-gray-300">Este vídeo abre em outra página.</p>
      <a
        href={info.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#dfb15b] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#efc676]"
      >
        <ExternalLink className="h-4 w-4" /> Assistir vídeo
      </a>
    </div>
  );
}

export default function VehicleDetailView({ vehicle, onBack, onSelectVehicle }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOn, setVideoOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const { vehicles } = useVehicles();
  const relatedVehicles = useMemo(() => {
    if (!vehicles?.length) return [];
    return vehicles.filter((v) => v.id !== vehicle?.id).slice(0, 3);
  }, [vehicles, vehicle?.id]);

  const gallery = useMemo(() => {
    const raw = vehicle?.fotos?.length ? vehicle.fotos : vehicle?.foto ? [vehicle.foto] : [];
    return raw.map((photo) => ({
      src: photoUrl(photo),
      thumbSrc: photoThumbUrl(photo),
      dimensions: photoDimensions(photo),
      thumbDimensions: photoDimensions(photo, true),
    }));
  }, [vehicle]);

  const video = useMemo(() => (vehicle?.video ? formatVideoUrl(vehicle.video) : null), [vehicle]);

  // Ao trocar de veículo, volta para a primeira foto
  useEffect(() => {
    setActiveIndex(0);
    setVideoOn(false);
  }, [vehicle?.id]);

  const next = () => setActiveIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
  const prev = () => setActiveIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));

  // Setas do teclado
  useEffect(() => {
    if (gallery.length < 2 || videoOn) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gallery.length, videoOn]);

  if (!vehicle) return null;

  const year = vehicle.anoModelo || vehicle.ano;
  const whatsappUrl = `https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no ${vehicle.modelo} (${year}) anunciado no site por ${formatPrice(vehicle.preco)}. Gostaria de saber mais informações!`
  )}`;
  const scheduleVisitUrl = `https://wa.me/${COMPANY_DATA.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma visita para ver de perto o ${vehicle.modelo} (${year}) na loja de Maricá.`
  )}`;

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?veiculo=${vehicle.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: vehicle.modelo, text: `${vehicle.modelo} na Oliveira Veículos`, url });
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copie o link do veículo:', url);
    }
  }



  const arrowClass =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-opacity hover:bg-black/65 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

  return (
    <div id="detalhes-conteudo" className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-32 sm:pb-28 lg:pb-20">
      {/* ── 1. Barra Superior Adaptada ao Modelo ("Detalhes do anúncio") ── */}
      <div className="mb-3 flex items-center justify-between border-b border-gray-200/80 dark:border-white/10 pb-3">
        <button
          onClick={onBack}
          aria-label="Voltar ao estoque"
          className="group inline-flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-md hover:border-[#dfb15b]/50 hover:text-[#dfb15b] transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Voltar ao estoque</span>
        </button>

        <h2 className="text-sm sm:text-base font-extrabold text-gray-950 dark:text-white tracking-tight">
          Detalhes do anúncio
        </h2>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartilhar anúncio"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-md hover:border-[#dfb15b]/50 hover:text-[#dfb15b] transition-all active:scale-95"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
        </button>
      </div>

      <div className="mt-4">
          {/* Palco: Galeria de Fotos / Vídeo com indicadores */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:aspect-[16/10]">
              {videoOn && video ? (
                <VideoPlayer info={video} title={vehicle.modelo} />
              ) : gallery.length > 0 ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeIndex}
                    src={gallery[activeIndex].src}
                    alt={`${vehicle.modelo} — foto ${activeIndex + 1}`}
                    width={gallery[activeIndex].dimensions.width}
                    height={gallery[activeIndex].dimensions.height}
                    loading="lazy"
                    decoding="async"
                    style={{ ...photoStyle(vehicle.fotosAjustes?.[activeIndex]), transform: undefined }}
                    drag={gallery.length > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60) next();
                      else if (info.offset.x > 60) prev();
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: normalizePhotoAdjustment(vehicle.fotosAjustes?.[activeIndex]).zoom }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    draggable={false}
                    className="h-full w-full touch-pan-y select-none object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                  <Camera className="h-10 w-10" />
                  <span className="text-sm">Fotos em breve</span>
                </div>
              )}

              {/* Botão em pílula sobre a foto estilo "Ver 360°" / "Ver vídeo" */}
              {video && !videoOn && (
                <button
                  onClick={() => setVideoOn(true)}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 hover:bg-black/85 text-white backdrop-blur-md px-4 py-1.5 text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer border border-white/20"
                >
                  <Play className="h-3.5 w-3.5 fill-[#dfb15b] text-[#dfb15b]" />
                  <span>Assistir vídeo</span>
                </button>
              )}

              {videoOn && (
                <button
                  onClick={() => setVideoOn(false)}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 hover:bg-black/85 text-white backdrop-blur-md px-4 py-1.5 text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer border border-white/20"
                >
                  <Camera className="h-3.5 w-3.5 text-[#dfb15b]" />
                  <span>Ver fotos</span>
                </button>
              )}

              {/* Setas de navegação */}
              {!videoOn && gallery.length > 1 && (
                <>
                  <button onClick={prev} className={`${arrowClass} left-3`} aria-label="Foto anterior">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={next} className={`${arrowClass} right-3`} aria-label="Próxima foto">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {activeIndex + 1} / {gallery.length}
                  </span>
                </>
              )}

              {/* Indicadores de pontinhos (dots pagination) inspirados no modelo */}
              {!videoOn && gallery.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                  {gallery.slice(0, 10).map((_, i) => (
                    <span
                      key={i}
                      className={`transition-all duration-300 rounded-full ${
                        activeIndex === i
                          ? 'w-4 h-1.5 bg-white shadow-md'
                          : 'w-1.5 h-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Miniaturas em rolagem horizontal */}
            {(gallery.length > 1 || video) && (
              <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {video && (
                  <button
                    onClick={() => setVideoOn(true)}
                    aria-label="Assistir vídeo"
                    className={`relative h-16 w-24 shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg bg-gray-900 sm:h-20 sm:w-28 ${
                      videoOn ? 'ring-2 ring-[#dfb15b]' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    {video.thumb && (
                      <img
                        src={video.thumb}
                        alt=""
                        width="480"
                        height="360"
                        loading="lazy"
                        className="h-full w-full object-cover opacity-70"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfb15b] shadow-lg">
                        <Play className="h-4 w-4 fill-black text-black" />
                      </span>
                    </span>
                  </button>
                )}

                {gallery.map((photo, i) => (
                  <button
                    key={`${photo.src}-${i}`}
                    onClick={() => {
                      setVideoOn(false);
                      setActiveIndex(i);
                    }}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`h-16 w-24 shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg transition-all sm:h-20 sm:w-28 ${
                      !videoOn && activeIndex === i
                        ? 'ring-2 ring-[#dfb15b]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.thumbSrc} width={photo.thumbDimensions.width} height={photo.thumbDimensions.height} style={photoStyle(vehicle.fotosAjustes?.[i])} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Conteúdo Principal do Veículo ── */}
          <div className="mt-6">
            {/* Título, Versão, Badges, Preço e Botões de Ação */}
            <div className="border-b border-gray-100 dark:border-white/10 pb-6">
              {/* Badges de Destaque & Status */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfb15b]/35 bg-[#dfb15b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#dfb15b]">
                  <Sparkles size={11} className="text-[#dfb15b]" />
                  <span>{vehicle.tag || 'Seminovo Selecionado'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online / Pronta Entrega
                </span>
              </div>

              {/* Título e Versão */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-950 dark:text-white leading-tight">
                  {vehicle.modelo}
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {vehicle.subtituloCard || `${vehicle.modelo} ${vehicle.ano}`}
                </p>
              </div>

              {/* Bloco de Preço com Rótulo e Parcelamento */}
              <div id="secao-preco" className="mt-5">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Valor à vista
                </span>
                <div className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-gray-950 dark:text-[#dfb15b] leading-tight">
                  {formatPrice(vehicle.preco)}
                </div>
                {vehicle.parcela && (
                  <div className="mt-2.5 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-white/[0.04] px-3.5 py-2 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <Calculator size={14} className="text-[#dfb15b] shrink-0" />
                    <span>
                      ou entrada + parcelas a partir de{' '}
                      <strong className="text-gray-950 dark:text-white font-extrabold">
                        R$ {vehicle.parcela}/mês
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* ── Botões de Ação Principais (Falar sobre este carro + Agendar visita) ── */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine group relative flex min-h-[50px] flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-6 py-3.5 text-sm font-extrabold text-black shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 fill-black text-black transition-transform group-hover:scale-110" />
                  <span>Falar sobre este carro</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  href={scheduleVisitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-[#dfb15b]/40 bg-transparent hover:bg-[#dfb15b]/10 px-6 py-3.5 text-sm font-bold text-gray-900 dark:text-white transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 text-[#dfb15b]" />
                  <span>Agendar visita na loja</span>
                </a>
              </div>
            </div>

            {/* Bloco de Localização / Cidade */}
            <div className="py-4 border-b border-gray-100 dark:border-white/10">
              <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                Cidade
              </span>
              <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                Maricá, Rio de Janeiro (RJ)
              </span>
            </div>

            {/* ── Grid de Especificações Exatamente no Modelo Solicitado (2 Colunas) ── */}
            <div className="py-5 border-b border-gray-100 dark:border-white/10">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {/* Linha 1: Ano / KM */}
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Ano
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.anoModelo || `${vehicle.ano}/${vehicle.ano}`}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    KM
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {typeof vehicle.km === 'number' ? vehicle.km.toLocaleString('pt-BR') : vehicle.km || '0'}
                  </span>
                </div>

                {/* Linha 2: Cor / Carroceria */}
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Cor
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.cor || 'Não informada'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Carroceria
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.categoria || 'Hatch'}
                  </span>
                </div>

                {/* Linha 3: Portas / Câmbio */}
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Portas
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.portas || (vehicle.categoria === 'Pickup' ? '2 / 4' : '4')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Câmbio
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.cambio || 'Automático'}
                  </span>
                </div>

                {/* Linha 4: Combustível / Blindado */}
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Combustível
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.combustivel || 'Flex'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Blindado
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-gray-950 dark:text-white mt-0.5">
                    {vehicle.blindado || 'Não'}
                  </span>
                </div>
              </div>
            </div>

            {/* Descrição: Sobre este veículo */}
            <div className="py-6 border-b border-gray-100 dark:border-white/10">
              <span className="block text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
                SOBRE O VEÍCULO
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
                {vehicle.descricao ||
                  `O ${vehicle.modelo} une versatilidade, conforto e a confiabilidade reconhecida no mercado. Um veículo completo, ideal para o dia a dia, com ótimo espaço interno e excelente dirigibilidade.`}
              </p>
            </div>

            {/* Destaques do Carro */}
            {vehicle.destaques?.length > 0 && (
              <div className="py-6 border-b border-gray-100 dark:border-white/10">
                <span className="block text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-3">
                  ITENS DE DESTAQUE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vehicle.destaques.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] px-3.5 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dfb15b]/20 text-[#dfb15b]">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Procedência & Padrão de Confiança */}
            <div className="py-6">
              <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-gradient-to-br from-gray-50/90 via-white to-gray-50/90 dark:from-[#141518] dark:via-[#111215] dark:to-[#0c0d0f] p-5 sm:p-7 shadow-sm">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-white/10 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
                      <ShieldCheck size={14} className="text-[#dfb15b]" />
                      <span>PADRÃO OLIVEIRA VEÍCULOS</span>
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-950 dark:text-white">
                      Procedência 100% Garantida
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                    <Check size={12} className="stroke-[3]" />
                    Qualidade Aprovada
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b]">
                      <FileCheck size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Qualidade Estrutural</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Veículo rigorosamente inspecionado em sua integridade física e mecânica.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b]">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Garantia de 90 Dias</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Garantia de 90 dias para motor e caixa com cobertura e assistência da loja.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b]">
                      <Wrench size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Revisão Mecânica</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Inspecionado em mais de 40 itens essenciais antes de ir para a vitrine.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b]">
                      <Award size={18} />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Documentação Pronta</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Quitado, sem débitos ou pendências, pronto para transferência rápida.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* ── Seção da Loja & Consultores de Vendas ── */}
            <div id="secao-vendedor" className="py-6 border-t border-gray-100 dark:border-white/10">
              <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#131417] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/10 pb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfb15b]/15 text-[#dfb15b]">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
                      {COMPANY_DATA.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#dfb15b]">
                      {COMPANY_DATA.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin size={18} className="text-[#dfb15b] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-bold">Endereço</strong>
                      <span>{COMPANY_DATA.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Clock size={18} className="text-[#dfb15b] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-bold">Horário de Atendimento</strong>
                      <span>{COMPANY_DATA.hours}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={18} className="text-[#dfb15b] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 dark:text-white font-bold">Telefone da Loja</strong>
                      <a href={`tel:${COMPANY_DATA.phone.replace(/\D/g, '')}`} className="hover:text-[#dfb15b] font-semibold">
                        {COMPANY_DATA.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Consultores de Vendas */}
                <div className="mt-8 border-t border-gray-100 dark:border-white/10 pt-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#dfb15b] mb-4">
                    CONSULTORES DISPONÍVEIS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMPANY_DATA.sellers.map((seller) => (
                      <a
                        key={seller.id}
                        href={seller.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-3.5 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02] hover:border-[#dfb15b]/50 transition-all"
                      >
                        <div>
                          <strong className="block text-sm font-bold text-gray-900 dark:text-white">
                            {seller.name}
                          </strong>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {seller.phone}
                          </span>
                        </div>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] group-hover:underline">
                          <MessageSquare size={13} />
                          Chamar no WhatsApp
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ── Veículos Semelhantes / Outros Veículos em Destaque ── */}
      {relatedVehicles.length > 0 && (
        <section className="mt-16 sm:mt-24 border-t border-gray-200/80 dark:border-white/10 pt-12 sm:pt-16">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
                <Sparkles size={13} className="text-[#dfb15b]" />
                <span>ESTOQUE SELECIONADO</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Outros veículos em destaque
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Confira outras opções selecionadas com procedência garantida e condições especiais.
              </p>
            </div>
            <button
              onClick={onBack}
              className="btn-shine inline-flex items-center gap-2 rounded-full border border-[#dfb15b]/40 bg-[#dfb15b]/10 hover:bg-[#dfb15b] text-[#dfb15b] hover:text-black font-semibold text-xs sm:text-sm px-5 py-2.5 min-h-[42px] transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
            >
              <span>Ver estoque completo</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVehicles.map((veh) => (
              <VehicleCard
                key={veh.id}
                vehicle={veh}
                onSelectVehicle={() => {
                  if (onSelectVehicle) {
                    onSelectVehicle(veh);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Barra Fixa Flutuante no Mobile (3 Botões do Modelo: Ver parcelas | Telefone | Enviar mensagem) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-[#090a0b]/95 backdrop-blur-xl px-3 sm:px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          {/* Botão 1: Ver parcelas */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('secao-financiamento');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex-1 min-h-[46px] inline-flex items-center justify-center rounded-xl sm:rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 px-3 py-2 text-xs font-bold text-gray-900 dark:text-white transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Ver parcelas
          </button>

          {/* Botão 2: Telefone (Ícone 📞) */}
          <a
            href={`tel:${COMPANY_DATA.phone.replace(/\D/g, '')}`}
            aria-label="Ligar para a loja"
            className="h-[46px] w-[46px] shrink-0 inline-flex items-center justify-center rounded-xl sm:rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white transition-all active:scale-95 cursor-pointer"
          >
            <Phone size={17} />
          </a>

          {/* Botão 3: Enviar mensagem (Dourado com .btn-shine) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine flex-[1.3] min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-3.5 py-2 text-xs font-extrabold text-black shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <MessageSquare size={15} className="fill-black text-black shrink-0" />
            <span>Enviar mensagem</span>
          </a>
        </div>
      </div>
    </div>
  );
}

