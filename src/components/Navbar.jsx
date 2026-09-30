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
  const hideNavbar = isHeroPage && !isScrolled && !open;

  return (
    <header
      className={`ov-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        hideNavbar
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}
    >
      <div className="ov-shell flex h-[74px] items-center justify-between gap-4">
        <button
          onClick={() => navigate('inicio')}
          aria-label="Oliveira Veículos — início"
          className="shrink-0 cursor-pointer"
        >
          <img
            src={publicAsset(isDark ? 'logo-dark.png' : 'logo-light.png')}
            alt="Oliveira Veículos"
            className="h-9 w-auto max-w-[170px] object-contain"
          />
        </button>

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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de Preferência de Tema (Branco/Claro ou Preto/Escuro) */}
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="ov-theme-toggle flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer"
          >
            {isDark ? (
              <Sun size={19} strokeWidth={2} />
            ) : (
              <Moon size={19} strokeWidth={2} />
            )}
          </button>

          <button
            onClick={() => navigate('estoque')}
            className="ov-button ov-button-dark hidden sm:inline-flex cursor-pointer"
          >
            <span>Encontrar meu carro</span>
            <ArrowUpRight size={16} />
          </button>

          <button
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="ov-mobile-nav"
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-lg p-2 ml-auto sm:ml-0 cursor-pointer text-current"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="ov-mobile-nav" aria-label="Navegação móvel" className="ov-mobile-nav lg:hidden">
          {items.map(([id, label]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
          <button onClick={() => navigate('onde-estamos')}>Onde estamos</button>
        </nav>
      )}
    </header>
  );
}
