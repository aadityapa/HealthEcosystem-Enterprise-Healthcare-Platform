'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { inventoryApi } from '@/lib/api/inventory';
import { formatDate } from '@/lib/mock-data';
import type { Kit } from '@/types';

const statusMap: Record<Kit['status'], 'approved' | 'pending' | 'critical' | 'inactive'> = {
  'in-stock': 'approved',
  'low-stock': 'pending',
  'out-of-stock': 'critical',
  expired: 'inactive',
};

const columns: ColumnDef<Kit>[] = [
  { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'testPanel', header: 'Test Panel' },
  { accessorKey: 'components', header: 'Components' },
  { accessorKey: 'currentStock', header: 'Stock' },
  { accessorKey: 'expiryDate', header: 'Expiry', cell: ({ row }) => formatDate(row.original.expiryDate) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function KitsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-kits'],
    queryFn: () => inventoryApi.listKits(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Test Kits"
          description={`${data.length} kits across all branches`}
          actions={<Button><Plus className="h-4 w-4" />Add Kit</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load kits.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search kits..." isLoading={isLoading} emptyMessage="No kits found." />
        )}
      </div>
    </PageTransition>
  );
}
