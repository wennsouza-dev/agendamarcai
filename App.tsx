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
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = useCallback((nextView: ViewState) => {
    // Protected routes check
    const protectedViews: ViewState[] = ['PRO_DASHBOARD', 'CLIENT_DASHBOARD', 'ADMIN_DASHBOARD'];
    if (protectedViews.includes(nextView) && !session && !loading) {
      setView('AUTH');
      return;
    }

    // Admin check
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

  const confirmBooking = useCallback((date: string, time: string) => {
    if (!bookingContext) return;

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      professional: bookingContext.professional,
      service: bookingContext.service,
      date,
      time,
      status: AppointmentStatus.CONFIRMED
    };

    setAppointments(prev => [newAppointment, ...prev]);
    navigateTo('CLIENT_CONFIRMATION');
  }, [bookingContext, navigateTo]);

  const renderView = () => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

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

          // Check if user is a professional and active
          const { data: pro } = await supabase
            .from('professionals')
            .select('*')
            .eq('user_id', session?.user?.id) // Currently linked via Trigger? 
            // Fallback: If trigger hasn't run yet or failed, check by email
            .or(`email.eq.${session?.user?.email}`)
            .single();

          if (pro) {
            if (pro.expire_days <= 0) {
              alert('Sua assinatura expirou. Entre em contato com o administrador.');
              await supabase.auth.signOut();
              setView('AUTH');
            } else {
              navigateTo('PRO_DASHBOARD');
            }
          } else {
            // Not a professional? Maybe just a client or unlinked.
            // For now, default to Pro Dashboard but maybe we should warn?
            // Assuming this app is for Pros to manage their agenda.
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
          />
        ) : null;
      case 'CLIENT_CONFIRMATION':
        return <ConfirmationView setView={navigateTo} />;
      case 'CLIENT_DASHBOARD':
        return <ClientDashboardView appointments={appointments} onNewAppointment={() => navigateTo('CLIENT_SEARCH')} />;
      case 'PRO_DASHBOARD':
        return <ProDashboardView />;
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
