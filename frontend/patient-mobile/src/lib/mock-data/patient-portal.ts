import type {
  Appointment,
  BranchOption,
  DashboardSummary,
  LabReport,
  PatientInvoice,
  PatientUser,
  TestCatalogItem,
  TimelineEvent,
  TimeSlot,
} from '@/types';

export const mockPatientUser: PatientUser = {
  id: '1',
  uhid: 'UHID-2024-001847',
  name: 'Priya Sharma',
  phone: '+91 98765 43210',
  email: 'priya.sharma@email.com',
  dateOfBirth: '1988-03-15',
  gender: 'female',
  bloodGroup: 'B+',
};

export const mockDashboardSummary: DashboardSummary = {
  recentEvents: 12,
  upcomingAppointments: 2,
  pendingReports: 1,
  outstandingAmount: 2100,
};

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'te1',
    type: 'lab_result',
    title: 'Complete Blood Count',
    description: 'Results verified — WBC slightly elevated',
    date: '2026-06-05T14:30:00',
    status: 'completed',
    metadata: { reportId: 'rpt1', branch: 'Mumbai Central Lab' },
  },
  {
    id: 'te2',
    type: 'home_collection',
    title: 'Home Sample Collection',
    description: 'Lipid Profile & HbA1c samples collected',
    date: '2026-06-01T08:00:00',
    status: 'completed',
    metadata: { phlebotomist: 'Ravi M.' },
  },
  {
    id: 'te3',
    type: 'appointment',
    title: 'Thyroid Panel — Lab Visit',
    description: 'Scheduled at Mumbai Central Lab',
    date: '2026-06-12T09:30:00',
    status: 'upcoming',
    metadata: { location: 'Mumbai Central Lab' },
  },
  {
    id: 'te4',
    type: 'vaccination',
    title: 'Influenza Vaccine',
    description: 'Annual flu vaccination administered',
    date: '2026-03-20T11:00:00',
    status: 'completed',
  },
  {
    id: 'te5',
    type: 'prescription',
    title: 'Vitamin D Supplement',
    description: 'Prescribed by Dr. Anita Desai — 60,000 IU weekly × 8 weeks',
    date: '2026-02-15T16:00:00',
    status: 'completed',
  },
  {
    id: 'te6',
    type: 'procedure',
    title: 'ECG Screening',
    description: 'Routine cardiac screening — normal sinus rhythm',
    date: '2026-01-10T10:30:00',
    status: 'completed',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    type: 'lab_visit',
    title: 'Thyroid Panel (T3, T4, TSH)',
    date: '2026-06-12',
    time: '09:30 AM',
    location: 'Mumbai Central Lab, Dadar West',
    status: 'scheduled',
  },
  {
    id: 'apt2',
    type: 'home_collection',
    title: 'Annual Health Checkup Package',
    date: '2026-06-18',
    time: '07:00 – 09:00 AM',
    location: 'Home — Bandra West, Mumbai',
    status: 'scheduled',
  },
];

export const mockLabReports: LabReport[] = [
  {
    id: 'rpt1',
    reportNumber: 'RPT-2026-08421',
    testName: 'Complete Blood Count',
    orderDate: '2026-06-05',
    reportDate: '2026-06-05',
    status: 'ready',
    branch: 'Mumbai Central Lab',
    downloadUrl: '#',
  },
  {
    id: 'rpt2',
    reportNumber: 'RPT-2026-08356',
    testName: 'Lipid Profile & HbA1c',
    orderDate: '2026-06-01',
    reportDate: '2026-06-02',
    status: 'delivered',
    branch: 'Mumbai Central Lab',
    downloadUrl: '#',
  },
  {
    id: 'rpt3',
    reportNumber: 'RPT-2026-08290',
    testName: 'Thyroid Panel',
    orderDate: '2026-05-20',
    reportDate: '2026-05-21',
    status: 'delivered',
    branch: 'Mumbai Central Lab',
    downloadUrl: '#',
  },
  {
    id: 'rpt4',
    reportNumber: 'RPT-2026-08502',
    testName: 'Vitamin D',
    orderDate: '2026-06-07',
    status: 'processing',
    branch: 'Mumbai Central Lab',
  },
];

export const mockTestCatalog: TestCatalogItem[] = [
  {
    id: 't1',
    name: 'Complete Blood Count',
    code: 'CBC',
    price: 450,
    tat: '4 hrs',
    sampleType: 'Blood',
    category: 'Hematology',
  },
  {
    id: 't2',
    name: 'Lipid Profile',
    code: 'LIPID',
    price: 850,
    tat: '6 hrs',
    sampleType: 'Blood',
    category: 'Biochemistry',
  },
  {
    id: 't3',
    name: 'Thyroid Panel (T3, T4, TSH)',
    code: 'THY',
    price: 1200,
    tat: '24 hrs',
    sampleType: 'Blood',
    category: 'Endocrinology',
  },
  {
    id: 't4',
    name: 'HbA1c',
    code: 'HBA1C',
    price: 650,
    tat: '4 hrs',
    sampleType: 'Blood',
    category: 'Diabetes',
  },
  {
    id: 't5',
    name: 'Liver Function Test',
    code: 'LFT',
    price: 950,
    tat: '6 hrs',
    sampleType: 'Blood',
    category: 'Biochemistry',
  },
  {
    id: 't6',
    name: 'Vitamin D',
    code: 'VITD',
    price: 1500,
    tat: '48 hrs',
    sampleType: 'Blood',
    category: 'Vitamins',
  },
  {
    id: 't7',
    name: 'Annual Health Checkup',
    code: 'AHC',
    price: 4999,
    tat: '24 hrs',
    sampleType: 'Blood + Urine',
    category: 'Packages',
  },
];

export const mockBranches: BranchOption[] = [
  {
    id: 'b1',
    name: 'Mumbai Central Lab',
    city: 'Mumbai',
    address: '123 Dr. Ambedkar Road, Dadar West, Mumbai 400028',
  },
  {
    id: 'b2',
    name: 'Bandra Health Hub',
    city: 'Mumbai',
    address: '45 Linking Road, Bandra West, Mumbai 400050',
  },
  {
    id: 'b3',
    name: 'Andheri Diagnostic Centre',
    city: 'Mumbai',
    address: '78 SV Road, Andheri West, Mumbai 400058',
  },
];

export const mockTimeSlots: TimeSlot[] = [
  { id: 'ts1', label: '07:00 – 09:00 AM', available: true },
  { id: 'ts2', label: '09:00 – 11:00 AM', available: true },
  { id: 'ts3', label: '11:00 AM – 01:00 PM', available: false },
  { id: 'ts4', label: '02:00 – 04:00 PM', available: true },
  { id: 'ts5', label: '04:00 – 06:00 PM', available: true },
];

export const mockInvoices: PatientInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-08421',
    amount: 4500,
    paid: 4500,
    status: 'paid',
    dueDate: '2026-06-15',
    createdAt: '2026-06-05',
    description: 'Complete Blood Count + Lipid Profile',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-08423',
    amount: 2100,
    paid: 0,
    status: 'pending',
    dueDate: '2026-06-18',
    createdAt: '2026-06-07',
    description: 'Vitamin D Test',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-08398',
    amount: 4999,
    paid: 2500,
    status: 'partial',
    dueDate: '2026-06-20',
    createdAt: '2026-05-28',
    description: 'Annual Health Checkup Package',
  },
];

export const MOCK_OTP = '123456';

export function getReportById(id: string): LabReport | undefined {
  return mockLabReports.find((r) => r.id === id);
}

export function getInvoiceById(id: string): PatientInvoice | undefined {
  return mockInvoices.find((i) => i.id === id);
}
