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

export default function VehicleDetailView({ vehicle, onBack }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOn, setVideoOn] = useState(false);
  const [copied, setCopied] = useState(false);

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
    { Icon: Calendar, label: 'Ano', value: vehicle.ano },
    { Icon: Gauge, label: 'Quilometragem', value: formatKm(vehicle.km) },
    { Icon: Cog, label: 'Câmbio', value: vehicle.cambio },
    { Icon: Fuel, label: 'Combustível', value: vehicle.combustivel },
    { Icon: Palette, label: 'Cor', value: vehicle.cor },
  ].filter((s) => s.value);

  // Painel de preço e contato: aparece logo abaixo da galeria no celular e fixo ao lado no computador
  const pricePanel = (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#141414] sm:p-7">
      <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Preço</span>
      <div className="mb-5 text-3xl font-extrabold tracking-tight text-[#dfb15b] sm:text-4xl">
        {formatPrice(vehicle.preco)}
      </div>

      <div className="space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-5 py-3.5 text-sm font-bold text-black shadow-md transition-transform duration-150 active:scale-95"
        >
          <MessageSquare className="h-4 w-4 fill-black text-black" />
          <span>Falar sobre este carro</span>
        </a>
        <a
          href={scheduleVisitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-full border border-[#dfb15b] px-5 py-3.5 text-sm font-bold text-[#dfb15b] transition-transform duration-150 hover:bg-[#dfb15b]/10 active:scale-95"
        >
          <Calendar className="h-4 w-4" />
          <span>Agendar visita</span>
        </a>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 text-[#dfb15b]" />
        <span>Garantia de 90 dias • Procedência Verificada</span>
      </div>
    </div>
  );

  const arrowClass =
    'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-opacity hover:bg-black/65 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100';

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      {/* Caminho de volta */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <button onClick={onBack} className="cursor-pointer font-medium transition-colors hover:text-[#c88626]">
          Estoque
        </button>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="font-medium text-gray-900 dark:text-white">{vehicle.tituloCard || vehicle.modelo}</span>
      </nav>

      {/* Título + compartilhar */}
      <Reveal className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.6rem,5.5vw,3rem)] font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
            {vehicle.modelo}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
            {[vehicle.cambio?.split(' ')[0], vehicle.ano, vehicle.categoria].filter(Boolean).join(' • ')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#cf8d3c] hover:text-[#c88626] dark:border-gray-700 dark:text-gray-200"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? 'Link copiado!' : 'Compartilhar'}</span>
        </button>
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

          {/* Preço e contato logo abaixo da galeria no celular */}
          <div className="mt-6 lg:hidden">{pricePanel}</div>

          {/* Sobre + especificações */}
          <Reveal className="mt-10 border-t border-gray-100 pt-8 dark:border-gray-800">
            <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Sobre este veículo</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
              {vehicle.descricao ||
                `O ${vehicle.modelo} une versatilidade, conforto e a confiabilidade reconhecida no mercado. Um veículo completo, ideal para o dia a dia, com ótimo espaço interno e excelente dirigibilidade.`}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#cf8d3c]/10">
                    <Icon className="h-4 w-4 text-[#cf8d3c]" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500">{label}</span>
                    <strong className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {value}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {vehicle.destaques?.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">Itens e opcionais</h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {vehicle.destaques.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c88626]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <button
                onClick={onBack}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold text-[#c88626] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao estoque</span>
              </button>
            </div>
          </Reveal>
        </div>

        {/* Painel fixo no computador */}
        <div className="sticky top-28 hidden lg:col-span-4 lg:block">{pricePanel}</div>
      </div>
    </div>
  );
}
