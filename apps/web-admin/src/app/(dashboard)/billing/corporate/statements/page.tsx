'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency } from '@/lib/mock-data';
import type { CorporateStatement } from '@/types';

const statusMap: Record<CorporateStatement['status'], 'pending' | 'approved' | 'critical' | 'processing'> = {
  draft: 'pending',
  sent: 'processing',
  paid: 'approved',
  overdue: 'critical',
};

const columns: ColumnDef<CorporateStatement>[] = [
  { accessorKey: 'period', header: 'Period' },
  {
    accessorKey: 'clientCode',
    header: 'Client Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.clientCode}</span>
    ),
  },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'invoiceCount', header: 'Invoices' },
  {
    accessorKey: 'totalBilled',
    header: 'Billed',
    cell: ({ row }) => formatCurrency(row.original.totalBilled),
  },
  {
    accessorKey: 'totalPaid',
    header: 'Paid',
    cell: ({ row }) => formatCurrency(row.original.totalPaid),
  },
  {
    accessorKey: 'closingBalance',
    header: 'Closing Balance',
    cell: ({ row }) => (
      <span className={row.original.closingBalance > 0 ? 'text-destructive font-medium' : 'text-success'}>
        {formatCurrency(row.original.closingBalance)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function CorporateStatementsPage() {
  const router = useRouter();
  const { data: statements = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-corporate-statements'],
    queryFn: () => billingApi.listCorporateStatements(),
  });

  const overdueCount = statements.filter((s) => s.status === 'overdue').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Monthly Statements"
          description={`${statements.length} statements${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}`}
          actions={
            <>
              <Button variant="outline" onClick={() => router.push('/billing/corporate')}>
                <ArrowLeft className="h-4 w-4" />
                Corporate Clients
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load statements.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={statements}
            searchKey="clientName"
            searchPlaceholder="Search by client..."
            isLoading={isLoading}
            emptyMessage="No statements generated yet."
          />
        )}
      </div>
    </PageTransition>
  );
}
