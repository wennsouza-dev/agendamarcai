import React, { useState } from 'react';
import { Professional, Service, Review } from '../types';
import { TIME_SLOTS } from '../constants';
import { supabase } from '../services/supabase';
import { ReviewCarousel } from '../components/ReviewCarousel';
import { GalleryDisplay } from '../components/GalleryDisplay';

interface BookingViewProps {
  professional: Professional;
  service: Service;
  onConfirm: (date: string, time: string, clientName: string, clientWhatsApp: string) => void;
  onBack: () => void;
  onServiceChange?: (service: Service) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ professional, service: initialService, onConfirm, onBack, onServiceChange }) => {
  // Helper to format date in local timezone (YYYY-MM-DD)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [step, setStep] = useState(0); // 0: Date, 1: Time, 2: Service, 3: Confirm
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
    fetchReviews();
    fetchExistingAppointments();
  }, [professional.id, selectedDate]);

  // Scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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
          const slotDuration = (selectedService?.duration || initialService.duration) || 30; // Use selected or initial
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
      const duration = Number((selectedService?.duration || initialService.duration) || 30);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(1); // Auto-advance to time selection
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(2); // Auto-advance to service selection
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Don't auto advance here, let user confirm selection
  };

  const handleServiceConfirm = () => {
    if (selectedService) {
      setStep(3); // Advance to confirmation
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 overflow-hidden">
      {/* Header / Progress */}
      <div className="flex items-center justify-between">
        <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          {step === 0 ? 'Voltar para busca' : 'Voltar'}
        </button>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-6 sm:w-8 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>

      {/* Main Slider Container */}
      <div
        className="flex transition-transform duration-500 ease-in-out w-full"
        style={{ transform: `translateX(-${step * 100}%)` }}
      >

        {/* STEP 0: Date Selection & Gallery */}
        <div className="w-full flex-shrink-0 px-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <h1 className="text-2xl font-black">Escolha a Data</h1>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl capitalize">
                  {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-text-secondary uppercase mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: new Date().getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1 sm:p-2" />
                ))}
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
                      onClick={() => !isClosed && handleDateSelect(date)}
                      disabled={isClosed}
                      className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl text-sm font-bold transition-all relative aspect-square
                        ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 text-slate-700 dark:text-white'}
                        ${isClosed ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                    >
                      <span className="text-[10px] opacity-60 mb-1">{getDayName(date.getDay())}</span>
                      {date.getDate()}
                      {isToday && <div className="absolute bottom-2 size-1 bg-current rounded-full"></div>}
                      {isClosed && <span className="absolute top-1 right-1 text-[8px] bg-red-500 text-white px-1 rounded-full">OFF</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gallery Integration */}
            {professional.gallery_images && professional.gallery_images.length > 0 && (
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <GalleryDisplay images={professional.gallery_images} mode="carousel" />
              </div>
            )}
          </div>
        </div>

        {/* STEP 1: Time Selection */}
        <div className="w-full flex-shrink-0 px-1">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-black">Escolha o Horário</h1>
              <p className="text-text-secondary mt-1">
                Para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {timeSlots.length > 0 ? timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => handleTimeSelect(t)}
                  className={`h-14 rounded-xl border font-bold text-base transition-all flex items-center justify-center
                    ${selectedTime === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 hover:border-primary/50 text-slate-700 dark:text-white'}`}
                >
                  {t}
                </button>
              )) : (
                <div className="col-span-full py-10 text-center bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
                  <p className="text-sm text-text-secondary font-medium">Nenhum horário disponível nesta data.</p>
                  <button onClick={() => setStep(0)} className="mt-4 text-primary font-bold text-sm hover:underline">Escolher outra data</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2: Service Selection */}
        <div className="w-full flex-shrink-0 px-1">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-black uppercase">Selecione um Serviço</h1>
              <p className="text-text-secondary mt-1">Escolha o procedimento que deseja realizar.</p>
            </div>

            {/* List all Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {professional.services?.map(s => {
                const isSelected = selectedService?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`flex justify-between items-center p-4 rounded-xl border transition-all text-left group
                             ${isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-lg shadow-primary/10'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div>
                      <span className={`font-bold text-sm block ${isSelected ? 'text-primary' : ''}`}>{s.name}</span>
                      <span className="text-xs text-text-secondary">{s.duration} min</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm block ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-white'}`}>R$ {s.price.toFixed(2)}</span>
                      {isSelected && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selectedService}
              onClick={handleServiceConfirm}
              className="mt-4 w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </div>


        {/* STEP 3: Confirmation Details */}
        <div className="w-full flex-shrink-0 px-1">
          <div className="flex flex-col gap-6 max-w-md mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-black">Confirmar Agendamento</h1>
              <p className="text-text-secondary mt-1">Quase lá! Preencha seus dados para finalizar.</p>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col gap-6">

              {/* Summary Card */}
              {selectedService && (
                <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-[#111418] rounded-xl">
                  <div className="size-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {professional.image_url ? (
                      <img src={professional.image_url} className="w-full h-full object-cover" alt={professional.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{selectedService.name}</h4>
                    <p className="text-xs text-text-secondary truncate">{professional.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {selectedTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">R$ {selectedService.price.toFixed(2)}</p>
                  </div>
                </div>
              )}

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
              </div>

              <button
                disabled={!selectedTime || !clientName || !clientWhatsApp || !selectedService}
                onClick={() => {
                  if (!selectedService) return;
                  const dateStr = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                  const message = `Olá ${professional.name}, acabei de fazer um agendamento!\n\n` +
                    `👤 *Cliente:* ${clientName}\n` +
                    `📱 *WhatsApp:* ${clientWhatsApp}\n` +
                    `🛠️ *Serviço:* ${selectedService.name}\n` +
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
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
