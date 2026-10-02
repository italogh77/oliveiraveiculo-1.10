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
        className="vehicle-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#131417] shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl dark:border-white/10 dark:bg-[#131417] dark:hover:border-white/25"
      >
        {/* Foto com proporção padronizada 16/10 e Badges em Pílula */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#18191d]">
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#131417]/85 to-transparent" />

          {/* Badges de destaque padronizadas em tamanho e posição */}
          {vehicle.tag && (
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#dfb15b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md whitespace-nowrap">
              {vehicle.tag}
            </span>
          )}
          {vehicle.categoria && (
            <span className="absolute bottom-2.5 left-3 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-gray-200 border border-white/10 whitespace-nowrap">
              {vehicle.categoria}
            </span>
          )}
        </div>

        {/* Título com tipografia limpa em branco e especificações de alto contraste */}
        <div className="flex flex-col flex-grow p-4 pb-3 sm:p-5 sm:pb-3">
          <h3 className="font-sans line-clamp-1 text-lg sm:text-xl font-semibold tracking-tight text-white">
            {vehicle.tituloCard || vehicle.modelo}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs sm:text-[13px] font-medium text-gray-300">
            {subtitle}
          </p>

          {specs.length > 0 && (
            <ul className="mt-3.5 grid grid-cols-2 gap-1.5">
              {specs.slice(0, 4).map(({ Icon, label }) => (
                <li
                  key={String(label)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-gray-300 border border-white/5 transition-colors group-hover:border-white/10"
                >
                  <Icon className="h-3.5 w-3.5 text-[#dfb15b] shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Preço e Botão Ver detalhes sempre alinhados na mesma altura na base */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 p-4 pt-3.5 sm:p-5 sm:pt-3.5">
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Preço
            </span>
            <span className="block text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
              {formatPrice(vehicle.preco)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="btn-shine inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] px-4 py-2 text-xs sm:text-sm font-bold text-black transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </article>
    </motion.div>
  );
}
