import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw, X, Sparkles, Check } from 'lucide-react';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from './VehicleCard';
import VehicleDetailView from './VehicleDetailView';
import { Stagger } from './Reveal';

export default function Showroom({ sharedVehicleId, selectedVehicle, onSelectVehicle, onClearVehicle }) {
  const { vehicles } = useVehicles();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilteringLoading, setIsFilteringLoading] = useState(false);
  const searchInputRef = useRef(null);

  // Internal vehicle selection if not managed externally
  const [internalSelected, setInternalSelected] = useState(null);
  const activeVehicle = selectedVehicle !== undefined ? selectedVehicle : internalSelected;

  const handleSelect = (veh) => {
    if (onSelectVehicle) onSelectVehicle(veh);
    else setInternalSelected(veh);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (onClearVehicle) onClearVehicle();
    else setInternalSelected(null);
  };

  // Auto-open vehicle from URL shared link
  useEffect(() => {
    if (sharedVehicleId && vehicles.length > 0) {
      const found = vehicles.find((v) => String(v.id) === String(sharedVehicleId));
      if (found) handleSelect(found);
    }
  }, [sharedVehicleId, vehicles]);

  // Focus search input on expansion
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Filters State
  const [searchModel, setSearchModel] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Todos');
  const [selectedKmRange, setSelectedKmRange] = useState('Todos');
  const [selectedTransmission, setSelectedTransmission] = useState('Todos');
  const [selectedFuel, setSelectedFuel] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');

  // Paginação
  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic filter options
  const brands = useMemo(() => {
    const list = Array.from(new Set(vehicles.map((v) => v.marca)));
    return ['Todas', ...list.sort()];
  }, [vehicles]);

  const years = useMemo(() => {
    const list = Array.from(new Set(vehicles.map((v) => v.ano)));
    return ['Todos', ...list.sort((a, b) => b - a)];
  }, [vehicles]);

  const transmissions = useMemo(() => [...new Set(vehicles.map((v) => v.cambio).filter(Boolean))].sort(), [vehicles]);
  const fuels = useMemo(() => [...new Set(vehicles.map((v) => v.combustivel).filter(Boolean))].sort(), [vehicles]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      const matchBrand =
        selectedBrand === 'Todas' || v.marca.toLowerCase() === selectedBrand.toLowerCase();

      const matchYear =
        selectedYear === 'Todos' || v.ano >= parseInt(selectedYear, 10);

      let matchPrice = true;
      if (selectedPriceRange === 'ate80') matchPrice = v.preco <= 80000;
      else if (selectedPriceRange === '80a120') matchPrice = v.preco > 80000 && v.preco <= 120000;
      else if (selectedPriceRange === 'acima120') matchPrice = v.preco > 120000;

      let matchKm = true;
      if (selectedKmRange === 'ate30') matchKm = v.km <= 30000;
      else if (selectedKmRange === '30a60') matchKm = v.km > 30000 && v.km <= 60000;
      else if (selectedKmRange === 'acima60') matchKm = v.km > 60000;

      const query = searchModel.trim().toLowerCase();
      const matchSearch =
        !query ||
        v.modelo.toLowerCase().includes(query) ||
        v.marca.toLowerCase().includes(query) ||
        (v.tituloCard && v.tituloCard.toLowerCase().includes(query));

      const matchTransmission = selectedTransmission === 'Todos' || v.cambio === selectedTransmission;
      const matchFuel = selectedFuel === 'Todos' || v.combustivel === selectedFuel;
      return matchBrand && matchYear && matchPrice && matchKm && matchSearch && matchTransmission && matchFuel;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.preco - b.preco);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.preco - a.preco);
    else if (sortBy === 'km-asc') result.sort((a, b) => a.km - b.km);
    else if (sortBy === 'year-desc') result.sort((a, b) => b.ano - a.ano);

    return result;
  }, [vehicles, selectedBrand, selectedYear, selectedPriceRange, selectedKmRange, selectedTransmission, selectedFuel, searchModel, sortBy]);

  // Sempre que os filtros mudam, volta pra primeira página
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedYear, selectedPriceRange, selectedKmRange, selectedTransmission, selectedFuel, searchModel, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredVehicles.slice(start, start + PAGE_SIZE);
  }, [filteredVehicles, currentPage]);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetFilters = () => {
    setSearchModel('');
    setSelectedBrand('Todas');
    setSelectedYear('Todos');
    setSelectedPriceRange('Todos');
    setSelectedKmRange('Todos');
    setSelectedTransmission('Todos');
    setSelectedFuel('Todos');
    setSortBy('recent');
  };

  const hasActiveFilters =
    searchModel !== '' ||
    selectedBrand !== 'Todas' ||
    selectedYear !== 'Todos' ||
    selectedPriceRange !== 'Todos' ||
    selectedKmRange !== 'Todos' ||
    selectedTransmission !== 'Todos' ||
    selectedFuel !== 'Todos';

  const activeFiltersCount = [
    selectedBrand !== 'Todas',
    selectedYear !== 'Todos',
    selectedPriceRange !== 'Todos',
    selectedKmRange !== 'Todos',
    selectedTransmission !== 'Todos',
    selectedFuel !== 'Todos',
  ].filter(Boolean).length;

  const handleApplyMobileFilters = () => {
    setMobileFiltersOpen(false);
    setIsFilteringLoading(true);
    setTimeout(() => {
      setIsFilteringLoading(false);
      document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 380);
  };

  if (activeVehicle) {
    return <VehicleDetailView vehicle={activeVehicle} onBack={handleBack} onSelectVehicle={handleSelect} />;
  }

  return (
    <section id="estoque" className="ov-showroom-section pt-20 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full">
      {/* ── Cabeçalho com Tipografia Fluida ── */}
      <div className="mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-1.5">
          <Sparkles size={13} />
          <span>ESTOQUE DE VEÍCULOS</span>
        </span>
        <h1 className="font-display text-[clamp(1.75rem,6vw,3.2rem)] font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight">
          Encontre seu próximo carro
        </h1>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 mt-1 font-normal max-w-xl">
          Veículos revisados e periciados com procedência garantida e simulação imediata de financiamento.
        </p>
      </div>

      {/* ── 4. BARRA DE ESTOQUE MOBILE: BUSCA EXPANSÍVEL & FILTROS (Regra 4) ── */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-2 relative">
          {/* Se a busca NÃO estiver expandida, mostra pílula compacta de busca + pílula de filtros */}
          {!isSearchExpanded ? (
            <>
              {/* Botão de Busca em Pílula (Compacto) */}
              <button
                type="button"
                onClick={() => setIsSearchExpanded(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold active:scale-95 transition-all duration-300 shadow-sm cursor-pointer"
                aria-label="Abrir campo de busca"
              >
                <Search size={16} className="text-[#dfb15b]" />
                <span className="truncate">{searchModel ? `Busca: "${searchModel}"` : 'Buscar modelo ou marca'}</span>
              </button>

              {/* Botão de Filtros em Pílula */}
              <button
                type="button"
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-bottom-sheet-filters"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
              >
                <SlidersHorizontal size={15} />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            /* Botão de Busca Expandido: assume 100% da largura com animação fluida */
            <div className="w-full flex items-center gap-2 transition-all duration-300 ease-in-out">
              <div className="relative flex-1">
                <Search size={16} className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  placeholder="Digite a marca ou modelo..."
                  className="w-full pl-11 pr-10 py-2.5 min-h-[44px] rounded-full border border-[#dfb15b] bg-white dark:bg-[#141518] text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#dfb15b]/30 shadow-md"
                />
                {searchModel && (
                  <button
                    type="button"
                    onClick={() => setSearchModel('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
                    aria-label="Limpar texto da busca"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Botão de fechar/recolher a busca */}
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="h-11 w-11 shrink-0 rounded-full border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                aria-label="Recolher busca"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. BOTTOM SHEET ANIMADO DE FILTROS NO MOBILE (Regra 4) ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop escurecido e desfocado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden"
            />

            {/* Bottom Sheet deslizando de baixo para cima */}
            <motion.div
              id="mobile-bottom-sheet-filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#121316] text-gray-900 dark:text-white p-5 sm:p-6 shadow-2xl flex flex-col lg:hidden"
            >
              {/* Barra de puxar (Drag handle) */}
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-white/20 shrink-0" />

              {/* Cabeçalho do Bottom Sheet */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#dfb15b]" />
                  <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-0">Filtrar veículos</h2>
                </div>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 text-xs text-[#dfb15b] hover:underline cursor-pointer py-1 px-2"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Fechar painel de filtros"
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Formulário de Filtros no Sheet */}
              <div className="space-y-4 flex-1 overflow-y-auto pb-4">
                {/* Marca */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-brand">
                    Marca
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-brand"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todas" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todas as marcas</option>
                      {brands.filter((b) => b !== 'Todas').map((b) => (
                        <option key={b} value={b} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-year">
                    Ano mínimo
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os anos</option>
                      {years.filter((y) => y !== 'Todos').map((y) => (
                        <option key={y} value={y} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">A partir de {y}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Faixa de Preço */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-price">
                    Faixa de Preço
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-price"
                      value={selectedPriceRange}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Qualquer valor</option>
                      <option value="ate80" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Até R$ 80.000</option>
                      <option value="80a120" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">R$ 80.000 a R$ 120.000</option>
                      <option value="acima120" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Acima de R$ 120.000</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Quilometragem */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-km">
                    Quilometragem
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-km"
                      value={selectedKmRange}
                      onChange={(e) => setSelectedKmRange(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todas as faixas</option>
                      <option value="ate30" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Até 30.000 km</option>
                      <option value="30a60" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">30.000 a 60.000 km</option>
                      <option value="acima60" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Acima de 60.000 km</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Câmbio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-transmission">
                    Câmbio
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-transmission"
                      value={selectedTransmission}
                      onChange={(e) => setSelectedTransmission(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os câmbios</option>
                      {transmissions.map((t) => (
                        <option key={t} value={t} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Combustível */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5" htmlFor="sheet-filter-fuel">
                    Combustível
                  </label>
                  <div className="relative">
                    <select
                      id="sheet-filter-fuel"
                      value={selectedFuel}
                      onChange={(e) => setSelectedFuel(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                    >
                      <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os combustíveis</option>
                      {fuels.map((f) => (
                        <option key={f} value={f} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Botão de Aplicar Filtros (Pílula com feedback de toque) */}
              <div className="pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyMobileFilters}
                  className="w-full min-h-[46px] rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150 shadow-lg cursor-pointer"
                >
                  <Check size={17} className="stroke-[2.5]" />
                  <span>Aplicar Filtros ({filteredVehicles.length})</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Layout Geral: Painel Desktop + Grade ── */}
      <div className="ov-showroom-layout">
        {/* Painel Filtrar Veículos à esquerda no Desktop */}
        <aside className="hidden lg:block ov-filter-panel rounded-2xl p-6 border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#121316] text-gray-900 dark:text-white shadow-lg dark:shadow-xl h-fit sticky top-28">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#dfb15b]" />
              <h2 className="text-base font-bold text-gray-950 dark:text-white mb-0">Filtrar veículos</h2>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#dfb15b] hover:underline cursor-pointer"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Campo Buscar Veículo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-search">
                Buscar modelo ou marca
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="desktop-filter-search"
                  type="text"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  placeholder="Ex: Corolla, Renegade..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#dfb15b]"
                />
              </div>
            </div>

            {/* Dropdown Marca */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-brand">
                Marca
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todas" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todas as marcas</option>
                  {brands.filter((b) => b !== 'Todas').map((b) => (
                    <option key={b} value={b} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Ano */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-year">
                Ano mínimo
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os anos</option>
                  {years.filter((y) => y !== 'Todos').map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">A partir de {y}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Preço */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-price">
                Faixa de Preço
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-price"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Qualquer valor</option>
                  <option value="ate80" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Até R$ 80.000</option>
                  <option value="80a120" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">R$ 80.000 a R$ 120.000</option>
                  <option value="acima120" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Acima de R$ 120.000</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Quilometragem */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-km">
                Quilometragem
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-km"
                  value={selectedKmRange}
                  onChange={(e) => setSelectedKmRange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todas as faixas</option>
                  <option value="ate30" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Até 30.000 km</option>
                  <option value="30a60" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">30.000 a 60.000 km</option>
                  <option value="acima60" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Acima de 60.000 km</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Câmbio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-transmission">
                Câmbio
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-transmission"
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os câmbios</option>
                  {transmissions.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{t}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Combustível */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1" htmlFor="desktop-filter-fuel">
                Combustível
              </label>
              <div className="relative">
                <select
                  id="desktop-filter-fuel"
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Todos os combustíveis</option>
                  {fuels.map((f) => (
                    <option key={f} value={f} className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">{f}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Grade de Veículos e Cabeçalho de Ordenação ── */}
        <div className="ov-stock-results min-w-0">
          {/* Contador de Veículos e Ordenação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-white/10">
            <div className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#dfb15b]/20 text-[#dfb15b] font-mono text-xs font-bold">
                {filteredVehicles.length}
              </span>
              <span className="font-normal text-gray-500 dark:text-gray-400">
                {filteredVehicles.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Ordenar por:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent pr-6 py-1 font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="recent" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Mais recentes</option>
                  <option value="price-asc" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Menor preço</option>
                  <option value="price-desc" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Maior preço</option>
                  <option value="km-asc" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Menor quilometragem</option>
                  <option value="year-desc" className="bg-white dark:bg-[#141518] text-gray-900 dark:text-white">Ano mais novo</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Feedback de Carregamento (Skeleton Loader) ou Grade de Veículos ── */}
          {isFilteringLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] sm:aspect-[16/10] bg-gray-200 dark:bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
                      <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded-full" />
                      <div className="h-9 w-28 bg-[#dfb15b]/30 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedVehicles.length > 0 ? (
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelectVehicle={handleSelect}
                  enable3d={true}
                />
              ))}
            </Stagger>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center max-w-lg mx-auto shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Nenhum veículo encontrado com os filtros selecionados.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[42px] rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw size={13} />
                <span>Limpar todos os filtros</span>
              </button>
            </div>
          )}

          {/* Paginação */}
          {!isFilteringLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:border-[#dfb15b] enabled:hover:text-[#dfb15b] transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-label={`Página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                    page === currentPage
                      ? 'bg-[#dfb15b] text-black shadow-md'
                      : 'border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-[#dfb15b] hover:text-[#dfb15b] shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:border-[#dfb15b] enabled:hover:text-[#dfb15b] transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
