'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fieldApi } from '@/lib/api/field';

import type { FieldTrackingRecord } from '@/types';

const columns: ColumnDef<FieldTrackingRecord>[] = [
  { accessorKey: 'phlebotomistName', header: 'Phlebotomist' },
  { accessorKey: 'currentLocation', header: 'Location' },
  { accessorKey: 'routeCode', header: 'Route', cell: ({ row }) => <span className="font-mono text-sm">{row.original.routeCode ?? '—'}</span> },
  { accessorKey: 'nextStop', header: 'Next Stop' },
  { accessorKey: 'eta', header: 'ETA' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['field-tracking'],
    queryFn: () => fieldApi.listTracking(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Live Tracking" description={`Real-time phlebotomist locations ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="phlebotomistName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
