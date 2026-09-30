import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { publicAsset } from '../lib/publicAsset';

const items = [
  ['inicio', 'Início'],
  ['estoque', 'Comprar carros'],
  ['financiamento', 'Financiamento'],
  ['sobre', 'Sobre nós'],
  ['contato', 'Contato'],
];

export default function Navbar({ activeTab, onSelectTab }) {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab === 'inicio') {
        const heroEl = document.querySelector('.ov-hero');
        if (heroEl) {
          const rect = heroEl.getBoundingClientRect();
          // Aparece somente quando o visitante rola e sai da seção Hero
          setIsScrolled(rect.bottom <= 80);
        } else {
          setIsScrolled(window.scrollY > 500);
        }
      } else {
        setIsScrolled(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const navigate = (id) => {
    setOpen(false);
    onSelectTab(id);
  };

  const isHeroPage = activeTab === 'inicio';
  // On mobile, keep header accessible at all times; on desktop hero, fade in after scroll
  const hideNavbar = isHeroPage && !isScrolled && !open;

  return (
    <header
      className={`ov-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out border-b ${
        hideNavbar
          ? 'max-md:translate-y-0 max-md:opacity-100 max-md:pointer-events-auto -translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      } bg-[#090a0b]/92 backdrop-blur-md border-white/10 text-white`}
    >
      <div className="max-w-7xl mx-auto flex h-16 sm:h-[72px] items-center justify-between gap-2 px-3 sm:px-6">
        {/* Logo à esquerda */}
        <button
          onClick={() => navigate('inicio')}
          aria-label="Oliveira Veículos — início"
          className="shrink-0 cursor-pointer flex items-center active:scale-95 transition-transform"
        >
          <img
            src={publicAsset('logo-dark.png')}
            alt="Oliveira Veículos"
            className="h-8 sm:h-9 w-auto max-w-[115px] xs:max-w-[135px] sm:max-w-[170px] object-contain ov-logo-breathing"
          />
        </button>

        {/* Botão de Ação Rápida ao Centro (Formato Pílula Moderno no Mobile e Desktop) */}
        <div className="flex-1 flex justify-center px-1">
          <button
            onClick={() => navigate('estoque')}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#dfb15b] hover:bg-[#efc676] text-black font-semibold text-[11px] xs:text-[12px] sm:text-[13px] py-1.5 px-3 sm:px-4 min-h-[38px] sm:min-h-[42px] transition-transform duration-150 active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
            aria-label="Encontrar meu carro no estoque"
          >
            <span className="hidden min-[380px]:inline">Encontrar meu carro</span>
            <span className="inline min-[380px]:hidden">Encontrar carro</span>
            <ArrowUpRight size={14} className="shrink-0 text-black stroke-[2.5]" />
          </button>
        </div>

        {/* Navegação Desktop (Abas) */}
        <nav aria-label="Navegação principal" className="hidden lg:flex h-full items-center gap-7">
          {items.map(([id, label]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`ov-nav-link ${activeTab === id ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Direita: Tema + Hambúrguer */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Alternador de tema no Desktop */}
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            {isDark ? (
              <Sun size={18} strokeWidth={2} />
            ) : (
              <Moon size={18} strokeWidth={2} />
            )}
          </button>

          {/* Menu Hambúrguer */}
          <button
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="ov-mobile-nav"
            onClick={() => setOpen(!open)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white active:scale-95 transition-transform cursor-pointer"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Retrátil com Formato Pílula e Toque Ergonômico */}
      {open && (
        <nav
          id="ov-mobile-nav"
          aria-label="Navegação móvel"
          className="lg:hidden bg-[#0d0e11] border-t border-white/10 px-4 py-4 space-y-2 max-h-[calc(100svh-64px)] overflow-y-auto shadow-2xl"
        >
          {items.map(([id, label]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`w-full text-left px-4 py-3 min-h-[46px] rounded-full text-sm font-semibold transition-all flex items-center justify-between active:scale-95 cursor-pointer ${
                activeTab === id
                  ? 'bg-[#dfb15b] text-black shadow-md font-bold'
                  : 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{label}</span>
              <ArrowUpRight size={16} className={activeTab === id ? 'text-black' : 'text-gray-400'} />
            </button>
          ))}
          <button
            onClick={() => navigate('onde-estamos')}
            className={`w-full text-left px-4 py-3 min-h-[46px] rounded-full text-sm font-semibold transition-all flex items-center justify-between active:scale-95 cursor-pointer ${
              activeTab === 'onde-estamos'
                ? 'bg-[#dfb15b] text-black shadow-md font-bold'
                : 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/5'
            }`}
          >
            <span>Onde estamos</span>
            <ArrowUpRight size={16} className={activeTab === 'onde-estamos' ? 'text-black' : 'text-gray-400'} />
          </button>
        </nav>
      )}
    </header>
  );
}
