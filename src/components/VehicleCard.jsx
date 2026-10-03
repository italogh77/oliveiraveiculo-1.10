import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Gauge, Palette, User } from 'lucide-react';
import { staggerItem } from './Reveal';
import { photoDimensions, photoThumbUrl } from '../lib/vehicleImages';
import { photoStyle } from '../lib/photoAdjustments';

export default function VehicleCard({ vehicle, onSelectVehicle }) {
  if (!vehicle) return null;

  const formatPrice = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const anoDisplay = vehicle.anoModelo
    ? vehicle.anoModelo
    : vehicle.ano
    ? `${vehicle.ano}/${vehicle.ano}`
    : '2025/2026';

  const kmDisplay = typeof vehicle.km === 'number'
    ? `${vehicle.km.toLocaleString('pt-BR')} Km`
    : vehicle.km
    ? `${vehicle.km} Km`
    : '0 Km';

  const corDisplay = vehicle.cor || 'Não informada';
  const vendedorDisplay = vehicle.vendedor || vehicle.origem || 'Concessionária';

  // Título em caixa alta marcante como no modelo (ex: MERCEDES-BENZ C 200)
  const carTitle = (vehicle.tituloCard || vehicle.modelo || `${vehicle.marca || ''} ${vehicle.modelo || ''}`).toUpperCase();

  // Subtítulo / Versão / Motorização (ex: 1.5 EQ BOOST HÍBRIDO AMG LINE 9G-TRONIC)
  const getSubtitle = () => {
    if (vehicle.versao) return vehicle.versao.toUpperCase();
    if (vehicle.subtituloCard) {
      const rawVersion = vehicle.subtituloCard.split('•')[0].replace(new RegExp(`\\b${vehicle.ano}\\b`, 'g'), '').trim();
      if (rawVersion) return rawVersion.toUpperCase();
    }
    if (vehicle.modelo) {
      let clean = vehicle.modelo;
      if (vehicle.marca) clean = clean.replace(new RegExp(`^${vehicle.marca}\\s*`, 'i'), '');
      if (vehicle.tituloCard) clean = clean.replace(new RegExp(`^${vehicle.tituloCard}\\s*`, 'i'), '');
      if (clean.trim()) return clean.trim().toUpperCase();
    }
    return `${vehicle.cambio || ''} ${vehicle.combustivel || ''}`.trim().toUpperCase() || 'COMPLETO';
  };

  const subtitle = getSubtitle();

  // Tag em destaque no estilo pílula preta (ex: TROCA COM TROCO)
  const badgeText = (vehicle.tag || 'TROCA COM TROCO').toUpperCase();

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

        {/* Informações adaptadas no modelo solicitado */}
        <div className="flex flex-col flex-grow p-4 pb-3 sm:p-5 sm:pb-3">
          {/* Tag pílula preta: TROCA COM TROCO */}
          <div className="mb-2.5">
            <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-sm dark:bg-black/90 dark:border dark:border-white/20 dark:text-white">
              {badgeText}
            </span>
          </div>

          {/* Nome / Modelo em destaque uppercase */}
          <h3 className="font-sans line-clamp-1 text-lg sm:text-xl font-extrabold uppercase tracking-tight text-gray-950 dark:text-white">
            {carTitle}
          </h3>

          {/* Versão / Motorização */}
          <p className="mt-1 line-clamp-1 text-xs sm:text-[13px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>

          {/* Grid com as 4 especificações solicitadas com ícones */}
          <div className="mt-3.5 grid grid-cols-3 gap-x-2 gap-y-2 text-xs sm:text-[13px] text-gray-700 dark:text-gray-300">
            {/* 1. Ano / Modelo */}
            <div className="flex items-center gap-1.5 min-w-0" title={`Ano/Modelo: ${anoDisplay}`}>
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{anoDisplay}</span>
            </div>

            {/* 2. Quilometragem */}
            <div className="flex items-center gap-1.5 min-w-0" title={`Quilometragem: ${kmDisplay}`}>
              <Gauge className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{kmDisplay}</span>
            </div>

            {/* 3. Cor */}
            <div className="flex items-center gap-1.5 min-w-0" title={`Cor: ${corDisplay}`}>
              <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{corDisplay}</span>
            </div>

            {/* 4. Concessionária (posicionada na 3ª coluna, alinhada abaixo da cor como no modelo) */}
            <div className="col-start-3 flex items-center gap-1.5 min-w-0" title={vendedorDisplay}>
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{vendedorDisplay}</span>
            </div>
          </div>
        </div>

        {/* Preço e Botão Ver detalhes mantidos e perfeitamente harmonizados */}
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
