import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Tag, Landmark, ShieldCheck, ArrowRight, Wrench } from 'lucide-react';

export default function Services({ onGoToEstoque }) {
  const services = [
    {
      id: 'consignacao',
      title: 'Consignação Inteligente',
      badge: 'Venda Rápida',
      icon: ShieldCheck,
      desc: 'Deixe seu carro com quem sabe vender. Cuidamos do anúncio, atendimento, preparação e garantia.',
      details: [
        'Anúncio profissional em todas as plataformas',
        'Pátio amplo e monitorado 24h na RJ-106',
        'Cuidamos de 100% da negociação e transferência',
        'Receba o valor acordado direto na sua conta',
      ],
      whatsappMsg: 'Olá! Gostaria de saber mais sobre a Consignação do meu carro na Oliveira Veículos.',
      cta: 'Consignar Veículo',
    },
    {
      id: 'financiamento',
      title: 'Financiamento Facilitado',
      badge: 'Menores Taxas',
      icon: Landmark,
      desc: 'Parcerias com os 8 maiores bancos do país para garantir a parcela que cabe no seu bolso.',
      details: [
        'Simulações com Santander, BV, Itaú, Bradesco e Safra',
        'Possibilidade de financiar com ou sem entrada',
        'Aprovação rápida e desburocratizada pelo WhatsApp',
        'Primeira parcela em até 60 dias para pagar',
      ],
      whatsappMsg: 'Olá! Gostaria de simular um financiamento com as menores taxas na Oliveira Veículos.',
      cta: 'Simular Parcelas',
    },
    {
      id: 'compra',
      title: 'Compramos seu Carro',
      badge: 'Pix no Ato',
      icon: ShoppingCart,
      desc: 'Precisa vender com rapidez e segurança? Avaliamos seu veículo e pagamos via Pix no mesmo dia.',
      details: [
        'Avaliação justa baseada na realidade de mercado',
        'Quitamos multas, IPVA ou financiamento pendente',
        'Zero dor de cabeça com cartório ou burocracia',
        'Pagamento seguro e imediato na sua conta',
      ],
      whatsappMsg: 'Olá! Quero vender meu carro e gostaria de uma avaliação na Oliveira Veículos.',
      cta: 'Vender Meu Carro',
    },
    {
      id: 'troca',
      title: 'Troca com Troco & Seminovos',
      badge: 'Garantia Total',
      icon: Tag,
      desc: 'Utilize seu carro usado como entrada e saia de modelo mais novo com dinheiro no bolso.',
      details: [
        '100% dos carros com procedência e revisão garantidas',
        'Garantia mecânica de motor e câmbio',
        'Higienização completa e polimento antes da entrega',
        'Troco entregue na sua conta bancária',
      ],
      whatsappMsg: 'Olá! Quero conferir os carros disponíveis no estoque da Oliveira Veículos.',
      cta: 'Ver Veículos',
      isEstoqueLink: true,
    },
  ];

  return (
    <section id="servicos" className="relative py-12">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-[#cf8d3c] bg-[#cf8d3c]/10 mb-3 border border-[#cf8d3c]/20">
          <Wrench className="w-3.5 h-3.5" />
          <span>02 · COMO PODEMOS AJUDAR</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-gray-950 dark:text-white tracking-tight">
          Escolha o caminho que combina com você
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Quer comprar, financiar, trocar ou vender? Comece pela opção que corresponde ao que você precisa agora.
        </p>
      </div>

      {/* Grid com 4 colunas em telas amplas, 2 em médias e 1 no mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {services.map((service, idx) => {
          const Icon = service.icon;
          const whatsappUrl = `https://wa.me/5521998016913?text=${encodeURIComponent(
            service.whatsappMsg
          )}`;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group rounded-2xl p-6 sm:p-7 ov-card-glass flex flex-col justify-between h-full"
            >
              <div>
                {/* Topo do card: Ícone + Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#cf8d3c]/10 text-[#cf8d3c] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {service.badge}
                  </span>
                </div>

                {/* Título e Descrição */}
                <h3 className="font-display font-bold text-xl text-gray-950 dark:text-white mb-2 leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {service.desc}
                </p>

                {/* Lista de benefícios */}
                <ul className="space-y-2 mb-8">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cf8d3c] shrink-0 mt-1.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botão alinhado na base do card */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
                {service.isEstoqueLink && onGoToEstoque ? (
                  <button
                    type="button"
                    onClick={onGoToEstoque}
                    className="w-full min-h-11 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-[#cf8d3c] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{service.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-11 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white bg-[#cf8d3c] hover:bg-[#b5761e] transition-colors shadow-sm cursor-pointer"
                  >
                    <span>{service.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
