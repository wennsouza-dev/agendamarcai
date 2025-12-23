
import React, { useState } from 'react';
import { Professional, Service } from '../types';
import { TIME_SLOTS } from '../constants';

interface BookingViewProps {
  professional: Professional;
  service: Service;
  onConfirm: (date: string, time: string) => void;
  onBack: () => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ professional, service, onConfirm, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<number>(14);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <button onClick={onBack} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors self-start">
        <span className="material-symbols-outlined">arrow_back</span>
        Voltar para busca
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black">Escolha o melhor horário</h1>
            <p className="text-text-secondary">Selecione uma data e horário disponível para {service.name}.</p>
          </div>

          {/* Calendar Mini */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl">Outubro 2023</h3>
              <div className="flex gap-2">
                <button className="size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-[#283039] flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-[#283039] flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-secondary uppercase mb-4">
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map(d => (
                <button 
                  key={d} 
                  onClick={() => setSelectedDate(d)}
                  className={`h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all
                    ${selectedDate === d ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 text-slate-700 dark:text-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Horários disponíveis
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {TIME_SLOTS.map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`h-12 rounded-xl border font-bold text-sm transition-all
                    ${selectedTime === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 text-slate-700 dark:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sticky */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col gap-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Resumo do Pedido
            </h3>
            
            <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-[#111418] rounded-xl">
              <img src={professional.avatar} className="size-16 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold">{service.name}</h4>
                <p className="text-xs text-text-secondary">{professional.name}</p>
                <p className="text-xs text-primary font-bold mt-1">R$ {service.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Data</span>
                <span className="font-bold">{selectedDate} Out, 2023</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Horário</span>
                <span className="font-bold">{selectedTime || '--:--'}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">R$ {service.price.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={!selectedTime}
              onClick={() => onConfirm(`${selectedDate} Out, 2023`, selectedTime)}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              Confirmar agendamento
            </button>
            <p className="text-center text-[10px] text-text-secondary">O pagamento será realizado no local.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
