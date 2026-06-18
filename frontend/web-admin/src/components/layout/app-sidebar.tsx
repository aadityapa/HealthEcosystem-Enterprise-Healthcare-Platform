'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  Bug,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  CreditCard,
  Database,
  FileCode,
  FileKey,
  FileText,
  Fingerprint,
  FlaskConical,
  FolderOpen,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  LogOut,
  MapPin,
  MessageSquare,
  Mic,
  Monitor,
  Network,
  Package,
  Palette,
  Pill,
  Plus,
  Radio,
  Receipt,
  Scan,
  Settings2,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Store,
  Target,
  TestTube2,
  Truck,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Wallet,
  Wand2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sidebar, type SidebarNavItem } from '@health/design-system';
import { useAuth } from '@/hooks/use-auth';

const navItems: SidebarNavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    children: [
      { title: 'All Patients', href: '/patients', icon: Users },
      { title: 'Register', href: '/patients/register', icon: UserPlus },
    ],
  },
  {
    title: 'LIMS',
    href: '/lims',
    icon: FlaskConical,
    children: [
      { title: 'New Order', href: '/lims/orders/new', icon: ClipboardList },
      { title: 'Sample Tracking', href: '/lims/samples', icon: TestTube2, badge: 12 },
    ],
  },
  {
    title: 'Master Data',
    href: '/master/tests',
    icon: Database,
    children: [
      { title: 'Test Master', href: '/master/tests', icon: TestTube2 },
      { title: 'Package Master', href: '/master/packages', icon: ClipboardList },
      { title: 'Profile Master', href: '/master/profiles', icon: FileText },
      { title: 'Rate Cards', href: '/master/rate-cards', icon: Receipt },
      { title: 'Tax Masters (GST)', href: '/master/tax', icon: IndianRupee },
      { title: 'Billing Codes', href: '/master/billing-codes', icon: Receipt },
      { title: 'Specialties', href: '/master/specialties', icon: HeartPulse },
      { title: 'Departments', href: '/master/departments', icon: Building2 },
      { title: 'States & Cities', href: '/master/geography', icon: Building2 },
    ],
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
    children: [
      { title: 'Billing Dashboard', href: '/billing', icon: LayoutDashboard },
      { title: 'Invoices', href: '/billing/invoices', icon: Receipt },
      { title: 'Create Invoice', href: '/billing/invoices/new', icon: Plus },
      { title: 'Payments', href: '/billing/payments', icon: Wallet },
      { title: 'Corporate Clients', href: '/billing/corporate', icon: Building2 },
      { title: 'Monthly Statements', href: '/billing/corporate/statements', icon: FileText },
      { title: 'TPA & Claims', href: '/billing/insurance', icon: Shield },
      { title: 'Franchise Settlements', href: '/billing/franchise', icon: Store },
      { title: 'GST Reports', href: '/billing/gst', icon: IndianRupee },
      { title: 'Outstanding', href: '/billing/outstanding', icon: AlertTriangle },
    ],
  },
  {
    title: 'Devices',
    href: '/devices',
    icon: Cpu,
    children: [
      { title: 'Device Dashboard', href: '/devices', icon: LayoutDashboard },
      { title: 'Register Device', href: '/devices/register', icon: Plus },
      { title: 'Monitoring', href: '/devices/monitoring', icon: Monitor },
      { title: 'Message Queue', href: '/devices/messages', icon: MessageSquare },
      { title: 'Failed Messages', href: '/devices/messages/failed', icon: AlertTriangle },
      { title: 'Device Health', href: '/devices/health', icon: HeartPulse },
      { title: 'Adapter Config', href: '/devices/adapters', icon: Settings2 },
      { title: 'ASTM Monitor', href: '/devices/protocols/astm', icon: Radio },
      { title: 'HL7 Monitor', href: '/devices/protocols/hl7', icon: Activity },
      { title: 'Result Import', href: '/devices/results', icon: Upload },
    ],
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    children: [
      { title: 'Inventory Dashboard', href: '/inventory', icon: LayoutDashboard },
      { title: 'Reagents', href: '/inventory/reagents', icon: FlaskConical },
      { title: 'Kits', href: '/inventory/kits', icon: Boxes },
      { title: 'Consumables', href: '/inventory/consumables', icon: Package },
      { title: 'Vendors', href: '/inventory/vendors', icon: Truck },
      { title: 'Purchase Orders', href: '/inventory/purchase-orders', icon: ShoppingCart },
      { title: 'Transfers', href: '/inventory/transfers', icon: ArrowRightLeft },
      { title: 'Expiry Alerts', href: '/inventory/expiry', icon: AlertTriangle },
    ],
  },
  {
    title: 'QC',
    href: '/qc',
    icon: ClipboardCheck,
    children: [
      { title: 'QC Dashboard', href: '/qc', icon: LayoutDashboard },
      { title: 'QC Materials', href: '/qc/materials', icon: TestTube2 },
      { title: 'QC Runs', href: '/qc/runs', icon: ClipboardCheck },
      { title: 'Levey-Jennings', href: '/qc/charts', icon: LineChart },
      { title: 'Calibration', href: '/qc/calibration', icon: Settings2 },
      { title: 'CAPA', href: '/qc/capa', icon: AlertTriangle },
    ],
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: Handshake,
    children: [
      { title: 'CRM Dashboard', href: '/crm', icon: LayoutDashboard },
      { title: 'Doctors', href: '/crm/doctors', icon: Stethoscope },
      { title: 'Referrals', href: '/crm/referrals', icon: Users },
      { title: 'Health Camps', href: '/crm/camps', icon: Calendar },
      { title: 'Leads', href: '/crm/leads', icon: Target },
      { title: 'Sales', href: '/crm/sales', icon: IndianRupee },
    ],
  },
  {
    title: 'EHR',
    href: '/ehr',
    icon: HeartPulse,
    children: [
      { title: 'EHR Dashboard', href: '/ehr', icon: LayoutDashboard },
      { title: 'Appointments', href: '/ehr/appointments', icon: Calendar },
      { title: 'Consultations', href: '/ehr/consultations', icon: Stethoscope },
      { title: 'Prescriptions', href: '/ehr/prescriptions', icon: Pill },
      { title: 'Telemedicine', href: '/ehr/telemedicine', icon: Video },
    ],
  },
  {
    title: 'ABDM',
    href: '/abdm',
    icon: Fingerprint,
    children: [
      { title: 'ABDM Dashboard', href: '/abdm', icon: LayoutDashboard },
      { title: 'ABHA', href: '/abdm/abha', icon: Fingerprint },
      { title: 'Consent', href: '/abdm/consent', icon: Shield },
      { title: 'FHIR Bundles', href: '/abdm/fhir', icon: FileCode },
      { title: 'HIE Exchange', href: '/abdm/exchange', icon: Share2 },
    ],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { title: 'Analytics Dashboard', href: '/analytics', icon: LayoutDashboard },
      { title: 'Executive', href: '/analytics/executive', icon: Sparkles },
      { title: 'Revenue', href: '/analytics/revenue', icon: IndianRupee },
      { title: 'Branches', href: '/analytics/branches', icon: Building2 },
      { title: 'Tests', href: '/analytics/tests', icon: TestTube2 },
      { title: 'Referrals', href: '/analytics/referrals', icon: Users },
      { title: 'QC', href: '/analytics/qc', icon: ClipboardCheck },
      { title: 'Devices', href: '/analytics/devices', icon: Cpu },
      { title: 'Predictive', href: '/analytics/predictive', icon: Brain },
    ],
  },
  {
    title: 'AI',
    href: '/ai',
    icon: Bot,
    children: [
      { title: 'AI Dashboard', href: '/ai', icon: LayoutDashboard },
      { title: 'Clinical AI', href: '/ai/clinical', icon: Stethoscope },
      { title: 'Operational AI', href: '/ai/operational', icon: Settings2 },
      { title: 'AI Chat', href: '/ai/chat', icon: MessageSquare },
      { title: 'WhatsApp', href: '/ai/whatsapp', icon: MessageSquare },
      { title: 'Voice Assistant', href: '/ai/voice', icon: Mic },
    ],
  },
  {
    title: 'Field Ops',
    href: '/field',
    icon: Truck,
    children: [
      { title: 'Field Dashboard', href: '/field', icon: LayoutDashboard },
      { title: 'Phlebotomists', href: '/field/phlebotomists', icon: Users },
      { title: 'Routes', href: '/field/routes', icon: MapPin },
      { title: 'Live Tracking', href: '/field/tracking', icon: MapPin },
      { title: 'Attendance', href: '/field/attendance', icon: UserCheck },
      { title: 'Geofences', href: '/field/geofences', icon: MapPin },
    ],
  },
  {
    title: 'Radiology',
    href: '/radiology',
    icon: Scan,
    children: [
      { title: 'Radiology Dashboard', href: '/radiology', icon: LayoutDashboard },
      { title: 'Studies', href: '/radiology/studies', icon: FileText },
      { title: 'Worklist', href: '/radiology/worklist', icon: ClipboardList },
      { title: 'PACS', href: '/radiology/pacs', icon: Radio },
      { title: 'Reports', href: '/radiology/reports', icon: FileText },
    ],
  },
  {
    title: 'HRMS',
    href: '/hrms',
    icon: Briefcase,
    children: [
      { title: 'HRMS Dashboard', href: '/hrms', icon: LayoutDashboard },
      { title: 'Employees', href: '/hrms/employees', icon: Users },
      { title: 'Payroll', href: '/hrms/payroll', icon: IndianRupee },
      { title: 'Attendance', href: '/hrms/attendance', icon: UserCheck },
      { title: 'Shifts', href: '/hrms/shifts', icon: Calendar },
      { title: 'Training', href: '/hrms/training', icon: GraduationCap },
    ],
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    children: [
      { title: 'Marketplace Dashboard', href: '/marketplace', icon: LayoutDashboard },
      { title: 'Listings', href: '/marketplace/listings', icon: Store },
      { title: 'Partners', href: '/marketplace/partners', icon: Handshake },
      { title: 'Orders', href: '/marketplace/orders', icon: ShoppingCart },
      { title: 'Wellness', href: '/marketplace/wellness', icon: HeartPulse },
      { title: 'Camps', href: '/marketplace/camps', icon: Calendar },
    ],
  },
  {
    title: 'Observability',
    href: '/observability',
    icon: Gauge,
    children: [
      { title: 'Observability Dashboard', href: '/observability', icon: LayoutDashboard },
      { title: 'Traces', href: '/observability/traces', icon: Activity },
      { title: 'SLA Metrics', href: '/observability/sla', icon: Shield },
      { title: 'Service Map', href: '/observability/service-map', icon: Network },
      { title: 'Capacity', href: '/observability/capacity', icon: BarChart3 },
    ],
  },
  {
    title: 'Data Platform',
    href: '/data',
    icon: Database,
    children: [
      { title: 'Data Dashboard', href: '/data', icon: LayoutDashboard },
      { title: 'Pipelines', href: '/data/pipelines', icon: GitBranch },
      { title: 'Data Lake', href: '/data/lake', icon: Database },
      { title: 'Warehouse', href: '/data/warehouse', icon: Boxes },
      { title: 'Exports', href: '/data/exports', icon: Upload },
    ],
  },
  {
    title: 'Workflow',
    href: '/workflow',
    icon: GitBranch,
    children: [
      { title: 'Workflow Dashboard', href: '/workflow', icon: LayoutDashboard },
      { title: 'Definitions', href: '/workflow/definitions', icon: FileCode },
      { title: 'Instances', href: '/workflow/instances', icon: Activity },
      { title: 'Tasks', href: '/workflow/tasks', icon: ClipboardList },
      { title: 'Automation', href: '/workflow/automation', icon: Sparkles },
    ],
  },
  {
    title: 'DMS',
    href: '/dms',
    icon: FolderOpen,
    children: [
      { title: 'DMS Dashboard', href: '/dms', icon: LayoutDashboard },
      { title: 'Documents', href: '/dms/documents', icon: FileText },
      { title: 'Search', href: '/dms/search', icon: Scan },
      { title: 'Retention', href: '/dms/retention', icon: Shield },
    ],
  },
  {
    title: 'White Label',
    href: '/branding',
    icon: Palette,
    children: [
      { title: 'Branding Dashboard', href: '/branding', icon: LayoutDashboard },
      { title: 'Themes', href: '/branding/themes', icon: Palette },
      { title: 'Feature Flags', href: '/branding/features', icon: Settings2 },
      { title: 'Franchise', href: '/branding/franchise', icon: Store },
    ],
  },
  {
    title: 'AI Agents',
    href: '/agents',
    icon: Wand2,
    children: [
      { title: 'Agents Dashboard', href: '/agents', icon: LayoutDashboard },
      { title: 'Patient Agents', href: '/agents/patient', icon: Users },
      { title: 'Doctor Agents', href: '/agents/doctor', icon: Stethoscope },
      { title: 'Lab Agents', href: '/agents/lab', icon: FlaskConical },
      { title: 'Management Agents', href: '/agents/management', icon: Briefcase },
    ],
  },
  {
    title: 'i18n',
    href: '/i18n',
    icon: Globe,
    children: [
      { title: 'i18n Dashboard', href: '/i18n', icon: LayoutDashboard },
      { title: 'Countries', href: '/i18n/countries', icon: Globe },
      { title: 'Translations', href: '/i18n/translations', icon: FileText },
      { title: 'Tenant Locale', href: '/i18n/tenant-locale', icon: Building2 },
    ],
  },
  {
    title: 'Security',
    href: '/security',
    icon: Shield,
    children: [
      { title: 'Security Dashboard', href: '/security', icon: LayoutDashboard },
      { title: 'Incidents', href: '/security/incidents', icon: AlertTriangle },
      { title: 'Threats', href: '/security/threats', icon: Shield },
      { title: 'Vulnerabilities', href: '/security/vulnerabilities', icon: Bug },
      { title: 'Pen Tests', href: '/security/pentest', icon: Scan },
      { title: 'Certificates', href: '/security/certificates', icon: FileKey },
    ],
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: ClipboardCheck,
    children: [
      { title: 'Compliance Dashboard', href: '/compliance', icon: LayoutDashboard },
      { title: 'Packs', href: '/compliance/packs', icon: Package },
      { title: 'Controls', href: '/compliance/controls', icon: ClipboardCheck },
      { title: 'Evidence', href: '/compliance/evidence', icon: FileText },
      { title: 'Risks', href: '/compliance/risks', icon: AlertTriangle },
      { title: 'Policies', href: '/compliance/policies', icon: BookOpen },
    ],
  },
  {
    title: 'Customer Success',
    href: '/customer-success',
    icon: Handshake,
    children: [
      { title: 'CS Dashboard', href: '/customer-success', icon: LayoutDashboard },
      { title: 'Onboarding', href: '/customer-success/onboarding', icon: UserPlus },
      { title: 'Migration', href: '/customer-success/migration', icon: ArrowRightLeft },
      { title: 'Training', href: '/customer-success/training', icon: GraduationCap },
      { title: 'Knowledge', href: '/customer-success/knowledge', icon: BookOpen },
      { title: 'Tickets', href: '/customer-success/tickets', icon: MessageSquare },
    ],
  },
  {
    title: 'Commercial',
    href: '/commercial',
    icon: IndianRupee,
    children: [
      { title: 'Commercial Dashboard', href: '/commercial', icon: LayoutDashboard },
      { title: 'Plans', href: '/commercial/plans', icon: ClipboardList },
      { title: 'Subscriptions', href: '/commercial/subscriptions', icon: CreditCard },
      { title: 'Quotations', href: '/commercial/quotations', icon: FileText },
      { title: 'Partners', href: '/commercial/partners', icon: Handshake },
      { title: 'Revenue', href: '/commercial/revenue', icon: IndianRupee },
    ],
  },
  { title: 'Branches', href: '/admin/branches', icon: Building2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar
      items={navItems}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      activeHref={pathname}
      onNavigate={(href) => router.push(href)}
      logo={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-none">HealthEcosystem</p>
            <p className="text-[10px] text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      }
      footer={
        user && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )
      }
    />
  );
}
