'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import { formatDate } from '@/lib/mock-data';
import type { HealthCamp } from '@/types';

const statusMap: Record<HealthCamp['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  planned: 'pending',
  ongoing: 'processing',
  completed: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<HealthCamp>[] = [
  { accessorKey: 'campCode', header: 'Camp #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.campCode}</span> },
  { accessorKey: 'name', header: 'Camp Name' },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'scheduledDate', header: 'Date', cell: ({ row }) => formatDate(row.original.scheduledDate) },
  {
    accessorKey: 'registeredPatients',
    header: 'Registration',
    cell: ({ row }) => `${row.original.registeredPatients}/${row.original.expectedPatients}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function CampsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['crm-camps'],
    queryFn: () => crmApi.listCamps(),
  });

  const ongoing = data.filter((c) => c.status === 'ongoing').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Health Camps" description={`${ongoing} camps ongoing`} actions={<Button><Plus className="h-4 w-4" />Schedule Camp</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load health camps.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search camps..." isLoading={isLoading} emptyMessage="No health camps found." />
        )}
      </div>
    </PageTransition>
  );
}
