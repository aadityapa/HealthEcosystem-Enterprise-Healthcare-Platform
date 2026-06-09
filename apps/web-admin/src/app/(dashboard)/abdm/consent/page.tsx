'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { abdmApi } from '@/lib/api/abdm';
import { formatDate, formatDateTime } from '@/lib/mock-data';
import type { ConsentRecord } from '@/types';

const statusMap: Record<ConsentRecord['status'], 'pending' | 'approved' | 'critical' | 'inactive'> = {
  requested: 'pending',
  granted: 'approved',
  denied: 'critical',
  expired: 'inactive',
  revoked: 'inactive',
};

const columns: ColumnDef<ConsentRecord>[] = [
  { accessorKey: 'consentId', header: 'Consent ID', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.consentId}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'abhaAddress', header: 'ABHA', cell: ({ row }) => <span className="font-mono text-xs">{row.original.abhaAddress}</span> },
  { accessorKey: 'purpose', header: 'Purpose' },
  {
    accessorKey: 'hiTypes',
    header: 'HI Types',
    cell: ({ row }) => row.original.hiTypes.join(', '),
  },
  { accessorKey: 'requestedAt', header: 'Requested', cell: ({ row }) => formatDateTime(row.original.requestedAt) },
  { accessorKey: 'expiresAt', header: 'Expires', cell: ({ row }) => formatDate(row.original.expiresAt) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function ConsentPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['abdm-consent'],
    queryFn: () => abdmApi.listConsentRecords(),
  });

  const pending = data.filter((c) => c.status === 'requested').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Consent Management" description={`${pending} consent requests pending`} actions={<Button><Plus className="h-4 w-4" />Request Consent</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load consent records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search consents..." isLoading={isLoading} emptyMessage="No consent records found." />
        )}
      </div>
    </PageTransition>
  );
}
