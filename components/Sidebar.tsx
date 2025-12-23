import React from 'react';
import { ViewState } from '../types';
import { supabase } from '../services/supabase';

interface SidebarProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
    userType: 'CLIENT' | 'PRO';
    userEmail?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userType, userEmail, isOpen, onClose }) => {
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
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#111418] border-r border-gray-200 dark:border-[#283039] 
                transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('LANDING')}>
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">MarcAI</h2>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden p-2 text-text-secondary">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                <nav className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto">
                    {menuItems.filter(item => item.visible !== false).map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setView(item.view as ViewState);
                            }}
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
        </>
    );
};
