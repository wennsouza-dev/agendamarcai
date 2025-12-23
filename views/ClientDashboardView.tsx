
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { getSmartSummary } from '../services/geminiService';

interface ClientDashboardViewProps {
  appointments: Appointment[];
  onNewAppointment: () => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({ appointments, onNewAppointment }) => {
  const [smartSummary, setSmartSummary] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSummaries = async () => {
      const newSummaries: Record<string, string> = {};
      for (const app of appointments.slice(0, 2)) {
        const detail = `${app.service.name} com ${app.professional.name} em ${app.date} às ${app.time}`;
        const summary = await getSmartSummary(detail);
        newSummaries[app.id] = summary;
      }
      setSmartSummary(newSummaries);
    };
    fetchSummaries();
  }, [appointments]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Meus Agendamentos</h1>
          <p className="text-text-secondary">Acompanhe e gerencie seus compromissos marcados.</p>
        </div>
        <button 
          onClick={onNewAppointment}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Agendamento
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {appointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center gap-6">
            <div className="size-24 bg-gray-100 dark:bg-surface-dark rounded-full flex items-center justify-center text-gray-400">
              <span className="material-symbols-outlined text-4xl">event_busy</span>
            </div>
            <p className="text-lg text-text-secondary">Você ainda não tem agendamentos marcados.</p>
            <button onClick={onNewAppointment} className="text-primary font-bold hover:underline">Marcar agora</button>
          </div>
        ) : (
          appointments.map(app => (
            <div key={app.id} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 hover:border-primary/30 transition-all">
              <div className="size-20 bg-primary/10 dark:bg-[#283039] rounded-2xl flex flex-col items-center justify-center text-primary shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest">{app.date.split(' ')[1]}</span>
                <span className="text-3xl font-black">{app.date.split(' ')[0]}</span>
                <span className="text-xs font-bold">{app.time}</span>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{app.service.name}</h3>
                    <p className="text-text-secondary font-medium">{app.professional.name} • {app.professional.specialty}</p>
                    {smartSummary[app.id] && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/10 inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                        <p className="text-xs text-primary italic">{smartSummary[app.id]}</p>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                    ${app.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                    {app.status === AppointmentStatus.CONFIRMED ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <span className="material-symbols-outlined text-lg">edit_calendar</span>
                    Reagendar
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-red-500 hover:underline">
                    <span className="material-symbols-outlined text-lg">cancel</span>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
