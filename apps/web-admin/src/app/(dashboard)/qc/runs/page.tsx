'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import { formatDateTime } from '@/lib/mock-data';
import type { QcRun } from '@/types';

const statusMap: Record<QcRun['status'], 'approved' | 'pending' | 'critical'> = {
  'in-range': 'approved',
  warning: 'pending',
  reject: 'critical',
};

const columns: ColumnDef<QcRun>[] = [
  { accessorKey: 'runNumber', header: 'Run #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.runNumber}</span> },
  { accessorKey: 'materialName', header: 'Material' },
  { accessorKey: 'analyte', header: 'Analyte' },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => `${row.original.value} ${row.original.unit}`,
  },
  {
    accessorKey: 'zScore',
    header: 'Z-Score',
    cell: ({ row }) => (
      <span className={Math.abs(row.original.zScore) > 2 ? 'font-medium text-destructive' : ''}>
        {row.original.zScore.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
  { accessorKey: 'device', header: 'Device' },
  { accessorKey: 'operator', header: 'Operator' },
  { accessorKey: 'runAt', header: 'Run At', cell: ({ row }) => formatDateTime(row.original.runAt) },
];

export default function QcRunsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['qc-runs'],
    queryFn: () => qcApi.listRuns(),
  });

  const rejects = data.filter((r) => r.status === 'reject').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="QC Runs"
          description={`${data.length} runs · ${rejects} rejected`}
          actions={<Button><Plus className="h-4 w-4" />Log QC Run</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load QC runs.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="runNumber" searchPlaceholder="Search runs..." isLoading={isLoading} emptyMessage="No QC runs found." />
        )}
      </div>
    </PageTransition>
  );
}
