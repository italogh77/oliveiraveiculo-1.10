import React, { useState } from 'react';
import { Calculator, ArrowRight, MessageCircle, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

const brl = (n) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

export default function FinancingPage({ onGoToEstoque }) {
  const [price, setPrice] = useState(80000);
  const [entry, setEntry] = useState(20000);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(1.8);

  const value = Math.max(0, Number(price) || 0);
  const down = Math.min(value, Math.max(0, Number(entry) || 0));
  const financed = Math.max(0, value - down);
  const monthly = Math.max(0, Number(rate) || 0) / 100;
  const payment =
    financed === 0
      ? 0
      : monthly === 0
      ? financed / months
      : (financed * monthly) / (1 - Math.pow(1 + monthly, -months));

  const whatsappMessage = encodeURIComponent(
    `Olá! Fiz uma estimativa no site da Oliveira Veículos com os seguintes dados:\n• Valor do veículo: ${brl(value)}\n• Entrada: ${brl(down)}\n• Prazo: ${months} meses (estimativa)\n\nGostaria de solicitar uma simulação personalizada com um vendedor.`
  );

  const handleShortcutEntry = (pct) => {
    setEntry(Math.round(value * pct));
  };

  return (
    <main className="ov-shell ov-page ov-financing text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
      {/* ── Introdução ── */}
      <div className="ov-page-intro mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>SIMULADOR DE FINANCIAMENTO</span>
        </span>
        <h1 className="text-[clamp(1.75rem,6vw,3.25rem)] font-extrabold tracking-tight text-white leading-tight">
          Um caminho mais simples para seu próximo carro.
        </h1>
        <p className="text-xs sm:text-base text-gray-300 mt-2 font-medium max-w-2xl leading-relaxed">
          Calcule uma estimativa ilustrativa em segundos e consulte nossa equipe para verificar as taxas personalizadas aprovadas pelos bancos parceiros.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── 5. FORMULÁRIO DE ESTIMATIVA (Regra 5) ── */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#121316] p-5 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-white/10">
            <Calculator size={22} className="text-[#dfb15b]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-0">Estime sua parcela</h2>
          </div>

          <div className="space-y-5">
            {/* Campo: Valor do veículo */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300" htmlFor="fin-price">
                  Valor do veículo
                </label>
                <span className="text-xs font-mono font-bold text-[#dfb15b]">{brl(value)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">R$</span>
                <input
                  id="fin-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 min-h-[46px] rounded-xl border border-white/10 bg-white/5 text-white text-base font-semibold focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b]/30 transition-all"
                />
              </div>
            </div>

            {/* Campo: Entrada + Atalhos Rápidos em Pílula */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300" htmlFor="fin-entry">
                  Valor da entrada
                </label>
                <span className="text-xs font-mono font-bold text-[#dfb15b]">{brl(down)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">R$</span>
                <input
                  id="fin-entry"
                  type="number"
                  min="0"
                  max={value}
                  step="1000"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 min-h-[46px] rounded-xl border border-white/10 bg-white/5 text-white text-base font-semibold focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b]/30 transition-all"
                />
              </div>

              {/* Atalhos Rápidos de Entrada em Pílula (Regra 5) */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[
                  { label: 'Sem entrada', pct: 0 },
                  { label: '20% entrada', pct: 0.2 },
                  { label: '30% entrada', pct: 0.3 },
                  { label: '50% entrada', pct: 0.5 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleShortcutEntry(chip.pct)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 hover:border-[#dfb15b] hover:text-[#dfb15b] text-gray-300 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo: Prazo de Financiamento em Pílulas (Substitui o Select - Regra 5) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Prazo de financiamento
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map((n) => {
                  const active = months === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMonths(n)}
                      className={`min-h-[44px] rounded-full text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer border ${
                        active
                          ? 'bg-[#dfb15b] border-[#dfb15b] text-black shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-[#dfb15b]/50'
                      }`}
                    >
                      {n}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo: Taxa mensal para estimativa */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300" htmlFor="fin-rate">
                  Taxa mensal para estimativa (%)
                </label>
                <span className="text-xs font-mono text-gray-400">{rate}% a.m.</span>
              </div>
              <input
                id="fin-rate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-3 min-h-[46px] rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b]/30 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                Taxa ilustrativa e editável. A taxa real depende da análise de crédito individual feita por cada instituição bancária parceira.
              </p>
            </div>
          </div>
        </div>

        {/* ── Resumo da Estimativa e CTAs em Pílula ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#181a1f] to-[#101114] p-6 sm:p-7 shadow-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#dfb15b] font-bold block mb-3">
              RESUMO DA ESTIMATIVA
            </span>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-400">Valor do veículo</span>
                <strong className="text-white font-semibold">{brl(value)}</strong>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-400">Entrada informada</span>
                <strong className="text-white font-semibold">{brl(down)}</strong>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-400">Valor financiado</span>
                <strong className="text-white font-semibold">{brl(financed)}</strong>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-400">Prazo escolhido</span>
                <strong className="text-white font-semibold">{months} meses</strong>
              </div>
            </div>

            {/* Parcela Mensal Estimada */}
            <div className="pt-6 pb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400 block mb-1">
                Parcela mensal estimada
              </span>
              <div className="flex items-baseline gap-1.5">
                <strong className="text-[clamp(1.9rem,6vw,2.75rem)] font-extrabold text-[#dfb15b] tracking-tight">
                  {brl(Number.isFinite(payment) ? payment : 0)}
                </strong>
                <sub className="text-xs sm:text-sm font-medium text-gray-400">/mês</sub>
              </div>
            </div>

            {/* Aviso explícito */}
            <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs leading-relaxed text-amber-200/90 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#dfb15b] shrink-0 mt-0.5" />
              <p>
                Este cálculo é apenas uma estimativa ilustrativa. Para consultar aprovação com seu CPF sem compromisso, fale com nossos vendedores.
              </p>
            </div>
          </div>

          {/* Botão em Pílula: Solicitar simulação */}
          <a
            className="w-full inline-flex items-center justify-center gap-2 rounded-full min-h-[46px] px-6 py-3.5 text-sm sm:text-base font-bold text-black bg-[#dfb15b] hover:bg-[#efc676] active:scale-95 transition-transform duration-150 shadow-lg cursor-pointer"
            href={`https://wa.me/5521998016913?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} className="fill-black" />
            <span>Solicitar simulação com um vendedor</span>
          </a>

          {/* Botão em Pílula Secundário: Ver estoque */}
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full min-h-[44px] px-5 py-3 border border-white/15 hover:border-[#dfb15b] text-gray-300 hover:text-white text-xs sm:text-sm font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
            onClick={onGoToEstoque}
          >
            <span>Ver veículos no estoque</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Nota de rodapé da simulação */}
      <div className="mt-10 flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-gray-300">
        <ShieldCheck size={24} className="text-[#dfb15b] shrink-0" />
        <span>
          Tem dúvidas sobre entrada, parcelas ou análise de crédito? Nosso time consulta diretamente os 6 maiores bancos parceiros para buscar a melhor condição de crédito para você.
        </span>
      </div>
    </main>
  );
}
