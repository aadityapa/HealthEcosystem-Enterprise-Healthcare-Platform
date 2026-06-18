import type {
  BillingDashboardStats,
  BillingInvoice,
  CorporateClient,
  CorporateStatement,
  FranchiseSettlement,
  GstReportEntry,
  GstReportSummary,
  InsuranceClaim,
  OutstandingRecord,
  PaymentCollection,
  PaymentMethodBreakdown,
} from '@/types';

export const mockBillingDashboardStats: BillingDashboardStats = {
  revenueToday: 284500,
  outstanding: 1847200,
  pendingClaims: 12,
  settlementsDue: 3,
  revenueTrend: 15.7,
  outstandingTrend: -3.2,
  claimsTrend: 8.5,
  settlementsTrend: -12.0,
};

export const mockPaymentMethodBreakdown: PaymentMethodBreakdown[] = [
  { method: 'UPI', amount: 98500, count: 142, percentage: 34.6 },
  { method: 'Card', amount: 76200, count: 68, percentage: 26.8 },
  { method: 'Cash', amount: 54800, count: 95, percentage: 19.3 },
  { method: 'NEFT', amount: 35200, count: 12, percentage: 12.4 },
  { method: 'Insurance', amount: 19800, count: 8, percentage: 7.0 },
];

const lineItemsInv1 = [
  { id: 'li1', description: 'Complete Blood Count', hsnSac: '999316', quantity: 1, unitPrice: 450, discount: 0, taxableAmount: 450, cgst: 40.5, sgst: 40.5, igst: 0, total: 531 },
  { id: 'li2', description: 'Lipid Profile', hsnSac: '999316', quantity: 1, unitPrice: 850, discount: 50, taxableAmount: 800, cgst: 72, sgst: 72, igst: 0, total: 944 },
  { id: 'li3', description: 'Thyroid Panel (T3, T4, TSH)', hsnSac: '999316', quantity: 1, unitPrice: 1200, discount: 0, taxableAmount: 1200, cgst: 108, sgst: 108, igst: 0, total: 1416 },
  { id: 'li4', description: 'Home Collection Charges', hsnSac: '996812', quantity: 1, unitPrice: 200, discount: 0, taxableAmount: 200, cgst: 18, sgst: 18, igst: 0, total: 236 },
  { id: 'li5', description: 'Executive Health Plus Package', hsnSac: '999316', quantity: 1, unitPrice: 5999, discount: 1200, taxableAmount: 4799, cgst: 431.91, sgst: 431.91, igst: 0, total: 5662.82 },
];

export const mockBillingInvoices: BillingInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-08421',
    patientName: 'Priya Sharma',
    patientUhid: 'UHID-2024-001847',
    clientType: 'retail',
    amount: 8789,
    paid: 8789,
    status: 'paid',
    dueDate: '2026-06-15',
    createdAt: '2026-06-05',
    branch: 'Mumbai Central Lab',
    lineItems: lineItemsInv1,
    gst: { taxableAmount: 7449, cgst: 670.41, sgst: 670.41, igst: 0, totalTax: 1340.82, grandTotal: 8789, supplyType: 'intra-state' },
    payments: [
      { id: 'pay1', amount: 5000, method: 'upi', reference: 'UPI-7829345612', receivedAt: '2026-06-05T10:30:00', receivedBy: 'Reception Desk' },
      { id: 'pay2', amount: 3789, method: 'card', reference: 'TXN-449821', receivedAt: '2026-06-05T10:32:00', receivedBy: 'Reception Desk' },
    ],
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-08422',
    patientName: 'Rajesh Kumar',
    patientUhid: 'UHID-2024-002156',
    clientType: 'corporate',
    clientName: 'TCS Limited',
    amount: 8200,
    paid: 4000,
    status: 'partial',
    dueDate: '2026-06-20',
    createdAt: '2026-06-06',
    branch: 'Delhi NCR Diagnostic',
    lineItems: [
      { id: 'li6', description: 'Basic Health Checkup', hsnSac: '999316', quantity: 1, unitPrice: 2499, discount: 375, taxableAmount: 2124, cgst: 191.16, sgst: 191.16, igst: 0, total: 2506.32 },
      { id: 'li7', description: 'HbA1c', hsnSac: '999316', quantity: 1, unitPrice: 650, discount: 0, taxableAmount: 650, cgst: 58.5, sgst: 58.5, igst: 0, total: 767 },
      { id: 'li8', description: 'Liver Function Test', hsnSac: '999316', quantity: 1, unitPrice: 950, discount: 0, taxableAmount: 950, cgst: 85.5, sgst: 85.5, igst: 0, total: 1121 },
      { id: 'li9', description: 'Kidney Function Test', hsnSac: '999316', quantity: 1, unitPrice: 900, discount: 0, taxableAmount: 900, cgst: 81, sgst: 81, igst: 0, total: 1062 },
      { id: 'li10', description: 'Vitamin D (25-OH)', hsnSac: '999316', quantity: 1, unitPrice: 1500, discount: 225, taxableAmount: 1275, cgst: 114.75, sgst: 114.75, igst: 0, total: 1504.5 },
    ],
    gst: { taxableAmount: 5899, cgst: 530.91, sgst: 530.91, igst: 0, totalTax: 1061.82, grandTotal: 6960.82, supplyType: 'intra-state' },
    payments: [
      { id: 'pay3', amount: 4000, method: 'neft', reference: 'NEFT-TCS-0606', receivedAt: '2026-06-06T14:00:00', receivedBy: 'Accounts Team' },
    ],
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-08423',
    patientName: 'Ananya Patel',
    patientUhid: 'UHID-2024-003421',
    clientType: 'retail',
    amount: 2100,
    paid: 0,
    status: 'pending',
    dueDate: '2026-06-18',
    createdAt: '2026-06-07',
    branch: 'Bangalore Health Hub',
    lineItems: [
      { id: 'li11', description: 'Urine Routine & Microscopy', hsnSac: '999316', quantity: 1, unitPrice: 250, discount: 0, taxableAmount: 250, cgst: 0, sgst: 0, igst: 45, total: 295 },
      { id: 'li12', description: 'Thyroid Panel (T3, T4, TSH)', hsnSac: '999316', quantity: 1, unitPrice: 1200, discount: 0, taxableAmount: 1200, cgst: 0, sgst: 0, igst: 216, total: 1416 },
    ],
    gst: { taxableAmount: 1450, cgst: 0, sgst: 0, igst: 261, totalTax: 261, grandTotal: 1711, supplyType: 'inter-state' },
    payments: [],
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2026-08398',
    patientName: 'Mohammed Hassan',
    patientUhid: 'UHID-2024-004892',
    clientType: 'insurance',
    clientName: 'Star Health Insurance',
    amount: 12500,
    paid: 0,
    status: 'overdue',
    dueDate: '2026-05-30',
    createdAt: '2026-05-20',
    branch: 'Chennai South Branch',
    lineItems: [
      { id: 'li13', description: 'Cardiac Screening Package', hsnSac: '999316', quantity: 1, unitPrice: 3499, discount: 0, taxableAmount: 3499, cgst: 314.91, sgst: 314.91, igst: 0, total: 4128.82 },
      { id: 'li14', description: 'Executive Health Plus', hsnSac: '999316', quantity: 1, unitPrice: 5999, discount: 599, taxableAmount: 5400, cgst: 486, sgst: 486, igst: 0, total: 6372 },
    ],
    gst: { taxableAmount: 8899, cgst: 800.91, sgst: 800.91, igst: 0, totalTax: 1601.82, grandTotal: 10500.82, supplyType: 'intra-state' },
    payments: [],
  },
  {
    id: 'inv5',
    invoiceNumber: 'INV-2026-08424',
    patientName: 'Vikram Singh',
    patientUhid: 'UHID-2024-006201',
    clientType: 'retail',
    amount: 3200,
    paid: 3200,
    status: 'paid',
    dueDate: '2026-06-22',
    createdAt: '2026-06-08',
    branch: 'Mumbai Central Lab',
    lineItems: [
      { id: 'li15', description: 'Diabetes Care Panel', hsnSac: '999316', quantity: 1, unitPrice: 1899, discount: 0, taxableAmount: 1899, cgst: 170.91, sgst: 170.91, igst: 0, total: 2240.82 },
      { id: 'li16', description: 'Home Collection Charges', hsnSac: '996812', quantity: 1, unitPrice: 200, discount: 0, taxableAmount: 200, cgst: 18, sgst: 18, igst: 0, total: 236 },
    ],
    gst: { taxableAmount: 2099, cgst: 188.91, sgst: 188.91, igst: 0, totalTax: 377.82, grandTotal: 2476.82, supplyType: 'intra-state' },
    payments: [
      { id: 'pay4', amount: 3200, method: 'cash', receivedAt: '2026-06-08T09:15:00', receivedBy: 'Reception Desk' },
    ],
  },
];

export const mockPayments: PaymentCollection[] = [
  { id: 'pc1', invoiceNumber: 'INV-2026-08424', patientName: 'Vikram Singh', amount: 3200, method: 'cash', collectedAt: '2026-06-08T09:15:00', collectedBy: 'Reception Desk', branch: 'Mumbai Central Lab' },
  { id: 'pc2', invoiceNumber: 'INV-2026-08421', patientName: 'Priya Sharma', amount: 5000, method: 'upi', reference: 'UPI-7829345612', collectedAt: '2026-06-05T10:30:00', collectedBy: 'Reception Desk', branch: 'Mumbai Central Lab' },
  { id: 'pc3', invoiceNumber: 'INV-2026-08421', patientName: 'Priya Sharma', amount: 3789, method: 'card', reference: 'TXN-449821', collectedAt: '2026-06-05T10:32:00', collectedBy: 'Reception Desk', branch: 'Mumbai Central Lab' },
  { id: 'pc4', invoiceNumber: 'INV-2026-08422', patientName: 'Rajesh Kumar', amount: 4000, method: 'neft', reference: 'NEFT-TCS-0606', collectedAt: '2026-06-06T14:00:00', collectedBy: 'Accounts Team', branch: 'Delhi NCR Diagnostic' },
  { id: 'pc5', invoiceNumber: 'INV-2026-08415', patientName: 'Sunita Devi', amount: 1850, method: 'upi', reference: 'UPI-9912345678', collectedAt: '2026-06-07T16:45:00', collectedBy: 'Reception Desk', branch: 'Bangalore Health Hub' },
  { id: 'pc6', invoiceNumber: 'INV-2026-08410', patientName: 'Kavita Menon', amount: 6200, method: 'insurance', reference: 'CLM-STH-2026-4412', collectedAt: '2026-06-07T11:20:00', collectedBy: 'Insurance Desk', branch: 'Delhi NCR Diagnostic' },
];

export const mockCorporateClients: CorporateClient[] = [
  { id: 'cc1', code: 'CORP-TCS', name: 'TCS Limited', contactPerson: 'Mr. Arun Pillai', email: 'health@tcs.com', phone: '+91 22 6778 9000', creditLimit: 5000000, outstanding: 842000, contractStart: '2025-04-01', contractEnd: '2026-03-31', discountPercent: 25, paymentTerms: 'Net 30', status: 'active' },
  { id: 'cc2', code: 'CORP-INFY', name: 'Infosys Limited', contactPerson: 'Ms. Deepa Krishnan', email: 'wellness@infosys.com', phone: '+91 80 2852 0261', creditLimit: 3500000, outstanding: 1250000, contractStart: '2025-07-01', contractEnd: '2026-06-30', discountPercent: 22, paymentTerms: 'Net 45', status: 'active' },
  { id: 'cc3', code: 'CORP-WIPRO', name: 'Wipro Limited', contactPerson: 'Mr. Suresh Nair', email: 'hr-health@wipro.com', phone: '+91 80 2844 0011', creditLimit: 2000000, outstanding: 1980000, contractStart: '2024-10-01', contractEnd: '2025-09-30', discountPercent: 20, paymentTerms: 'Net 30', status: 'suspended' },
  { id: 'cc4', code: 'CORP-HCL', name: 'HCL Technologies', contactPerson: 'Ms. Ritu Sharma', email: 'benefits@hcl.com', phone: '+91 120 240 6000', creditLimit: 4000000, outstanding: 320000, contractStart: '2026-01-01', contractEnd: '2026-12-31', discountPercent: 28, paymentTerms: 'Net 30', status: 'active' },
  { id: 'cc5', code: 'CORP-RELI', name: 'Reliance Industries', contactPerson: 'Mr. Vikram Desai', email: 'medical@ril.com', phone: '+91 22 3555 5000', creditLimit: 8000000, outstanding: 0, contractStart: '2023-01-01', contractEnd: '2025-12-31', discountPercent: 30, paymentTerms: 'Net 60', status: 'expired' },
];

export const mockCorporateStatements: CorporateStatement[] = [
  { id: 'cs1', clientCode: 'CORP-TCS', clientName: 'TCS Limited', period: 'May 2026', invoiceCount: 48, totalBilled: 1245000, totalPaid: 980000, closingBalance: 265000, status: 'sent' },
  { id: 'cs2', clientCode: 'CORP-INFY', clientName: 'Infosys Limited', period: 'May 2026', invoiceCount: 32, totalBilled: 890000, totalPaid: 450000, closingBalance: 440000, status: 'overdue' },
  { id: 'cs3', clientCode: 'CORP-HCL', clientName: 'HCL Technologies', period: 'May 2026', invoiceCount: 18, totalBilled: 520000, totalPaid: 520000, closingBalance: 0, status: 'paid' },
  { id: 'cs4', clientCode: 'CORP-TCS', clientName: 'TCS Limited', period: 'April 2026', invoiceCount: 52, totalBilled: 1380000, totalPaid: 1380000, closingBalance: 0, status: 'paid' },
  { id: 'cs5', clientCode: 'CORP-WIPRO', clientName: 'Wipro Limited', period: 'May 2026', invoiceCount: 0, totalBilled: 0, totalPaid: 0, closingBalance: 1980000, status: 'overdue' },
];

export const mockInsuranceClaims: InsuranceClaim[] = [
  { id: 'cl1', claimNumber: 'CLM-STH-2026-4412', tpaName: 'Star Health', patientName: 'Kavita Menon', invoiceNumber: 'INV-2026-08410', claimedAmount: 6200, approvedAmount: 5800, status: 'paid', submittedAt: '2026-06-01', processedAt: '2026-06-05' },
  { id: 'cl2', claimNumber: 'CLM-MHI-2026-3891', tpaName: 'Medi Assist', patientName: 'Mohammed Hassan', invoiceNumber: 'INV-2026-08398', claimedAmount: 12500, status: 'under-review', submittedAt: '2026-05-22' },
  { id: 'cl3', claimNumber: 'CLM-FGI-2026-2105', tpaName: 'FHPL', patientName: 'Ramesh Iyer', invoiceNumber: 'INV-2026-08405', claimedAmount: 8900, approvedAmount: 7500, status: 'approved', submittedAt: '2026-06-03', processedAt: '2026-06-07' },
  { id: 'cl4', claimNumber: 'CLM-VHI-2026-1567', tpaName: 'Vidal Health', patientName: 'Lakshmi Reddy', invoiceNumber: 'INV-2026-08412', claimedAmount: 4200, status: 'submitted', submittedAt: '2026-06-08' },
  { id: 'cl5', claimNumber: 'CLM-STH-2026-3899', tpaName: 'Star Health', patientName: 'Amit Verma', invoiceNumber: 'INV-2026-08390', claimedAmount: 15600, status: 'rejected', submittedAt: '2026-05-15', processedAt: '2026-05-28' },
];

export const mockFranchiseSettlements: FranchiseSettlement[] = [
  { id: 'fs1', franchiseCode: 'FR-MUM-WEST', franchiseName: 'Mumbai West Franchise', period: 'May 2026', grossRevenue: 2450000, royaltyPercent: 8, royaltyAmount: 196000, netPayable: 2254000, status: 'pending', dueDate: '2026-06-15' },
  { id: 'fs2', franchiseCode: 'FR-DEL-NCR', franchiseName: 'Delhi NCR Franchise', period: 'May 2026', grossRevenue: 1890000, royaltyPercent: 8, royaltyAmount: 151200, netPayable: 1738800, status: 'processing', dueDate: '2026-06-15' },
  { id: 'fs3', franchiseCode: 'FR-BLR-SOUTH', franchiseName: 'Bangalore South Franchise', period: 'May 2026', grossRevenue: 1620000, royaltyPercent: 7.5, royaltyAmount: 121500, netPayable: 1498500, status: 'paid', dueDate: '2026-06-10' },
  { id: 'fs4', franchiseCode: 'FR-CHN-CENTRAL', franchiseName: 'Chennai Central Franchise', period: 'April 2026', grossRevenue: 980000, royaltyPercent: 8, royaltyAmount: 78400, netPayable: 901600, status: 'paid', dueDate: '2026-05-15' },
];

export const mockGstReportSummary: GstReportSummary = {
  period: 'May 2026',
  totalTaxable: 4256800,
  totalCgst: 312450,
  totalSgst: 312450,
  totalIgst: 89400,
  totalTax: 714300,
  invoiceCount: 342,
};

export const mockGstReportEntries: GstReportEntry[] = [
  { id: 'gr1', invoiceNumber: 'INV-2026-08350', invoiceDate: '2026-05-02', customerName: 'Priya Sharma', hsnSac: '999316', taxableValue: 4500, cgst: 405, sgst: 405, igst: 0, total: 5310 },
  { id: 'gr2', invoiceNumber: 'INV-2026-08351', invoiceDate: '2026-05-02', customerName: 'TCS Limited', gstin: '27AAACR5055K1Z7', hsnSac: '999316', taxableValue: 12400, cgst: 1116, sgst: 1116, igst: 0, total: 14632 },
  { id: 'gr3', invoiceNumber: 'INV-2026-08355', invoiceDate: '2026-05-05', customerName: 'Ananya Patel', hsnSac: '999316', taxableValue: 2100, cgst: 0, sgst: 0, igst: 378, total: 2478 },
  { id: 'gr4', invoiceNumber: 'INV-2026-08360', invoiceDate: '2026-05-08', customerName: 'Infosys Limited', gstin: '29AAACI1681G1ZN', hsnSac: '999316', taxableValue: 28900, cgst: 0, sgst: 0, igst: 5202, total: 34102 },
  { id: 'gr5', invoiceNumber: 'INV-2026-08372', invoiceDate: '2026-05-12', customerName: 'Rajesh Kumar', hsnSac: '999316', taxableValue: 8200, cgst: 738, sgst: 738, igst: 0, total: 9676 },
  { id: 'gr6', invoiceNumber: 'INV-2026-08380', invoiceDate: '2026-05-15', customerName: 'Star Health Insurance', gstin: '33AABCS1234F1Z5', hsnSac: '999316', taxableValue: 15600, cgst: 1404, sgst: 1404, igst: 0, total: 18408 },
];

export const mockOutstanding: OutstandingRecord[] = [
  { id: 'os1', invoiceNumber: 'INV-2026-08398', patientName: 'Mohammed Hassan', clientType: 'insurance', clientName: 'Star Health Insurance', amount: 12500, paid: 0, outstanding: 12500, daysOverdue: 9, dueDate: '2026-05-30', lastFollowUp: '2026-06-05' },
  { id: 'os2', invoiceNumber: 'INV-2026-08423', patientName: 'Ananya Patel', clientType: 'retail', amount: 2100, paid: 0, outstanding: 2100, daysOverdue: 0, dueDate: '2026-06-18' },
  { id: 'os3', invoiceNumber: 'INV-2026-08422', patientName: 'Rajesh Kumar', clientType: 'corporate', clientName: 'TCS Limited', amount: 8200, paid: 4000, outstanding: 4200, daysOverdue: 0, dueDate: '2026-06-20' },
  { id: 'os4', invoiceNumber: 'INV-2026-08385', patientName: 'Wipro Employees (Bulk)', clientType: 'corporate', clientName: 'Wipro Limited', amount: 198000, paid: 0, outstanding: 198000, daysOverdue: 45, dueDate: '2026-04-24', lastFollowUp: '2026-06-01' },
  { id: 'os5', invoiceNumber: 'INV-2026-08370', patientName: 'Infosys Camp Batch', clientType: 'corporate', clientName: 'Infosys Limited', amount: 890000, paid: 450000, outstanding: 440000, daysOverdue: 12, dueDate: '2026-05-27', lastFollowUp: '2026-06-06' },
];

export function getBillingInvoiceById(id: string): BillingInvoice | undefined {
  return mockBillingInvoices.find((inv) => inv.id === id);
}

export function getBillingInvoiceByNumber(number: string): BillingInvoice | undefined {
  return mockBillingInvoices.find((inv) => inv.invoiceNumber === number);
}
