'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';
import { formatCurrency } from '@/lib/mock-data';
import type { TestAnalyticsRow } from '@/types';

const columns: ColumnDef<TestAnalyticsRow>[] = [
  { accessorKey: 'testName', header: 'Test' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'volume', header: 'Volume', cell: ({ row }) => row.original.volume.toLocaleString() },
  { accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => formatCurrency(row.original.revenue) },
  { accessorKey: 'avgPrice', header: 'Avg Price', cell: ({ row }) => formatCurrency(row.original.avgPrice) },
  { accessorKey: 'growth', header: 'Growth', cell: ({ row }) => `${row.original.growth > 0 ? '+' : ''}${row.original.growth}%` },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-tests'],
    queryFn: () => analyticsApi.listTestAnalytics(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Test Analytics" description="Test volume and revenue analysis (${data.length} records)" actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="testName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
