import type {
  AttendanceRecord,
  FieldRoute,
  GpsPing,
  PhlebotomistUser,
  RouteStop,
  TodayRouteSummary,
} from '@/types';

export const MOCK_OTP = '123456';

export const mockPhlebotomist: PhlebotomistUser = {
  id: 'phleb-001',
  employeeCode: 'PH-042',
  name: 'Ravi Kumar',
  phone: '+91 98765 43210',
  branchId: 'branch-mumbai-central',
};

export const mockStops: RouteStop[] = [
  {
    id: 'stop-1',
    stopOrder: 1,
    patientName: 'Priya Sharma',
    address: { line1: '12 Bandra West, Mumbai', city: 'Mumbai', pincode: '400050' },
    lat: 19.0596,
    lng: 72.8295,
    scheduledAt: '2026-06-08T07:30:00',
    status: 'COLLECTED',
  },
  {
    id: 'stop-2',
    stopOrder: 2,
    patientName: 'Amit Patel',
    address: { line1: '45 Andheri East, Mumbai', city: 'Mumbai', pincode: '400069' },
    lat: 19.1136,
    lng: 72.8697,
    scheduledAt: '2026-06-08T08:30:00',
    status: 'EN_ROUTE',
  },
  {
    id: 'stop-3',
    stopOrder: 3,
    patientName: 'Sneha Reddy',
    address: { line1: '78 Powai, Mumbai', city: 'Mumbai', pincode: '400076' },
    lat: 19.1176,
    lng: 72.906,
    scheduledAt: '2026-06-08T09:30:00',
    status: 'PENDING',
  },
  {
    id: 'stop-4',
    stopOrder: 4,
    patientName: 'Vikram Singh',
    address: { line1: '23 Dadar West, Mumbai', city: 'Mumbai', pincode: '400028' },
    lat: 19.0178,
    lng: 72.8478,
    scheduledAt: '2026-06-08T10:30:00',
    status: 'PENDING',
  },
];

export const mockTodayRoute: FieldRoute = {
  id: 'route-001',
  routeNumber: 'RT-2026-0608-042',
  routeDate: '2026-06-08',
  status: 'IN_PROGRESS',
  totalStops: 4,
  completedStops: 1,
  phlebotomistId: 'phleb-001',
  startedAt: '2026-06-08T07:00:00',
  stops: mockStops,
};

export const mockTodaySummary: TodayRouteSummary = {
  route: mockTodayRoute,
  pendingStops: mockStops.filter((s) => s.status !== 'COLLECTED').length,
  nextStop: mockStops.find((s) => s.status === 'EN_ROUTE') ?? null,
};

export const mockAttendance: AttendanceRecord = {
  id: 'att-001',
  checkInAt: '2026-06-08T06:45:00',
  withinGeofence: true,
};

export const mockGpsHistory: GpsPing[] = [
  { id: 'ping-1', lat: 19.076, lng: 72.8777, recordedAt: '2026-06-08T07:00:00', accuracy: 12 },
  { id: 'ping-2', lat: 19.0596, lng: 72.8295, recordedAt: '2026-06-08T07:35:00', accuracy: 8 },
  { id: 'ping-3', lat: 19.08, lng: 72.85, recordedAt: '2026-06-08T08:00:00', accuracy: 10 },
];

export function getRouteById(id: string): FieldRoute | undefined {
  if (id === mockTodayRoute.id) return mockTodayRoute;
  return undefined;
}

export function getStopById(id: string): RouteStop | undefined {
  return mockStops.find((s) => s.id === id);
}
