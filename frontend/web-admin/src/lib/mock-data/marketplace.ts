import type {
  MarketplaceCamp,
  MarketplaceDashboardStats,
  MarketplaceListing,
  MarketplaceOrder,
  MarketplacePartner,
  WellnessPackage,
} from '@/types';

export const mockMarketplaceDashboardStats: MarketplaceDashboardStats = {
  activeListings: 156,
  partnerCount: 42,
  ordersThisMonth: 1284,
  revenueThisMonth: 3850000,
  listingsTrend: 12.0,
  partnersTrend: 8.5,
  ordersTrend: 18.2,
  revenueTrend: 22.4,
};

export const mockMarketplaceListings: MarketplaceListing[] = [
  { id: 'lst1', listingCode: 'LST-00142', title: 'Complete Health Checkup - Basic', category: 'Health Packages', price: 2499, provider: 'HealthEcosystem Labs', rating: 4.8, status: 'active' },
  { id: 'lst2', listingCode: 'LST-00089', title: 'Diabetes Care Panel', category: 'Diagnostic Tests', price: 1899, provider: 'HealthEcosystem Labs', rating: 4.7, status: 'active' },
  { id: 'lst3', listingCode: 'LST-00201', title: 'Home Collection - Mumbai', category: 'Services', price: 200, provider: 'HealthEcosystem Labs', rating: 4.9, status: 'active' },
  { id: 'lst4', listingCode: 'LST-00056', title: 'Cardiac Screening Package', category: 'Health Packages', price: 4999, provider: 'Apollo Partner Clinic', rating: 4.5, status: 'active' },
  { id: 'lst5', listingCode: 'LST-00315', title: 'Vitamin D Test', category: 'Diagnostic Tests', price: 1500, provider: 'HealthEcosystem Labs', rating: 4.6, status: 'draft' },
];

export const mockMarketplacePartners: MarketplacePartner[] = [
  { id: 'pt1', partnerCode: 'PTR-001', name: 'Apollo Clinics Network', type: 'clinic', city: 'Mumbai', listingsCount: 24, ordersYtd: 3420, status: 'active' },
  { id: 'pt2', partnerCode: 'PTR-002', name: 'Wellness First Pharmacy', type: 'pharmacy', city: 'Bangalore', listingsCount: 12, ordersYtd: 890, status: 'active' },
  { id: 'pt3', partnerCode: 'PTR-003', name: 'FitLife Wellness Center', type: 'wellness', city: 'Delhi', listingsCount: 8, ordersYtd: 560, status: 'active' },
  { id: 'pt4', partnerCode: 'PTR-004', name: 'City Diagnostic Lab', type: 'lab', city: 'Pune', listingsCount: 18, ordersYtd: 1240, status: 'pending' },
  { id: 'pt5', partnerCode: 'PTR-005', name: 'MedPlus Pharmacy Chain', type: 'pharmacy', city: 'Chennai', listingsCount: 0, ordersYtd: 0, status: 'suspended' },
];

export const mockMarketplaceOrders: MarketplaceOrder[] = [
  { id: 'ord1', orderNumber: 'MKT-2026-4521', customerName: 'Priya Sharma', listingTitle: 'Complete Health Checkup - Basic', amount: 2499, orderedAt: '2026-06-08', status: 'confirmed' },
  { id: 'ord2', orderNumber: 'MKT-2026-4522', customerName: 'Rajesh Kumar', listingTitle: 'Diabetes Care Panel', amount: 1899, orderedAt: '2026-06-08', status: 'pending' },
  { id: 'ord3', orderNumber: 'MKT-2026-4523', customerName: 'Ananya Patel', listingTitle: 'Home Collection - Mumbai', amount: 200, orderedAt: '2026-06-07', status: 'fulfilled' },
  { id: 'ord4', orderNumber: 'MKT-2026-4520', customerName: 'Vikram Singh', listingTitle: 'Cardiac Screening Package', amount: 4999, orderedAt: '2026-06-06', status: 'fulfilled' },
  { id: 'ord5', orderNumber: 'MKT-2026-4518', customerName: 'Lakshmi Reddy', listingTitle: 'Vitamin D Test', amount: 1500, orderedAt: '2026-06-05', status: 'cancelled' },
];

export const mockWellnessPackages: WellnessPackage[] = [
  { id: 'wp1', packageCode: 'WLP-001', name: 'Executive Health Plus', description: 'Comprehensive executive screening with 60+ parameters', testsIncluded: 62, price: 5999, soldCount: 890, status: 'active' },
  { id: 'wp2', packageCode: 'WLP-002', name: 'Women\'s Wellness Panel', description: 'Complete women\'s health screening including hormonal profile', testsIncluded: 35, price: 4499, soldCount: 456, status: 'active' },
  { id: 'wp3', packageCode: 'WLP-003', name: 'Senior Citizen Care', description: 'Age-appropriate health screening for 60+ patients', testsIncluded: 28, price: 3499, soldCount: 312, status: 'active' },
  { id: 'wp4', packageCode: 'WLP-004', name: 'Sports Fitness Panel', description: 'Athletic performance and recovery markers', testsIncluded: 22, price: 2999, soldCount: 128, status: 'active' },
  { id: 'wp5', packageCode: 'WLP-005', name: 'Pre-Employment Check', description: 'Standard pre-employment health screening', testsIncluded: 15, price: 1999, soldCount: 0, status: 'inactive' },
];

export const mockMarketplaceCamps: MarketplaceCamp[] = [
  { id: 'mc1', campCode: 'MC-2026-042', name: 'Corporate Wellness Camp - TCS', partnerName: 'Apollo Clinics Network', location: 'TCS Campus, Pune', scheduledDate: '2026-06-15', slotsAvailable: 500, slotsBooked: 312, status: 'upcoming' },
  { id: 'mc2', campCode: 'MC-2026-043', name: 'Diabetes Awareness Drive', partnerName: 'FitLife Wellness Center', location: 'Community Hall, Delhi', scheduledDate: '2026-06-10', slotsAvailable: 200, slotsBooked: 185, status: 'ongoing' },
  { id: 'mc3', campCode: 'MC-2026-041', name: 'Women\'s Health Camp', partnerName: 'HealthEcosystem Labs', location: 'Bangalore Health Hub', scheduledDate: '2026-06-01', slotsAvailable: 150, slotsBooked: 148, status: 'completed' },
  { id: 'mc4', campCode: 'MC-2026-044', name: 'Senior Citizen Screening', partnerName: 'City Diagnostic Lab', location: 'Senior Center, Chennai', scheduledDate: '2026-06-22', slotsAvailable: 100, slotsBooked: 45, status: 'upcoming' },
  { id: 'mc5', campCode: 'MC-2026-038', name: 'School Health Checkup', partnerName: 'MedPlus Pharmacy Chain', location: 'DPS School, Mumbai', scheduledDate: '2026-05-20', slotsAvailable: 300, slotsBooked: 0, status: 'cancelled' },
];
