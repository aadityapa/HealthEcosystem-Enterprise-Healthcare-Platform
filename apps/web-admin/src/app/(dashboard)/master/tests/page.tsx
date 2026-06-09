'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus, TestTube2 } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import { formatCurrency } from '@/lib/mock-data';
import type { TestMaster } from '@/types';

const columns: ColumnDef<TestMaster>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-primary">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Test Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TestTube2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'sampleType', header: 'Sample Type' },
  { accessorKey: 'tat', header: 'TAT' },
  {
    accessorKey: 'basePrice',
    header: 'Base Price',
    cell: ({ row }) => formatCurrency(row.original.basePrice),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function TestMasterPage() {
  const { data: tests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-tests'],
    queryFn: () => masterDataApi.listTests(),
  });

  const activeCount = tests.filter((t) => t.status === 'active').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Test Master"
          description={`${activeCount} active tests of ${tests.length} total`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Test
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load test master data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tests}
            searchKey="name"
            searchPlaceholder="Search tests..."
            isLoading={isLoading}
            emptyMessage="No tests configured. Add your first test to get started."
          />
        )}
      </div>
    </PageTransition>
  );
}
