import React from 'react';
import { ViewState } from '../types';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isLoggedIn?: boolean;
  userEmail?: string;
}

export const Header: React.FC<{ setView: (view: ViewState) => void, isLanding: boolean }> = ({ setView, isLanding }) => (
  <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-[#283039] bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-6 py-4 lg:px-20">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
      <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
        <span className="material-symbols-outlined">schedule</span>
      </div>
      <h2 className="text-xl font-bold tracking-tight">MarcAI</h2>
    </div>

    <div className="flex items-center gap-4 lg:gap-8">
      {isLanding ? (
        <>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('CLIENT_SEARCH')} className="text-sm font-medium hover:text-primary transition-colors">Sou Cliente</button>
            <button onClick={() => setView('PRO_DASHBOARD')} className="text-sm font-medium hover:text-primary transition-colors">Sou Profissional</button>
          </nav>
          <div className="flex gap-2">
            <button onClick={() => setView('PRO_DASHBOARD')} className="hidden sm:flex px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#283039] text-sm font-bold">Entrar</button>
            <button onClick={() => setView('CLIENT_SEARCH')} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">Cadastrar</button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={() => setView('CLIENT_DASHBOARD')} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#283039] flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
          <div className="size-8 rounded-full overflow-hidden border border-primary/20">
            <img src="https://picsum.photos/seed/user/100" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-[#111418] pt-16 pb-8 border-t border-gray-200 dark:border-[#283039]">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg">MarcAI</h3>
        <ul className="flex flex-col gap-2 text-text-secondary text-sm">
          <li><a href="#" className="hover:text-primary">Sobre nós</a></li>
          <li><a href="#" className="hover:text-primary">Carreiras</a></li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg">Produto</h3>
        <ul className="flex flex-col gap-2 text-text-secondary text-sm">
          <li><a href="#" className="hover:text-primary">Funcionalidades</a></li>
          <li><a href="#" className="hover:text-primary">Preços</a></li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg">Suporte</h3>
        <ul className="flex flex-col gap-2 text-text-secondary text-sm">
          <li><a href="#" className="hover:text-primary">Ajuda</a></li>
          <li><a href="#" className="hover:text-primary">Fale Conosco</a></li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg">Legal</h3>
        <ul className="flex flex-col gap-2 text-text-secondary text-sm">
          <li><a href="#" className="hover:text-primary">Privacidade</a></li>
          <li><a href="#" className="hover:text-primary">Termos</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-gray-200 dark:border-[#283039] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
      <p>© 2024 MarcAI Agenda. Todos os direitos reservados.</p>
      <div className="flex gap-4">
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
      </div>
    </div>
  </footer>
);

import { DeveloperFloatingButton } from './DeveloperFloatingButton';

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, userEmail }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isDashboard = currentView.startsWith('PRO_') || currentView === 'CLIENT_DASHBOARD' || currentView === 'ADMIN_DASHBOARD';
  const userType = currentView.startsWith('PRO_') || currentView === 'ADMIN_DASHBOARD' ? 'PRO' : 'CLIENT';

  if (isDashboard) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#111418]">
        <Sidebar
          currentView={currentView}
          setView={(v) => { setView(v); setIsSidebarOpen(false); }}
          userType={userType}
          userEmail={userEmail}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Dashboard Header - Simplified */}
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-[#283039] bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-6 py-4 lg:hidden">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">MarcAI</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-[#283039]"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </header>

          <main className="flex-1 w-full p-6 lg:p-10">
            {children}
          </main>
        </div>
        <DeveloperFloatingButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header setView={setView} isLanding={currentView === 'LANDING'} />
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <DeveloperFloatingButton />
    </div>
  );
};
