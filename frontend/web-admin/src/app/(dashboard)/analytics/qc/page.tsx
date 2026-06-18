'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';

import type { QcAnalyticsRow } from '@/types';

const columns: ColumnDef<QcAnalyticsRow>[] = [
  { accessorKey: 'analyte', header: 'Analyte' },
  { accessorKey: 'runs', header: 'Runs' },
  { accessorKey: 'passRate', header: 'Pass Rate', cell: ({ row }) => `${row.original.passRate > 0 ? '+' : ''}${row.original.passRate}%` },
  { accessorKey: 'failures', header: 'Failures' },
  { accessorKey: 'trend', header: 'Trend', cell: ({ row }) => `${row.original.trend > 0 ? '+' : ''}${row.original.trend}%` },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-qc'],
    queryFn: () => analyticsApi.listQcAnalytics(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="QC Analytics" description="Quality control performance metrics (${data.length} records)" actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="analyte" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
