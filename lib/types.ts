export type UserRole = 'guest' | 'patient' | 'psychiatrist' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  slmcRegNo?: string;
  doctorId?: string;
  deactivatedAt?: string | null;
}

export interface PatientAccount {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  password?: string;
  status: 'Active' | 'Deactivated';
  createdAt: string;
}

export type DoctorStatus = 'approved' | 'pending' | 'suspended';
export type BoostTier = 'none' | '1-day' | '3-day';

export interface DoctorSlot {
  id: string;
  datetime: string; // ISO string
  durationMins: number;
  status: 'available' | 'booked';
}

export interface DoctorDocument {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  status: 'Approved' | 'Pending';
}

export interface Psychiatrist {
  id: string;
  name: string;
  title: string;
  slmcRegNo: string;
  status: DoctorStatus;
  isBoosted: boolean;
  boostTier: BoostTier;
  boostExpiry: string | null;
  photo: string;
  bio: string;
  languages: string[];
  sessionFormats: string[];
  specialties: string[];
  district: string;
  feeLkr: number;
  rating: number;
  reviewCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  upcomingSlots: DoctorSlot[];
  documents: DoctorDocument[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'payout_pending' | 'payout_completed';

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientContact: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto?: string;
  slotDatetime: string;
  feeLkr: number;
  platformCommissionLkr: number;
  netDoctorEarningLkr: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payhereRef: string;
  videoLink?: string;
  reminder5MinSent?: boolean;
  createdAt: string;
  statusHistory: {
    status: BookingStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Review {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientDistrict: string;
  rating: number;
  date: string;
  text: string;
  isVerified: boolean;
  helpfulCount: number;
  flagged?: boolean;
  adminNote?: string;
}

export interface Complaint {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Resolved';
  createdAt: string;
  resolutionProof?: string;
  resolutionNote?: string;
}

export interface PlatformSettings {
  commissionRate: number; // e.g. 18 (percent)
  maxBoostedDoctors: number; // strictly 9 max, range 3-9
}

export interface SmsLog {
  id: string;
  recipient: string;
  formattedRecipient: string;
  senderId: string;
  message: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING' | 'SIMULATED';
  statusCode?: number;
  apiResponse?: any;
  timestamp: string;
  errorNote?: string;
}
