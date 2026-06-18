'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatDate } from '@/lib/mock-data';
import type { Reagent } from '@/types';

const statusMap: Record<Reagent['status'], 'approved' | 'pending' | 'critical' | 'inactive'> = {
  'in-stock': 'approved',
  'low-stock': 'pending',
  'out-of-stock': 'critical',
  expired: 'inactive',
};

const columns: ColumnDef<Reagent>[] = [
  { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'vendor', header: 'Vendor' },
  { accessorKey: 'department', header: 'Department' },
  {
    accessorKey: 'currentStock',
    header: 'Stock',
    cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
  },
  { accessorKey: 'lotNumber', header: 'Lot #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.lotNumber}</span> },
  { accessorKey: 'expiryDate', header: 'Expiry', cell: ({ row }) => formatDate(row.original.expiryDate) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={statusMap[row.original.status]}
        label={row.original.status.replace('-', ' ')}
      />
    ),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function ReagentsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-reagents'],
    queryFn: () => inventoryApi.listReagents(),
  });

  const lowStock = data.filter((r) => r.status === 'low-stock' || r.status === 'out-of-stock').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Reagents"
          description={`${data.length} reagents · ${lowStock} need attention`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Reagent
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load reagents.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search reagents..." isLoading={isLoading} emptyMessage="No reagents found." />
        )}
      </div>
    </PageTransition>
  );
}
