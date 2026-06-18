import type {
  CollectionRoute,
  FieldAttendanceRecord,
  FieldDashboardStats,
  FieldTrackingRecord,
  Geofence,
  Phlebotomist,
} from '@/types';

export const mockFieldDashboardStats: FieldDashboardStats = {
  activePhlebotomists: 48,
  routesToday: 32,
  collectionsCompleted: 186,
  onTimeRate: 94.2,
  phlebotomistsTrend: 4.0,
  routesTrend: 12.5,
  collectionsTrend: 8.3,
  onTimeTrend: 2.1,
};

export const mockPhlebotomists: Phlebotomist[] = [
  { id: 'ph1', code: 'PHL-0042', name: 'Suresh Patil', phone: '+91 98765 11111', branch: 'Mumbai Central Lab', status: 'on-route', collectionsToday: 8, rating: 4.8 },
  { id: 'ph2', code: 'PHL-0018', name: 'Meena Kumari', phone: '+91 98765 22222', branch: 'Mumbai Central Lab', status: 'available', collectionsToday: 6, rating: 4.9 },
  { id: 'ph3', code: 'PHL-0035', name: 'Ravi Shankar', phone: '+91 98765 33333', branch: 'Delhi NCR Diagnostic', status: 'on-route', collectionsToday: 7, rating: 4.6 },
  { id: 'ph4', code: 'PHL-0022', name: 'Kavitha Nair', phone: '+91 98765 44444', branch: 'Bangalore Health Hub', status: 'on-break', collectionsToday: 5, rating: 4.7 },
  { id: 'ph5', code: 'PHL-0051', name: 'Arjun Desai', phone: '+91 98765 55555', branch: 'Pune West Collection', status: 'off-duty', collectionsToday: 0, rating: 4.5 },
];

export const mockCollectionRoutes: CollectionRoute[] = [
  { id: 'rt1', routeCode: 'HC-MUM-042', phlebotomistName: 'Suresh Patil', zone: 'Andheri West', scheduledDate: '2026-06-08', stops: 12, completedStops: 8, status: 'in-progress' },
  { id: 'rt2', routeCode: 'HC-MUM-043', phlebotomistName: 'Meena Kumari', zone: 'Bandra East', scheduledDate: '2026-06-08', stops: 10, completedStops: 10, status: 'completed' },
  { id: 'rt3', routeCode: 'HC-DEL-018', phlebotomistName: 'Ravi Shankar', zone: 'Gurgaon Sector 56', scheduledDate: '2026-06-08', stops: 14, completedStops: 5, status: 'in-progress' },
  { id: 'rt4', routeCode: 'HC-BLR-025', phlebotomistName: 'Kavitha Nair', zone: 'Whitefield', scheduledDate: '2026-06-08', stops: 8, completedStops: 0, status: 'planned' },
  { id: 'rt5', routeCode: 'HC-PUN-011', phlebotomistName: 'Arjun Desai', zone: 'Hinjewadi', scheduledDate: '2026-06-09', stops: 11, completedStops: 0, status: 'planned' },
];

export const mockFieldTracking: FieldTrackingRecord[] = [
  { id: 'tr1', phlebotomistName: 'Suresh Patil', currentLocation: 'Lokhandwala, Andheri West', lastUpdated: '2026-06-08T10:28:00', routeCode: 'HC-MUM-042', nextStop: 'Versova - Mr. Shah', eta: '10:35 AM', status: 'moving' },
  { id: 'tr2', phlebotomistName: 'Ravi Shankar', currentLocation: 'Sector 56, Gurgaon', lastUpdated: '2026-06-08T10:25:00', routeCode: 'HC-DEL-018', nextStop: 'DLF Phase 3 - Ms. Gupta', eta: '10:40 AM', status: 'at-stop' },
  { id: 'tr3', phlebotomistName: 'Meena Kumari', currentLocation: 'Bandra Kurla Complex', lastUpdated: '2026-06-08T10:00:00', routeCode: 'HC-MUM-043', nextStop: '—', eta: '—', status: 'idle' },
  { id: 'tr4', phlebotomistName: 'Kavitha Nair', currentLocation: 'Whitefield Main Road', lastUpdated: '2026-06-08T09:45:00', routeCode: 'HC-BLR-025', nextStop: 'ITPL Gate - Mr. Rao', eta: '11:00 AM', status: 'moving' },
];

export const mockFieldAttendance: FieldAttendanceRecord[] = [
  { id: 'fa1', phlebotomistName: 'Suresh Patil', date: '2026-06-08', checkIn: '07:00', checkOut: undefined, hoursWorked: 3.5, status: 'present' },
  { id: 'fa2', phlebotomistName: 'Meena Kumari', date: '2026-06-08', checkIn: '06:45', checkOut: '14:30', hoursWorked: 7.75, status: 'present' },
  { id: 'fa3', phlebotomistName: 'Ravi Shankar', date: '2026-06-08', checkIn: '07:15', checkOut: undefined, hoursWorked: 3.2, status: 'late' },
  { id: 'fa4', phlebotomistName: 'Kavitha Nair', date: '2026-06-08', checkIn: '08:00', checkOut: undefined, hoursWorked: 2.5, status: 'present' },
  { id: 'fa5', phlebotomistName: 'Arjun Desai', date: '2026-06-08', checkIn: '', checkOut: undefined, hoursWorked: 0, status: 'absent' },
];

export const mockGeofences: Geofence[] = [
  { id: 'gf1', name: 'Andheri West Zone', zone: 'Andheri West', branch: 'Mumbai Central Lab', radiusMeters: 5000, activeCollections: 24, status: 'active' },
  { id: 'gf2', name: 'Bandra East Zone', zone: 'Bandra East', branch: 'Mumbai Central Lab', radiusMeters: 4000, activeCollections: 18, status: 'active' },
  { id: 'gf3', name: 'Gurgaon Sector 56', zone: 'Gurgaon', branch: 'Delhi NCR Diagnostic', radiusMeters: 6000, activeCollections: 32, status: 'active' },
  { id: 'gf4', name: 'Whitefield Zone', zone: 'Whitefield', branch: 'Bangalore Health Hub', radiusMeters: 8000, activeCollections: 15, status: 'active' },
  { id: 'gf5', name: 'Hinjewadi IT Park', zone: 'Hinjewadi', branch: 'Pune West Collection', radiusMeters: 4500, activeCollections: 0, status: 'inactive' },
];
