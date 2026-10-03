import React, { useState, useMemo } from 'react';
import { MapPin, Phone, Clock3, ArrowUpRight, MessageCircle, Navigation } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useVehicles } from '../context/VehiclesContext';
import InstagramIcon from '../components/InstagramIcon';

export default function ContactPage({ onGoToOndeEstamos }) {
  const { vehicles } = useVehicles();
  const [name, setName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('nao-escolhi');
  const [customNote, setCustomNote] = useState('');

  // Encontrar veículo selecionado
  const selectedVehicle = useMemo(() => {
    if (selectedVehicleId === 'nao-escolhi') return null;
    return vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || null;
  }, [selectedVehicleId, vehicles]);

  // Rótulo descritivo do veículo (modelo, versão, ano)
  const vehicleLabel = useMemo(() => {
    if (!selectedVehicle) return '';
    const parts = [selectedVehicle.modelo];
    if (selectedVehicle.versao) parts.push(selectedVehicle.versao);
    if (selectedVehicle.ano) parts.push(`(${selectedVehicle.ano})`);
    return parts.join(' ').trim();
  }, [selectedVehicle]);

  // Mensagem inicial automática gerada
  const initialMessage = useMemo(() => {
    const clientName = name.trim() || '[seu nome]';
    if (!selectedVehicle || selectedVehicleId === 'nao-escolhi') {
      return `Olá! Meu nome é ${clientName} e gostaria de ajuda para escolher meu próximo carro.`;
    }
    return `Olá! Meu nome é ${clientName} e gostaria de mais informações sobre o ${vehicleLabel}.`;
  }, [name, selectedVehicle, selectedVehicleId, vehicleLabel]);

  // Envio final para o WhatsApp comercial (5521998016913)
  const handleSend = (event) => {
    event.preventDefault();
    const finalClientName = name.trim() || 'Cliente';
    const baseText =
      selectedVehicle && selectedVehicleId !== 'nao-escolhi'
        ? `Olá! Meu nome é ${finalClientName} e gostaria de mais informações sobre o ${vehicleLabel}.`
        : `Olá! Meu nome é ${finalClientName} e gostaria de ajuda para escolher meu próximo carro.`;

    const fullMessage = customNote.trim()
      ? `${baseText}\n\nComplemento: ${customNote.trim()}`
      : baseText;

    const whatsappUrl = `https://wa.me/5521998016913?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="ov-shell ov-page ov-contact-page">
      <div className="ov-page-intro">
        <span className="ov-kicker">CONTATO</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          Vamos conversar sobre seu próximo carro?
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
          Fale com a equipe, tire suas dúvidas ou planeje uma visita à loja.
        </p>
      </div>

      <div className="ov-contact-grid">
        {/* Formulário com veículo de interesse */}
        <form onSubmit={handleSend} className="ov-form-card ov-card-glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Envie uma mensagem</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Preencha seus dados para iniciar o atendimento diretamente com a equipe.
          </p>

          {/* 1. Seu nome */}
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
            Seu nome
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos chamar você?"
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b]"
            />
          </label>

          {/* 2. Qual veículo você deseja? */}
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
            Qual veículo você deseja?
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b] cursor-pointer"
            >
              <option value="nao-escolhi">Ainda não escolhi</option>
              {vehicles.map((v) => {
                const label = `${v.modelo}${v.versao ? ` ${v.versao}` : ''}${v.ano ? ` (${v.ano})` : ''}`;
                return (
                  <option key={v.id} value={v.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>

          {/* 3. Mensagem inicial (prévia automática) */}
          <div className="mt-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Mensagem inicial (gerada automaticamente)
            </span>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 p-3.5 text-sm text-gray-700 dark:text-gray-300 italic select-none">
              “{initialMessage}”
            </div>
          </div>

          {/* 4. Quer acrescentar algo? */}
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
            Quer acrescentar algo?
            <textarea
              rows="3"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex.: Tenho um usado na troca, prefiro simular com entrada ou tenho dúvida sobre o carro."
              className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-3 text-sm focus:outline-none focus:border-[#dfb15b]"
            />
          </label>

          <button
            type="submit"
            className="btn-shine group relative w-full mt-6 min-h-[46px] overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>Conversar no WhatsApp</span>
            <MessageCircle size={18} className="transition-transform duration-300 group-hover:scale-110 shrink-0" />
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            Ao clicar, sua mensagem será aberta no WhatsApp oficial da loja para você concluir o envio.
          </p>
        </form>

        {/* Detalhes de contato ordenados conforme especificação */}
        <div className="ov-contact-details ov-card-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Estamos em Maricá</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Escolha o canal mais prático para você.
          </p>

          {/* 1. Telefone principal */}
          <a
            href="tel:+5521998016913"
            className="ov-contact-item flex items-center gap-3.5 py-3.5 border-b border-gray-200 dark:border-gray-800 hover:text-[#dfb15b] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div className="flex-1">
              <small className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                TELEFONE & WHATSAPP PRINCIPAL
              </small>
              <strong className="text-base text-gray-900 dark:text-white font-semibold">
                (21) 99801-6913
              </strong>
            </div>
            <ArrowUpRight size={16} className="text-gray-400" />
          </a>

          {/* 2. Instagram com ícone oficial */}
          <a
            href={COMPANY_DATA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Oliveira Veículos"
            className="ov-contact-item flex items-center gap-3.5 py-3.5 border-b border-gray-200 dark:border-gray-800 hover:text-[#dfb15b] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0">
              <InstagramIcon size={18} />
            </div>
            <div className="flex-1">
              <small className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                INSTAGRAM
              </small>
              <strong className="text-base text-gray-900 dark:text-white font-semibold">
                {COMPANY_DATA.instagram}
              </strong>
            </div>
            <ArrowUpRight size={16} className="text-gray-400" />
          </a>

          {/* 3. Horário de atendimento atualizado */}
          <div className="ov-hours flex items-start gap-3.5 py-3.5 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0 mt-0.5">
              <Clock3 size={18} />
            </div>
            <div className="flex-1">
              <small className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                HORÁRIO DE ATENDIMENTO
              </small>
              <strong className="block text-sm text-gray-900 dark:text-white font-semibold mt-0.5">
                Segunda a sexta: das 08h às 18h
              </strong>
              <strong className="block text-sm text-gray-900 dark:text-white font-semibold">
                Sábado: das 09h às 14h
              </strong>
            </div>
          </div>

          {/* 4. Localização, endereço e mapa incorporado */}
          <div className="pt-4">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <small className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  LOCALIZAÇÃO
                </small>
                <strong className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">
                  {COMPANY_DATA.address}
                </strong>
              </div>
              <a
                href={COMPANY_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] overflow-hidden text-xs font-bold rounded-full bg-[#dfb15b] text-black hover:bg-[#efc676] active:scale-95 transition-all duration-200 shrink-0 shadow-sm cursor-pointer"
              >
                <Navigation size={13} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                <span>Como chegar</span>
              </a>
            </div>

            {/* Mapa incorporado adaptado */}
            <div className="w-full h-52 sm:h-56 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner mt-2">
              <iframe
                title="Mapa Oliveira Veículos Maricá"
                src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {onGoToOndeEstamos && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={onGoToOndeEstamos}
                  className="ov-text-link text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Ver página completa de localização</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
