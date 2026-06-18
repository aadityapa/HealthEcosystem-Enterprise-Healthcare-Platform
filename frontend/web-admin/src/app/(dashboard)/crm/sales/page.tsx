'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { SalesRecord } from '@/types';

const columns: ColumnDef<SalesRecord>[] = [
  { accessorKey: 'dealNumber', header: 'Deal #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.dealNumber}</span> },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'dealType', header: 'Type', cell: ({ row }) => row.original.dealType.charAt(0).toUpperCase() + row.original.dealType.slice(1) },
  { accessorKey: 'value', header: 'Value', cell: ({ row }) => formatCurrency(row.original.value) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status === 'closed-won' ? 'approved' : 'critical'}
        label={row.original.status === 'closed-won' ? 'Won' : 'Lost'}
      />
    ),
  },
  { accessorKey: 'closedAt', header: 'Closed', cell: ({ row }) => formatDate(row.original.closedAt) },
  { accessorKey: 'closedBy', header: 'Closed By' },
];

export default function SalesPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['crm-sales'],
    queryFn: () => crmApi.listSales(),
  });

  const wonValue = data.filter((s) => s.status === 'closed-won').reduce((sum, s) => sum + s.value, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Sales" description={`${formatCurrency(wonValue)} closed-won`} actions={<Button><Plus className="h-4 w-4" />Log Deal</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load sales records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="clientName" searchPlaceholder="Search deals..." isLoading={isLoading} emptyMessage="No sales records found." />
        )}
      </div>
    </PageTransition>
  );
}
