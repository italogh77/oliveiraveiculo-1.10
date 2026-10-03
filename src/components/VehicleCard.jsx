import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Gauge, Cog, Fuel } from 'lucide-react';
import { staggerItem } from './Reveal';
import { photoDimensions, photoThumbUrl } from '../lib/vehicleImages';
import { photoStyle } from '../lib/photoAdjustments';

export default function VehicleCard({ vehicle, onSelectVehicle }) {
  if (!vehicle) return null;

  const formatPrice = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const formatKm = (km) => km.toLocaleString('pt-BR') + ' km';

  const subtitle = (
    vehicle.subtituloCard ||
    `${vehicle.modelo.replace(vehicle.marca, '').trim()} ${vehicle.ano} • ${formatKm(vehicle.km)}`
  ).replace(/Longitu\s+de/gi, 'Longitude');

  // Informações originais de ficha técnica com ícones limpos inspirados no modelo
  const specs = [
    vehicle.ano && {
      Icon: Calendar,
      label: vehicle.anoModelo || String(vehicle.ano),
      title: 'Ano / Modelo',
    },
    typeof vehicle.km === 'number' && {
      Icon: Gauge,
      label: formatKm(vehicle.km),
      title: 'Quilometragem',
    },
    vehicle.cambio && {
      Icon: Cog,
      label: vehicle.cambio,
      title: 'Câmbio',
    },
    vehicle.combustivel && {
      Icon: Fuel,
      label: vehicle.combustivel,
      title: 'Combustível',
    },
  ].filter(Boolean);

  const open = () => onSelectVehicle && onSelectVehicle(vehicle);
  const coverPhoto = vehicle.fotos?.[0] || vehicle.foto;
  const coverDimensions = photoDimensions(coverPhoto, true);

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    card.style.setProperty('--card-rotate-x', `${(0.5 - y) * 7}deg`);
    card.style.setProperty('--card-rotate-y', `${(x - 0.5) * 9}deg`);
  };

  const resetCardPosition = (event) => {
    event.currentTarget.style.setProperty('--card-rotate-x', '0deg');
    event.currentTarget.style.setProperty('--card-rotate-y', '0deg');
  };

  return (
    <motion.div variants={staggerItem} className="relative z-0 h-full hover:z-10 focus-within:z-10">
      <article
        onClick={open}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetCardPosition}
        className="vehicle-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-gray-900 shadow-sm transition-all duration-300 hover:border-[#dfb15b]/60 hover:shadow-xl dark:border-white/10 dark:bg-[#131417] dark:text-white dark:hover:border-white/25 dark:shadow-xl dark:hover:shadow-2xl"
      >
        {/* Foto do veículo mantendo animações, sem coração de curtir e sem quadrado de seleção */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-[#18191d]">
          <img
            src={photoThumbUrl(coverPhoto)}
            alt={vehicle.modelo}
            width={coverDimensions.width}
            height={coverDimensions.height}
            style={photoStyle(vehicle.fotosAjustes?.[0])}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Feixe de luz reflexivo suave na lataria ao passar o mouse */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg] transition-transform duration-1000 ease-out group-hover:translate-x-[240%]"
          />
        </div>

        {/* Informações originais com visual refinado inspirado no modelo */}
        <div className="flex flex-col flex-grow p-4 pb-3 sm:p-5 sm:pb-3">
          {/* Badges de destaque em pílula (apenas quando o veículo possui tag ou categoria) */}
          {(vehicle.tag || vehicle.categoria) && (
            <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
              {vehicle.tag && (
                <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-sm dark:bg-white/10 dark:text-white dark:border dark:border-white/15">
                  {vehicle.tag}
                </span>
              )}
              {vehicle.categoria && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-700 border border-gray-200/70 dark:bg-white/5 dark:text-gray-300 dark:border-white/10">
                  {vehicle.categoria}
                </span>
              )}
            </div>
          )}

          {/* Nome / Modelo original do veículo */}
          <h3 className="font-sans line-clamp-1 text-lg sm:text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            {vehicle.tituloCard || vehicle.modelo}
          </h3>

          {/* Subtítulo original */}
          <p className="mt-1 line-clamp-1 text-xs sm:text-[13px] font-medium text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>

          {/* Grid de especificações arejado e limpo (Ano, Km, Câmbio, Combustível) */}
          {specs.length > 0 && (
            <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-[13px] text-gray-600 dark:text-gray-300">
              {specs.map(({ Icon, label, title }) => (
                <div key={label} className="flex items-center gap-1.5 min-w-0" title={title}>
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-[#dfb15b] transition-colors shrink-0" aria-hidden="true" />
                  <span className="truncate font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preço de alto impacto e Botão Ver detalhes mantidos e harmonizados */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 dark:border-white/10 p-4 sm:p-5 pt-3.5 sm:pt-4">
          <div className="min-w-0 shrink">
            <span className="block text-xl sm:text-2xl font-black tracking-tight text-gray-950 dark:text-white whitespace-nowrap">
              {formatPrice(vehicle.preco)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="btn-shine inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-4 py-2 text-xs sm:text-[13px] font-bold text-black transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
          </button>
        </div>
      </article>
    </motion.div>
  );
}
