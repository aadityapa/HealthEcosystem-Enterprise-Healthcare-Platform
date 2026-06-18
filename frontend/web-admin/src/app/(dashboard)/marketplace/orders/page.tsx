'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { marketplaceApi } from '@/lib/api/marketplace';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { MarketplaceOrder } from '@/types';

const columns: ColumnDef<MarketplaceOrder>[] = [
  { accessorKey: 'orderNumber', header: 'Order #', cell: ({ row }) => <span className="font-mono text-sm">{row.original.orderNumber ?? '—'}</span> },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'listingTitle', header: 'Listing' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
  { accessorKey: 'orderedAt', header: 'Date', cell: ({ row }) => formatDate(row.original.orderedAt) },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['marketplace-orders'],
    queryFn: () => marketplaceApi.listOrders(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Marketplace Orders" description={`Customer orders and fulfillment ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="customerName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
