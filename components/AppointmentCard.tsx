import React from 'react';

interface AppointmentCardProps {
    id?: string;
    time: string;
    date?: string;
    client: string;
    whatsapp?: string;
    service: string;
    status: string;
    onAction?: (action: 'confirm' | 'pre-schedule' | 'cancel' | 'delete' | 'complete') => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ id, time, date, client, whatsapp, service, status, onAction }) => {
    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            case 'pre-scheduled': return 'bg-blue-100 text-blue-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            case 'completed': return 'bg-purple-100 text-purple-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = () => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'pre-scheduled': return 'Pré-Agendado';
            case 'cancelled': return 'Cancelado';
            case 'completed': return 'Finalizado';
            default: return status;
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all">
            <div className="size-16 rounded-xl bg-gray-50 dark:bg-[#111418] flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800 self-center sm:self-auto">
                <span className="text-sm font-black">{time}</span>
                <span className="text-[10px] font-bold text-text-secondary">{date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Hoje'}</span>
            </div>
            <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{client}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
                        {getStatusLabel()}
                    </span>
                </div>
                <p className="text-xs text-text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    {service}
                </p>
                {whatsapp && (
                    <a href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[10px] text-emerald-500 font-bold hover:underline flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[10px]">chat</span>
                        WhatsApp: {whatsapp}
                    </a>
                )}
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                {status.toLowerCase() === 'confirmed' ? (
                    <button onClick={() => onAction?.('complete')} className="flex-1 sm:flex-none px-3 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] font-bold hover:bg-purple-600 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Finalizado
                    </button>
                ) : (
                    <>
                        {status.toLowerCase() === 'pending' && (
                            <button onClick={() => onAction?.('confirm')} className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors">Confirmar</button>
                        )}
                        <button onClick={() => onAction?.('pre-schedule')} className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[10px] font-bold hover:bg-blue-600 transition-colors">Pré-Agendar</button>
                    </>
                )}
                {status.toLowerCase() !== 'cancelled' && status.toLowerCase() !== 'completed' && (
                    <button onClick={() => onAction?.('cancel')} className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                )}
                <button onClick={() => onAction?.('delete')} className="p-1.5 text-red-500 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>
    );
};
