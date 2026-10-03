import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Check, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

// ── Animated Counter Hook ──────────────────────────────────────
function useCountUp(target, duration = 1800, startOnMount = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(startOnMount);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let startTime = null;
    const numTarget = parseInt(target.replace(/\D/g, ''), 10) || 0;
    const step = (timestamp) => {
      if (cancelled) return;
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * numTarget));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(numTarget);
    };
    requestAnimationFrame(step);
    return () => { cancelled = true; };
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

// ── Metric with animated counter ──────────────────────────────
function AnimatedMetric({ value, label, index }) {
  const ref = useRef(null);
  const hasSymbol = value.includes('+');
  const hasPercent = value.includes('%');
  const numericRaw = value.replace(/[^0-9]/g, '');
  const { count, start } = useCountUp(numericRaw, 1600);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { start(); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = count.toLocaleString('pt-BR') + (hasSymbol ? '+' : '') + (hasPercent ? '%' : '');

  return (
    <motion.div
      ref={ref}
      key={label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={`px-3 py-5 text-center sm:px-7 sm:py-6 ${index ? 'border-l border-white/10' : ''}`}
    >
      <strong className="block font-display text-xl font-black text-white sm:text-3xl tabular-nums">
        {display}
      </strong>
      <span className="mt-1 block text-[9px] uppercase tracking-[0.12em] text-white/50 sm:text-[11px]">
        {label}
      </span>
    </motion.div>
  );
}

const metrics = [
  { value: '1200+', label: 'veículos entregues' },
  { value: '100%', label: 'procedência verificada' },
  { value: '6', label: 'bancos parceiros' },
];

// ── Main Hero ─────────────────────────────────────────────────
export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: image moves up slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  const scrollToEstoque = () =>
    document.getElementById('showroom')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="hero-premium relative min-h-[94svh] overflow-hidden pt-24"
    >
      {/* ── Parallax Background Image ── */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <img
          src="./loja-oliveira-hero.jpg"
          alt="Loja Oliveira Veículos em Maricá - RJ"
          className="h-full w-full object-cover object-center scale-105"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/50" />
      </motion.div>

      {/* ── Main Content ── */}
      <div
        className="relative z-10 mx-auto flex min-h-[calc(94svh-6rem)] max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="w-full max-w-3xl">

          {/* Location badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
            <span className="h-2 w-2 rounded-full bg-gold" />
            Maricá · RJ — Rodovia Amaral Peixoto
          </div>

          {/* Main Headline */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl font-display text-[clamp(2.4rem,7.5vw,5.5rem)] font-black leading-[1.02] tracking-tight text-white"
            >
              Seu próximo carro <br className="hidden sm:block" />
              com procedência e garantia.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg"
          >
            Seminovos revisados, procedência garantida e aprovação rápida de crédito com os principais bancos do país.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3.5 sm:flex-row"
          >
            <button
              onClick={scrollToEstoque}
              className="group inline-flex min-h-13 items-center justify-center gap-2.5 rounded-xl bg-gold px-7 text-sm font-bold text-black transition-all hover:bg-gold-light active:scale-[.98]"
            >
              Ver estoque disponível
              <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>

            <a
              href={COMPANY_DATA.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-13 items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-7 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
              <ArrowUpRight className="h-4 w-4 opacity-70" />
            </a>
          </motion.div>

          {/* Trust Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.58 }}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/65"
          >
            {[
              { icon: Check, label: 'Procedência verificada' },
              { icon: ShieldCheck, label: 'Garantia total' },
              { icon: Star, label: 'Atendimento premium', fill: true },
            ].map(({ icon: Icon, label, fill }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.65 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 text-gold ${fill ? 'fill-gold' : ''}`} />
                {label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Metrics Bar ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {metrics.map((item, index) => (
            <AnimatedMetric key={item.label} {...item} index={index} />
          ))}
        </div>
      </div>

      {/* ── Bottom Divider ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
    </section>
  );
}
