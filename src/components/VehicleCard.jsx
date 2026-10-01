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

  const subtitle =
    vehicle.subtituloCard ||
    `${vehicle.modelo.replace(vehicle.marca, '').trim()} ${vehicle.ano} • ${formatKm(vehicle.km)}`;

  // Chips de ficha técnica
  const specs = [
    vehicle.ano && { Icon: Calendar, label: vehicle.ano },
    typeof vehicle.km === 'number' && { Icon: Gauge, label: formatKm(vehicle.km) },
    vehicle.cambio && { Icon: Cog, label: vehicle.cambio },
    vehicle.combustivel && { Icon: Fuel, label: vehicle.combustivel },
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
        className="vehicle-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-[#262626] dark:bg-[#131417]"
      >
        {/* Foto com Badges em Pílula */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 sm:aspect-[16/10]">
          <img
            src={photoThumbUrl(coverPhoto)}
            alt={vehicle.modelo}
            width={coverDimensions.width}
            height={coverDimensions.height}
            style={photoStyle(vehicle.fotosAjustes?.[0])}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Badges de destaque em formato pílula */}
          {vehicle.tag && (
            <span className="absolute left-3 top-3 rounded-full bg-[#dfb15b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
              {vehicle.tag}
            </span>
          )}
          {vehicle.categoria && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10">
              {vehicle.categoria}
            </span>
          )}
        </div>

        {/* Título e Ficha Técnica */}
        <div className="p-4 pb-2 sm:p-5 sm:pb-2">
          <h3 className="font-display line-clamp-1 text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#dfb15b] dark:text-white">
            {vehicle.tituloCard || vehicle.modelo}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            {subtitle}
          </p>

          {specs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {specs.map(({ Icon, label }) => (
                <li
                  key={String(label)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300 border border-gray-200/50 dark:border-white/5"
                >
                  <Icon className="h-3 w-3 text-[#dfb15b]" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Preço + Botão Pílula na Base */}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-100 p-4 pt-3 dark:border-white/5 sm:p-5 sm:pt-3">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
              Preço
            </span>
            <span className="text-xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-2xl">
              {formatPrice(vehicle.preco)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="btn-shine inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-4 py-2 text-xs sm:text-sm font-bold text-black transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
          </button>
        </div>
      </article>
    </motion.div>
  );
}
