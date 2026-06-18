'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { abdmApi } from '@/lib/api/abdm';
import { formatDate } from '@/lib/mock-data';
import type { AbhaRecord } from '@/types';

const kycMap: Record<AbhaRecord['kycStatus'], 'approved' | 'pending' | 'critical'> = {
  verified: 'approved',
  pending: 'pending',
  failed: 'critical',
};

const columns: ColumnDef<AbhaRecord>[] = [
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'patientUhid', header: 'UHID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.patientUhid}</span> },
  { accessorKey: 'abhaNumber', header: 'ABHA Number', cell: ({ row }) => <span className="font-mono text-xs">{row.original.abhaNumber}</span> },
  { accessorKey: 'abhaAddress', header: 'ABHA Address', cell: ({ row }) => <span className="font-mono text-xs text-primary">{row.original.abhaAddress}</span> },
  { accessorKey: 'linkedAt', header: 'Linked', cell: ({ row }) => formatDate(row.original.linkedAt) },
  {
    accessorKey: 'kycStatus',
    header: 'KYC',
    cell: ({ row }) => (
      <StatusBadge status={kycMap[row.original.kycStatus]} label={row.original.kycStatus} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.status === 'active' ? 'approved' : 'inactive'} label={row.original.status} />
    ),
  },
];

export default function AbhaPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['abdm-abha'],
    queryFn: () => abdmApi.listAbhaRecords(),
  });

  const verified = data.filter((r) => r.kycStatus === 'verified').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="ABHA Management" description={`${verified} verified ABHA accounts`} actions={<Button><Plus className="h-4 w-4" />Link ABHA</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load ABHA records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search patients..." isLoading={isLoading} emptyMessage="No ABHA records found." />
        )}
      </div>
    </PageTransition>
  );
}
