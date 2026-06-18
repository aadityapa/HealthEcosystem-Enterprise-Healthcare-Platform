import type {
  BillingCode,
  Department,
  PackageMaster,
  ProfileMaster,
  RateCard,
  Specialty,
  StateMaster,
  TaxMaster,
  TestMaster,
} from '@/types';

export const mockTests: TestMaster[] = [
  { id: 't1', code: 'CBC', name: 'Complete Blood Count', department: 'Hematology', specialty: 'Clinical Pathology', sampleType: 'EDTA Blood', tat: '4 hrs', basePrice: 450, status: 'active' },
  { id: 't2', code: 'LIPID', name: 'Lipid Profile', department: 'Biochemistry', specialty: 'Clinical Chemistry', sampleType: 'Serum', tat: '6 hrs', basePrice: 850, status: 'active' },
  { id: 't3', code: 'THY', name: 'Thyroid Panel (T3, T4, TSH)', department: 'Immunoassay', specialty: 'Endocrinology', sampleType: 'Serum', tat: '24 hrs', basePrice: 1200, status: 'active' },
  { id: 't4', code: 'HBA1C', name: 'HbA1c', department: 'Biochemistry', specialty: 'Diabetes Care', sampleType: 'EDTA Blood', tat: '4 hrs', basePrice: 650, status: 'active' },
  { id: 't5', code: 'LFT', name: 'Liver Function Test', department: 'Biochemistry', specialty: 'Hepatology', sampleType: 'Serum', tat: '6 hrs', basePrice: 950, status: 'active' },
  { id: 't6', code: 'KFT', name: 'Kidney Function Test', department: 'Biochemistry', specialty: 'Nephrology', sampleType: 'Serum', tat: '6 hrs', basePrice: 900, status: 'active' },
  { id: 't7', code: 'URINE', name: 'Urine Routine & Microscopy', department: 'Clinical Pathology', specialty: 'Urinalysis', sampleType: 'Urine', tat: '2 hrs', basePrice: 250, status: 'active' },
  { id: 't8', code: 'VITD', name: 'Vitamin D (25-OH)', department: 'Immunoassay', specialty: 'Nutrition', sampleType: 'Serum', tat: '48 hrs', basePrice: 1500, status: 'active' },
  { id: 't9', code: 'PSA', name: 'PSA Total', department: 'Immunoassay', specialty: 'Oncology', sampleType: 'Serum', tat: '24 hrs', basePrice: 1100, status: 'inactive' },
];

export const mockPackages: PackageMaster[] = [
  { id: 'pkg1', code: 'BASIC-HEALTH', name: 'Basic Health Checkup', testCount: 28, listPrice: 2499, discountPercent: 15, status: 'active' },
  { id: 'pkg2', code: 'EXEC-PLUS', name: 'Executive Health Plus', testCount: 52, listPrice: 5999, discountPercent: 20, status: 'active' },
  { id: 'pkg3', code: 'DIAB-CARE', name: 'Diabetes Care Panel', testCount: 12, listPrice: 1899, discountPercent: 10, status: 'active' },
  { id: 'pkg4', code: 'CARDIO-SCREEN', name: 'Cardiac Screening', testCount: 18, listPrice: 3499, discountPercent: 12, status: 'active' },
  { id: 'pkg5', code: 'WOMEN-WELL', name: "Women's Wellness", testCount: 24, listPrice: 4299, discountPercent: 18, status: 'active' },
  { id: 'pkg6', code: 'SENIOR-CARE', name: 'Senior Citizen Package', testCount: 35, listPrice: 4999, discountPercent: 25, status: 'inactive' },
];

export const mockProfiles: ProfileMaster[] = [
  { id: 'pr1', code: 'CORP-STD', name: 'Corporate Standard Profile', packageCount: 3, targetAudience: 'Corporate Employees', status: 'active' },
  { id: 'pr2', code: 'CORP-EXEC', name: 'Corporate Executive Profile', packageCount: 2, targetAudience: 'Senior Management', status: 'active' },
  { id: 'pr3', code: 'PRE-EMP', name: 'Pre-Employment Screening', packageCount: 2, targetAudience: 'New Hires', status: 'active' },
  { id: 'pr4', code: 'ANNUAL-RETAIL', name: 'Annual Retail Wellness', packageCount: 4, targetAudience: 'Walk-in Patients', status: 'active' },
  { id: 'pr5', code: 'INS-GIC', name: 'GIC Insurance Profile', packageCount: 2, targetAudience: 'TPA / Insurance', status: 'active' },
];

export const mockRateCards: RateCard[] = [
  { id: 'rc1', name: 'Retail Standard 2026', clientType: 'retail', effectiveFrom: '2026-01-01', itemCount: 342, status: 'active' },
  { id: 'rc2', name: 'TCS Corporate Agreement', clientType: 'corporate', effectiveFrom: '2025-04-01', effectiveTo: '2026-03-31', itemCount: 128, status: 'active' },
  { id: 'rc3', name: 'Star Health TPA Rates', clientType: 'insurance', effectiveFrom: '2025-07-01', itemCount: 256, status: 'active' },
  { id: 'rc4', name: 'Franchise Tier-1 Rates', clientType: 'franchise', effectiveFrom: '2026-01-01', itemCount: 180, status: 'active' },
  { id: 'rc5', name: 'Infosys Corporate (Draft)', clientType: 'corporate', effectiveFrom: '2026-07-01', itemCount: 95, status: 'draft' },
  { id: 'rc6', name: 'Retail 2025 (Expired)', clientType: 'retail', effectiveFrom: '2025-01-01', effectiveTo: '2025-12-31', itemCount: 310, status: 'expired' },
];

export const mockTaxMasters: TaxMaster[] = [
  { id: 'tx1', name: 'Diagnostic Services (Standard)', hsnSac: '999316', cgstRate: 9, sgstRate: 9, igstRate: 18, effectiveFrom: '2017-07-01', status: 'active' },
  { id: 'tx2', name: 'Health Checkup Packages', hsnSac: '999316', cgstRate: 9, sgstRate: 9, igstRate: 18, effectiveFrom: '2017-07-01', status: 'active' },
  { id: 'tx3', name: 'Home Collection Charges', hsnSac: '996812', cgstRate: 9, sgstRate: 9, igstRate: 18, effectiveFrom: '2019-01-01', status: 'active' },
  { id: 'tx4', name: 'Exempt — Government Schemes', hsnSac: '999316', cgstRate: 0, sgstRate: 0, igstRate: 0, effectiveFrom: '2020-04-01', status: 'active' },
];

export const mockBillingCodes: BillingCode[] = [
  { id: 'bc1', code: 'LAB-CBC', description: 'Complete Blood Count', category: 'Hematology', linkedTest: 'CBC', status: 'active' },
  { id: 'bc2', code: 'LAB-LIPID', description: 'Lipid Profile Panel', category: 'Biochemistry', linkedTest: 'LIPID', status: 'active' },
  { id: 'bc3', code: 'PKG-BASIC', description: 'Basic Health Checkup Package', category: 'Packages', status: 'active' },
  { id: 'bc4', code: 'SVC-HOME', description: 'Home Sample Collection', category: 'Services', status: 'active' },
  { id: 'bc5', code: 'SVC-REPORT', description: 'Express Report Delivery', category: 'Services', status: 'active' },
  { id: 'bc6', code: 'LAB-PSA', description: 'PSA Total (Discontinued)', category: 'Oncology', linkedTest: 'PSA', status: 'inactive' },
];

export const mockSpecialties: Specialty[] = [
  { id: 'sp1', code: 'CLIN-PATH', name: 'Clinical Pathology', departmentCount: 2, testCount: 45, status: 'active' },
  { id: 'sp2', code: 'CLIN-CHEM', name: 'Clinical Chemistry', departmentCount: 1, testCount: 82, status: 'active' },
  { id: 'sp3', code: 'ENDO', name: 'Endocrinology', departmentCount: 1, testCount: 28, status: 'active' },
  { id: 'sp4', code: 'ONCO', name: 'Oncology Markers', departmentCount: 1, testCount: 18, status: 'active' },
  { id: 'sp5', code: 'MICRO', name: 'Microbiology', departmentCount: 1, testCount: 34, status: 'active' },
  { id: 'sp6', code: 'MOLEC', name: 'Molecular Diagnostics', departmentCount: 1, testCount: 12, status: 'active' },
];

export const mockDepartments: Department[] = [
  { id: 'd1', code: 'HEMA', name: 'Hematology', head: 'Dr. Anita Desai', testCount: 32, status: 'active' },
  { id: 'd2', code: 'BIOCHEM', name: 'Biochemistry', head: 'Dr. Ravi Mehta', testCount: 78, status: 'active' },
  { id: 'd3', code: 'IMMUNO', name: 'Immunoassay', head: 'Dr. Lakshmi Rao', testCount: 45, status: 'active' },
  { id: 'd4', code: 'MICRO', name: 'Microbiology', head: 'Dr. Karthik Iyer', testCount: 34, status: 'active' },
  { id: 'd5', code: 'HISTO', name: 'Histopathology', head: 'Dr. Priya Nair', testCount: 22, status: 'active' },
  { id: 'd6', code: 'MOLEC', name: 'Molecular Biology', head: 'Dr. Sanjay Gupta', testCount: 12, status: 'inactive' },
];

export const mockGeography: StateMaster[] = [
  {
    id: 'st1', code: 'MH', name: 'Maharashtra', gstCode: '27',
    cities: [
      { id: 'c1', name: 'Mumbai', pincodePrefix: '400' },
      { id: 'c2', name: 'Pune', pincodePrefix: '411' },
      { id: 'c3', name: 'Nagpur', pincodePrefix: '440' },
    ],
  },
  {
    id: 'st2', code: 'DL', name: 'Delhi', gstCode: '07',
    cities: [
      { id: 'c4', name: 'New Delhi', pincodePrefix: '110' },
      { id: 'c5', name: 'South Delhi', pincodePrefix: '110' },
    ],
  },
  {
    id: 'st3', code: 'KA', name: 'Karnataka', gstCode: '29',
    cities: [
      { id: 'c6', name: 'Bangalore', pincodePrefix: '560' },
      { id: 'c7', name: 'Mysore', pincodePrefix: '570' },
    ],
  },
  {
    id: 'st4', code: 'TN', name: 'Tamil Nadu', gstCode: '33',
    cities: [
      { id: 'c8', name: 'Chennai', pincodePrefix: '600' },
      { id: 'c9', name: 'Coimbatore', pincodePrefix: '641' },
    ],
  },
  {
    id: 'st5', code: 'GJ', name: 'Gujarat', gstCode: '24',
    cities: [
      { id: 'c10', name: 'Ahmedabad', pincodePrefix: '380' },
      { id: 'c11', name: 'Surat', pincodePrefix: '395' },
    ],
  },
];

export function getTestById(id: string): TestMaster | undefined {
  return mockTests.find((t) => t.id === id);
}
