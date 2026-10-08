import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import { VehiclesProvider } from './context/VehiclesContext';
import Navbar from './components/Navbar';
import Showroom from './components/Showroom';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { publicAsset } from './lib/publicAsset';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WhereWeArePage = lazy(() => import('./pages/WhereWeArePage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const FinancingPage = lazy(() => import('./pages/FinancingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function getInitialTab() {
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);

  if (hash === '#admin' || search.has('admin')) {
    return 'admin';
  }
  if (hash === '#estoque' || hash === '#carros' || hash === '#comprar-carros') {
    return 'estoque';
  }
  if (hash === '#onde-estamos') {
    return 'onde-estamos';
  }
  if (hash === '#financiamento') return 'financiamento';
  if (hash === '#contato') return 'contato';
  if (
    hash === '#sobre' ||
    hash === '#diferenciais' ||
    hash === '#depoimentos' ||
    hash === '#confianca' ||
    hash === '#momentos'
  ) {
    return 'sobre';
  }
  if (hash === '#inicio') {
    return 'inicio';
  }
  return 'inicio';
}

function getSharedVehicleId() {
  return new URLSearchParams(window.location.search).get('veiculo') || null;
}

function PageTransitionOverlay({ isVisible }) {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="ov-page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-[150] pointer-events-none flex flex-col items-center justify-center backdrop-blur-lg ${
            isDark ? 'bg-[#0a0a0a]/90' : 'bg-[#f8f9fa]/92'
          }`}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: [0.95, 1.03, 1], opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center select-none"
          >
            <img
              src={publicAsset(isDark ? 'logo-dark.png' : 'logo-light.png')}
              alt="Oliveira Veículos"
              className="h-16 sm:h-20 w-auto max-w-[280px] object-contain ov-transition-logo"
            />
            <div className="mt-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cf8d3c] animate-ping" />
              <span
                className={`text-[11px] font-mono tracking-widest uppercase font-semibold ${
                  isDark ? 'text-[#cf8d3c]/90' : 'text-[#a2681c]'
                }`}
              >
                Oliveira Veículos
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sharedVehicleId] = useState(getSharedVehicleId());
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Efeito de carregamento inicial e transição de páginas ágil e elegante
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Sincronizar com mudanças de hash no navegador
  useEffect(() => {
    function onHashChange() {
      const nextTab = getInitialTab();
      setActiveTab(nextTab);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    if (tabId === 'estoque') {
      setSelectedVehicle(null);
      window.location.hash = '#estoque';
    } else if (tabId === 'onde-estamos') {
      window.location.hash = '#onde-estamos';
    } else if (tabId === 'sobre') {
      window.location.hash = '#sobre';
    } else if (tabId === 'inicio') {
      window.location.hash = '#inicio';
    } else if (tabId === 'admin') {
      window.location.hash = '#admin';
    } else if (tabId === 'financiamento' || tabId === 'contato') {
      window.location.hash = `#${tabId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectVehicle(vehicle) {
    setSelectedVehicle(vehicle);
    setActiveTab('estoque');
    window.location.hash = '#estoque';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Painel Admin Isolado
  if (activeTab === 'admin') {
    return (
      <VehiclesProvider>
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
          <AdminPanel onBack={() => handleSelectTab('estoque')} />
        </Suspense>
      </VehiclesProvider>
    );
  }

  return (
    <VehiclesProvider>
      <MotionConfig reducedMotion="user">
        <PageTransitionOverlay isVisible={isTransitioning} />
        <div
          className={`ov-site-shell min-h-[100svh] ${
            isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f7f8fa] text-gray-900'
          } selection:bg-[#cf8d3c]/20 selection:text-[#cf8d3c] overflow-x-hidden font-sans antialiased transition-colors duration-200 flex flex-col justify-between`}
        >
        <div>
          {/* Top Navbar com 4 abas + WhatsApp */}
          <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />

          {/* Conteúdo Dinâmico por Aba */}
          <motion.main
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex-grow"
          >
            {activeTab === 'inicio' && (
              <Suspense fallback={<PageTransitionOverlay isVisible={true} />}>
                <HomePage
                  onGoToEstoque={() => handleSelectTab('estoque')}
                  onGoToOndeEstamos={() => handleSelectTab('onde-estamos')}
                  onGoToSobre={() => handleSelectTab('sobre')}
                  onSelectVehicle={handleSelectVehicle}
                />
              </Suspense>
            )}

            {activeTab === 'estoque' && (
              <Showroom
                sharedVehicleId={sharedVehicleId}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={handleSelectVehicle}
                onClearVehicle={() => setSelectedVehicle(null)}
              />
            )}

            {activeTab === 'sobre' && (
              <Suspense fallback={<PageTransitionOverlay isVisible={true} />}>
                <AboutPage onGoToEstoque={() => handleSelectTab('estoque')} />
              </Suspense>
            )}
            {activeTab === 'financiamento' && (
              <Suspense fallback={<PageTransitionOverlay isVisible={true} />}>
                <FinancingPage onGoToEstoque={() => handleSelectTab('estoque')} />
              </Suspense>
            )}
            {activeTab === 'contato' && (
              <Suspense fallback={<PageTransitionOverlay isVisible={true} />}>
                <ContactPage onGoToOndeEstamos={() => handleSelectTab('onde-estamos')} />
              </Suspense>
            )}

            {activeTab === 'onde-estamos' && (
              <Suspense fallback={<PageTransitionOverlay isVisible={true} />}>
                <WhereWeArePage />
              </Suspense>
            )}
          </motion.main>
        </div>

        {/* Rodapé Oficial Escuro */}
        <Footer onSelectTab={handleSelectTab} />

        {/* Botão Flutuante de WhatsApp */}
        <WhatsAppFloat />
      </div>
     </MotionConfig>
    </VehiclesProvider>
  );
}
