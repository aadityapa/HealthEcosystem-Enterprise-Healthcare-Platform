'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Wallet } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDateTime } from '@/lib/mock-data';
import type { PaymentCollection } from '@/types';

const methodLabels: Record<PaymentCollection['method'], string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  neft: 'NEFT',
  cheque: 'Cheque',
  insurance: 'Insurance',
};

const columns: ColumnDef<PaymentCollection>[] = [
  {
    accessorKey: 'collectedAt',
    header: 'Date & Time',
    cell: ({ row }) => formatDateTime(row.original.collectedAt),
  },
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice #',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.invoiceNumber}</span>
    ),
  },
  { accessorKey: 'patientName', header: 'Patient' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => methodLabels[row.original.method],
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ row }) => row.original.reference ?? '—',
  },
  { accessorKey: 'collectedBy', header: 'Collected By' },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function PaymentsPage() {
  const { data: payments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-payments'],
    queryFn: () => billingApi.listPayments(),
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Payment Collection"
          description={`${formatCurrency(totalCollected)} collected across ${payments.length} transactions`}
          actions={
            <Button>
              <Wallet className="h-4 w-4" />
              Record Payment
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load payments.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={payments}
            searchKey="invoiceNumber"
            searchPlaceholder="Search by invoice..."
            isLoading={isLoading}
            emptyMessage="No payments recorded yet."
          />
        )}
      </div>
    </PageTransition>
  );
}
