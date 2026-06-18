'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  SkeletonStatCards,
  StatCard,
  DataTable,
  StatusBadge,
} from '@health/design-system';
import { AlertTriangle, IndianRupee, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { OutstandingRecord } from '@/types';

const columns: ColumnDef<OutstandingRecord>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-primary">
        {row.original.invoiceNumber}
      </span>
    ),
  },
  { accessorKey: 'patientName', header: 'Patient' },
  {
    accessorKey: 'clientType',
    header: 'Type',
    cell: ({ row }) => (
      <span className="capitalize">{row.original.clientType}</span>
    ),
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: ({ row }) => row.original.clientName ?? '—',
  },
  {
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }) => (
      <span className="font-medium text-destructive">
        {formatCurrency(row.original.outstanding)}
      </span>
    ),
  },
  {
    accessorKey: 'daysOverdue',
    header: 'Days Overdue',
    cell: ({ row }) =>
      row.original.daysOverdue > 0 ? (
        <StatusBadge status="critical" label={`${row.original.daysOverdue} days`} />
      ) : (
        <StatusBadge status="pending" label="Current" />
      ),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: 'lastFollowUp',
    header: 'Last Follow-up',
    cell: ({ row }) => (row.original.lastFollowUp ? formatDate(row.original.lastFollowUp) : '—'),
  },
];

export default function OutstandingPage() {
  const router = useRouter();
  const { data: records = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-outstanding'],
    queryFn: () => billingApi.listOutstanding(),
  });

  const totalOutstanding = records.reduce((sum, r) => sum + r.outstanding, 0);
  const overdueCount = records.filter((r) => r.daysOverdue > 0).length;
  const overdueAmount = records
    .filter((r) => r.daysOverdue > 0)
    .reduce((sum, r) => sum + r.outstanding, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Outstanding Tracking"
          description={`${formatCurrency(totalOutstanding)} total outstanding across ${records.length} invoices`}
          actions={
            <Button variant="outline">
              <Phone className="h-4 w-4" />
              Bulk Follow-up
            </Button>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load outstanding records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {isLoading ? (
              <SkeletonStatCards count={3} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  title="Total Outstanding"
                  value={formatCurrency(totalOutstanding)}
                  icon={IndianRupee}
                />
                <StatCard
                  title="Overdue Invoices"
                  value={overdueCount}
                  icon={AlertTriangle}
                  description={formatCurrency(overdueAmount)}
                />
                <Card>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Quick Actions</p>
                      <p className="mt-1 text-sm">Send reminders or view aging report</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/billing/invoices')}>
                      View Invoices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <DataTable
              columns={columns}
              data={records}
              searchKey="patientName"
              searchPlaceholder="Search by patient..."
              isLoading={isLoading}
              emptyMessage="No outstanding invoices. All accounts are current."
            />
          </>
        )}
      </div>
    </PageTransition>
  );
}
