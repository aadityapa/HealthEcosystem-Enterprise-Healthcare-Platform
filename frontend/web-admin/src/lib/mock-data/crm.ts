import type {
  CrmDashboardStats,
  Doctor,
  HealthCamp,
  Referral,
  SalesLead,
  SalesRecord,
} from '@/types';

export const mockCrmDashboardStats: CrmDashboardStats = {
  activeDoctors: 342,
  referralsThisMonth: 1284,
  activeCamps: 5,
  openLeads: 18,
  doctorsTrend: 5.2,
  referralsTrend: 12.8,
  campsTrend: 25.0,
  leadsTrend: -8.3,
};

export const mockDoctors: Doctor[] = [
  { id: 'doc1', code: 'DR-00142', name: 'Dr. Amit Verma', specialty: 'Cardiology', hospital: 'Apollo Hospitals', phone: '+91 98765 43210', email: 'amit.verma@apollo.in', referralsYtd: 156, commissionRate: 10, status: 'active' },
  { id: 'doc2', code: 'DR-00089', name: 'Dr. Sunita Reddy', specialty: 'Endocrinology', hospital: 'Fortis Healthcare', phone: '+91 98765 12345', email: 'sunita.reddy@fortis.in', referralsYtd: 98, commissionRate: 8, status: 'active' },
  { id: 'doc3', code: 'DR-00201', name: 'Dr. Rajesh Iyer', specialty: 'General Medicine', hospital: 'Private Clinic - Andheri', phone: '+91 98200 55667', email: 'dr.iyer@gmail.com', referralsYtd: 234, commissionRate: 12, status: 'active' },
  { id: 'doc4', code: 'DR-00056', name: 'Dr. Kavita Menon', specialty: 'Gynecology', hospital: 'Lilavati Hospital', phone: '+91 98190 77889', email: 'kavita.menon@lilavati.in', referralsYtd: 67, commissionRate: 8, status: 'inactive' },
  { id: 'doc5', code: 'DR-00315', name: 'Dr. Mohammed Hassan', specialty: 'Nephrology', hospital: 'Manipal Hospital', phone: '+91 98450 33221', email: 'm.hassan@manipal.in', referralsYtd: 45, commissionRate: 10, status: 'active' },
];

export const mockReferrals: Referral[] = [
  { id: 'ref1', referralNumber: 'REF-2026-4521', doctorName: 'Dr. Amit Verma', patientName: 'Priya Sharma', testsOrdered: ['Lipid Profile', 'Cardiac Screening'], amount: 4500, commission: 450, status: 'completed', referredAt: '2026-06-05', branch: 'Mumbai Central Lab' },
  { id: 'ref2', referralNumber: 'REF-2026-4522', doctorName: 'Dr. Rajesh Iyer', patientName: 'Vikram Singh', testsOrdered: ['Diabetes Care Panel'], amount: 1899, commission: 228, status: 'completed', referredAt: '2026-06-06', branch: 'Mumbai Central Lab' },
  { id: 'ref3', referralNumber: 'REF-2026-4523', doctorName: 'Dr. Sunita Reddy', patientName: 'Ananya Patel', testsOrdered: ['Thyroid Panel', 'HbA1c'], amount: 2100, commission: 168, status: 'pending', referredAt: '2026-06-07', branch: 'Bangalore Health Hub' },
  { id: 'ref4', referralNumber: 'REF-2026-4524', doctorName: 'Dr. Mohammed Hassan', patientName: 'Ramesh Iyer', testsOrdered: ['Kidney Function Test', 'Urine Routine'], amount: 1200, commission: 120, status: 'pending', referredAt: '2026-06-08', branch: 'Delhi NCR Diagnostic' },
  { id: 'ref5', referralNumber: 'REF-2026-4510', doctorName: 'Dr. Kavita Menon', patientName: 'Lakshmi Reddy', testsOrdered: ['Antenatal Panel'], amount: 3500, commission: 280, status: 'cancelled', referredAt: '2026-05-28', branch: 'Chennai South Branch' },
];

export const mockHealthCamps: HealthCamp[] = [
  { id: 'camp1', campCode: 'CAMP-2026-042', name: 'TCS Annual Health Camp', clientName: 'TCS Limited', location: 'TCS Campus, Pune', scheduledDate: '2026-06-15', expectedPatients: 500, registeredPatients: 312, status: 'planned' },
  { id: 'camp2', campCode: 'CAMP-2026-043', name: 'Infosys Wellness Drive', clientName: 'Infosys Limited', location: 'Infosys SEZ, Mysore', scheduledDate: '2026-06-10', expectedPatients: 300, registeredPatients: 285, status: 'ongoing' },
  { id: 'camp3', campCode: 'CAMP-2026-041', name: 'HCL Preventive Screening', clientName: 'HCL Technologies', location: 'HCL Campus, Noida', scheduledDate: '2026-06-01', expectedPatients: 200, registeredPatients: 198, status: 'completed' },
  { id: 'camp4', campCode: 'CAMP-2026-044', name: 'Reliance Executive Checkup', clientName: 'Reliance Industries', location: 'Reliance Corporate Park', scheduledDate: '2026-06-22', expectedPatients: 150, registeredPatients: 45, status: 'planned' },
  { id: 'camp5', campCode: 'CAMP-2026-038', name: 'Wipro Health Screening', clientName: 'Wipro Limited', location: 'Wipro Campus, Bangalore', scheduledDate: '2026-05-20', expectedPatients: 400, registeredPatients: 0, status: 'cancelled' },
];

export const mockSalesLeads: SalesLead[] = [
  { id: 'lead1', leadNumber: 'LEAD-2026-089', companyName: 'Mahindra & Mahindra', contactPerson: 'Mr. Sanjay Kulkarni', phone: '+91 98220 11000', email: 'health@mahindra.com', estimatedValue: 2500000, source: 'outbound', status: 'qualified', createdAt: '2026-05-20', assignedTo: 'Sales - Rahul' },
  { id: 'lead2', leadNumber: 'LEAD-2026-090', companyName: 'L&T Construction', contactPerson: 'Ms. Meera Joshi', phone: '+91 98190 22000', email: 'wellness@lnt.com', estimatedValue: 1800000, source: 'inbound', status: 'proposal', createdAt: '2026-05-25', assignedTo: 'Sales - Priya' },
  { id: 'lead3', leadNumber: 'LEAD-2026-091', companyName: 'Bajaj Auto Ltd', contactPerson: 'Mr. Anil Deshmukh', phone: '+91 98765 33000', email: 'hr@bajajauto.com', estimatedValue: 3200000, source: 'referral', status: 'new', createdAt: '2026-06-07', assignedTo: 'Sales - Rahul' },
  { id: 'lead4', leadNumber: 'LEAD-2026-085', companyName: 'Godrej Industries', contactPerson: 'Ms. Nisha Patel', phone: '+91 98200 44000', email: 'benefits@godrej.com', estimatedValue: 950000, source: 'camp', status: 'contacted', createdAt: '2026-06-01', assignedTo: 'Sales - Amit' },
  { id: 'lead5', leadNumber: 'LEAD-2026-078', companyName: 'Asian Paints', contactPerson: 'Mr. Vikram Shah', phone: '+91 98180 55000', email: 'medical@asianpaints.com', estimatedValue: 1200000, source: 'outbound', status: 'lost', createdAt: '2026-04-15', assignedTo: 'Sales - Priya' },
];

export const mockSalesRecords: SalesRecord[] = [
  { id: 'sale1', dealNumber: 'DEAL-2026-034', clientName: 'HCL Technologies', dealType: 'corporate', value: 4000000, closedAt: '2026-06-01', closedBy: 'Sales - Priya', status: 'closed-won' },
  { id: 'sale2', dealNumber: 'DEAL-2026-033', clientName: 'TCS Limited', dealType: 'corporate', value: 5000000, closedAt: '2026-05-15', closedBy: 'Sales - Rahul', status: 'closed-won' },
  { id: 'sale3', dealNumber: 'DEAL-2026-032', clientName: 'Mumbai West Franchise', dealType: 'franchise', value: 1500000, closedAt: '2026-05-10', closedBy: 'Sales - Amit', status: 'closed-won' },
  { id: 'sale4', dealNumber: 'DEAL-2026-030', clientName: 'Max Healthcare', dealType: 'insurance', value: 2800000, closedAt: '2026-04-28', closedBy: 'Sales - Priya', status: 'closed-lost' },
  { id: 'sale5', dealNumber: 'DEAL-2026-029', clientName: 'Municipal Corporation - Pune', dealType: 'government', value: 6500000, closedAt: '2026-04-20', closedBy: 'Sales - Rahul', status: 'closed-won' },
];
