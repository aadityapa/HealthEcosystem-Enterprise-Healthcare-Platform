'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { BillingInvoice } from '@/types';

const statusMap: Record<
  BillingInvoice['status'],
  'pending' | 'processing' | 'approved' | 'critical' | 'inactive'
> = {
  pending: 'pending',
  partial: 'processing',
  paid: 'approved',
  overdue: 'critical',
  void: 'inactive',
};

const columns: ColumnDef<BillingInvoice>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ row }) => (
      <Link
        href={`/billing/invoices/${row.original.id}`}
        className="font-mono text-sm font-medium text-primary hover:underline"
      >
        {row.original.invoiceNumber}
      </Link>
    ),
  },
  { accessorKey: 'patientName', header: 'Patient' },
  {
    accessorKey: 'clientType',
    header: 'Type',
    cell: ({ row }) => row.original.clientType.charAt(0).toUpperCase() + row.original.clientType.slice(1),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ row }) => formatCurrency(row.original.paid),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={statusMap[row.original.status]}
        label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      />
    ),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => billingApi.listInvoices(),
  });

  const outstanding = invoices.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Invoices"
          description={`Outstanding: ${formatCurrency(outstanding)} across ${invoices.length} invoices`}
          actions={
            <Button onClick={() => router.push('/billing/invoices/new')}>
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load invoices.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={invoices}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoices..."
            isLoading={isLoading}
            emptyMessage="No invoices found. Create your first invoice to get started."
          />
        )}
      </div>
    </PageTransition>
  );
}
