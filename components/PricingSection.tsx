
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export const PricingSection: React.FC = () => {
    const [whatsapp, setWhatsapp] = useState<string>('');

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('platform_settings')
                .select('value')
                .eq('key', 'developer_whatsapp')
                .single();

            if (data?.value) {
                setWhatsapp(data.value);
            }
        };

        fetchSettings();
    }, []);

    const handleClick = () => {
        if (!whatsapp) return;
        const message = "Olá! Gostaria de solicitar meu teste grátis do MarcAI Agenda.";
        const link = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(link, '_blank');
    };

    return (
        <section className="bg-gray-50 dark:bg-[#1a2027] py-24 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Free Plan Card */}
                <PricingCard
                    title="Experimente o MarcAI Agenda Grátis por 7 Dias!"
                    subtitle="Descubra como otimizar seu tempo e aumentar seus lucros sem custo algum."
                    badge="OFERTA DE BOAS-VINDAS"
                    content={
                        <div className="text-center">
                            <p className="text-text-secondary font-bold uppercase tracking-wider text-sm mb-1">TESTE GRÁTIS POR</p>
                            <p className="text-6xl font-black text-primary mb-2">7 DIAS</p>
                            <p className="text-sm text-text-secondary mb-4">Acesso completo a todos os recursos</p>
                            <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                Sem fidelidade, cancele quando quiser
                            </div>
                        </div>
                    }
                    features={[
                        "Agendamento 100% Automatizado",
                        "Controle Financeiro Completo",
                        "Link Personalizado de Agendamento",
                        "Sistema de Avaliações de Clientes",
                        "Galeria de Serviços Profissional"
                    ]}
                    buttonText="Começar Teste Grátis"
                    footerText="Cadastro rápido. Aproveite todas as funcionalidades premium agora mesmo."
                    onButtonClick={handleClick}
                />

                {/* Paid Plan Card */}
                <PricingCard
                    title="Transforme Sua Gestão com MarcAI Agenda!"
                    subtitle="A solução completa para profissionais exigentes."
                    badge="OFERTA LIMITADA"
                    content={
                        <div className="text-center flex flex-col items-center justify-center h-full py-2">
                            <p className="text-gray-400 line-through text-sm mb-0">De R$65,00</p>
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-lg text-gray-600 dark:text-gray-400">Por apenas</span>
                                <span className="text-5xl font-black text-primary">R$50,00</span>
                                <span className="text-lg text-gray-600 dark:text-gray-400">/mês</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                                Pagamento via Pix
                            </div>
                        </div>
                    }
                    features={[
                        "Agendamento Automatizado",
                        "Controle Financeiro Total",
                        "Link Exclusivo de Atendimento",
                        "Avaliações para Credibilidade",
                        "Galeria de Serviços Profissional",
                        "Sem Fidelidade"
                    ]}
                    buttonText="Aproveite Agora!"
                    footerText="Ao clicar, você será redirecionado para o pagamento seguro."
                    onButtonClick={handleClick}
                />

            </div>

            <div className="text-center mt-12 space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    Seus dados estão protegidos
                </div>
                <p className="text-gray-400 text-xs text-center">
                    © 2024 MarcAI Agenda. Todos os direitos reservados.
                </p>
            </div>

        </section>
    );
};

interface PricingCardProps {
    title: string;
    subtitle: string;
    badge: string;
    content: React.ReactNode;
    features: string[];
    buttonText: string;
    footerText: string;
    onButtonClick?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, subtitle, badge, content, features, buttonText, footerText, onButtonClick }) => {
    return (
        <div className="relative bg-white dark:bg-[#1c2127] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-[#3b4754] flex flex-col items-center text-center overflow-hidden">

            {/* Badge container - keeping structure similar to original request's output even if empty comment block was there */}
            {badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-0">
                </div>
            )}

            <h3 className="text-3xl font-black mb-4 leading-tight text-gray-900 dark:text-white max-w-sm mx-auto">
                {title}
            </h3>

            <p className="text-text-secondary text-sm font-medium mb-8 max-w-xs mx-auto">
                {subtitle}
            </p>

            <div className="bg-[#f0f7ff] dark:bg-primary/10 w-full rounded-2xl p-6 mb-8 relative border border-blue-50 dark:border-primary/20">
                {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {badge}
                    </div>
                )}
                {content}
            </div>

            <div className="w-full space-y-4 mb-8 text-left">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onButtonClick}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 mb-4 text-lg">
                {buttonText}
            </button>

            <p className="text-xs text-text-secondary max-w-xs mx-auto">
                {footerText}
            </p>

        </div>
    );
};
