'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { complianceApi } from '@/lib/api/compliance';

import type { ComplianceRisk } from '@/types';

const columns: ColumnDef<ComplianceRisk>[] = [
  { accessorKey: 'riskCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.riskCode ?? '—'}</span> },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'likelihood', header: 'Likelihood', cell: ({ row }) => <GenericStatusBadge value={String(row.original.likelihood)} /> },
  { accessorKey: 'impact', header: 'Impact', cell: ({ row }) => <GenericStatusBadge value={String(row.original.impact)} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['compliance-risks'],
    queryFn: () => complianceApi.listRisks(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Compliance Risks" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="title" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
