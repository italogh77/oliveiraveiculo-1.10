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
      <Play className="h-10 w-10 text-[#cf8d3c]" />
      <p className="max-w-xs text-sm text-gray-300">Este vídeo abre em outra página.</p>
      <a
        href={info.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#cf8d3c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b5761e]"
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

  const specs = [
    { Icon: Calendar, label: 'Ano / Modelo', value: vehicle.anoModelo || vehicle.ano },
    { Icon: Gauge, label: 'Quilometragem', value: formatKm(vehicle.km) },
    { Icon: Cog, label: 'Câmbio', value: vehicle.cambio },
    { Icon: Fuel, label: 'Combustível', value: vehicle.combustivel },
    { Icon: Palette, label: 'Cor', value: vehicle.cor },
    { Icon: Car, label: 'Carroceria', value: vehicle.categoria || 'Hatch' },
  ].filter((s) => s.value);

  // Painel Comercial Unificado: Preço, Financiamento, Ações, Destaques do Veículo e Garantia
  const unifiedPanel = (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-[#131417]/95 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all">
      {/* Barra de destaque sutil superior em degradê dourado */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#dfb15b] to-transparent" />

      <div className="p-5 sm:p-7">
        {/* Cabeçalho do Card com Badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfb15b]/35 bg-[#dfb15b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#dfb15b]">
            <Sparkles size={11} className="text-[#dfb15b]" />
            <span>{vehicle.tag || 'Seminovo Selecionado'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pronta Entrega
          </span>
        </div>

        {/* Bloco de Preço & Financiamento */}
        <div className="mb-5">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Valor à vista
          </span>
          <div className="text-3xl sm:text-[2.35rem] font-black tracking-tight text-gray-950 dark:text-[#dfb15b] leading-tight">
            {formatPrice(vehicle.preco)}
          </div>
          {vehicle.parcela && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-white/[0.04] px-3 py-2 rounded-xl border border-gray-200/60 dark:border-white/5">
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

        {/* Ações Principais (Botões em Pílula com .btn-shine) */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine group relative flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-5 py-3.5 text-sm font-extrabold text-black shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 fill-black text-black transition-transform group-hover:scale-110" />
            <span>Falar sobre este carro</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href={scheduleVisitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-[#dfb15b]/40 bg-transparent hover:bg-[#dfb15b]/10 px-5 py-3 text-sm font-bold text-gray-900 dark:text-white transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-[#dfb15b]" />
            <span>Agendar visita na loja</span>
          </a>
        </div>

        {/* Destaques do Veículo Integrados no Painel */}
        {vehicle.destaques?.length > 0 && (
          <div className="mt-6 border-t border-gray-100 dark:border-white/10 pt-5">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white">
                <CheckCircle2 size={15} className="text-[#dfb15b]" />
                <span>Destaques deste carro</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {vehicle.destaques.length} itens
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {vehicle.destaques.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors hover:border-[#dfb15b]/40"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dfb15b]/15 text-[#dfb15b]">
                    <Check size={11} className="stroke-[3]" />
                  </span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Garantias & Procedência na Base do Card */}
        <div className="mt-6 border-t border-gray-100 dark:border-white/10 pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck size={14} className="text-[#dfb15b] shrink-0" />
            <span>Garantia de 90 dias para motor e caixa</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <Award size={14} className="text-[#dfb15b] shrink-0" />
            <span>Procedência rigorosamente inspecionada</span>
          </div>
        </div>
      </div>
    </div>
  );

  const arrowClass =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-opacity hover:bg-black/65 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-32 sm:pb-28 lg:pb-20">
      {/* Barra Superior de Ações Rápidas (Padrão Mobbin) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-md hover:border-[#dfb15b]/50 hover:text-[#dfb15b] transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Voltar ao estoque</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartilhar veículo"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-md hover:border-[#dfb15b]/50 hover:text-[#dfb15b] transition-all active:scale-95"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
        </button>
      </div>

      {/* Título & Chips de Especificações Rápidas (Padrão Mobbin Carvana / Turo) */}
      <Reveal className="mb-5 sm:mb-6">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
          {vehicle.tag && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#dfb15b]/40 bg-[#dfb15b]/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#dfb15b]">
              <Sparkles size={11} />
              <span>{vehicle.tag}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
            {vehicle.ano}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
            {formatKm(vehicle.km)}
          </span>
          {vehicle.cambio && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
              {vehicle.cambio.split(' ')[0]}
            </span>
          )}
          {vehicle.categoria && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
              {vehicle.categoria}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-tight">
          {vehicle.modelo}
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Palco: foto ou vídeo */}
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

              {/* Selo */}
              {vehicle.tag && !videoOn && (
                <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-md bg-[#dfb15b] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-lg">
                  {vehicle.tag}
                </span>
              )}

              {/* Setas (sempre visíveis no celular) */}
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

              {/* Botão de vídeo em destaque */}
              {video && !videoOn && (
                <button
                  onClick={() => setVideoOn(true)}
                  className="absolute bottom-3 left-3 z-10 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-5 py-2 text-sm font-bold text-black shadow-lg transition-transform active:scale-95"
                >
                  <Play className="h-4 w-4 fill-black text-black" />
                  Assistir vídeo
                </button>
              )}
              {videoOn && (
                <button
                  onClick={() => setVideoOn(false)}
                  className="absolute left-3 top-3 z-10 inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/80"
                >
                  <Camera className="h-4 w-4" />
                  Ver fotos
                </button>
              )}
            </div>

            {/* Se o vídeo não abrir (dono do vídeo bloqueou incorporação, por exemplo) */}
            {videoOn && video && video.type !== 'link' && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                O vídeo não abriu?{' '}
                <a
                  href={vehicle.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#c88626] hover:underline"
                >
                  Assistir em outra aba
                </a>
              </p>
            )}

            {/* Miniaturas (rolagem lateral no celular) */}
            {(gallery.length > 1 || video) && (
              <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {video && (
                  <button
                    onClick={() => setVideoOn(true)}
                    aria-label="Assistir vídeo"
                    className={`relative h-16 w-24 shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg bg-gray-900 sm:h-20 sm:w-28 ${
                      videoOn ? 'ring-2 ring-[#cf8d3c]' : 'opacity-90 hover:opacity-100'
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cf8d3c] shadow-lg">
                        <Play className="h-4 w-4 fill-white text-white" />
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
                        ? 'ring-2 ring-[#cf8d3c]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.thumbSrc} width={photo.thumbDimensions.width} height={photo.thumbDimensions.height} style={photoStyle(vehicle.fotosAjustes?.[i])} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Painel comercial unificado logo abaixo da galeria no celular */}
          <div className="mt-6 lg:hidden">{unifiedPanel}</div>

          {/* Sobre + especificações */}
          <Reveal className="mt-10 border-t border-gray-100 pt-8 dark:border-gray-800">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
                <Car size={13} className="text-[#dfb15b]" />
                <span>FICHA & APRESENTAÇÃO</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Sobre este veículo
              </h2>
            </div>

            <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {vehicle.descricao ||
                `O ${vehicle.modelo} une versatilidade, conforto e a confiabilidade reconhecida no mercado. Um veículo completo, ideal para o dia a dia, com ótimo espaço interno e excelente dirigibilidade.`}
            </p>

            {/* Ficha Técnica Equilibrada (Grid 3x2) */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {specs.map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-4 shadow-sm hover:border-[#dfb15b]/40 hover:shadow-md transition-all duration-200"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/10 dark:bg-[#dfb15b]/15 text-[#dfb15b] transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {label}
                    </span>
                    <strong className="block truncate text-sm font-bold text-gray-950 dark:text-white mt-0.5">
                      {value}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Padrão de Procedência & Confiança Oliveira Veículos */}
            <div className="mt-10 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-gradient-to-br from-gray-50/90 via-white to-gray-50/90 dark:from-[#141518] dark:via-[#111215] dark:to-[#0c0d0f] p-6 sm:p-8 shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 dark:border-white/10 pb-4">
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
                  Procedência 100% Inspecionada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b] mt-0.5">
                    <FileCheck size={19} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Qualidade Estrutural</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Veículo rigorosamente inspecionado em sua integridade física e mecânica.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b] mt-0.5">
                    <ShieldCheck size={19} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Garantia de 90 Dias</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Cobertura integral para motor e caixa de câmbio com assistência da loja.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b] mt-0.5">
                    <Wrench size={19} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Revisão Mecânica Completa</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Inspecionado em mais de 40 itens essenciais antes de ir para a vitrine.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfb15b]/15 text-[#dfb15b] mt-0.5">
                    <Award size={19} />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Documentação Pronta</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Veículo quitado, sem débitos ou pendências, pronto para transferir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={onBack}
                className="btn-shine inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-2.5 text-sm font-bold text-gray-900 dark:text-white shadow-sm hover:border-[#dfb15b]/50 hover:text-[#dfb15b] transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao estoque</span>
              </button>
            </div>
          </Reveal>
        </div>

        {/* Painel lateral unificado travado no topo no computador */}
        <div className="sticky top-24 hidden lg:col-span-4 lg:block z-20">
          {unifiedPanel}
        </div>
      </div>

      {/* ── Veículos em Destaque no Rodapé da Página ── */}
      {relatedVehicles.length > 0 && (
        <section className="mt-16 sm:mt-24 border-t border-gray-200/80 dark:border-white/10 pt-12 sm:pt-16">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1">
                <Sparkles size={13} className="text-[#dfb15b]" />
                <span>ESTOQUE EM DESTAQUE</span>
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
                onClick={() => {
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

      {/* ── Barra Fixa Flutuante no Mobile (Padrão Mobbin: Carvana / Turo / Webmotors) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-[#090a0b]/95 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Valor à vista
            </span>
            <div className="text-xl sm:text-2xl font-black text-gray-950 dark:text-[#dfb15b] tracking-tight leading-none">
              {formatPrice(vehicle.preco)}
            </div>
            {vehicle.parcela && (
              <span className="block truncate text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                ou parcelas de <strong className="text-gray-800 dark:text-gray-200 font-bold">R$ {vehicle.parcela}</strong>
              </span>
            )}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-black shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare size={16} className="fill-black text-black shrink-0" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
