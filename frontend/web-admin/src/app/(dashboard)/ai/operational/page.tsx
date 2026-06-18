'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { aiApi } from '@/lib/api/ai';

import type { OperationalAiInsight } from '@/types';

const columns: ColumnDef<OperationalAiInsight>[] = [
  { accessorKey: 'area', header: 'Area' },
  { accessorKey: 'insightType', header: 'Type' },
  { accessorKey: 'impact', header: 'Impact', cell: ({ row }) => <GenericStatusBadge value={String(row.original.impact)} /> },
  { accessorKey: 'description', header: 'Description', cell: ({ row }) => <span className="max-w-xs truncate block">{row.original.description}</span> },
  { accessorKey: 'detectedAt', header: 'Detected', cell: ({ row }) => new Date(row.original.detectedAt).toLocaleString() },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-operational'],
    queryFn: () => aiApi.listOperationalInsights(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Operational AI" description={`Operational intelligence and recommendations ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="area" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
