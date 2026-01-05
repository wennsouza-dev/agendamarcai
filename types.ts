
export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  PRE_SCHEDULED = 'PRE_SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: string;
  pre_schedule_enabled?: boolean;
  pre_schedule_message?: string;
}

export interface GalleryImage {
  id: string;
  professional_id: string;
  image_url: string;
  created_at: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar: string; // Legacy
  image_url?: string; // New
  distance?: string;
  services: Service[];
  location: string;
  whatsapp?: string;
  address?: string;
  working_hours?: WorkingHours[];
  special_dates?: SpecialDate[];
  gallery_images?: GalleryImage[];
  gallery_enabled?: boolean;
}

export interface Appointment {
  id: string;
  service: Service;
  professional: Professional;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface WorkingHours {
  day: number; // 0-6 (Sun-Sat)
  enabled: boolean;
  start: string; // "HH:mm"
  end: string;
  lunchStart?: string;
  lunchEnd?: string;
  lunchEnabled: boolean;
}

export interface SpecialDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  note: string;
  isClosed: boolean;
  start?: string;
  end?: string;
}

export type ViewState =
  | 'LANDING'
  | 'AUTH'
  | 'CLIENT_SEARCH'
  | 'CLIENT_BOOKING'
  | 'CLIENT_CONFIRMATION'
  | 'CLIENT_DASHBOARD'
  | 'CLIENT_GALLERY'
  | 'CLIENT_REVIEW'
  | 'PRO_DASHBOARD'
  | 'PRO_AGENDA'
  | 'PRO_SERVICES'
  | 'PRO_HOURS'
  | 'PRO_SETTINGS'
  | 'ADMIN_DASHBOARD';

export interface Review {
  id: string;
  professional_id: string;
  client_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BookingContext {
  professional: Professional;
  service: Service;
  date?: string;
  time?: string;
}
