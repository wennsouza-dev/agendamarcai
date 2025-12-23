
import React from 'react';
import { ViewState } from '../types';

interface LandingViewProps {
  setView: (view: ViewState) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setView }) => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-6 lg:px-20 py-12 lg:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">
            Agende serviços em segundos, <span className="text-primary">sem complicação</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto lg:mx-0">
            A plataforma inteligente que conecta você aos melhores profissionais com usabilidade mobile-first e IA.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => setView('CLIENT_SEARCH')}
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all"
            >
              Agendar agora
            </button>
            <button 
              onClick={() => setView('PRO_DASHBOARD')}
              className="px-8 py-4 bg-gray-100 dark:bg-[#283039] font-bold rounded-xl transition-all"
            >
              Sou profissional
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOHfOW9bUhQb-V5awj_PV3TQbWIj3aIr9oKSSXO7IAF3W4C7nt0pCjjT2Qnn6IxMHO5XatYDFS77dTj-DqMdfRDSb0-juNJY5cIPksFFFyKZI4eelMWxxcEMVZx53yPiOCBqDNR9TffuL6ZZe2laoBuEFQCuH4byBmmm2fPmaBMJDgzKBFoWQe6ryiENlPiDAl0hax9LaYU-kZDl4mapwZLulEYMw_8VSb9F49a3d0LCtZSflhsfqI6fBEXFKBTGVJ4xh22Drt1wo" 
              className="w-full h-full object-cover"
              alt="MarcAI Preview"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-50 dark:bg-[#1a2027] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-text-secondary">Simplicidade em 3 passos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              icon="search" 
              title="Busque o serviço" 
              desc="Encontre o profissional ideal perto de você com nossa busca inteligente." 
            />
            <StepCard 
              icon="calendar_today" 
              title="Escolha o horário" 
              desc="Visualize a disponibilidade em tempo real e escolha o que melhor se adapta." 
            />
            <StepCard 
              icon="check_circle" 
              title="Confirme e relaxe" 
              desc="Receba a confirmação instantânea e lembretes inteligentes." 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h2 className="text-3xl lg:text-4xl font-black mb-6 relative z-10">Pronto para simplificar sua vida?</h2>
          <p className="text-xl mb-8 opacity-90 relative z-10">Junte-se a milhares de clientes e profissionais hoje mesmo.</p>
          <button 
            onClick={() => setView('CLIENT_SEARCH')}
            className="px-10 py-5 bg-white text-primary font-bold rounded-2xl shadow-lg hover:scale-105 transition-all relative z-10"
          >
            Começar agora
          </button>
        </div>
      </section>
    </div>
  );
};

const StepCard: React.FC<{ icon: string, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white dark:bg-[#1c2127] p-8 rounded-2xl border border-gray-100 dark:border-[#3b4754] flex flex-col items-center text-center group hover:border-primary transition-all">
    <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-text-secondary">{desc}</p>
  </div>
);
