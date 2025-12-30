import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export const DeveloperFloatingButton: React.FC = () => {
    const [whatsapp, setWhatsapp] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('platform_settings')
                .select('value')
                .eq('key', 'developer_whatsapp')
                .single();

            if (data?.value) {
                setWhatsapp(data.value);
                setIsVisible(true);
            }
        };

        fetchSettings();
    }, []);

    if (!isVisible || !whatsapp) return null;

    const message = "Olá! Tenho interesse em contratar a MarcAI Agenda para meu negócio. Poderia me passar mais informações?";
    const link = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 group"
            title="Fale com o Desenvolvedor"
        >
            <div className="bg-white dark:bg-surface-dark text-slate-800 dark:text-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 text-xs font-bold transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap hidden sm:block">
                Contrate a MarcAI Agenda para seu negócio
            </div>
            <div className="size-14 bg-[#25D366] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer relative">
                <span className="material-symbols-outlined text-3xl">chat</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
        </a>
    );
};
