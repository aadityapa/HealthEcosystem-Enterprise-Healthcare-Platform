'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';
import { formatDate } from '@/lib/mock-data';
import type { PredictiveInsight } from '@/types';

const columns: ColumnDef<PredictiveInsight>[] = [
  { accessorKey: 'title', header: 'Insight' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'confidence', header: 'Confidence', cell: ({ row }) => `${row.original.confidence > 0 ? '+' : ''}${row.original.confidence}%` },
  { accessorKey: 'impact', header: 'Impact', cell: ({ row }) => <GenericStatusBadge value={String(row.original.impact)} /> },
  { accessorKey: 'predictedAt', header: 'Date', cell: ({ row }) => formatDate(row.original.predictedAt) },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-predictive'],
    queryFn: () => analyticsApi.listPredictiveInsights(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Predictive Analytics" description={`AI-powered forecasts and insights ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
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
