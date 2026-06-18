'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { PurchaseOrder } from '@/types';

const statusMap: Record<PurchaseOrder['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  draft: 'inactive',
  submitted: 'pending',
  approved: 'processing',
  received: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: 'poNumber', header: 'PO #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.poNumber}</span> },
  { accessorKey: 'vendorName', header: 'Vendor' },
  { accessorKey: 'items', header: 'Items' },
  { accessorKey: 'totalAmount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.totalAmount) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={statusMap[row.original.status]}
        label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      />
    ),
  },
  { accessorKey: 'orderedAt', header: 'Ordered', cell: ({ row }) => formatDate(row.original.orderedAt) },
  { accessorKey: 'expectedDelivery', header: 'Expected', cell: ({ row }) => formatDate(row.original.expectedDelivery) },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function PurchaseOrdersPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-purchase-orders'],
    queryFn: () => inventoryApi.listPurchaseOrders(),
  });

  const totalValue = data.reduce((sum, po) => sum + po.totalAmount, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Purchase Orders"
          description={`${formatCurrency(totalValue)} across ${data.length} orders`}
          actions={<Button><Plus className="h-4 w-4" />Create PO</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load purchase orders.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="poNumber" searchPlaceholder="Search POs..." isLoading={isLoading} emptyMessage="No purchase orders found." />
        )}
      </div>
    </PageTransition>
  );
}
