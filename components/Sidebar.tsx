import React from 'react';
import { ViewState } from '../types';
import { supabase } from '../services/supabase';

interface SidebarProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
    userType: 'CLIENT' | 'PRO';
    userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userType, userEmail }) => {
    const menuItems = [
        {
            label: 'Visão Geral',
            icon: 'dashboard',
            view: userType === 'PRO' ? 'PRO_DASHBOARD' : 'CLIENT_DASHBOARD'
        },
        {
            label: 'Agendamentos',
            icon: 'calendar_month',
            view: userType === 'PRO' ? 'PRO_AGENDA' : 'CLIENT_DASHBOARD'
        },
        {
            label: 'Horários',
            icon: 'schedule',
            view: 'PRO_HOURS',
            visible: userType === 'PRO'
        },
        {
            label: 'Serviços',
            icon: 'cut',
            view: 'PRO_SERVICES',
            visible: userType === 'PRO'
        },
        {
            label: 'Configurações',
            icon: 'settings',
            view: 'PRO_SETTINGS',
            visible: userType === 'PRO'
        },
        {
            label: 'Administração',
            icon: 'admin_panel_settings',
            view: 'ADMIN_DASHBOARD',
            visible: userEmail === 'wennsouza@gmail.com'
        }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('LANDING');
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111418] border-r border-gray-200 dark:border-[#283039] h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
                    <span className="material-symbols-outlined">schedule</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">MarcAI</h2>
            </div>

            <nav className="flex-1 flex flex-col gap-1 px-4 py-4">
                {menuItems.filter(item => item.visible !== false).map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setView(item.view as ViewState)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
              ${currentView === item.view
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-[#283039]'}`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-[#283039]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sair
                </button>
            </div>
        </aside>
    );
};
