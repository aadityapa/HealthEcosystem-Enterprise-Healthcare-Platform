'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus, Receipt } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import type { BillingCode } from '@/types';

const columns: ColumnDef<BillingCode>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-primary">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.description}</span>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'linkedTest',
    header: 'Linked Test',
    cell: ({ row }) => row.original.linkedTest ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function BillingCodesPage() {
  const { data: codes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-billing-codes'],
    queryFn: () => masterDataApi.listBillingCodes(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Billing Codes"
          description="Service and test billing code mappings"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Billing Code
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load billing codes.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={codes}
            searchKey="code"
            searchPlaceholder="Search billing codes..."
            isLoading={isLoading}
            emptyMessage="No billing codes found."
          />
        )}
      </div>
    </PageTransition>
  );
}
