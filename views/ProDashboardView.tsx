import React from 'react';
import { StatCard } from '../components/StatCard';
import { AppointmentCard } from '../components/AppointmentCard';

export const ProDashboardView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Visão Geral</h1>
          <p className="text-text-secondary">Bem-vindo de volta! Aqui está sua agenda para hoje.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-2 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-text-secondary px-2">Disponibilidade</span>
            <span className="text-xs font-bold text-emerald-500 px-2">Status: Online</span>
          </div>
          <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1">
            <div className="size-4 bg-white rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="bar_chart" title="Atendimentos Total" value="84" />
        <StatCard icon="check_circle" title="Realizados Hoje" value="6" color="emerald" />
        <StatCard icon="schedule" title="Próximo Horário" value="14:30" color="primary" />
        <StatCard icon="payments" title="Ganhos Mensais" value="R$ 4.250" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold">Próximos Compromissos</h2>
          <div className="space-y-4">
            <AppointmentCard time="14:30" client="Ana Silva" service="Corte + Hidratação" status="Confirmado" />
            <AppointmentCard time="15:30" client="João Pedro" service="Barba e Cabelo" status="Pendente" isPending />
            <AppointmentCard time="17:00" client="Beatriz Lima" service="Escova Modeladora" status="Confirmado" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold mb-4">Lembretes IA</h3>
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                <p className="text-xs text-text-secondary">Você tem um intervalo de 45 min às 16:15. Sugerimos abrir um horário extra promocional.</p>
              </div>
              <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex gap-3">
                <span className="material-symbols-outlined text-yellow-500 text-sm">warning</span>
                <p className="text-xs text-text-secondary">O cliente João Pedro ainda não confirmou o lembrete de SMS. Enviar WhatsApp?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
