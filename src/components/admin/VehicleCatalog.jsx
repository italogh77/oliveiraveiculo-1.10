import React, { useEffect, useId, useMemo, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { CURRENT_YEAR, displayBrand, filterCatalogYears, loadCatalog } from '../../lib/vehicleCatalog';

const control = 'mt-1.5 w-full min-w-0 rounded-lg border border-white/15 bg-zinc-900 px-3 py-2.5 text-sm text-white disabled:opacity-40';
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function VehicleCatalog({ onApply }) {
  const id = useId();
  const [brands, setBrands] = useState([]);
  const [years, setYears] = useState([]);
  const [models, setModels] = useState([]);
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [model, setModel] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState('marcas');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const path = year ? `/${brand}/years/${year}/models` : brand ? `/${brand}/years` : '';
    loadCatalog(path, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      if (year) setModels(data.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      else if (brand) setYears(filterCatalogYears(data));
      else setBrands(data.sort((a, b) => displayBrand(a.name).localeCompare(displayBrand(b.name), 'pt-BR')));
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(''); });
    return () => controller.abort();
  }, [brand, year, retry]);

  const filtered = useMemo(() => {
    const terms = normalize(search).split(/[^a-z0-9]+/).filter(Boolean);
    return models.filter((row) => {
      const words = normalize(row.name).split(/[^a-z0-9]+/);
      return terms.every((term) => words.some((word) => word.startsWith(term)));
    });
  }, [models, search]);
  const selected = models.find((row) => String(row.code) === model);
  function apply() {
    const selectedBrand = brands.find((row) => String(row.code) === brand);
    if (!selected || !selectedBrand) return;
    onApply({ marca: displayBrand(selectedBrand.name), modelo: selected.name,
      anoModelo: String(year).split('-')[0],
      catalogoFipe: { marca: brand, modelo: model, ano: year, descricao: selected.name } });
    setApplied(true);
  }
  return (
    <section aria-label="Catálogo de veículos" className="space-y-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300"><Search size={16} /> Buscar no catálogo brasileiro</h3>
      <p className="text-xs text-zinc-400">Anos-modelo de 2000 a {CURRENT_YEAR}. Escolha marca e ano; depois busque o modelo e a versão. Você também pode preencher os campos abaixo manualmente.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-brand`} className="min-w-0 text-xs text-zinc-300">Marca do catálogo
          <select id={`${id}-brand`} className={control} value={brand} disabled={loading === 'marcas'} onChange={(e) => { setError(''); setLoading(e.target.value ? 'anos' : 'marcas'); setBrand(e.target.value); setYear(''); setModel(''); setYears([]); setModels([]); setSearch(''); setApplied(false); }}>
            <option value="">Selecione a marca</option>
            {brands.map((row) => <option key={row.code} value={row.code}>{displayBrand(row.name)}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-year`} className="min-w-0 text-xs text-zinc-300">Ano-modelo / combustível
          <select id={`${id}-year`} className={control} value={year} disabled={!brand || !!loading} onChange={(e) => { setError(''); setLoading(e.target.value ? 'modelos' : 'anos'); setYear(e.target.value); setModel(''); setModels([]); setSearch(''); setApplied(false); }}>
            <option value="">Selecione o ano</option>
            {years.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}
          </select>
        </label>
      </div>
      <label htmlFor={`${id}-search`} className="block text-xs text-zinc-300">Buscar modelo ou versão
        <input id={`${id}-search`} type="search" className={control} value={search} disabled={!year || !!loading} onChange={(e) => { setSearch(e.target.value); setModel(''); setApplied(false); }} placeholder="Ex.: Fit EX, Corolla XEi, Onix LTZ" />
      </label>
      <label htmlFor={`${id}-model`} className="block text-xs text-zinc-300">Modelo e versão disponíveis nesse ano
        <select id={`${id}-model`} className={control} value={model} disabled={!year || !!loading} onChange={(e) => { setModel(e.target.value); setApplied(false); }}>
          <option value="">Selecione o modelo e a versão</option>
          {filtered.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}
        </select>
      </label>
      <div aria-live="polite" className="text-xs text-zinc-400">
        {loading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Carregando {loading}…</span>
          : error ? <p role="alert" className="text-amber-300">{error} <button type="button" className="underline" onClick={() => { setError(''); setLoading(year ? 'modelos' : brand ? 'anos' : 'marcas'); setRetry((n) => n + 1); }}>Tentar novamente</button></p>
          : year ? `${filtered.length} opções encontradas para esse ano e combustível.`
          : brand && !years.length ? 'Nenhum ano entre 2000 e o ano atual disponível para esta marca.'
          : `${brands.length} marcas disponíveis na base.`}
      </div>
      <button type="button" disabled={!selected || !!loading} onClick={apply} className="rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-bold text-black disabled:opacity-40">Usar no cadastro</button>
      {applied && <p role="status" className="text-xs text-emerald-300">Marca, modelo/versão e ano-modelo preenchidos. Confira o ano de fabricação e os demais dados antes de salvar.</p>}
      <p className="text-[11px] text-zinc-500">Fonte: catálogo FIPE via Parallelum. Cobertura conforme a base; exige internet e está sujeita ao limite de consultas do serviço. A descrição completa preserva a versão.</p>
    </section>
  );
}
