'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { ClipboardList, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import { formatCurrency } from '@/lib/mock-data';
import type { PackageMaster } from '@/types';

const columns: ColumnDef<PackageMaster>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Package Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'testCount',
    header: 'Tests',
    cell: ({ row }) => row.original.testCount.toString(),
  },
  {
    accessorKey: 'listPrice',
    header: 'List Price',
    cell: ({ row }) => formatCurrency(row.original.listPrice),
  },
  {
    accessorKey: 'discountPercent',
    header: 'Discount',
    cell: ({ row }) => `${row.original.discountPercent}%`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function PackageMasterPage() {
  const { data: packages = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-packages'],
    queryFn: () => masterDataApi.listPackages(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Package Master"
          description={`${packages.length} health checkup packages configured`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load packages.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={packages}
            searchKey="name"
            searchPlaceholder="Search packages..."
            isLoading={isLoading}
            emptyMessage="No packages found. Create your first package."
          />
        )}
      </div>
    </PageTransition>
  );
}
