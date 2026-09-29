import React from 'react';
import { MapPin, Phone, Clock3, Lock } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import InstagramIcon from './InstagramIcon';

export default function Footer({ onSelectTab }) {
  const links = [
    ['inicio', 'Início'],
    ['estoque', 'Comprar carros'],
    ['financiamento', 'Financiamento'],
    ['sobre', 'Sobre nós'],
    ['contato', 'Contato'],
  ];

  return (
    <footer className="ov-footer">
      <div className="ov-shell ov-footer-grid">
        <div>
          <img
            src="/logo-dark.png"
            alt="Oliveira Veículos"
            className="h-10 max-w-[175px] object-contain ov-logo-breathing"
          />
          <p>Veículos selecionados e atendimento próximo para sua próxima conquista.</p>
          <a
            href={COMPANY_DATA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Oliveira Veículos"
            title="Instagram da Oliveira Veículos"
            className="ov-social inline-flex items-center justify-center transition-colors hover:text-white"
          >
            <InstagramIcon size={18} />
          </a>
        </div>

        <div>
          <h3>NAVEGAÇÃO</h3>
          {links.map(([id, label]) => (
            <button key={id} onClick={() => onSelectTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <div>
          <h3>EXPLORE</h3>
          <button onClick={() => onSelectTab('estoque')}>Nosso estoque</button>
          <button onClick={() => onSelectTab('sobre')}>A loja</button>
          <button onClick={() => onSelectTab('onde-estamos')}>Como chegar</button>
          <button onClick={() => onSelectTab('financiamento')}>Simular financiamento</button>
        </div>

        <div>
          <h3>FALE CONOSCO</h3>
          <a href={COMPANY_DATA.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={16} />
            {COMPANY_DATA.address}
          </a>
          <a href={`tel:+${COMPANY_DATA.whatsappNumber}`}>
            <Phone size={16} />
            {COMPANY_DATA.phone}
          </a>
          <p className="ov-footer-hours">
            <Clock3 size={16} />
            <span>{COMPANY_DATA.hours}</span>
          </p>
        </div>
      </div>

      <div className="ov-shell ov-footer-bottom">
        <span>© {new Date().getFullYear()} Oliveira Veículos · Maricá, RJ</span>
        <button
          onClick={() => onSelectTab('admin')}
          aria-label="Acesso administrativo"
          title="Acesso administrativo"
        >
          <Lock size={15} />
        </button>
      </div>
    </footer>
  );
}
