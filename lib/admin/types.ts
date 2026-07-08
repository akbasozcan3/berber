export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface Barber {
  id: string;
  name: string;
  position: string;
  avatar: string;
  workingHours: { start: string; end: string };
  services: string[];
  appointmentsToday: number;
  performance: number;
  onVacation: boolean;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image: string;
  popular: boolean;
  enabled: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visitCount: number;
  totalSpent: number;
  lastVisit: string;
  favoriteBarber: string;
  notes?: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  date: string;
  featured: boolean;
  replied: boolean;
  reply?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  order: number;
}

export interface BusinessSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  instagram: string;
  googleMaps: string;
  workingHours: { day: string; open: string; close: string; closed?: boolean }[];
  breakTimes: { start: string; end: string }[];
  holidays: string[];
  appointmentInterval: 15 | 30 | 45 | 60;
  maxFutureBooking: number;
  notifications: {
    telegram: boolean;
    email: boolean;
  };
}

export interface DashboardStats {
  todayAppointments: number;
  waitingCustomers: number;
  completedToday: number;
  revenueToday: number;
  revenueMonth: number;
}
