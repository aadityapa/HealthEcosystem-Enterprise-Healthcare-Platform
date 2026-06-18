'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { marketplaceApi } from '@/lib/api/marketplace';
import { formatDate } from '@/lib/mock-data';
import type { MarketplaceCamp } from '@/types';

const columns: ColumnDef<MarketplaceCamp>[] = [
  { accessorKey: 'campCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.campCode ?? '—'}</span> },
  { accessorKey: 'name', header: 'Camp' },
  { accessorKey: 'partnerName', header: 'Partner' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'scheduledDate', header: 'Date', cell: ({ row }) => formatDate(row.original.scheduledDate) },
  { accessorKey: 'slotsBooked', header: 'Booked', cell: ({ row }) => `${row.original.slotsBooked}/${row.original.slotsAvailable}` },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['marketplace-camps'],
    queryFn: () => marketplaceApi.listCamps(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Marketplace Camps" description={`Health camps and screening events ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
