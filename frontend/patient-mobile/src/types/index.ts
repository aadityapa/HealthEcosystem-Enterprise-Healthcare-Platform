export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PatientUser {
  id: string;
  uhid: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface OtpRequest {
  phone: string;
}

export interface OtpVerify {
  phone: string;
  otp: string;
}

export interface DashboardSummary {
  recentEvents: number;
  upcomingAppointments: number;
  pendingReports: number;
  outstandingAmount: number;
}

export interface TimelineEvent {
  id: string;
  type: 'lab_result' | 'appointment' | 'prescription' | 'vaccination' | 'procedure' | 'home_collection';
  title: string;
  description: string;
  date: string;
  status?: 'completed' | 'upcoming' | 'cancelled';
  metadata?: Record<string, string>;
}

export interface Appointment {
  id: string;
  type: 'lab_visit' | 'home_collection' | 'consultation';
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface LabReport {
  id: string;
  reportNumber: string;
  testName: string;
  orderDate: string;
  reportDate?: string;
  status: 'processing' | 'ready' | 'delivered';
  branch: string;
  downloadUrl?: string;
}

export interface TestCatalogItem {
  id: string;
  name: string;
  code: string;
  price: number;
  tat: string;
  sampleType: string;
  category: string;
}

export interface BookingRequest {
  testIds: string[];
  preferredDate: string;
  preferredTime: string;
  branchId: string;
  notes?: string;
}

export interface HomeCollectionRequest {
  testIds: string[];
  preferredDate: string;
  preferredTimeSlot: string;
  address: string;
  pincode: string;
  landmark?: string;
  notes?: string;
}

export interface PatientInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  paid: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  description: string;
}

export interface BranchOption {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}
