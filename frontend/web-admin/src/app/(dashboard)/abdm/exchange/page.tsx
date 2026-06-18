'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { ArrowLeftRight } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { abdmApi } from '@/lib/api/abdm';
import { formatDateTime } from '@/lib/mock-data';
import type { HealthExchangeRecord } from '@/types';

const statusMap: Record<HealthExchangeRecord['status'], 'approved' | 'pending' | 'critical'> = {
  success: 'approved',
  pending: 'pending',
  failed: 'critical',
};

const columns: ColumnDef<HealthExchangeRecord>[] = [
  { accessorKey: 'transactionId', header: 'Txn #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.transactionId}</span> },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => row.original.type.toUpperCase() },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'abhaAddress', header: 'ABHA', cell: ({ row }) => <span className="font-mono text-xs">{row.original.abhaAddress}</span> },
  { accessorKey: 'hipName', header: 'HIP' },
  { accessorKey: 'hiuName', header: 'HIU' },
  { accessorKey: 'initiatedAt', header: 'Initiated', cell: ({ row }) => formatDateTime(row.original.initiatedAt) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function ExchangePage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['abdm-exchange'],
    queryFn: () => abdmApi.listExchangeRecords(),
  });

  const pending = data.filter((r) => r.status === 'pending').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Health Information Exchange"
          description={`${pending} transactions pending`}
          actions={<Button variant="outline"><ArrowLeftRight className="h-4 w-4" />Refresh Status</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load exchange records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="transactionId" searchPlaceholder="Search transactions..." isLoading={isLoading} emptyMessage="No exchange records found." />
        )}
      </div>
    </PageTransition>
  );
}
