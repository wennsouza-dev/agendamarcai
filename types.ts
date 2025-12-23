
export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  distance?: string;
  services: Service[];
  location: string;
}

export interface Appointment {
  id: string;
  service: Service;
  professional: Professional;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export type ViewState =
  | 'LANDING'
  | 'AUTH'
  | 'CLIENT_SEARCH'
  | 'CLIENT_BOOKING'
  | 'CLIENT_CONFIRMATION'
  | 'CLIENT_DASHBOARD'
  | 'PRO_DASHBOARD'
  | 'PRO_AGENDA'
  | 'PRO_SERVICES'
  | 'ADMIN_DASHBOARD';

export interface BookingContext {
  professional: Professional;
  service: Service;
  date?: string;
  time?: string;
}
