'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fieldApi } from '@/lib/api/field';
import { formatDate } from '@/lib/mock-data';
import type { CollectionRoute } from '@/types';

const columns: ColumnDef<CollectionRoute>[] = [
  { accessorKey: 'routeCode', header: 'Route', cell: ({ row }) => <span className="font-mono text-sm">{row.original.routeCode ?? '—'}</span> },
  { accessorKey: 'phlebotomistName', header: 'Phlebotomist' },
  { accessorKey: 'zone', header: 'Zone' },
  { accessorKey: 'scheduledDate', header: 'Date', cell: ({ row }) => formatDate(row.original.scheduledDate) },
  { accessorKey: 'stops', header: 'Stops', cell: ({ row }) => `${row.original.completedStops}/${row.original.stops}` },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['field-routes'],
    queryFn: () => fieldApi.listRoutes(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Collection Routes" description={`Home collection route planning ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="routeCode" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
