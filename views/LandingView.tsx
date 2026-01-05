
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

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white dark:bg-[#1a2027]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">O que dizem nossos clientes</h2>
            <p className="text-text-secondary">Histórias reais de quem transformou sua rotina</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Ana Silva"
              role="Cliente"
              text="Nunca foi tão fácil agendar meu corte de cabelo. O MarcAI é simplesmente fantástico e muito rápido!"
              rating={5}
            />
            <TestimonialCard
              name="Carlos Pereira"
              role="Barbeiro"
              text="Minha agenda está sempre organizada agora. Meus clientes adoram a facilidade de agendamento."
              rating={5}
            />
            <TestimonialCard
              name="Mariana Costa"
              role="Cliente"
              text="Amei a interface! É super intuitiva e consigo encontrar profissionais excelentes perto de mim."
              rating={5}
            />
            <TestimonialCard
              name="Ricardo Santos"
              role="Empresário"
              text="Como dono de salão, o MarcAI otimizou todo o meu processo de reservas. Recomendo demais!"
              rating={5}
            />
            <TestimonialCard
              name="Fernanda Lima"
              role="Cliente"
              text="O lembrete de agendamento me salvou várias vezes. Serviço impecável e muito útil."
              rating={5}
            />
            <TestimonialCard
              name="João Oliveira"
              role="Personal Trainer"
              text="Gerenciar meus alunos ficou muito mais simples. A plataforma é robusta e confiável."
              rating={5}
            />
          </div>
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

const TestimonialCard: React.FC<{ name: string, role: string, text: string, rating: number }> = ({ name, role, text, rating }) => (
  <div className="bg-gray-50 dark:bg-[#1c2127] p-8 rounded-2xl border border-gray-100 dark:border-[#3b4754] flex flex-col gap-4 hover:shadow-lg transition-all">
    <div className="flex gap-1 text-yellow-400">
      {[...Array(rating)].map((_, i) => (
        <span key={i} className="material-symbols-outlined fill-1 text-sm">star</span>
      ))}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic">"{text}"</p>
    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
        {name[0]}
      </div>
      <div>
        <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
        <p className="text-xs text-text-secondary">{role}</p>
      </div>
    </div>
  </div>
);
