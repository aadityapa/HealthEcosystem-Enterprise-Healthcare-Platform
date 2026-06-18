'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import { Handshake, IndianRupee, Package, ShoppingBag, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { marketplaceApi } from '@/lib/api/marketplace';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { MarketplaceOrder } from '@/types';

const statusMap: Record<MarketplaceOrder['status'], 'pending' | 'processing' | 'approved' | 'inactive' | 'critical'> = {
  pending: 'pending',
  confirmed: 'processing',
  fulfilled: 'approved',
  cancelled: 'inactive',
  refunded: 'critical',
};

const columns: ColumnDef<MarketplaceOrder>[] = [
  { accessorKey: 'orderNumber', header: 'Order #', cell: ({ row }) => <span className="font-mono text-sm">{row.original.orderNumber}</span> },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'listingTitle', header: 'Listing' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />,
  },
  { accessorKey: 'orderedAt', header: 'Date', cell: ({ row }) => formatDate(row.original.orderedAt) },
];

export default function MarketplaceDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['marketplace-stats'], queryFn: () => marketplaceApi.getDashboardStats() });
  const ordersQuery = useQuery({ queryKey: ['marketplace-orders'], queryFn: () => marketplaceApi.listOrders() });

  if (statsQuery.isError || ordersQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load marketplace dashboard" message="Could not fetch marketplace data." onRetry={() => { statsQuery.refetch(); ordersQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentOrders = (ordersQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Marketplace Dashboard" description="Health marketplace, partners, and wellness packages" actions={<Button onClick={() => router.push('/marketplace/listings')}><Package className="h-4 w-4" />Listings</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Listings" value={stats.activeListings} icon={Store} trend={{ value: stats.listingsTrend, label: 'vs last month' }} />
            <StatCard title="Partners" value={stats.partnerCount} icon={Handshake} trend={{ value: stats.partnersTrend, label: 'network growth' }} />
            <StatCard title="Orders (Month)" value={stats.ordersThisMonth.toLocaleString()} icon={ShoppingBag} trend={{ value: stats.ordersTrend, label: 'vs last month' }} />
            <StatCard title="Revenue (Month)" value={formatCurrency(stats.revenueThisMonth)} icon={IndianRupee} trend={{ value: stats.revenueTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" />Recent Orders</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/marketplace/orders')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentOrders} isLoading={ordersQuery.isLoading} emptyMessage="No orders yet." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
