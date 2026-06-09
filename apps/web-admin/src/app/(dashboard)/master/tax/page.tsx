'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { IndianRupee, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import { formatDate } from '@/lib/mock-data';
import type { TaxMaster } from '@/types';

const columns: ColumnDef<TaxMaster>[] = [
  {
    accessorKey: 'name',
    header: 'Tax Category',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'hsnSac',
    header: 'HSN/SAC',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.hsnSac}</span>
    ),
  },
  {
    accessorKey: 'cgstRate',
    header: 'CGST %',
    cell: ({ row }) => `${row.original.cgstRate}%`,
  },
  {
    accessorKey: 'sgstRate',
    header: 'SGST %',
    cell: ({ row }) => `${row.original.sgstRate}%`,
  },
  {
    accessorKey: 'igstRate',
    header: 'IGST %',
    cell: ({ row }) => `${row.original.igstRate}%`,
  },
  {
    accessorKey: 'effectiveFrom',
    header: 'Effective From',
    cell: ({ row }) => formatDate(row.original.effectiveFrom),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function TaxMasterPage() {
  const { data: taxes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-tax'],
    queryFn: () => masterDataApi.listTaxMasters(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Tax Masters (GST)"
          description="GST rate configuration by HSN/SAC code"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Tax Rate
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load tax masters.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={taxes}
            searchKey="name"
            searchPlaceholder="Search tax categories..."
            isLoading={isLoading}
            emptyMessage="No tax masters configured."
          />
        )}
      </div>
    </PageTransition>
  );
}
