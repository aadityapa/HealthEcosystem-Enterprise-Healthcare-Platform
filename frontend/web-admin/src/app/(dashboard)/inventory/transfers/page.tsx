'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatDate } from '@/lib/mock-data';
import type { StockTransfer } from '@/types';

const statusMap: Record<StockTransfer['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  pending: 'pending',
  'in-transit': 'processing',
  received: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<StockTransfer>[] = [
  { accessorKey: 'transferNumber', header: 'Transfer #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.transferNumber}</span> },
  { accessorKey: 'fromBranch', header: 'From' },
  { accessorKey: 'toBranch', header: 'To' },
  { accessorKey: 'items', header: 'Items' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={statusMap[row.original.status]}
        label={row.original.status.replace('-', ' ')}
      />
    ),
  },
  { accessorKey: 'initiatedAt', header: 'Initiated', cell: ({ row }) => formatDate(row.original.initiatedAt) },
  {
    accessorKey: 'receivedAt',
    header: 'Received',
    cell: ({ row }) => (row.original.receivedAt ? formatDate(row.original.receivedAt) : '—'),
  },
  { accessorKey: 'initiatedBy', header: 'By' },
];

export default function TransfersPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-transfers'],
    queryFn: () => inventoryApi.listTransfers(),
  });

  const inTransit = data.filter((t) => t.status === 'in-transit').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Stock Transfers"
          description={`${inTransit} transfers in transit`}
          actions={<Button><Plus className="h-4 w-4" />New Transfer</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load transfers.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="transferNumber" searchPlaceholder="Search transfers..." isLoading={isLoading} emptyMessage="No transfers found." />
        )}
      </div>
    </PageTransition>
  );
}
