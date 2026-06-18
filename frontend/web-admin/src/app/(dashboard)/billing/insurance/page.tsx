'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { InsuranceClaim } from '@/types';

const statusMap: Record<
  InsuranceClaim['status'],
  'pending' | 'processing' | 'approved' | 'critical' | 'inactive'
> = {
  submitted: 'pending',
  'under-review': 'processing',
  approved: 'approved',
  rejected: 'critical',
  paid: 'inactive',
};

const columns: ColumnDef<InsuranceClaim>[] = [
  {
    accessorKey: 'claimNumber',
    header: 'Claim #',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-primary">{row.original.claimNumber}</span>
    ),
  },
  { accessorKey: 'tpaName', header: 'TPA' },
  { accessorKey: 'patientName', header: 'Patient' },
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.invoiceNumber}</span>
    ),
  },
  {
    accessorKey: 'claimedAmount',
    header: 'Claimed',
    cell: ({ row }) => formatCurrency(row.original.claimedAmount),
  },
  {
    accessorKey: 'approvedAmount',
    header: 'Approved',
    cell: ({ row }) =>
      row.original.approvedAmount != null
        ? formatCurrency(row.original.approvedAmount)
        : '—',
  },
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
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => formatDate(row.original.submittedAt),
  },
];

export default function InsurancePage() {
  const { data: claims = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-insurance'],
    queryFn: () => billingApi.listInsuranceClaims(),
  });

  const pending = claims.filter(
    (c) => c.status === 'submitted' || c.status === 'under-review',
  ).length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="TPA & Claims"
          description={`${pending} claims pending review of ${claims.length} total`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Submit Claim
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load insurance claims.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={claims}
            searchKey="claimNumber"
            searchPlaceholder="Search claims..."
            isLoading={isLoading}
            emptyMessage="No insurance claims found."
          />
        )}
      </div>
    </PageTransition>
  );
}
