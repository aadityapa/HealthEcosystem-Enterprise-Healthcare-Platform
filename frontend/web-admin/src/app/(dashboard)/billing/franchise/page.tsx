'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Store } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { FranchiseSettlement } from '@/types';

const statusMap: Record<FranchiseSettlement['status'], 'pending' | 'processing' | 'approved'> = {
  pending: 'pending',
  processing: 'processing',
  paid: 'approved',
};

const columns: ColumnDef<FranchiseSettlement>[] = [
  {
    accessorKey: 'franchiseCode',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.franchiseCode}</span>
    ),
  },
  {
    accessorKey: 'franchiseName',
    header: 'Franchise',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.franchiseName}</span>
      </div>
    ),
  },
  { accessorKey: 'period', header: 'Period' },
  {
    accessorKey: 'grossRevenue',
    header: 'Gross Revenue',
    cell: ({ row }) => formatCurrency(row.original.grossRevenue),
  },
  {
    accessorKey: 'royaltyPercent',
    header: 'Royalty %',
    cell: ({ row }) => `${row.original.royaltyPercent}%`,
  },
  {
    accessorKey: 'royaltyAmount',
    header: 'Royalty',
    cell: ({ row }) => formatCurrency(row.original.royaltyAmount),
  },
  {
    accessorKey: 'netPayable',
    header: 'Net Payable',
    cell: ({ row }) => formatCurrency(row.original.netPayable),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function FranchisePage() {
  const { data: settlements = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-franchise'],
    queryFn: () => billingApi.listFranchiseSettlements(),
  });

  const dueCount = settlements.filter((s) => s.status === 'pending').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Franchise Settlements"
          description={`${dueCount} settlements pending of ${settlements.length} total`}
          actions={
            <Button>
              <Store className="h-4 w-4" />
              Process Settlement
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load franchise settlements.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={settlements}
            searchKey="franchiseName"
            searchPlaceholder="Search franchises..."
            isLoading={isLoading}
            emptyMessage="No franchise settlements found."
          />
        )}
      </div>
    </PageTransition>
  );
}
