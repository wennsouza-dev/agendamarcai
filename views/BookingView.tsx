
import React, { useState } from 'react';
import { Professional, Service, Review } from '../types';
import { TIME_SLOTS } from '../constants';
import { supabase } from '../services/supabase';
import { ReviewCarousel } from '../components/ReviewCarousel';

interface BookingViewProps {
  professional: Professional;
  service: Service;
  onConfirm: (date: string, time: string, clientName: string, clientWhatsApp: string) => void;
  onBack: () => void;
  onServiceChange?: (service: Service) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ professional, service, onConfirm, onBack, onServiceChange }) => {
  // Helper to format date in local timezone (YYYY-MM-DD)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
    };

    const fetchExistingAppointments = async () => {
      const dateStr = formatLocalDate(selectedDate);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = formatLocalDate(nextDay);

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professional.id)
        .gte('date', dateStr)
        .lt('date', nextDayStr)
        .neq('status', 'cancelled');

      if (data) setExistingAppointments(data);
    };

    fetchReviews();
    fetchExistingAppointments();
  }, [professional.id, selectedDate]);

  const generateTimeSlots = () => {
    // 1. Get Brasilia Time Helper
    const getBrasiliaTime = () => {
      const now = new Date();
      return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    };

    const brNow = getBrasiliaTime();
    const todayStr = formatLocalDate(brNow);
    const isSelectedToday = formatLocalDate(selectedDate) === todayStr;

    // 2. Check for Special Dates (Fechado/Custom)
    const specialDate = professional.special_dates?.find(sd => sd?.date === formatLocalDate(selectedDate));
    if (specialDate?.isClosed) return [];

    // 3. Get Base Schedule
    const dayOfWeek = selectedDate.getDay();
    const schedule = professional.working_hours?.find((h: any) => h.day === dayOfWeek);

    if (!schedule || !schedule.enabled) return [];

    let startTime = specialDate?.start || schedule.start;
    let endTime = specialDate?.end || schedule.end;

    const slots = [];
    let current = startTime;

    while (current < endTime) {
      // Check for lunch break
      const isLunch = schedule.lunchEnabled && (current >= schedule.lunchStart && current < schedule.lunchEnd);

      if (!isLunch) {
        // 4. Past Time Filtering (Brasilia Sync)
        const isPast = isSelectedToday && (() => {
          const [slotH, slotM] = current.split(':').map(Number);
          const nowH = brNow.getHours();
          const nowM = brNow.getMinutes();
          return slotH < nowH || (slotH === nowH && slotM <= nowM);
        })();

        // 5. Existing Appointment Filtering (Overlap Detection)
        const isBooked = existingAppointments.some(app => {
          if (!app.time) return false;

          const getMinutes = (t: string) => {
            if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
            const [h, m] = t.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
          };

          const appStart = getMinutes(app.time);
          const appService = professional.services?.find((s: any) => s.name === app.service_name);
          const appDuration = appService?.duration || 30;
          const appEnd = appStart + appDuration;

          const slotStart = getMinutes(current);
          const slotDuration = service.duration || 30;
          const slotEnd = slotStart + slotDuration;

          // Overlap check: (StartA < EndB) && (EndA > StartB)
          return (slotStart < appEnd) && (slotEnd > appStart);
        });

        if (!isPast && !isBooked) {
          slots.push(current);
        }
      }

      // Increment by service duration or 30min default
      const [h, m] = current.split(':').map(Number);
      const duration = Number(service.duration) || 30;
      let totalMins = (h || 0) * 60 + (m || 0) + duration;
      const nextH = Math.floor(totalMins / 60);
      const nextM = totalMins % 60;
      current = `${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
    }

    return slots;
  };

  const getDayName = (day: number) => {
    const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return names[day];
  };

  const timeSlots = generateTimeSlots();

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
              <h3 className="font-bold text-xl">
                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-secondary uppercase mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = formatLocalDate(date);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();

                // Check if day is closed
                const isClosedByWeek = !professional.working_hours?.find(h => h.day === date.getDay())?.enabled;
                const specialDate = professional.special_dates?.find(sd => sd.date === dateStr);
                const isClosed = specialDate ? specialDate.isClosed : isClosedByWeek;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-sm font-bold transition-all relative
                      ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 text-slate-700 dark:text-white'}
                      ${isClosed ? 'opacity-40 grayscale' : ''}`}
                  >
                    <span className="text-[10px] opacity-60 mb-1">{getDayName(date.getDay())}</span>
                    {date.getDate()}
                    {isToday && <div className="absolute bottom-1 size-1 bg-current rounded-full"></div>}
                    {isClosed && <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded-full">OFF</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Horários disponíveis
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {timeSlots.length > 0 ? timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`h-12 rounded-xl border font-bold text-sm transition-all
                    ${selectedTime === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 text-slate-700 dark:text-white'}`}
                >
                  {t}
                </button>
              )) : (
                <div className="col-span-full py-4 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-text-secondary italic">Nenhum horário disponível para este dia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Services List Integration */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">dry_cleaning</span>
              Outros Serviços deste Profissional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professional.services?.map(s => (
                <button
                  key={s.id}
                  onClick={() => onServiceChange?.(s)}
                  className={`flex justify-between items-center p-4 rounded-2xl border transition-all text-left
                    ${service.id === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-800 hover:border-primary/30 bg-white dark:bg-gray-800/30'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm">{s.name}</h4>
                    <p className="text-[10px] text-text-secondary mt-1">{s.duration} min</p>
                  </div>
                  <span className="font-black text-primary text-sm">R$ {s.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="flex flex-col gap-6">
              <ReviewCarousel reviews={reviews} />
            </div>
          )}
        </div>

        {/* Summary Sticky */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col gap-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Resumo do Pedido
            </h3>

            <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-[#111418] rounded-xl">
              <div className="size-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                {professional.image_url ? (
                  <img src={professional.image_url} className="w-full h-full object-cover" alt={professional.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{service.name}</h4>
                <p className="text-xs text-text-secondary truncate">{professional.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-yellow-400 text-xs fill-1">star</span>
                  <span className="text-[10px] font-bold">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                  <span className="text-[10px] text-text-secondary">({reviews.length})</span>
                </div>
                <p className="text-xs text-primary font-bold mt-1">R$ {service.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {professional.whatsapp && (
                <a
                  href={`https://wa.me/55${professional.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/10"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  WhatsApp
                </a>
              )}
              {professional.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(professional.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all border border-blue-500/10"
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Endereço
                </a>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Seu Nome</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">person</span>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Seu WhatsApp</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">chat</span>
                  <input
                    type="text"
                    value={clientWhatsApp}
                    onChange={e => setClientWhatsApp(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-10 outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
                    placeholder="Ex: 31988887777"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3 font-medium">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Data</span>
                  <span className="font-bold">
                    {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Horário</span>
                  <span className="font-bold">{selectedTime || '--:--'}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-primary">R$ {service.price.toFixed(2)}</span>
            </div>

            <button
              disabled={!selectedTime || !clientName || !clientWhatsApp}
              onClick={() => {
                const dateStr = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const message = `Olá ${professional.name}, acabei de fazer um agendamento!\n\n` +
                  `👤 *Cliente:* ${clientName}\n` +
                  `📱 *WhatsApp:* ${clientWhatsApp}\n` +
                  `🛠️ *Serviço:* ${service.name}\n` +
                  `📅 *Data:* ${dateStr}\n` +
                  `⏰ *Horário:* ${selectedTime}\n\n` +
                  `Poderia confirmar por favor?`;

                const phone = professional.whatsapp?.replace(/\D/g, '');
                if (phone) {
                  const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank');
                  onConfirm(formatLocalDate(selectedDate), selectedTime, clientName, clientWhatsApp);
                } else {
                  alert('O profissional não cadastrou o número de WhatsApp.');
                  onConfirm(formatLocalDate(selectedDate), selectedTime, clientName, clientWhatsApp);
                }
              }}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">send</span>
              Confirmar agendamento
            </button>
            <p className="text-center text-[10px] text-text-secondary">O pagamento será realizado no local.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
