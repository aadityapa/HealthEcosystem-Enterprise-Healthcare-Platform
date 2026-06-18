'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { customerSuccessApi } from '@/lib/api/customer-success';

import type { SupportTicket } from '@/types';

const columns: ColumnDef<SupportTicket>[] = [
  { accessorKey: 'ticketCode', header: 'Ticket', cell: ({ row }) => <span className="font-mono text-sm">{row.original.ticketCode ?? '—'}</span> },
  { accessorKey: 'tenantName', header: 'Tenant' },
  { accessorKey: 'subject', header: 'Subject' },
  { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <GenericStatusBadge value={String(row.original.priority)} /> },
  { accessorKey: 'assignee', header: 'Assignee' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['cs-tickets'],
    queryFn: () => customerSuccessApi.listTickets(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Support Tickets" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="subject" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
