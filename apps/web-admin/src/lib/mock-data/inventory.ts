import type {
  Consumable,
  ExpiryAlert,
  InventoryDashboardStats,
  Kit,
  PurchaseOrder,
  Reagent,
  StockTransfer,
  Vendor,
} from '@/types';

export const mockInventoryDashboardStats: InventoryDashboardStats = {
  totalItems: 1842,
  lowStock: 23,
  expiringSoon: 15,
  openPurchaseOrders: 7,
  totalItemsTrend: 4.2,
  lowStockTrend: -12.5,
  expiringTrend: 8.0,
  poTrend: 16.7,
};

export const mockReagents: Reagent[] = [
  { id: 'rg1', code: 'RGT-CBC-001', name: 'CBC Reagent Pack', vendor: 'Sysmex India', department: 'Hematology', currentStock: 45, minStock: 20, unit: 'packs', lotNumber: 'LOT-2026-0412', expiryDate: '2026-09-15', status: 'in-stock', branch: 'Mumbai Central Lab' },
  { id: 'rg2', code: 'RGT-GLU-002', name: 'Glucose Oxidase Reagent', vendor: 'Roche Diagnostics', department: 'Biochemistry', currentStock: 8, minStock: 15, unit: 'bottles', lotNumber: 'LOT-2026-0389', expiryDate: '2026-07-20', status: 'low-stock', branch: 'Mumbai Central Lab' },
  { id: 'rg3', code: 'RGT-HBA1C-003', name: 'HbA1c Reagent Kit', vendor: 'Abbott', department: 'Biochemistry', currentStock: 0, minStock: 10, unit: 'kits', lotNumber: 'LOT-2026-0355', expiryDate: '2026-08-01', status: 'out-of-stock', branch: 'Delhi NCR Diagnostic' },
  { id: 'rg4', code: 'RGT-TSH-004', name: 'TSH ELISA Reagent', vendor: 'Siemens Healthineers', department: 'Immunoassay', currentStock: 22, minStock: 12, unit: 'kits', lotNumber: 'LOT-2026-0401', expiryDate: '2026-06-18', status: 'in-stock', branch: 'Bangalore Health Hub' },
  { id: 'rg5', code: 'RGT-URINE-005', name: 'Urine Chemistry Strips', vendor: 'Siemens Healthineers', department: 'Urinalysis', currentStock: 120, minStock: 50, unit: 'strips', lotNumber: 'LOT-2025-1201', expiryDate: '2026-05-28', status: 'expired', branch: 'Chennai South Branch' },
];

export const mockKits: Kit[] = [
  { id: 'kt1', code: 'KIT-LIPID-001', name: 'Lipid Profile Kit', testPanel: 'Lipid Profile', components: 4, currentStock: 30, minStock: 15, expiryDate: '2026-10-30', status: 'in-stock', branch: 'Mumbai Central Lab' },
  { id: 'kt2', code: 'KIT-LFT-002', name: 'Liver Function Kit', testPanel: 'LFT', components: 6, currentStock: 5, minStock: 10, expiryDate: '2026-08-15', status: 'low-stock', branch: 'Delhi NCR Diagnostic' },
  { id: 'kt3', code: 'KIT-THY-003', name: 'Thyroid Panel Kit', testPanel: 'T3, T4, TSH', components: 3, currentStock: 18, minStock: 8, expiryDate: '2026-11-20', status: 'in-stock', branch: 'Bangalore Health Hub' },
  { id: 'kt4', code: 'KIT-CARD-004', name: 'Cardiac Marker Kit', testPanel: 'Troponin I, CK-MB', components: 2, currentStock: 0, minStock: 5, expiryDate: '2026-07-10', status: 'out-of-stock', branch: 'Mumbai Central Lab' },
];

export const mockConsumables: Consumable[] = [
  { id: 'cs1', code: 'CON-TUBE-001', name: 'EDTA Vacutainer 3ml', category: 'Collection Tubes', currentStock: 2500, minStock: 500, unit: 'pieces', status: 'in-stock', branch: 'Mumbai Central Lab' },
  { id: 'cs2', code: 'CON-TUBE-002', name: 'Serum Separator Tube', category: 'Collection Tubes', currentStock: 180, minStock: 400, unit: 'pieces', status: 'low-stock', branch: 'Delhi NCR Diagnostic' },
  { id: 'cs3', code: 'CON-TIP-003', name: 'Pipette Tips 200µL', category: 'Lab Supplies', currentStock: 12000, minStock: 3000, unit: 'pieces', status: 'in-stock', branch: 'Bangalore Health Hub' },
  { id: 'cs4', code: 'CON-GLOVE-004', name: 'Nitrile Gloves (M)', category: 'PPE', currentStock: 0, minStock: 200, unit: 'boxes', status: 'out-of-stock', branch: 'Chennai South Branch' },
  { id: 'cs5', code: 'CON-SWAB-005', name: 'Nasopharyngeal Swabs', category: 'Collection', currentStock: 450, minStock: 100, unit: 'pieces', status: 'in-stock', branch: 'Mumbai Central Lab' },
];

export const mockVendors: Vendor[] = [
  { id: 'vn1', code: 'VND-SYSMEX', name: 'Sysmex India Pvt Ltd', contactPerson: 'Mr. Anil Mehta', email: 'sales@sysmex.in', phone: '+91 22 6789 4500', category: 'Hematology', rating: 4.8, status: 'active' },
  { id: 'vn2', code: 'VND-ROCHE', name: 'Roche Diagnostics India', contactPerson: 'Ms. Priya Nair', email: 'orders@roche.in', phone: '+91 80 2852 1000', category: 'Biochemistry', rating: 4.9, status: 'active' },
  { id: 'vn3', code: 'VND-ABBOTT', name: 'Abbott India Ltd', contactPerson: 'Mr. Rajesh Gupta', email: 'diagnostics@abbott.in', phone: '+91 22 3090 7000', category: 'Immunoassay', rating: 4.6, status: 'active' },
  { id: 'vn4', code: 'VND-MEDSUP', name: 'MedSupply Distributors', contactPerson: 'Mr. Suresh Patel', email: 'info@medsupply.in', phone: '+91 79 2640 3300', category: 'Consumables', rating: 3.9, status: 'inactive' },
  { id: 'vn5', code: 'VND-LABCHEM', name: 'LabChem Solutions', contactPerson: 'Ms. Kavita Rao', email: 'support@labchem.in', phone: '+91 44 4210 5500', category: 'Reagents', rating: 2.1, status: 'blacklisted' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2026-0142', vendorName: 'Roche Diagnostics India', items: 5, totalAmount: 285000, status: 'approved', orderedAt: '2026-06-05', expectedDelivery: '2026-06-15', branch: 'Mumbai Central Lab' },
  { id: 'po2', poNumber: 'PO-2026-0143', vendorName: 'Sysmex India Pvt Ltd', items: 3, totalAmount: 156000, status: 'submitted', orderedAt: '2026-06-07', expectedDelivery: '2026-06-20', branch: 'Delhi NCR Diagnostic' },
  { id: 'po3', poNumber: 'PO-2026-0144', vendorName: 'Abbott India Ltd', items: 8, totalAmount: 420000, status: 'draft', orderedAt: '2026-06-08', expectedDelivery: '2026-06-25', branch: 'Bangalore Health Hub' },
  { id: 'po4', poNumber: 'PO-2026-0138', vendorName: 'MedSupply Distributors', items: 12, totalAmount: 45000, status: 'received', orderedAt: '2026-05-28', expectedDelivery: '2026-06-05', branch: 'Mumbai Central Lab' },
  { id: 'po5', poNumber: 'PO-2026-0135', vendorName: 'Roche Diagnostics India', items: 2, totalAmount: 98000, status: 'cancelled', orderedAt: '2026-05-20', expectedDelivery: '2026-06-01', branch: 'Chennai South Branch' },
];

export const mockStockTransfers: StockTransfer[] = [
  { id: 'st1', transferNumber: 'TRF-2026-0089', fromBranch: 'Mumbai Central Lab', toBranch: 'Delhi NCR Diagnostic', items: 15, status: 'in-transit', initiatedAt: '2026-06-07', initiatedBy: 'Store Manager - Mumbai' },
  { id: 'st2', transferNumber: 'TRF-2026-0088', fromBranch: 'Bangalore Health Hub', toBranch: 'Chennai South Branch', items: 8, status: 'received', initiatedAt: '2026-06-04', receivedAt: '2026-06-06', initiatedBy: 'Store Manager - Bangalore' },
  { id: 'st3', transferNumber: 'TRF-2026-0090', fromBranch: 'Mumbai Central Lab', toBranch: 'Bangalore Health Hub', items: 22, status: 'pending', initiatedAt: '2026-06-08', initiatedBy: 'Store Manager - Mumbai' },
  { id: 'st4', transferNumber: 'TRF-2026-0085', fromBranch: 'Delhi NCR Diagnostic', toBranch: 'Mumbai Central Lab', items: 5, status: 'cancelled', initiatedAt: '2026-05-30', initiatedBy: 'Store Manager - Delhi' },
];

export const mockExpiryAlerts: ExpiryAlert[] = [
  { id: 'ea1', itemCode: 'RGT-URINE-005', itemName: 'Urine Chemistry Strips', itemType: 'reagent', lotNumber: 'LOT-2025-1201', expiryDate: '2026-05-28', daysRemaining: -11, quantity: 120, branch: 'Chennai South Branch', severity: 'critical' },
  { id: 'ea2', itemCode: 'RGT-TSH-004', itemName: 'TSH ELISA Reagent', itemType: 'reagent', lotNumber: 'LOT-2026-0401', expiryDate: '2026-06-18', daysRemaining: 10, quantity: 22, branch: 'Bangalore Health Hub', severity: 'warning' },
  { id: 'ea3', itemCode: 'KIT-LFT-002', itemName: 'Liver Function Kit', itemType: 'kit', lotNumber: 'LOT-2026-0312', expiryDate: '2026-06-25', daysRemaining: 17, quantity: 5, branch: 'Delhi NCR Diagnostic', severity: 'warning' },
  { id: 'ea4', itemCode: 'RGT-GLU-002', itemName: 'Glucose Oxidase Reagent', itemType: 'reagent', lotNumber: 'LOT-2026-0389', expiryDate: '2026-07-20', daysRemaining: 42, quantity: 8, branch: 'Mumbai Central Lab', severity: 'warning' },
  { id: 'ea5', itemCode: 'KIT-CARD-004', itemName: 'Cardiac Marker Kit', itemType: 'kit', lotNumber: 'LOT-2026-0298', expiryDate: '2026-07-10', daysRemaining: 32, quantity: 3, branch: 'Mumbai Central Lab', severity: 'warning' },
];
