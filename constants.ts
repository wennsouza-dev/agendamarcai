
import { Professional, AppointmentStatus, Appointment } from './types';

export const MOCK_SERVICES = [
  { id: 's1', name: 'Corte Masculino', duration: 45, price: 60.0, category: 'Barbearia' },
  { id: 's2', name: 'Barba Completa', duration: 30, price: 45.0, category: 'Barbearia' },
  { id: 's3', name: 'Corte + Barba', duration: 75, price: 95.0, category: 'Barbearia' },
  { id: 's4', name: 'Coloração', duration: 60, price: 120.0, category: 'Cabelo' },
  { id: 's5', name: 'Penteado Noiva', duration: 90, price: 250.0, category: 'Maquiagem' },
];

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'João Silva',
    specialty: 'Barbeiro Especialista',
    rating: 4.9,
    reviewCount: 124,
    avatar: 'https://picsum.photos/seed/p1/200',
    distance: '1.2km',
    location: 'Rua das Flores, 123 - Centro',
    services: [MOCK_SERVICES[0], MOCK_SERVICES[1], MOCK_SERVICES[2]]
  },
  {
    id: 'p2',
    name: 'Ana Maria',
    specialty: 'Cabeleireira & Visagista',
    rating: 4.8,
    reviewCount: 89,
    avatar: 'https://picsum.photos/seed/p2/200',
    distance: '0.8km',
    location: 'Av. Paulista, 2000 - Jardins',
    services: [MOCK_SERVICES[3], MOCK_SERVICES[0]]
  },
  {
    id: 'p3',
    name: 'Mariana Costa',
    specialty: 'Esteticista & Manicure',
    rating: 5.0,
    reviewCount: 210,
    avatar: 'https://picsum.photos/seed/p3/200',
    distance: '2.5km',
    location: 'Rua Oscar Freire, 500 - Cerqueira César',
    services: [MOCK_SERVICES[4]]
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    service: MOCK_SERVICES[2],
    professional: MOCK_PROFESSIONALS[0],
    date: '2023-10-24',
    time: '14:00',
    status: AppointmentStatus.CONFIRMED
  },
  {
    id: 'a2',
    service: MOCK_SERVICES[4],
    professional: MOCK_PROFESSIONALS[2],
    date: '2023-11-04',
    time: '18:30',
    status: AppointmentStatus.PENDING
  }
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];
