export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PhlebotomistUser {
  id: string;
  employeeCode: string;
  name: string;
  phone: string;
  branchId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export type RouteStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CollectionStatus = 'PENDING' | 'EN_ROUTE' | 'ARRIVED' | 'COLLECTED' | 'FAILED' | 'CANCELLED';

export interface RouteStop {
  id: string;
  stopOrder: number;
  patientName: string;
  address: { line1?: string; city?: string; pincode?: string };
  lat?: number;
  lng?: number;
  scheduledAt?: string;
  status: CollectionStatus;
  notes?: string;
}

export interface FieldRoute {
  id: string;
  routeNumber: string;
  routeDate: string;
  status: RouteStatus;
  totalStops: number;
  completedStops: number;
  phlebotomistId: string;
  stops: RouteStop[];
  startedAt?: string;
  completedAt?: string;
}

export interface CollectionProof {
  photoUrl?: string;
  signatureUrl?: string;
  otpVerified?: boolean;
  barcodeScanned?: string;
}

export interface AttendanceRecord {
  id: string;
  checkInAt: string;
  checkOutAt?: string;
  withinGeofence: boolean;
}

export interface GpsPing {
  id: string;
  lat: number;
  lng: number;
  recordedAt: string;
  accuracy?: number;
}

export interface TodayRouteSummary {
  route: FieldRoute | null;
  pendingStops: number;
  nextStop: RouteStop | null;
}
