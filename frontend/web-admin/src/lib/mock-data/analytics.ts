import type {
  AnalyticsDashboardStats,
  BranchAnalyticsRow,
  DeviceAnalyticsRow,
  ExecutiveMetric,
  PredictiveInsight,
  QcAnalyticsRow,
  ReferralAnalyticsRow,
  RevenueAnalyticsRow,
  TestAnalyticsRow,
} from '@/types';

export const mockAnalyticsDashboardStats: AnalyticsDashboardStats = {
  totalRevenue: 42850000,
  totalOrders: 18420,
  avgTat: 4.2,
  activeBranches: 28,
  revenueTrend: 14.3,
  ordersTrend: 8.7,
  tatTrend: -12.5,
  branchesTrend: 7.1,
};

export const mockExecutiveMetrics: ExecutiveMetric[] = [
  { id: 'em1', metric: 'Net Revenue (MTD)', value: '₹4.28 Cr', change: 14.3, period: 'June 2026' },
  { id: 'em2', metric: 'Patient Volume', value: '18,420', change: 8.7, period: 'June 2026' },
  { id: 'em3', metric: 'Avg TAT (hrs)', value: '4.2', change: -12.5, period: 'June 2026' },
  { id: 'em4', metric: 'NPS Score', value: '72', change: 5.2, period: 'Q2 2026' },
  { id: 'em5', metric: 'Corporate Revenue Share', value: '38%', change: 3.1, period: 'June 2026' },
];

export const mockRevenueAnalytics: RevenueAnalyticsRow[] = [
  { id: 'rev1', period: 'Jan 2026', revenue: 38500000, collections: 36200000, outstanding: 2300000, growth: 10.2 },
  { id: 'rev2', period: 'Feb 2026', revenue: 39200000, collections: 37100000, outstanding: 2100000, growth: 1.8 },
  { id: 'rev3', period: 'Mar 2026', revenue: 40100000, collections: 38400000, outstanding: 1700000, growth: 2.3 },
  { id: 'rev4', period: 'Apr 2026', revenue: 41200000, collections: 39800000, outstanding: 1400000, growth: 2.7 },
  { id: 'rev5', period: 'May 2026', revenue: 42100000, collections: 40900000, outstanding: 1200000, growth: 2.2 },
  { id: 'rev6', period: 'Jun 2026 (MTD)', revenue: 42850000, collections: 41500000, outstanding: 1350000, growth: 1.8 },
];

export const mockBranchAnalytics: BranchAnalyticsRow[] = [
  { id: 'ba1', branchName: 'Mumbai Central Lab', city: 'Mumbai', orders: 3240, revenue: 8200000, avgTat: 3.8, growth: 12.4 },
  { id: 'ba2', branchName: 'Delhi NCR Diagnostic', city: 'Delhi', orders: 2890, revenue: 7100000, avgTat: 4.1, growth: 9.8 },
  { id: 'ba3', branchName: 'Bangalore Health Hub', city: 'Bangalore', orders: 2560, revenue: 6400000, avgTat: 3.5, growth: 15.2 },
  { id: 'ba4', branchName: 'Chennai South Branch', city: 'Chennai', orders: 1980, revenue: 4900000, avgTat: 4.5, growth: 6.3 },
  { id: 'ba5', branchName: 'Pune West Collection', city: 'Pune', orders: 1720, revenue: 4200000, avgTat: 4.0, growth: 11.1 },
];

export const mockTestAnalytics: TestAnalyticsRow[] = [
  { id: 'ta1', testName: 'Complete Blood Count', department: 'Hematology', volume: 4820, revenue: 2169000, avgPrice: 450, growth: 8.2 },
  { id: 'ta2', testName: 'Lipid Profile', department: 'Biochemistry', volume: 3210, revenue: 2728500, avgPrice: 850, growth: 12.5 },
  { id: 'ta3', testName: 'Thyroid Panel (T3, T4, TSH)', department: 'Immunoassay', volume: 2840, revenue: 3408000, avgPrice: 1200, growth: 9.1 },
  { id: 'ta4', testName: 'HbA1c', department: 'Biochemistry', volume: 2650, revenue: 1722500, avgPrice: 650, growth: 18.4 },
  { id: 'ta5', testName: 'Executive Health Plus Package', department: 'Packages', volume: 890, revenue: 5339110, avgPrice: 5999, growth: 22.3 },
];

export const mockReferralAnalytics: ReferralAnalyticsRow[] = [
  { id: 'ra1', doctorName: 'Dr. Rajesh Iyer', specialty: 'General Medicine', referrals: 234, revenue: 468000, commission: 56160, conversionRate: 92.5 },
  { id: 'ra2', doctorName: 'Dr. Amit Verma', specialty: 'Cardiology', referrals: 156, revenue: 702000, commission: 70200, conversionRate: 88.3 },
  { id: 'ra3', doctorName: 'Dr. Sunita Reddy', specialty: 'Endocrinology', referrals: 98, revenue: 205800, commission: 16464, conversionRate: 85.7 },
  { id: 'ra4', doctorName: 'Dr. Mohammed Hassan', specialty: 'Nephrology', referrals: 45, revenue: 54000, commission: 5400, conversionRate: 91.1 },
  { id: 'ra5', doctorName: 'Dr. Kavita Menon', specialty: 'Gynecology', referrals: 67, revenue: 234500, commission: 18760, conversionRate: 79.2 },
];

export const mockQcAnalytics: QcAnalyticsRow[] = [
  { id: 'qca1', analyte: 'Glucose', runs: 180, passRate: 98.9, failures: 2, trend: 0.5 },
  { id: 'qca2', analyte: 'Hemoglobin', runs: 165, passRate: 99.4, failures: 1, trend: 0.2 },
  { id: 'qca3', analyte: 'Creatinine', runs: 142, passRate: 97.2, failures: 4, trend: -1.8 },
  { id: 'qca4', analyte: 'TSH', runs: 128, passRate: 98.4, failures: 2, trend: 0.8 },
  { id: 'qca5', analyte: 'Total Cholesterol', runs: 156, passRate: 96.8, failures: 5, trend: -2.1 },
];

export const mockDeviceAnalytics: DeviceAnalyticsRow[] = [
  { id: 'da1', deviceName: 'Cobas 6000 - Mumbai', branch: 'Mumbai Central Lab', uptime: 99.2, messagesProcessed: 45200, errorRate: 0.3 },
  { id: 'da2', deviceName: 'Architect i2000 - Delhi', branch: 'Delhi NCR Diagnostic', uptime: 98.7, messagesProcessed: 38400, errorRate: 0.5 },
  { id: 'da3', deviceName: 'XN-1000 - Bangalore', branch: 'Bangalore Health Hub', uptime: 99.5, messagesProcessed: 52100, errorRate: 0.2 },
  { id: 'da4', deviceName: 'AU5800 - Chennai', branch: 'Chennai South Branch', uptime: 97.8, messagesProcessed: 28900, errorRate: 0.8 },
  { id: 'da5', deviceName: 'Vitros 5600 - Pune', branch: 'Pune West Collection', uptime: 98.9, messagesProcessed: 31200, errorRate: 0.4 },
];

export const mockPredictiveInsights: PredictiveInsight[] = [
  { id: 'pi1', title: 'Diabetes panel demand surge expected', category: 'demand', confidence: 87, impact: 'high', description: 'Predicted 22% increase in HbA1c and glucose panel orders over next 2 weeks based on seasonal patterns.', predictedAt: '2026-06-08' },
  { id: 'pi2', title: 'Reagent stock-out risk - Lipid Profile', category: 'operations', confidence: 92, impact: 'high', description: 'Current consumption rate will deplete lipid reagent stock at Mumbai Central within 5 days.', predictedAt: '2026-06-08' },
  { id: 'pi3', title: 'Corporate revenue growth opportunity', category: 'revenue', confidence: 78, impact: 'medium', description: 'IT sector health camps in Pune region show 35% higher conversion than average.', predictedAt: '2026-06-07' },
  { id: 'pi4', title: 'Critical value escalation pattern', category: 'risk', confidence: 85, impact: 'high', description: 'Potassium critical flags increased 18% at Delhi NCR — review calibration schedule.', predictedAt: '2026-06-07' },
  { id: 'pi5', title: 'Weekend home collection demand', category: 'demand', confidence: 74, impact: 'medium', description: 'Saturday morning slots in Bangalore are 90% booked 3 days ahead — consider adding capacity.', predictedAt: '2026-06-06' },
];
