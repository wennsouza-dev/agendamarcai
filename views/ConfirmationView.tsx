
import React from 'react';
import { ViewState } from '../types';

interface ConfirmationViewProps {
  setView: (view: ViewState) => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ setView }) => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">
      <div className="size-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
        <span className="material-symbols-outlined text-6xl">check_circle</span>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-black">Agendamento Confirmado!</h1>
        <p className="text-lg text-text-secondary">
          Tudo certo! Seu horário foi reservado com sucesso. Enviamos um lembrete para seu e-mail.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-surface-dark p-6 rounded-2xl w-full border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Status</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase">Confirmado</span>
        </div>
        <p className="text-xs text-text-secondary">Acesse seu painel para gerenciar ou reagendar.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => setView('CLIENT_DASHBOARD')}
          className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all"
        >
          Meus Agendamentos
        </button>
        <button 
          onClick={() => setView('LANDING')}
          className="flex-1 py-4 bg-gray-100 dark:bg-[#283039] font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-all"
        >
          Ir para o início
        </button>
      </div>
    </div>
  );
};
