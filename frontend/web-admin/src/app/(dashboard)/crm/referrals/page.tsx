'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { Referral } from '@/types';

const statusMap: Record<Referral['status'], 'pending' | 'approved' | 'inactive'> = {
  pending: 'pending',
  completed: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<Referral>[] = [
  { accessorKey: 'referralNumber', header: 'Ref #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.referralNumber}</span> },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'patientName', header: 'Patient' },
  {
    accessorKey: 'testsOrdered',
    header: 'Tests',
    cell: ({ row }) => row.original.testsOrdered.join(', '),
  },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
  { accessorKey: 'commission', header: 'Commission', cell: ({ row }) => formatCurrency(row.original.commission) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
  { accessorKey: 'referredAt', header: 'Date', cell: ({ row }) => formatDate(row.original.referredAt) },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function ReferralsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['crm-referrals'],
    queryFn: () => crmApi.listReferrals(),
  });

  const totalCommission = data.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.commission, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Referrals" description={`${formatCurrency(totalCommission)} commission earned`} actions={<Button><Plus className="h-4 w-4" />Log Referral</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load referrals.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="referralNumber" searchPlaceholder="Search referrals..." isLoading={isLoading} emptyMessage="No referrals found." />
        )}
      </div>
    </PageTransition>
  );
}
