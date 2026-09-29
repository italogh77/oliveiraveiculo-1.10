import React, { useState } from 'react';
import { Calculator, ArrowRight, MessageCircle, ShieldCheck, AlertCircle } from 'lucide-react';
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

  return (
    <main className="ov-shell ov-page ov-financing">
      <div className="ov-page-intro">
        <span className="ov-kicker">FINANCIAMENTO</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          Um caminho mais simples para seu próximo carro.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
          Calcule uma estimativa ilustrativa e converse com nossa equipe para consultar as condições e simulações reais aprovadas pelos bancos.
        </p>
      </div>

      <div className="ov-finance-grid">
        {/* Formulário de Estimativa */}
        <div className="ov-form-card ov-card-glass rounded-2xl p-6 sm:p-8">
          <div className="ov-card-heading flex items-center gap-2.5 mb-4">
            <Calculator size={22} className="text-[#cf8d3c]" />
            <h2 className="text-2xl font-bold">Estime sua parcela</h2>
          </div>

          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-3">
            Valor do veículo
            <input
              type="number"
              min="0"
              step="1000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b]"
            />
          </label>

          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
            Valor da entrada
            <input
              type="number"
              min="0"
              max={value}
              step="1000"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b]"
            />
          </label>

          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
            Prazo
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b] cursor-pointer"
            >
              {[12, 24, 36, 48, 60].map((n) => (
                <option key={n} value={n}>
                  {n} meses
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
            Taxa mensal para estimativa (%)
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b]"
            />
          </label>

          <p className="ov-fine-print text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
            Taxa ilustrativa e editável. A taxa real e as condições dependem da análise de crédito individual feita por cada instituição bancária parceira.
          </p>
        </div>

        {/* Resumo da Estimativa e CTA */}
        <div className="ov-finance-side flex flex-col gap-4">
          <div className="ov-summary rounded-2xl p-6 sm:p-7 shadow-md">
            <span className="text-xs font-mono uppercase tracking-widest opacity-80 block mb-2">
              RESUMO DA ESTIMATIVA
            </span>

            <div className="flex justify-between items-center py-2.5 border-b border-white/15 text-sm">
              <small className="text-white/80">Valor do veículo</small>
              <strong className="text-white font-semibold">{brl(value)}</strong>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-white/15 text-sm">
              <small className="text-white/80">Entrada informada</small>
              <strong className="text-white font-semibold">{brl(down)}</strong>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-white/15 text-sm">
              <small className="text-white/80">Valor financiado</small>
              <strong className="text-white font-semibold">{brl(financed)}</strong>
            </div>

            <div className="ov-summary-result pt-5 pb-2">
              <small className="text-xs uppercase tracking-wider text-white/80 block mb-1">
                Parcela mensal estimada
              </small>
              <div className="flex items-baseline gap-1">
                <strong className="text-3xl sm:text-4xl font-extrabold text-white">
                  {brl(Number.isFinite(payment) ? payment : 0)}
                </strong>
                <sub className="text-sm font-medium text-white/80">/mês</sub>
              </div>
            </div>

            {/* Aviso explícito próximo ao resultado com alta legibilidade */}
            <div className="mt-4 p-3.5 rounded-xl bg-black/25 border border-white/20 text-xs sm:text-[13px] leading-relaxed text-amber-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p>
                Este cálculo é apenas uma estimativa e não representa uma proposta ou aprovação de crédito. Os valores e as condições podem variar conforme a análise do banco. Para uma simulação personalizada, entre em contato com um de nossos vendedores.
              </p>
            </div>
          </div>

          {/* Botão em destaque: Solicitar simulação com um vendedor */}
          <a
            className="py-4 px-6 text-sm sm:text-base font-bold rounded-xl shadow-lg bg-[#dfb15b] hover:bg-[#efc676] text-black flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
            href={`https://wa.me/5521998016913?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={19} />
            <span>Solicitar simulação com um vendedor</span>
          </a>

          <button
            type="button"
            className="group w-full py-3.5 px-5 rounded-xl border border-[#dfb15b] text-[#dfb15b] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-[#dfb15b] hover:text-black shadow-sm"
            onClick={onGoToEstoque}
          >
            <span>Ver veículos no estoque</span>
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="ov-finance-note mt-8 flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-sm text-gray-700 dark:text-gray-300">
        <ShieldCheck size={22} className="text-emerald-500 shrink-0" />
        <span>
          Tem dúvidas sobre entrada, parcelas ou análise de crédito? Nosso time consulta diretamente os 8 maiores bancos para aprovar as melhores condições para você.
        </span>
      </div>
    </main>
  );
}
