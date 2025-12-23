import React from 'react';

interface AppointmentCardProps {
    time: string;
    client: string;
    service: string;
    status: string;
    isPending?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ time, client, service, status, isPending }) => (
    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all">
        <div className="size-16 rounded-xl bg-gray-50 dark:bg-[#111418] flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
            <span className="text-lg font-black">{time}</span>
            <span className="text-[10px] font-bold text-text-secondary">Hoje</span>
        </div>
        <div className="flex-1">
            <h4 className="font-bold">{client}</h4>
            <p className="text-xs text-text-secondary">{service}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
        ${isPending ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {status}
            </span>
            <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283039] text-text-secondary">
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#283039] text-text-secondary">
                    <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
            </div>
        </div>
    </div>
);
