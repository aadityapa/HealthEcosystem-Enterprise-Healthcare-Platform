'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { observabilityApi } from '@/lib/api/observability';
import type { CapacityMetric } from '@/types';

const columns: ColumnDef<CapacityMetric>[] = [
  { accessorKey: 'resource', header: 'Resource' },
  { accessorKey: 'cluster', header: 'Cluster' },
  { accessorKey: 'utilization', header: 'Utilization %', cell: ({ row }) => `${row.original.utilization}%` },
  { accessorKey: 'capacity', header: 'Capacity' },
  { accessorKey: 'forecastDays', header: 'Days to Full' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['observability-capacity'],
    queryFn: () => observabilityApi.listCapacityMetrics(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Capacity Planning" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="resource" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
