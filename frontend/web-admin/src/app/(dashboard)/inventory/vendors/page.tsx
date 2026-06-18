'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import type { Vendor } from '@/types';

const statusMap: Record<Vendor['status'], 'approved' | 'inactive' | 'critical'> = {
  active: 'approved',
  inactive: 'inactive',
  blacklisted: 'critical',
};

const columns: ColumnDef<Vendor>[] = [
  { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
  { accessorKey: 'name', header: 'Vendor' },
  { accessorKey: 'contactPerson', header: 'Contact' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => `${row.original.rating}/5`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function VendorsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-vendors'],
    queryFn: () => inventoryApi.listVendors(),
  });

  const active = data.filter((v) => v.status === 'active').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Vendors"
          description={`${active} active vendors of ${data.length} total`}
          actions={<Button><Plus className="h-4 w-4" />Add Vendor</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load vendors.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search vendors..." isLoading={isLoading} emptyMessage="No vendors found." />
        )}
      </div>
    </PageTransition>
  );
}
