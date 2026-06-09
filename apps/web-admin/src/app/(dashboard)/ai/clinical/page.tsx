'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { aiApi } from '@/lib/api/ai';

import type { ClinicalAiInsight } from '@/types';

const columns: ColumnDef<ClinicalAiInsight>[] = [
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'testName', header: 'Test' },
  { accessorKey: 'insightType', header: 'Type' },
  { accessorKey: 'severity', header: 'Severity', cell: ({ row }) => <GenericStatusBadge value={String(row.original.severity)} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
  { accessorKey: 'detectedAt', header: 'Detected', cell: ({ row }) => new Date(row.original.detectedAt).toLocaleString() },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-clinical'],
    queryFn: () => aiApi.listClinicalInsights(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Clinical AI" description={`AI-detected clinical insights and anomalies ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
