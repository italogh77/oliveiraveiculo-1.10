import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useVehicles } from '../context/VehiclesContext';
import VehicleCard from './VehicleCard';
import VehicleDetailView from './VehicleDetailView';
import { Reveal, Stagger } from './Reveal';

export default function Showroom({ sharedVehicleId, selectedVehicle, onSelectVehicle, onClearVehicle }) {
  const { vehicles } = useVehicles();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Fecha o teclado (mobile) e rola até os resultados
  const handleSearchClick = () => {
    document.activeElement?.blur?.();
    document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  // Sempre que os filtros/ordenação mudam, volta pra primeira página
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

  if (activeVehicle) {
    return <VehicleDetailView vehicle={activeVehicle} onBack={handleBack} />;
  }

  return (
    <section id="estoque" className="ov-showroom-section pt-24 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full">
      {/* Título e Subtítulo */}
      <div className="ov-showroom-mobile-intro">
        <span>ESTOQUE EM DESTAQUE</span>
        <h1>Encontre seu<br />próximo carro</h1>
        <p>Escolha para conhecer de perto e chamar de seu.</p>
      </div>

      <Reveal className="ov-showroom-desktop-heading mb-8">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Estoque de veículos
        </h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1 font-normal">
          Encontre o carro certo para você com procedência garantida.
        </p>
      </Reveal>

      <div className="ov-showroom-mobile-search">
        <label htmlFor="mobile-filter-search" className="sr-only">Buscar marca ou modelo</label>
        <div>
          <Search aria-hidden="true" />
          <input
            id="mobile-filter-search"
            type="search"
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            placeholder="Buscar marca ou modelo"
          />
        </div>
        <button
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="mobile-stock-filters"
          onClick={() => setMobileFiltersOpen((isOpen) => !isOpen)}
        >
          <SlidersHorizontal aria-hidden="true" />
          <span>Filtros</span>
        </button>
      </div>

      <div className="ov-showroom-layout">
        {/* Painel Filtrar Veículos à esquerda, com largura confortável */}
        <aside
          id="mobile-stock-filters"
          className={`ov-filter-panel ov-mobile-filters ${mobileFiltersOpen ? 'is-open' : ''} ov-card-glass rounded-2xl p-5 sm:p-6 mb-8 lg:mb-0`}
        >
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#dfb15b]" />
              <h2 className="ov-filter-title text-lg font-bold text-gray-900 dark:text-white mb-0">
                Filtrar veículos
              </h2>
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

          <div className="ov-filter-form flex flex-col gap-4">
            {/* Campo Buscar Veículo */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-search">Buscar modelo ou marca</label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="filter-search"
                  type="text"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  placeholder="Ex: Corolla, Renegade..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#dfb15b]"
                />
              </div>
            </div>

            {/* Dropdown Marca */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-brand">Marca</label>
              <div className="relative mt-1">
                <select
                  id="filter-brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todas">Todas as marcas</option>
                  {brands.filter((b) => b !== 'Todas').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Ano */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-year">Ano mínimo</label>
              <div className="relative mt-1">
                <select
                  id="filter-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos">Todos os anos</option>
                  {years.filter((y) => y !== 'Todos').map((y) => (
                    <option key={y} value={y}>A partir de {y}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Preço */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-price">Faixa de Preço</label>
              <div className="relative mt-1">
                <select
                  id="filter-price"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos">Qualquer valor</option>
                  <option value="ate80">Até R$ 80.000</option>
                  <option value="80a120">R$ 80.000 a R$ 120.000</option>
                  <option value="acima120">Acima de R$ 120.000</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown Quilometragem */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-km">Quilometragem</label>
              <div className="relative mt-1">
                <select
                  id="filter-km"
                  value={selectedKmRange}
                  onChange={(e) => setSelectedKmRange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos">Todas as faixas</option>
                  <option value="ate30">Até 30.000 km</option>
                  <option value="30a60">30.000 a 60.000 km</option>
                  <option value="acima60">Acima de 60.000 km</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Câmbio */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-transmission">Câmbio</label>
              <div className="relative mt-1">
                <select
                  id="filter-transmission"
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos">Todos os câmbios</option>
                  {transmissions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Combustível */}
            <div>
              <label className="ov-filter-label" htmlFor="filter-fuel">Combustível</label>
              <div className="relative mt-1">
                <select
                  id="filter-fuel"
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#dfb15b] cursor-pointer"
                >
                  <option value="Todos">Todos os combustíveis</option>
                  {fuels.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Botão Buscar */}
            <button
              type="button"
              onClick={handleSearchClick}
              className="w-full py-3 bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-2"
            >
              <Search className="w-4 h-4" />
              <span>Aplicar filtros</span>
            </button>
          </div>
        </aside>

        {/* Grade de Veículos e Cabeçalho de Ordenação */}
        <div className="ov-stock-results min-w-0">
          {/* Contador de Veículos e Ordenação alinhada à borda direita */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              <span>{filteredVehicles.length}</span>{' '}
              <span className="font-normal text-gray-500 dark:text-gray-400">
                {filteredVehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
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
                  <option value="recent" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Mais recentes
                  </option>
                  <option value="price-asc" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Menor preço
                  </option>
                  <option value="price-desc" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Maior preço
                  </option>
                  <option value="km-asc" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Menor quilometragem
                  </option>
                  <option value="year-desc" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Ano mais novo
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid de Veículos: 3 Colunas no Computador */}
          {paginatedVehicles.length > 0 ? (
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
            <div className="liquid-glass rounded-2xl p-12 text-center max-w-lg mx-auto">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Nenhum veículo encontrado com os filtros selecionados.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#dfb15b] text-black text-xs font-bold rounded-xl hover:bg-[#efc676] transition-colors cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 flex items-center justify-center disabled:text-gray-300 disabled:dark:text-gray-600 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:border-[#dfb15b] enabled:hover:text-[#dfb15b] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  aria-label={`Página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center cursor-pointer transition-colors ${
                    page === currentPage
                      ? 'bg-[#dfb15b] text-black shadow-sm'
                      : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#dfb15b] hover:text-[#dfb15b]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 flex items-center justify-center disabled:text-gray-300 disabled:dark:text-gray-600 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:border-[#dfb15b] enabled:hover:text-[#dfb15b] transition-colors"
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
