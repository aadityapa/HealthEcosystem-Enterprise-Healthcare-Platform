'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import { formatDate } from '@/lib/mock-data';
import type { CapaRecord } from '@/types';

const priorityMap: Record<CapaRecord['priority'], 'inactive' | 'pending' | 'processing' | 'critical'> = {
  low: 'inactive',
  medium: 'pending',
  high: 'processing',
  critical: 'critical',
};

const statusMap: Record<CapaRecord['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  open: 'pending',
  investigating: 'processing',
  'corrective-action': 'processing',
  closed: 'approved',
};

const columns: ColumnDef<CapaRecord>[] = [
  { accessorKey: 'capaNumber', header: 'CAPA #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.capaNumber}</span> },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'source', header: 'Source', cell: ({ row }) => row.original.source.replace('-', ' ') },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => (
      <StatusBadge status={priorityMap[row.original.priority]} label={row.original.priority} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
  { accessorKey: 'assignedTo', header: 'Assigned To' },
  { accessorKey: 'openedAt', header: 'Opened', cell: ({ row }) => formatDate(row.original.openedAt) },
  { accessorKey: 'dueDate', header: 'Due', cell: ({ row }) => formatDate(row.original.dueDate) },
];

export default function CapaPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['qc-capa'],
    queryFn: () => qcApi.listCapa(),
  });

  const open = data.filter((c) => c.status !== 'closed').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="CAPA Management"
          description={`${open} open CAPA records`}
          actions={<Button><Plus className="h-4 w-4" />New CAPA</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load CAPA records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="title" searchPlaceholder="Search CAPA..." isLoading={isLoading} emptyMessage="No CAPA records found." />
        )}
      </div>
    </PageTransition>
  );
}
