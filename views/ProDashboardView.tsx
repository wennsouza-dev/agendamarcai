import React from 'react';
import { StatCard } from '../components/StatCard';
import { AppointmentCard } from '../components/AppointmentCard';
import { ViewState, Review } from '../types';
import { supabase } from '../services/supabase';
import { ReviewCarousel } from '../components/ReviewCarousel';

interface ProDashboardViewProps {
  currentSection?: 'OVERVIEW' | 'AGENDA' | 'HOURS' | 'SERVICES' | 'SETTINGS';
  onNavigate?: (view: ViewState) => void;
}

const BackButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4 font-bold text-sm"
  >
    <span className="material-symbols-outlined text-lg">arrow_back</span>
    Voltar
  </button>
);

const OverviewSection = ({ professional }: { professional: any }) => {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isOnline, setIsOnline] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalCompleted: 0,
    completedToday: 0,
    monthlyEarnings: 0,
    nextTime: '--:--'
  });

  const fetchOverviewData = async () => {
    if (!professional) return;

    // 1. Fetch Today's Upcoming (not necessarily completed)
    const { data: upcoming } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professional.id)
      .neq('status', 'cancelled')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('time', { ascending: true })
      .limit(3);

    if (upcoming) setAppointments(upcoming);

    // 2. Fetch ALL appointments to calculate cumulative stats
    const { data: allApps } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professional.id);

    if (allApps) {
      const completed = allApps.filter(a => a.status === 'completed');

      const brNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const todayStr = brNow.toISOString().split('T')[0];

      const completedToday = completed.filter(a => a.date?.startsWith(todayStr)).length;

      const currentMonth = brNow.getMonth();
      const currentYear = brNow.getFullYear();

      const monthlyCompleted = completed.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      // Sum prices from pro.services based on service_name
      const earnings = monthlyCompleted.reduce((acc, app) => {
        const service = professional.services?.find((s: any) => s.name === app.service_name);
        return acc + (service?.price || 0);
      }, 0);

      setStats({
        totalCompleted: completed.length,
        completedToday,
        monthlyEarnings: earnings,
        nextTime: upcoming?.find(a => a.status === 'confirmed')?.time || upcoming?.[0]?.time || '--:--'
      });
    }

    // 3. Fetch Reviews
    const { data: revData } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    if (revData) setReviews(revData);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchOverviewData();
  }, [professional]);

  const handleAction = async (id: string, action: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment || !professional) return;

    if (action === 'delete') {
      if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
      await supabase.from('appointments').delete().eq('id', id);
      fetchOverviewData();
      return;
    }

    const clientPhone = appointment.client_whatsapp?.replace(/\D/g, '');
    const clientName = appointment.client_name || 'Cliente';
    const serviceName = appointment.service_name || 'Serviço';

    let dateStr = 'Hoje';
    if (appointment.date) {
      const parts = appointment.date.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}`;
    }
    const timeStr = appointment.time;

    let message = '';
    const reviewUrl = `${window.location.origin}?view=review&id=${appointment.id}`;

    if (action === 'confirm') {
      message = `Olá ${clientName}, seu agendamento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}* foi confirmado! ✅ Nos vemos em breve.`;
    } else if (action === 'cancel') {
      message = `Olá ${clientName}, infelizmente tive que cancelar seu agendamento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}*. ❌`;
    } else if (action === 'complete') {
      message = `Olá ${clientName}, seu atendimento de *${serviceName}* foi finalizado! ✨ Agradecemos a preferência. \n\nPor favor, conte-nos como foi sua experiência avaliando nosso serviço aqui: ${reviewUrl}`;
    } else if (action === 'pre-schedule') {
      const service = professional.services?.find((s: any) => s.name === appointment.service_name);
      const instructions = service?.pre_schedule_message || 'Favor seguir as instruções para confirmação.';
      message = `Olá ${clientName}, estamos pré-agendando seu atendimento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}*. \n\n${instructions}`;
    }

    if (clientPhone && message) {
      const cleanPhone = clientPhone.startsWith('55') ? clientPhone : `55${clientPhone}`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    } else if (!clientPhone && action !== 'delete') {
      alert('Atenção: O cliente não possui um número de WhatsApp cadastrado para envio automático.');
    }

    const statusMap: any = {
      'confirm': 'confirmed',
      'pre-schedule': 'pre-scheduled',
      'cancel': 'cancelled',
      'complete': 'completed'
    };
    const newStatus = statusMap[action];
    if (newStatus) {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    }
    fetchOverviewData();
  };

  const copyBookingLink = () => {
    if (!professional) return;
    const url = `${window.location.origin}/?p=${professional.id}`;
    navigator.clipboard.writeText(url);
    alert('Link de agendamento copiado para a área de transferência!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Visão Geral</h1>
          <p className="text-text-secondary font-medium">Bem-vindo de volta! Aqui está sua agenda para hoje.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyBookingLink}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20"
          >
            <span className="material-symbols-outlined text-sm">link</span>
            Copiar Link de Agendamento
          </button>
          <div className="bg-white dark:bg-surface-dark p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Disponibilidade</span>
              <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                Status: {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="bar_chart" title="Atendimentos Total" value={stats.totalCompleted.toString()} />
        <StatCard icon="check_circle" title="Realizados Hoje" value={stats.completedToday.toString()} color="emerald" />
        <StatCard icon="stars" title="Avaliação Média" value={reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'} color="primary" />
        <StatCard icon="payments" title="Ganhos Mensais" value={`R$ ${stats.monthlyEarnings.toFixed(2)}`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold">Próximos Compromissos</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-6 animate-pulse text-text-secondary">Carregando...</div>
            ) : appointments.length > 0 ? (
              appointments.map(app => (
                <AppointmentCard
                  key={app.id}
                  id={app.id}
                  time={app.time}
                  date={app.date}
                  client={app.client_name}
                  whatsapp={app.client_whatsapp}
                  service={app.service_name}
                  status={app.status || 'pending'}
                  onAction={(action) => handleAction(app.id, action)}
                />
              ))
            ) : (
              <p className="text-text-secondary italic">Nenhum agendamento para hoje.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
            <h3 className="font-bold mb-4">Lembretes IA</h3>
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                <p className="text-xs text-text-secondary">Seu dashboard está sincronizado com o banco de dados em tempo real.</p>
              </div>
            </div>
          </div>

          <ReviewCarousel reviews={reviews} />
        </div>
      </div>
    </div>
  );
};
// Local ReviewCarousel definition removed (now imported from components)

const AgendaSection = ({ professional, onBack }: { professional: any, onBack?: () => void }) => {
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAppointments();
  }, [professional]);

  const fetchAppointments = async () => {
    if (!professional) return;

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professional.id)
      .order('date', { ascending: false });

    if (data) setAppointments(data);

    const { data: revData } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    if (revData) setReviews(revData);
    setLoading(false);
  };

  const handleAction = async (id: string, action: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    if (action === 'delete') {
      if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
      await supabase.from('appointments').delete().eq('id', id);
      fetchAppointments();
      return;
    }

    const clientPhone = appointment.client_whatsapp?.replace(/\D/g, '');
    const clientName = appointment.client_name || 'Cliente';
    const serviceName = appointment.service_name || 'Serviço';

    let dateStr = 'Hoje';
    if (appointment.date) {
      const parts = appointment.date.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}`;
    }
    const timeStr = appointment.time;

    let message = '';
    const reviewUrl = `${window.location.origin}?view=review&id=${appointment.id}`;

    if (action === 'confirm') {
      message = `Olá ${clientName}, seu agendamento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}* foi confirmado! ✅ Nos vemos em breve.`;
    } else if (action === 'cancel') {
      message = `Olá ${clientName}, infelizmente tive que cancelar seu agendamento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}*. ❌`;
    } else if (action === 'complete') {
      message = `Olá ${clientName}, seu atendimento de *${serviceName}* foi finalizado! ✨ Agradecemos a preferência. \n\nPor favor, conte-nos como foi sua experiência avaliando nosso serviço aqui: ${reviewUrl}`;
    } else if (action === 'pre-schedule') {
      const service = professional.services?.find((s: any) => s.name === appointment.service_name);
      const instructions = service?.pre_schedule_message || 'Favor seguir as instruções para confirmação.';
      message = `Olá ${clientName}, estamos pré-agendando seu atendimento de *${serviceName}* para o dia *${dateStr}* às *${timeStr}*. \n\n${instructions}`;
    }

    if (clientPhone && message) {
      const cleanPhone = clientPhone.startsWith('55') ? clientPhone : `55${clientPhone}`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    } else if (!clientPhone && action !== 'delete') {
      alert('Atenção: O cliente não possui um número de WhatsApp cadastrado para envio automático.');
    }

    const statusMap: any = {
      'confirm': 'confirmed',
      'pre-schedule': 'pre-scheduled',
      'cancel': 'cancelled',
      'complete': 'completed'
    };
    const newStatus = statusMap[action];
    if (newStatus) {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    }
    fetchAppointments();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <BackButton onClick={onBack} />
          <h1 className="text-3xl font-black tracking-tight">Meus Agendamentos</h1>
        </div>
        <button onClick={fetchAppointments} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <span className="material-symbols-outlined text-primary">refresh</span>
        </button>
      </div>

      <ReviewCarousel reviews={reviews} />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 animate-pulse text-text-secondary">Carregando seus agendamentos...</div>
        ) : appointments.length > 0 ? (
          appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              id={app.id}
              time={app.time}
              date={app.date}
              client={app.client_name}
              whatsapp={app.client_whatsapp}
              service={app.service_name}
              status={app.status || 'pending'}
              onAction={(action) => handleAction(app.id, action)}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-surface-dark p-12 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">calendar_month_off</span>
            <p className="text-lg font-medium text-text-secondary">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HoursSection = ({ professional, onBack }: { professional: any, onBack?: () => void }) => {
  const defaultHours = [
    { day: 1, name: 'Segunda', enabled: true, start: '09:00', end: '18:00', lunchEnabled: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 2, name: 'Terça', enabled: true, start: '09:00', end: '18:00', lunchEnabled: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 3, name: 'Quarta', enabled: true, start: '09:00', end: '18:00', lunchEnabled: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 4, name: 'Quinta', enabled: true, start: '09:00', end: '18:00', lunchEnabled: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 5, name: 'Sexta', enabled: true, start: '09:00', end: '18:00', lunchEnabled: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 6, name: 'Sábado', enabled: false, start: '09:00', end: '13:00', lunchEnabled: false, lunchStart: '12:00', lunchEnd: '13:00' },
    { day: 0, name: 'Domingo', enabled: false, start: '09:00', end: '18:00', lunchEnabled: false, lunchStart: '12:00', lunchEnd: '13:00' },
  ];

  const [hours, setHours] = React.useState<any[]>(defaultHours);
  const [specialDates, setSpecialDates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<'WEEK' | 'SPECIAL'>('WEEK');
  const [proId, setProId] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (professional) {
      setProId(professional.id);
      if (professional.working_hours && professional.working_hours.length > 0) {
        setHours(professional.working_hours);
      }
      setSpecialDates(professional.special_dates || []);
      setLoading(false);
    }
  }, [professional]);

  const handleSaveHours = async () => {
    setLoading(true);
    try {
      let currentProId = proId;

      if (!currentProId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: pro } = await supabase
            .from('professionals')
            .select('id')
            .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle();

          if (pro) {
            currentProId = pro.id;
            setProId(pro.id);
          }
        }
      }

      if (!currentProId) {
        alert('Erro: Perfil profissional não encontrado. Tente fazer logout e login novamente.');
        return;
      }

      const { error } = await supabase
        .from('professionals')
        .update({
          working_hours: hours,
          special_dates: specialDates
        })
        .eq('id', currentProId);

      if (error) alert('Erro ao salvar: ' + error.message);
      else alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const updateHour = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const addSpecialDate = () => {
    const newDate = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      note: '',
      isClosed: true
    };
    setSpecialDates([...specialDates, newDate]);
  };

  const removeSpecialDate = (id: string) => {
    setSpecialDates(specialDates.filter(d => d.id !== id));
  };

  const updateSpecialDate = (id: string, field: string, value: any) => {
    setSpecialDates(specialDates.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  if (loading && hours.length === 0) return <div className="p-8 text-center text-text-secondary animate-pulse">Carregando horários...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <BackButton onClick={onBack} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
              Horários de Funcionamento
            </h1>
            <p className="text-text-secondary text-sm mt-1">Defina quando os clientes podem agendar seus serviços.</p>
          </div>
          <button
            onClick={handleSaveHours}
            disabled={loading}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">{loading ? 'sync' : 'save'}</span>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab('WEEK')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'WEEK' ? 'bg-white dark:bg-surface-dark shadow-md text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-sm">calendar_view_week</span>
          Semanal
        </button>
        <button
          onClick={() => setTab('SPECIAL')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'SPECIAL' ? 'bg-white dark:bg-surface-dark shadow-md text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-sm">event_note</span>
          Datas Especiais
        </button>
      </div>

      {tab === 'WEEK' ? (
        <div className="flex flex-col gap-4">
          {hours.map((h, i) => (
            <div key={i} className={`p-6 rounded-3xl border transition-all duration-300 ${h.enabled ? 'bg-white dark:bg-surface-dark border-primary/10 shadow-sm' : 'bg-gray-50/50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800 opacity-70'}`}>
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                {/* Day and Status Toggle */}
                <div className="flex items-center gap-6 min-w-[240px]">
                  <div
                    onClick={() => updateHour(i, 'enabled', !h.enabled)}
                    className={`cursor-pointer px-4 py-2 rounded-xl flex items-center gap-3 transition-all ${h.enabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                  >
                    <div className={`size-3 rounded-full ${h.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="font-black text-sm uppercase tracking-wider">{h.enabled ? 'Aberto' : 'Fechado'}</span>
                  </div>
                  <span className="text-xl font-bold">{h.name}</span>
                </div>

                {h.enabled ? (
                  <div className="flex flex-1 flex-col md:flex-row gap-6 lg:gap-12 animate-in fade-in slide-in-from-left-4 duration-300">
                    {/* Work Hours Selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-black text-text-secondary tracking-widest pl-1">Atendimento</span>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="time"
                            value={h.start}
                            onChange={e => updateHour(i, 'start', e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-primary/20 transition-all cursor-pointer"
                          />
                        </div>
                        <span className="text-text-secondary font-bold text-xs uppercase">às</span>
                        <div className="relative">
                          <input
                            type="time"
                            value={h.end}
                            onChange={e => updateHour(i, 'end', e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-primary/20 transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block w-px h-12 bg-gray-100 dark:bg-gray-800"></div>

                    {/* Lunch Break Integration */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center pr-1">
                        <span className="text-[10px] uppercase font-black text-text-secondary tracking-widest pl-1">Intervalo Almoço</span>
                        <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                          <input
                            type="checkbox"
                            checked={h.lunchEnabled}
                            onChange={e => updateHour(i, 'lunchEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {h.lunchEnabled ? (
                        <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                          <input
                            type="time"
                            value={h.lunchStart}
                            onChange={e => updateHour(i, 'lunchStart', e.target.value)}
                            className="bg-primary/5 dark:bg-primary/10 border-none rounded-xl p-3 font-bold text-sm outline-none ring-1 ring-primary/10 focus:ring-2 ring-primary/20 transition-all cursor-pointer text-primary"
                          />
                          <span className="text-text-secondary font-bold text-xs uppercase">às</span>
                          <input
                            type="time"
                            value={h.lunchEnd}
                            onChange={e => updateHour(i, 'lunchEnd', e.target.value)}
                            className="bg-primary/5 dark:bg-primary/10 border-none rounded-xl p-3 font-bold text-sm outline-none ring-1 ring-primary/10 focus:ring-2 ring-primary/20 transition-all cursor-pointer text-primary"
                          />
                        </div>
                      ) : (
                        <div className="h-[44px] flex items-center px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                          <span className="text-[10px] font-bold text-text-secondary italic">Sem intervalo configurado</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center lg:justify-start lg:pl-12 py-2">
                    <p className="text-sm font-medium text-text-secondary flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
                      <span className="material-symbols-outlined text-sm">block</span>
                      Nenhum agendamento permitido neste dia.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-text-secondary text-sm">Adicione datas específicas com horários diferenciados ou feriados.</p>
            <button
              onClick={addSpecialDate}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Adicionar Data
            </button>
          </div>

          <div className="grid gap-3">
            {specialDates.length === 0 ? (
              <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
                <p className="text-text-secondary">Nenhuma data especial cadastrada.</p>
              </div>
            ) : specialDates.map((d, i) => (
              <div key={d.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4">
                <input
                  type="date"
                  value={d.date}
                  onChange={e => updateSpecialDate(d.id, 'date', e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 font-bold text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Ex: Feriado de Natal"
                  value={d.note}
                  onChange={e => updateSpecialDate(d.id, 'note', e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-sm outline-none"
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={d.isClosed}
                      onChange={e => updateSpecialDate(d.id, 'isClosed', e.target.checked)}
                      className="size-4 accent-red-500"
                    />
                    <span className="text-xs font-bold text-red-500">Fechado</span>
                  </label>
                  {!d.isClosed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={d.start || '09:00'}
                        onChange={e => updateSpecialDate(d.id, 'start', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2 font-mono text-xs outline-none"
                      />
                      <span className="text-text-secondary">-</span>
                      <input
                        type="time"
                        value={d.end || '18:00'}
                        onChange={e => updateSpecialDate(d.id, 'end', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2 font-mono text-xs outline-none"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => removeSpecialDate(d.id)}
                    className="size-10 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors flex items-center justify-center font-bold"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ServicesSection = ({ professional, onBack }: { professional: any, onBack?: () => void }) => {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [proId, setProId] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    duration: '',
    category: '',
    pre_schedule_enabled: false,
    pre_schedule_message: ''
  });

  React.useEffect(() => {
    if (professional) {
      setProId(professional.id);
      setServices(professional.services || []);
      setLoading(false);
    }
  }, [professional]);

  React.useEffect(() => {
    if (professional) {
      setProId(professional.id);
      setServices(professional.services || []);
      setLoading(false);
    }
  }, [professional]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proId) return;

    const newService = {
      id: editingService ? editingService.id : Math.random().toString(36).substr(2, 9),
      ...formData,
      price: parseFloat(formData.price.toString().replace('R$', '').replace(',', '.').trim()) || 0,
      duration: parseInt(formData.duration.toString().replace('min', '').trim()) || 30
    };

    let updatedServices = editingService
      ? services.map(s => s.id === editingService.id ? newService : s)
      : [...services, newService];

    const { error } = await supabase
      .from('professionals')
      .update({ services: updatedServices })
      .eq('id', proId);

    if (error) alert('Erro ao salvar serviço: ' + error.message);
    else {
      setServices(updatedServices);
      setShowModal(false);
      setFormData({
        name: '',
        price: '',
        duration: '',
        category: '',
        pre_schedule_enabled: false,
        pre_schedule_message: ''
      });
      setEditingService(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir esse serviço?')) return;
    if (!proId) return;
    const updatedServices = services.filter(s => s.id !== serviceId);
    const { error } = await supabase.from('professionals').update({ services: updatedServices }).eq('id', proId);
    if (!error) setServices(updatedServices);
  };

  const openModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        category: service.category || '',
        pre_schedule_enabled: service.pre_schedule_enabled || false,
        pre_schedule_message: service.pre_schedule_message || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        duration: '',
        category: '',
        pre_schedule_enabled: false,
        pre_schedule_message: ''
      });
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center">Carregando serviços...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-2">
        <BackButton onClick={onBack} />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tight">Meus Serviços</h1>
          <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors">Novo Serviço</button>
        </div>
      </div>
      {services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-surface-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cut</span>
          <p className="text-text-secondary">Você ainda não cadastrou nenhum serviço.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg">{service.name}</h3>
                <div className="flex gap-3 text-sm text-text-secondary mt-1">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span> {service.duration} min</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">attach_money</span> {service.price}</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(service)} className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-text-secondary hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button onClick={() => handleDelete(service.id)} className="size-8 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Nome do Serviço</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="Ex: Corte Degrade" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Duração (min)</label>
                  <input required type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Categoria (Opcional)</label>
                <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="Ex: Cabelo" />
              </div>

              <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pre_schedule_enabled}
                    onChange={e => setFormData({ ...formData, pre_schedule_enabled: e.target.checked })}
                    className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-sm">Habilitar Pré-Agendamento</span>
                </label>

                {formData.pre_schedule_enabled && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-primary uppercase mb-2">Mensagem de Instruções (PIX, Regras)</label>
                    <textarea
                      required={formData.pre_schedule_enabled}
                      value={formData.pre_schedule_message}
                      onChange={e => setFormData({ ...formData, pre_schedule_message: e.target.value })}
                      placeholder="Ex: Para confirmar, realize o envio de 50% do valor via PIX (chave: 123456). Envie o comprovante aqui!"
                      className="w-full h-24 bg-white dark:bg-gray-800 border border-primary/20 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsSection = ({ professional, onBack }: { professional: any, onBack?: () => void }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [proId, setProId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    specialty: '',
    bio: '',
    whatsapp: '',
    address: '',
    image_url: ''
  });

  const [pushStatus, setPushStatus] = React.useState<'default' | 'granted' | 'denied'>('default');

  React.useEffect(() => {
    if (professional) {
      setProId(professional.id);
      setFormData({
        name: professional.name || '',
        specialty: professional.specialty || '',
        bio: professional.bio || '',
        whatsapp: professional.whatsapp || '',
        address: professional.address || '',
        image_url: professional.image_url || ''
      });
      setLoading(false);
    }
    if ('Notification' in window) {
      setPushStatus(Notification.permission as any);
    }
  }, [professional]);

  const enablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Seu navegador não suporta notificações push.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        // VAPID Public Key (Placeholder - in real apps this comes from env)
        const vapidPublicKey = 'BIX-9z8v4S7V-G_z9Yd9ZgR0Vl8g_X-Yp0X_U-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf-Xf';

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        // Save to Supabase
        if (proId) {
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
              professional_id: proId,
              subscription: subscription.toJSON()
            });

          if (error) throw error;
          alert('Notificações ativadas com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      alert('Não foi possível ativar as notificações.');
    }
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      let currentProId = proId;

      if (!currentProId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: pro } = await supabase
            .from('professionals')
            .select('id')
            .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle();

          if (pro) {
            currentProId = pro.id;
            setProId(pro.id);
          }
        }
      }

      if (!currentProId) {
        alert('Erro: Perfil profissional não encontrado.');
        return;
      }

      const { error } = await supabase
        .from('professionals')
        .update({
          name: formData.name,
          specialty: formData.specialty,
          bio: formData.bio,
          whatsapp: formData.whatsapp,
          address: formData.address,
          image_url: formData.image_url
        })
        .eq('id', currentProId);

      if (error) alert('Erro ao salvar: ' + error.message);
      else alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      alert('Foto carregada com sucesso! Não esqueça de salvar as alterações.');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro ao carregar foto. Certifique-se de que o bucket "avatars" existe no seu Supabase.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-secondary animate-pulse">Carregando perfil...</div>;

  return (
    <div className="space-y-6">
      <div>
        <BackButton onClick={onBack} />
        <h1 className="text-3xl font-black tracking-tight">Configurações</h1>
      </div>
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 max-w-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Perfil Profissional</h2>
          {proId && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/?p=${proId}`;
                navigator.clipboard.writeText(url);
                alert('Link copiado!');
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-text-secondary rounded-lg text-xs font-bold hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Link de Agendamento
            </button>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
              {formData.image_url ? (
                <img src={formData.image_url} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
              )}
              {saving && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="size-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary font-bold text-sm hover:underline cursor-pointer">
                Alterar Foto
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={saving}
                />
              </label>
              <p className="text-[10px] text-text-secondary">JPG, PNG ou GIF. Máx 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="Ex: 31988887777"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Especialidade</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="Ex: Cabeleireiro"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Endereço Completo</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Biografia</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 h-24 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
              placeholder="Conte um pouco sobre seu trabalho..."
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white w-full py-3.5 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProDashboardView: React.FC<ProDashboardViewProps> = ({ currentSection = 'OVERVIEW', onNavigate }) => {
  const [professional, setProfessional] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProfessional();
  }, []);

  const fetchProfessional = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const { data: pro } = await supabase
      .from('professionals')
      .select('*')
      .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
      .maybeSingle();

    if (pro) {
      setProfessional(pro);
    }
    setLoading(false);
  };

  const goBack = () => onNavigate?.('PRO_DASHBOARD');

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-text-secondary">Carregando painel...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {currentSection === 'OVERVIEW' && <OverviewSection professional={professional} />}
      {currentSection === 'AGENDA' && <AgendaSection professional={professional} onBack={goBack} />}
      {currentSection === 'HOURS' && <HoursSection professional={professional} onBack={goBack} />}
      {currentSection === 'SERVICES' && <ServicesSection professional={professional} onBack={goBack} />}
      {currentSection === 'SETTINGS' && <SettingsSection professional={professional} onBack={goBack} />}
    </div>
  );
};
