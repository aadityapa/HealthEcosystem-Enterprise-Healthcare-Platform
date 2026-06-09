import type {
  Branch,
  DashboardStats,
  Invoice,
  LabResult,
  Patient,
  Sample,
} from '@/types';

export const mockDashboardStats: DashboardStats = {
  totalPatients: 12847,
  todayOrders: 342,
  pendingSamples: 89,
  revenueToday: 284500,
  patientsTrend: 12.5,
  ordersTrend: 8.3,
  samplesTrend: -4.2,
  revenueTrend: 15.7,
};

export const mockPatients: Patient[] = [
  {
    id: '1',
    uhid: 'UHID-2024-001847',
    firstName: 'Priya',
    lastName: 'Sharma',
    dateOfBirth: '1988-03-15',
    gender: 'female',
    phone: '+91 98765 43210',
    email: 'priya.sharma@email.com',
    bloodGroup: 'B+',
    status: 'active',
    registeredAt: '2024-01-12',
    lastVisit: '2026-06-05',
  },
  {
    id: '2',
    uhid: 'UHID-2024-002156',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    dateOfBirth: '1975-11-22',
    gender: 'male',
    phone: '+91 87654 32109',
    email: 'rajesh.k@email.com',
    bloodGroup: 'O+',
    status: 'active',
    registeredAt: '2024-02-08',
    lastVisit: '2026-06-07',
  },
  {
    id: '3',
    uhid: 'UHID-2024-003421',
    firstName: 'Ananya',
    lastName: 'Patel',
    dateOfBirth: '1995-07-08',
    gender: 'female',
    phone: '+91 76543 21098',
    bloodGroup: 'A+',
    status: 'active',
    registeredAt: '2024-03-20',
    lastVisit: '2026-06-01',
  },
  {
    id: '4',
    uhid: 'UHID-2024-004892',
    firstName: 'Mohammed',
    lastName: 'Hassan',
    dateOfBirth: '1962-01-30',
    gender: 'male',
    phone: '+91 65432 10987',
    email: 'm.hassan@email.com',
    bloodGroup: 'AB+',
    status: 'active',
    registeredAt: '2024-04-15',
    lastVisit: '2026-05-28',
  },
  {
    id: '5',
    uhid: 'UHID-2024-005103',
    firstName: 'Sunita',
    lastName: 'Devi',
    dateOfBirth: '1990-09-12',
    gender: 'female',
    phone: '+91 54321 09876',
    status: 'inactive',
    registeredAt: '2024-05-02',
    lastVisit: '2025-12-10',
  },
];

export const mockSamples: Sample[] = [
  {
    id: 's1',
    barcode: 'SMP-20260608-001',
    patientName: 'Priya Sharma',
    testName: 'Complete Blood Count',
    status: 'collected',
    collectedAt: '2026-06-08T08:30:00',
    assignedTo: 'Lab A',
  },
  {
    id: 's2',
    barcode: 'SMP-20260608-002',
    patientName: 'Rajesh Kumar',
    testName: 'Lipid Profile',
    status: 'processing',
    collectedAt: '2026-06-08T09:15:00',
    assignedTo: 'Lab B',
  },
  {
    id: 's3',
    barcode: 'SMP-20260608-003',
    patientName: 'Ananya Patel',
    testName: 'Thyroid Panel',
    status: 'verified',
    collectedAt: '2026-06-08T07:45:00',
    assignedTo: 'Lab A',
  },
  {
    id: 's4',
    barcode: 'SMP-20260608-004',
    patientName: 'Mohammed Hassan',
    testName: 'HbA1c',
    status: 'approved',
    collectedAt: '2026-06-08T06:20:00',
    assignedTo: 'Lab C',
  },
  {
    id: 's5',
    barcode: 'SMP-20260608-005',
    patientName: 'Sunita Devi',
    testName: 'Liver Function Test',
    status: 'reported',
    collectedAt: '2026-06-07T16:00:00',
    assignedTo: 'Lab B',
  },
  {
    id: 's6',
    barcode: 'SMP-20260608-006',
    patientName: 'Vikram Singh',
    testName: 'Urine Routine',
    status: 'collected',
    collectedAt: '2026-06-08T10:00:00',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-08421',
    patientName: 'Priya Sharma',
    amount: 4500,
    paid: 4500,
    status: 'paid',
    dueDate: '2026-06-15',
    createdAt: '2026-06-05',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-08422',
    patientName: 'Rajesh Kumar',
    amount: 8200,
    paid: 4000,
    status: 'partial',
    dueDate: '2026-06-20',
    createdAt: '2026-06-06',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-08423',
    patientName: 'Ananya Patel',
    amount: 2100,
    paid: 0,
    status: 'pending',
    dueDate: '2026-06-18',
    createdAt: '2026-06-07',
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2026-08398',
    patientName: 'Mohammed Hassan',
    amount: 12500,
    paid: 0,
    status: 'overdue',
    dueDate: '2026-05-30',
    createdAt: '2026-05-20',
  },
];

export const mockBranches: Branch[] = [
  {
    id: 'b1',
    code: 'MUM-001',
    name: 'Mumbai Central Lab',
    city: 'Mumbai',
    phone: '+91 22 1234 5678',
    status: 'active',
    manager: 'Dr. Anita Desai',
    patientCount: 4520,
  },
  {
    id: 'b2',
    code: 'DEL-001',
    name: 'Delhi NCR Diagnostic',
    city: 'New Delhi',
    phone: '+91 11 9876 5432',
    status: 'active',
    manager: 'Dr. Ravi Mehta',
    patientCount: 3890,
  },
  {
    id: 'b3',
    code: 'BLR-001',
    name: 'Bangalore Health Hub',
    city: 'Bangalore',
    phone: '+91 80 4567 8901',
    status: 'active',
    manager: 'Dr. Lakshmi Rao',
    patientCount: 2940,
  },
  {
    id: 'b4',
    code: 'CHN-001',
    name: 'Chennai South Branch',
    city: 'Chennai',
    phone: '+91 44 2345 6789',
    status: 'inactive',
    manager: 'Dr. Karthik Iyer',
    patientCount: 1497,
  },
];

export const mockLabResult: LabResult = {
  id: 'res1',
  orderId: 'ORD-2026-08421',
  patientName: 'Priya Sharma',
  testPanel: 'Complete Blood Count',
  status: 'processing',
  parameters: [
    { id: 'p1', name: 'Hemoglobin', value: '13.2', unit: 'g/dL', referenceRange: '12.0-15.5', flag: 'normal' },
    { id: 'p2', name: 'WBC Count', value: '11.8', unit: '×10³/µL', referenceRange: '4.5-11.0', flag: 'high' },
    { id: 'p3', name: 'RBC Count', value: '4.5', unit: '×10⁶/µL', referenceRange: '4.0-5.5', flag: 'normal' },
    { id: 'p4', name: 'Platelet Count', value: '245', unit: '×10³/µL', referenceRange: '150-400', flag: 'normal' },
    { id: 'p5', name: 'Hematocrit', value: '39.8', unit: '%', referenceRange: '36-46', flag: 'normal' },
    { id: 'p6', name: 'MCV', value: '88', unit: 'fL', referenceRange: '80-100', flag: 'normal' },
  ],
};

export const testCatalog = [
  { id: 't1', name: 'Complete Blood Count', code: 'CBC', price: 450, tat: '4 hrs' },
  { id: 't2', name: 'Lipid Profile', code: 'LIPID', price: 850, tat: '6 hrs' },
  { id: 't3', name: 'Thyroid Panel (T3, T4, TSH)', code: 'THY', price: 1200, tat: '24 hrs' },
  { id: 't4', name: 'HbA1c', code: 'HBA1C', price: 650, tat: '4 hrs' },
  { id: 't5', name: 'Liver Function Test', code: 'LFT', price: 950, tat: '6 hrs' },
  { id: 't6', name: 'Kidney Function Test', code: 'KFT', price: 900, tat: '6 hrs' },
  { id: 't7', name: 'Urine Routine', code: 'URINE', price: 250, tat: '2 hrs' },
  { id: 't8', name: 'Vitamin D', code: 'VITD', price: 1500, tat: '48 hrs' },
];

export function getPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export async function fetchWithDelay<T>(data: T, delay = 600): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return data;
}
