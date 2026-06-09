'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { commercialApi } from '@/lib/api/commercial';
import { formatCurrency } from '@/lib/mock-data';
import type { CommercialRevenue } from '@/types';

const columns: ColumnDef<CommercialRevenue>[] = [
  { accessorKey: 'period', header: 'Period' },
  { accessorKey: 'mrr', header: 'MRR', cell: ({ row }) => formatCurrency(row.original.mrr) },
  { accessorKey: 'arr', header: 'ARR', cell: ({ row }) => formatCurrency(row.original.arr) },
  { accessorKey: 'newBusiness', header: 'New Business', cell: ({ row }) => formatCurrency(row.original.newBusiness) },
  { accessorKey: 'churn', header: 'Churn', cell: ({ row }) => formatCurrency(row.original.churn) },
  { accessorKey: 'netRevenue', header: 'Net Revenue', cell: ({ row }) => formatCurrency(row.original.netRevenue) },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['commercial-revenue'],
    queryFn: () => commercialApi.listRevenue(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Revenue Analytics" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="period" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
