
import React, { useState, useCallback, useEffect } from 'react';
import { ViewState, BookingContext, Appointment, AppointmentStatus } from './types';
import { Layout } from './components/Layout';
import { MOCK_APPOINTMENTS } from './constants';
import { supabase } from './services/supabase';

// Views
import { LandingView } from './views/LandingView';
import { SearchView } from './views/SearchView';
import { BookingView } from './views/BookingView';
import { ConfirmationView } from './views/ConfirmationView';
import { ClientDashboardView } from './views/ClientDashboardView';
import { ProDashboardView } from './views/ProDashboardView';
import { AuthView } from './views/AuthView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { ReviewView } from './views/ReviewView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [bookingContext, setBookingContext] = useState<BookingContext | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Safety timeout - if session fetch takes too long, just stop loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Handle Specialized Links
    const handleDeepLinks = async () => {
      const params = new URLSearchParams(window.location.search);

      // 1. Review Link
      const viewParam = params.get('view');
      const idParam = params.get('id');
      if (viewParam === 'review' && idParam) {
        setView('CLIENT_REVIEW');
        return;
      }

      // 2. Professional Direct Link (?p=UUID)
      const proId = params.get('p');
      if (proId) {
        setLoading(true);
        const { data: pro } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', proId)
          .single();

        if (pro) {
          const firstService = pro.services?.[0] || { id: 'default', name: 'Consulta', price: 0, duration: 30 };
          setBookingContext({ professional: pro, service: firstService });
          setView('CLIENT_BOOKING');
        }
        setLoading(false);
      }
    };

    handleDeepLinks();

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const navigateTo = useCallback((nextView: ViewState) => {
    const protectedViews: ViewState[] = [
      'PRO_DASHBOARD', 'PRO_AGENDA', 'PRO_HOURS', 'PRO_SERVICES', 'PRO_SETTINGS',
      'CLIENT_DASHBOARD', 'ADMIN_DASHBOARD'
    ];
    if (protectedViews.includes(nextView) && !session && !loading) {
      setView('AUTH');
      return;
    }

    if (nextView === 'ADMIN_DASHBOARD' && session?.user?.email !== 'wennsouza@gmail.com') {
      alert('Acesso não autorizado.');
      return;
    }

    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [session, loading]);

  const startBooking = useCallback((professional: any, service: any) => {
    setBookingContext({ professional, service });
    navigateTo('CLIENT_BOOKING');
  }, [navigateTo]);

  const confirmBooking = useCallback(async (date: string, time: string, clientName: string, clientWhatsApp: string) => {
    if (!bookingContext) return;

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          professional_id: bookingContext.professional.id,
          service_name: bookingContext.service.name,
          date: date,
          time: time,
          client_name: clientName,
          client_whatsapp: clientWhatsApp,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      alert('Erro ao salvar agendamento: ' + error.message);
      return;
    }

    setAppointments(prev => [data as any, ...prev]);
    navigateTo('CLIENT_CONFIRMATION');
  }, [bookingContext, navigateTo]);

  const renderView = () => {
    if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="font-bold text-lg animate-pulse">Iniciando o MarcAI...</p>
      </div>
    );

    switch (view) {
      case 'LANDING':
        return <LandingView setView={navigateTo} />;
      case 'AUTH':
        return <AuthView onSuccess={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email === 'wennsouza@gmail.com') {
            navigateTo('ADMIN_DASHBOARD');
            return;
          }

          const { data: pro } = await supabase
            .from('professionals')
            .select('*')
            .eq('user_id', session?.user?.id)
            .or(`email.eq.${session?.user?.email}`)
            .maybeSingle();

          if (pro) {
            if (pro.expire_days === 0) {
              alert('Sua assinatura expirou. Entre em contato com o administrador.');
              await supabase.auth.signOut();
              setView('AUTH');
            } else {
              navigateTo('PRO_DASHBOARD');
            }
          } else {
            navigateTo('PRO_DASHBOARD');
          }
        }} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardView userEmail={session?.user?.email} />;
      case 'CLIENT_SEARCH':
        return <SearchView onSelectProfessional={startBooking} />;
      case 'CLIENT_BOOKING':
        return bookingContext ? (
          <BookingView
            professional={bookingContext.professional}
            service={bookingContext.service}
            onConfirm={confirmBooking}
            onBack={() => navigateTo('CLIENT_SEARCH')}
            onServiceChange={(s) => setBookingContext({ ...bookingContext, service: s })}
          />
        ) : null;
      case 'CLIENT_REVIEW':
        const reviewId = new URLSearchParams(window.location.search).get('id');
        return reviewId ? (
          <ReviewView
            appointmentId={reviewId}
            onSuccess={() => {
              window.history.replaceState({}, '', window.location.pathname);
              navigateTo('LANDING');
            }}
          />
        ) : <LandingView setView={navigateTo} />;
      case 'CLIENT_CONFIRMATION':
        return <ConfirmationView setView={navigateTo} />;
      case 'CLIENT_DASHBOARD':
        return <ClientDashboardView appointments={appointments} onNewAppointment={() => navigateTo('CLIENT_SEARCH')} />;
      case 'PRO_DASHBOARD':
        return <ProDashboardView currentSection="OVERVIEW" onNavigate={navigateTo} />;
      case 'PRO_AGENDA':
        return <ProDashboardView currentSection="AGENDA" onNavigate={navigateTo} />;
      case 'PRO_HOURS':
        return <ProDashboardView currentSection="HOURS" onNavigate={navigateTo} />;
      case 'PRO_SERVICES':
        return <ProDashboardView currentSection="SERVICES" onNavigate={navigateTo} />;
      case 'PRO_SETTINGS':
        return <ProDashboardView currentSection="SETTINGS" onNavigate={navigateTo} />;
      default:
        return <LandingView setView={navigateTo} />;
    }
  };

  return (
    <Layout currentView={view} setView={navigateTo} userEmail={session?.user?.email}>
      {renderView()}
    </Layout>
  );
};

export default App;
