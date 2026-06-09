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
import { AlertTriangle, ArrowRightLeft, Boxes, Package, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { ExpiryAlert, PurchaseOrder } from '@/types';

const stockStatusMap: Record<ExpiryAlert['severity'], 'pending' | 'critical'> = {
  warning: 'pending',
  critical: 'critical',
};

const poStatusMap: Record<
  PurchaseOrder['status'],
  'pending' | 'processing' | 'approved' | 'inactive'
> = {
  draft: 'inactive',
  submitted: 'pending',
  approved: 'processing',
  received: 'approved',
  cancelled: 'inactive',
};

const expiryColumns: ColumnDef<ExpiryAlert>[] = [
  { accessorKey: 'itemCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.itemCode}</span> },
  { accessorKey: 'itemName', header: 'Item' },
  { accessorKey: 'itemType', header: 'Type', cell: ({ row }) => row.original.itemType.charAt(0).toUpperCase() + row.original.itemType.slice(1) },
  { accessorKey: 'expiryDate', header: 'Expiry', cell: ({ row }) => formatDate(row.original.expiryDate) },
  {
    accessorKey: 'daysRemaining',
    header: 'Days Left',
    cell: ({ row }) => (
      <span className={row.original.daysRemaining < 0 ? 'text-destructive font-medium' : ''}>
        {row.original.daysRemaining < 0 ? `${Math.abs(row.original.daysRemaining)}d overdue` : `${row.original.daysRemaining}d`}
      </span>
    ),
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => (
      <StatusBadge status={stockStatusMap[row.original.severity]} label={row.original.severity} />
    ),
  },
];

const poColumns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: 'poNumber', header: 'PO #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.poNumber}</span> },
  { accessorKey: 'vendorName', header: 'Vendor' },
  { accessorKey: 'items', header: 'Items' },
  { accessorKey: 'totalAmount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.totalAmount) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={poStatusMap[row.original.status]}
        label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      />
    ),
  },
  { accessorKey: 'expectedDelivery', header: 'Expected', cell: ({ row }) => formatDate(row.original.expectedDelivery) },
];

export default function InventoryDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['inventory-stats'], queryFn: () => inventoryApi.getDashboardStats() });
  const expiryQuery = useQuery({ queryKey: ['inventory-expiry'], queryFn: () => inventoryApi.listExpiryAlerts() });
  const poQuery = useQuery({ queryKey: ['inventory-purchase-orders'], queryFn: () => inventoryApi.listPurchaseOrders() });

  const isError = statsQuery.isError || expiryQuery.isError || poQuery.isError;

  if (isError) {
    return (
      <PageTransition>
        <ErrorState
          title="Failed to load inventory dashboard"
          message="Could not fetch inventory data. Please try again."
          onRetry={() => {
            statsQuery.refetch();
            expiryQuery.refetch();
            poQuery.refetch();
          }}
        />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const expiryAlerts = (expiryQuery.data ?? []).slice(0, 5);
  const openPOs = (poQuery.data ?? []).filter((po) => po.status !== 'received' && po.status !== 'cancelled').slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Inventory Dashboard"
          description="Stock levels, expiry alerts, and purchase orders"
          actions={
            <Button onClick={() => router.push('/inventory/purchase-orders')}>
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          }
        />

        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Items" value={stats.totalItems.toLocaleString()} icon={Boxes} trend={{ value: stats.totalItemsTrend, label: 'vs last month' }} />
            <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} trend={{ value: stats.lowStockTrend, label: 'items' }} />
            <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={Package} trend={{ value: stats.expiringTrend, label: 'within 30 days' }} />
            <StatCard title="Open POs" value={stats.openPurchaseOrders} icon={ShoppingCart} trend={{ value: stats.poTrend, label: 'vs last week' }} />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Expiry Alerts
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/inventory/expiry')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable columns={expiryColumns} data={expiryAlerts} isLoading={expiryQuery.isLoading} emptyMessage="No expiry alerts." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Open Purchase Orders
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/inventory/purchase-orders')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable columns={poColumns} data={openPOs} isLoading={poQuery.isLoading} emptyMessage="No open purchase orders." />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
