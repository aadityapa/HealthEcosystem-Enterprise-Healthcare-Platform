'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus, Receipt } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import { formatDate } from '@/lib/mock-data';
import type { RateCard } from '@/types';

const clientTypeLabels: Record<RateCard['clientType'], string> = {
  retail: 'Retail',
  corporate: 'Corporate',
  insurance: 'Insurance',
  franchise: 'Franchise',
};

const statusMap: Record<RateCard['status'], 'active' | 'pending' | 'inactive'> = {
  active: 'active',
  draft: 'pending',
  expired: 'inactive',
};

const columns: ColumnDef<RateCard>[] = [
  {
    accessorKey: 'name',
    header: 'Rate Card',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'clientType',
    header: 'Client Type',
    cell: ({ row }) => clientTypeLabels[row.original.clientType],
  },
  {
    accessorKey: 'effectiveFrom',
    header: 'Effective From',
    cell: ({ row }) => formatDate(row.original.effectiveFrom),
  },
  {
    accessorKey: 'effectiveTo',
    header: 'Effective To',
    cell: ({ row }) => (row.original.effectiveTo ? formatDate(row.original.effectiveTo) : '—'),
  },
  { accessorKey: 'itemCount', header: 'Items' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function RateCardsPage() {
  const { data: rateCards = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-rate-cards'],
    queryFn: () => masterDataApi.listRateCards(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Rate Cards"
          description={`${rateCards.filter((r) => r.status === 'active').length} active rate cards`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              New Rate Card
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load rate cards.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rateCards}
            searchKey="name"
            searchPlaceholder="Search rate cards..."
            isLoading={isLoading}
            emptyMessage="No rate cards found."
          />
        )}
      </div>
    </PageTransition>
  );
}
