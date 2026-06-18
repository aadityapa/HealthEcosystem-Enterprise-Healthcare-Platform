'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import { formatDate } from '@/lib/mock-data';
import type { QcMaterial } from '@/types';

const statusMap: Record<QcMaterial['status'], 'approved' | 'inactive' | 'critical'> = {
  active: 'approved',
  expired: 'critical',
  retired: 'inactive',
};

const columns: ColumnDef<QcMaterial>[] = [
  { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
  { accessorKey: 'name', header: 'Material' },
  { accessorKey: 'analyte', header: 'Analyte' },
  { accessorKey: 'level', header: 'Level' },
  { accessorKey: 'lotNumber', header: 'Lot #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.lotNumber}</span> },
  {
    accessorKey: 'mean',
    header: 'Mean ± SD',
    cell: ({ row }) => `${row.original.mean} ± ${row.original.sd} ${row.original.unit}`,
  },
  { accessorKey: 'expiryDate', header: 'Expiry', cell: ({ row }) => formatDate(row.original.expiryDate) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function QcMaterialsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['qc-materials'],
    queryFn: () => qcApi.listMaterials(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="QC Materials"
          description={`${data.length} control materials configured`}
          actions={<Button><Plus className="h-4 w-4" />Add Material</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load QC materials.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search materials..." isLoading={isLoading} emptyMessage="No QC materials found." />
        )}
      </div>
    </PageTransition>
  );
}
