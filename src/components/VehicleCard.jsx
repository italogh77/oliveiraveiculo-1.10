import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={open}
      className="vehicle-card group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg dark:border-[#262626] dark:bg-[#141414]"
    >
      {/* Foto */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 sm:aspect-[16/10]">
        <img
          src={photoThumbUrl(coverPhoto)}
          alt={vehicle.modelo}
          width={coverDimensions.width}
          height={coverDimensions.height}
          style={photoStyle(vehicle.fotosAjustes?.[0])}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {vehicle.tag && (
          <span className="absolute left-3 top-3 rounded-md bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            {vehicle.tag}
          </span>
        )}
        {vehicle.categoria && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {vehicle.categoria}
          </span>
        )}
      </div>

      {/* Título e ficha */}
      <div className="p-4 pb-2 sm:p-5 sm:pb-2">
        <h3 className="font-display line-clamp-1 text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-gold dark:text-white">
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
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300"
              >
                <Icon className="h-3 w-3 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preço + botão */}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-100 p-4 pt-3 dark:border-white/5 sm:p-5 sm:pt-3">
        <span className="text-xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-2xl">
          {formatPrice(vehicle.preco)}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-[#dfb15b] hover:bg-[#efc676] px-4 py-1.5 text-xs sm:text-sm font-bold text-black transition-all shadow-sm active:scale-95"
        >
          <span>Ver detalhes</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.article>
  );
}
