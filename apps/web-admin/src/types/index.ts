export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string;
  branchName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Patient {
  id: string;
  uhid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  bloodGroup?: string;
  status: 'active' | 'inactive';
  registeredAt: string;
  lastVisit?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  tests: string[];
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'processing' | 'verified' | 'approved' | 'reported';
  orderedAt: string;
  branch: string;
}

export interface Sample {
  id: string;
  barcode: string;
  patientName: string;
  testName: string;
  status: 'collected' | 'processing' | 'verified' | 'approved' | 'reported';
  collectedAt: string;
  assignedTo?: string;
}

export interface LabResult {
  id: string;
  orderId: string;
  patientName: string;
  testPanel: string;
  status: 'pending' | 'processing' | 'verified' | 'approved' | 'critical';
  parameters: ResultParameter[];
}

export interface ResultParameter {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  paid: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  phone: string;
  status: 'active' | 'inactive';
  manager: string;
  patientCount: number;
}

export interface DashboardStats {
  totalPatients: number;
  todayOrders: number;
  pendingSamples: number;
  revenueToday: number;
  patientsTrend: number;
  ordersTrend: number;
  samplesTrend: number;
  revenueTrend: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type DeviceVendor = 'Roche' | 'Abbott' | 'Siemens' | 'Sysmex' | 'Beckman';
export type DeviceProtocol = 'ASTM' | 'HL7' | 'REST' | 'TCP';
export type DeviceConnectionType = 'serial' | 'tcp' | 'mllp' | 'file';
export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type MessageStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Device {
  id: string;
  name: string;
  deviceCode: string;
  vendor: DeviceVendor;
  model: string;
  protocol: DeviceProtocol;
  connectionType: DeviceConnectionType;
  host: string;
  port: number;
  branch: string;
  branchId: string;
  status: DeviceStatus;
  lastSeen: string;
  messagesPerMin: number;
  errorRate: number;
  queueDepth: number;
  latencyMs: number;
}

export interface DeviceDashboardStats {
  totalDevices: number;
  online: number;
  offline: number;
  errors: number;
  messagesPerMin: number;
  onlineTrend: number;
  messagesTrend: number;
}

export interface DeviceError {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  errorType: string;
  message: string;
  occurredAt: string;
  severity: 'warning' | 'critical';
}

export interface DeviceMessage {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  protocol: DeviceProtocol;
  barcode: string;
  status: MessageStatus;
  direction: 'inbound' | 'outbound';
}

export interface FailedMessage extends DeviceMessage {
  errorCode: string;
  errorMessage: string;
  retryCount: number;
  lastAttemptAt: string;
}

export interface DeviceHealthEvent {
  id: string;
  timestamp: string;
  status: DeviceStatus;
  note?: string;
}

export interface DeviceHealthMetrics {
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  status: DeviceStatus;
  messagesPerMin: number;
  errorRate: number;
  queueDepth: number;
  latencyMs: number;
  uptimePercent: number;
  timeline: DeviceHealthEvent[];
}

export interface DeviceAdapter {
  id: string;
  name: string;
  vendor: DeviceVendor;
  protocol: DeviceProtocol;
  deviceCount: number;
  enabled: boolean;
  fieldMapping: Record<string, string>;
  updatedAt: string;
}

export interface AstmFrame {
  recordType: string;
  fields: string[];
}

export interface AstmMessage {
  id: string;
  timestamp: string;
  deviceName: string;
  direction: 'inbound' | 'outbound';
  raw: string;
  frames: AstmFrame[];
  checksumValid: boolean;
}

export interface AstmConnectionStatus {
  connected: boolean;
  host: string;
  port: number;
  lastHandshake: string;
  activeSessions: number;
}

export interface Hl7Segment {
  type: string;
  fields: string[];
}

export interface Hl7Message {
  id: string;
  timestamp: string;
  deviceName: string;
  messageType: string;
  controlId: string;
  raw: string;
  segments: Hl7Segment[];
  isOru: boolean;
}

export interface Hl7ConnectionStatus {
  connected: boolean;
  host: string;
  port: number;
  mllpBound: boolean;
  messagesReceived: number;
}

export interface ResultImportRecord {
  id: string;
  timestamp: string;
  deviceName: string;
  barcode: string;
  testPanel: string;
  status: 'success' | 'pending' | 'failed';
  resultCount: number;
  errorMessage?: string;
}

export interface ResultImportStats {
  importedToday: number;
  pendingQueue: number;
  successRate: number;
  failedToday: number;
}

export interface DeviceRegisterPayload {
  name: string;
  deviceCode: string;
  vendor: DeviceVendor;
  model: string;
  protocol: DeviceProtocol;
  connectionType: DeviceConnectionType;
  host: string;
  port: number;
  branch: string;
}

export interface MonitoringSnapshot {
  devices: Device[];
  throughput: { label: string; value: number }[];
  lastRefreshedAt: string;
}

// Master Data types
export interface TestMaster {
  id: string;
  code: string;
  name: string;
  department: string;
  specialty: string;
  sampleType: string;
  tat: string;
  basePrice: number;
  status: 'active' | 'inactive';
}

export interface PackageMaster {
  id: string;
  code: string;
  name: string;
  testCount: number;
  listPrice: number;
  discountPercent: number;
  status: 'active' | 'inactive';
}

export interface ProfileMaster {
  id: string;
  code: string;
  name: string;
  packageCount: number;
  targetAudience: string;
  status: 'active' | 'inactive';
}

export interface RateCard {
  id: string;
  name: string;
  clientType: 'retail' | 'corporate' | 'insurance' | 'franchise';
  effectiveFrom: string;
  effectiveTo?: string;
  itemCount: number;
  status: 'active' | 'draft' | 'expired';
}

export interface TaxMaster {
  id: string;
  name: string;
  hsnSac: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  effectiveFrom: string;
  status: 'active' | 'inactive';
}

export interface BillingCode {
  id: string;
  code: string;
  description: string;
  category: string;
  linkedTest?: string;
  status: 'active' | 'inactive';
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  departmentCount: number;
  testCount: number;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  head: string;
  testCount: number;
  status: 'active' | 'inactive';
}

export interface City {
  id: string;
  name: string;
  pincodePrefix: string;
}

export interface StateMaster {
  id: string;
  code: string;
  name: string;
  gstCode: string;
  cities: City[];
}

// Billing types
export interface InvoiceLineItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstBreakdown {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  supplyType: 'intra-state' | 'inter-state';
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'neft' | 'cheque' | 'insurance';
  reference?: string;
  receivedAt: string;
  receivedBy: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientUhid?: string;
  clientType: 'retail' | 'corporate' | 'insurance';
  clientName?: string;
  amount: number;
  paid: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'void';
  dueDate: string;
  createdAt: string;
  branch: string;
  lineItems: InvoiceLineItem[];
  gst: GstBreakdown;
  payments: PaymentRecord[];
}

export interface BillingDashboardStats {
  revenueToday: number;
  outstanding: number;
  pendingClaims: number;
  settlementsDue: number;
  revenueTrend: number;
  outstandingTrend: number;
  claimsTrend: number;
  settlementsTrend: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PaymentCollection {
  id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  method: PaymentRecord['method'];
  reference?: string;
  collectedAt: string;
  collectedBy: string;
  branch: string;
}

export interface CorporateClient {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  creditLimit: number;
  outstanding: number;
  contractStart: string;
  contractEnd: string;
  discountPercent: number;
  paymentTerms: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface CorporateStatement {
  id: string;
  clientCode: string;
  clientName: string;
  period: string;
  invoiceCount: number;
  totalBilled: number;
  totalPaid: number;
  closingBalance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  tpaName: string;
  patientName: string;
  invoiceNumber: string;
  claimedAmount: number;
  approvedAmount?: number;
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'paid';
  submittedAt: string;
  processedAt?: string;
}

export interface FranchiseSettlement {
  id: string;
  franchiseCode: string;
  franchiseName: string;
  period: string;
  grossRevenue: number;
  royaltyPercent: number;
  royaltyAmount: number;
  netPayable: number;
  status: 'pending' | 'processing' | 'paid';
  dueDate: string;
}

export interface GstReportEntry {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  gstin?: string;
  hsnSac: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstReportSummary {
  period: string;
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  invoiceCount: number;
}

export interface OutstandingRecord {
  id: string;
  invoiceNumber: string;
  patientName: string;
  clientType: 'retail' | 'corporate' | 'insurance';
  clientName?: string;
  amount: number;
  paid: number;
  outstanding: number;
  daysOverdue: number;
  dueDate: string;
  lastFollowUp?: string;
}

// Inventory types (Phase 5)
export interface InventoryDashboardStats {
  totalItems: number;
  lowStock: number;
  expiringSoon: number;
  openPurchaseOrders: number;
  totalItemsTrend: number;
  lowStockTrend: number;
  expiringTrend: number;
  poTrend: number;
}

export interface Reagent {
  id: string;
  code: string;
  name: string;
  vendor: string;
  department: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lotNumber: string;
  expiryDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  branch: string;
}

export interface Kit {
  id: string;
  code: string;
  name: string;
  testPanel: string;
  components: number;
  currentStock: number;
  minStock: number;
  expiryDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  branch: string;
}

export interface Consumable {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  branch: string;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  status: 'active' | 'inactive' | 'blacklisted';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  items: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';
  orderedAt: string;
  expectedDelivery: string;
  branch: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromBranch: string;
  toBranch: string;
  items: number;
  status: 'pending' | 'in-transit' | 'received' | 'cancelled';
  initiatedAt: string;
  receivedAt?: string;
  initiatedBy: string;
}

export interface ExpiryAlert {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: 'reagent' | 'kit' | 'consumable';
  lotNumber: string;
  expiryDate: string;
  daysRemaining: number;
  quantity: number;
  branch: string;
  severity: 'warning' | 'critical';
}

// QC types (Phase 6)
export interface QcDashboardStats {
  activeMaterials: number;
  runsToday: number;
  outOfRange: number;
  openCapa: number;
  materialsTrend: number;
  runsTrend: number;
  oorTrend: number;
  capaTrend: number;
}

export interface QcMaterial {
  id: string;
  code: string;
  name: string;
  analyte: string;
  level: 'L1' | 'L2' | 'L3';
  lotNumber: string;
  expiryDate: string;
  mean: number;
  sd: number;
  unit: string;
  status: 'active' | 'expired' | 'retired';
}

export interface QcRun {
  id: string;
  runNumber: string;
  materialName: string;
  analyte: string;
  value: number;
  unit: string;
  zScore: number;
  status: 'in-range' | 'warning' | 'reject';
  runAt: string;
  operator: string;
  device: string;
}

export interface QcChartPoint {
  date: string;
  value: number;
  zScore: number;
  status: 'in-range' | 'warning' | 'reject';
}

export interface QcChartData {
  materialName: string;
  analyte: string;
  mean: number;
  sd: number;
  unit: string;
  points: QcChartPoint[];
}

export interface CalibrationRecord {
  id: string;
  deviceName: string;
  deviceCode: string;
  calibrationType: string;
  performedAt: string;
  performedBy: string;
  nextDue: string;
  status: 'passed' | 'failed' | 'scheduled';
  notes?: string;
}

export interface CapaRecord {
  id: string;
  capaNumber: string;
  title: string;
  source: 'qc-failure' | 'audit' | 'complaint' | 'deviation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'corrective-action' | 'closed';
  openedAt: string;
  assignedTo: string;
  dueDate: string;
}

// CRM types (Phase 7)
export interface CrmDashboardStats {
  activeDoctors: number;
  referralsThisMonth: number;
  activeCamps: number;
  openLeads: number;
  doctorsTrend: number;
  referralsTrend: number;
  campsTrend: number;
  leadsTrend: number;
}

export interface Doctor {
  id: string;
  code: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  email: string;
  referralsYtd: number;
  commissionRate: number;
  status: 'active' | 'inactive';
}

export interface Referral {
  id: string;
  referralNumber: string;
  doctorName: string;
  patientName: string;
  testsOrdered: string[];
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  referredAt: string;
  branch: string;
}

export interface HealthCamp {
  id: string;
  campCode: string;
  name: string;
  clientName: string;
  location: string;
  scheduledDate: string;
  expectedPatients: number;
  registeredPatients: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
}

export interface SalesLead {
  id: string;
  leadNumber: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  estimatedValue: number;
  source: 'inbound' | 'outbound' | 'referral' | 'camp';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  createdAt: string;
  assignedTo: string;
}

export interface SalesRecord {
  id: string;
  dealNumber: string;
  clientName: string;
  dealType: 'corporate' | 'franchise' | 'insurance' | 'government';
  value: number;
  closedAt: string;
  closedBy: string;
  status: 'closed-won' | 'closed-lost';
}

// EHR types (Phase 8)
export interface EhrDashboardStats {
  appointmentsToday: number;
  consultationsPending: number;
  prescriptionsIssued: number;
  telemedicineSessions: number;
  appointmentsTrend: number;
  consultationsTrend: number;
  prescriptionsTrend: number;
  telemedicineTrend: number;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientName: string;
  patientUhid: string;
  doctorName: string;
  specialty: string;
  scheduledAt: string;
  type: 'in-person' | 'telemedicine' | 'follow-up';
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  branch: string;
}

export interface Consultation {
  id: string;
  consultationNumber: string;
  patientName: string;
  doctorName: string;
  chiefComplaint: string;
  diagnosis?: string;
  startedAt: string;
  duration: number;
  status: 'in-progress' | 'completed' | 'pending-review';
  branch: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  doctorName: string;
  medications: string[];
  issuedAt: string;
  validUntil: string;
  status: 'active' | 'dispensed' | 'expired' | 'cancelled';
}

export interface TelemedicineSession {
  id: string;
  sessionNumber: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  duration: number;
  platform: string;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
}

// ABDM types (Phase 10)
export interface AbdmDashboardStats {
  abhaLinked: number;
  consentRequests: number;
  fhirBundlesSent: number;
  exchangeTransactions: number;
  abhaTrend: number;
  consentTrend: number;
  fhirTrend: number;
  exchangeTrend: number;
}

export interface AbhaRecord {
  id: string;
  patientName: string;
  patientUhid: string;
  abhaNumber: string;
  abhaAddress: string;
  linkedAt: string;
  kycStatus: 'verified' | 'pending' | 'failed';
  status: 'active' | 'inactive';
}

export interface ConsentRecord {
  id: string;
  consentId: string;
  patientName: string;
  abhaAddress: string;
  purpose: string;
  hiTypes: string[];
  requestedAt: string;
  expiresAt: string;
  status: 'requested' | 'granted' | 'denied' | 'expired' | 'revoked';
}

export interface FhirBundle {
  id: string;
  bundleId: string;
  patientName: string;
  bundleType: 'document' | 'collection' | 'transaction';
  resourceCount: number;
  sentAt: string;
  destination: string;
  status: 'sent' | 'acknowledged' | 'failed' | 'pending';
}

export interface HealthExchangeRecord {
  id: string;
  transactionId: string;
  type: 'push' | 'pull' | 'notify';
  patientName: string;
  abhaAddress: string;
  hipName: string;
  hiuName: string;
  initiatedAt: string;
  status: 'success' | 'pending' | 'failed';
}

// Analytics types (Phase 11)
export interface AnalyticsDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgTat: number;
  activeBranches: number;
  revenueTrend: number;
  ordersTrend: number;
  tatTrend: number;
  branchesTrend: number;
}

export interface ExecutiveMetric {
  id: string;
  metric: string;
  value: string;
  change: number;
  period: string;
}

export interface RevenueAnalyticsRow {
  id: string;
  period: string;
  revenue: number;
  collections: number;
  outstanding: number;
  growth: number;
}

export interface BranchAnalyticsRow {
  id: string;
  branchName: string;
  city: string;
  orders: number;
  revenue: number;
  avgTat: number;
  growth: number;
}

export interface TestAnalyticsRow {
  id: string;
  testName: string;
  department: string;
  volume: number;
  revenue: number;
  avgPrice: number;
  growth: number;
}

export interface ReferralAnalyticsRow {
  id: string;
  doctorName: string;
  specialty: string;
  referrals: number;
  revenue: number;
  commission: number;
  conversionRate: number;
}

export interface QcAnalyticsRow {
  id: string;
  analyte: string;
  runs: number;
  passRate: number;
  failures: number;
  trend: number;
}

export interface DeviceAnalyticsRow {
  id: string;
  deviceName: string;
  branch: string;
  uptime: number;
  messagesProcessed: number;
  errorRate: number;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  category: 'demand' | 'risk' | 'revenue' | 'operations';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  predictedAt: string;
}

// AI types (Phase 12)
export interface AiDashboardStats {
  activeInsights: number;
  anomaliesDetected: number;
  chatSessionsToday: number;
  whatsappMessages: number;
  insightsTrend: number;
  anomaliesTrend: number;
  chatTrend: number;
  whatsappTrend: number;
}

export interface ClinicalAiInsight {
  id: string;
  patientName: string;
  testName: string;
  insightType: 'anomaly' | 'risk' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  status: 'new' | 'reviewed' | 'dismissed';
}

export interface OperationalAiInsight {
  id: string;
  area: string;
  insightType: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  suggestedAction: string;
  detectedAt: string;
}

export interface AiChatSession {
  id: string;
  sessionId: string;
  userName: string;
  topic: string;
  messages: number;
  startedAt: string;
  status: 'active' | 'closed';
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  patientName: string;
  lastMessage: string;
  messageCount: number;
  lastActiveAt: string;
  status: 'active' | 'waiting' | 'closed';
}

export interface VoiceAssistantSession {
  id: string;
  sessionId: string;
  callerPhone: string;
  intent: string;
  duration: number;
  outcome: 'resolved' | 'transferred' | 'abandoned';
  startedAt: string;
}

// Field Ops types (Phase 13)
export interface FieldDashboardStats {
  activePhlebotomists: number;
  routesToday: number;
  collectionsCompleted: number;
  onTimeRate: number;
  phlebotomistsTrend: number;
  routesTrend: number;
  collectionsTrend: number;
  onTimeTrend: number;
}

export interface Phlebotomist {
  id: string;
  code: string;
  name: string;
  phone: string;
  branch: string;
  status: 'available' | 'on-route' | 'off-duty' | 'on-break';
  collectionsToday: number;
  rating: number;
}

export interface CollectionRoute {
  id: string;
  routeCode: string;
  phlebotomistName: string;
  zone: string;
  scheduledDate: string;
  stops: number;
  completedStops: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

export interface FieldTrackingRecord {
  id: string;
  phlebotomistName: string;
  currentLocation: string;
  lastUpdated: string;
  routeCode: string;
  nextStop: string;
  eta: string;
  status: 'moving' | 'at-stop' | 'idle';
}

export interface FieldAttendanceRecord {
  id: string;
  phlebotomistName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'half-day' | 'late';
}

export interface Geofence {
  id: string;
  name: string;
  zone: string;
  branch: string;
  radiusMeters: number;
  activeCollections: number;
  status: 'active' | 'inactive';
}

// Radiology types (Phase 14)
export interface RadiologyDashboardStats {
  studiesToday: number;
  pendingReports: number;
  avgReportTat: number;
  pacsOnline: boolean;
  studiesTrend: number;
  pendingTrend: number;
  tatTrend: number;
}

export interface RadiologyStudy {
  id: string;
  accessionNumber: string;
  patientName: string;
  modality: string;
  studyDescription: string;
  scheduledAt: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  branch: string;
}

export interface RadiologyWorklistItem {
  id: string;
  accessionNumber: string;
  patientName: string;
  modality: string;
  priority: 'routine' | 'urgent' | 'stat';
  assignedTo?: string;
  receivedAt: string;
  status: 'pending' | 'reading' | 'preliminary' | 'finalized';
}

export interface PacsNode {
  id: string;
  name: string;
  aeTitle: string;
  host: string;
  port: number;
  modality: string;
  studiesStored: number;
  status: 'online' | 'offline' | 'degraded';
  lastSync: string;
}

export interface RadiologyReport {
  id: string;
  accessionNumber: string;
  patientName: string;
  modality: string;
  studyDescription: string;
  radiologist: string;
  reportedAt: string;
  status: 'draft' | 'preliminary' | 'final' | 'amended';
}

// HRMS types (Phase 15)
export interface HrmsDashboardStats {
  totalEmployees: number;
  presentToday: number;
  openPositions: number;
  payrollDue: number;
  employeesTrend: number;
  attendanceTrend: number;
  positionsTrend: number;
  payrollTrend: number;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  branch: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'terminated';
}

export interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  period: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
}

export interface HrmsAttendanceRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'half-day' | 'leave' | 'late';
}

export interface Shift {
  id: string;
  shiftCode: string;
  name: string;
  startTime: string;
  endTime: string;
  department: string;
  assignedCount: number;
  status: 'active' | 'inactive';
}

export interface TrainingRecord {
  id: string;
  courseName: string;
  trainer: string;
  scheduledDate: string;
  participants: number;
  maxParticipants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

// Marketplace types (Phase 16)
export interface MarketplaceDashboardStats {
  activeListings: number;
  partnerCount: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  listingsTrend: number;
  partnersTrend: number;
  ordersTrend: number;
  revenueTrend: number;
}

export interface MarketplaceListing {
  id: string;
  listingCode: string;
  title: string;
  category: string;
  price: number;
  provider: string;
  rating: number;
  status: 'active' | 'draft' | 'archived';
}

export interface MarketplacePartner {
  id: string;
  partnerCode: string;
  name: string;
  type: 'lab' | 'clinic' | 'wellness' | 'pharmacy';
  city: string;
  listingsCount: number;
  ordersYtd: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  listingTitle: string;
  amount: number;
  orderedAt: string;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
}

export interface WellnessPackage {
  id: string;
  packageCode: string;
  name: string;
  description: string;
  testsIncluded: number;
  price: number;
  soldCount: number;
  status: 'active' | 'inactive';
}

export interface MarketplaceCamp {
  id: string;
  campCode: string;
  name: string;
  partnerName: string;
  location: string;
  scheduledDate: string;
  slotsAvailable: number;
  slotsBooked: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Observability types (Phase 18)
export interface ObservabilityDashboardStats {
  totalTraces: number;
  errorRate: number;
  slaCompliance: number;
  activeServices: number;
  tracesTrend: number;
  errorTrend: number;
  slaTrend: number;
  servicesTrend: number;
}

export interface TraceRecord {
  id: string;
  traceId: string;
  service: string;
  operation: string;
  durationMs: number;
  status: 'ok' | 'error' | 'timeout';
  timestamp: string;
  spans: number;
}

export interface SlaMetric {
  id: string;
  service: string;
  metric: string;
  target: number;
  actual: number;
  compliance: number;
  period: string;
  status: 'met' | 'at-risk' | 'breached';
}

export interface ServiceMapNode {
  id: string;
  service: string;
  namespace: string;
  health: 'healthy' | 'degraded' | 'down';
  requestsPerMin: number;
  latencyP95: number;
  dependencies: number;
}

export interface CapacityMetric {
  id: string;
  resource: string;
  cluster: string;
  utilization: number;
  capacity: number;
  forecastDays: number;
  status: 'normal' | 'warning' | 'critical';
}

// Data Platform types (Phase 19)
export interface DataPlatformDashboardStats {
  activePipelines: number;
  lakeSizeTb: number;
  warehouseQueriesToday: number;
  exportsScheduled: number;
  pipelinesTrend: number;
  lakeTrend: number;
  queriesTrend: number;
  exportsTrend: number;
}

export interface DataPipeline {
  id: string;
  pipelineCode: string;
  name: string;
  source: string;
  destination: string;
  schedule: string;
  lastRun: string;
  status: 'running' | 'success' | 'failed' | 'idle';
}

export interface DataLakeDataset {
  id: string;
  datasetCode: string;
  name: string;
  format: string;
  sizeGb: number;
  records: number;
  lastUpdated: string;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface WarehouseTable {
  id: string;
  tableName: string;
  schema: string;
  rows: number;
  sizeGb: number;
  lastRefreshed: string;
  refreshSchedule: string;
}

export interface DataExport {
  id: string;
  exportCode: string;
  name: string;
  format: string;
  destination: string;
  schedule: string;
  lastExport: string;
  status: 'active' | 'paused' | 'failed';
}

// Workflow types (Phase 20)
export interface WorkflowDashboardStats {
  activeDefinitions: number;
  runningInstances: number;
  pendingTasks: number;
  automationRules: number;
  definitionsTrend: number;
  instancesTrend: number;
  tasksTrend: number;
  automationTrend: number;
}

export interface WorkflowDefinition {
  id: string;
  definitionCode: string;
  name: string;
  category: string;
  version: number;
  steps: number;
  triggers: string;
  status: 'active' | 'draft' | 'archived';
}

export interface WorkflowInstance {
  id: string;
  instanceCode: string;
  definitionName: string;
  startedBy: string;
  startedAt: string;
  currentStep: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface WorkflowTask {
  id: string;
  taskCode: string;
  instanceCode: string;
  assignee: string;
  taskType: string;
  dueAt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

export interface AutomationRule {
  id: string;
  ruleCode: string;
  name: string;
  trigger: string;
  action: string;
  executionsToday: number;
  lastTriggered: string;
  status: 'active' | 'disabled';
}

// DMS types (Phase 21)
export interface DmsDashboardStats {
  totalDocuments: number;
  storageUsedGb: number;
  retentionPolicies: number;
  searchesToday: number;
  documentsTrend: number;
  storageTrend: number;
  policiesTrend: number;
  searchesTrend: number;
}

export interface DmsDocument {
  id: string;
  documentCode: string;
  title: string;
  category: string;
  patientName?: string;
  uploadedBy: string;
  uploadedAt: string;
  sizeMb: number;
  status: 'active' | 'archived' | 'pending-review';
}

export interface DmsSearchResult {
  id: string;
  query: string;
  resultCount: number;
  searchedBy: string;
  searchedAt: string;
  topMatch: string;
}

export interface DmsRetentionPolicy {
  id: string;
  policyCode: string;
  name: string;
  documentType: string;
  retentionYears: number;
  actionOnExpiry: string;
  documentsAffected: number;
  status: 'active' | 'draft';
}

// Branding types (Phase 22)
export interface BrandingDashboardStats {
  activeThemes: number;
  featureFlags: number;
  franchiseTenants: number;
  customDomains: number;
  themesTrend: number;
  flagsTrend: number;
  tenantsTrend: number;
  domainsTrend: number;
}

export interface BrandingTheme {
  id: string;
  themeCode: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  appliedTo: string;
  status: 'active' | 'draft';
}

export interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  description: string;
  enabledFor: string;
  rolloutPercent: number;
  status: 'enabled' | 'disabled' | 'partial';
}

export interface FranchiseBranding {
  id: string;
  franchiseCode: string;
  franchiseName: string;
  theme: string;
  customDomain?: string;
  branches: number;
  status: 'active' | 'pending' | 'suspended';
}

// AI Agents types (Phase 23)
export interface AgentsDashboardStats {
  activeAgents: number;
  sessionsToday: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  agentsTrend: number;
  sessionsTrend: number;
  resolutionTrend: number;
  satisfactionTrend: number;
}

export type AgentType = 'patient' | 'doctor' | 'lab' | 'management';

export interface AiAgentRecord {
  id: string;
  agentCode: string;
  name: string;
  type: AgentType;
  model: string;
  capabilities: string;
  sessionsToday: number;
  status: 'active' | 'training' | 'disabled';
}

// i18n types (Phase 24)
export interface I18nDashboardStats {
  supportedLocales: number;
  translationKeys: number;
  coveragePercent: number;
  tenantOverrides: number;
  localesTrend: number;
  keysTrend: number;
  coverageTrend: number;
  overridesTrend: number;
}

export interface CountryLocale {
  id: string;
  countryCode: string;
  countryName: string;
  locale: string;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive';
}

export interface TranslationEntry {
  id: string;
  key: string;
  namespace: string;
  locale: string;
  value: string;
  status: 'translated' | 'pending' | 'review';
}

export interface TenantLocaleOverride {
  id: string;
  tenantName: string;
  defaultLocale: string;
  fallbackLocale: string;
  dateFormat: string;
  numberFormat: string;
  rtlEnabled: boolean;
}

// Security types (Phase 25)
export interface SecurityDashboardStats {
  openIncidents: number;
  activeThreats: number;
  openVulnerabilities: number;
  expiringCertificates: number;
  incidentsTrend: number;
  threatsTrend: number;
  vulnerabilitiesTrend: number;
  certificatesTrend: number;
}

export interface SecurityIncident {
  id: string;
  incidentCode: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reportedAt: string;
  assignedTo: string;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
}

export interface SecurityThreat {
  id: string;
  threatCode: string;
  source: string;
  type: string;
  target: string;
  detectedAt: string;
  riskScore: number;
  status: 'active' | 'mitigated' | 'dismissed';
}

export interface SecurityVulnerability {
  id: string;
  cveId: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  discoveredAt: string;
  patchAvailable: boolean;
  status: 'open' | 'in-progress' | 'patched' | 'accepted';
}

export interface PentestReport {
  id: string;
  reportCode: string;
  vendor: string;
  scope: string;
  conductedAt: string;
  findings: number;
  criticalFindings: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'remediation';
}

export interface SecurityCertificate {
  id: string;
  domain: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  status: 'valid' | 'expiring' | 'expired' | 'revoked';
}

// Compliance types (Phase 28)
export interface ComplianceDashboardStats {
  activePacks: number;
  controlsCompliant: number;
  evidencePending: number;
  openRisks: number;
  packsTrend: number;
  complianceTrend: number;
  evidenceTrend: number;
  risksTrend: number;
}

export interface CompliancePack {
  id: string;
  packCode: string;
  name: string;
  framework: string;
  region: string;
  controlsCount: number;
  compliancePercent: number;
  status: 'active' | 'draft' | 'archived';
}

export interface ComplianceControl {
  id: string;
  controlCode: string;
  name: string;
  framework: string;
  category: string;
  owner: string;
  lastAssessed: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
}

export interface ComplianceEvidence {
  id: string;
  evidenceCode: string;
  controlName: string;
  type: string;
  collectedAt: string;
  collectedBy: string;
  expiresAt?: string;
  status: 'valid' | 'pending-review' | 'expired' | 'rejected';
}

export interface ComplianceRisk {
  id: string;
  riskCode: string;
  title: string;
  category: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  owner: string;
  status: 'open' | 'mitigating' | 'accepted' | 'closed';
}

export interface CompliancePolicy {
  id: string;
  policyCode: string;
  title: string;
  version: string;
  effectiveDate: string;
  owner: string;
  reviewDue: string;
  status: 'active' | 'draft' | 'under-review' | 'retired';
}

// Customer Success types (Phase 29)
export interface CustomerSuccessDashboardStats {
  activeOnboardings: number;
  migrationsInProgress: number;
  trainingSessions: number;
  openTickets: number;
  onboardingsTrend: number;
  migrationsTrend: number;
  trainingTrend: number;
  ticketsTrend: number;
}

export interface OnboardingRecord {
  id: string;
  tenantName: string;
  plan: string;
  startDate: string;
  goLiveDate: string;
  progress: number;
  csm: string;
  status: 'not-started' | 'in-progress' | 'blocked' | 'completed';
}

export interface MigrationRecord {
  id: string;
  migrationCode: string;
  tenantName: string;
  sourceSystem: string;
  recordsTotal: number;
  recordsMigrated: number;
  startedAt: string;
  status: 'planning' | 'in-progress' | 'validating' | 'completed' | 'failed';
}

export interface TrainingSession {
  id: string;
  sessionCode: string;
  title: string;
  audience: string;
  trainer: string;
  scheduledAt: string;
  attendees: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface KnowledgeArticle {
  id: string;
  articleCode: string;
  title: string;
  category: string;
  views: number;
  updatedAt: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  tenantName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignee: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
}

// Commercial types (Phase 30)
export interface CommercialDashboardStats {
  activePlans: number;
  activeSubscriptions: number;
  pendingQuotations: number;
  partnerRevenue: number;
  plansTrend: number;
  subscriptionsTrend: number;
  quotationsTrend: number;
  revenueTrend: number;
}

export interface CommercialPlan {
  id: string;
  planCode: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  monthlyPrice: number;
  annualPrice: number;
  features: string;
  status: 'active' | 'deprecated' | 'draft';
}

export interface CommercialSubscription {
  id: string;
  subscriptionCode: string;
  tenantName: string;
  plan: string;
  mrr: number;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'trial' | 'past-due' | 'cancelled';
}

export interface CommercialQuotation {
  id: string;
  quotationCode: string;
  prospectName: string;
  plan: string;
  amount: number;
  validUntil: string;
  salesRep: string;
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'rejected';
}

export interface CommercialPartner {
  id: string;
  partnerCode: string;
  name: string;
  type: 'reseller' | 'referral' | 'integration' | 'white-label';
  region: string;
  activeSubscriptions: number;
  revenueShare: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface CommercialRevenue {
  id: string;
  period: string;
  mrr: number;
  arr: number;
  newBusiness: number;
  churn: number;
  netRevenue: number;
}
