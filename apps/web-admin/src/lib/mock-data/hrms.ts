import type {
  Employee,
  HrmsAttendanceRecord,
  HrmsDashboardStats,
  PayrollRecord,
  Shift,
  TrainingRecord,
} from '@/types';

export const mockHrmsDashboardStats: HrmsDashboardStats = {
  totalEmployees: 486,
  presentToday: 412,
  openPositions: 8,
  payrollDue: 2850000,
  employeesTrend: 3.2,
  attendanceTrend: 1.5,
  positionsTrend: -20.0,
  payrollTrend: 5.8,
};

export const mockEmployees: Employee[] = [
  { id: 'emp1', employeeCode: 'EMP-00421', name: 'Dr. Sanjay Mehta', department: 'Radiology', designation: 'Consultant Radiologist', branch: 'Mumbai Central Lab', phone: '+91 98765 10001', joinDate: '2022-03-15', status: 'active' },
  { id: 'emp2', employeeCode: 'EMP-00318', name: 'Priya Nair', department: 'Laboratory', designation: 'Senior Lab Technologist', branch: 'Bangalore Health Hub', phone: '+91 98765 10002', joinDate: '2021-08-01', status: 'active' },
  { id: 'emp3', employeeCode: 'EMP-00205', name: 'Rahul Sharma', department: 'Operations', designation: 'Branch Manager', branch: 'Delhi NCR Diagnostic', phone: '+91 98765 10003', joinDate: '2020-01-10', status: 'active' },
  { id: 'emp4', employeeCode: 'EMP-00456', name: 'Meena Kumari', department: 'Field Operations', designation: 'Phlebotomist', branch: 'Mumbai Central Lab', phone: '+91 98765 10004', joinDate: '2023-06-20', status: 'on-leave' },
  { id: 'emp5', employeeCode: 'EMP-00189', name: 'Anil Desai', department: 'Finance', designation: 'Accounts Executive', branch: 'Pune West Collection', phone: '+91 98765 10005', joinDate: '2019-11-05', status: 'active' },
];

export const mockPayrollRecords: PayrollRecord[] = [
  { id: 'pay1', employeeName: 'Dr. Sanjay Mehta', employeeCode: 'EMP-00421', period: 'May 2026', grossSalary: 185000, deductions: 22000, netSalary: 163000, status: 'paid' },
  { id: 'pay2', employeeName: 'Priya Nair', employeeCode: 'EMP-00318', period: 'May 2026', grossSalary: 45000, deductions: 5400, netSalary: 39600, status: 'paid' },
  { id: 'pay3', employeeName: 'Rahul Sharma', employeeCode: 'EMP-00205', period: 'May 2026', grossSalary: 75000, deductions: 9000, netSalary: 66000, status: 'paid' },
  { id: 'pay4', employeeName: 'Meena Kumari', employeeCode: 'EMP-00456', period: 'June 2026', grossSalary: 28000, deductions: 3360, netSalary: 24640, status: 'pending' },
  { id: 'pay5', employeeName: 'Anil Desai', employeeCode: 'EMP-00189', period: 'June 2026', grossSalary: 38000, deductions: 4560, netSalary: 33440, status: 'processed' },
];

export const mockHrmsAttendance: HrmsAttendanceRecord[] = [
  { id: 'att1', employeeName: 'Dr. Sanjay Mehta', employeeCode: 'EMP-00421', date: '2026-06-08', checkIn: '09:00', checkOut: undefined, status: 'present' },
  { id: 'att2', employeeName: 'Priya Nair', employeeCode: 'EMP-00318', date: '2026-06-08', checkIn: '08:30', checkOut: undefined, status: 'present' },
  { id: 'att3', employeeName: 'Rahul Sharma', employeeCode: 'EMP-00205', date: '2026-06-08', checkIn: '09:15', checkOut: undefined, status: 'late' },
  { id: 'att4', employeeName: 'Meena Kumari', employeeCode: 'EMP-00456', date: '2026-06-08', checkIn: '', checkOut: undefined, status: 'leave' },
  { id: 'att5', employeeName: 'Anil Desai', employeeCode: 'EMP-00189', date: '2026-06-08', checkIn: '09:00', checkOut: undefined, status: 'present' },
];

export const mockShifts: Shift[] = [
  { id: 'sh1', shiftCode: 'SH-MORNING', name: 'Morning Shift', startTime: '07:00', endTime: '15:00', department: 'Laboratory', assignedCount: 42, status: 'active' },
  { id: 'sh2', shiftCode: 'SH-EVENING', name: 'Evening Shift', startTime: '15:00', endTime: '23:00', department: 'Laboratory', assignedCount: 28, status: 'active' },
  { id: 'sh3', shiftCode: 'SH-NIGHT', name: 'Night Shift', startTime: '23:00', endTime: '07:00', department: 'Laboratory', assignedCount: 12, status: 'active' },
  { id: 'sh4', shiftCode: 'SH-FIELD-AM', name: 'Field AM', startTime: '06:00', endTime: '14:00', department: 'Field Operations', assignedCount: 24, status: 'active' },
  { id: 'sh5', shiftCode: 'SH-ADMIN', name: 'Admin Hours', startTime: '09:00', endTime: '18:00', department: 'Administration', assignedCount: 35, status: 'active' },
];

export const mockTrainingRecords: TrainingRecord[] = [
  { id: 'tr1', courseName: 'NABL Accreditation Awareness', trainer: 'Quality Team', scheduledDate: '2026-06-15', participants: 28, maxParticipants: 30, status: 'scheduled' },
  { id: 'tr2', courseName: 'Phlebotomy Best Practices', trainer: 'Dr. Kavita Menon', scheduledDate: '2026-06-10', participants: 15, maxParticipants: 20, status: 'ongoing' },
  { id: 'tr3', courseName: 'Fire Safety & Evacuation', trainer: 'Safety Officer', scheduledDate: '2026-06-01', participants: 120, maxParticipants: 120, status: 'completed' },
  { id: 'tr4', courseName: 'ABDM Integration Workshop', trainer: 'IT Team', scheduledDate: '2026-06-22', participants: 8, maxParticipants: 15, status: 'scheduled' },
  { id: 'tr5', courseName: 'Customer Service Excellence', trainer: 'HR Team', scheduledDate: '2026-05-20', participants: 0, maxParticipants: 25, status: 'cancelled' },
];
