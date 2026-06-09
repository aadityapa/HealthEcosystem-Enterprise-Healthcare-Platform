import type {
  Appointment,
  Consultation,
  EhrDashboardStats,
  Prescription,
  TelemedicineSession,
} from '@/types';

export const mockEhrDashboardStats: EhrDashboardStats = {
  appointmentsToday: 42,
  consultationsPending: 8,
  prescriptionsIssued: 28,
  telemedicineSessions: 6,
  appointmentsTrend: 10.5,
  consultationsTrend: -5.2,
  prescriptionsTrend: 14.3,
  telemedicineTrend: 20.0,
};

export const mockAppointments: Appointment[] = [
  { id: 'apt1', appointmentNumber: 'APT-2026-12042', patientName: 'Priya Sharma', patientUhid: 'UHID-2024-001847', doctorName: 'Dr. Amit Verma', specialty: 'Cardiology', scheduledAt: '2026-06-08T09:00:00', type: 'in-person', status: 'completed', branch: 'Mumbai Central Lab' },
  { id: 'apt2', appointmentNumber: 'APT-2026-12043', patientName: 'Rajesh Kumar', patientUhid: 'UHID-2024-002156', doctorName: 'Dr. Sunita Reddy', specialty: 'Endocrinology', scheduledAt: '2026-06-08T10:30:00', type: 'follow-up', status: 'in-progress', branch: 'Delhi NCR Diagnostic' },
  { id: 'apt3', appointmentNumber: 'APT-2026-12044', patientName: 'Ananya Patel', patientUhid: 'UHID-2024-003421', doctorName: 'Dr. Rajesh Iyer', specialty: 'General Medicine', scheduledAt: '2026-06-08T11:00:00', type: 'telemedicine', status: 'checked-in', branch: 'Bangalore Health Hub' },
  { id: 'apt4', appointmentNumber: 'APT-2026-12045', patientName: 'Vikram Singh', patientUhid: 'UHID-2024-006201', doctorName: 'Dr. Mohammed Hassan', specialty: 'Nephrology', scheduledAt: '2026-06-08T14:00:00', type: 'in-person', status: 'scheduled', branch: 'Mumbai Central Lab' },
  { id: 'apt5', appointmentNumber: 'APT-2026-12046', patientName: 'Kavita Menon', patientUhid: 'UHID-2024-005102', doctorName: 'Dr. Kavita Menon', specialty: 'Gynecology', scheduledAt: '2026-06-08T15:30:00', type: 'in-person', status: 'cancelled', branch: 'Chennai South Branch' },
];

export const mockConsultations: Consultation[] = [
  { id: 'con1', consultationNumber: 'CON-2026-08921', patientName: 'Priya Sharma', doctorName: 'Dr. Amit Verma', chiefComplaint: 'Chest discomfort on exertion', diagnosis: 'Hypertension, dyslipidemia', startedAt: '2026-06-08T09:05:00', duration: 25, status: 'completed', branch: 'Mumbai Central Lab' },
  { id: 'con2', consultationNumber: 'CON-2026-08922', patientName: 'Rajesh Kumar', doctorName: 'Dr. Sunita Reddy', chiefComplaint: 'Uncontrolled blood sugar', diagnosis: 'Type 2 Diabetes Mellitus', startedAt: '2026-06-08T10:35:00', duration: 30, status: 'in-progress', branch: 'Delhi NCR Diagnostic' },
  { id: 'con3', consultationNumber: 'CON-2026-08923', patientName: 'Ananya Patel', doctorName: 'Dr. Rajesh Iyer', chiefComplaint: 'Fatigue and weight gain', startedAt: '2026-06-08T11:05:00', duration: 15, status: 'in-progress', branch: 'Bangalore Health Hub' },
  { id: 'con4', consultationNumber: 'CON-2026-08920', patientName: 'Mohammed Hassan', doctorName: 'Dr. Mohammed Hassan', chiefComplaint: 'Elevated creatinine levels', diagnosis: 'CKD Stage 2', startedAt: '2026-06-07T16:00:00', duration: 35, status: 'completed', branch: 'Delhi NCR Diagnostic' },
  { id: 'con5', consultationNumber: 'CON-2026-08918', patientName: 'Ramesh Iyer', doctorName: 'Dr. Rajesh Iyer', chiefComplaint: 'Annual health review', startedAt: '2026-06-07T11:00:00', duration: 20, status: 'pending-review', branch: 'Mumbai Central Lab' },
];

export const mockPrescriptions: Prescription[] = [
  { id: 'rx1', prescriptionNumber: 'RX-2026-05621', patientName: 'Priya Sharma', doctorName: 'Dr. Amit Verma', medications: ['Amlodipine 5mg OD', 'Atorvastatin 20mg HS', 'Aspirin 75mg OD'], issuedAt: '2026-06-08T09:30:00', validUntil: '2026-07-08', status: 'active' },
  { id: 'rx2', prescriptionNumber: 'RX-2026-05622', patientName: 'Rajesh Kumar', doctorName: 'Dr. Sunita Reddy', medications: ['Metformin 500mg BD', 'Glimepiride 1mg OD', 'Sitagliptin 100mg OD'], issuedAt: '2026-06-08T11:00:00', validUntil: '2026-07-08', status: 'active' },
  { id: 'rx3', prescriptionNumber: 'RX-2026-05620', patientName: 'Mohammed Hassan', doctorName: 'Dr. Mohammed Hassan', medications: ['Losartan 50mg OD', 'Calcium Carbonate 500mg BD'], issuedAt: '2026-06-07T16:35:00', validUntil: '2026-07-07', status: 'dispensed' },
  { id: 'rx4', prescriptionNumber: 'RX-2026-05615', patientName: 'Vikram Singh', doctorName: 'Dr. Rajesh Iyer', medications: ['Levothyroxine 50mcg OD'], issuedAt: '2026-06-05T10:00:00', validUntil: '2026-06-05', status: 'expired' },
  { id: 'rx5', prescriptionNumber: 'RX-2026-05618', patientName: 'Ananya Patel', doctorName: 'Dr. Rajesh Iyer', medications: ['Levothyroxine 75mcg OD', 'Vitamin D3 60K weekly'], issuedAt: '2026-06-06T14:00:00', validUntil: '2026-07-06', status: 'cancelled' },
];

export const mockTelemedicineSessions: TelemedicineSession[] = [
  { id: 'tel1', sessionNumber: 'TEL-2026-00842', patientName: 'Ananya Patel', doctorName: 'Dr. Rajesh Iyer', scheduledAt: '2026-06-08T11:00:00', duration: 0, platform: 'HealthEcosystem Video', status: 'waiting' },
  { id: 'tel2', sessionNumber: 'TEL-2026-00841', patientName: 'Lakshmi Reddy', doctorName: 'Dr. Sunita Reddy', scheduledAt: '2026-06-08T09:30:00', duration: 22, platform: 'HealthEcosystem Video', status: 'completed' },
  { id: 'tel3', sessionNumber: 'TEL-2026-00843', patientName: 'Sunita Devi', doctorName: 'Dr. Amit Verma', scheduledAt: '2026-06-08T16:00:00', duration: 0, platform: 'HealthEcosystem Video', status: 'scheduled' },
  { id: 'tel4', sessionNumber: 'TEL-2026-00840', patientName: 'Amit Verma', doctorName: 'Dr. Rajesh Iyer', scheduledAt: '2026-06-07T15:00:00', duration: 18, platform: 'HealthEcosystem Video', status: 'completed' },
  { id: 'tel5', sessionNumber: 'TEL-2026-00839', patientName: 'Kavita Menon', doctorName: 'Dr. Kavita Menon', scheduledAt: '2026-06-07T10:00:00', duration: 0, platform: 'HealthEcosystem Video', status: 'cancelled' },
];
