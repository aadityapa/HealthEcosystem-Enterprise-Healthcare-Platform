'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { observabilityApi } from '@/lib/api/observability';
import type { ServiceMapNode } from '@/types';

const columns: ColumnDef<ServiceMapNode>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'namespace', header: 'Namespace' },
  { accessorKey: 'health', header: 'Health', cell: ({ row }) => <GenericStatusBadge value={String(row.original.health)} /> },
  { accessorKey: 'requestsPerMin', header: 'Req/min' },
  { accessorKey: 'latencyP95', header: 'P95 (ms)' },
  { accessorKey: 'dependencies', header: 'Dependencies' },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['observability-service-map'],
    queryFn: () => observabilityApi.listServiceMap(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Service Map" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="service" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
