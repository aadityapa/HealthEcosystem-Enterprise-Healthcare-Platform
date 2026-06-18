'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import {
  AlertTriangle,
  IndianRupee,
  Plus,
  Receipt,
  Shield,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { billingApi } from '@/lib/api/billing';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { BillingInvoice } from '@/types';

const invoiceStatusMap: Record<
  BillingInvoice['status'],
  'pending' | 'processing' | 'approved' | 'critical' | 'inactive'
> = {
  pending: 'pending',
  partial: 'processing',
  paid: 'approved',
  overdue: 'critical',
  void: 'inactive',
};

const recentColumns: ColumnDef<BillingInvoice>[] = [
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
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={invoiceStatusMap[row.original.status]}
        label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export default function BillingDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({
    queryKey: ['billing-stats'],
    queryFn: () => billingApi.getDashboardStats(),
  });

  const invoicesQuery = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => billingApi.listInvoices(),
  });

  const methodsQuery = useQuery({
    queryKey: ['billing-payment-methods'],
    queryFn: () => billingApi.getPaymentMethodBreakdown(),
  });

  const isError = statsQuery.isError || invoicesQuery.isError || methodsQuery.isError;
  const isLoading = statsQuery.isLoading;

  if (isError) {
    return (
      <PageTransition>
        <ErrorState
          title="Failed to load billing dashboard"
          message="Could not fetch billing data. Please try again."
          onRetry={() => {
            statsQuery.refetch();
            invoicesQuery.refetch();
            methodsQuery.refetch();
          }}
        />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentInvoices = (invoicesQuery.data ?? []).slice(0, 5);
  const methods = methodsQuery.data ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Billing Dashboard"
          description="Revenue, collections, and outstanding overview"
          actions={
            <Button onClick={() => router.push('/billing/invoices/new')}>
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          }
        />

        {isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Revenue Today"
              value={formatCurrency(stats.revenueToday)}
              icon={IndianRupee}
              trend={{ value: stats.revenueTrend, label: 'vs yesterday' }}
            />
            <StatCard
              title="Outstanding"
              value={formatCurrency(stats.outstanding)}
              icon={AlertTriangle}
              trend={{ value: stats.outstandingTrend, label: 'vs last week' }}
            />
            <StatCard
              title="Pending Claims"
              value={stats.pendingClaims}
              icon={Shield}
              trend={{ value: stats.claimsTrend, label: 'vs last month' }}
            />
            <StatCard
              title="Settlements Due"
              value={stats.settlementsDue}
              icon={Store}
              trend={{ value: stats.settlementsTrend, label: 'franchise' }}
            />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Recent Invoices
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/billing/invoices')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={recentColumns}
                  data={recentInvoices}
                  isLoading={invoicesQuery.isLoading}
                  emptyMessage="No invoices yet."
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Today</CardTitle>
            </CardHeader>
            <CardContent>
              {methodsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : methods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded today.</p>
              ) : (
                <div className="space-y-4">
                  {methods.map((m) => (
                    <div key={m.method}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{m.method}</span>
                        <span className="text-muted-foreground">{m.percentage}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${m.percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCurrency(m.amount)} · {m.count} transactions
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
