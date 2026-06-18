'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import type { Doctor } from '@/types';

const columns: ColumnDef<Doctor>[] = [
  { accessorKey: 'code', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
  { accessorKey: 'name', header: 'Doctor' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'hospital', header: 'Hospital' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'referralsYtd', header: 'Referrals YTD' },
  { accessorKey: 'commissionRate', header: 'Commission', cell: ({ row }) => `${row.original.commissionRate}%` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.status === 'active' ? 'approved' : 'inactive'} label={row.original.status} />
    ),
  },
];

export default function DoctorsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['crm-doctors'],
    queryFn: () => crmApi.listDoctors(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Doctors" description={`${data.length} doctors in network`} actions={<Button><Plus className="h-4 w-4" />Add Doctor</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load doctors.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search doctors..." isLoading={isLoading} emptyMessage="No doctors found." />
        )}
      </div>
    </PageTransition>
  );
}
