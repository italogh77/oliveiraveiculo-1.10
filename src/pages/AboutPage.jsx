import React from 'react';
import { Award, MessageSquare, Car, ShieldCheck, Navigation, ArrowUpRight, Sparkles } from 'lucide-react';
import TrustBar from '../components/TrustBar';
import SocialProof from '../components/SocialProof';
import Services from '../components/Services';
import SellersContact from '../components/SellersContact';
import { COMPANY_DATA } from '../data/companyData';
import { Reveal } from '../components/Reveal';

export default function AboutPage({ onGoToEstoque }) {
  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const navOffset = window.innerWidth >= 640 ? 96 : 80;
    const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="ov-about pt-20 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1540px] mx-auto w-full text-gray-900 dark:text-white transition-colors duration-300">
      {/* ── 1. APRESENTAÇÃO DA LOJA (COM ANIMAÇÃO DE ENTRADA SUAVE) ── */}
      <Reveal className="text-center max-w-4xl mx-auto mb-9 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dfb15b]/15 text-[#dfb15b] text-xs font-bold uppercase tracking-widest mb-4 border border-[#dfb15b]/30">
          <Award className="w-4 h-4" />
          <span>CONHEÇA A OLIVEIRA VEÍCULOS</span>
        </div>

        <h1 className="text-[clamp(1.85rem,6vw,3.25rem)] font-black text-gray-950 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Uma equipe próxima para ajudar você a escolher com confiança
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal max-w-3xl mx-auto">
          Na Oliveira Veículos, você compara opções, entende as condições e conversa diretamente com quem vai acompanhar sua compra — do primeiro contato à escolha do carro.
        </p>

        {/* Botões em Formato Pílula (Regra 1) */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
          {onGoToEstoque && (
            <button
              onClick={onGoToEstoque}
              className="btn-shine group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[46px] overflow-hidden rounded-full text-sm sm:text-base font-bold text-black bg-[#dfb15b] hover:bg-[#efc676] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Car className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0" />
              <span>Conhecer os veículos</span>
            </button>
          )}

          <a
            href={COMPANY_DATA.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[46px] overflow-hidden rounded-full text-sm sm:text-base font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer backdrop-blur-md shadow-sm"
          >
            <MessageSquare className="w-5 h-5 text-[#dfb15b] transition-transform duration-300 group-hover:scale-110 shrink-0" />
            <span>Conversar com a equipe</span>
          </a>
        </div>
      </Reveal>

      {/* Roteiro da página: reduz a carga cognitiva em uma página longa. */}
      <Reveal className="mb-16 sm:mb-20">
        <nav aria-label="Roteiro da página Sobre nós">
          <ol className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-[#111215] dark:shadow-black/30 overflow-hidden">
            {[
              { number: '01', title: 'Por que confiar', target: 'por-que-confiar' },
              { number: '02', title: 'Como ajudamos', target: 'como-ajudamos' },
              { number: '03', title: 'Experiências reais', target: 'momentos' },
              { number: '04', title: 'Fale com a equipe', target: 'equipe' },
            ].map((item, index) => (
              <li
                key={item.number}
                className={`${index % 2 ? 'border-l' : ''} ${index >= 2 ? 'border-t lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l' : 'lg:border-l-0'} border-gray-200/80 dark:border-white/10`}
              >
                <button
                  type="button"
                  onClick={() => scrollToSection(item.target)}
                  className="group flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#dfb15b]/[0.07] focus-visible:bg-[#dfb15b]/[0.07] cursor-pointer"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dfb15b]/15 text-[11px] font-black text-[#b7791f] dark:text-[#dfb15b]">
                    {item.number}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold leading-tight text-gray-950 dark:text-white group-hover:text-[#b7791f] dark:group-hover:text-[#dfb15b] transition-colors">
                    {item.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </Reveal>

      {/* ── 2. DIFERENCIAIS DA LOJA (GARANTIA E SEGURANÇA) ──────────── */}
      <Reveal className="mb-20 sm:mb-24 scroll-mt-24" id="por-que-confiar">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#dfb15b] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#dfb15b]" />
            <span>01 · POR QUE CONFIAR</span>
          </div>
          <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold text-gray-950 dark:text-white tracking-tight">
            Clareza para decidir com tranquilidade
          </h2>
          <p className="mt-2 text-xs sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Informações objetivas, atendimento direto e uma estrutura em Maricá para você conhecer tudo de perto.
          </p>
        </div>

        <TrustBar />
      </Reveal>

      {/* ── 3. CAMINHOS DISPONÍVEIS ── */}
      <Reveal className="mb-20 sm:mb-24 scroll-mt-24" id="como-ajudamos">
        <Services onGoToEstoque={onGoToEstoque} />
      </Reveal>

      {/* ── 4. PROVA SOCIAL ANTES DO CONVITE PARA CONTATO ── */}
      <Reveal className="mb-20 sm:mb-24">
        <SocialProof onGoToEstoque={onGoToEstoque} showFinalCta={false} />
      </Reveal>

      {/* ── 5. CONTATO HUMANO COMO PRÓXIMO PASSO ── */}
      <Reveal className="mb-20 sm:mb-24 scroll-mt-24" id="equipe">
        <SellersContact />
      </Reveal>

      {/* ── 6. SEÇÃO DE LOCALIZAÇÃO FIXADA ANTES DO RODAPÉ (Regra 7) ──── */}
      <Reveal className="mb-8 scroll-mt-24" id="visita">
        <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-[#141518] dark:to-[#0c0d0f] p-5 sm:p-8 lg:p-10 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Informações da loja */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dfb15b] uppercase tracking-wider mb-2">
                  <Sparkles size={13} />
                  <span>ÚLTIMO PASSO · VENHA NOS VISITAR</span>
                </span>

                <h2 className="text-[clamp(1.5rem,5.5vw,2.5rem)] font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight break-words mb-3">
                  Conheça a loja e veja os veículos de perto
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                  {COMPANY_DATA.address}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-[#dfb15b] shrink-0" />
                    <span>Segunda a Sexta: 08:30 às 18:30 · Sábado: 08:30 às 14:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Espaço climatizado, café e atendimento personalizado</span>
                  </div>
                </div>
              </div>

              {/* Botão em Pílula ocupando largura total no mobile */}
              <div className="pt-2">
                <a
                  href={COMPANY_DATA.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine group relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-sm min-h-[46px] px-6 py-3 transition-all duration-300 active:scale-95 shadow-md cursor-pointer"
                >
                  <Navigation size={16} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                  <span>Ver no Google Maps</span>
                  <ArrowUpRight size={16} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-90 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {/* iFrame com proporção fluida e cantos arredondados */}
            <div className="lg:col-span-6">
              <div className="relative aspect-video sm:h-72 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner bg-gray-100 dark:bg-black">
                <iframe
                  title="Mapa Oliveira Veículos Maricá"
                  src="https://maps.google.com/maps?q=-22.9033231,-42.7993074&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 filter dark:invert-[90%] dark:hue-rotate-180 dark:contrast-[115%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
