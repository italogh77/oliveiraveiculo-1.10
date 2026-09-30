import React, { useRef, useMemo } from 'react';
import { ArrowRight, ArrowUpRight, ShieldCheck, BadgeCheck, CreditCard, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from '../components/VehicleCard';
import BankLogos from '../components/BankLogos';
import { publicAsset } from '../lib/publicAsset';

export default function HomePage({ onGoToEstoque, onGoToOndeEstamos, onGoToSobre, onSelectVehicle }) {
  const { vehicles } = useVehicles();
  const carouselRef = useRef(null);

  // Filtra destaques escolhidos pelo Admin ou completa com os primeiros
  const featuredVehicles = useMemo(() => {
    if (!vehicles.length) return [];
    const custom = vehicles.filter((v) => v.destaqueHome);
    if (custom.length >= 3) return custom;
    const customIds = new Set(custom.map((v) => v.id));
    const rest = vehicles.filter((v) => !customIds.has(v.id));
    return [...custom, ...rest];
  }, [vehicles]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <div className="ov-home">
      {/* Hero Section — Direto ao ponto */}
      <section className="ov-hero">
        <img
          className="ov-hero-image"
          src={publicAsset('loja-oliveira-hero-original.jpg')}
          alt="Fachada e veículos da Oliveira Veículos em Maricá"
          fetchPriority="high"
        />
        <div className="ov-hero-overlay" />

        <div className="ov-hero-shell">
          <div className="ov-hero-content">
            <span className="ov-hero-eyebrow">Maricá, RJ · Seminovos selecionados</span>
            <h1>
              Seu próximo<br />
              carro está <em>aqui.</em>
            </h1>
            <p>
              Encontre o carro certo para o seu momento, com atendimento próximo e informações claras em cada etapa.
            </p>

            <div className="ov-actions">
              <button className="ov-button ov-button-cream ov-button-hero" onClick={onGoToEstoque}>
                <span>Explorar veículos</span>
                <ArrowRight size={19} />
              </button>
              <a
                href={COMPANY_DATA.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ov-button ov-button-outline ov-button-hero inline-flex items-center gap-2"
              >
                <span>Falar no WhatsApp</span>
                <ArrowUpRight size={19} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bancos Parceiros — Barra oficial de financiamento */}
      <section className="border-b border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#0a0a0a] py-6">
        <div className="ov-shell">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <span className="text-xs uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 shrink-0">
              Parceiros para Financiamento
            </span>
            <div className="flex-1 max-w-4xl">
              <BankLogos />
            </div>
          </div>
        </div>
      </section>

      {/* Estoque em destaque — Carretel deslizável estilo Instagram / 3 por vez */}
      <section className="ov-section ov-shell">
        <div className="ov-section-top">
          <div>
            <span className="ov-kicker">ESTOQUE EM DESTAQUE</span>
            <h2>Encontre seu próximo carro</h2>
            <p>Escolhas para conhecer de perto e chamar de suas.</p>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                aria-label="Rolar para esquerda"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-200 hover:border-[#dfb15b] hover:text-[#dfb15b] transition-colors flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Rolar para direita"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-200 hover:border-[#dfb15b] hover:text-[#dfb15b] transition-colors flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button className="ov-text-link sm:ml-3" onClick={onGoToEstoque}>
              <span>Ver todos ({vehicles.length})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {featuredVehicles.length ? (
          <div
            ref={carouselRef}
            className="-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredVehicles.map((v) => (
              <div
                key={v.id}
                className="w-[82vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start"
              >
                <VehicleCard vehicle={v} onSelectVehicle={onSelectVehicle} />
              </div>
            ))}
          </div>
        ) : (
          <div className="ov-empty">
            O estoque está sendo atualizado. Fale com a equipe para conhecer as opções disponíveis.
          </div>
        )}
      </section>

      {/* Valores da Loja */}
      <section className="ov-values">
        <div className="ov-shell ov-values-grid">
          <div>
            <span className="ov-kicker">A OLIVEIRA VEÍCULOS</span>
            <h2>Mais que uma revenda. Um caminho para sua próxima conquista.</h2>
            <p>
              Estamos em Maricá para ajudar você a comparar opções, tirar dúvidas e encontrar uma condição que faça sentido.
            </p>
            <button className="ov-text-link" onClick={onGoToSobre}>
              <span>Conheça nossa loja</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="ov-value-list">
            <div>
              <ShieldCheck />
              <span>
                <strong>Procedência Garantida</strong>
                <small>Veículos revisados e inspecionados. Sem leilão, sem sinistro.</small>
              </span>
            </div>
            <div>
              <CreditCard />
              <span>
                <strong>Financiamento</strong>
                <small>Simulações com os bancos parceiros da loja.</small>
              </span>
            </div>
            <div>
              <BadgeCheck />
              <span>
                <strong>Atendimento de verdade</strong>
                <small>Converse com nossa equipe antes de decidir.</small>
              </span>
            </div>
            <div>
              <MapPin />
              <span>
                <strong>Perto de você</strong>
                <small>Visite nosso espaço em Maricá, RJ.</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Venha nos visitar */}
      <section className="ov-visit ov-shell">
        <div>
          <span className="ov-kicker">VENHA NOS VISITAR</span>
          <h2>Seu próximo passo começa aqui.</h2>
          <p>{COMPANY_DATA.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={COMPANY_DATA.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine ov-button ov-button-gray group cursor-pointer inline-flex items-center gap-2"
          >
            <span>Como chegar</span>
            <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
